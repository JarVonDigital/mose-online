import {Component, inject} from '@angular/core';
import {Auth, signOut} from "@angular/fire/auth";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  private auth = inject(Auth);
  private router = inject(Router)
  private currentRoute = inject(ActivatedRoute)

  onLogout() {
    signOut(this.auth)
      .then(() => this.router.navigate(['login']))
  }
}
