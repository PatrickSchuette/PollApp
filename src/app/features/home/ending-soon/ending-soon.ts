import { Component, Input, inject } from '@angular/core';
import { Survey } from '../../../shared/interfaces/survey';
import { Router } from '@angular/router';
import { getDaysLeft } from '../../../shared/services/date.utils';

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

  getDaysLeft = getDaysLeft;

  /** Angular Router instance for navigation */
  private router = inject(Router);
    
  /**
   * Navigates to the survey detail page.
   * 
   * @param {string} id - The UUID of the survey to open.
   */
  openSurvey(id: string): void {
    this.router.navigate(['/survey', id]);
  }
}
