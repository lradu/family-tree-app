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
        
        this.getData();
    }

    // Render diagram
    render(data) {
        let nodes, relationships;

        this.diagram = new Diagram();
        this.diagram.load(data);

        d3.selectAll('svg.graph > g > *').remove();
        
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
        let size, center;

        if(data.name) {
            size = this.getTxtLength(data.name);
            node.radius = size;
            node.caption = data.name;
        };
        if(data.age) {
            size = this.getTxtLength(data.name);
            node.propertiesWidth = size;
            node.properties = data.age;
        };

        center = this.getSvgCenter();
        node.x = center[0] - node.radius;
        node.y = center[1] - node.radius;

        this.render({
            nodes: {
                firstNode: node
            }
        });
    }

    getTxtLength(text) {
        let txt = this.svg.append("text")
            .attr("font-size",  "50px")
            .text(text);
        let size = txt.node().getComputedTextLength() / 2 + 20;
        txt.remove();

        return size < 50 ? 50:size;
    }

    getSvgCenter() {
        let svg = this.svg.node();

        let fullWidth = svg.clientWidth || svg.parentNode.clientWidth,
            fullHeight = svg.clientHeight || svg.parentNode.clientHeight;
        let halfWidth = fullWidth / 2,
            halfHeight = fullHeight / 2;

        return [halfWidth, halfHeight];
    }

}
