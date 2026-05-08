import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SurveyService } from '../../shared/services/survey.service';
import { LetterPipe } from '../../shared/pipes/letter.pipe';

@Component({
  selector: 'app-survey-detail',
  standalone: true,
  templateUrl: './survey-detail.html',
  styleUrls: ['./survey-detail.scss'],
  imports: [LetterPipe],
})
export class SurveyDetailComponent {
  private route = inject(ActivatedRoute);
  private surveyService = inject(SurveyService);

  survey = this.surveyService.getSurveyById(
    this.route.snapshot.paramMap.get('id')!
  );
}
