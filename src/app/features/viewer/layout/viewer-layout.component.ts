import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-viewer-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './viewer-layout.component.html',
  styleUrls: ['./viewer-layout.component.scss']
})
export class ViewerLayoutComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
