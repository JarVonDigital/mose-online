import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {SubtitlesService} from "../../../../@services/subtitles/subtitles.service";
import {doc, Firestore, updateDoc} from "@angular/fire/firestore";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../../../@services/auth/auth.service";
import {firstValueFrom} from "rxjs";
import {environment} from "../../../../../environments/environment";
import {MoseUser} from "../../../../@interfaces/user/mose-user";

interface replacer {
  search: string[],
  replacers: string[]
}

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.scss']
})
export class CompareComponent implements OnInit, OnDestroy {

  private firestore: Firestore = inject(Firestore);
  private subtitleService: SubtitlesService = inject(SubtitlesService);
  private http: HttpClient = inject(HttpClient);
  private authService = inject(AuthService);

  user: MoseUser | undefined;
  users: MoseUser[] | undefined;

  workingFile: any;
  subtitles: any;

  autoSave: any;

  searchString = ""
  replacerString = "";
  replacers: replacer[] = [
    {search: [], replacers: []}
  ];
  public updatingNumber: number = 0;
  public isAutoSaving: boolean = true;
  public trainingData: any[] = [];
  public trainingDataIncluded: any[] = [];

  async ngOnInit(): Promise<void> {

    this.user = this.authService.loginCreds;
    this.subtitles = await this.subtitleService.getAllSubtitles();
    this.replacers = await this.subtitleService.getAllReplacers();
    this.users = await this.authService.getUsers()

    if(this.isAutoSaving) { this.enableAutoSave() }

  }

  ngOnDestroy() {
    this.disableAutoSave()
  }

  onSelectSubtitleWorkingFile(file: any) {
    file.isLocked = (file.isLocked === undefined) ? false : file.isLocked;
    this.workingFile = file;

    if(this.user?.roles.isDev) {
      this.onSetTrainingData();
    }
  }

  onSetTrainingData() {

    // Hard Stop if we've already included said file
    if(this.trainingDataIncluded.includes(this.workingFile.title)) return;

    // DEV: Create a JSON Version for training\
    for(let sub of this.workingFile.subtitles) {
      this.trainingData.push({
        prompt: sub.utterance + ";;",
        completion: sub.languages.es + ";;"
      })
    }

    this.trainingDataIncluded.push(this.workingFile.title);
    console.log(`Set Complete: ${this.workingFile.title}`)

  }

  onGetTrainingData() {
    console.log(this.trainingData);
    this.onGetLastScrollPositionOfDocument()
  }

  async saveFile() {
    try {
      this.onSaveLastScrollPositionToDocument();
      await updateDoc(doc(this.firestore, `subtitles`, this.workingFile.title), this.workingFile);
    } catch(err) {
      console.log(err)
    }

  }

  async addReplacement() {

    this.replacers.push({
      search: [this.searchString.toUpperCase(), (this.searchString.charAt(0).toUpperCase() + this.searchString.slice(1).toLowerCase()), this.searchString.toLowerCase()],
      replacers: [this.replacerString.toUpperCase(), (this.replacerString.charAt(0).toUpperCase() + this.replacerString.slice(1).toLowerCase()), this.replacerString.toLowerCase()]
    })

    await this.saveReplacerDoc();

    this.searchString = "";
    this.replacerString = "";

  }

  async removeReplacer(i: number) {

    if(window.confirm("Are you sure you want to delete this replacer?")) {
      this.replacers.splice(i, 1);
      await this.saveReplacerDoc();
    }

  }

  private async saveReplacerDoc() {
    await updateDoc(doc(this.firestore, "system", "settings"), {
      replacers: this.replacers
    })
  }

  async replaceAllText() {
    if(!this.workingFile) return;
    let isConfirmed = window.confirm("Your are about to replace some or all spanish translation with english text. Do you want to proceed with this action?");
    let replaced: any[] = [];

    if(isConfirmed) {

      this.workingFile.subtitles.forEach((sub: any) => {
        let utterance: any = sub.languages.es
        this.replacers.forEach(rep => {
          if(utterance.toUpperCase().includes(rep.search[0])) {
            rep.search.forEach((alt, i) => {
              sub.languages.es = sub.languages.es.replaceAll(rep.search[i], rep.replacers[i])
            })
            replaced.push(utterance, sub.languages.es);
            console.log(sub.languages.es);
          }
        })
      })

      this.workingFile.markForCheck();
      window.alert("Text have been successfully replaced!");
      await this.saveFile()

    }
  }

  async translateAllText() {
    if(!window.confirm("Are you sure you want to translate English to Spanish?")) return;
    this.updatingNumber = 0;
    for (const subtitle of this.workingFile.subtitles) {
      const translation = await firstValueFrom(
        this.http.post<any>(`https://api.openai.com/v1/completions`,
        {
          model: 'curie:ft-jarvondigital:mose-translate-2023-08-14-00-31-43',
          prompt: `${subtitle.utterance};;`,
          temperature: 0,
          max_tokens: 256,
          stop: ';;'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${environment.OPENAI_API_KEY}`
          }
        })
      );

      subtitle.languages.es = translation.choices[0].text.trim();
      this.updatingNumber++;
    }

    await this.saveFile();
    window.alert(`Translation Complete`);
    this.updatingNumber = 0;
  }

  toggleAutoSave() {
    if(this.isAutoSaving) {
      if(window.confirm("Are you sure you want to disable AutoSave?")) {
        this.isAutoSaving = false;
        this.disableAutoSave();
      }
    } else {
      this.isAutoSaving = true;
      this.enableAutoSave();
    }
  }

  private disableAutoSave() {
    clearInterval(this.autoSave);
  }

  private enableAutoSave() {
    console.log("Enabling AutoSave...")
    this.autoSave = setInterval(async () => {
      if (this.workingFile) {
        await this.saveFile()
      } else {
        console.log('Autosave Pending Document. Will try again in 10 seconds.')
      }

    }, 10000)
  }

  async onLockFile() {
    let confirm = window.confirm("Are you sure you want to lock this file and mark as completed?")

    if(confirm) {
      let input = window.prompt("Please enter your name (First and Last) to mark as completed");

      if(input) {
        if(input?.toUpperCase() === (this.user?.firstName.toUpperCase() +" "+ this.user?.lastName.toUpperCase())) {
          this.workingFile.isLocked = true;
          await this.saveFile()
          window.alert("This file has been successfully locked!")
        } else {
          window.alert("The name entered does not match, please try again or ask your lead for assistance.")
        }
      }

    }
  }

  async onUnlockFile() {
    if(this.workingFile.isLocked) {
      let confirm = window.confirm("Are you sure you want to unlock? This files completion status will be reset.")
      if(confirm) {
        this.workingFile.isLocked = false;
        await this.saveFile()
      }
    }
  }

  async onAssignedSelectChange() {
    await this.saveFile()
  }

  private onSaveLastScrollPositionToDocument() {

    let editor = document.getElementById("editor") as HTMLElement;

    if(this.user) {
      if(editor) {
        if(!this.workingFile.scrollLock) { this.workingFile.scrollLock = {}; }
        this.workingFile.scrollLock[this.user.email] = editor.scrollTop;
      }
    }
  }

  private onGetLastScrollPositionOfDocument() {
    let editor = document.getElementById("editor") as HTMLElement;

    if(editor && this.user) {
      if(!this.workingFile.scrollLock) {
        this.workingFile.scrollLock = {}
      }
      editor.scrollTop = (this.workingFile.scrollLock[this.user.email] as number) || 0;
    }

  }

  getPercent(number: number) {
    return Math.round(number);
  }

  genSrtFromJSON(json: any, language = 'en') {
    let string = "";

    if(language === 'en') {
      json.subtitles.forEach((subtitle: any, index: number) => {
        string +=`${index + 1}\n${subtitle.sTimeFormatted} --> ${subtitle.eTimeFormatted}\n${subtitle.utterance}\n\n`
      })
    } else {
      json.subtitles.forEach((subtitle: any, index: number) => {
        string +=`${index + 1}\n${subtitle.sTimeFormatted} --> ${subtitle.eTimeFormatted}\n${subtitle.languages[language]}\n\n`
      })
    }

    const link = document.createElement("a");
    const file = new Blob([string], {type: 'text/plain'});
    link.href = URL.createObjectURL(file);
    link.download = `${json.title}-${language}.srt`;
    link.click();
    URL.revokeObjectURL(link.href);

    return string;
  }

  onGenerateSRT(language: 'en' | 'es') {
    this.genSrtFromJSON(this.workingFile, language);
  }
}
