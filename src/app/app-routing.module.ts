import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AuthComponent} from "./@views/auth/auth.component";
import {CompareComponent} from "./@views/dashboard/@views/compare/compare.component";
import {AuthGuard} from "./@guards/auth/auth.guard";
import {DashboardComponent} from "./@views/dashboard/dashboard.component";
import {FilesComponent} from "./@views/dashboard/@views/files/files.component";
import {UserResolver} from "./@resolvers/user/user.resolver";
import {UsersComponent} from "./@views/dashboard/@views/users/users.component";

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login'},
  { path: "login", component: AuthComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    resolve: [UserResolver],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'view/compare'},
      {
        path: "view/users",
        component: UsersComponent
      },
      {
        path: "view/compare",
        component: CompareComponent
      },
      {
        path: "view/files",
        component: FilesComponent
      }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
