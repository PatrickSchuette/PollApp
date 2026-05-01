import { Component, inject } from '@angular/core';
import { SurveyService } from '../../shared/services/survey.service';
import { SurveyListComponent } from './survey-list/survey-list';
import { EndingSoonComponent } from './ending-soon/ending-soon';

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
}
