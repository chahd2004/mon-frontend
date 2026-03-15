import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-emetteur-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './emetteur-layout.component.html',
  styleUrls: ['./emetteur-layout.component.scss']
})
export class EmetteurLayoutComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
