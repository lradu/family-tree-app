import { Component, OnInit, Inject } from '@angular/core';

import { FirebaseApp } from 'angularfire2';
import { select, selectAll } from 'd3';

import { Diagram } from './models/diagram.model';
import { Node } from './models/node.model';
import { Relationship } from './models/relationship.model';
import { RenderNodes } from './models/render-nodes';
import { RenderRelationships } from './models/render-relationships';

@Component({
    selector: 'app-diagram',
    templateUrl: './diagram.component.html',
    styleUrls: ['./diagram.component.css']
})

export class DiagramComponent implements OnInit {
    private dbref: any;
    private user: any;

    private diagram;

    private svg: any;
    private gNodes: any;
    private gRelationships: any;

    private nodes = {};
    private solvedEntities = {};

    constructor(@Inject(FirebaseApp) firebase: any) {
        this.dbref = firebase.database().ref();
        this.user = firebase.auth().currentUser;
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
            this.getEntitiesData(this.user.uid, 0);
        }
    }

    getEntitiesData(entityId, lvl){
        if(lvl === 10) { return; }

        this.solvedEntities[entityId] = true;

        this.dbref
            .child('users/' + entityId + '/entities')
            .on('child_added', (snapShot) => {
                if(snapShot.val() && !this.solvedEntities[snapShot.val()]){
                    this.getEntitiesData(snapShot.val(), lvl + 1);
                }
            });

        this.dbref
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


        this.render();
    }

    // Render diagram
    render() {
        let nodes, relationships;

        this.diagram = new Diagram();
        this.diagram.load({
            nodes: this.nodes
        });

        selectAll('svg.graph > g > *').remove();
        
        nodes = new RenderNodes();
        nodes.render(this.gNodes, this.diagram.nodes);

        relationships = new RenderRelationships();
        relationships.render(this.gRelationships, this.diagram.relationships);
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
