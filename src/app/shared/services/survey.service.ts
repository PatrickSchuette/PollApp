import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { SurveyFull } from '../interfaces/survey-full';
import { Survey } from '../interfaces/survey';

@Injectable({ providedIn: 'root' })
export class SurveyService {
  private supabase = inject(SupabaseService).client;

  async getAll(): Promise<Survey[]> {
    const { data, error } = await this.supabase
      .from('surveys')
      .select('*')
      .order('enddate', { ascending: true });

    if (error) throw error;
    return data as Survey[];
  }

  async getSurveyWithQuestions(id: string): Promise<SurveyFull | null> {
    const { data, error } = await this.supabase
      .from('surveys')
      .select(`
        id,
        title,
        description,
        category,
        enddate,
        isfinished,
        questions (
          id,
          title,
          position,
          options (
            id,
            text,
            position
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as SurveyFull;
  }

  async createSurvey(survey: any): Promise<void> {
    const { error } = await this.supabase
      .from('surveys')
      .insert({
        title: survey.title,
        description: survey.description,
        category: survey.category,
        enddate: survey.enddate,
        isfinished: false
      });

    if (error) throw error;
  }

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

  async getActiveSurveys(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('surveys')
      .select('*')
      .eq('isfinished', false);

    if (error) throw error;
    return data ?? [];
  }

  async getPastSurveys(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('surveys')
      .select('*')
      .eq('isfinished', true);

    if (error) throw error;
    return data ?? [];
  }
}
