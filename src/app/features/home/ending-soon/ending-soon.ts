import { Component, Input } from '@angular/core';
import { Survey } from '../../../shared/interfaces/survey';
import { SurveyCardComponent } from '../../../shared/components/survey-card/survey-card';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-ending-soon',
  standalone: true,
  templateUrl: './ending-soon.html',
  styleUrls: ['./ending-soon.scss'],
  imports: [SurveyCardComponent, NgFor],
})
export class EndingSoonComponent {
  @Input() surveys: Survey[] = [];
}
