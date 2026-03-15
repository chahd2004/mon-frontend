import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-demande-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './demande-detail.component.html',
  styleUrl: './demande-detail.component.scss'
})
export class DemandeDetailComponent {
  private route = inject(ActivatedRoute);
  demandeId = this.route.snapshot.paramMap.get('id');
}
