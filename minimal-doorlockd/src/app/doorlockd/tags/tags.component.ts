import { Component, OnInit } from '@angular/core';
import { iTag, iObjType } from '../interfaces';
import { DoorlockdApiClientService } from '../doorlockd-api-client.service';


@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.css']
})
export class TagsComponent implements OnInit {
  tags: iTag[] = [];

  constructor(public doorlockdApiClient: DoorlockdApiClientService) { }

  ngOnInit(): void {
    this.doorlockdApiClient.getAll(iObjType.tags).subscribe((data: iTag[])=>{
      console.log(data);
      this.tags = data;
})

  }

}
