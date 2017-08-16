import 'rxjs/add/operator/map';
import 'rxjs/add/operator/first';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth'

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private auth: AngularFireAuth, private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.auth.authState.map((auth) =>  {
            if(auth == null) {
                this.router.navigate(['/login-a']);
            } else {
                return true;
            }
        }).first();
    }
}