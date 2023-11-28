import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthComponent} from "./@views/auth/auth.component";
import {CompareComponent} from "./@views/dashboard/@views/compare/compare.component";
import {AuthGuard} from "./@guards/auth/auth.guard";
import {DashboardComponent} from "./@views/dashboard/dashboard.component";
import {UserResolver} from "./@resolvers/user/user.resolver";
import {UsersComponent} from "./@views/dashboard/@views/users/users.component";
import {EditComponent} from "./@views/dashboard/@views/edit/edit.component";
import {GetSingleFileResolver} from "./@resolvers/files/get-single-file.resolver";

const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'login'},
  {path: "login", component: AuthComponent},
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'view/compare'},
      {
        path: "view/users",
        component: UsersComponent,
        resolve: {
          users: UserResolver
        },
      },
      {
        path: "manage",
        component: CompareComponent,
        children: [
          {
            path: 'edit/:uuid',
            resolve: {
              workingFile: GetSingleFileResolver
            },
            component: EditComponent
          }
        ]
      },
    ]
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
