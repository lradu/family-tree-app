import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { authRouting } from './auth.routing';
import { LoginAnonymouslyComponent } from './auth.component';
import { AngularFireAuth } from 'angularfire2/auth'

@NgModule({
    imports: [
        authRouting,
        CommonModule,
    ],
    declarations: [
        LoginAnonymouslyComponent
    ],
    providers: [
      AngularFireAuth
    ]
})

export class AuthModule {}