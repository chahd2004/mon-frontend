import { Pipe, PipeTransform } from '@angular/core';
import { UserRole } from '../../models';

@Pipe({
  name: 'roleLabel',
  standalone: true
})
export class RoleLabelPipe implements PipeTransform {
  private readonly labels: Record<UserRole, string> = {
    SUPER_ADMIN: 'Super Admin',
    ENTREPRISE_ADMIN: 'Admin Entreprise',
    ENTREPRISE_VIEWER: 'Lecteur Entreprise',
    CLIENT: 'Client',
    EMETTEUR: 'Émetteur'
  };

  transform(role: UserRole | null | undefined): string {
    if (!role) return 'Inconnu';
    return this.labels[role] || role;
  }
}
