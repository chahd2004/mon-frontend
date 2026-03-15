import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent, SidebarComponent } from '../../../shared';

@Component({
  selector: 'app-entreprise-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './entreprise-layout.component.html',
  styleUrl: './entreprise-layout.component.scss'
})
export class EntrepriseLayoutComponent {}
