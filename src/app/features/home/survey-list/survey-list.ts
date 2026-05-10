import { Component, Input } from '@angular/core';
import { Survey } from '../../../shared/interfaces/survey';
import { Router } from '@angular/router'; 

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

  getDaysLeft(dateString: string): number {
    const today = new Date();
    const end = new Date(dateString);
    const diff = end.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // Method to navigate to the survey details page
  openSurvey(id: string): void {
    this.router.navigate(['/survey', id]);
  }
  
}
