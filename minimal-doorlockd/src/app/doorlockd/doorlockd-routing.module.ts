import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { UsersComponent } from './users/users.component';
import { TagsComponent  } from './tags/tags.component';
import { UnknowntagsComponent  } from './unknowntags/unknowntags.component';
import { HardwareComponent  } from './hardware/hardware.component';
import { DebugViewerComponent } from './debug-viewer/debug-viewer.component';

const routes: Routes = [
  { path: '', redirectTo: 'doorlock/', pathMatch: 'full'},
  { path: 'doorlock/', component: DashboardComponent },
  { path: 'doorlock/login', component: LoginComponent },
  { path: 'doorlock/users/:uid', component: UsersComponent },
  { path: 'doorlock/users', component: UsersComponent },
  { path: 'doorlock/tags', component: TagsComponent },
  { path: 'doorlock/unknowntags', component: UnknowntagsComponent },
  { path: 'doorlock/hardware', component: HardwareComponent },
  { path: 'doorlock/debug-viewer', component: DebugViewerComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoorlockdRoutingModule { }
