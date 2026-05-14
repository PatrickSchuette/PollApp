import { Component, Input, inject } from '@angular/core';
import { Survey } from '../../../shared/interfaces/survey';
import { Router } from '@angular/router';

/**
 * Component displaying surveys that are ending soon.
 * 
 * Receives a list of surveys via @Input() and renders them in a grid layout.
 * Each survey card is clickable and navigates to the survey detail page.
 */
@Component({
  selector: 'app-ending-soon',
  standalone: true,
  templateUrl: './ending-soon.html',
  styleUrls: ['./ending-soon.scss'],
  imports: [],
})
export class EndingSoonComponent {
  /** List of surveys passed from the parent component */
  @Input() surveys: Survey[] = [];

  /** Angular Router instance for navigation */
  private router = inject(Router);

  /**
   * Calculates the number of days remaining until a survey ends.
   * 
   * @param {string | null | undefined} dateString - The end date of the survey in ISO format.
   * @returns {number} Number of days left until the survey ends.
   */
  getDaysLeft(dateString: string | null | undefined): number {
    if (!dateString) {
      return 0;
    }

    const [year, month, day] = dateString.split('-').map(Number);
    const end = new Date(year, month - 1, day, 23, 59, 59);
    const today = new Date();
    const diff = end.getTime() - today.getTime();
    const result = Math.ceil(diff / (1000 * 60 * 60 * 24));

    return result;
  }
    
  /**
   * Navigates to the survey detail page.
   * 
   * @param {string} id - The UUID of the survey to open.
   */
  openSurvey(id: string): void {
    this.router.navigate(['/survey', id]);
  }
}
