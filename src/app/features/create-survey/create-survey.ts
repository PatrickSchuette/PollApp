import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ViewEncapsulation } from '@angular/core';
import { SurveyService } from '../../shared/services/survey.service';
import { CategoryService } from '../../shared/services/category';
import DOMPurify from 'dompurify';

@Component({
  selector: 'app-create-survey',
  standalone: true,
  templateUrl: './create-survey.html',
  styleUrls: ['./create-survey.scss'],
  imports: [FormsModule, CommonModule],
  encapsulation: ViewEncapsulation.None
})
export class CreateSurveyComponent {

  surveyDraft = {
    title: '',
    enddate: '',
    category: '',
    description: '',
    questions: [
      { id: crypto.randomUUID(), text: '', allowMultiple: false, answers: [''] }
    ]
  };

  successDialog = false;
  errorDialog = false;
  errorMessage = '';
  createdSurveyId = '';
  endDateError = false;

  public readonly surveyService = inject(SurveyService);
  public readonly categoryService = inject(CategoryService);
  public readonly router = inject(Router);
  public readonly cdr = inject(ChangeDetectorRef);

  categories = this.categoryService.categories;
  categoryOpen = false;

  /**
   * Adds a new empty question.
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
   * Adds an empty answer to a question.
   */
  addAnswer(qIndex: number): void {
    this.surveyDraft.questions[qIndex].answers.push('');
  }

  /**
   * Removes an answer from a question.
   */
  removeAnswer(qIndex: number, aIndex: number): void {
    this.surveyDraft.questions[qIndex].answers.splice(aIndex, 1);
  }

  /**
   * Removes a question.
   */
  removeQuestion(index: number): void {
    this.surveyDraft.questions.splice(index, 1);
  }

  /**
   * Converts index to letter.
   */
  toLetter(i: number): string {
    return String.fromCharCode(65 + i);
  }

  /**
   * Validates required fields.
   */
  isValid(): boolean {
    if (!this.surveyDraft.title.trim()) return false;
    if (!this.surveyDraft.category.trim()) return false;
    return this.surveyDraft.questions.every(q =>
      q.text.trim() &&
      q.answers.length > 0 &&
      q.answers.every(a => a.trim())
    );
  }

  /**
   * Checks all survey fields for unsafe HTML or JavaScript.
   * @returns True if all fields are safe.
   */
  private isDraftSafe(): boolean {
    const values: string[] = [];
    values.push(this.surveyDraft.title);
    values.push(this.surveyDraft.description);

    for (const q of this.surveyDraft.questions) {
      values.push(q.text);
      for (const a of q.answers) values.push(a);
    }

    for (const v of values) {
      if (DOMPurify.sanitize(v) !== v) return false;
    }

    return true;
  }
  

  /**
   * Publishes the survey after validation.
   */
  async publish(): Promise<void> {
    if (!this.isValid()) { return; }
    if (!this.isDraftSafe()) {
      this.errorMessage = 'Invalid input detected. HTML or JavaScript is not allowed.';
      this.errorDialog = true;
      this.cdr.detectChanges();
      return;
    }
    try {
      const survey = await this.surveyService.createSurvey(this.surveyDraft);
      this.createdSurveyId = survey.id;
      this.successDialog = true;
      this.cdr.detectChanges();
      setTimeout(() => this.router.navigate(['/']), 2000);
    } catch (err: any) {
      this.errorMessage = err?.message ?? 'Unknown error';
      this.errorDialog = true;
      this.cdr.detectChanges();
    }
  }

  /**
   * Navigates to home page.
   */
  goHome(): void {
    this.router.navigate(['/']);
  }

  /**
   * Validates whether the selected end date is in the future.
   * 
   * Sets `endDateError` to `true` if the chosen date is before today.
   * Optional fields without a value are treated as valid.
   *
   * @returns {void}
   */
  validateEndDate(): void {
    if (!this.surveyDraft.enddate) {
      this.endDateError = false;
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selected = new Date(this.surveyDraft.enddate);

    this.endDateError = selected < today;
  }
  
}
