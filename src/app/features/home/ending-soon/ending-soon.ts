import { Component, inject, computed, input } from '@angular/core';
import { Survey } from '../../../shared/interfaces/survey';
import { Router } from '@angular/router';
import { getDaysLeft } from '../../../shared/services/date.utils';
import { CategoryService } from '../../../shared/services/category';

@Component({
  selector: 'app-ending-soon',
  standalone: true,
  templateUrl: './ending-soon.html',
  styleUrls: ['./ending-soon.scss'],
  imports: [],
})
export class EndingSoonComponent {
  /**
   * Angular Router instance used for navigation.
   */
  private router = inject(Router);

  /**
   * Provides category metadata such as labels and colors.
   */
  categoryService = inject(CategoryService);

  /**
   * List of surveys provided by the parent component.
   */
  surveys = input<Survey[]>([]);

  /**
   * Maximum number of days used to calculate progress percentage.
   */
  maxDays = input<number>(30);

  /**
   * Utility function to calculate remaining days until survey end.
   */
  getDaysLeft = getDaysLeft;

  /**
   * Computed list of surveys enriched with progressPercent values.
   * Progress indicates how much of the allowed time has passed.
   */
  surveysWithProgress = computed(() => this.buildSurveysWithProgress());

  /**
   * Calculates the remaining days between today and a target end date.
   *
   * @param enddate - The end date string in ISO format.
   * @returns Number of remaining days (minimum 0).
   */
  calculateDiffDays(enddate: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const end = new Date(enddate);
    end.setHours(0, 0, 0, 0);

    return Math.max(0, Math.floor((end.getTime() - today.getTime()) / 86400000));
  }

  /**
   * Computes the percentage value based on remaining and maximum days.
   *
   * @param diff - Remaining days.
   * @param max - Maximum allowed days.
   * @returns Progress percentage between 0 and 100.
   */
  calculatePercent(diff: number, max: number): number {
    if (max <= 0) return 0;
    const percent = (1 - diff / max) * 100;
    return Math.min(100, Math.max(0, Math.round(percent)));
  }

  /**
   * Creates a new list of surveys and adds a progressPercent value.
   * Progress shows how many percent of the allowed time has passed.
   *
   * @returns Array of surveys enriched with progressPercent.
   */
  buildSurveysWithProgress(): any[] {
    const maxDays = this.maxDays();
    const list = this.surveys();

    return list.map(survey => {
      let progress = 0;

      if (survey.enddate) {
        const diff = this.calculateDiffDays(survey.enddate);
        progress = this.calculatePercent(diff, maxDays);
      }

      return {
        id: survey.id,
        title: survey.title,
        description: survey.description,
        category: survey.category,
        enddate: survey.enddate,
        isfinished: survey.isfinished,
        progressPercent: progress
      };
    });
  }

  /**
   * Navigates to the detail page of a specific survey.
   *
   * @param id - Unique identifier of the survey.
   */
  openSurvey(id: string): void {
    this.router.navigate(['/survey', id]);
  }
}
