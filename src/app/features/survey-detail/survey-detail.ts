import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyService } from '../../shared/services/survey.service';
import { LetterPipe } from '../../shared/pipes/letter.pipe';
import { SurveyFull } from '../../shared/interfaces/survey-full';

/**
 * Displays a full survey including questions and answer options.
 * Handles user selections and triggers completion logic.
 */
@Component({
  selector: 'app-survey-detail',
  standalone: true,
  templateUrl: './survey-detail.html',
  styleUrls: ['./survey-detail.scss'],
  imports: [LetterPipe],
})
export class SurveyDetailComponent {

  /** Holds the fully loaded survey including nested questions */
  survey = signal<SurveyFull | null>(null);

  /** Stores selected answers per question index */
  answers = signal<{ [questionIndex: number]: number[] }>({});

  /** Controls the temporary success dialog */
  showSuccess = signal(false);

  private route = inject(ActivatedRoute);
  private surveyService = inject(SurveyService);
  private router = inject(Router);

  /**
   * Loads the survey with all nested data (questions + options).
   */
  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    const data = await this.surveyService.getSurveyWithQuestions(id);
    this.survey.set(data);
  }

  /**
   * Toggles a selected answer for a question.
   *
   * @param qIndex Index of the question
   * @param aIndex Index of the answer option
   * @param allowMultiple Whether multiple answers are allowed
   */
  toggleAnswer(qIndex: number, aIndex: number, allowMultiple: boolean): void {
    const current = this.answers()[qIndex] ?? [];
    const updated = allowMultiple
      ? current.includes(aIndex)
        ? current.filter(i => i !== aIndex)
        : [...current, aIndex]
      : [aIndex];

    this.answers.update(a => ({ ...a, [qIndex]: updated }));
  }

  /**
   * Completes the survey, shows success dialog and redirects home.
   */
  completeSurvey(): void {
    this.showSuccess.set(true);

    // Keine lokale Berechnung mehr – Supabase übernimmt später alles

    setTimeout(() => {
      this.showSuccess.set(false);
      this.router.navigate(['/']);
    }, 1500);
  }
  

  /**
   * Navigates to the create survey page.
   */
  goToCreateSurvey(): void {
    this.router.navigate(['/create']);
  }
}
