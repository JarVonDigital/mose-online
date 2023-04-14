import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {SubtitlesService} from "../../../../@services/subtitles/subtitles.service";
import {doc, Firestore, updateDoc} from "@angular/fire/firestore";

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
  workingFile: any;
  subtitles: any;

  autoSave: any;

  searchString = ""
  replacerString = "";
  replacers: replacer[] = [
    {search: [], replacers: []}
  ];

  async ngOnInit(): Promise<void> {

    this.subtitles = await this.subtitleService.getAllSubtitles();
    this.replacers = await this.subtitleService.getAllReplacers();

    setInterval(async () => {
      if (this.workingFile) {
        await this.saveFile()
      } else {
        console.log('Autosave Pending Document. Will try again in 10 seconds.')
      }

    }, 10000)

  }

  ngOnDestroy() {
    clearInterval(this.autoSave);
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
}
