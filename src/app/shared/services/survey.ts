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
    return this.surveys().filter(s => !s.isfinished);
  }

  getPastSurveys() {
    return this.surveys().filter(s => s.isfinished);
  }

  getEndingSoon() {
    return this.surveys()
      .filter(s => !s.isfinished && s.enddate)
      .sort((a, b) => new Date(a.enddate!).getTime() - new Date(b.enddate!).getTime())
      .slice(0, 3);
  }

  getSurveyById(id: string) {
    return this.surveys().find(s => s.id === id);
  }
}
