import { Component, OnInit } from '@angular/core';
import { iUser, iObjType, iChangelog } from '../interfaces';
import { DoorlockdApiClientService } from '../doorlockd-api-client.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { NgbModal,ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';


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
  req_loading_changelogs = false;
  req_error_changelogs = null;

  editNavId = 1; // edit user tab
  changelogs: iChangelog[] = [];

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



  formUserNew: FormGroup = this.fb.group({
    email: [''],
    password_plain: [''],
    is_disabled: [false],
  })

  formUserEdit: FormGroup = this.fb.group({
    id: [''],
    email: [''],
    password_plain: [''],
    password_hash: [''],
    is_disabled: [false],
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
    }, (res) => {
      console.log('error list users', res.error);
      this.req_error_modal = res.error.error + ' - ' + res.error.message; 
    })
  }

  openModalTagNew(content) {
    // clear object
    this.formUserNew = this.fb.group({
      email: [''],
      password_plain: [''],
      is_disabled: [false],
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

  openmodalEdit(content, user: iUser) {
    // init form
    this.formUserEdit = this.fb.group({
      // id: new FormControl({value: user.id, disabled: true}),
      id: [user.id],
      email: [user.email],
      password_plain: [user.password_plain],
      password_hash: [user.password_hash],
      is_disabled: [user.is_disabled],
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

    this.loadChangelogs(user.id);
    
  }

  loadChangelogs(item_id) {
    // clear old messages:
    this.req_error_changelogs = null; 
    this.req_loading_changelogs = true;

    this.doorlockdApiClient.getChangelogs(iObjType.users, item_id).subscribe((data:[])=>{
      console.log('get changelogs()', iObjType.users, item_id);
      this.changelogs = data;
      this.req_loading_changelogs = false;
    }, (res) => {
      console.log('error fetching changelogs', res);
      this.req_loading_changelogs = false;
      this.req_error_changelogs = res.error.error + ' - ' + res.error.message; 
    });
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
