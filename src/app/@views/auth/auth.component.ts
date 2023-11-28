import {Component, inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Auth, signInWithEmailAndPassword, UserCredential} from "@angular/fire/auth";
import {Router} from "@angular/router";
import {AuthService} from "../../@services/auth/auth.service";

interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  private auth = inject(Auth)
  private router = inject(Router);
  private authService = inject(AuthService);

  loginForm: FormGroup<LoginForm> = new FormGroup<LoginForm>({
    email: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.email]}),
    password: new FormControl('', {nonNullable: true, validators: [Validators.required]})
  })

  validationStates = {
    invalid: (formFieldName: string) => this.loginForm.get(formFieldName)?.invalid && this.loginForm.get(formFieldName)?.touched,
    valid: (formFieldName: string) => this.loginForm.get(formFieldName)?.valid
  }

  ngOnInit(): void {

    // this.validationStates = {
    //   invalid: (formFieldName: string) => this.loginForm.get(formFieldName)?.invalid && this.loginForm.get(formFieldName)?.touched,
    //   valid: (formFieldName: string) => this.loginForm.get(formFieldName)?.valid
    // }

    window.addEventListener("keyup", (ev) => (ev.key === "Enter" && this.loginForm.valid) ? this.onLogin() : null)

  }

  async onLogin() {

    try {

      // Login User
      const creds: UserCredential = await signInWithEmailAndPassword(
        this.auth,
        this.loginForm.getRawValue().email.toLowerCase(),
        this.loginForm.getRawValue().password
      )

      await this.authService.getLoginUser(creds);
      await this.router.navigate(['dashboard'])

    } catch (err) {
      console.log("There was an error while attempting to login");
    }

  }

}
