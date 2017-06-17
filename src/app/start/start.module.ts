import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthGuard } from '../auth/auth-guard.service';

import { StartRouting } from './start.routing';
import { StartComponent } from './start.component';
import { DiagramModule } from '../diagram/diagram.module';

@NgModule({
    imports: [
        CommonModule,
        StartRouting,
        DiagramModule
    ],
    providers: [AuthGuard],
    declarations: [
        StartComponent
    ],
})
export class StartModule { }
