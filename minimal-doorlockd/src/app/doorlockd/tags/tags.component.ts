import { Component, OnInit } from '@angular/core';
import { iTag, iObjType } from '../interfaces';
import { DoorlockdApiClientService } from '../doorlockd-api-client.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { NgbModal,ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangelogsComponent } from '../changelogs/changelogs.component';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.css']
})
export class TagsComponent implements OnInit {
  tags: iTag[] = [];
  formTagNew: FormGroup;
  formTagEdit: FormGroup;

  // load and error messages 
  req_loading_table = false;
  req_error_table = null;
  req_loading_modal = false;
  req_error_modal = null;

  // sort table:
  order: string = 'description';

  constructor(
    public fb: FormBuilder,
    private modalService: NgbModal,
    public doorlockdApiClient: DoorlockdApiClientService) { }

  ngOnInit(): void {
    if (this.doorlockdApiClient.loggedIn) {
      this.formRefresh();
    }
  }

  sortTable(col: string|null = null, asc: boolean|null = null) {
    // show loading/bussy message
    this.req_loading_table = true;

    if(col === null) {
      // if not set read defaults from this.order || not sort at all
      if (!this.order) {
        this.req_loading_table = false;
        return(null) // no sorting.
      }

      // parse this.order
      if (this.order[0] == '!') {
        // !colname
        col = this.order.substring(1)
        asc = false;
      } else {
        // colname
        col = this.order
        asc = true
      }

    }

    if(asc === null) {
      // determin direction from current this.order
      if(this.order == col) {
        asc = false // let's reverse
      } else {
        // 'colname' != '!colname' ;-)
        asc = true; 
      }
    }

    if(this.tags.length > 1) {
      if(typeof this.tags[0][col] === 'string' ) {
        // this.tags.sort((a,b) => a['description'].localeCompare(b['description']));
        if(asc) {
          this.tags.sort((a,b) => a[col].localeCompare(b[col]));
        } else {
          this.tags.sort((b,a) => a[col].localeCompare(b[col]));
        }
      } else {
        // numeric/logic sort:
        if(asc) {
          this.tags.sort((a, b) => ((a[col] < b[col] ? -1 : 1)))
        } else {
          this.tags.sort((b, a) => ((a[col] < b[col] ? -1 : 1)))
        }
      }
    }

    // compose order variable for UI.
    this.order = (asc ? '':'!') + col;
    // console.log('order: ' + this.order);

    // hide loading/bussy message
    this.req_loading_table = false;
  }

  formRefresh() {
    // refresh table
    this.req_loading_table = true;
    this.req_error_table = null;

    this.doorlockdApiClient.getAll(iObjType.tags).subscribe((data: iTag[])=>{
      console.log(data);
      this.tags = data;

      this.sortTable();
      
      this.req_loading_table = false;
    }, (res) => {
      console.log('error list tags', res.error);
      this.req_error_table = res.error.error + ' - ' + res.error.message; 
    })
}

  formDelete(item_id) {
    if(confirm('Do you really want to delete this Tag?')) {
      this.req_loading_table = true;
      this.req_error_table = null;
  
      this.doorlockdApiClient.delete(iObjType.tags, item_id).subscribe(res => {
        console.log('deleted tag ' + item_id );
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
      is_enabled: [true],
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
      this.req_loading_modal = false;

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

  openmodalChangelogs(content, item: iTag) {
    // init form
    this.formTagEdit = this.fb.group({
      id: [item.id]
    })
    
    // open modal
    const modalRef = this.modalService.open(content);

  }

  openmodalEdit(content, tag: iTag) {
    // init form
    this.formTagEdit = this.fb.group({
      // id: new FormControl({value: tag.id, disabled: true}),
      id: [tag.id],
      hwid: [tag.hwid],
      description: [tag.description],
      is_enabled: [tag.is_enabled],
      created_at: [tag.created_at],
      updated_at: [tag.updated_at],
    })
    // clear old messages:
    this.req_error_modal = null; 
    this.req_loading_modal = false;


    // open modal
    const modalRef = this.modalService.open(content);
    
  }

  refreshEditForm() {
    // clear old messages:
    this.req_error_modal = null; 
    this.req_loading_modal = true;
    this.formTagEdit.disable();

    // load user 
    this.doorlockdApiClient.getById(iObjType.tags, this.formTagEdit.value.id).subscribe((item:iTag)=>{
      console.log("refresh user....",item);

      // reset all write-only items:
      this.formTagEdit.reset();
      // for all items in item:
      for (let key in item) {
        this.formTagEdit.get(key).setValue(item[key]);
      }

      this.req_loading_modal = false;
      this.formTagEdit.enable();

     }, (res) => {
        console.log('error update tag', res.error);
        this.formTagEdit.enable();
        this.req_loading_modal = false;
        this.req_error_modal = res.error.error + ' - ' + res.error.message; 
  
    })

  }

  submitTagUpdate() {
    console.log("tag object:", this.formTagEdit.value);
    this.formTagEdit.disable();
    this.req_loading_modal = true;
    this.req_error_modal = null;


    this.doorlockdApiClient.update(iObjType.tags,this.formTagEdit.value.id,this.formTagEdit.value).subscribe(res => {
      console.log('tag updated', this.formTagEdit.value.id);
      this.req_loading_modal = false;

      // refresh list
      this.ngOnInit() ;

      // close boottrap modal:
      this.modalService.dismissAll();

    }, (res) => {
      console.log('error update tag', res.error);
      this.formTagEdit.enable();
      this.req_loading_modal = false;
      this.req_error_modal = res.error.error + ' - ' + res.error.message; 

    });  }

}
