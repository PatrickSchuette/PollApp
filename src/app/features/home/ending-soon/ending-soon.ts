import { Component, Input, inject } from '@angular/core';
import { Survey } from '../../../shared/interfaces/survey';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ending-soon',
  standalone: true,
  templateUrl: './ending-soon.html',
  styleUrls: ['./ending-soon.scss'],
  imports: [],
})

export class EndingSoonComponent {
  @Input() surveys: Survey[] = [];

  /** Calculates the number of days left until the survey ends.
   * @param dateString The end date of the survey as a string.
   * @returns The number of days left until the survey ends.
   */
  getDaysLeft(dateString: string): number {
    const today = new Date();
    const end = new Date(dateString);
    const diff = end.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
  
  private router = inject(Router);

  /** Navigates to the survey details page when a survey is clicked.
   * @param id The ID of the survey to open.
   */
  openSurvey(id: string) {
    this.router.navigate(['/survey', id]);
  }

}
