import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { UpdatePasswordRequest } from '../../../models/user.models';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  email: string = '';
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  loading: boolean = false;

  get expectedEmail(): string {
    return this.authService.currentUser()?.email?.trim().toLowerCase() || '';
  }

  submit(): void {
    if (!this.email.trim() || !this.currentPassword.trim() || !this.newPassword.trim() || !this.confirmPassword.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Veuillez remplir tous les champs requis.'
      });
      return;
    }

    if (!this.expectedEmail || this.email.trim().toLowerCase() !== this.expectedEmail) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation',
        detail: 'L\'email saisi ne correspond pas au compte connecte.'
      });
      return;
    }

    if (this.newPassword.length < 8) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Le nouveau mot de passe doit contenir au moins 8 caractères.'
      });
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation',
        detail: 'La confirmation ne correspond pas au nouveau mot de passe.'
      });
      return;
    }

    const request: UpdatePasswordRequest = {
      oldPassword: this.currentPassword,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword
    };

    this.loading = true;
    this.authService.updatePassword(request).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Mot de passe mis a jour',
          detail: 'Votre mot de passe a ete modifie. Redirection...'
        });

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1200);
      },
      error: (err) => {
        this.loading = false;
        const message = err?.error?.message || 'Impossible de modifier le mot de passe.';
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: message
        });
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
