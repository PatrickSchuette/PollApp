import { Component, Input } from '@angular/core';
import { Survey } from '../../../shared/interfaces/survey';
import { SurveyCardComponent } from '../../../shared/components/survey-card/survey-card';


@Component({
  selector: 'app-survey-list',
  standalone: true,
  templateUrl: './survey-list.html',
  styleUrls: ['./survey-list.scss'],
  imports: [SurveyCardComponent,],
})
export class SurveyListComponent {
  @Input() surveys: Survey[] = [];
}
