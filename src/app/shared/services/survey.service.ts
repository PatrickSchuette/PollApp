import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class SurveyService implements OnDestroy {
  private supabase = inject(SupabaseService).client;
  public surveys = signal<any[]>([]);

  /**
   * Sets up database connections and starts listening to updates.
   */
  constructor() {
    this.loadAllSurveys();
    this.subscribeInsert();
    this.subscribeUpdate();
    this.subscribeVotes();
  }

  /**
   * Fetches all survey rows sorted by their end date.
   * @returns {Promise<any[]>} A list containing all surveys.
   */
  async getAll(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('surveys')
      .select('*')
      .order('enddate', { ascending: true });
    if (error) throw error;
    return data ?? [];
  }

  /**
   * Fetches surveys with end dates within the next 300 days range.
   * @returns {Promise<any[]>} A list of surveys closing soon.
   */
  async getEndingSoon(): Promise<any[]> {
    const today = new Date();
    const limit = new Date();
    limit.setDate(today.getDate() + 300);
    const { data, error } = await this.supabase
      .from('surveys')
      .select('*')
      .gte('enddate', today.toISOString().split('T')[0])
      .lte('enddate', limit.toISOString().split('T')[0]);
    if (error) throw error;
    return data ?? [];
  }

  /**
   * Fetches all currently unfinished active surveys.
   * @returns {Promise<any[]>} A list of active surveys.
   */
  async getActiveSurveys(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('surveys')
      .select('*')
      .eq('isfinished', false);
    if (error) throw error;
    return data ?? [];
  }

  /**
   * Fetches all finished past surveys from the database.
   * @returns {Promise<any[]>} A list of closed surveys.
   */
  async getPastSurveys(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('surveys')
      .select('*')
      .eq('isfinished', true);
    if (error) throw error;
    return data ?? [];
  }

  /**
   * Fetches a survey object with its attached child questions and options.
   * @param {string} id - The primary identifier of the survey.
   * @returns {Promise<any>} The survey object with nested children.
   */
  async getSurveyWithQuestions(id: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('surveys')
      .select(`
        id, title, description, category, enddate, isfinished,
        questions (id, title, position, allow_multiple, options (id, text, position))
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  /**
   * Prepares the payload array containing options for multiple questions.
   * @param {any[]} insertedQuestions - The questions saved in the database.
   * @param {any[]} draftQuestions - The input question blueprints.
   * @returns {any[]} The generated choices payload array.
   */
  buildOptionsPayload(insertedQuestions: any[], draftQuestions: any[]): any[] {
    const payload: any[] = [];
    insertedQuestions.forEach((insertedQ: any) => {
      const originalQ = draftQuestions[insertedQ.position];
      if (!originalQ || !originalQ.answers) return;
      originalQ.answers.forEach((text: string, index: number) => {
        payload.push({ question_id: insertedQ.id, text, position: index });
      });
    });
    return payload;
  }

  /**
   * Creates a brand new survey along with its questions and answer options.
   * @param {any} draft - The survey composition blueprint data object.
   * @returns {Promise<any>} The newly generated survey base row data.
   */
  async createSurvey(draft: any): Promise<any> {
    const sPayload = { title: draft.title, description: draft.description, category: draft.category, enddate: draft.enddate || null, isfinished: false };
    const { data: survey, error: sError } = await this.supabase.from('surveys').insert(sPayload).select().single();
    if (sError) throw sError;
    if (!draft.questions || draft.questions.length === 0) return survey;
    const qPayload = draft.questions.map((q: any, i: number) => ({ survey_id: survey.id, title: q.text, position: i, allow_multiple: q.allowMultiple }));
    const { data: insQ, error: qError } = await this.supabase.from('questions').insert(qPayload).select();
    if (qError) throw qError;
    const oPayload = this.buildOptionsPayload(insQ, draft.questions);
    if (oPayload.length > 0) {
      const { error: oError } = await this.supabase.from('options').insert(oPayload);
      if (oError) throw oError;
    }
    return survey;
  }

  /**
   * Fetches all submitting user votes recorded for a survey.
   * @param {string} id - The specific target survey identifier.
   * @returns {Promise<any[]>} A list containing the vote records.
   */
  async getVotes(id: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('votes')
      .select('*')
      .eq('survey_id', id);
    if (error) throw error;
    return data ?? [];
  }

  /**
   * Submits a fresh vote entry or increments the counter if it exists.
   * @param {string} sId - The target survey identification.
   * @param {number} qIdx - The current question position index.
   * @param {number} selOpt - The chosen option placement index.
   */
  async submitVote(sId: string, qIdx: number, selOpt: number): Promise<void> {
    const survey = await this.getSurveyWithQuestions(sId);
    const q = survey.questions[qIdx];
    const opt = q.options[selOpt];
    const { data: ext } = await this.supabase.from('votes').select('id, vote_count').eq('survey_id', sId).eq('question_index', qIdx).eq('answer_text', opt.text).maybeSingle();
    if (ext) {
      const { error } = await this.supabase.from('votes').update({ vote_count: ext.vote_count + 1 }).eq('id', ext.id);
      if (error) throw error;
      return;
    }
    const { error } = await this.supabase.from('votes').insert({ survey_id: sId, question_index: qIdx, question_text: q.title, answer_text: opt.text, selected_options: [selOpt], vote_count: 1 });
    if (error) throw error;
  }

  /**
   * Triggers the database fetcher and updates the local runtime state.
   */
  async loadAllSurveys(): Promise<void> {
    const data = await this.getAll();
    this.surveys.set(data);
  }

  /**
   * Listens for new surveys added in the database.
   * When a new survey arrives, it is added to the local list.
   */
  subscribeInsert(): void {
    this.supabase
      .channel('survey-insert')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'surveys' },
        payload => {
          const list = this.surveys();
          const result = new Array(list.length + 1);
          for (let i = 0; i < list.length; i++) {
            result[i] = list[i];
          }
          result[list.length] = payload.new;
          this.surveys.set(result);
        }
      )
      .subscribe();
  }
  
  /**
   * Connects to the database stream channel targeting real-time updates.
   */
  subscribeUpdate(): void {
    this.supabase
      .channel('survey-update')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'surveys' }, payload => {
        const updated = payload.new;
        this.surveys.update(list => list.map(item => item.id === updated["id"] ? updated : item));
      })
      .subscribe();
  }

  /**
   * Subscribes to realtime vote changes and updates survey state.
   */
  subscribeVotes(): void {
    this.supabase
      .channel('votes-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votes' },
        payload => this.handleVoteChange(payload.new)
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'votes' },
        payload => this.handleVoteChange(payload.new)
      )
      .subscribe();
  }

  /**
 * Subscribes to realtime vote changes for a specific survey.
 * @param {string} id - The survey identifier.
 * @param {(votes:any[]) => void} callback - Called when votes change.
 */
  subscribeToSurveyVotes(id: string, callback: (votes: any[]) => void): void {
    this.supabase
      .channel('detail-votes-' + id)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes', filter: `survey_id=eq.${id}` },
        async () => {
          const votes = await this.getVotes(id);
          callback(votes);
        }
      )
      .subscribe();
  }
  
  /**
   * Updates the survey list when a vote changes.
   * Only the survey that belongs to the vote is replaced.
   *
   * @param vote The vote row that changed.
   */
  handleVoteChange(vote: any): void {
    const list = this.surveys();
    const result: any[] = [];

    for (let i = 0; i < list.length; i++) {
      const s = list[i];

      if (s.id === vote.survey_id) {
        const updated = {
          id: s.id,
          title: s.title,
          description: s.description,
          category: s.category,
          enddate: s.enddate,
          isfinished: s.isfinished
        };
        result.push(updated);
      } else {
        result.push(s);
      }
    }

    this.surveys.set(result);
  }
  
  /**
   * Disconnects and destroys active listener channels during component unloading.
   */
  ngOnDestroy(): void {
    this.supabase.removeAllChannels();
  }
}
