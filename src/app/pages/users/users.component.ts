import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

interface AppUser {
  id: number;
  email: string;
  role: string;
  statut: 'ACTIVE' | 'PENDING' | 'DISABLED';
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {
  users: AppUser[] = [
    { id: 1, email: 'superadmin@app.tn', role: 'SUPER_ADMIN', statut: 'ACTIVE' },
    { id: 2, email: 'admin@entreprise.tn', role: 'ENTREPRISE_ADMIN', statut: 'PENDING' },
    { id: 3, email: 'viewer@entreprise.tn', role: 'ENTREPRISE_VIEWER', statut: 'ACTIVE' }
  ];
}
