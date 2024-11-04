import { Component, Inject } from '@angular/core';
import { WiregasmService } from './services/wiregasm.service';
@Component({
  selector: 'app-root',
  template: `
  <div class="init-status-wrapper" [ngClass]="{ready: isReady}" [hidden]="done">
  <div class="init-status">
    <h1><strong>

      Wiregasm:
    </strong>
  </h1>
    <div *ngFor="let item of msg">{{item}}</div>
  </div>
  </div>
  <router-outlet></router-outlet>`,
  styles: [`
  .init-status-wrapper {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right:0;
    z-index: 999;
    backdrop-filter: blur(10px);
    transition: all 0.6s;
  }
  .init-status-wrapper.ready {
    backdrop-filter: blur(0px);
  }
  .init-status {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right:0;
    margin: auto;
    width: 400px;
    min-height: 50px;
    height: 400px;
    padding: 2rem;
    z-index: 999;
    background-color: rgba(255,255,255,0.9);
    box-shadow: 0 0 15px #bbb;
  }
  .init-status > div {
    text-align: left;
    font-size: 16pt;
    height: 50px;
  }
  `]
})
export class AppComponent {
  msg: string[] = [];
  done = false;
  isReady = false;
  constructor(private wiregasmService: WiregasmService) {
    this.wiregasmService.listen().subscribe(data => {
      console.log('wiregasmService.listen', data);
      if(data?.status) {
        this.msg.push(data.status)
      }
      if (data?.type === 'init') {
        this.isReady = true;
        setTimeout(() => {

          this.done = true;
        }, 1000)
      }
    })
  }

}
