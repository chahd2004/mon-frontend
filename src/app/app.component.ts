import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private translate = inject(TranslateService);

  ngOnInit(): void {
    // Initialiser la langue et charger immédiatement les traductions
    this.translate.setDefaultLang('fr');
    this.translate.use('fr').subscribe(() => {
      // Traductions chargées - le composant peut maintenant se rendre correctement
    });
  }
}
