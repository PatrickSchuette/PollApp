import { Component, Input, inject } from '@angular/core';
import { Survey } from '../../../shared/interfaces/survey';
import { Router } from '@angular/router';
import { getDaysLeft } from '../../../shared/services/date.utils';

@Component({
  selector: 'app-ending-soon',
  standalone: true,
  templateUrl: './ending-soon.html',
  styleUrls: ['./ending-soon.scss'],
  imports: [],
})
export class EndingSoonComponent {
  @Input() surveys: Survey[] = [];
  @Input() maxDays = 30; // kommt jetzt von außen

  getDaysLeft = getDaysLeft;

  private router = inject(Router);

  openSurvey(id: string): void {
    this.router.navigate(['/survey', id]);
  }

  getProgressPercent(enddate: string): number {
    const today = new Date();
    const end = new Date(enddate);

    const diff = Math.max(
      0,
      Math.floor((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    );

    if (!this.maxDays) return 0;

    const percent = (1 - diff / this.maxDays) * 100;
    return Math.min(100, Math.max(0, Math.round(percent)));
  }
}
