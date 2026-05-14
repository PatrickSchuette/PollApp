import { Question } from './question';

export interface Survey {
    id: string;
    title: string;
    description: string;
    category: string;
    enddate: string;
    isfinished: boolean;
}

  