import { Component } from '@angular/core';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})
export class FilesComponent {

  files = [
    {
      name: 'JVMT Folder',
      icon: "https://img.icons8.com/material/96/null/folder-invoices--v1.png",
      download: "https://firebasestorage.googleapis.com/v0/b/mosesubtitles.appspot.com/o/%40JWVT.zip?alt=media&token=7c91c34f-7674-46f7-9687-f388e5bfe212"
    },
    {
      name: 'Mose Subtitle - Windows',
      icon: "https://img.icons8.com/material/96/null/exe.png",
      download: "https://firebasestorage.googleapis.com/v0/b/mosesubtitles.appspot.com/o/win-arm64-unpacked.zip?alt=media&token=30f3be53-93a8-4ad6-a695-a588f79f34b9"
    },
    {
      name: 'Mose Subtitle - Windows < (32)',
      icon: "https://img.icons8.com/material/96/null/exe.png",
      download: "https://firebasestorage.googleapis.com/v0/b/mosesubtitles.appspot.com/o/win-unpacked.zip?alt=media&token=3dd89845-72f7-4642-bd05-3a2433cfb289"
    }
  ]


}
