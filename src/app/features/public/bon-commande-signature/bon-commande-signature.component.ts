import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BonCommandeService } from '../../../core/services/bon-commande.service';
import { BonCommande } from '../../../models/bon-commande.model';

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
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './bon-commande-signature.component.html',
  styleUrls: ['./bon-commande-signature.component.scss']
})
export class BonCommandeSignatureComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly bcService = inject(BonCommandeService);

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

  ngOnInit(): void {
    const ref = this.route.snapshot.paramMap.get('ref') || '';
    if (!ref) {
      this.loading = false;
      this.errorMessage = 'Référence de bon de commande invalide.';
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
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les données du bon de commande.';
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
    if (!this.bonCommande || !this.selectedFile || !this.canSign()) return;

    this.signing = true;
    this.errorMessage = '';

    this.bcService.signerParClient(this.bonCommande.id, this.selectedFile, this.password).subscribe({
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
