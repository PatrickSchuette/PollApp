import { Question } from './question';

export interface Survey {
    id: string;
    title: string;
    description?: string;
    category: string;
    endDate?: string;
    questions: Question[];
    isFinished: boolean;
}
  