import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

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
    ]
})
export class DiagramModule { }
