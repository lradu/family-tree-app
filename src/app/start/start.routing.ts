import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StartComponent } from './start.component';
import { DiagramComponent } from '../diagram/diagram.component';

const appRoutes: Routes = [
    {  path: 'start',
        component: StartComponent,
        children: [
            { path: '', component: DiagramComponent }
        ]
    },
];

export const StartRouting: ModuleWithProviders = RouterModule.forChild(appRoutes)