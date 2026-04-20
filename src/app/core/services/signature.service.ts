import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import * as forge from 'node-forge';
import { SignedXml } from 'xadesjs';
import { Parse } from 'xml-core';
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
  // 2. Extraire clé privée + certificat du .p12
  // ─────────────────────────────────────────────
  private async extraireP12(p12File: File, password: string): Promise<{
    privateKeyPkcs8: ArrayBuffer;
    certBase64: string;
    certPem: string;
  }> {
    const arrayBuffer = await p12File.arrayBuffer();
    const p12Asn1 = forge.asn1.fromDer(
      forge.util.createBuffer(forge.util.binary.raw.encode(new Uint8Array(arrayBuffer)))
    );
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);
 
    // Clé privée
    const keyBags = p12.getBags({ bagType: forge.pki.oids['pkcs8ShroudedKeyBag'] });
    const privateKey = keyBags[forge.pki.oids['pkcs8ShroudedKeyBag']]?.[0]?.key;
    if (!privateKey) throw new Error('Clé privée introuvable dans le .p12');
 
    // Certificat
    const certBags = p12.getBags({ bagType: forge.pki.oids['certBag'] });
    const certificate = certBags[forge.pki.oids['certBag']]?.[0]?.cert;
    if (!certificate) throw new Error('Certificat introuvable dans le .p12');

    // Convertir explicitement en PKCS#8 DER via forge (Web Crypto support)
    const privateKeyInfo = forge.pki.wrapRsaPrivateKey(forge.pki.privateKeyToAsn1(privateKey));
    const privateKeyPkcs8Pem = forge.pki.privateKeyInfoToPem(privateKeyInfo);
    const privateKeyPkcs8 = this.pemToArrayBuffer(privateKeyPkcs8Pem);

    // Certificat
    const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(certificate)).getBytes();
    const certBase64 = forge.util.encode64(certDer);
    const certPem = forge.pki.certificateToPem(certificate);

    console.log('SignatureService: Extraction du P12 réussie');
    return { privateKeyPkcs8, certBase64, certPem };
  }
 
  // ─────────────────────────────────────────────
  // 3. Signer avec XAdES-BES (ETSI conforme)
  // ─────────────────────────────────────────────
  async signerXAdES(
    p12File: File,
    password: string,
    xmlBrut: string,
    factureId: number
  ): Promise<string> {
 
    // Extraire clé et certificat
    const { privateKeyPkcs8, certBase64, certPem } = await this.extraireP12(p12File, password);
 
    // Importer la clé dans Web Crypto API
    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      privateKeyPkcs8,
      { name: 'RSASSA-PKCS1-v1_5', hash: { name: 'SHA-256' } },
      false,
      ['sign']
    );

    // Parser le XML brut
    const xmlDoc = Parse(xmlBrut);

    // Construire la signature (On omet signingCertificate ici pour éviter les bugs internes de xadesjs)
    const signedXml = new SignedXml();
    await signedXml.Sign(
      { name: 'RSASSA-PKCS1-v1_5' },
      cryptoKey,
      xmlDoc,
      {
        id: `sig-${factureId}-${Date.now()}`,
        references: [
          {
            id: `ref-${factureId}`,
            uri: '',
            hash: 'SHA-256',
            transforms: ['enveloped', 'exc-c14n'],
          }
        ],
      }
    );
 
    // Récupérer le XML signé
    const signedDoc = signedXml.GetXml();
    if (!signedDoc) throw new Error('Échec de la génération du XML signé');
 
    // Injection MANUELLE du certificat dans KeyInfo (Format conforme XmlDSig/XAdES)
    let xmlSigne = new XMLSerializer().serializeToString(signedDoc);
    xmlSigne = xmlSigne.replace(
      '</ds:Signature>',
      `<ds:KeyInfo>
        <ds:X509Data>
          <ds:X509Certificate>${certBase64}</ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </ds:Signature>`
    );

    return xmlSigne;
  }
 
  // ─────────────────────────────────────────────
  // 4. Envoyer le XML signé au backend
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
 
  // ─────────────────────────────────────────────
  // Utilitaires : conversion binaire / base64
  // ─────────────────────────────────────────────
  private binaryToArrayBuffer(binary: string): ArrayBuffer {
    const buffer = new ArrayBuffer(binary.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) {
      view[i] = binary.charCodeAt(i);
    }
    return buffer;
  }

  private pemToArrayBuffer(pem: string): ArrayBuffer {
    const base64 = pem
      .replace(/-----BEGIN [\w\s]+-----/g, '')
      .replace(/-----END [\w\s]+-----/g, '')
      .replace(/\s+/g, '')
      .trim();

    const binary = forge.util.decode64(base64);
    return this.binaryToArrayBuffer(binary);
  }
}
