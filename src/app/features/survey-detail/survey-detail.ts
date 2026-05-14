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

  /** Holds calculated results for display */
  results = signal<any[]>([]);
  hasVotes = signal(false);
  isClosed = signal(false);

  private route = inject(ActivatedRoute);
  private surveyService = inject(SurveyService);
  private router = inject(Router);

  /**
   * Loads survey and its live results.
   */
  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    const data = await this.surveyService.getSurveyWithQuestions(id);
    if (!data) return; // <-- WICHTIG!

    this.survey.set(data);

    const votes = await this.surveyService.getVotes(id);
    this.calculateResults(votes);

    const today = new Date().toISOString().split('T')[0];
    this.isClosed.set(
      data.isfinished || data.enddate < today
    );
  }
  
  

  /**
   * Toggles a selected answer for a question.
   *
   * @param qIndex - Index of the question.
   * @param aIndex - Index of the answer option.
   * @param allowMultiple - Whether multiple answers are allowed.
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
   * Submits all selected answers and shows success dialog.
   */
  async completeSurvey(): Promise<void> {
    const survey = this.survey();
    if (!survey) return;

    const answers = this.answers();

    for (const qIndex in answers) {
      await this.surveyService.submitVote(
        survey.id,
        Number(qIndex),
        answers[qIndex]
      );
    }

    this.showSuccess.set(true);

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

  /**
   * Navigates back to the home page.
   */
  goHome(): void {
    this.router.navigate(['/']);
  }

  /**
   * Groups votes by question and option and calculates percentages.
   */
  calculateResults(votes: any[]): void {
    const s = this.survey();
    if (!s) return;

    const result = s.questions.map((q, qi) => {
      const questionVotes = votes.filter(v => v.question_index === qi);
      const total = questionVotes.reduce((sum, v) => sum + (v.vote_count ?? 0), 0);

      const options = q.options.map((o, oi) => {
        const entry = questionVotes.find(v => v.answer_text === o.text);
        const count = entry?.vote_count ?? 0;
        const percent = total ? Math.round((count / total) * 100) : 0;
        return { label: oi, percent };
      });

      return { question: q.title, options };
    });

    this.results.set(result);
    this.hasVotes.set(votes.length > 0);

  }
  
}
