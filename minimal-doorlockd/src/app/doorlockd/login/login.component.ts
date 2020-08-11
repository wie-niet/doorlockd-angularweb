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


  constructor(
    public fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public doorlockdApiClient: DoorlockdApiClientService
  ) { }

  ngOnInit(): void {
    this.redirectUrl = this.route.snapshot.queryParamMap.get("redirect") ? this.route.snapshot.queryParamMap.get("redirect") : this.redirectUrl;
    // console.log('redirect will do url:', this.redirectUrl);


    this.loginForm = this.fb.group({
      // use email from this.doorlockdApiClient.remember_me_name
      email: [this.doorlockdApiClient.remember_me_name],
      password: [''],
    })

    // launch boottrap modal:
    // declare var $: any;
    // $('#modalLoginForm').modal('show');

  }

  submitForm() {
    this.doorlockdApiClient.login(this.loginForm.value).subscribe(res => {
      console.log('Auth login!')
      this.router.navigateByUrl(this.redirectUrl) });
  }

  submitLogout() {
    this.doorlockdApiClient.logout();
  }

  submitRefreshToken() {
    this.doorlockdApiClient.refresh_token().subscribe();
  }
}
