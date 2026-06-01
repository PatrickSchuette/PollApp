import { Component, inject, ChangeDetectorRef, signal, Output, EventEmitter } from '@angular/core';
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
      { id: crypto.randomUUID(), text: '', allowMultiple: false, answers: ['', ''] }
    ]
  };

  successDialog = false;
  errorDialog = false;
  errorMessage = '';
  createdSurveyId = '';
  endDateError = false;
  readonly redirectSeconds = 5;
  countdown = this.redirectSeconds;
  redirectTimeout: any = null;
  countdownInterval: any = null;
  showErrors = signal(false);
  touched: Record<string, boolean> = {};
  maxPossibleQuestions = 4;
  maxPossibleAnswers = 4;
  minRequiredAnswers = 2;

  readonly surveyService = inject(SurveyService);
  readonly categoryService = inject(CategoryService);
  readonly router = inject(Router);
  readonly cdr = inject(ChangeDetectorRef);

  categories = this.categoryService.categories;
  categoryOpen = false;
  @Output() close = new EventEmitter<void>();

  /**
   * Adds a new question with two default answers if the limit is not reached.
   */
  addQuestion(): void {
    this.showErrors.set(false);
    if (this.surveyDraft.questions.length >= this.maxPossibleQuestions) {
      this.showLimitError('Maximum number of questions reached');
      return;
    }
    this.surveyDraft.questions.push({
      id: crypto.randomUUID(),
      text: '',
      allowMultiple: false,
      answers: ['', '']
    });
  }

  /**
   * Adds an answer to a question if the limit is not reached.
   * @param qIndex Index of the question to add an answer to.
   */
  addAnswer(qIndex: number): void {
    const list = this.surveyDraft.questions[qIndex].answers;
    if (list.length >= this.maxPossibleAnswers) {
      this.showLimitError('Maximum number of answers reached');
      return;
    }
    list.push('');
  }

  /**
   * Removes an answer from a question.
   * @param qIndex Index of the question.
   * @param aIndex Index of the answer to remove.
   */
  removeAnswer(qIndex: number, aIndex: number): void {
    const list = this.surveyDraft.questions[qIndex].answers;
    list.splice(aIndex, 1);
    this.touched['question' + qIndex] = true;
  }

  /**
   * Removes a question from the survey draft.
   * @param index Index of the question to remove.
   */
  removeQuestion(index: number): void {
    this.surveyDraft.questions.splice(index, 1);
  }

  /**
   * Converts a numeric index to an uppercase letter.
   * @param i Index to convert.
   * @returns Corresponding letter.
   */
  toLetter(i: number): string {
    return String.fromCharCode(65 + i);
  }

  /**
   * Validates all required survey fields.
   * @returns True if the survey draft is valid.
   */
  isValid(): boolean {
    if (!this.validateHeaderFields()) return false;
    if (!this.validateQuestions()) return false;
    return true;
  }

  /**
   * Validates title, category and question count.
   * @returns True if header fields are valid.
   */
  private validateHeaderFields(): boolean {
    if (!this.surveyDraft.title.trim()) return false;
    if (!this.surveyDraft.category.trim()) return false;
    if (this.surveyDraft.questions.length === 0) {
      this.errorMessage = 'Survey must contain at least one question';
      this.errorDialog = true;
      return false;
    }
    return true;
  }

  /**
   * Validates all questions and their answers.
   * @returns True if all questions are valid.
   */
  private validateQuestions(): boolean {
    for (let i = 0; i < this.surveyDraft.questions.length; i++) {
      const q = this.surveyDraft.questions[i];
      if (!q.text.trim()) return false;
      if (q.text.trim().length < 3) return false;
      if (q.answers.length < this.minRequiredAnswers) return false;
      for (let j = 0; j < q.answers.length; j++) {
        if (!q.answers[j].trim()) return false;
      }
    }
    return true;
  }

  /**
   * Checks all survey fields for unsafe HTML or JavaScript.
   * @returns True if all fields are safe.
   */
  private isDraftSafe(): boolean {
    const values = this.collectDraftValues();
    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      if (DOMPurify.sanitize(v) !== v) return false;
    }
    return true;
  }

  /**
   * Collects all string values from the survey draft.
   * @returns Array of all text values in the draft.
   */
  private collectDraftValues(): string[] {
    const values: string[] = [];
    values.push(this.surveyDraft.title);
    values.push(this.surveyDraft.description);
    for (let i = 0; i < this.surveyDraft.questions.length; i++) {
      const q = this.surveyDraft.questions[i];
      values.push(q.text);
      for (let j = 0; j < q.answers.length; j++) {
        values.push(q.answers[j]);
      }
    }
    return values;
  }

  /**
   * Publishes the survey or marks invalid fields.
   */
  async publish(): Promise<void> {
    if (!this.isValid()) {
      this.showErrors.set(true);
      return;
    }
    if (!this.isDraftSafe()) {
      this.errorMessage = 'Invalid input detected. HTML or JavaScript is not allowed.';
      this.errorDialog = true;
      setTimeout(() => this.cdr.detectChanges());
      return;
    }
    await this.executePublish();
  }

  /**
   * Executes the publish request and handles success or error states.
   */
  private async executePublish(): Promise<void> {
    try {
      const survey = await this.surveyService.createSurvey(this.surveyDraft);
      this.handlePublishSuccess(survey.id);
    } catch (err: any) {
      this.handlePublishError(err);
    }
  }

  /**
   * Handles successful survey creation and starts redirect countdown.
   * @param id Created survey ID.
   */
  private handlePublishSuccess(id: string): void {
    this.createdSurveyId = id;
    this.successDialog = true;
    this.countdown = this.redirectSeconds;
    this.cdr.detectChanges();
    this.startCountdown();
    this.redirectTimeout = setTimeout(() => {
      this.close.emit();
      this.router.navigate(['/']);
    }, this.redirectSeconds * 1000);
  }

  /**
   * Handles errors that occur during survey creation.
   * @param err Error object thrown during publish.
   */
  private handlePublishError(err: any): void {
    this.errorMessage = err && err.message ? err.message : 'Unknown error';
    this.errorDialog = true;
    this.cdr.detectChanges();
  }

  /**
   * Closes the modal and cancels active timers.
   */
  goHome(): void {
    clearInterval(this.countdownInterval);
    clearTimeout(this.redirectTimeout);
    this.close.emit();
  }

  /**
   * Validates whether the selected end date is in the future.
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

  /**
   * Starts the redirect countdown and updates the countdown value each second.
   */
  startCountdown(): void {
    clearInterval(this.countdownInterval);
    this.countdownInterval = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
        this.cdr.detectChanges();
      } else {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  /**
   * Immediately navigates to the created survey, bypassing the countdown.
   */
  goToSurvey(): void {
    clearInterval(this.countdownInterval);
    clearTimeout(this.redirectTimeout);
    this.close.emit();
    this.router.navigate(['/survey', this.createdSurveyId]);
  }

  /**
   * Shows a temporary error dialog for limit violations.
   * @param msg Error message to display.
   */
  showLimitError(msg: string): void {
    this.errorMessage = msg;
    this.errorDialog = true;
    setTimeout(() => {
      this.errorDialog = false;
      this.cdr.detectChanges();
    }, 2000);
  }

  /**
   * Clears a form field and resets its touched state.
   * @param setter Function that assigns the new value.
   * @param touchedKey Key of the touched state to reset.
   */
  clearField(setter: (v: string) => void, touchedKey: string): void {
    setter('');
    this.touched[touchedKey] = false;
    this.showErrors.set(false);
  }

  /**
   * Closes the error dialog without propagating the click event.
   * @param event Mouse event from the click.
   */
  closeErrorDialog(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.errorDialog = false;
  }
}
