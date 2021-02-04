import { Component, OnInit, Input } from '@angular/core';
import { DoorlockdApiClientService } from '../doorlockd-api-client.service';
import { iHardwareItem } from '../interfaces';
import { NgbDropdownToggle } from '@ng-bootstrap/ng-bootstrap';
import { VirtualTimeScheduler } from 'rxjs';

@Component({
  selector: 'app-hardware-item',
  templateUrl: './hardware-item.component.html',
  styleUrls: ['./hardware-item.component.css']
})

export class HardwareItemComponent implements OnInit {
  hw_item: iHardwareItem;
  value_true: string = "on";
  value_false: string = "off";

  status: any = {status: false};
  loading: boolean = true;
  api_error_msg:string|null =  "null";

  constructor(public doorlockdApiClient: DoorlockdApiClientService) { }

  @Input() hw_name;
  @Input() status_toggle = false;
  @Input() true = "on";
  @Input() false = "off";

  ngOnInit(): void {
    
    if(this.hw_name) {
      this.getHw();
    }
  }

  display_before() {
    // before any request or update
    this.loading = true;
    this.api_error_msg = null;
  }

  display_err(res) {
    console.log('oh no!: ', res.error);
    this.api_error_msg = res.error;
    // this.api_error_msg = res.error.error + ' - ' + res.error.message;
    this.loading = false;
  }

  display_ok(data: iHardwareItem,loading: boolean = false ) {
    console.log(this.hw_name, data);
    this.hw_item = data;
    // update loading boolean , 
    this.loading = loading;
  }

  getHw(): void {
    this.display_before()
    this.doorlockdApiClient.getHwByID(this.hw_name).subscribe((data: iHardwareItem)=>{
      this.display_ok(data)
    },(res)=>{
      this.display_err(res)
    })
  }

  toggleStatus(hw_name, hw_item) {
    this.display_before()

    // fetch hardware_item so we are up to date with the counter. 
    this.doorlockdApiClient.getHwByID(hw_name).subscribe((data: iHardwareItem)=>{
      // update status_ref but keep loading=true
      this.display_ok(data, true)

      // change status and submit this...:
      data.status = !data.default_status;

      this.doorlockdApiClient.updateHwByID(hw_name, data).subscribe((data: iHardwareItem)=>{
        // update status_ref and keep loading=true
        this.display_ok(data, true)

        // wait time out seconds..
        if(data.time_wait) {
          // sleep 
          setTimeout(()=>{
            this.doorlockdApiClient.getHwByID(hw_name).subscribe((data: iHardwareItem)=>{
              this.display_ok(data)
            },(res)=>{
              this.display_err(res)
            })
          }, data.time_wait * 1000 )
          
        }
      },(res)=>{
        this.display_err(res)
      })
    },(res)=>{
      this.display_err(res)
    })
  }

  updateStatus(value=null) {
    this.display_before()

    // fetch hardware_item so we are up to date with the counter. 
    this.doorlockdApiClient.getHwByID(this.hw_name).subscribe((data: iHardwareItem)=>{
      // update value but keep loading=true
      this.display_ok(data, true)

      var data_old = data.status;

      // change status value and submit this...:
      if (value == null) {
        this.hw_item.status = !this.hw_item.default_status;
      } else {
        this.hw_item.status = value
      }
      
      console.log('update status: '+ data_old +' -> '+ this.hw_item.status)

      this.doorlockdApiClient.updateHwByID(this.hw_name, this.hw_item).subscribe((data: iHardwareItem)=>{
        // update value but keep loading=true
        this.display_ok(data, true)

        // wait time out seconds..
        var wait_secs = this.hw_item.time_wait ? this.hw_item.time_wait : 1 // default 1 sec

        // sleep 
        setTimeout(()=>{
          this.getHw() // refresh item;
          }, wait_secs * 1000 )
      },(res)=>{
        this.display_err(res)
      })
    },(res)=>{
      this.display_err(res)
    })
  }

  // updateHw(item): void {
  //   this.doorlockdApiClient.updateHwByID(this.hw_name, item).subscribe((data: iHardwareItem)=>{
  //     console.log(this.hw_name, data);
  //     this.hw_item = data;
  //   })
  // }
}
