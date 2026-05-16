import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class SurveyService {
  private supabase = inject(SupabaseService).client;

  /** Loads all surveys sorted by end date. */
  async getAll(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('surveys')
      .select('*')
      .order('enddate', { ascending: true });
    if (error) throw error;
    return data ?? [];
  }

  /** Loads surveys ending soon. */
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

  /** Loads all active (unfinished) surveys. */
  async getActiveSurveys(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('surveys')
      .select('*')
      .eq('isfinished', false);
    if (error) throw error;
    return data ?? [];
  }

  /** Loads all finished (past) surveys. */
  async getPastSurveys(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('surveys')
      .select('*')
      .eq('isfinished', true);
    if (error) throw error;
    return data ?? [];
  }

  /**
   * Loads a survey including its questions and answer options.
   *
   * @param id - ID of the survey to load.
   */
  async getSurveyWithQuestions(id: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('surveys')
      .select(`
        id, title, description, category, enddate, isfinished,
        questions (
          id, title, position, allow_multiple,
          options (id, text, position)
        )
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  /**
   * Creates a full survey including questions and answer options.
   *
   * @param draft - Survey draft from the UI.
   */
  async createSurvey(draft: any): Promise<any> {
    const survey = await this.insertSurvey(draft);
    await this.insertQuestions(survey.id, draft.questions);
    return survey;
  }
 

  /**
   * Inserts the survey and returns the created row.
   *
   * @param draft - Survey draft with metadata.
   */
  private async insertSurvey(draft: any): Promise<any> {
    const payload = {
      title: draft.title,
      description: draft.description,
      category: draft.category,
      enddate: draft.enddate || null,
      isfinished: false
    };
    const { data, error } = await this.supabase
      .from('surveys')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  /**
   * Inserts all questions for a survey.
   *
   * @param surveyId - ID of the parent survey.
   * @param questions - Array of question objects.
   */
  private async insertQuestions(
    surveyId: string,
    questions: any[]
  ): Promise<void> {
    for (let i = 0; i < questions.length; i++) {
      const q = await this.insertQuestion(surveyId, questions[i], i);
      await this.insertOptions(q.id, questions[i].answers);
    }
  }

  /**
   * Inserts a single question and returns the created row.
   *
   * @param surveyId - Parent survey ID.
   * @param q - Question object.
   * @param index - Position of the question.
   */
  private async insertQuestion(
    surveyId: string,
    q: any,
    index: number
  ): Promise<any> {
    const payload = {
      survey_id: surveyId,
      title: q.text,
      position: index,
      allow_multiple: q.allowMultiple
    };
    const { data, error } = await this.supabase
      .from('questions')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  /**
   * Inserts all answer options for a question.
   *
   * @param questionId - ID of the parent question.
   * @param answers - Array of answer strings.
   */
  private async insertOptions(
    questionId: string,
    answers: string[]
  ): Promise<void> {
    for (let i = 0; i < answers.length; i++) {
      await this.insertOption(questionId, answers[i], i);
    }
  }

  /**
   * Inserts a single answer option.
   *
   * @param questionId - Parent question ID.
   * @param text - Answer text.
   * @param index - Position of the answer.
   */
  private async insertOption(
    questionId: string,
    text: string,
    index: number
  ): Promise<void> {
    const payload = { question_id: questionId, text, position: index };
    const { error } = await this.supabase.from('options').insert(payload);
    if (error) throw error;
  }

  /**
   * Loads all votes for a survey.
   *
   * @param id - Survey ID.
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
 * Inserts or increments a vote for a single selected option.
 *
 * @param surveyId - Survey ID.
 * @param questionIndex - Index of the question.
 * @param selectedOption - Index of the selected option.
 */
  async submitVote(
    surveyId: string,
    questionIndex: number,
    selectedOption: number
  ): Promise<void> {

    const survey: any = await this.getSurveyWithQuestions(surveyId);
    const question: any = survey.questions[questionIndex];
    const option: any = question.options[selectedOption];

    const { data: existing } = await this.supabase
      .from('votes')
      .select('id, vote_count')
      .eq('survey_id', surveyId)
      .eq('question_index', questionIndex)
      .eq('answer_text', option.text)
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
      question_text: question.title,
      answer_text: option.text,
      selected_options: [selectedOption],
      vote_count: 1
    });

    if (error) throw error;
  }

}
