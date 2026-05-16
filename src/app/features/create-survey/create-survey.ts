import { Component, inject, ChangeDetectorRef } from '@angular/core'; // ChangeDetectorRef hinzugefügt
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ViewEncapsulation } from '@angular/core';
import { SurveyService } from '../../shared/services/survey.service';
import { CategoryService } from '../../shared/services/category';

@Component({
  selector: 'app-create-survey',
  standalone: true,
  templateUrl: './create-survey.html',
  styleUrls: ['./create-survey.scss'],
  imports: [FormsModule, CommonModule],
  encapsulation: ViewEncapsulation.None
})
export class CreateSurveyComponent {

  /**
   * Holds the entire draft of the survey being created.
   */
  surveyDraft = {
    title: '',
    enddate: '',
    category: '',
    description: '',
    questions: [
      {
        id: crypto.randomUUID(),
        text: '',
        allowMultiple: false,
        answers: ['']
      }
    ]
  };

  successDialog = false;
  errorDialog = false;
  errorMessage = '';
  createdSurveyId = '';

  private readonly surveyService = inject(SurveyService);
  private readonly categoryService = inject(CategoryService);
  public readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef); 

  categories = this.categoryService.categories;
  categoryOpen = false;

  /**
   * Adds a new empty question with a unique ID.
   */
  addQuestion(): void {
    this.surveyDraft.questions.push({
      id: crypto.randomUUID(),
      text: '',
      allowMultiple: false,
      answers: ['']
    });
  }
  

  /**
   * Adds an empty answer to the given question.
   * @param qIndex Index of the question.
   */
  addAnswer(qIndex: number): void {
    this.surveyDraft.questions[qIndex].answers.push('');
  }

  /**
   * Removes an answer from a question.
   * @param qIndex Index of the question.
   * @param aIndex Index of the answer to remove.
   */
  removeAnswer(qIndex: number, aIndex: number): void {
    this.surveyDraft.questions[qIndex].answers.splice(aIndex, 1);
  } 

  /**
   * Publishes the survey and shows success or error dialogs.
   */
  async publish(): Promise<void> {
    if (!this.isValid()) return;

    try {
      const survey = await this.surveyService.createSurvey(this.surveyDraft);
      this.createdSurveyId = survey.id;

      this.successDialog = true;
      this.cdr.detectChanges(); 

      setTimeout(() => {
        this.router.navigate(['/']);
      }, 2000);

    } catch (err: any) {
      this.errorMessage = err?.message ?? "Unknown error";
      this.errorDialog = true;
      this.cdr.detectChanges(); 
    }
  }

  toLetter(i: number): string {
    return String.fromCharCode(65 + i);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  removeQuestion(index: number): void {
    this.surveyDraft.questions.splice(index, 1);
  }

  isValid(): boolean {
    if (!this.surveyDraft.title.trim()) return false;
    if (!this.surveyDraft.category.trim()) return false;

    for (const q of this.surveyDraft.questions) {
      if (!q.text.trim()) return false;
      if (q.answers.length === 0) return false;
      if (q.answers.some(a => !a.trim())) return false;
    }

    return true;
  }
}
