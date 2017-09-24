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
    
    public diagram: Diagram;
    
    private entities: Object = {};
    private entityKeys: Object = {};
    private keyGenerator: number = 0;
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
        
        this.solvedEntities[entityId] = true;  // mark as solved
        if(this.entities[lastEntity]) {
            this.entities[lastEntity][relationship] = entityId;
        } else {
            this.entities[lastEntity] = {
                [relationship]: entityId
            }
        }
        
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
        // assign key to the mother entity
        if(relationship === "mother" && this.entityKeys['mother'] !== undefined){
            this.entityKeys[key] = this.entityKeys['mother'];
            delete(this.entityKeys['mother']);
        }
        
        if(this.entityKeys[key] === undefined){
            this.assignKey(key);
        }
        
        let birthday;
        if(data.age) {
            const today = new Date();
            today.setFullYear(today.getFullYear() - data.age);
            birthday = today.toLocaleDateString();
        }
        
        // n: name, s: sex, m: mother, f: father, ux: wife, vir: husband, a: age 
        const node = {
            key: this.entityKeys[key],
            n: data.name || relationship,
            s: data.gender || "F",
            a: data.age,
            birthday: birthday
        };
        
        this.diagram.updateNode(node);
        
        // create parents
        if(relationship === 'father' && this.entityKeys['mother'] === undefined) {
            //create mother node
            this.assignKey('mother');
            this.diagram.updateNode({
                key: this.entityKeys['mother'],
                n: 'Mother',
                s: 'F'
            });
            
            const fatherKey = this.entityKeys[key];
            const motherKey = this.entityKeys['mother'];
            const childKey = this.entityKeys[lastEntity];
            
            // add marriage between parents
            const isTrue = this.diagram.addMarriage({
                key: fatherKey,
                ux: motherKey
            });
            
            // prevent adding new link when already exits
            if(isTrue) {
                // add parent-child link
                this.diagram.addParent({
                    key: childKey,
                    f: fatherKey,
                    m: motherKey
                });
            }
        }
        
        // create a marriage link
        if(relationship === 'wife' || relationship === 'husband') {
            const partnerKey = this.entityKeys[lastEntity]
            let data;
            if(relationship === 'wife') {
                data = {
                    key: this.entityKeys[key],
                    ux: partnerKey
                }
            } else {
                data = {
                    key: partnerKey,
                    ux: this.entityKeys[key]
                }
            }
            
            this.diagram.addMarriage(data);
        }
    }
    
    private assignKey(key){
        this.entityKeys[key] = this.keyGenerator;
        ++this.keyGenerator;
    }
}