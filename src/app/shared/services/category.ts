import { Injectable, signal } from '@angular/core';
import { Category } from '../interfaces/category';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  categories = signal<Category[]>([
    { id: 'team', label: 'Team Activities' },
    { id: 'health', label: 'Health & Wellness' },
    { id: 'gaming', label: 'Gaming & Entertainment' },
    { id: 'education', label: 'Education & Learning' },
    { id: 'lifestyle', label: 'Lifestyle & Preferences' },
    { id: 'tech', label: 'Technology & Innovation' }
  ]);
}
