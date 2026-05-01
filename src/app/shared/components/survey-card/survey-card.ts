import { Component, Input } from '@angular/core';
import { Survey } from '../../interfaces/survey';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-survey-card',
  standalone: true,
  templateUrl: './survey-card.html',
  styleUrls: ['./survey-card.scss'],
  imports: [DatePipe],
})
export class SurveyCardComponent {
  @Input() survey!: Survey;
  @Input() index!: number;
}
