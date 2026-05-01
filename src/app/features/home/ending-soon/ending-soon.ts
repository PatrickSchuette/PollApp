import { Component, Input } from '@angular/core';
import { Survey } from '../../../shared/interfaces/survey';

@Component({
  selector: 'app-ending-soon',
  standalone: true,
  templateUrl: './ending-soon.html',
  styleUrls: ['./ending-soon.scss'],
})
export class EndingSoonComponent {
  @Input() surveys: Survey[] = [];
}
