import { Component, OnInit } from '@angular/core';
import { iUser, iObjType, iChangelog } from '../interfaces';
import { DoorlockdApiClientService } from '../doorlockd-api-client.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { NgbModal,ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangelogsComponent } from '../changelogs/changelogs.component';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: iUser[] = [];

  // load and error messages 
  req_loading_table = false;
  req_error_table = null;
  req_loading_modal = false;
  req_error_modal = null;

  // sort table:
  order: string = '';


  editNavId = 1; // edit user tab
  
  redirectUrl: string | null = null; // redirect url for edit mode 

  // formUserNew: FormGroup;

  // make modalUsersEdit accessible
  @ViewChild('modalUsersEdit', { static: false }) private modalUsersEdit;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public fb: FormBuilder,
    private modalService: NgbModal,
    public doorlockdApiClient: DoorlockdApiClientService) { }

  ngOnInit(): void {
    // abort if not loggedIn
    if (!this.doorlockdApiClient.loggedIn) {
      return;
    }

    // get argument uid 
    let uid = this.route.snapshot.paramMap.get('uid');
    if(uid != null) {
      // go direct to edit modal:
      this.redirectUrl = this.route.snapshot.queryParamMap.get("redirect") ? this.route.snapshot.queryParamMap.get("redirect") : this.redirectUrl;

      console.log('found UID parameter: ', uid);
      // load user 
      this.doorlockdApiClient.getById(iObjType.users, uid).subscribe((user:iUser)=>{
        console.log("getbyID....",user);
        this.openmodalEdit(this.modalUsersEdit,user);
      })

    } else {
      // normal list display
      this.formRefresh();
    }
    
  }

  sortTable(col: string, asc: boolean|null = null) {
    // show loading/bussy message
    this.req_loading_table = true;

    if(asc === null) {
      // determin direction from current this.order
      if(this.order == col) {
        asc = false // let's reverse
      } else {
        asc = true; 
      }
    }

    if(this.users.length > 1) {
      if(typeof this.users[0][col] === 'string' ) {
        // this.tags.sort((a,b) => a['description'].localeCompare(b['description']));
        if(asc) {
          this.users.sort((a,b) => a[col].localeCompare(b[col]));
        } else {
          this.users.sort((b,a) => a[col].localeCompare(b[col]));
        }
      } else {
        // numeric/logic sort:
        if(asc) {
          this.users.sort((a, b) => ((a[col] < b[col] ? -1 : 1)))
        } else {
          this.users.sort((b, a) => ((a[col] < b[col] ? -1 : 1)))
        }
      }
    }

    // compose order variable for UI.
    this.order = (asc ? '':'!') + col;
    // console.log('order: ' + this.order);

    // hide loading/bussy message
    this.req_loading_table = false;
  }

  formUserNew: FormGroup = this.fb.group({
    email: [''],
    password_plain: [''],
    is_enabled: [''],
  })

  formUserEdit: FormGroup = this.fb.group({
    id: [''],
    email: [''],
    password_plain: [''],
    password_hash: [''],
    is_enabled: [''],
    created_at: [''],
    updated_at: [''],
  })


  // formDelete: show confirm box, delete and refresh page
  formDelete(item_id) {
    if(confirm('Do you really want to delete this User?')) {
      this.req_loading_table = true;
      this.req_error_table = null;

      this.doorlockdApiClient.delete(iObjType.users, item_id).subscribe(res => {
        console.log('deleted user ' + item_id );
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

  formRefresh() {
    // refresh table
    this.req_loading_table = true;
    this.req_error_table = null;
    

    this.doorlockdApiClient.getAll(iObjType.users).subscribe((data: [])=>{
      console.log(data);
      this.req_loading_table = false;
      this.users = data;
      //  sort table:
      this.sortTable('email');

    }, (res) => {
      console.log('error list users', res.error);
      this.req_error_table = res.error.error + ' - ' + res.error.message; 
    })
  }

  openModalTagNew(content) {
    // clear object , set defaults
    this.formUserNew = this.fb.group({
      email: [''],
      password_plain: [''],
      is_enabled: [true],
    })
    
    // clear old messages:
    this.req_error_modal = null; 
    this.req_loading_modal = false;
    
    this.modalService.open(content);

  }

  submitUserNew() {
    this.formUserNew.disable();
    this.req_loading_modal = true;
    this.req_error_modal = null;

    this.doorlockdApiClient.create(iObjType.users,this.formUserNew.value).subscribe(res => {
      console.log('created new user');
      this.req_loading_modal = false;

      // refresh list
      this.ngOnInit() ;

      // close boottrap modal:
      this.modalService.dismissAll();
    }, (res) => {
      console.log('error creating new tag', res.error);
      this.formUserNew.enable();
      this.req_loading_modal = false;
      this.req_error_modal = res.error.error + ' - ' + res.error.message; 
    
    });
  }

  openmodalChangelogs(content, item: iUser) {
    // init form
    this.formUserEdit = this.fb.group({
      id: [item.id]
    })
    
    // open modal
    const modalRef = this.modalService.open(content);

  }

  openmodalEdit(content, user: iUser) {
    // init form
    this.formUserEdit = this.fb.group({
      // id: new FormControl({value: user.id, disabled: true}),
      id: [user.id],
      email: [user.email],
      password_plain: [user.password_plain],
      password_hash: [user.password_hash],
      is_enabled: [user.is_enabled],
      created_at: [user.created_at],
      updated_at: [user.updated_at],
    })

    // clear old messages:
    this.req_error_modal = null; 
    this.req_loading_modal = false;


    // open modal
    const modalRef = this.modalService.open(content).result.finally((url = this.redirectUrl)=>{
      // redirect back (incase set)
      if (url != null) {
        this.router.navigateByUrl(url);
      }
    });

    
  }

  refreshEditForm() {
    // clear old messages:
    this.req_error_modal = null; 
    this.req_loading_modal = true;
    this.formUserEdit.disable();

    // load user 
    this.doorlockdApiClient.getById(iObjType.users, this.formUserEdit.value.id).subscribe((user:iUser)=>{
      console.log("refresh user....",user);

      // reset all write-only items:
      this.formUserEdit.reset();
      // for all items in user:
      for (let key in user) {
        this.formUserEdit.get(key).setValue(user[key]);
      }

      this.req_loading_modal = false;
      this.formUserEdit.enable();

     }, (res) => {
        console.log('error update tag', res.error);
        this.formUserEdit.enable();
        this.req_loading_modal = false;
        this.req_error_modal = res.error.error + ' - ' + res.error.message; 
  
    })

  }



  submitUserUpdate() {
    this.formUserEdit.disable();
    this.req_loading_modal = true;
    this.req_error_modal = null;


    this.doorlockdApiClient.update(iObjType.users,this.formUserEdit.value.id,this.formUserEdit.value).subscribe(res => {
      console.log('user updated', this.formUserEdit.value.id);
      
      // refresh list
      this.ngOnInit() ;

      // close boottrap modal:
      this.modalService.dismissAll();
    }, (res) => {
      console.log('error update tag', res.error);
      this.formUserEdit.enable();
      this.req_loading_modal = false;
      this.req_error_modal = res.error.error + ' - ' + res.error.message; 

      
    });  
  }


}
