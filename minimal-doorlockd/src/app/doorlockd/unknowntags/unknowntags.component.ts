import { Component, OnInit } from '@angular/core';
import { iUnknownTag, iObjType } from '../interfaces';
import { DoorlockdApiClientService } from '../doorlockd-api-client.service';

@Component({
  selector: 'app-unknowntags',
  templateUrl: './unknowntags.component.html',
  styleUrls: ['./unknowntags.component.css']
})
export class UnknowntagsComponent implements OnInit {
  unknowntags: iUnknownTag[] = [];

  constructor(public doorlockdApiClient: DoorlockdApiClientService) { }

  ngOnInit(): void {
    this.doorlockdApiClient.getAll(iObjType.unknowntags).subscribe((data: iUnknownTag[])=>{
      console.log(data);
      this.unknowntags = data;
    })

  }

}
