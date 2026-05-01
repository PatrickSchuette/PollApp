import { Answer } from './answer';

export interface Question {
    id: string;
    text: string;
    allowMultiple: boolean;
    answers: Answer[];
}
  