import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Signal } from '@angular/core';
import { UserDTO } from '../../../models/user.models';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss']
})
export class ProfilComponent implements OnInit {

  profil: UserDTO | null = null;
  loading: boolean = false;
  error: string = '';
  editMode: boolean = false;
  editForm = {
    nom: '',
    prenom: '',
    email: '',
    telephone: ''
  };

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.loadProfil();
  }

  loadProfil(): void {
    this.loading = true;
    this.error = '';
    // Get current user from auth service signal
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.profil = currentUser;
      this.initEditForm();
      this.loading = false;
    } else {
      this.error = 'Erreur lors du chargement du profil';
      this.loading = false;
    }
  }

  initEditForm(): void {
    if (this.profil) {
      this.editForm = {
        nom: this.profil.nom || '',
        prenom: this.profil.prenom || '',
        email: this.profil.email || '',
        telephone: this.profil.telephone || ''
      };
    }
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.initEditForm();
    }
  }

  saveProfile(): void {
    // For now, just toggle edit mode
    // In a real implementation, you would call an API to update the profile
    this.editMode = false;
  }

  cancelEdit(): void {
    this.editMode = false;
  }

}
