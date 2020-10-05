import { Component, OnInit } from '@angular/core';
import { DoorlockdApiClientService } from '../doorlockd-api-client.service';
import { iHardwareItem } from '../interfaces';
import { NgbDropdownToggle } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-hardware',
  templateUrl: './hardware.component.html',
  styleUrls: ['./hardware.component.css']
})
export class HardwareComponent implements OnInit {
  // hw: iHardwareItem[];
  // hw = new Map()
  hw = new Array()
  solenoid: iHardwareItem;
  buzzer: iHardwareItem;
  rfidreader: iHardwareItem;

  constructor(public doorlockdApiClient: DoorlockdApiClientService) { }

  ngOnInit(): void {
    this.getHw('solenoid');
    this.getHw('buzzer');
    this.getHw('rfidreader');
  }

  getHw(name): void {
    this.doorlockdApiClient.getHwByID(name).subscribe((data: iHardwareItem)=>{
      console.log(name, data);
      this.hw.push([name,  data]);
    })
  }

  updateStatus(hashref, value) {

    // change status and submit this...:
    hashref[1].status = value;

    this.doorlockdApiClient.updateHwByID(hashref[0], hashref[1]).subscribe((data: iHardwareItem)=>{
      console.log(hashref[0], data.status);
      hashref[1] = data;

      // wait time out seconds..
      if(hashref[1].time_wait) {
        // sleep 
        setTimeout(()=>{
          this.doorlockdApiClient.getHwByID(hashref[0]).subscribe((data: iHardwareItem)=>{
            console.log('status update...', data.status);
            hashref[1] = data;
          })
  

        }, hashref[1].time_wait * 1000 )
        
      }
    })

  }

  updateHw(name, hw): void {
    this.doorlockdApiClient.updateHwByID(name, hw).subscribe((data: iHardwareItem)=>{
      console.log(name, data);
      this.hw.push([name,  data]);
    })
  }

  
}
