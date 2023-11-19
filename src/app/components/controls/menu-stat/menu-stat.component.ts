import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { WebSharkDataService } from '@app/services/web-shark-data.service';
import { ModalResizableService } from '../modal-resizable/modal-resizable.service';

@Component({
  selector: 'app-menu-stat',
  templateUrl: './menu-stat.component.html',
  styleUrls: ['./menu-stat.component.scss']
})
export class MenuStatComponent implements OnInit {
  menuTreeIndex: any;
  menuTree: any;
  constructor(
    private webSharkDataService: WebSharkDataService,
    private modalResizableService: ModalResizableService,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    const d = await this.initMenu();
  }
  public onMenuClick(link: string, name: string) {
    this.modalResizableService.open({ link, name });
    this.cdr.detectChanges();
  }

  async initMenu() {
    try {
      this.menuTreeIndex = [];
      // console.log('MENU:ngOnInit()')
      const info = await this.webSharkDataService.getInfo();
      const {
        stats, nstat, convs,
        seqa, taps, eo,
        srt, rtd
      } = info;

      const menuCollection = [
        { name: 'Endpoints', children: [...convs] },
        { name: 'Response Time', children: [...srt, ...rtd] },
        { name: 'Statistics', children: [...stats, ...nstat] },
        { name: 'Export Objects', children: [...eo] },
        { name: 'Misc', children: [...taps, ...seqa] }
      ];
      this.menuTree = menuCollection;

      // console.log('menu', { menuCollection, menuTree: this.menuTree });
      this.cdr.detectChanges();
    } catch (err) {
      this.menuTree = [];
      console.error(err);
    }
  }
}
