import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DoorlockdRoutingModule } from './doorlockd-routing.module';
import { UsersComponent } from './users/users.component';
import { TagsComponent } from './tags/tags.component';
import { UnknowntagsComponent } from './unknowntags/unknowntags.component';
import { HardwareComponent } from './hardware/hardware.component';
import { LoginComponent } from './login/login.component';


@NgModule({
  declarations: [UsersComponent, TagsComponent, UnknowntagsComponent, HardwareComponent, LoginComponent],
  imports: [
    CommonModule,
    DoorlockdRoutingModule
  ]
})
export class DoorlockdModule { }
