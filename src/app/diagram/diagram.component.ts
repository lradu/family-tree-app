import { Component, OnInit, Inject } from '@angular/core';

import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { select, selectAll } from 'd3';

import { Diagram } from './models/diagram.model';
import { Node } from './models/node.model';
import { Relationship } from './models/relationship.model';

@Component({
    selector: 'app-diagram',
    templateUrl: './diagram.component.html',
    styleUrls: ['./diagram.component.css']
})

export class DiagramComponent implements OnInit {
    private db: any;
    private user: any;

    private diagram;
    private svg: any;
    private gNodes: any;
    private gRelationships: any;

    private nodes = {};
    private solvedEntities = {};

    constructor(db: AngularFireDatabase, auth: AngularFireAuth) {
        this.db = db.database.ref();
        this.user = auth.auth.currentUser;

        this.diagram = new Diagram();
    }

    ngOnInit() {
        // create svg
        this.svg = select("#diagram")
            .append("svg")
                .attr("class", "graph");
        this.gNodes = this.svg.append("g")
            .attr("class", "layer nodes");
        this.gRelationships = this.svg.append("g")
            .attr("class", "layer relationships");

        if(this.user){
            this.getEntities(this.user.uid, 0);
        }
    }

    getEntities(entityId, lvl){
        if(lvl === 10) { return; }

        this.solvedEntities[entityId] = true;

        this.db
            .child('users/' + entityId + '/entities')
            .on('child_added', (snapShot) => {
                if(snapShot.val() && !this.solvedEntities[snapShot.val()]){
                    this.getEntities(snapShot.val(), lvl + 1);
                }
            });

        this.db
            .child('users/' + entityId + '/info')
            .on('value', (snapShot) => {
                if(snapShot.val()){
                    this.updateNode(snapShot.val(), entityId);
                }
            });
    }

    updateNode(data, id){
        let node = new Node();
        let size = 0, longestText = '';

        node.id = id;

        Object.keys(data)
            .map(key => {
                let val = key +  ': ' + data[key];
                if(val.length > longestText.length){
                    longestText = val;
                }
                node.properties.push(val);
            });

        size = this.getTxtLength(longestText);
        node.propertiesWidth = size;

        this.nodes[id] = node;


        this.init();
    }

    // Render diagram
    init() {
        this.diagram.init({
            nodes: this.nodes
        });

        selectAll('svg.graph > g > *').remove();

        this.diagram.renderNodes(this.gNodes);
        this.diagram.renderRelationships(this.gRelationships);
    }

    getTxtLength(text) {
        let txt = this.svg.append("text")
            .attr("font-size",  "24px")
            .text(text);
        let size = txt.node().getComputedTextLength() / 2 + 8;
        txt.remove();

        return size < 50 ? 50:size;
    }
}
