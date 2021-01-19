import { Component, OnInit } from '@angular/core';
import { DoorlockdApiClientService } from '../doorlockd-api-client.service';
import { ChangelogsComponent } from '../changelogs/changelogs.component';
@Component({
  selector: 'app-debug-viewer',
  templateUrl: './debug-viewer.component.html',
  styleUrls: ['./debug-viewer.component.css']
})
export class DebugViewerComponent implements OnInit {

  constructor(public doorlockdApiClient: DoorlockdApiClientService) { }

  ngOnInit(): void {
  }

}
