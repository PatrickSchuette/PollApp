import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { SurveyFull } from '../interfaces/survey-full';
import { Survey } from '../interfaces/survey';

@Injectable({ providedIn: 'root' })
export class SurveyService {
  private supabase = inject(SupabaseService).client;

  /**
   * Loads all surveys sorted by end date.
   */
  async getAll(): Promise<Survey[]> {
    const { data, error } = await this.supabase
      .from('surveys')
      .select('*')
      .order('enddate', { ascending: true });
    if (error) throw error;
    return data as Survey[];
  }

  /**
   * Loads a survey including questions and options.
   */
  async getSurveyWithQuestions(id: string): Promise<SurveyFull | null> {
    const { data, error } = await this.supabase
      .from('surveys')
      .select(`
        id, title, description, category, enddate, isfinished,
        questions (
          id, title, position,
          options (id, text, position)
        )
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as SurveyFull;
  }

  /**
   * Creates a new survey entry.
   */
  async createSurvey(survey: any): Promise<void> {
    const { error } = await this.supabase.from('surveys').insert({
      title: survey.title,
      description: survey.description,
      category: survey.category,
      enddate: survey.enddate,
      isfinished: false
    });
    if (error) throw error;
  }

  /**
   * Loads surveys ending soon.
   */
  async getEndingSoon(): Promise<any[]> {
    const today = new Date();
    const limit = new Date();
    limit.setDate(today.getDate() + 300);
    const { data, error } = await this.supabase
      .from('surveys')
      .select('*')
      .lte('enddate', limit.toISOString().split('T')[0])
      .gte('enddate', today.toISOString().split('T')[0]);
    if (error) throw error;
    return data ?? [];
  }

  /**
   * Loads all active (unfinished) surveys.
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
   * Inserts or increments a vote for a specific answer.
   */
  async submitVote(
    surveyId: string,
    questionIndex: number,
    selectedOptions: number[]
  ): Promise<void> {

    const survey = await this.getSurveyWithQuestions(surveyId);
    const question = survey?.questions[questionIndex];
    const answer = question?.options[selectedOptions[0]];

    const { data: existing } = await this.supabase
      .from('votes')
      .select('id, vote_count')
      .eq('survey_id', surveyId)
      .eq('question_index', questionIndex)
      .eq('answer_text', answer?.text)
      .maybeSingle();

    if (existing) {
      const { error } = await this.supabase
        .from('votes')
        .update({ vote_count: existing.vote_count + 1 })
        .eq('id', existing.id);
      if (error) throw error;
      return;
    }

    const { error } = await this.supabase.from('votes').insert({
      survey_id: surveyId,
      question_index: questionIndex,
      selected_options: selectedOptions,
      question_text: question?.title ?? '',
      answer_text: answer?.text ?? '',
      vote_count: 1
    });

    if (error) throw error;
  }
  

  /**
   * Loads all votes for a survey.
   */
  async getVotes(surveyId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('votes')
      .select('*')
      .eq('survey_id', surveyId);
    if (error) throw error;
    return data ?? [];
  }

  /**
 * Loads all finished (past) surveys.
 */
  async getPastSurveys(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('surveys')
      .select('*')
      .eq('isfinished', true);
    if (error) throw error;
    return data ?? [];
  }

}
