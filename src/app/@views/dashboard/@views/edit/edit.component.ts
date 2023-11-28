import {Component, inject, OnInit} from '@angular/core';
import {Mose} from "../../../../@interfaces/mose-file/mose-file";
import {MoseManager} from "../../../../core/structure/classes/mose-manager";
import {AuthService} from "../../../../@services/auth/auth.service";
import {MoseUserManager} from "../../../../core/structure/classes/mose-user-manager";
import {ActivatedRoute} from "@angular/router";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {SubtitlesService} from "../../../../@services/subtitles/subtitles.service";
import {doc, Firestore, onSnapshot} from "@angular/fire/firestore";
import {environment} from "../../../../../environments/environment";

interface LiveFeed {
  elementID: string,
  cursorPosition: number,
  user: Mose.User,
  isActive: boolean,
  inDocument: boolean
}

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss', '../compare/compare.component.scss']
})
export class EditComponent implements OnInit {

  // Private Services
  private authService: AuthService = inject(AuthService);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private firestore: Firestore = inject(Firestore);
  private subtitleService: SubtitlesService = inject(SubtitlesService);

  private _workingFileForm: FormGroup<any> = new FormGroup<any>({});

  private _originalFile: Mose.File = new MoseManager().toObject;
  private _workingFile: Mose.File = new MoseManager().toObject;
  private _user: Mose.User = new MoseUserManager().toObject
  private _users: Mose.User[] = [];
  private _totalTranslatePercentage: number = 0;

  liveFeedUsers: LiveFeed[] = [];

  async ngOnInit() {

    // Set Users
    this.users = await this.authService.getUsers();
    this.user = this.authService.loginCreds;

    // Listen For Route Data
    // TODO: Cleanup Subscription
    this.route.data
      .subscribe((data) => {

        // Listen for changes to data
        let updates = 0;

        const file: Mose.File = data['workingFile'] as Mose.File;
        this.liveFeedUsers = Object.values(file.liveFeed as any) as unknown as LiveFeed[];
        this.onInitWorkingFile(file, updates > 0);

        onSnapshot(doc(this.firestore, `subtitles${environment.production ? '' : '-staging'}`, this.route.snapshot.params['uuid']), (doc) => {
          if (updates > 0) {
            this.updateForm(doc.data() as Mose.File)
          }
          updates++;
        });
      });

  }

  onInitWorkingFile(file: Mose.File, isUpdating: boolean = false) {

    if (this.workingFileForm.pristine || isUpdating) {

      this._originalFile = file;

      // Reset Form
      this.workingFileForm = new FormGroup<any>({});

      for (let item of file.subtitles) {

        // Create Master Control else {
        this.workingFileForm.addControl(`WFF-${item.id}`, new FormControl(item.utterance, {validators: Validators.required}));
        this._workingFileForm.get(`WFF-${item.id}`)?.valueChanges.subscribe((val: string) => {

          // if(item.utterance)

          item.utterance = val;


          // this.onCheckCursorLocation(`WFF-${item.id}`)
        });


        // Create control for subsequent languages
        for (let lang of Object.keys(item.languages)) {

          this.workingFileForm.addControl(`WFF-${item.id}-${lang}`, new FormControl(item.languages[lang], {validators: Validators.required}));
          this._workingFileForm.get(`WFF-${item.id}-${lang}`)?.valueChanges.subscribe((val: string) => {
            item.languages[lang] = val;
            this.onCheckCursorLocation(`WFF-${item.id}-${lang}`);
          });

        }
      }

      // Last step of process
      this.workingFile = file;

    } else {

      // Make sure form doesn't need to be saved
      this.onBeforeCloseWorkingFile(file);

    }

  }

  onSaveFile() {
    console.log(this.workingFile);
    this.subtitleService.saveDocument(this.workingFile);
  }

  onAssignedSelectChange() {
    //TODO: Refactor and add this to a form controller
  }

  onBeforeCloseWorkingFile(file: Mose.File) {

    // Reset form
    this.workingFileForm.reset();

  }


  get workingFile(): Mose.File {
    return this._workingFile as Mose.File;
  }

  set workingFile(value: Mose.File) {
    this._workingFile = value;
  }

  get user(): Mose.User {
    return this._user;
  }

  set user(value: Mose.User) {
    this._user = value;
  }


  get users(): Mose.User[] {
    return this._users;
  }

  set users(value: Mose.User[]) {
    this._users = value;
  }


  get totalTranslatePercentage(): number {
    return this._totalTranslatePercentage;
  }

  set totalTranslatePercentage(value: number) {
    this._totalTranslatePercentage = value;
  }


  get workingFileForm(): FormGroup<any> {
    return this._workingFileForm;
  }

  set workingFileForm(value: FormGroup<any>) {
    this._workingFileForm = value;
  }

  get originalFile(): Mose.File {
    return this._originalFile;
  }

  set originalFile(value: Mose.File) {
    this._originalFile = value;
  }

  onCheckCursorLocation(id: string) {
    const cursorPosition = (document.getElementById(id) as any).selectionStart;
    this.updateLiveFeed({
      elementID: id,
      cursorPosition,
      user: this.user,
      isActive: true,
      inDocument: true
    })
  }

  // TODO CHANGE TO AN INTERFACE
  private updateLiveFeed(param: {
    elementID: string,
    cursorPosition: number,
    user: Mose.User,
    isActive: boolean,
    inDocument: boolean
  }) {

    // Verify Property Exist
    if (!this.workingFile.liveFeed) {
      this.workingFile['liveFeed'] = {};
    }

    // Set Working File
    // TODO: Dont change original
    Object.assign(this.workingFile, param)
    this.workingFile.liveFeed[param.user.email] = param;
    console.log(this.workingFile.liveFeed[param.user.email])

    // Save File
    this.onSaveFile();

  }

  private updateForm(data1: Mose.File) {
    for (let item of data1.subtitles) {

      if(this.workingFileForm.get(`WFF-${item.id}`)?.getRawValue() != item.utterance) {
        this.workingFileForm.get(`WFF-${item.id}`)?.patchValue(item.utterance);
      }

      // Create control for subsequent languages
      for (let lang of Object.keys(item.languages)) {
        if(this.workingFileForm.get(`WFF-${item.id}-${lang}`)?.getRawValue() != item.languages[lang]) {
          this.workingFileForm.get(`WFF-${item.id}-${lang}`)?.patchValue(item.languages[lang]);
        }
      }

    }
  }
}
