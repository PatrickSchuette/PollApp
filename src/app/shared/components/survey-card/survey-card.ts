import { Component, Input } from '@angular/core';
import { Survey } from '../../interfaces/survey';
import { NgIf } from '@angular/common';


@Component({
  selector: 'app-survey-card',
  standalone: true,
  templateUrl: './survey-card.html',
  styleUrls: ['./survey-card.scss'],
  imports: [NgIf],
})

export class SurveyCardComponent {
  @Input() survey!: Survey;
}
