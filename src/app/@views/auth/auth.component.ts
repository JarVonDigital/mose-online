import {Component, inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Auth, signInWithEmailAndPassword, UserCredential} from "@angular/fire/auth";
import {Router} from "@angular/router";
import {doc, Firestore, getDoc, setDoc, updateDoc} from "@angular/fire/firestore";
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
  private authService = inject(AuthService)

  loginForm!: FormGroup<LoginForm>;

  ngOnInit(): void {

    window.addEventListener("keyup", (ev) => (ev.key === "Enter" && this.loginForm.valid) ? this.onLogin() : null)

    // Set Login form
    this.loginForm = new FormGroup<LoginForm>({
      email: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.email]}),
      password: new FormControl('', {nonNullable: true, validators: [Validators.required]})
    });

  }

  async onLogin() {

    // Login User
    let creds: UserCredential = await signInWithEmailAndPassword(
      this.auth,
      this.loginForm.get("email")?.getRawValue(),
      this.loginForm.get("password")?.getRawValue()
    )

    if(creds) {
      await this.authService.getLoginUser();
    }
    await this.router.navigate(['dashboard'])

  }

}
