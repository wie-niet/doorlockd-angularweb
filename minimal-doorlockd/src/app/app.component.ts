import { Component } from '@angular/core';
import { DoorlockdApiClientService } from './doorlockd/doorlockd-api-client.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'minimal-doorlockd';

  constructor (
    public router: Router,
    public doorlockdApiClient: DoorlockdApiClientService
    ) {}
}
