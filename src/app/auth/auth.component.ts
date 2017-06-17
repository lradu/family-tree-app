import { Component, Inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpModule } from '@angular/http';

import { AngularFire, AuthMethods, AuthProviders, FirebaseApp } from 'angularfire2';

@Component({
    templateUrl: './login-a.component.html'
})

export class LoginAnonymouslyComponent implements OnInit {
    constructor(private af: AngularFire, private router: Router) {}

    ngOnInit() {
        this.af.auth.login({
            method: AuthMethods.Anonymous,
            provider: AuthProviders.Anonymous
        }).then(
        (success) => {
            this.router.navigate(['/start']);
        });
    }
}