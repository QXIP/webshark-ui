import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'html'
})
export class HtmlPipe implements PipeTransform {

    constructor(private sanitizer: DomSanitizer) { }

    public transform(value: unknown): string {
        const html = value == null ? '' : String(value);
        return this.sanitizer.sanitize(SecurityContext.HTML, html) ?? '';
    }

}
