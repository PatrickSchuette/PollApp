import { Question } from './question';

export interface Survey {
    id: string;
    title: string;
    description: string;
    category: string;
    endDate: string;
    questions: Question[];
    isFinished: boolean;

    results?: {
        questionIndex: number;
        question: string;
        options: {
            label: string;
            percent: number;
        }[];
    }[];
}
  