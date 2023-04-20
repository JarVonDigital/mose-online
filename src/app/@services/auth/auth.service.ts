import {inject, Injectable} from '@angular/core';
import {collection, doc, Firestore, getDoc, getDocs, setDoc, updateDoc} from "@angular/fire/firestore";
import {getAuth, User, user, UserCredential} from "@angular/fire/auth";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  get loginCreds(): {} {
    return this._loginCreds;
  }

  private firestore = inject(Firestore);

  private _loginCreds = {};

  async getLoginUser(creds?: any) {
    creds = creds ? creds.user : getAuth().currentUser;

    let modifyDocLocation = doc(this.firestore, `users`, `${creds?.email}`);
    let document = await getDoc(modifyDocLocation)

    if (document.exists()) {
      this._loginCreds = document.data()!
    } else {
      let firstName = window.prompt("This is your first time logging in, please enter your first name");
      let lastName = window.prompt("This is your first time logging in, please enter your last name")

      if (firstName && lastName) {
        this._loginCreds = {
          firstName: firstName,
          lastName: lastName,
          email: creds?.email,
          roles: {
            isDev: false,
            isLead: false
          }
        };

        await setDoc(modifyDocLocation, this.loginCreds)

      } else {
        window.alert("You'll need to add a first and last name next time you login")
      }
    }

    return this._loginCreds;

  }

  async getUsers() {
    let query = await getDocs(collection(this.firestore, "users"))
    return query.docs.map(doc => doc.data());
  }

  async onSaveUser(user: any) : Promise<boolean> {
    try {
      await updateDoc(doc(this.firestore, "users", user.email), user)
      return true;
    } catch (err) {
      return false;
    }
  }

}
