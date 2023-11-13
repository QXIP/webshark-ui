import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { AngularSplitModule } from 'angular-split';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TapRtpStreamsComponent } from './tap-rtp-streams.component';
import { CustomTableModule } from '../../custom-table/custom-table.module';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NoDataModule } from '../../no-data/no-data.module';

@NgModule({
  imports: [
    CommonModule,
    CustomTableModule,
    AngularSplitModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    ScrollingModule,
    NoDataModule
  ],
  declarations: [TapRtpStreamsComponent],
  exports: [TapRtpStreamsComponent]
})
export class TapRtpStreamsModule { }
