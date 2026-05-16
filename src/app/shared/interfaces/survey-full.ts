/**
 * Represents a single answer option for a question.
 */
export interface Option {
    id: string;
    text: string;
    position: number;
}

/**
 * Represents a question belonging to a survey.
 */
export interface Question {
    id: string;
    title: string;
    position: number;
    allow_multiple: boolean; 
    options: Option[];
}

/**
 * Represents a full survey including questions and options.
 */
export interface SurveyFull {
    id: string;
    title: string;
    description: string;
    category: string;
    enddate: string;
    isfinished: boolean;
    questions: Question[];
}
