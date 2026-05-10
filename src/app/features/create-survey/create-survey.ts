import { Component, inject } from '@angular/core';
import { SurveyService } from '../../shared/services/survey.service';
import { Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../shared/services/category';

@Component({
  selector: 'app-create-survey',
  standalone: true,
  templateUrl: './create-survey.html',
  styleUrls: ['./create-survey.scss'],
  imports: [NgFor, NgIf, FormsModule],
})
export class CreateSurveyComponent {
  surveyDraft = {
    title: '',
    endDate: '',
    category: '',
    description: '',
    questions: [
      {
        text: '',
        allowMultiple: false,
        answers: ['']
      }
    ]
  };

  private surveyService = inject(SurveyService);
  private router = inject(Router);

  private categoryService = inject(CategoryService);
  categories = this.categoryService.categories;
  categoryOpen = false;

  /** Adds a new empty question */
  addQuestion(): void {
    this.surveyDraft.questions.push({
      text: '',
      allowMultiple: false,
      answers: ['']
    });
  }

  /** Adds a new empty answer to a question */
  addAnswer(qIndex: number): void {
    this.surveyDraft.questions[qIndex].answers.push('');
  }

  /** Removes an answer from a question */
  removeAnswer(qIndex: number, aIndex: number): void {
    this.surveyDraft.questions[qIndex].answers.splice(aIndex, 1);
  }

  /**
   * Publishes the survey and navigates back to home.
   */
  publish(): void {
    this.surveyService.createSurvey(this.surveyDraft);
    this.router.navigate(['/']);
  }

  /**
   * Converts an index (0,1,2) to a letter (A,B,C).
   */
  toLetter(i: number): string {
    return String.fromCharCode(65 + i);
  }

  /** Navigates back to the home page. */
  goHome(): void {
    this.router.navigate(['/']);
  }

  /**
   *  Removes a question from the survey draft.
   * @param index 
   */
  removeQuestion(index: number) {
    this.surveyDraft.questions.splice(index, 1);
  }


}
