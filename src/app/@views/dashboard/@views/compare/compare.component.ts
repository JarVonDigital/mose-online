import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {SubtitlesService} from "../../../../@services/subtitles/subtitles.service";
import {doc, Firestore, updateDoc} from "@angular/fire/firestore";

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

  async ngOnInit(): Promise<void> {

    this.subtitles = await this.subtitleService.getAllSubtitles()

    setInterval(async () => {
      if (this.workingFile) {
        await this.saveFile()
      } else {
        console.log('Autosave Pending Document. Will try again in 30 seconds.')
      }

    }, 15000)

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
}
