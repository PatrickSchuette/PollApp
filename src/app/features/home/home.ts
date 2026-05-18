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
  imports: [
    SurveyListComponent,
    EndingSoonComponent,
    FormsModule
  ],
})
export class HomeComponent {
  private surveyService = inject(SurveyService);
  private categoryService = inject(CategoryService);

  filter = 'active';
  endingSoon = signal<any[]>([]);
  active = signal<any[]>([]);
  past = signal<any[]>([]);
  categoryOpen = false;
  filterCategory = '';

  categories = this.categoryService.categories;

  async ngOnInit() {
    this.endingSoon.set(await this.surveyService.getEndingSoon());
    this.active.set(await this.surveyService.getActiveSurveys());
    this.past.set(await this.surveyService.getPastSurveys());
  }

  private router = inject(Router);

  goToCreate(): void {
    this.router.navigate(['/create']);
  }

  setFilter(value: 'active' | 'past') {
    this.filter = value;
  }

  getFilteredSurveys() {
    const list = this.filter === 'active' ? this.active() : this.past();
    if (!this.filterCategory) return list;
    return list.filter(s => s.category === this.filterCategory);
  }
  
}
