import { Injectable } from '@angular/core';
import { hash } from '@app/helper/functions';
import { BehaviorSubject, Observable } from 'rxjs';


class StaticData {
  static captureFile: string = '';
  static filter: string = '';
}

@Injectable({
  providedIn: 'root'
})
export class WiregasmService {
  bs: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  worker: any;


  _Frames: any;
  _frame1: any;


  private url = ''//`${environment.apiUrl}json`;
  private urlUpload = ''//`${environment.apiUrl}upload`;

  private behavior = new BehaviorSubject({})
  public updates: BehaviorSubject<any> = new BehaviorSubject({});

  public blobFile: Blob = new Blob([]);

  constructor() {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(new URL('./../wiregasm.worker', import.meta.url));
      this.worker.onmessage = async ({ data }: { data: any }) => {
        if (typeof data === 'object' && data?.type === 'processed') {
          this._Frames = data.data.table;
          this._frame1 = data.data.frame1;

          this.updates.next(data);
        }
        this.bs.next(data);
      };
    }
  }
  listen(): Observable<any> {
    return this.bs.asObservable();
  }
  async send(data: string) {
    this.worker.postMessage(data);
  }


  // private params(method: string, paramObj: any): string {
  //   const param: any = Object.assign({
  //     method,
  //     capture: this.getCapture()
  //   }, paramObj);
  //   if (StaticData.filter && method != 'frame') {
  //     param.filter = StaticData.filter;
  //   }
  //   return Object.entries(param).map(
  //     ([key, value]: any[]) =>
  //       `${key}=${encodeURIComponent(value)}`
  //   ).join('&');
  // }
  public setFilter(filter: string) {
    console.warn('setFilter', filter)
    // 'filter='+encodeURIComponent(`sip.Via.received == "195.138.93.233"`)
    StaticData.filter = filter;
    this.behavior.next({});
  }
  public getFilter(): string {
    console.warn('getFilter', StaticData.filter)
    return StaticData.filter;
  }
  public setCaptureFile(fileName: string) {
    console.warn('setCaptureFile', fileName)
    StaticData.captureFile = fileName;
    location.hash = '#' + hash(fileName);
    this.behavior.next({});
  }

  public getCapture(): string {
    console.warn('getCapture', StaticData.captureFile)
    return StaticData.captureFile;
  }
  // private getBufferGate<T>(url: string): Observable<any> {
  //   const bufferIndex = hash(url);
  //   if (BufferData.data[bufferIndex]) {
  //     return new Observable(observer => {
  //       observer.next(BufferData.data[bufferIndex]);
  //       observer.complete();
  //     });
  //   }
  //   return this.http.get<T>(url).pipe(map(data => {
  //     BufferData.data[bufferIndex] = data;
  //     return data;
  //   }));
  // }
  getBLOB(url: string): Observable<any> {
    console.warn('getBLOB', url)
    return new Observable((observe) => {
      observe.next({});
      observe.complete();
    })
    // return this.http.get(url, { responseType: 'blob' });
  }
  private httpGet(command: string, params: any = null): Promise<any> {
    console.warn('httpGet', command, params)
    return new Promise((reason, reject) => {
      reason({})
    })

    // if (typeof params === 'string') {
    //   return this.getBufferGate<any>(`${this.url}?method=${command}&${params}`).toPromise();
    // }
    // if (!this.getCapture()) {
    //   return new Promise((reason, reject) => {
    //     reject({ error: 'Capture file is unset!' });
    //   })
    // }
    // const strParams = params ? this.params(command, params) : 'method=' + command;
    // return this.getBufferGate<any>(`${this.url}?${strParams}`).toPromise();
  }

  getInfo(): Promise<any> {
    return this.httpGet('info');
  }

  getFiles(dir: string = ''): Promise<any> {
    console.warn('getFiles', dir)
    return new Promise((reason, reject) => {
      reason({
        files: [], //[{ name: 'test.pcap', bytes: 1 }]
      })
    })

    // return this.httpGet('files', dir && 'dir=' + encodeURIComponent('/' + dir));
  }

  getFrames(limit = 120): Promise<any> {
    console.warn('getFrames', limit)

    return new Promise((reason, reject) => {
      if (this._Frames) {
        reason(this._Frames);
      } else {
        reject({ msg: 'no data' });
      }
    })

    // if (limit === 0) {
    //   return this.httpGet('frames', {});
    // }
    // return this.httpGet('frames', { limit });
  }

  getFrameData(frameId: number): Promise<any> {
    console.warn('getFrameData', frameId)
    // this._frame1
    return new Promise((reason, reject) => {
      this.worker.postMessage({ type: "getFrame", frameId })
      this.worker.onmessage = (data: any) => {
        console.log('getFrameData', { data })
        reason(data.data.data.frame1);
      }
    })
    // const params: any = {
    //   bytes: 'yes',
    //   proto: 'yes',
    //   frame: frameId
    // }
    // if (frameId - 1) {
    //   params.prev_frame = frameId - 1;
    // }
    // return this.httpGet('frame', params);

  }
  getTapJson(tapID: string): Promise<any> {
    console.warn('getTapJson', tapID)
    return this.httpGet('tap', { tap0: tapID })
  }
  getMp3LinkByRowData(rtpData: any): string {
    console.warn('getMp3LinkByRowData', rtpData)
    // const { saddr, sport, daddr, dport, ssrc } = rtpData;
    // const token = 'rtp:' + [
    //   saddr, sport, daddr, dport,
    //   ssrc.toString(16)
    // ].join('_');
    // const strParams = this.params('download', { token });
    return ''//`${this.url}?${strParams}`
  }
  getRTPStreamTap(rtpData: any): Promise<any> {
    console.warn('getRTPStreamTap', rtpData)
    const { saddr, sport, daddr, dport, ssrc } = rtpData;
    const tap0 = 'rtp-analyse:' + [
      saddr, sport, daddr, dport,
      ssrc.toString(16)
    ].join('_');

    return this.httpGet('tap', { tap0 });
    /**
     * data = {
        "ssrc":1289913356,
        "payload":"g711A",
        "saddr":"10.0.131.72",
        "sport":5010,
        "daddr":"10.0.131.70",
        "dport":5014,
        "pkts":555,
        "max_delta":23.220000,
        "max_jitter":2.800501,
        "mean_jitter":2.687978,
        "expectednr":555,
        "totalnr":555,
        "problem":false,
        "ipver":4
      }
     */
  }
  postFile(fileToUpload: File, isDataTimeNow: any): Observable<any> {
    console.warn('postFile', fileToUpload)

    const reader = new FileReader();
    reader.onload =  (e: any) => {
      const arrayBuffer: any = e.target.result;
      // Создаем Blob из ArrayBuffer
      const blob = new Blob([arrayBuffer], { type: fileToUpload.type });
      // Теперь переменная blob содержит бинарные данные файла
      this.blobFile = blob;

    };
    reader.readAsArrayBuffer(fileToUpload);


    return new Observable((observe) => {
      // worker.postMessage({ type: "process", file: file });
      this.worker.postMessage({ type: "process", file: fileToUpload })
      observe.next({});
      observe.complete();
    })
    // const formData: FormData = new FormData();
    // formData.append('fileKey', fileToUpload, fileToUpload.name);
    // const url = isDataTimeNow ? this.urlUpload + '/now' : this.urlUpload;

    // return this.http.post(url, formData).pipe(map(() => {
    //   this.setCaptureFile(fileToUpload.name);
    //   this.behavior.next({ cm: 'uploaded' });
    // }));
  }
}
