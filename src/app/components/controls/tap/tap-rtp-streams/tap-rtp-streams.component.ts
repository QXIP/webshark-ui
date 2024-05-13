import { toBlobURL } from '@ffmpeg/util';
import { WebSharkDataService } from '@app/services/web-shark-data.service';
import { Component, Input, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { hash } from '@app/helper/functions';
import WaveSurfer from 'wavesurfer.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline';

declare const transcode: Function;
const DATA_TYPE = 'application/octet-stream';
@Component({
  selector: 'tap-rtp-streams',
  templateUrl: './tap-rtp-streams.component.html',
  styleUrls: ['./tap-rtp-streams.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TapRtpStreamsComponent implements OnInit {
  _data: any;
  columns: any;
  streams: any[] = [];
  selectedStreams: any;
  selectedColumns: any;

  players: any[] = [];
  optionsAudioContainer = {
    // waveColor: '#D2EDD4',
    normalize: true,
    progressColor: 'green',
    responsive: true,
    minPxPerSec: 100,

  }

  @Input() set data(val: any) {
    this._data = val;
    this.streams = val.streams || [];
    const [stream] = this.streams || [];
    this.columns = Object.keys(stream || []);
  }
  get data(): any {
    return this._data;
  }
  isReady = false;
  progressMessage = ['Initialization'];
  audioStreamsBlobURL: any[] = [];

  constructor(
    private webSharkDataService: WebSharkDataService,
    private cdr: ChangeDetectorRef
  ) { }

  get captureFile() {
    return this.webSharkDataService.getCapture();
  }
  getKeys(obj: any) {
    return Object.keys(obj).filter(i => i !== '__selected');
  }
  async getFileArrayOfUint8Array(filename: string) {
    const href = encodeURIComponent('/' + filename);
    const url = `/webshark/json?method=download&capture=${href}&token=self`;
    const { body } = await fetch(url);
    const reader = body?.getReader();
    if (!reader) {
      console.error(new Error('Could not get file'));
      return new Blob([], { type: DATA_TYPE });
    }
    let isDone = false;
    const collectArrayData = [];

    while (!isDone) {
      const { value, done } = await reader.read();
      if (value) {
        collectArrayData.push(value);
      }
      isDone = done;
    }

    // console.log({ collectArrayData });
    return new Blob(collectArrayData, { type: DATA_TYPE });

  }
  // blobSaveAsFile(blobUrl: string, filename: string) {
  //   var link = document.createElement("a"); // Or maybe get it from the current document
  //   link.href = blobUrl;
  //   link.download = filename;
  //   link.innerHTML = "Click here to download the file";
  //   document.body.appendChild(link);
  // }
  /**
   * parse PCAP to rtp-strems binnary data
   *  FFMPEG
   */
  async ffmpegDecoder() {
    this.progressMessage.push(`Reading data from ${this.captureFile} file`);
    this.cdr.detectChanges();
    const blobData: Blob = await this.getFileArrayOfUint8Array(this.captureFile);
    // console.log(this.captureFile, { blobData });
    // const blobUrl = await transcode(blobData);
    // console.log(blobUrl)

    this.progressMessage.push('Separate PCAP to frames');
    this.cdr.detectChanges();

    const index = await this.webSharkDataService.getFrames(0);
    let offset = 24;
    const arrOffset = index.map((i: any, k: number, arr: any[]) => {
      if (k > 0) {
        offset += +arr[k - 1].c[5];
      }
      offset += 16;
      return [offset, ...i.c, blobData.slice(offset, offset + +i.c[5], DATA_TYPE)];
    })
    // console.log(arrOffset);
    this.progressMessage.push('Collect payload binary to streams')
    this.cdr.detectChanges();
    // rtp-streams
    const { taps: [{ streams: rtpStreams }] } = await this.webSharkDataService.getTapJson('rtp-streams');
    // console.log(rtpStreams);

    const arr = rtpStreams.map((streamData: any) => {
      return {
        ssrc: streamData.ssrc,
        data: streamData,
        blob: new Blob(arrOffset
          .filter((frame: any) => frame[7].toUpperCase().includes(`SSRC=${streamData.ssrc.toUpperCase()}`))
          .map((i: any) => (i[8] as Blob).slice(54)), { type: DATA_TYPE })
      };
    })
    // console.log({ arr })
    const codecDictionary: any = {
      'g711a': 'alaw',
      'g711u': 'mulaw',
      'g722': 'g722',
    };
    const out: any[] = [];
    for (let item of arr) {
      // console.log('<>>>>', item.data);

      const codec = codecDictionary[(item.data.payload + '').toLowerCase()] || 'g722';
      // console.log('<>>>>', {codec});

      // const i = arr[0];
      this.progressMessage.push(`FFmpeg:: converting ${item.ssrc} stream to audio (mp3)`);
      this.cdr.detectChanges();
      const blobUrl = await transcode(item.blob, codec, `audio-${item.ssrc}.mp3`);
      // console.log(blobUrl)

      out.push({ ssrc: item.ssrc, blobUrl });
      // this.blobSaveAsFile(blobUrl, `audio-${item.ssrc}.mp3`);
    }

    return out;
  }
  getPlayer(rec: any) {
    /**
     * rec: { id, mp3, player }
     */
    if (!rec.player) {
      try {
        const player = WaveSurfer.create({
          ...this.optionsAudioContainer,
          container: '#' + (rec.id || 'audio-player'),
          plugins: [TimelinePlugin.create({
            /** The duration of the timeline in seconds, defaults to wavesurfer's duration */
            // duration: 1,
            /** Interval between ticks in seconds */
            timeInterval: 0.1,
            /** Interval between numeric labels in seconds */
            primaryLabelInterval: 1,
            /** Interval between secondary numeric labels in seconds */
            // secondaryLabelInterval: 8,
          })]

        });
        if (rec.mp3) {
          // this.webSharkDataService.getBLOB(rec.mp3).subscribe((data: any) => {
          // const data = {}
          // console.log({ data })
          // if (!data || data.size === 0) {
          //   rec.noData = true;
          //   this.cdr.detectChanges();
          // } else {
          player.load(rec.mp3);
          player.on('ready', () => {
            player.zoom(1);
            player.on('audioprocess', (event: any) => {
              /**
               * needs to sync the playback with table stream data
               */
              // console.log(event);
              this.cdr.detectChanges();
            });
            this.cdr.detectChanges();
          });
          // }
          // });
        } else {
          rec.noData = true;
          this.cdr.detectChanges();
        }
        rec.player = player;


      } catch (err) {
        console.log(err, rec);
      }
    }
    return rec;

  }
  async ngOnInit() {

    this.audioStreamsBlobURL = await this.ffmpegDecoder();
    this.progressMessage.push('done.');
    this.cdr.detectChanges();
    requestAnimationFrame(() => {

      this.isReady = true;
      this.cdr.detectChanges();
    })

  }
  onClosePlayer(idx: any) {
    // console.log({idx})
    this.players = this.players.filter((i, k) => k !== idx);
    this.cdr.detectChanges();
  }
  async rowClick({ row }: any) {
    // this.streams
    console.log(this.streams, { row });

    const id = `player-${hash(JSON.stringify(row))}`;
    let playerElement = this.players.find(p => p.id === id);
    if (!playerElement) {
      const rowData = await this.webSharkDataService.getRTPStreamTap(row);
      // const mp3link = this.webSharkDataService.getMp3LinkByRowData(row);
      const { taps: [{ ssrc }] } = rowData;
      // console.log(this.audioStreamsBlobURL, { rowData })

      playerElement = {
        id,
        mp3: this.audioStreamsBlobURL.find(i => i.ssrc.toUpperCase() === ssrc.toUpperCase())?.blobUrl,
        rowData,
      };

      requestAnimationFrame(() => {
        playerElement = this.getPlayer(playerElement);
        this.cdr.detectChanges();
      });
      this.players.push(playerElement);
    }
    playerElement.hide = false;
    this.setRecActive({ id });
  }
  setRecActive({ id }: any) {
    this.players.forEach(p => p.isActive = p.id === id);
    let playerElement = this.players.find(p => p.id === id);
    const [tap]: any = playerElement.rowData?.taps || [];
    this.selectedStreams = tap?.items || [];
    const [item] = this.selectedStreams;
    this.selectedColumns = ["bw", "d", "f", "j", "mark", "o", "s", "sk", "sn", "t"]; // Object.keys(item);

    this.cdr.detectChanges();
  }
  playItemClick(event: any) {
    console.log({ event });
  }
  onZoomAudio(event: any, player: any) {
    // console.log(event.wheelDelta);
    if (!player._myZoom) {
      player._myZoom = 1;
    }
    player._myZoom += event.wheelDelta / 12
    player._myZoom = Math.max(1, player._myZoom);
    player.zoom(player._myZoom);
    this.cdr.detectChanges();

  }
  seekAndCenter(player: any, step = 0.1) {
    if (!player) {
      return;
    }
    const duration = player.getDuration();
    const position = player.getCurrentTime();
    const percent = position / duration;
    const out = Math.min(Math.max(0, percent + step), 1);
    player.seekAndCenter(out);
    this.cdr.detectChanges();

  }
  closeRec({ id }: any) {
    const item = this.players.find(p => p.id === id);
    item.hide = true;
    console.log({ id, item }, this.players)
    this.cdr.detectChanges();
  }
}
