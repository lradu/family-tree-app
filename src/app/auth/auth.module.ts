import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { authRouting } from './auth.routing';
import { LoginAnonymouslyComponent } from './auth.component';

@NgModule({
    imports: [
        authRouting,
        CommonModule,
    ],
    declarations: [
        LoginAnonymouslyComponent
    ]
})

export class AuthModule {}