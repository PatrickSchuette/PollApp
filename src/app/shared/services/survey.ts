import { Injectable, signal } from '@angular/core';
import { Survey } from '../interfaces/survey';

@Injectable({
  providedIn: 'root',
})
export class SurveyService {
  surveys = signal<Survey[]>([]);

  addSurvey(survey: Survey) {
    this.surveys.update(list => [...list, survey]);
  }

  getActiveSurveys() {
    return this.surveys().filter(s => !s.isFinished);
  }

  getPastSurveys() {
    return this.surveys().filter(s => s.isFinished);
  }

  getEndingSoon() {
    return this.surveys()
      .filter(s => !s.isFinished && s.endDate)
      .sort((a, b) => new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime())
      .slice(0, 3);
  }

  getSurveyById(id: string) {
    return this.surveys().find(s => s.id === id);
  }
}
