import { Component, OnInit } from '@angular/core';
import { iUser, iObjType } from '../interfaces';
import { DoorlockdApiClientService } from '../doorlockd-api-client.service';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { NgbModal,ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: iUser[] = [];
  // formUserNew: FormGroup;

  constructor(
    public fb: FormBuilder,
    private modalService: NgbModal,
    public doorlockdApiClient: DoorlockdApiClientService) { }

  ngOnInit(): void {
    this.doorlockdApiClient.getAll(iObjType.users).subscribe((data: [])=>{
      console.log(data);
      this.users = data;
    })
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
      this.doorlockdApiClient.delete(iObjType.users, item_id).subscribe(res => {
        console.log('deleted user ' + item_id );
        this.ngOnInit();
      });
    }
  }

  openmodal(content) {
    this.modalService.open(content);

  }

  submitUserNew() {
    this.doorlockdApiClient.create(iObjType.users,this.formUserNew.value).subscribe(res => {
      console.log('created new user');
      // refresh list
      this.ngOnInit() ;

      // close boottrap modal:
      this.modalService.dismissAll();

      // clear object
      this.formUserNew = this.fb.group({
        email: [''],
        password_plain: [''],
        is_disabled: [false],
      })
    
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
    
    // open modal
    const modalRef = this.modalService.open(content);
    
  }

  submitUserUpdate() {
    this.doorlockdApiClient.update(iObjType.users,this.formUserEdit.value.id,this.formUserEdit.value).subscribe(res => {
      console.log('user updated', this.formUserEdit.value.id);
      
      // refresh list
      this.ngOnInit() ;

      // close boottrap modal:
      this.modalService.dismissAll();

      // // clear object
      // this.formUserNew = this.fb.group({
      //   email: [''],
      //   password_plain: [''],
      //   is_disabled: [false],
      // })
    
    });  }


}
