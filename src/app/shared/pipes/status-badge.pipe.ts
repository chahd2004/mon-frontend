import { Pipe, PipeTransform } from '@angular/core';
import { AccountStatus, DemandeStatus, FactureStatus } from '../../models';

export type StatusType = AccountStatus | DemandeStatus | FactureStatus;

@Pipe({
  name: 'statusBadge',
  standalone: true
})
export class StatusBadgePipe implements PipeTransform {
  transform(status: StatusType | null | undefined): {
    label: string;
    severity: 'success' | 'warning' | 'danger' | 'info' | 'secondary';
    icon?: string;
  } {
    if (!status) {
      return { label: 'Inconnu', severity: 'secondary' };
    }

    const statusMap: Record<StatusType, {
      label: string;
      severity: 'success' | 'warning' | 'danger' | 'info' | 'secondary';
      icon?: string;
    }> = {
      // Account statuses
      PENDING: { label: 'En attente', severity: 'warning', icon: 'pi pi-clock' },
      ACTIVE: { label: 'Actif', severity: 'success', icon: 'pi pi-check' },
      DISABLED: { label: 'Désactivé', severity: 'danger', icon: 'pi pi-times' },
      EXPIRED: { label: 'Expiré', severity: 'danger', icon: 'pi pi-exclamation-triangle' },
      REQUESTED: { label: 'Demandé', severity: 'warning', icon: 'pi pi-send' },
      REJECTED: { label: 'Rejeté', severity: 'danger', icon: 'pi pi-times-circle' },
      // Demande statuses
      APPROVED: { label: 'Approuvé', severity: 'success', icon: 'pi pi-check-circle' },
      // Facture statuses
      DRAFT: { label: 'Brouillon', severity: 'info', icon: 'pi pi-file' },
      SEND: { label: 'Envoyée', severity: 'info', icon: 'pi pi-send' },
      PARTIALLY_PAID: { label: 'Partiellement payée', severity: 'warning', icon: 'pi pi-wallet' },
      FULLY_PAID: { label: 'Payée', severity: 'success', icon: 'pi pi-check-circle' },
      CANCELLED: { label: 'Annulée', severity: 'danger', icon: 'pi pi-times' },
      OVERDUE: { label: 'Échue', severity: 'danger', icon: 'pi pi-exclamation-triangle' }
    };

    return statusMap[status] || { label: status as string, severity: 'secondary' };
  }
}
