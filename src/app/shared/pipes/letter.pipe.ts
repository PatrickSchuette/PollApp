import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'letter',
    standalone: true,
})
export class LetterPipe implements PipeTransform {

    /**
     * Converts a numeric index (0,1,2,...) into an uppercase letter (A,B,C,...).
     *
     * @param index - Zero‑based index to convert.
     * @returns Corresponding uppercase letter.
     */
    transform(index: number): string {
        return String.fromCharCode(65 + index);
    }
}
