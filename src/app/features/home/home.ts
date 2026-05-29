import { Component, inject, signal, computed } from '@angular/core';
import { SurveyService } from '../../shared/services/survey.service';
import { SurveyListComponent } from './survey-list/survey-list';
import { EndingSoonComponent } from './ending-soon/ending-soon';
import { Router } from '@angular/router';
import { CategoryService } from '../../shared/services/category';
import { FormsModule } from '@angular/forms';
import { CreateSurveyComponent } from '../create-survey/create-survey';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  imports: [SurveyListComponent, EndingSoonComponent, FormsModule, CreateSurveyComponent],
})
export class HomeComponent {
  private surveyService = inject(SurveyService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);

  filter = signal<'active' | 'past'>('active');
  categoryOpen = signal(false);
  filterCategory = signal('');

  userSelectedDays = signal<number | null>(null);

  categories = this.categoryService.categories;
  surveys = this.surveyService.surveys;

  active = computed(() => this.filterSurveysByStatus(false));
  past = computed(() => this.filterSurveysByStatus(true));
  endingSoon = computed(() => this.getSortedEndingSoon());
  maxDaysLimit = computed(() => this.calculateMaxDays());
  isCreateOpen = signal(false);

  maxDaysSlider = computed(() => {
    const userValue = this.userSelectedDays();
    return userValue !== null ? userValue : this.maxDaysLimit();
  });

  filteredSurveys = computed(() => this.getFilteredMainList());
  //endingSoonFiltered = computed(() => this.getFilteredEndingSoonList());
  endingSoonFiltered = computed(() => this.getTopThreeEndingSoon());


  /**
   * Filters surveys by finished status.
   */
  filterSurveysByStatus(finished: boolean): any[] {
    return this.surveys().filter(s => s.isfinished === finished);
  }

  /**
   * Returns active surveys sorted by end date.
   */
  getSortedEndingSoon(): any[] {
    const list = this.surveys().filter(s => !s.isfinished && s.enddate);
    return list.sort((a, b) => {
      return new Date(a.enddate).getTime() - new Date(b.enddate).getTime();
    });
  }

  /**
   * Calculates remaining days until end date.
   */
  getDaysDifference(enddate: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(enddate);
    end.setHours(0, 0, 0, 0);
    return Math.max(0, Math.ceil((end.getTime() - today.getTime()) / 86400000));
  }

  /**
   * Finds the maximum remaining days among ending soon surveys.
   */
  calculateMaxDays(): number {
    let max = 0;
    for (const survey of this.endingSoon()) {
      const diff = this.getDaysDifference(survey.enddate);
      if (diff > max) max = diff;
    }
    return max;
  }

  /**
   * Filters active/past list by category.
   */
  getFilteredMainList(): any[] {
    const base = this.filter() === 'active' ? this.active() : this.past();
    const category = this.filterCategory();
    if (!category) return base;
    return base.filter(s => s.category === category);
  }

  /**
   * Filters ending soon list by slider value.
   */
  getFilteredEndingSoonList(): any[] {
    const sliderVal = this.maxDaysSlider();
    const limitVal = this.maxDaysLimit();

    if (this.userSelectedDays() === null) return this.endingSoon();

    if (sliderVal === limitVal || sliderVal === 0) return this.endingSoon();

    return this.endingSoon().filter(s => {
      return this.getDaysDifference(s.enddate) <= sliderVal;
    });
  }

  /**
   * open Modal for create new Survey.
   */
  goToCreate(): void {
    this.isCreateOpen.set(true);
  }

  /**
   * Sets active/past filter.
   */
  setFilter(value: 'active' | 'past'): void {
    this.filter.set(value);
  }

  /**
   * Handles slider input.
   */
  onSliderChange(event: any): void {
    const value = Number(event.target.value);
    const max = this.maxDaysLimit();

    if (value === 0) {
      this.userSelectedDays.set(max);
    } else {
      this.userSelectedDays.set(value);
    }
  }

  /**
 * Returns the next three surveys sorted by soonest end date.
 */
  getTopThreeEndingSoon(): any[] {
    const list = this.endingSoon();
    const sorted = list.sort((a, b) => {
      return new Date(a.enddate).getTime() - new Date(b.enddate).getTime();
    });
    const result: any[] = [];
    for (let i = 0; i < sorted.length && i < 3; i++) {
      result.push(sorted[i]);
    }
    return result;
  }

}
