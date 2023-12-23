import {Component, inject, OnInit, Sanitizer} from '@angular/core';
import {Mose} from "../../../../@interfaces/mose-file/mose-file";
import {MoseManager} from "../../../../core/structure/classes/mose-manager";
import {AuthService} from "../../../../@services/auth/auth.service";
import {MoseUserManager} from "../../../../core/structure/classes/mose-user-manager";
import {ActivatedRoute, Data} from "@angular/router";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {SubtitlesService} from "../../../../@services/subtitles/subtitles.service";
import {Firestore} from "@angular/fire/firestore";
import File = Mose.File;
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";

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
  private sanitize: DomSanitizer = inject(DomSanitizer);

  private _workingFileForm: FormGroup<any> = new FormGroup<any>({});

  private _originalFile: Mose.File = new MoseManager().toObject;
  private _workingFile: Mose.File = new MoseManager().toObject;
  private _user: Mose.User = new MoseUserManager().toObject
  private _users: Mose.User[] = [];
  private _totalTranslatePercentage: number = 0;

  private _statusOptions = [
    "Awaiting Assignment",
    "English Translation Started",
    "English Translation Verified",
    "English Translation Complete",
    "Spanish Translation Started",
    "Spanish Translation Verified",
    "Spanish Translation Complete",
    "Task Complete"
  ];

  hasVideoFile = false;
  videoDataSource: SafeUrl = '';
  private videoElement: HTMLVideoElement | undefined;

  async ngOnInit() {

    // Set Users
    this.users = await this.authService.getUsers();
    this.user = this.authService.loginCreds;

    // Listen For Route Data
    this.route.data
      .subscribe((data: Data) => this.onInitWorkingFile(data['workingFile'] as Mose.File, false));

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
          item.utterance = val;
          this.onSaveFile()
        });


        // Create control for subsequent languages
        for (let lang of Object.keys(item.languages)) {

          this.workingFileForm.addControl(`WFF-${item.id}-${lang}`, new FormControl(item.languages[lang], {validators: Validators.required}));
          this._workingFileForm.get(`WFF-${item.id}-${lang}`)?.valueChanges.subscribe((val: string) => {
            item.languages[lang] = val;
            this.onSaveFile()
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

  get statusOptions(): string[] {
    return this._statusOptions;
  }

  translateAllText() {

  }

  onSetTrainingData() {

  }

  setVideoFromPicker($event: Event) {

    const picker = $event.target as unknown as HTMLInputElement;
    const file = (picker.files as unknown as FileList[])[0]

    // Handle if file comes with video

    let newUrl = URL.createObjectURL(file as any);
    this.videoDataSource = this.sanitize.bypassSecurityTrustUrl(newUrl);
    this.hasVideoFile = true;

  }

  onPlayVideo(videoSource: HTMLVideoElement) {
    videoSource.play();
  }

  onPauseVideo(videoSource: HTMLVideoElement) {
    videoSource.pause()
  }

  onStartPlayAtTime(sTime: number) {
    if(this.videoElement) {
      this.videoElement.currentTime = sTime;
      this.videoElement.play();
    }
  }

  setLocalVideoElement(videoSource: HTMLVideoElement) {
    this.videoElement = videoSource;
    let currentSelected = 0;

    this.videoElement.onplay = () => {
      setInterval(() => {
        this.workingFile.subtitles.forEach((subtitle, index) => {
          if (this.thisSubtitleActive(subtitle)) {
            if (currentSelected !== index) {
              currentSelected = index;
              subtitle.isActive = true;

              // Scroll to index
              const currentElement = document.querySelector(`#sub-${index}`) as HTMLElement;
              currentElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
              });

            }
          } else {
            subtitle.isActive = false;
          }
        });
      }, 0);
    }


  }

  thisSubtitleActive(subtitle: Mose.Subtitle) {
    let currentSoundTime = this.videoElement?.currentTime ?? 0;
    const overTime = (currentSoundTime > subtitle.sTime);
    const underTime = (currentSoundTime < subtitle.eTime);
    return (overTime && underTime);
  }
}
