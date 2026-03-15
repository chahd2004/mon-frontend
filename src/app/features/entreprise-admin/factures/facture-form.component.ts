import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-facture-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CardModule,
    TableModule
  ],
  templateUrl: './facture-form.component.html',
  styleUrl: './facture-form.component.scss'
})
export class FactureFormComponent implements OnInit {
  form!: FormGroup;
  isSubmitting = false;

  clientOptions = [
    { label: 'Société ABC SARL', value: '1' },
    { label: 'Entreprise XYZ Ltée', value: '2' },
    { label: 'Société Commerce TN', value: '3' }
  ];

  produitOptions = [
    { label: 'Logiciel Comptabilité Pro', value: '1' },
    { label: 'Support Technique 1 An', value: '2' },
    { label: 'License Cloud', value: '3' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      client: ['', Validators.required],
      dateEmission: [new Date().toISOString().split('T')[0], Validators.required],
      dateEcheance: [new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], Validators.required],
      modePaiement: ['', Validators.required],
      notes: [''],
      lignes: this.fb.array([])
    });

    // Add one empty ligne
    this.addLigne();
  }

  get lignes(): FormArray {
    return this.form.get('lignes') as FormArray;
  }

  addLigne(): void {
    this.lignes.push(
      this.fb.group({
        produit: ['', Validators.required],
        quantite: [1, [Validators.required, Validators.min(1)]],
        prixUnitaire: [0, [Validators.required, Validators.min(0)]],
        tva: [19, Validators.required]
      })
    );
  }

  removeLigne(index: number): void {
    this.lignes.removeAt(index);
  }

  calculateTotal(): number {
    let total = 0;
    this.lignes.controls.forEach(control => {
      const q = control.get('quantite')?.value || 0;
      const p = control.get('prixUnitaire')?.value || 0;
      const t = control.get('tva')?.value || 0;
      const ht = q * p;
      total += ht * (1 + t / 100);
    });
    return Math.round(total * 100) / 100;
  }

  save(): void {
    if (this.form.valid && this.lignes.length > 0) {
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
}
