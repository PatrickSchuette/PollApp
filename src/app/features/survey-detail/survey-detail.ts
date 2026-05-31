import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyService } from '../../shared/services/survey.service';
import { LetterPipe } from '../../shared/pipes/letter.pipe';
import { SurveyFull } from '../../shared/interfaces/survey-full';
import { getDaysLeft } from '../../shared/services/date.utils';
import { SurveyResultsComponent } from '../survey-results/survey-results';
import { CategoryService } from '../../shared/services/category';
import { CreateSurveyComponent } from '../create-survey/create-survey';

@Component({
  selector: 'app-survey-detail',
  standalone: true,
  templateUrl: './survey-detail.html',
  styleUrls: ['./survey-detail.scss'],
  imports: [LetterPipe, SurveyResultsComponent, CreateSurveyComponent],
})
export class SurveyDetailComponent {
  categoryService = inject(CategoryService);
  survey = signal<SurveyFull | null>(null);
  answers = signal<{ [index: number]: number[] }>({});
  showSuccess = signal(false);
  results = signal<any[]>([]);
  hasVotes = signal(false);
  isClosed = signal(false);
  showResults = false;
  getDaysLeft = getDaysLeft;
  localVotes = signal<{ [index: number]: any[] }>({});
  realVotes = signal<any[]>([]);
  isCreateOpen = signal(false);

  private route = inject(ActivatedRoute);
  private surveyService = inject(SurveyService);
  private router = inject(Router);

  /**
   * Loads survey and initializes vote data.
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
    this.surveyService.subscribeToSurveyVotes(id, v => {
      this.realVotes.set(v);
      this.calculateResults(this.combinedVotes());
    });
    const today = new Date().toISOString().split('T')[0];
    this.isClosed.set(data.isfinished || data.enddate < today);
  }

  /**
   * Handles answer selection.
   */
  toggleAnswer(qIndex: number, aIndex: number, allowMultiple: boolean): void {
    const updated = this.buildUpdatedAnswers(
      this.answers()[qIndex] || [],
      aIndex,
      allowMultiple
    );
    this.updateAnswersState(qIndex, updated);
    const s = this.survey();
    if (!s) return;
    this.updateLocalVotes(qIndex, aIndex, updated, s.id);
    this.calculateResults(this.combinedVotes());
  }

  /**
   * Builds updated answer list.
   */
  private buildUpdatedAnswers(
    current: number[],
    option: number,
    allowMultiple: boolean
  ): number[] {
    const updated: number[] = [];
    if (!allowMultiple) {
      updated.push(option);
      return updated;
    }
    let exists = false;
    for (let i = 0; i < current.length; i++) {
      if (current[i] === option) exists = true;
      else updated.push(current[i]);
    }
    if (!exists) updated.push(option);
    return updated;
  }

  /**
   * Updates global answer state.
   */
  private updateAnswersState(
    qIndex: number,
    updated: number[]
  ): void {
    const all = this.answers();
    const newState: { [index: number]: number[] } = {};
    for (const key in all) newState[Number(key)] = all[key];
    newState[qIndex] = updated;
    this.answers.set(newState);
  }

  /**
   * Updates local preview votes.
   */
  private updateLocalVotes(
    qIndex: number,
    aIndex: number,
    updated: number[],
    surveyId: string
  ): void {
    const s = this.survey();
    if (!s) return;
    const lv = this.localVotes();
    const newLocal: { [index: number]: any[] } = {};
    for (const key in lv) newLocal[Number(key)] = lv[key];
    if (updated.length === 0) {
      delete newLocal[qIndex];
      this.localVotes.set(newLocal);
      return;
    }
    const arr: any[] = [];
    for (let i = 0; i < updated.length; i++) {
      const opt = s.questions[qIndex].options[updated[i]];
      arr.push({
        survey_id: surveyId,
        question_index: qIndex,
        selected_options: [updated[i]],
        answer_text: opt.text,
        vote_count: 1
      });
    }
    newLocal[qIndex] = arr;
    this.localVotes.set(newLocal);
  }
  

  /**
   * Submits all selected votes.
   */
  async completeSurvey(): Promise<void> {
    const s = this.survey();
    if (!s) return;
    const ans = this.answers();
    for (const key in ans) {
      const q = Number(key);
      const arr = ans[q];
      for (let i = 0; i < arr.length; i++) {
        await this.surveyService.submitVote(s.id, q, arr[i]);
      }
    }
    this.showSuccess.set(true);
    setTimeout(() => {
      this.showSuccess.set(false);
      this.router.navigate(['/']);
    }, 1500);
  }

  /**
   * Calculates results for all questions.
   */
  calculateResults(votes: any[]): void {
    const s = this.survey();
    if (!s) return;
    const res: any[] = [];
    for (let i = 0; i < s.questions.length; i++) {
      const q = s.questions[i];
      const qv = this.filterVotesByQuestion(votes, i);
      const total = this.sumVotes(qv);
      const opts = this.buildOptionResults(q.options, qv, total);
      res.push({ question: q.title, options: opts });
    }
    this.results.set(res);
    this.hasVotes.set(votes.length > 0);
  }

  /**
   * Filters votes for a question.
   */
  private filterVotesByQuestion(
    votes: any[],
    qIndex: number
  ): any[] {
    const arr: any[] = [];
    for (let i = 0; i < votes.length; i++) {
      if (votes[i].question_index === qIndex) arr.push(votes[i]);
    }
    return arr;
  }

  /**
   * Sums vote counts.
   */
  private sumVotes(votes: any[]): number {
    let sum = 0;
    for (let i = 0; i < votes.length; i++) {
      const c = votes[i].vote_count ? votes[i].vote_count : 0;
      sum = sum + c;
    }
    return sum;
  }

  /**
   * Builds option result list.
   */
  private buildOptionResults(
    options: any[],
    votes: any[],
    total: number
  ): any[] {
    const arr: any[] = [];
    for (let i = 0; i < options.length; i++) {
      let count = 0;
      for (let j = 0; j < votes.length; j++) {
        const sel = votes[j].selected_options
          ? votes[j].selected_options[0]
          : null;
        if (sel === i) {
          const c = votes[j].vote_count ? votes[j].vote_count : 0;
          count = count + c;
        }
      }
      const percent = total ? Math.round((count / total) * 100) : 0;
      arr.push({ label: i, percent });
    }
    return arr;
  }

  /**
   * Combines real and local votes.
   */
  combinedVotes(): any[] {
    const real = this.realVotes();
    const local = this.localVotes();
    const all: any[] = [];
    for (let i = 0; i < real.length; i++) all.push(real[i]);
    for (const key in local) {
      const arr = local[key];
      for (let j = 0; j < arr.length; j++) all.push(arr[j]);
    }
    return all;
  }

  /**
   * Toggles result visibility.
   */
  toggleResults(): void {
    this.showResults = !this.showResults;
  }

  /**
   * Opens create survey overlay.
   */
  goToCreateSurvey(): void {
    this.isCreateOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  /**
   * Navigates home.
   */
  goHome(): void {
    this.router.navigate(['/']);
  }

  /**
   * Closes create survey overlay.
   */
  closeCreate(): void {
    this.isCreateOpen.set(false);
    document.body.style.overflow = '';
  }
}
