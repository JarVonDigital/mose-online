import {Component, inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Auth, signInWithEmailAndPassword} from "@angular/fire/auth";
import {Router} from "@angular/router";

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

  loginForm!: FormGroup<LoginForm>;

  constructor() { }

  ngOnInit(): void {

    // Set Login form
    this.loginForm = new FormGroup<LoginForm>({
      email: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.email]}),
      password: new FormControl('', {nonNullable: true, validators: [Validators.required]})
    });

  }

  onLogin() {

    // Login User
    signInWithEmailAndPassword(
      this.auth,
      this.loginForm.get("email")?.getRawValue(),
      this.loginForm.get("password")?.getRawValue()
    ).then(user => {
        this.router.navigate(['dashboard'])
          .then(() => {})
    }).catch(err => console.log(err));

  }
}
