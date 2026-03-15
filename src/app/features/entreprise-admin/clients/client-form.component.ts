import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CardModule
  ],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.scss'
})
export class ClientFormComponent implements OnInit {
  form!: FormGroup;
  isSubmitting = false;

  regionOptions = [
    { label: 'Tunis', value: 'TUNIS' },
    { label: 'Ariana', value: 'ARIANA' },
    { label: 'Ben Arous', value: 'BEN_AROUS' },
    { label: 'Manouba', value: 'MANOUBA' },
    { label: 'Sfax', value: 'SFAX' },
    { label: 'Sousse', value: 'SOUSSE' },
    { label: 'Kairouan', value: 'KAIROUAN' },
    { label: 'Kasserine', value: 'KASSERINE' },
    { label: 'Gafsa', value: 'GAFSA' },
    { label: 'Tozeur', value: 'TOZEUR' },
    { label: 'Kébili', value: 'KEBILI' },
    { label: 'Gabès', value: 'GABES' },
    { label: 'Médenine', value: 'MEDENINE' },
    { label: 'Tataouine', value: 'TATAOUINE' },
    { label: 'Sidi Bouzid', value: 'SIDI_BOUZID' },
    { label: 'Mahdia', value: 'MAHDIA' },
    { label: 'Monastir', value: 'MONASTIR' },
    { label: 'Nabeul', value: 'NABEUL' },
    { label: 'Zaghouan', value: 'ZAGHOUAN' },
    { label: 'Bizerte', value: 'BIZERTE' },
    { label: 'Jendouba', value: 'JENDOUBA' },
    { label: 'Kef', value: 'KEF' },
    { label: 'Siliana', value: 'SILIANA' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      raisonSociale: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      adresse: ['', Validators.required],
      region: ['', Validators.required],
      codePostal: ['', Validators.required],
      contactPrincipal: ['', Validators.required],
      notes: ['']
    });
  }

  save(): void {
    if (this.form.valid) {
      this.isSubmitting = true;
      console.log('Form value:', this.form.value);
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
      return `${fieldName} doit contenir au moins 3 caractères`;
    }
    if (control?.hasError('email')) {
      return 'Email invalide';
    }
    return '';
  }
}
