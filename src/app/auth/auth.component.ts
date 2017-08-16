import { Component, Inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpModule } from '@angular/http';

import { AngularFireAuth } from 'angularfire2/auth'

@Component({
    templateUrl: './login-a.component.html'
})

export class LoginAnonymouslyComponent implements OnInit {
    constructor(private afAuth: AngularFireAuth, private router: Router) {}

    ngOnInit() {
        this.afAuth.auth.signInAnonymously()
            .then((success) => {
                this.router.navigate(['/start']);
            });
    }
}