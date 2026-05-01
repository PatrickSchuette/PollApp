import { Component, Input } from '@angular/core';
import { Survey } from '../../../shared/interfaces/survey';

@Component({
  selector: 'app-survey-list',
  standalone: true,
  templateUrl: './survey-list.html',
  styleUrls: ['./survey-list.scss'],
})
export class SurveyListComponent {
  @Input() surveys: Survey[] = [];
}
