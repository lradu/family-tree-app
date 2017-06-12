import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AngularFireModule } from 'angularfire2';

import { AppRouting } from './app.routing';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { StartModule } from './start/start.module';

export const environment = {
    production: false,
    firebase: {
        apiKey: "AIzaSyD1YosqyxZALbp9VsG7L9opMqZiZz1fjz8",
        authDomain: "family-tree-app.firebaseapp.com",
        databaseURL: "https://family-tree-app.firebaseio.com",
        projectId: "family-tree-app",
        storageBucket: "family-tree-app.appspot.com",
        messagingSenderId: "862196492890"
    }
};



@NgModule({
    declarations: [
        AppComponent,
        HomeComponent
    ],
    imports: [
        BrowserModule,
        AngularFireModule.initializeApp(environment.firebase),
        StartModule,
        FormsModule,
        AppRouting,
        HttpModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
