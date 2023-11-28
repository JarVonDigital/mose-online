import {inject, Injectable} from '@angular/core';
import {
  collection,
  doc,
  Firestore,
  getDoc,
  getDocs,
  query,
  setDoc, updateDoc,
} from "@angular/fire/firestore";
import {Mose} from "../../@interfaces/mose-file/mose-file";
import {MoseManager} from "../../core/structure/classes/mose-manager";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class SubtitlesService {

  private firestore: Firestore = inject(Firestore);

  constructor() {
    // this.copyToStagingDocument()
    //   .then(() => console.log('Copy Complete.'));
  }

  async getAllSubtitles() {
    try {
      let docQuery = await getDocs(collection(this.firestore, `subtitles${environment.production ? '' : '-staging'}`))
      return docQuery.docs.map((sub) => sub.data() as Mose.File)
    } catch(err) {
      console.log(err);
      return [new MoseManager().toObject];
    }
  }

  async getAllReplacers() {
    try {
      let docQuery = await getDoc(doc(this.firestore, 'system', `settings${environment.production ? '' : '-staging'}`))
      return docQuery.data()?.['replacers'] as any[];
    } catch (err) {
      console.log(err)
      return [];
    }
  }



  async copyToStagingDocument() {
    try {

      // Queries
      let subtitleQuery = await getDocs(query(collection(this.firestore, 'subtitles')));
      let settingsQuery = await getDocs(query(collection(this.firestore, 'system')));
      let usersQuery = await getDocs(query(collection(this.firestore, 'users')));

      // Copy Settings
      await setDoc(doc(this.firestore, 'system/settings-staging'), settingsQuery.docs[0].data());

      // Copy Users
      for (let user of usersQuery.docs) {
        await setDoc(doc(this.firestore, 'users-staging', user.id), user.data());
      }

      // Loop through Subtitles
      for (let document of subtitleQuery.docs) {
        await setDoc(doc(this.firestore, 'subtitles-staging', document.id), document.data());
      }

    } catch (err) {
      console.log(err);
    }
  }

  async saveDocument(workingFile: Mose.File) {
    try {
      await updateDoc(doc(this.firestore, 'subtitles-staging', workingFile.title), workingFile as any);
    } catch(err) {
      console.log(err);
    }
  }
}
