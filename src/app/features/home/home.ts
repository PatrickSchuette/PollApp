import { Component, inject } from '@angular/core';
import { SurveyService } from '../../shared/services/survey.service';
import { SurveyListComponent } from './survey-list/survey-list';
import { EndingSoonComponent } from './ending-soon/ending-soon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  imports: [SurveyListComponent, EndingSoonComponent],
})
export class HomeComponent {
  private surveyService = inject(SurveyService);

  endingSoon = this.surveyService.getEndingSoon();
  active = this.surveyService.getActiveSurveys();
  past = this.surveyService.getPastSurveys();
  filter = 'active';
  
  private router = inject(Router);

  /** Navigates to the create survey page */
  goToCreate(): void {
    this.router.navigate(['/create']);
  }

  /** Sets the current filter for the survey list */
  setFilter(value: 'active' | 'past') {
    this.filter = value;
  }

}
