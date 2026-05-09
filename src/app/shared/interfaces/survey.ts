import { Question } from './question';

export interface Survey {
    id: string;
    title: string;
    description: string;
    category: string;
    endDate: string;
    questions: {
        text: string;
        allowMultiple: boolean;
        answers: string[];
    }[];
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
  