import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { DemandeDetailResponse } from '../../../models';
import { StatusBadgePipe } from '../../../shared';

@Component({
  selector: 'app-demande-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, ButtonModule, TabViewModule,
    InputTextModule, InputTextareaModule, TagModule, CardModule, StatusBadgePipe
  ],
  templateUrl: './demande-detail.component.html',
  styleUrl: './demande-detail.component.scss'
})
export class DemandeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);

  demande: any = null;
  rejectionReason = '';
  isLoading = false;
  showRejectionForm = false;

  ngOnInit(): void {
    this.loadDemandeDetail();
  }

  loadDemandeDetail(): void {
    this.isLoading = true;
    const id = this.route.snapshot.paramMap.get('id');
    // Simulé - remplacer par appel service réel
    this.demande = {
      id: parseInt(id || '1'),
      raisonSociale: 'TechCorp Tunisia',
      email: 'admin@techcorp.tn',
      telephone: '+216 20 123 456',
      region: 'TUNIS',
      adresseComplete: 'Avenue Bourguiba, Tunis',
      nomRepresentant: 'Ahmed',
      prenomRepresentant: 'Ali',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.isLoading = false;
  }

  approveDemande(): void {
    this.isLoading = true;
    // Appel service pour approuver
    setTimeout(() => {
      if (this.demande) {
        this.demande.status = 'APPROVED';
      }
      this.isLoading = false;
    }, 1000);
  }

  showRejection(): void {
    this.showRejectionForm = true;
  }

  rejectDemande(): void {
    if (!this.rejectionReason.trim()) {
      return;
    }
    this.isLoading = true;
    // Appel service pour rejeter
    setTimeout(() => {
      if (this.demande) {
        this.demande.status = 'REJECTED';
      }
      this.showRejectionForm = false;
      this.rejectionReason = '';
      this.isLoading = false;
    }, 1000);
  }

  getStatusColor(): string {
    switch (this.demande?.status) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'danger';
      default:
        return 'warning';
    }
  }

  canApprove(): boolean {
    return this.demande?.status === 'PENDING';
  }

  canReject(): boolean {
    return this.demande?.status === 'PENDING';
  }
}
