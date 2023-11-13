import { WebSharkDataService } from '@app/services/web-shark-data.service';
import { Component, Input } from '@angular/core';
@Component({
  selector: 'tap-page',
  templateUrl: './tap-page.component.html',
  styleUrls: ['./tap-page.component.scss']
})
export class TapPageComponent {
  public loading = false;
  public title: string = '';
  public jsonData: any = null;
  public type: string = '';

  @Input() set taplink(link: string) {
    this.loading = true;
    this.initData(link);
  }
  constructor(
    private webSharkDataService: WebSharkDataService
  ) { }

  async initData(link: string) {
    const data = await this.webSharkDataService.getTapJson(link);
    const [tapData] = data?.taps || [];
    this.jsonData = tapData;
    const { name, proto, type } = tapData || {};
    this.title = (name || proto || '') + (type ? ` [${type}]` : '');
    this.type = type;
    this.loading = false;
  }

}
