import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BonLivraisonService } from '../../../core/services/bon-livraison.service';
import { BonLivraison } from '../../../models/bon-livraison.model';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-bons-livraison-signature',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    FileUploadModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './bons-livraison-signature.component.html',
  styleUrls: ['./bons-livraison-signature.component.scss']
})
export class BonsLivraisonSignatureComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly blService = inject(BonLivraisonService);

  // BL data
  bonLivraison: BonLivraison | null = null;
  loading = true;
  errorMessage = '';

  // Form state
  selectedFile: File | null = null;
  selectedFileName = '';
  password = '';
  signing = false;
  signatureReussie = false;

  ngOnInit(): void {
    const ref = this.route.snapshot.paramMap.get('ref') || '';
    if (!ref) {
      this.loading = false;
      this.errorMessage = 'Référence de bon de livraison invalide.';
      return;
    }
    this.resolveBL(ref);
  }

  private resolveBL(ref: string): void {
    this.loading = true;
    this.blService.getAll().subscribe({
      next: (list) => {
        const bl = list.find(b =>
          (b.numBonLivraison || '').toUpperCase() === ref.toUpperCase()
        );
        if (!bl) {
          this.errorMessage = `Bon de livraison introuvable : ${ref}`;
          this.loading = false;
          return;
        }
        this.bonLivraison = bl;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les données du bon de livraison.';
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

  signer(): void {
    if (!this.bonLivraison || !this.selectedFile || !this.canSign()) return;

    this.signing = true;
    this.errorMessage = '';

    this.blService.signerParClient(this.bonLivraison.id, this.selectedFile, this.password).subscribe({
      next: () => {
        this.signing = false;
        this.signatureReussie = true;
      },
      error: (err) => {
        this.signing = false;
        this.errorMessage = err?.error?.message || 'Erreur lors de la signature. Vérifiez votre certificat et mot de passe.';
      }
    });
  }

  fermer(): void {
    window.close();
  }
}
