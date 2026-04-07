import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-collaborateur-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CheckboxModule,
    CardModule
  ],
  templateUrl: './collaborateur-form.component.html',
  styleUrl: './collaborateur-form.component.scss'
})
export class CollaborateurFormComponent implements OnInit {
  form!: FormGroup;
  isSubmitting = false;

  roleOptions = [
    { label: 'Manager', value: 'MANAGER' },
    { label: 'Comptable', value: 'COMPTABLE' },
    { label: 'Commercial', value: 'COMMERCIAL' },
    { label: 'Viewer', value: 'VIEWER' }
  ];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      nom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      role: ['', Validators.required],
      permissions: [''],
      actif: [true]
    });
  }

  save(): void {
    if (this.form.valid) {
      this.isSubmitting = true;
      console.log('Form value:', this.form.value);
      // API call would go here
      setTimeout(() => {
        this.isSubmitting = false;
      }, 1000);
    }
  }

  cancel(): void {
    console.log('Cancel');
  }

  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (control?.hasError('required')) {
      return `${fieldName} est requis`;
    }
    if (control?.hasError('minlength')) {
      return `${fieldName} doit contenir au moins 2 caractères`;
    }
    if (control?.hasError('email')) {
      return 'Email invalide';
    }
    return '';
  }
}
