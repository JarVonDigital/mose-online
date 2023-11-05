import {Component, inject, OnInit} from '@angular/core';
import {AuthService} from "../../../../@services/auth/auth.service";
import {MoseUser} from "../../../../@interfaces/user/mose-user";

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit{

  private authService = inject(AuthService);

  user: MoseUser | undefined;
  users: MoseUser[] | undefined;

  async ngOnInit() {
    this.user = await this.authService.getLoginUser();
    this.users = await this.authService.getUsers();
  }

  async onSaveUser(user: any) {
    let saveUser = await this.authService.onSaveUser(user);
    if(saveUser) {
      window.alert("MoseUser data updated.")
    } else {
      window.alert("There was an error while processing your request")
    }

  }

}
