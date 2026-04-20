import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import * as forge from 'node-forge';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SignatureService {

  private apiUrl = `${environment.apiUrl}/signature`;

  constructor(private http: HttpClient) {}

  // ─────────────────────────────────────────────
  // 1. Récupérer le XML brut depuis le backend
  // ─────────────────────────────────────────────
  async getXmlBrut(factureId: number): Promise<string> {
    return firstValueFrom(
      this.http.get(`${this.apiUrl}/xml-brut/${factureId}`, { responseType: 'text' })
    );
  }

  async getXmlBrutBC(bcId: number): Promise<string> {
    return firstValueFrom(
      this.http.get(`${environment.apiUrl}/bon-commandes/xml-brut/${bcId}`, { responseType: 'text' })
    );
  }

  async getXmlBrutBL(blId: number): Promise<string> {
    return firstValueFrom(
      this.http.get(`${environment.apiUrl}/bon-livraisons/xml-brut/${blId}`, { responseType: 'text' })
    );
  }

  // ─────────────────────────────────────────────
  // 2. Signer avec XAdES-BES (ETSI conforme)
  // ─────────────────────────────────────────────
  async signerXAdES(
    p12File: File,
    password: string,
    xmlBrut: string,
    factureId: number
  ): Promise<string> {

    // ── Étape 1 : Lire le .p12 ──────────────────────────────────────────
    const arrayBuffer = await p12File.arrayBuffer();
    const p12Asn1 = forge.asn1.fromDer(
      forge.util.createBuffer(forge.util.binary.raw.encode(new Uint8Array(arrayBuffer)))
    );
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

    // ── Étape 2 : Extraire clé privée et certificat ──────────────────────
    const keyBags = p12.getBags({ bagType: forge.pki.oids['pkcs8ShroudedKeyBag'] });
    const privateKey = keyBags[forge.pki.oids['pkcs8ShroudedKeyBag']]?.[0]?.key;
    if (!privateKey) throw new Error('Clé privée introuvable dans le .p12');

    const certBags = p12.getBags({ bagType: forge.pki.oids['certBag'] });
    const certificate = certBags[forge.pki.oids['certBag']]?.[0]?.cert;
    if (!certificate) throw new Error('Certificat introuvable dans le .p12');

    // ── Étape 3 : Certificat DER en bytes binaires ────────────────────────
    const certAsn1 = forge.pki.certificateToAsn1(certificate);
    const certDerBytes = forge.asn1.toDer(certAsn1);
    const certDerBinary = certDerBytes.getBytes();
    const certBase64 = forge.util.encode64(certDerBinary);

    // ── Étape 4 : Digest du certificat (SHA-256 sur les bytes DER) ────────
    const certMd = forge.md.sha256.create();
    certMd.update(certDerBinary);
    const certDigestBase64 = forge.util.encode64(certMd.digest().getBytes());

    // ── Étape 5 : Digest du document XML (Reference[1]) ───────────────────
    const digestValue = await this.computeDocumentDigest(xmlBrut);

    // ── Étape 6 : Identifiants uniques ────────────────────────────────────
    const signatureId = `sig-${factureId}-${Date.now()}`;
    const xadesId     = `xades-id-${this.generateId()}`;
    const signingTime = new Date().toISOString();

    // ── Étape 7 : Construire SignedProperties ─────────────────────────────
    const signedPropertiesContent =
        `<xades:SignedSignatureProperties>` +
          `<xades:SigningTime>${signingTime}</xades:SigningTime>` +
          `<xades:SigningCertificateV2>` +
            `<xades:Cert>` +
              `<xades:CertDigest>` +
                `<ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>` +
                `<ds:DigestValue>${certDigestBase64}</ds:DigestValue>` +
              `</xades:CertDigest>` +
            `</xades:Cert>` +
          `</xades:SigningCertificateV2>` +
        `</xades:SignedSignatureProperties>` +
        `<xades:SignedDataObjectProperties>` +
          `<xades:DataObjectFormat ObjectReference="#ref-${factureId}">` +
            `<xades:MimeType>text/xml</xades:MimeType>` +
          `</xades:DataObjectFormat>` +
        `</xades:SignedDataObjectProperties>`;

    // SignedProperties avec namespaces explicites — tel qu'inséré dans le document final.
    const signedPropertiesForInsert =
      `<xades:SignedProperties` +
      ` xmlns:xades="http://uri.etsi.org/01903/v1.3.2#"` +
      ` xmlns:ds="http://www.w3.org/2000/09/xmldsig#"` +
      ` Id="${xadesId}">` +
        signedPropertiesContent +
      `</xades:SignedProperties>`;

    // ── Étape 7b : Digest des SignedProperties ────────────────────────────
    // FIX CRITIQUE : le validateur applique C14N INCLUSIVE sur les SignedProperties
    // lues depuis le document final (où ds:Signature porte déjà xmlns:ds et xmlns:xades).
    // C14N inclusive propage tous les namespaces ancêtres visibles → xmlns:ds et xmlns:xades
    // apparaissent directement sur <xades:SignedProperties>, PAS sur les enfants ds:*.
    // On simule ce comportement via computeSignedPropertiesDigest.
    const propsDigest = await this.computeSignedPropertiesDigest(signedPropertiesForInsert);

    // ── Étape 8 : Construire SignedInfo ────────────────────────────────────
    const signedInfoXml =
      `<ds:SignedInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">` +
        `<ds:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>` +
        `<ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>` +
        `<ds:Reference Id="ref-${factureId}" URI="">` +
          `<ds:Transforms>` +
            `<ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>` +
            `<ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>` +
          `</ds:Transforms>` +
          `<ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>` +
          `<ds:DigestValue>${digestValue}</ds:DigestValue>` +
        `</ds:Reference>` +
        `<ds:Reference URI="#${xadesId}" Type="http://uri.etsi.org/01903#SignedProperties">` +
          `<ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>` +
          `<ds:DigestValue>${propsDigest}</ds:DigestValue>` +
        `</ds:Reference>` +
      `</ds:SignedInfo>`;

    // ── Étape 9 : Signer SignedInfo avec RSA-SHA256 ────────────────────────
    const signedInfoC14n  = this.applyC14nExclusive(signedInfoXml);
    const signedInfoBytes = forge.util.encodeUtf8(signedInfoC14n);
    const mdSign = forge.md.sha256.create();
    mdSign.update(signedInfoBytes);
    const signatureValue = forge.util.encode64(privateKey.sign(mdSign));

    // ── Étape 10 : Assembler le bloc <ds:Signature> ────────────────────────
    const signatureBlock =
      `<ds:Signature` +
      ` xmlns:ds="http://www.w3.org/2000/09/xmldsig#"` +
      ` xmlns:xades="http://uri.etsi.org/01903/v1.3.2#"` +
      ` Id="${signatureId}">` +
        signedInfoXml +
        `<ds:SignatureValue>${signatureValue}</ds:SignatureValue>` +
        `<ds:KeyInfo>` +
          `<ds:X509Data>` +
            `<ds:X509Certificate>${certBase64}</ds:X509Certificate>` +
          `</ds:X509Data>` +
        `</ds:KeyInfo>` +
        `<ds:Object>` +
          `<xades:QualifyingProperties Target="#${signatureId}">` +
            signedPropertiesForInsert +
          `</xades:QualifyingProperties>` +
        `</ds:Object>` +
      `</ds:Signature>`;

    // ── Étape 11 : Insérer la signature dans le document XML ───────────────
    const match = xmlBrut.match(/<\/([^>]+)>\s*$/);
    const closingTag = match ? match[1] : 'Facture';

    const xmlComplet = xmlBrut.replace(
      `</${closingTag}>`,
      `${signatureBlock}</${closingTag}>`
    );

    return xmlComplet;
  }

  // ─────────────────────────────────────────────
  // 3. Envoyer le XML signé au backend
  // ─────────────────────────────────────────────
  async envoyerXmlSigne(factureId: number, xmlSigne: string): Promise<any> {
    return firstValueFrom(
      this.http.post(`${this.apiUrl}/signer`, { factureId, xmlSigne })
    );
  }

  async envoyerXmlSigneBC(bonCommandeId: number, xmlSigne: string): Promise<any> {
    return firstValueFrom(
      this.http.post(`${environment.apiUrl}/bon-commandes/signer-client`, { bonCommandeId, xmlSigne })
    );
  }

  async envoyerXmlSigneBL(bonLivraisonId: number, xmlSigne: string): Promise<any> {
    return firstValueFrom(
      this.http.post(`${environment.apiUrl}/bon-livraisons/signer-client`, { bonLivraisonId, xmlSigne })
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // DIGEST DES SIGNED PROPERTIES — C14N INCLUSIVE
  //
  // Le validateur lit SignedProperties depuis le document final où ds:Signature
  // déclare déjà xmlns:ds et xmlns:xades comme namespaces ancêtres.
  // Il applique C14N INCLUSIVE qui propage tous ces namespaces directement
  // sur <xades:SignedProperties> (pas sur les enfants ds:*).
  //
  // On simule ce comportement :
  //   1. Wrapper SignedProperties dans un faux ds:Signature portant les namespaces
  //   2. Parser le tout → le DOM connaît le contexte ancêtre
  //   3. Appliquer C14N inclusive sur le nœud SignedProperties
  // ═══════════════════════════════════════════════════════════════════════
  private async computeSignedPropertiesDigest(
    signedPropertiesXml: string
  ): Promise<string> {
    // Wrapper simulant le contexte ancêtre ds:Signature
    const wrapped =
      `<ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#"` +
      ` xmlns:xades="http://uri.etsi.org/01903/v1.3.2#">` +
        signedPropertiesXml +
      `</ds:Signature>`;

    const parser = new DOMParser();
    const doc = parser.parseFromString(wrapped, 'application/xml');

    const sp = doc.getElementsByTagNameNS(
      'http://uri.etsi.org/01903/v1.3.2#', 'SignedProperties'
    )[0];
    if (!sp) throw new Error('SignedProperties introuvable');

    // Collecter les namespaces visibles depuis les ancêtres (ds:Signature)
    const ancestorNsMap = new Map<string, string>();
    this.collectAncestorNamespaces(sp, ancestorNsMap);

    // Appliquer C14N inclusive
    const c14nResult = this.serializeC14nInclusive(sp, ancestorNsMap, new Map());

    const encoder = new TextEncoder();
    const bytes = encoder.encode(c14nResult);
    const digestBuffer = await crypto.subtle.digest('SHA-256', bytes);
    return btoa(String.fromCharCode(...new Uint8Array(digestBuffer)));
  }

  // ═══════════════════════════════════════════════════════════════════════
  // C14N INCLUSIVE — collecte des namespaces depuis les ancêtres
  // ═══════════════════════════════════════════════════════════════════════
  private collectAncestorNamespaces(
    node: Element,
    nsMap: Map<string, string>
  ): void {
    const ancestors: Element[] = [];
    let current = node.parentNode as Element | null;
    while (current && current.nodeType === Node.ELEMENT_NODE) {
      ancestors.unshift(current);
      current = current.parentNode as Element | null;
    }
    for (const ancestor of ancestors) {
      for (let i = 0; i < ancestor.attributes.length; i++) {
        const attr = ancestor.attributes[i];
        if (attr.name === 'xmlns') {
          nsMap.set('', attr.value);
        } else if (attr.prefix === 'xmlns') {
          nsMap.set(attr.localName, attr.value);
        }
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // C14N INCLUSIVE — sérialisation récursive
  // Propage TOUS les namespaces visibles (ancêtres + locaux) sur chaque élément.
  // ═══════════════════════════════════════════════════════════════════════
  private serializeC14nInclusive(
    node: Element,
    inheritedNsMap: Map<string, string>,
    renderedNsMap: Map<string, string>
  ): string {
    const tagName = node.tagName;
    const nsMap = new Map(renderedNsMap);

    // Fusionner namespaces hérités + déclarés localement
    const visibleNsMap = new Map(inheritedNsMap);
    for (let i = 0; i < node.attributes.length; i++) {
      const attr = node.attributes[i];
      if (attr.name === 'xmlns') {
        visibleNsMap.set('', attr.value);
      } else if (attr.prefix === 'xmlns') {
        visibleNsMap.set(attr.localName, attr.value);
      }
    }

    // Émettre les namespaces pas encore rendus
    const nsDecls: string[] = [];
    for (const [prefix, uri] of visibleNsMap) {
      if (uri && (!nsMap.has(prefix) || nsMap.get(prefix) !== uri)) {
        nsDecls.push(prefix === '' ? `xmlns="${uri}"` : `xmlns:${prefix}="${uri}"`);
        nsMap.set(prefix, uri);
      }
    }

    // Attributs réguliers triés
    const regularAttrs: string[] = [];
    for (let i = 0; i < node.attributes.length; i++) {
      const attr = node.attributes[i];
      if (!attr.name.startsWith('xmlns')) {
        const v = attr.value
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/"/g, '&quot;')
          .replace(/\t/g, '&#9;')
          .replace(/\r/g, '&#13;')
          .replace(/\n/g, '&#10;');
        regularAttrs.push(`${attr.name}="${v}"`);
      }
    }
    regularAttrs.sort();

    const allAttrs = [...nsDecls.sort(), ...regularAttrs];
    const attrStr  = allAttrs.length > 0 ? ' ' + allAttrs.join(' ') : '';

    let children = '';
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      if (child.nodeType === Node.ELEMENT_NODE) {
        // Les enfants héritent uniquement de ce qui est déjà rendu (nsMap)
        children += this.serializeC14nInclusive(child as Element, new Map(), new Map(nsMap));
      } else if (child.nodeType === Node.TEXT_NODE) {
        children += (child.textContent || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\r/g, '&#13;');
      }
    }

    return `<${tagName}${attrStr}>${children}</${tagName}>`;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // DIGEST DU DOCUMENT XML
  // Applique : enveloped-signature transform + C14N exclusive
  // ═══════════════════════════════════════════════════════════════════════
  private async computeDocumentDigest(xmlBrut: string): Promise<string> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlBrut, 'application/xml');

    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      throw new Error('XML malformé : ' + parseError.textContent);
    }

    const root = doc.documentElement;

    // Retirer <ds:Signature> (enveloped-signature transform)
    const clone = root.cloneNode(true) as Element;
    const sigNodes = clone.getElementsByTagNameNS(
      'http://www.w3.org/2000/09/xmldsig#', 'Signature'
    );
    Array.from(sigNodes).forEach(n => n.parentNode?.removeChild(n));

    // Appliquer C14N exclusive sur le document
    const usedPrefixes = new Set<string>();
    this.collectUsedPrefixes(clone, usedPrefixes);
    const c14nXml = this.serializeC14n(clone, usedPrefixes, new Map());

    const xmlEncoder = new TextEncoder();
    const xmlBytes = xmlEncoder.encode(c14nXml);
    const digestBuffer = await crypto.subtle.digest('SHA-256', xmlBytes);
    return btoa(String.fromCharCode(...new Uint8Array(digestBuffer)));
  }

  // ═══════════════════════════════════════════════════════════════════════
  // C14N EXCLUSIVE — point d'entrée (pour un fragment XML string)
  // ═══════════════════════════════════════════════════════════════════════
  private applyC14nExclusive(xmlString: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'application/xml');
    const root = doc.documentElement;
    const usedPrefixes = new Set<string>();
    this.collectUsedPrefixes(root, usedPrefixes);
    return this.serializeC14n(root, usedPrefixes, new Map());
  }

  // ═══════════════════════════════════════════════════════════════════════
  // C14N EXCLUSIVE — collecte des préfixes utilisés dans le sous-arbre
  // ═══════════════════════════════════════════════════════════════════════
  private collectUsedPrefixes(node: Element, prefixes: Set<string>): void {
    const prefix = node.prefix;
    if (prefix) prefixes.add(prefix);

    for (let i = 0; i < node.attributes.length; i++) {
      const attr = node.attributes[i];
      if (attr.prefix && attr.prefix !== 'xmlns') {
        prefixes.add(attr.prefix);
      }
    }

    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      if (child.nodeType === Node.ELEMENT_NODE) {
        this.collectUsedPrefixes(child as Element, prefixes);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // C14N EXCLUSIVE — sérialisation récursive conforme à la spec
  // ═══════════════════════════════════════════════════════════════════════
  private serializeC14n(
    node: Element,
    usedPrefixes: Set<string>,
    parentNsMap: Map<string, string>
  ): string {
    const tagName = node.tagName;
    const prefix  = node.prefix || '';
    const nsMap   = new Map(parentNsMap);

    const nsDecls: string[] = [];

    const nodeNsUri = node.namespaceURI || '';
    if (prefix) {
      if (!nsMap.has(prefix) || nsMap.get(prefix) !== nodeNsUri) {
        nsDecls.push(`xmlns:${prefix}="${nodeNsUri}"`);
        nsMap.set(prefix, nodeNsUri);
      }
    } else if (!nsMap.has('') || nsMap.get('') !== nodeNsUri) {
      if (nodeNsUri) {
        nsDecls.push(`xmlns="${nodeNsUri}"`);
        nsMap.set('', nodeNsUri);
      }
    }

    for (let i = 0; i < node.attributes.length; i++) {
      const attr = node.attributes[i];
      if (attr.prefix && attr.prefix !== 'xmlns') {
        const attrNsUri = attr.namespaceURI || '';
        if (!nsMap.has(attr.prefix) || nsMap.get(attr.prefix) !== attrNsUri) {
          nsDecls.push(`xmlns:${attr.prefix}="${attrNsUri}"`);
          nsMap.set(attr.prefix, attrNsUri);
        }
      }
    }

    const regularAttrs: string[] = [];
    for (let i = 0; i < node.attributes.length; i++) {
      const attr = node.attributes[i];
      if (!attr.name.startsWith('xmlns')) {
        const escapedValue = attr.value
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/"/g, '&quot;')
          .replace(/\t/g, '&#9;')
          .replace(/\r/g, '&#13;')
          .replace(/\n/g, '&#10;');
        regularAttrs.push(`${attr.name}="${escapedValue}"`);
      }
    }
    regularAttrs.sort();

    const allAttrs = [...nsDecls.sort(), ...regularAttrs];
    const attrStr  = allAttrs.length > 0 ? ' ' + allAttrs.join(' ') : '';

    let children = '';
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      if (child.nodeType === Node.ELEMENT_NODE) {
        children += this.serializeC14n(child as Element, usedPrefixes, new Map(nsMap));
      } else if (child.nodeType === Node.TEXT_NODE) {
        children += (child.textContent || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\r/g, '&#13;');
      }
    }

    return `<${tagName}${attrStr}>${children}</${tagName}>`;
  }

  // ─────────────────────────────────────────────
  // Utilitaires privés
  // ─────────────────────────────────────────────
  private generateId(): string {
    const part1 = Math.random().toString(36).substring(2, 15);
    const part2 = Math.random().toString(36).substring(2, 15);
    return `${part1}${part2}`;
  }
}
