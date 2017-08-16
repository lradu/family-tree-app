/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AngularFireModule } from 'angularfire2';
import { AngularFireAuth } from 'angularfire2/auth';

import { LoginAnonymouslyComponent } from './auth.component';

describe('LoginAnonymouslyComponent', () => {
    let component: LoginAnonymouslyComponent;
    let fixture: ComponentFixture<LoginAnonymouslyComponent>;

    beforeEach(async(() => {
        const firebaseConfig = {
            apiKey: "AIzaSyD1YosqyxZALbp9VsG7L9opMqZiZz1fjz8",
            authDomain: "family-tree-app.firebaseapp.com",
            databaseURL: "https://family-tree-app.firebaseio.com",
            projectId: "family-tree-app",
            storageBucket: "family-tree-app.appspot.com",
            messagingSenderId: "862196492890"
        }

        TestBed.configureTestingModule({
            declarations: [ 
                LoginAnonymouslyComponent
            ],
            imports: [
                AngularFireModule.initializeApp(firebaseConfig),
                RouterTestingModule
            ],
            providers: [
              AngularFireAuth
            ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LoginAnonymouslyComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
