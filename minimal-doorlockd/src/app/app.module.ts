import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { DoorlockdModule } from './doorlockd/doorlockd.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'

import { DurationFormatPipe } from './duration-format.pipe';

@NgModule({
  declarations: [
    AppComponent,
    DurationFormatPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DoorlockdModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
