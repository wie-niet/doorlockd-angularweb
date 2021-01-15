import { Component, OnInit } from '@angular/core';
import { iUnknownTag, iTag, iObjType } from '../interfaces';
import { DoorlockdApiClientService } from '../doorlockd-api-client.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { NgbModal,ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-unknowntags',
  templateUrl: './unknowntags.component.html',
  styleUrls: ['./unknowntags.component.css']
})
export class UnknowntagsComponent implements OnInit {
  unknowntags: iUnknownTag[] = [];
  formTagNew: FormGroup;

  // load and error messages 
  req_loading_table = false;
  req_error_table = null;
  req_loading_modal = false;
  req_error_modal = null;

  constructor(    
    public fb: FormBuilder,
    private modalService: NgbModal,
    public doorlockdApiClient: DoorlockdApiClientService) { }

    
  ngOnInit(): void {
    if (this.doorlockdApiClient.loggedIn) {
      this.formRefresh();
    }
  }

  
  formRefresh() {
    this.req_loading_table = true;
    this.req_error_table = null;

    // refresh table
    this.doorlockdApiClient.getAll(iObjType.unknowntags).subscribe((data: iUnknownTag[])=>{
      console.log(data);
      this.req_loading_table = false;
      this.unknowntags = data;
    }, (res) => {
      console.log('error list', res.error);
      this.req_error_table = res.error.error + ' - ' + res.error.message; 
    })

  }

  formDeleteAll() {
    if(confirm('Do you really want to delete All Unkowntags?')) {
      this.req_loading_table = true;
      this.req_error_table = null;

      // loop backwards over the unkowntags array.
      for (var index = this.unknowntags.length - 1; index >= 0; index--) {
        let tag =  this.unknowntags[index]
        // console.log('delete:', index, tag);
        this.doorlockdApiClient.delete(iObjType.unknowntags, tag.id).subscribe(res => {
          console.log('deleted unknowntag ' + tag.id );
          
          // delete tag from our array.
          this.unknowntags.splice(index, 1);
          
        });

      }
      // clear loading sign and refresh
      this.ngOnInit();

    }
  }

  formDelete(item_id) {
    if(confirm('Do you really want to delete this Unknowntag?')) {
      this.req_loading_table = true;
      this.req_error_table = null;
      this.doorlockdApiClient.delete(iObjType.unknowntags, item_id).subscribe(res => {
        console.log('deleted unknowntag ' + item_id );
        this.ngOnInit();
      },(res)=>{
        console.log('delete err: ', res);
        this.req_error_table = res.error.error + ' - ' + res.error.message;

        // safari bug? , HTTP 204 --> HttpErrorResponse "status 0"
        if(res instanceof HttpErrorResponse ) {
          this.req_error_table = "oh no!, some error of bug! Please refresh, maybe it's nothing.";
        }
      });
    }
  }

  openModalTagNew(content, hwid:string='') {
    
    // init new form object
    this.formTagNew = this.fb.group({
      // disable hwid form when hwid is set in argument
      hwid: new FormControl({value: hwid, disabled:  hwid == '' ? false : true }),
      description: [''],
      is_disabled: [false],
    }) 
    
    // clear old messages:
    this.req_error_modal = null; 
    this.req_loading_modal = false;
    
    // launch modal
    this.modalService.open(content);
  }

  submitTagNew() {
    this.formTagNew.disable();
    this.req_loading_modal = true;
    this.req_error_modal = null;

    this.doorlockdApiClient.create(iObjType.tags,this.formTagNew.getRawValue()).subscribe(res => {
      console.log('created new tag');
      // refresh list
      this.ngOnInit() ;

      // close boottrap modal:
      this.modalService.dismissAll();
    }, (res) => {
      console.log('error creating new tag', res.error);
      this.formTagNew.enable();
      this.req_loading_modal = false;
      this.req_error_modal = res.error.error + ' - ' + res.error.message; 
    });
  }

}
