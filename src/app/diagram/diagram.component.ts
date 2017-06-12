import { Component, AfterViewInit, Inject } from '@angular/core';

import { FirebaseApp } from 'angularfire2';
import * as d3 from 'd3';

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

export class DiagramComponent implements AfterViewInit {
    public dbref: any;
    public user: any;

    public diagram;

    public svg: any;
    public gNodes: any;
    public gRelationships: any;
    public zoom: any;

    constructor(@Inject(FirebaseApp) firebase: any) {
        this.dbref = firebase.database().ref();
        this.user = firebase.auth().currentUser;
    }

    ngAfterViewInit() {
        this.svg = d3.select("#diagram")
            .append("svg")
                .attr("class", "graph");
        this.gNodes = this.svg.append("g")
            .attr("class", "layer nodes");
        this.gRelationships = this.svg.append("g")
            .attr("class", "layer relationships");
        
        let node = new Node();
        this.render({
            nodes: {
                firstNode: node
            }
        });
    }

    // Render diagram
    render(data){
        let nodes, relationships;

        this.diagram = new Diagram();
        this.diagram.load(data);

        d3.selectAll('svg.graph > g > *').remove();
        
        nodes = new RenderNodes();
        nodes.render(this.gNodes, this.diagram.nodes);

        relationships = new RenderRelationships();
        relationships.render(this.gRelationships, this.diagram.relationships);
    }

}
