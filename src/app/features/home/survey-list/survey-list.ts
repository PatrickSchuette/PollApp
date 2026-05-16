import { Component, Input } from '@angular/core';
import { Survey } from '../../../shared/interfaces/survey';
import { Router } from '@angular/router'; 
import { getDaysLeft } from '../../../shared/services/date.utils';

@Component({
  selector: 'app-survey-list',
  standalone: true,
  templateUrl: './survey-list.html',
  styleUrls: ['./survey-list.scss'],
  imports: [],
})

export class SurveyListComponent {
  @Input() surveys: Survey[] = [];

  constructor(private router: Router) {}

  getDaysLeft = getDaysLeft;
  
  // Method to navigate to the survey details page
  openSurvey(id: string): void {
    this.router.navigate(['/survey', id]);
  }
  
}
