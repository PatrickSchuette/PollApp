import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'letter',
    standalone: true,
})
export class LetterPipe implements PipeTransform {
    transform(index: number): string {
        return String.fromCharCode(65 + index);
    }
}
