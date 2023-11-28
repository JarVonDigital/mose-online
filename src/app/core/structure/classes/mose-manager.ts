import {Mose} from "../../../@interfaces/mose-file/mose-file";

export class MoseManager {

  private _uuid: string = "";
  private _assignedTo: string = "";
  private _created: string = new Date().toDateString();
  private _isLocked: boolean = true;
  private _location: string = "";
  private _scrollLock: {[key: string]: string} = {};
  private _taskStatus: number = 0;
  private _title: string = "";
  private _subtitles: Mose.Subtitle[] = [];

  constructor(workingFile?: Mose.File) {
    if(workingFile) {
      this.uuid = workingFile.uuid ?? this.uuid;
      this.assignedTo = workingFile.assignedTo;
      this.created = workingFile.created;
      this.isLocked = workingFile.isLocked;
      this.location = workingFile.location;
      this.scrollLock = workingFile.scrollLock;
      this.taskStatus = workingFile.taskStatus;
      this.title = workingFile.title;
      this.subtitles = workingFile.subtitles;
    }
  }

  get toObject(): Mose.File {
    return {
      assignedTo: this.assignedTo,
      created: this.created,
      isLocked: this.isLocked,
      location: this.location,
      scrollLock: this.scrollLock,
      subtitles: this.subtitles,
      taskStatus: this.taskStatus,
      title: this.title,
      uuid: this.uuid
    }
  }

  get uuid(): string {
    return this._uuid;
  }

  set uuid(value: string) {
    this._uuid = value;
  }

  get assignedTo(): string {
    return this._assignedTo;
  }

  set assignedTo(value: string) {
    this._assignedTo = value;
  }

  get created(): string {
    return this._created;
  }

  set created(value: string) {
    this._created = value;
  }

  get isLocked(): boolean {
    return this._isLocked;
  }

  set isLocked(value: boolean) {
    this._isLocked = value;
  }

  get location(): string {
    return this._location;
  }

  set location(value: string) {
    this._location = value;
  }

  get scrollLock(): {[key: string]: string} {
    return this._scrollLock;
  }

  set scrollLock(value: {[key: string]: string}) {
    this._scrollLock = value;
  }

  get taskStatus(): number {
    return this._taskStatus;
  }

  set taskStatus(value: number) {
    this._taskStatus = value;
  }

  get title(): string {
    return this._title;
  }

  set title(value: string) {
    this._title = value;
  }

  get subtitles(): Mose.Subtitle[] {
    return this._subtitles;
  }

  set subtitles(value: Mose.Subtitle[]) {
    this._subtitles = value;
  }
}
