/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { StartComponent } from './start.component';

describe('StartComponent', () => {
    let component: StartComponent;
    let fixture: ComponentFixture<StartComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ StartComponent ],
            imports: [
                RouterTestingModule
            ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
