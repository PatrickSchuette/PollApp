import { Component, Input } from '@angular/core';
import { Survey } from '../../interfaces/survey';
import { Router } from '@angular/router';

@Component({
  selector: 'app-survey-card',
  standalone: true,
  templateUrl: './survey-card.html',
  styleUrls: ['./survey-card.scss'],
  imports: [],
})
export class SurveyCardComponent {
  /**
   * Survey data used to render the card.
   * Provided by the parent component.
   */
  @Input() survey!: Survey;

  /**
   * Index of the survey within the list.
   * Used for display or ordering purposes.
   */
  @Input() index!: number;

  /**
   * Angular Router instance used for navigation.
   */
  constructor(private router: Router) { }

  /**
   * Navigates to the detail page of the current survey.
   */
  open(): void {
    this.router.navigate(['/survey', this.survey.id]);
  }
}
