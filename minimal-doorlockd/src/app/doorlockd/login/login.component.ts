import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router,ActivatedRoute } from '@angular/router';

import { DoorlockdApiClientService } from '../doorlockd-api-client.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  redirectUrl: string = '/doorlock/login';
  req_loading = false;
  req_error = null;


  constructor(
    public fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public doorlockdApiClient: DoorlockdApiClientService
  ) { }

  ngOnInit(): void {
    this.redirectUrl = this.route.snapshot.queryParamMap.get("redirect") ? this.route.snapshot.queryParamMap.get("redirect") : this.redirectUrl;
    console.log('redirect will do url:', this.redirectUrl);


    this.loginForm = this.fb.group({
      // use email from this.doorlockdApiClient.loggedInUsername
      email: [this.doorlockdApiClient.loggedInUsername],
      password: [''],
    })

    // launch boottrap modal:
    // declare var $: any;
    // $('#modalLoginForm').modal('show');

  }

  submitForm() {
    this.loginForm.disable();
    this.req_loading = true;
    this.req_error = null;
  
  
    this.doorlockdApiClient.login(this.loginForm.value).subscribe(res => {
      this.router.navigateByUrl(this.redirectUrl);
      this.req_loading = false;
      console.log('Auth login!');
      console.log('redirect will do url:', this.redirectUrl);
    },(res) => {
      console.log('catched error', res.error);
      this.req_loading = false;
      this.req_error = res.error.error + ' - ' + res.error.message; 
      this.loginForm.enable();
    });
  
    
  }

  submitLogout() {
    this.doorlockdApiClient.logout();
  }

  submitRefreshToken() {
    this.doorlockdApiClient.refresh_token().subscribe();
  }
}
