import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DiagramComponent } from './diagram.component';
import { ChatComponent } from './chat/chat.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        DiagramComponent,
        ChatComponent
    ]
})
export class DiagramModule { }
