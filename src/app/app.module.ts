import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { AuthComponent } from './@views/auth/auth.component';
import { CompareComponent } from './@views/dashboard/@views/compare/compare.component';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { DashboardComponent } from './@views/dashboard/dashboard.component';
import { SidebarComponent } from './@views/dashboard/@elements/sidebar/sidebar.component';
import { FilesComponent } from './@views/dashboard/@views/files/files.component';

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    CompareComponent,
    DashboardComponent,
    SidebarComponent,
    FilesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
