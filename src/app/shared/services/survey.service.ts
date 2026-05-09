import { Injectable, signal } from '@angular/core';
import { Survey } from '../interfaces/survey';
import { LetterPipe } from '../pipes/letter.pipe';

@Injectable({ providedIn: 'root' })
export class SurveyService {
    private _surveys = signal<Survey[]>([
        {
            id: '1',
            title: 'Team Event Feedback',
            description: 'Help us plan the next team event by sharing your preferences.',
            category: 'Team',
            endDate: '2026-05-10',
            isFinished: false,
            questions: [
                {
                    text: 'Which date would work best for you?',
                    allowMultiple: true,
                    answers: [
                        '19.09.2025, Friday',
                        '10.10.2025, Friday',
                        '11.10.2025, Saturday',
                        '31.10.2025, Friday'
                    ]
                },
                {
                    text: 'Choose the activities you prefer',
                    allowMultiple: true,
                    answers: [
                        'Outdoor adventure like kayaking',
                        'Office Costume Party',
                        'Bowling, mini-golf, volleyball',
                        'Beach party, Music & cocktails',
                        'Escape room'
                    ]
                },
                {
                    text: 'Do you want food?',
                    allowMultiple: false,
                    answers: [
                        'Yes',
                        'No'
                    ]
                }
            ],
            results: [
                {
                    questionIndex: 0,
                    question: 'Which date would work best for you?',
                    options: [
                        { label: 'A', percent: 27 },
                        { label: 'B', percent: 44 },
                        { label: 'C', percent: 3 },
                        { label: 'D', percent: 26 }
                    ]
                },
                {
                    questionIndex: 1,
                    question: 'Choose the activities you prefer',
                    options: [
                        { label: 'A', percent: 60 },
                        { label: 'B', percent: 0 },
                        { label: 'C', percent: 14 },
                        { label: 'D', percent: 26 },
                        { label: 'E', percent: 0 }
                    ]
                }
            ]
        },

        {
            id: '2',
            title: 'Workplace Culture Survey',
            description: 'Help us improve our company culture.',
            category: 'Work',
            endDate: '2026-05-05',
            isFinished: false,
            questions: [
                {
                    text: 'How satisfied are you with communication in the team?',
                    allowMultiple: false,
                    answers: ['Very satisfied', 'Satisfied', 'Neutral', 'Unsatisfied']
                }
            ],
            results: [] // keine Antworten → rechte Seite zeigt "There are no answers yet."
        },

        {
            id: '3',
            title: 'Cafeteria Menu Voting',
            description: 'Vote for next week’s cafeteria meals.',
            category: 'Food',
            endDate: '2026-05-03',
            isFinished: false,
            questions: [
                {
                    text: 'Which meal should be added next week?',
                    allowMultiple: false,
                    answers: ['Pasta', 'Salad Bowl', 'Burger', 'Vegan Curry']
                }
            ],
            results: [
                {
                    questionIndex: 0,
                    question: 'Which meal should be added next week?',
                    options: [
                        { label: 'A', percent: 12 },
                        { label: 'B', percent: 48 },
                        { label: 'C', percent: 30 },
                        { label: 'D', percent: 10 }
                    ]
                }
            ]
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

    /**
     * Returns a survey by ID.
     */
    getSurveyById(id: string) {
        return this._surveys().find(s => s.id === id) ?? null;
    }

    /**
 * Recalculates results based on user answers.
 */
    recalculateResults(id: string, answers: { [q: number]: number[] }) {
        this._surveys.update(list =>
            list.map(s => {
                if (s.id !== id) return s;

                const results = s.questions.map((q, qi) => {
                    const total = answers[qi]?.length ?? 0;

                    return {
                        questionIndex: qi,
                        question: q.text,
                        options: q.answers.map((_, ai) => ({
                            label: String.fromCharCode(65 + ai),
                            percent: total > 0
                                ? Math.round(
                                    ((answers[qi] ?? []).filter(a => a === ai).length / total) * 100
                                )
                                : 0
                        }))
                    };
                });

                return { ...s, results };
            })
        );
    }


}
