import { Component, AfterViewInit, OnInit, Inject } from '@angular/core';

import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

import { Diagram } from './models/diagram.model';
import { Node } from './models/node.model';

@Component({
    selector: 'app-diagram',
    templateUrl: './diagram.component.html',
    styleUrls: ['./diagram.component.css']
})

export class DiagramComponent implements AfterViewInit {
    private db: any;
    private user: any;

    public diagram;

    private keyGenerator: number = 0;
    private entitiyKeys: Object = {};
    private solvedEntities = {};

    constructor(db: AngularFireDatabase, auth: AngularFireAuth) {
        this.db = db.database.ref();
        this.user = auth.auth.currentUser;
    }

    ngAfterViewInit(){
        if(this.user){
            this.getEntities(this.user.uid,"me", this.user.uid, 0);
        }

        this.diagram = new Diagram('diagram');
        this.diagram.init([], 0);
    }

    getEntities(entityId, relationship, lastEntity, lvl){
        if(lvl === 10) { return; }

        this.solvedEntities[entityId] = true;

        this.db
            .child('users/' + entityId + '/entities')
            .on('child_added', (snapShot) => {
                if(snapShot.val()) {
                    if(!this.solvedEntities[snapShot.val()]){
                        this.getEntities(snapShot.val(), snapShot.key, entityId, lvl + 1);     
                    }
                }
            });

        this.db
            .child('users/' + entityId + '/info')
            .on('value', (snapShot) => {
                if(snapShot.val()){
                    this.solveEntity(snapShot.val(), entityId, relationship, lastEntity);
                }
            });
    }

    solveEntity(data, key, relationship, lastEntity){
        // n: name, s: sex, m: mother, f: father, ux: wife, vir: husband, a: age 

        if(!this.entitiyKeys[key]){
            this.entitiyKeys[key] = this.keyGenerator;
            ++this.keyGenerator;
        }

        const node = {
          key: this.entitiyKeys[key],
          n: data.name,
          s: data.gender === "male" ? "M":"F",
          a: data.age
        };

        this.diagram.updateNode(node);
    }
}