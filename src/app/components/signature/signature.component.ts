import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { SignatureService } from '../../core/services/signature.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-signature',
  standalone: true,
  imports: [CommonModule, FormsModule, FileUploadModule, InputTextModule, TranslateModule],
  template: `
    <div class="signature-popup-content">
      <!-- Étape 1 : Formulaire -->
      <ng-container *ngIf="!success">
        <div class="signature-header">
          <h3>{{ 'SIGNATURE.TITLE' | translate }}</h3>
          <div class="divider"></div>
        </div>

        <div class="signature-body">
          <div class="input-group">
            <label>{{ 'SIGNATURE.FILE_LABEL' | translate }}</label>
            <div class="file-picker-wrapper">
              <p-fileUpload mode="basic" name="p12File" accept=".p12,.pfx" [auto]="true" 
                [chooseLabel]="'SIGNATURE.BROWSE' | translate" (onSelect)="onFichierSelect($event)" 
                styleClass="custom-file-upload"></p-fileUpload>
              <span class="selected-filename" *ngIf="fichier">{{ fichier.name }}</span>
              <span class="placeholder-filename" *ngIf="!fichier">virtualtoken.p12</span>
            </div>
          </div>

          <div class="input-group">
            <label>{{ 'SIGNATURE.PASSWORD_LABEL' | translate }}</label>
            <div class="password-wrapper">
              <input type="text" pInputText [(ngModel)]="motDePasse" placeholder="• • • • • • • • • • • • •"
                [disabled]="loading" class="masked-password-input" autocomplete="off">
            </div>
          </div>

          <div *ngIf="message && erreur" class="message erreur">
             <i class="pi pi-times-circle"></i> {{ message }}
          </div>

          <button class="btn-signer" (click)="signer()" [disabled]="loading || !fichier || !motDePasse">
            <i class="pi pi-check-circle" *ngIf="!loading"></i>
            <i class="pi pi-spin pi-spinner" *ngIf="loading"></i>
            {{ 'SIGNATURE.BTN_SIGN' | translate }}
          </button>
        </div>
      </ng-container>

      <!-- Étape 2 : Succès -->
      <ng-container *ngIf="success">
        <div class="signature-success-state">
          <h3>{{ 'SIGNATURE.SUCCESS_TITLE' | translate }}</h3>
          <div class="divider"></div>
          <i class="pi pi-check-circle success-icon"></i>
          <div class="divider"></div>
          <button class="btn-signer" (click)="onOk()" style="margin-top: 1rem; width: 100%;">OK</button>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    $primary-blue: #3b82f6;
    $dark-blue: #1e293b;
    $success: #10b981;
    $warning: #f59e0b;
    $danger: #ef4444;
    $border: #e2e8f0;

    .signature-popup-content {
      padding: 1.5rem;
      text-align: center;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

      .signature-header {
        margin-bottom: 2rem;
        h3 {
          font-size: 1.4rem;
          color: #1e293b;
          font-weight: 800;
          letter-spacing: 1px;
          margin: 0;
          text-transform: uppercase;
        }
        .divider {
          width: 150px;
          height: 2px;
          background: #e2e8f0;
          margin: 1.5rem auto 0;
        }
      }

      .signature-body {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        text-align: left;

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          label {
            font-weight: 700;
            color: #475569;
            font-size: 0.9rem;
          }
          .file-picker-wrapper {
            display: flex;
            align-items: center;
            gap: 1rem;
            background: #f8fafc;
            border: 2px dashed #cbd5e1;
            padding: 0.5rem 1rem;
            border-radius: 10px;
            &:hover { border-color: #3b82f6; background: #f1f7ff; }
            ::ng-deep .custom-file-upload .p-button {
              background: #1e293b !important;
              border: none !important;
              font-size: 0.8rem !important;
              padding: 0.4rem 1rem !important;
            }
            .selected-filename { color: #3b82f6; font-weight: 600; font-size: 0.85rem; }
            .placeholder-filename { color: #94a3b8; font-style: italic; font-size: 0.85rem; }
          }
          .password-wrapper input {
            width: 100%;
            padding: 0.8rem;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            &:focus { border-color: #3b82f6; outline: none; }
            &.masked-password-input { -webkit-text-security: disc !important; text-security: disc !important; }
          }
        }

        .btn-signer {
          margin-top: 0.5rem;
          background: #ffffff;
          color: #1e293b;
          border: 2px solid #1e293b;
          padding: 0.8rem;
          border-radius: 10px;
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          transition: all 0.2s;
          &:hover:not(:disabled) {
            background: #1e293b;
            color: #ffffff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          &:disabled { opacity: 0.5; cursor: not-allowed; }
        }
      }

      .signature-success-state {
        padding: 1rem;
        h3 { font-size: 1.4rem; color: #10b981; font-weight: 800; margin-bottom: 1rem; }
        .success-icon { font-size: 4rem; color: #10b981; }
        .divider { width: 150px; height: 2px; background: #e2e8f0; margin: 1rem auto; }
      }

      .message.erreur {
        background: #fce8e6;
        color: #c62828;
        padding: 0.6rem;
        border-radius: 8px;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }
  `]
})
export class SignatureComponent {

  @Input() factureId: number = 0;
  @Output() onComplete = new EventEmitter<void>();

  fichier: File | null = null;
  motDePasse: string = '';
  loading: boolean = false;
  message: string = '';
  erreur: boolean = false;
  success: boolean = false;

  constructor(
    private signatureService: SignatureService,
    private translate: TranslateService
  ) {}

  onFichierSelect(event: any): void {
    this.fichier = event.files?.[0] ?? null;
    this.message = '';
  }

  async signer(): Promise<void> {
    if (!this.fichier || !this.motDePasse || !this.factureId) {
      this.message = this.translate.instant('SIGNATURE.ERROR_MSG');
      this.erreur = true;
      return;
    }

    this.loading = true;
    try {
      // 1. Récupérer le XML brut depuis le backend
      console.log('SignatureComponent: Récupération du XML pour ID:', this.factureId);
      const xmlBrut = await this.signatureService.getXmlBrut(this.factureId);
      console.log('SignatureComponent: XML Brut récupéré (longueur):', xmlBrut.length);

      // 2. Signer localement
      console.log('SignatureComponent: Début de la signature locale avec le fichier:', this.fichier?.name);
      const xmlSigne = await this.signatureService.signerXAdES(
        this.fichier!,
        this.motDePasse,
        xmlBrut,
        this.factureId
      );
      console.log('SignatureComponent: Signature locale réussie (longueur):', xmlSigne.length);

      // 3. Envoyer uniquement le XML signé au backend
      console.log('SignatureComponent: Envoi du XML signé au backend...');
      await this.signatureService.envoyerXmlSigne(this.factureId, xmlSigne);

      this.message = this.translate.instant('SIGNATURE.SUCCESS_MSG');
      this.erreur = false;
      this.success = true;

    } catch (err: any) {
      console.error('SignatureComponent: ERREUR CAPTURÉE:', err);
      this.message = 'Erreur : ' + (err?.message ?? err?.toString() ?? 'Erreur inconnue');
      this.erreur = true;
    } finally {
      this.loading = false;
      this.motDePasse = ''; // effacer le mot de passe de la mémoire
    }
  }

  onOk(): void {
    this.onComplete.emit();
  }
}
