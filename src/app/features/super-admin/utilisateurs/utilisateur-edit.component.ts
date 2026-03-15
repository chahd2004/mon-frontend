import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { UserDTO } from '../../../models';

@Component({
  selector: 'app-utilisateur-edit',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterModule,
    ButtonModule, InputTextModule, DropdownModule, CardModule
  ],
  templateUrl: './utilisateur-edit.component.html',
  styleUrl: './utilisateur-edit.component.scss'
})
export class UtilisateurEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  editForm!: FormGroup;
  isLoading = false;
  isNew = false;
  user: UserDTO | null = null;

  roleOptions = [
    { label: 'Super Admin', value: 'SUPER_ADMIN' },
    { label: 'Admin Entreprise', value: 'ENTREPRISE_ADMIN' },
    { label: 'Lecteur Entreprise', value: 'ENTREPRISE_VIEWER' },
    { label: 'Client', value: 'CLIENT' },
    { label: 'Émetteur', value: 'EMETTEUR' }
  ];

  ngOnInit(): void {
    this.initForm();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadUser(parseInt(id));
    } else {
      this.isNew = true;
    }
  }

  private initForm(): void {
    this.editForm = this.fb.group({
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      nom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required]],
      role: ['', Validators.required],
      enabled: [true]
    });
  }

  private loadUser(id: number): void {
    this.isLoading = true;
    // Simulé - remplacer par appel service réel
    this.user = {
      id,
      nom: 'Ahmed',
      prenom: 'Ali',
      email: 'admin@techcorp.tn',
      telephone: '+216 20 123 456',
      role: 'ENTREPRISE_ADMIN',
      typeUser: undefined,
      accountStatus: 'ACTIVE',
      enabled: true,
      firstLogin: false
    };
    this.editForm.patchValue(this.user);
    this.isLoading = false;
  }

  save(): void {
    if (!this.editForm.valid) {
      return;
    }
    this.isLoading = true;
    // Appel service pour sauvegarder
    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(['/super-admin/utilisateurs']);
    }, 1000);
  }

  cancel(): void {
    this.router.navigate(['/super-admin/utilisateurs']);
  }
}
