import { Component, inject, signal } from '@angular/core';
import { SurveyService } from '../../shared/services/survey.service';
import { SurveyListComponent } from './survey-list/survey-list';
import { EndingSoonComponent } from './ending-soon/ending-soon';
import { Router } from '@angular/router';
import { CategoryService } from '../../shared/services/category';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  imports: [SurveyListComponent, EndingSoonComponent, FormsModule],
})
export class HomeComponent {
  private surveyService = inject(SurveyService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);

  filter = 'active';
  endingSoon = signal<any[]>([]);
  active = signal<any[]>([]);
  past = signal<any[]>([]);
  categoryOpen = false;
  filterCategory = '';
  maxDaysLimit = 0;
  maxDaysSlider = 0;

  categories = this.categoryService.categories;

  /**
   * Loads all survey data on component initialization.
   */
  async ngOnInit() {
    await this.loadData();
    this.active.set(await this.surveyService.getActiveSurveys());
    this.past.set(await this.surveyService.getPastSurveys());
  }

  /**
   * Navigates to the survey creation page.
   */
  goToCreate(): void {
    this.router.navigate(['/create']);
  }

  /**
   * Sets the active survey filter (active or past).
   */
  setFilter(value: 'active' | 'past') {
    this.filter = value;
  }

  /**
   * Returns surveys filtered by selected category.
   */
  getFilteredSurveys() {
    const list = this.filter === 'active' ? this.active() : this.past();
    if (!this.filterCategory) return list;
    return list.filter(s => s.category === this.filterCategory);
  }

  /**
   * Returns surveys filtered by remaining days.
   */
  getEndingSoonFiltered() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.endingSoon().filter(s => {
      const end = new Date(s.enddate);
      end.setHours(0, 0, 0, 0);

      const diff = Math.max(
        0,
        Math.ceil((end.getTime() - today.getTime()) / 86400000)
      );

      if (this.maxDaysSlider === this.maxDaysLimit) return true;
      return diff <= this.maxDaysSlider;
    });
  }

  /**
   * Loads ending-soon surveys and initializes slider values.
   */
  async loadData() {
    const surveys = await this.surveyService.getEndingSoon();
    this.endingSoon.set(surveys);
    this.maxDaysLimit = this.getMaxDaysFromSurveys(surveys);
    this.maxDaysSlider = this.maxDaysLimit;
  }

  /**
   * Calculates the highest remaining day count among all surveys.
   */
  getMaxDaysFromSurveys(surveys: any[]): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let max = 0;

    for (const s of surveys) {
      const end = new Date(s.enddate);
      end.setHours(0, 0, 0, 0);

      const diff = Math.max(
        0,
        Math.ceil((end.getTime() - today.getTime()) / 86400000)
      );

      if (diff > max) max = diff;
    }

    return max;
  }
}
