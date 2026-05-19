import { Component, Input } from '@angular/core';
import { LetterPipe } from '../../shared/pipes/letter.pipe';
import { JsonPipe } from '@angular/common';

@Component({
    selector: 'app-survey-results',
    standalone: true,
    templateUrl: './survey-results.html',
    styleUrls: ['./survey-results.scss'],
    imports: [LetterPipe, JsonPipe]
})
export class SurveyResultsComponent {

    @Input() results: any[] = [];
    @Input() hasVotes = false;

    /**
     * Returns true if results should be displayed.
     */
    isVisible(): boolean {
        return this.hasVotes && this.results.length > 0;
    }
}
