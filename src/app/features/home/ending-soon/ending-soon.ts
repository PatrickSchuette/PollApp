import { Component, Input } from '@angular/core';
import { Survey } from '../../../shared/interfaces/survey';
import { SurveyCardComponent } from '../../../shared/components/survey-card/survey-card';

@Component({
  selector: 'app-ending-soon',
  standalone: true,
  templateUrl: './ending-soon.html',
  styleUrls: ['./ending-soon.scss'],
  imports: [SurveyCardComponent],
})
export class EndingSoonComponent {
  @Input() surveys: Survey[] = [];
}
