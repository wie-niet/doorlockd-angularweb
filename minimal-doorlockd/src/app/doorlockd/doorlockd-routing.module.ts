import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { UsersComponent } from './users/users.component';
import { TagsComponent  } from './tags/tags.component';
import { UnknowntagsComponent  } from './unknowntags/unknowntags.component';
import { HardwareComponent  } from './hardware/hardware.component';


const routes: Routes = [
  { path: '', redirectTo: 'doorlock/tags', pathMatch: 'full'},
  { path: 'doorlock/login', component: LoginComponent },
  { path: 'doorlock/users', component: UsersComponent },
  { path: 'doorlock/tags', component: TagsComponent },
  { path: 'doorlock/unknowntags', component: UnknowntagsComponent },
  { path: 'doorlock/hardware', component: HardwareComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoorlockdRoutingModule { }
