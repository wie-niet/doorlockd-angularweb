import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { DoorlockdModule } from './doorlockd/doorlockd.module'

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DoorlockdModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
