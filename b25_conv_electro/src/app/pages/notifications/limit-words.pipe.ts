import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'limitWords',
})
export class LimitWordsPipe implements PipeTransform {
  transform(text: string | null | undefined, limit: number): string {
    if (!text) return '';
    const words = text.split(' ');
    return words.length > limit
      ? words.slice(0, limit).join(' ') + '...'
      : text;
  }
}
