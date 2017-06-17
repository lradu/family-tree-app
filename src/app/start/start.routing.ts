import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../auth/auth-guard.service';

import { StartComponent } from './start.component';
import { DiagramComponent } from '../diagram/diagram.component';

const appRoutes: Routes = [
    {  path: 'start',
        component: StartComponent,
        canActivate: [AuthGuard],
        children: [
            { path: '', component: DiagramComponent }
        ]
    },
];

export const StartRouting: ModuleWithProviders = RouterModule.forChild(appRoutes)