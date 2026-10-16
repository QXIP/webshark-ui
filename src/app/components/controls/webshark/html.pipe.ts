import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'html'
})
export class HtmlPipe implements PipeTransform {

    constructor(private sanitizer: DomSanitizer) { }

    /** Trusts markup produced by highlight(); user text must be escaped before calling. */
    public transform(value: unknown): SafeHtml {
        const html = value == null ? '' : String(value);
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }

}
