import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyService } from '../../shared/services/survey.service';
import { LetterPipe } from '../../shared/pipes/letter.pipe';
import { SurveyFull } from '../../shared/interfaces/survey-full';
import { getDaysLeft } from '../../shared/services/date.utils';
import { SurveyResultsComponent } from '../survey-results/survey-results';
import { CategoryService } from '../../shared/services/category';
import { CreateSurveyComponent } from '../create-survey/create-survey';


/**
 * Displays a full survey including questions, answer options,
 * live vote updates and result visualization.
 * Handles user selections, voting and navigation.
 */
@Component({
  selector: 'app-survey-detail',
  standalone: true,
  templateUrl: './survey-detail.html',
  styleUrls: ['./survey-detail.scss'],
  imports: [LetterPipe, SurveyResultsComponent, CreateSurveyComponent],
})
export class SurveyDetailComponent {

  /**
   * Provides category metadata such as labels and colors.
   */
  categoryService = inject(CategoryService);

  /**
   * Holds the fully loaded survey including all nested questions and options.
   */
  survey = signal<SurveyFull | null>(null);

  /**
   * Stores selected answers per question index.
   * Structure: { [questionIndex]: number[] }
   */
  answers = signal<{ [questionIndex: number]: number[] }>({});

  /**
   * Controls visibility of the temporary success dialog after voting.
   */
  showSuccess = signal(false);

  /**
   * Holds calculated vote results for each question.
   */
  results = signal<any[]>([]);

  /**
   * Indicates whether the survey already has votes.
   */
  hasVotes = signal(false);

  /**
   * Indicates whether the survey is closed (end date reached or manually finished).
   */
  isClosed = signal(false);

  /**
   * Controls visibility of the results section.
   */
  showResults = false;

  /**
   * Utility function to calculate remaining days until survey end.
   */
  getDaysLeft = getDaysLeft;

  localVotes = signal<any[]>([]);
  realVotes = signal<any[]>([]);
  isCreateOpen = signal(false);

  private route = inject(ActivatedRoute);
  private surveyService = inject(SurveyService);
  private router = inject(Router);

  /**
   * Loads the survey, its questions and live vote data.
   * Subscribes to real-time vote updates.
   */
  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    const data = await this.surveyService.getSurveyWithQuestions(id);
    if (!data) return;
    this.survey.set(data);
    const votes = await this.surveyService.getVotes(id);
    this.realVotes.set(votes);
    this.calculateResults(this.combinedVotes());


    this.surveyService.subscribeToSurveyVotes(id, votes => {
      this.realVotes.set(votes);
      this.calculateResults(this.combinedVotes());

    });

    const today = new Date().toISOString().split('T')[0];
    this.isClosed.set(data.isfinished || data.enddate < today);
  }

  /**
   * Updates selected answers and manages temporary local votes.
   */
  toggleAnswer(qIndex: number, aIndex: number, allowMultiple: boolean): void {
    const all = this.answers();
    const current = all[qIndex] || [];
    let updated: number[] = [];

    if (allowMultiple) {
      let exists = false;
      for (let i = 0; i < current.length; i++) {
        if (current[i] === aIndex) exists = true;
        else updated.push(current[i]);
      }
      if (!exists) updated.push(aIndex);
    } else {
      updated = [aIndex];
    }

    const newState: any = {};
    for (const key in all) newState[key] = all[key];
    newState[qIndex] = updated;
    this.answers.set(newState);

    const s = this.survey();
    if (!s) return;

    if (updated.includes(aIndex)) {
      const opt = s.questions[qIndex].options[aIndex];
      this.localVotes.set([
        {
          survey_id: s.id,
          question_index: qIndex,
          selected_options: [aIndex],
          answer_text: opt.text,
          vote_count: 1
        }
      ]);
    } else {
      this.localVotes.set([]);
    }

    this.calculateResults(this.combinedVotes());
  }
  
  

  /**
   * Submits all selected answers as individual votes.
   * Shows a success dialog and redirects to the home page.
   */
  async completeSurvey(): Promise<void> {
    const survey: SurveyFull | null = this.survey();
    if (!survey) return;
    const answers = this.answers();

    for (const qIndex in answers) {
      for (const aIndex of answers[qIndex]) {
        await this.surveyService.submitVote(
          survey.id,
          Number(qIndex),
          aIndex
        );
      }
    }

    this.showSuccess.set(true);
    setTimeout(() => {
      this.showSuccess.set(false);
      this.router.navigate(['/']);
    }, 1500);
  }

  /**
   * Navigates to the survey creation page.
   */
  goToCreateSurvey(): void {
    this.isCreateOpen.set(true);
    document.body.style.overflow = 'hidden';
  }
  

  /**
   * Navigates back to the home page.
   */
  goHome(): void {
    this.router.navigate(['/']);
  }

  /**
   * Aggregates vote data per question and calculates percentages.
   */
  calculateResults(votes: any[]): void {
    const survey = this.survey();
    if (!survey) return;

    const results = survey.questions.map((q, qi) => {
      const qv = votes.filter(v => v.question_index === qi);
      const total = this.sumVotes(qv);
      const options = this.buildOptionResults(q.options, qv, total);
      return { question: q.title, options };
    });
    

    this.results.set(results);
    this.hasVotes.set(votes.length > 0);
  }
  
  /**
 * Sums all vote counts for a question.
 */
  private sumVotes(votes: any[]): number {
    return votes.reduce((sum, v) => sum + (v.vote_count ?? 0), 0);
  }

  /**
   * Builds option results using index-based vote matching.
   */
  private buildOptionResults(options: any[], votes: any[], total: number): any[] {
    return options.map((o, oi) => {
      let count = 0;
      for (let i = 0; i < votes.length; i++) {
        const v = votes[i];
        if (v.selected_options && v.selected_options[0] === oi) {
          count += v.vote_count ?? 0;
        }
      }
      const percent = total ? Math.round((count / total) * 100) : 0;
      return { label: oi, percent };
    });
  }
  
  
  /**
   * Toggles visibility of the results section.
   */
  toggleResults(): void {
    this.showResults = !this.showResults;
  }

  /**
 * Combines real votes with temporary local votes.
 */
  combinedVotes(): any[] {
    const all: any[] = [];
    const real = this.realVotes();
    const local = this.localVotes();

    for (let i = 0; i < real.length; i++) all.push(real[i]);
    for (let i = 0; i < local.length; i++) all.push(local[i]);

    return all;
  }

  closeCreate(): void {
    this.isCreateOpen.set(false);
    document.body.style.overflow = '';
  }
  

}
