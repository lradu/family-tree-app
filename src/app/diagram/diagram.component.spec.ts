/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

import { DiagramComponent } from './diagram.component';
import { ChatComponent } from './chat/chat.component';

describe('DiagramComponent', () => {
    let component: DiagramComponent;
    let fixture: ComponentFixture<DiagramComponent>;

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
                DiagramComponent,
                ChatComponent
            ],
            imports: [
                AngularFireModule.initializeApp(firebaseConfig)
            ],
            providers: [
                AngularFireDatabase,
                AngularFireAuth
            ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DiagramComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
