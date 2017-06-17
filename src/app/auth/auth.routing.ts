import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginAnonymouslyComponent } from './auth.component';

const appRoutes: Routes = [
    { path: 'login-a', component: LoginAnonymouslyComponent }
];

export const authRouting: ModuleWithProviders = RouterModule.forRoot(appRoutes);