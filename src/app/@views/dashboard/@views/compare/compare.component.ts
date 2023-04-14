import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {SubtitlesService} from "../../../../@services/subtitles/subtitles.service";
import {doc, Firestore, updateDoc} from "@angular/fire/firestore";
import {HttpClient} from "@angular/common/http";

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

  async ngOnInit(): Promise<void> {

    this.subtitles = await this.subtitleService.getAllSubtitles();
    this.replacers = await this.subtitleService.getAllReplacers();

    if(this.isAutoSaving) { this.enableAutoSave() }


  }

  ngOnDestroy() {
    this.disableAutoSave()
  }

  onSelectSubtitleWorkingFile(file: any) {
    this.workingFile = file;
  }

  async saveFile() {
    try {
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
    this.updatingNumber = 1;
    for (const subtitle of this.workingFile.subtitles) {
      const translation = await this.http.post<any>(`http://103-89-12-225.cloud-xip.com:5000/translate`,
        {
          q: subtitle.utterance,
          source: 'en',
          target: 'es',
          format: 'text',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          api_key: ''
        },
        {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          headers: {'Content-Type': 'application/json'}
        }).toPromise();

      subtitle.languages.es = translation.translatedText;
      this.updatingNumber++;
    }

    await this.saveFile();
    window.alert(`Translation Complete: ${this.updatingNumber}/${this.workingFile.subtitles.length - 1}`);
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
}
