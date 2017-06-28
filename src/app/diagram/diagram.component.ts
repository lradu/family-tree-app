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
    public dbref: any;
    public user: any;

    public diagram;

    public svg: any;
    public gNodes: any;
    public gRelationships: any;

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


        this.getData();
    }

    // Render diagram
    render(data) {
        let nodes, relationships;

        this.diagram = new Diagram();
        this.diagram.load(data);

        selectAll('svg.graph > g > *').remove();
        
        nodes = new RenderNodes();
        nodes.render(this.gNodes, this.diagram.nodes);

        relationships = new RenderRelationships();
        relationships.render(this.gRelationships, this.diagram.relationships);
    }

    getData() {
        if(!this.user) { return; }
        
        this.dbref
            .child('users/' + this.user.uid)
            .on('value', (snapShot) => {
                if(snapShot.val()) {
                    this.handleData(snapShot.val());
                }
            });
    }

    handleData(data) {
        let node = new Node();
        let size = 0, longestText = '';
        let nodes = {};

        if(data.info){
            Object.keys(data.info)
                .map(key => {
                    let val = key +  ': ' + data.info[key];
                    if(val.length > longestText.length){
                        longestText = val;
                    }
                    node.properties.push(val);
                });

            size = this.getTxtLength(longestText);
            node.propertiesWidth = size;
            nodes["firstNode"] = node;

            if(data.partnerName){
                let partner = new Node();

                partner.x+= 400;

                longestText = "name: " + data.partnerName;
                size = this.getTxtLength(longestText);
                partner.propertiesWidth = size;
                partner.properties.push(longestText);
                nodes["secondNode"] = partner;
            }
        }

        this.render({
            nodes: nodes
        });
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
