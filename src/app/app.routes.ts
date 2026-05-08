import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
    },
    {
        path: 'create',
        loadComponent: () =>
            import('./features/create-survey/create-survey').then(
                m => m.CreateSurveyComponent
            ),
    },
    {
        path: 'survey/:id',
        loadComponent: () =>
            import('./features/survey-detail/survey-detail').then(m => m.SurveyDetailComponent)
    }

];
