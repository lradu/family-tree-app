import { Component, AfterViewInit, OnInit, Inject } from '@angular/core';

import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

import { Diagram } from './models/diagram.model';
import { Relationship } from './models/relationship.model';

@Component({
    selector: 'app-diagram',
    templateUrl: './diagram.component.html',
    styleUrls: ['./diagram.component.css']
})

export class DiagramComponent implements AfterViewInit {
    private db: any;
    private user: any;

    public diagram;

    private nodes = {};
    private relationships = {}
    private solvedEntities = {};

    constructor(db: AngularFireDatabase, auth: AngularFireAuth) {
        this.db = db.database.ref();
        this.user = auth.auth.currentUser;
    }

    ngOnInit() {
        if(this.user){
            this.getEntities(this.user.uid, 0);
        }
    }

    ngAfterViewInit(){
        this.diagram = new Diagram('diagram');
    }

    getEntities(entityId, lvl){
        if(lvl === 10) { return; }

        this.solvedEntities[entityId] = true;

        this.db
            .child('users/' + entityId + '/entities')
            .on('child_added', (snapShot) => {
                if(snapShot.val()) {
                    //this.solveRelationships(snapShot.key, snapShot.val(), entityId);
                    if(!this.solvedEntities[snapShot.val()]){
                        this.getEntities(snapShot.val(), lvl + 1);     
                    }
                }
            });

        this.db
            .child('users/' + entityId + '/info')
            .on('value', (snapShot) => {
                if(snapShot.val()){
                    //this.updateNode(snapShot.val(), entityId);
                }
            });
    }

    // updateNode(data, id){
    //     let node = new Node();
    //     let size = 0, longestText = '';

    //     node.id = id;

    //     Object.keys(data)
    //         .map(key => {
    //             let val = key +  ': ' + data[key];
    //             if(val.length > longestText.length){
    //                 longestText = val;
    //             }
    //             node.properties.push(val);
    //         });

    //     this.nodes[id] = node;


    //     this.init();
    // }

    // solveRelationships(tag, endNode, startNode){
    //     const key = startNode + endNode;
    //     if(!this.relationships[key]) {
    //         this.relationships[key] = {};
    //     }
    // }

}
