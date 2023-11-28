import {Mose} from "../../../@interfaces/mose-file/mose-file";

export class MoseUserManager {

  private _email: string = "";
  private _firstName: string = "";
  private _lastName: string = "";
  private _workingLanguage: string = "";

  private _isDev: boolean = false;
  private _isLead: boolean = false;
  private _roles: Mose.Roles = {
    isDev: this._isDev,
    isLead: this._isLead
  }

  constructor() {
  }

  get toObject(): Mose.User {
    return {
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      workingLanguage: this.workingLanguage,
      roles: this.roles
    }
  }


  get email(): string {
    return this._email;
  }

  set email(value: string) {
    this._email = value;
  }

  get firstName(): string {
    return this._firstName;
  }

  set firstName(value: string) {
    this._firstName = value;
  }

  get lastName(): string {
    return this._lastName;
  }

  set lastName(value: string) {
    this._lastName = value;
  }

  get workingLanguage(): string {
    return this._workingLanguage;
  }

  set workingLanguage(value: string) {
    this._workingLanguage = value;
  }

  get isDev(): boolean {
    return this._isDev;
  }

  set isDev(value: boolean) {
    this._isDev = value;
  }

  get isLead(): boolean {
    return this._isLead;
  }

  set isLead(value: boolean) {
    this._isLead = value;
  }

  get roles(): Mose.Roles {
    return this._roles;
  }

  set roles(value: Mose.Roles) {
    this._roles = value;
  }
}
