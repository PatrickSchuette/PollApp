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
  private router = inject(Router);
  categoryService = inject(CategoryService);

  surveys = input<Survey[]>([]);
  maxDays = input<number>(30);
  getDaysLeft = getDaysLeft;

  surveysWithProgress = computed(() => this.buildSurveysWithProgress());

  /**
   * Calculates the remaining days between today and a target end date.
   * @param {string} enddate - The end date string.
   * @returns {number} The calculated remaining days.
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
   * @param {number} diff - The remaining days left.
   * @param {number} max - The total maximum days limit.
   * @returns {number} The progress percent between 0 and 100.
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
   * @returns A new list of surveys with progressPercent included.
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
   * Navigates to a specific survey view page.
   * @param {string} id - The identifier of the survey.
   */
  openSurvey(id: string): void {
    this.router.navigate(['/survey', id]);
  }
}
