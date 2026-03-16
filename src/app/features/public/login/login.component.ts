import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    CheckboxModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);

  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  loading: boolean = false;

  ngOnInit(): void {
    // Permet l'accès au login même si connecté
  }

  login(): void {
    if (!this.email?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Champ requis',
        detail: 'Veuillez entrer votre email.'
      });
      return;
    }
    if (!this.password?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Champ requis',
        detail: 'Veuillez entrer votre mot de passe.'
      });
      return;
    }

    this.loading = true;

    const request: LoginRequest = {
      email: this.email.trim(),
      password: this.password
    };

    this.authService.login(request).subscribe({
      next: () => {
        const redirectUrl = this.getPostLoginRedirectUrl();
        this.messageService.add({
          severity: 'success',
          summary: 'Connexion réussie',
          detail: 'Redirection vers le tableau de bord...'
        });
        setTimeout(() => {
          this.router.navigateByUrl(redirectUrl);
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        const message = err?.error?.message || 'Identifiants incorrects';
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur de connexion',
          detail: message
        });
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  private getPostLoginRedirectUrl(): string {
    if (this.authService.requiresPasswordChange()) {
      return '/change-password';
    }

    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl?.startsWith('/super-admin')) {
      return this.authService.hasRole('SUPER_ADMIN') ? returnUrl : '/dashboard';
    }

    if (this.authService.hasRole('SUPER_ADMIN')) {
      return '/super-admin/users';
    }

    return returnUrl || '/dashboard';
  }
}
