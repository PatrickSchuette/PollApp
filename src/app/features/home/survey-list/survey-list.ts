import { Component, Input, inject } from '@angular/core';
import { Survey } from '../../../shared/interfaces/survey';
import { Router } from '@angular/router';
import { getDaysLeft } from '../../../shared/services/date.utils';
import { CategoryService } from '../../../shared/services/category';

@Component({
  selector: 'app-survey-list',
  standalone: true,
  templateUrl: './survey-list.html',
  styleUrls: ['./survey-list.scss'],
  imports: [],
})
export class SurveyListComponent {
  /**
   * Array of surveys to display in the list.
   * Provided by the parent component.
   */
  @Input() surveys: Survey[] = [];

  /**
   * Angular Router instance used for navigation.
   */
  constructor(private router: Router) { }

  /**
   * CategoryService instance used to resolve category labels and colors.
   */
  categoryService = inject(CategoryService);

  /**
   * Utility function to calculate remaining days until a survey ends.
   */
  getDaysLeft = getDaysLeft;

  /**
   * Navigates to the detail page of a specific survey.
   *
   * @param id - Unique identifier of the survey to open.
   */
  openSurvey(id: string): void {
    this.router.navigate(['/survey', id]);
  }
}
