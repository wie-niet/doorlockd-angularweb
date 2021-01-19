import { Component, OnInit, Input } from '@angular/core';
import { iUser, iObjType, iChangelog } from '../interfaces';
import { DoorlockdApiClientService } from '../doorlockd-api-client.service';

@Component({
  selector: 'app-changelogs',
  templateUrl: './changelogs.component.html',
  styleUrls: ['./changelogs.component.css']
})
export class ChangelogsComponent implements OnInit {
  changelogs: iChangelog[] = [];
  req_loading_changelogs = false;
  req_error_changelogs = null;

  constructor(public doorlockdApiClient: DoorlockdApiClientService) { }

  ngOnInit(): void {
    this.loadChangelogs();
  }

  @Input() model: iObjType;
  @Input() id: string;

  loadChangelogs() {
    // clear old messages:
    this.req_error_changelogs = null; 
    this.req_loading_changelogs = true;

    this.doorlockdApiClient.getChangelogs(this.model, this.id).subscribe((data:[])=>{
      console.log('get changelogs()', this.model, this.id);
      this.changelogs = data;
      this.req_loading_changelogs = false;
    }, (res) => {
      console.log('error fetching changelogs', res);
      this.req_loading_changelogs = false;
      this.req_error_changelogs = res.error.error + ' - ' + res.error.message; 
    });
  }
}
