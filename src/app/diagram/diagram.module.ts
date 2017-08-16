import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { DiagramComponent } from './diagram.component';
import { ChatComponent } from './chat/chat.component';
import { ZoomComponent } from './zoom/zoom.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        DiagramComponent,
        ChatComponent,
        ZoomComponent
    ],
    providers: [
        AngularFireDatabase,
        AngularFireAuth
    ]
})
export class DiagramModule { }
