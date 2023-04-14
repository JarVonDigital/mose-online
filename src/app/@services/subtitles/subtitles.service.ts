import {inject, Injectable} from '@angular/core';
import {collection, doc, Firestore, getDoc, getDocs} from "@angular/fire/firestore";

@Injectable({
  providedIn: 'root'
})
export class SubtitlesService {

  private firestore: Firestore = inject(Firestore);

  async getAllSubtitles() {
    try {
      let docQuery = await getDocs(collection(this.firestore, 'subtitles'))
      return docQuery.docs.map((sub) => sub.data())
    } catch(err) {
      console.log(err);
      return false;
    }
  }

  async getAllReplacers() {
    try {
      let docQuery = await getDoc(doc(this.firestore, 'system', 'settings'))
      return docQuery.data()?.['replacers'] as any[];
    } catch (err) {
      console.log(err)
      return [];
    }
  }
}
