import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SurveyService } from '../../shared/services/survey.service';
import { LetterPipe } from '../../shared/pipes/letter.pipe';
import { signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-survey-detail',
  standalone: true,
  templateUrl: './survey-detail.html',
  styleUrls: ['./survey-detail.scss'],
  imports: [LetterPipe],
})
export class SurveyDetailComponent {

  showSuccess = signal(false);

  answers = signal<{ [questionIndex: number]: number[] }>({});

  private route = inject(ActivatedRoute);
  private surveyService = inject(SurveyService);
  private router = inject(Router);
  survey = this.surveyService.getSurveyById(
    this.route.snapshot.paramMap.get('id')!
  );

  toggleAnswer(qIndex: number, aIndex: number, allowMultiple: boolean) {
    const current = this.answers()[qIndex] ?? [];

    if (allowMultiple) {
      const updated = current.includes(aIndex)
        ? current.filter(i => i !== aIndex)
        : [...current, aIndex];

      this.answers.update(a => ({ ...a, [qIndex]: updated }));
    } else {
      this.answers.update(a => ({ ...a, [qIndex]: [aIndex] }));
    }
  }
  
  /**
   * Completes the survey, shows success dialog, updates results and redirects.
   */
  completeSurvey(): void {
    this.showSuccess.set(true);

    // Ergebnisse aktualisieren (Demo: einfach nur neu laden)
    this.surveyService.recalculateResults(this.survey!.id, this.answers());

    setTimeout(() => {
      this.showSuccess.set(false);
      this.router.navigate(['/']);
    }, 1500);
  }
  
  goToCreateSurvey(): void {
    this.router.navigate(['/create']);
  }

}
