import { Injectable, signal } from '@angular/core';
import { Survey } from '../interfaces/survey';

@Injectable({ providedIn: 'root' })
export class SurveyService {
    private _surveys = signal<Survey[]>([
        {
            id: '1',
            title: 'Team Event Feedback',
            description: 'How did you like the last team event?',
            category: 'Team',
            endDate: '2026-05-10',
            questions: [],
            isFinished: false,
        },
        {
            id: '2',
            title: 'Workplace Culture Survey',
            description: 'Help us improve our company culture.',
            category: 'Work',
            endDate: '2026-05-05',
            questions: [],
            isFinished: false,
        },
        {
            id: '3',
            title: 'Cafeteria Menu Voting',
            description: 'Vote for next week’s cafeteria meals.',
            category: 'Food',
            endDate: '2026-05-03',
            questions: [],
            isFinished: false,
        }
    ]);      

    surveys = this._surveys.asReadonly();

    getEndingSoon() {
        return this._surveys()
            .filter(s => !s.isFinished)
            .sort((a, b) => new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime())
            .slice(0, 3);
    }

    getActiveSurveys() {
        return this._surveys().filter(s => !s.isFinished);
    }

    getPastSurveys() {
        return this._surveys().filter(s => s.isFinished);
    }

    /**
 * Creates a new survey and adds it to the signal state.
 * @param draft Partial survey data from the create form
 * @returns The newly created survey
 */
    createSurvey(draft: any) {
        const newSurvey = {
            id: crypto.randomUUID(),
            title: draft.title,
            description: draft.description,
            category: draft.category,
            endDate: draft.endDate,
            questions: draft.questions,
            isFinished: false
        };

        this._surveys.update(list => [...list, newSurvey]);
        return newSurvey;
    }

      
}
