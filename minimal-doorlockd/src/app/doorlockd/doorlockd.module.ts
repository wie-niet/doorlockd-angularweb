import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { DoorlockdRoutingModule } from './doorlockd-routing.module';
import { UsersComponent } from './users/users.component';
import { TagsComponent } from './tags/tags.component';
import { UnknowntagsComponent } from './unknowntags/unknowntags.component';
import { HardwareComponent } from './hardware/hardware.component';
import { LoginComponent } from './login/login.component';

// import { JwtModule } from '@auth0/angular-jwt';
import { JwtModule } from "@avatsaev/angular-jwt";


@NgModule({
  declarations: [UsersComponent, TagsComponent, UnknowntagsComponent, HardwareComponent, LoginComponent],
  imports: [
    CommonModule,
    DoorlockdRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: function  tokenGetter() {
             return     localStorage.getItem('access_token');},
        whitelistedDomains: ['192.168.7.2:8000'],
        blacklistedRoutes: ['http://192.168.7.2:8000/html/']
      }
    })
  ]
})
export class DoorlockdModule { }
