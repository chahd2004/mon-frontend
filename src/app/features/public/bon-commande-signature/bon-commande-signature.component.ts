import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BonCommandeService } from '../../../core/services/bon-commande.service';
import { SignatureService } from '../../../core/services/signature.service';
import { BonCommande } from '../../../models/bon-commande.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-bon-commande-signature',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    FileUploadModule,
    ToastModule,
    TranslateModule
  ],
  providers: [MessageService],
  templateUrl: './bon-commande-signature.component.html',
  styleUrls: ['./bon-commande-signature.component.scss']
})
export class BonCommandeSignatureComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly bcService = inject(BonCommandeService);
  private readonly signatureService = inject(SignatureService);
  private readonly translate = inject(TranslateService);

  // BC data
  bonCommande: BonCommande | null = null;
  loading = true;
  errorMessage = '';

  // Form state
  selectedFile: File | null = null;
  selectedFileName = '';
  password = '';
  signing = false;
  signatureReussie = false;
  dejaSigne = false;

  ngOnInit(): void {
    const ref = this.route.snapshot.paramMap.get('ref') || '';
    if (!ref) {
      this.loading = false;
      this.errorMessage = this.translate.instant('PUBLIC_SIGNATURE.NOT_FOUND_BC');
      return;
    }
    this.resolveBC(ref);
  }

  private resolveBC(ref: string): void {
    this.loading = true;
    // The endpoint getAll is accessible — we fetch all and find by ref
    this.bcService.getAll().subscribe({
      next: (list) => {
        const bc = list.find(b =>
          (b.numBonCommande || '').toUpperCase() === ref.toUpperCase()
        );
        if (!bc) {
          this.errorMessage = `Bon de commande introuvable : ${ref}`;
          this.loading = false;
          return;
        }
        this.bonCommande = bc;
        if (this.bonCommande.statut === 'SIGNED_CLIENT') {
          this.dejaSigne = true;
        }
        this.loading = false;
      },
      error: () => {
        this.errorMessage = this.translate.instant('PUBLIC_SIGNATURE.NOT_FOUND_BC');
        this.loading = false;
      }
    });
  }

  onFileSelect(event: any): void {
    if (event.files && event.files.length > 0) {
      this.selectedFile = event.files[0];
      this.selectedFileName = this.selectedFile?.name || '';
    }
  }

  canSign(): boolean {
    return !!this.selectedFile && this.password.trim().length > 0 && !this.signing;
  }

  async signer(): Promise<void> {
    if (!this.bonCommande || !this.selectedFile || !this.canSign()) return;

    this.signing = true;
    this.errorMessage = '';

    try {
      // 1. Récupérer le XML brut
      const xmlBrut = await this.signatureService.getXmlBrutBC(this.bonCommande.id);

      // 2. Signer localement
      const xmlSigne = await this.signatureService.signerXAdES(
        this.selectedFile,
        this.password,
        xmlBrut,
        this.bonCommande.id
      );

      // 3. Envoyer le XML signé
      await this.signatureService.envoyerXmlSigneBC(this.bonCommande.id, xmlSigne);

      this.signing = false;
      this.signatureReussie = true;

    } catch (err: any) {
      this.signing = false;
      this.errorMessage = err?.message || 'Erreur lors de la signature. Vérifiez votre certificat et mot de passe.';
      console.error('Signature error:', err);
    }
  }

  fermer(): void {
    window.close();
  }
}
