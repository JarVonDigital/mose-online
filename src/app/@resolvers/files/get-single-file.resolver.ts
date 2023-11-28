
import {inject, Injectable} from '@angular/core';
import {
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import {Mose} from "../../@interfaces/mose-file/mose-file";
import {SubtitlesService} from "../../@services/subtitles/subtitles.service";
import {MoseManager} from "../../core/structure/classes/mose-manager";

@Injectable({
  providedIn: 'root'
})
export class GetSingleFileResolver implements Resolve<Mose.File> {

  private subtitleService: SubtitlesService = inject(SubtitlesService);

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Mose.File> {
    const subtitles = await this.subtitleService.getAllSubtitles();
    return subtitles.find((file: Mose.File) => file.title === route.params['uuid']) ?? new MoseManager().toObject;
  }
}
