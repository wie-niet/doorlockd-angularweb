import { Component, OnInit } from '@angular/core';
import { iUser, iObjType } from '../interfaces';
import { DoorlockdApiClientService } from '../doorlockd-api-client.service';
import { FormBuilder, FormGroup } from '@angular/forms';

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

  formDelete(item_id) {
    if(confirm('Do you really want to delete this User?')) {
      this.doorlockdApiClient.delete(iObjType.users, item_id).subscribe(res => {
        console.log('deleted user ' + item_id );
        this.ngOnInit();
      });
        
       
    }
  }
  submitUserNew() {
    this.doorlockdApiClient.create(iObjType.users,this.formUserNew.value).subscribe(res => {
      console.log('created new user');
      this.ngOnInit() ;


      // close boottrap modal:
      declare var $: any;
      $('#modalUsersNew').modal('hide');

      // clear object
      this.formUserNew = this.fb.group({
        email: [''],
        password_plain: [''],
        is_disabled: [false],
      })
    
    });
  }


}
