import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
    MdFormFieldModule,
    MdInputModule,
    MdIconModule
} from '@angular/material';

import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { DiagramComponent } from './diagram.component';
import { ChatComponent } from './chat/chat.component';

@NgModule({
    imports: [
        CommonModule,
        BrowserAnimationsModule,
        MdFormFieldModule,
        MdInputModule,
        MdIconModule
    ],
    declarations: [
        DiagramComponent,
        ChatComponent
    ],
    providers: [
        AngularFireDatabase,
        AngularFireAuth
    ]
})
export class DiagramModule { }
