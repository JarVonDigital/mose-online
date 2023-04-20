import {Component, inject, OnInit} from '@angular/core';
import {Auth, signOut} from "@angular/fire/auth";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../../../@services/auth/auth.service";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit{
  private auth = inject(Auth);
  private router = inject(Router)
  private authService = inject(AuthService)

  user: any | undefined

  async ngOnInit() {
    this.user = await this.authService.getLoginUser();
  }

  onLogout() {
    signOut(this.auth)
      .then(() => this.router.navigate(['login']))
  }
}
