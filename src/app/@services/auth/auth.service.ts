import {inject, Injectable} from '@angular/core';
import {collection, doc, Firestore, getDoc, getDocs, setDoc, updateDoc} from "@angular/fire/firestore";
import {getAuth} from "@angular/fire/auth";
import {MoseUser} from "../../@interfaces/user/mose-user";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private firestore = inject(Firestore);

  private _loginCreds: MoseUser = {email: "", firstName: "", lastName: "", roles: {isDev: false, isLead: false}};

  get loginCreds() {
    return this._loginCreds;
  }
  async getLoginUser(creds?: any) {
    creds = creds ? creds.user : getAuth().currentUser;

    let modifyDocLocation = doc(this.firestore, `users`, `${creds?.email}`);
    let document = await getDoc(modifyDocLocation)

    if (document.exists()) {
      this._loginCreds = document.data()! as MoseUser
    } else {
      let firstName = window.prompt("This is your first time logging in, please enter your first name");
      let lastName = window.prompt("This is your first time logging in, please enter your last name")

      if (firstName?.trim() && lastName?.trim()) {
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
    return query.docs.map(doc => doc.data()) as MoseUser[];
  }

  async getAppKeys() {

    interface ApiKeys {
      OPEN_AI: string
    }

    let query = await getDocs(collection(this.firestore, "settings/keys"))
    return query.docs.find(doc => doc.id === 'keys') as unknown as ApiKeys;

  }

  async onSaveUser(user: MoseUser) : Promise<boolean> {
    try {
      await updateDoc(doc(this.firestore, "users", user.email), (user as any))
      return true;
    } catch (err) {
      return false;
    }
  }

}
