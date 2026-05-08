import { Component, Input } from '@angular/core';
import { Survey } from '../../interfaces/survey';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  open():void {
    this.router.navigate(['/survey', this.survey.id]);
  }
}
