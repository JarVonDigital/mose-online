import {inject, Injectable} from '@angular/core';
import { Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import {AuthService} from "../../@services/auth/auth.service";

@Injectable({
  providedIn: 'root'
})
export class UserResolver implements Resolve<any> {

  private authService = inject(AuthService);
  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<any> {
    await this.authService.getLoginUser();
    return this.authService.loginCreds;
  }
}
