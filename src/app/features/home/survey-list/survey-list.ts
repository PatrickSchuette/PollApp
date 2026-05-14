import { Component, Input } from '@angular/core';
import { Survey } from '../../../shared/interfaces/survey';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-survey-list',
  standalone: true,
  templateUrl: './survey-list.html',
  styleUrls: ['./survey-list.scss'],
  imports: [],
})

export class SurveyListComponent {
  @Input() surveys: Survey[] = [];

  constructor(private router: Router) {}

  /**
   * Calculates the number of days remaining until a survey ends.
   * 
   * @param {string | null | undefined} dateString - The end date of the survey in ISO format.
   * @returns {number} Number of days left until the survey ends.
   */
  getDaysLeft(dateString: string | null | undefined): number {
    if (!dateString) return 0;

    // Datum manuell in lokale Zeit umwandeln
    const [year, month, day] = dateString.split('-').map(Number);
    const end = new Date(year, month - 1, day, 23, 59, 59);

    const today = new Date();
    const diff = end.getTime() - today.getTime();

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // Method to navigate to the survey details page
  openSurvey(id: string): void {
    this.router.navigate(['/survey', id]);
  }
  
}
