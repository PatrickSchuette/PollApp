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
  countdown = 5;
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
   * Adds a new question with two default answers if limit not reached.
   */
  addQuestion(): void {
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
   * Adds an answer if limit not reached.
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
   */
  removeAnswer(qIndex: number, aIndex: number): void {
    const list = this.surveyDraft.questions[qIndex].answers;

    list.splice(aIndex, 1);

    this.touched['question' + qIndex] = true;
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
   * Validates required fields including minimum answers.
   */
  isValid(): boolean {
    if (!this.surveyDraft.title.trim()) return false;
    if (!this.surveyDraft.category.trim()) return false;

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
    const timer = this.countdown * 1000;
    await this.executePublish(timer);
  }
  

  /**
   * Executes the publish request and handles success or error states.
   * @param timer Redirect delay in milliseconds.
   */
  private async executePublish(timer: number): Promise<void> {
    try {
      const survey = await this.surveyService.createSurvey(this.surveyDraft);
      this.createdSurveyId = survey.id;
      this.successDialog = true;
      this.startCountdown();
      setTimeout(() => this.cdr.detectChanges());
      this.redirectTimeout = setTimeout(() => this.router.navigate(['/']), timer);
    } catch (err: any) {
      this.errorMessage = err?.message ?? 'Unknown error';
      this.errorDialog = true;
      setTimeout(() => this.cdr.detectChanges());
    }
  }
  
  /**
   * close Modal
   */
  goHome(): void {
    this.close.emit();
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

  /**
   * Starts the redirect countdown and updates the countdown value each second.
 */
  startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) clearInterval(this.countdownInterval);
      this.cdr.detectChanges();
    }, 1000);
  }

  /**
   * Immediately navigates to the created survey, bypassing the countdown.
   */
  goToSurvey(): void {
    clearInterval(this.countdownInterval);
    clearTimeout(this.redirectTimeout);
    this.router.navigate(['/survey', this.createdSurveyId]);
  }
  
  /**
 * Shows a temporary error dialog for limit violations.
 */
  showLimitError(msg: string): void {
    this.errorMessage = msg;
    this.errorDialog = true;
    setTimeout(() => {
      this.errorDialog = false;
      this.cdr.detectChanges();
    }, 2000);
  }

}
