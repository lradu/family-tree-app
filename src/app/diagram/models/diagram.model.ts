import { Node } from './node.model';
import { Relationship } from './relationship.model';
import { SpeechBubblePath } from './speech-bubble-path';
import { HorizontalArrow, CurvedArrow } from './arrow-path';

export class Diagram {
	public nodes: Array<Node>;
	public relationships: Array<Array<Relationship>>;
	
	constructor() {}

	init(data){
		this.nodes = [];
		this.relationships = [];
		
		this.initNodes(data.nodes);
		this.initRelationships(data.relationships);		
	}

	initNodes(nodes){
		let node, length;

		for(let key in nodes){
			node = nodes[key]
			node.y = this.nodes.length * 400;

			if(node.properties.length){
				length = node.properties.length;
				node.propertiesPath = SpeechBubblePath(node.propertiesWidth * 2, length * 24, "horizontal", 10, 10);
			}
			this.nodes.push(node);
		}
	}

	initRelationships(relationships){
		let relationship, distance;

		for(let key in relationships){
			relationship = new Relationship();
			Object.assign(relationship, relationships[key]);

			if(relationship.properties){
				length = relationship.properties.length;
				relationship.propertiesPath = SpeechBubblePath(relationship.propertiesWidth * 2, length * 24, "vertical", 10, 10);
			}

			relationship.source = this.nodes.find( x => x.id == relationship.startNode);
			relationship.target = this.nodes.find( x => x.id == relationship.endNode);
			if(!relationship.source || !relationship.target) { continue; }

			relationship.angle = relationship.source.angleTo(relationship.target);
			distance = relationship.source.distanceTo(relationship.target) - 12;
			relationship.path = relationship.path = CurvedArrow(relationship.source.radius + 12, relationship.target.radius, distance, 20, 5, 20, 20);
			this.relationships.push([relationship]);
		}
	}

	renderNodes(gNodes){
	    let nodes = gNodes.selectAll("rect.node")
	      .data(this.nodes)

	    nodes.enter()
	        .append("rect")
	        .attr("class", "node")
	        .attr("width", (node) => { return node.radius * 2; })
	        .attr("height", (node) => { return node.radius * 2; })
	        .attr("x", (node) => { return node.x; })
	        .attr("y", (node) => { return node.y; })
	        .attr("rx", (node) => { return node.isRectangle ? 20 : node.radius; })
	        .attr("ry", (node) => { return node.isRectangle ? 20 : node.radius; })
	        .attr("fill", (node) => { return node.fill; })
	        .attr("stroke", (node) => { return node.stroke; })
	        .attr("stroke-width", (node) => { return node.strokeWidth; })
	        .style("color", (node) => { return node.color; });

	    nodes.enter()
	        .append("path")
	            .attr("class", "node properties")
	            .attr("transform", (node) => {
	                return "translate("
	                + (node.x + 2 * node.radius + 4)
	                + ","
	                + (node.y + node.radius)
	                + ")";
	            })
	            .attr("d", (node) => { return node.propertiesPath; })
	            .attr("fill", "white")
	            .attr("stroke", "#7a7a7a")
	            .attr("stroke-width", 2);

	    let gProperties = nodes.enter()
	        .append("g")
	        .attr("class", "properties");
	    gProperties.selectAll("text")
	        .enter()    
	        .data((node) => {
	            let lines = [];
	            if(node.properties.length){
	                for(let i = 0; i < node.properties.length; i++){
	                    lines.push({
	                        "text": node.properties[i],
	                        "x": node.x + 2 * node.radius + node.propertiesWidth + 24,
	                        "y": node.y + node.radius + (i - node.properties.length) * 12 + (i + 1) * 12,
	                        "color": "#7a7a7a"
	                    });
	                }
	            }
	            return lines;
	        })
	        .enter()
	        .append("text")
	            .attr("x", (p) => { return p.x; })
	            .attr("y", (p) => { return p.y; })
	            .attr("fill", (p) => { return p.color; })
	            .attr("class", "properties")
	            .attr("text-anchor", "middle")
	            .attr("font-size",  "24px")
	            .attr("alignment-baseline", "central")
	            .text((p) => { return p.text; });              

	    let captions = gNodes.selectAll("text.node.caption")
	        .data(this.nodes)

	    captions.enter()
	        .append("text")
	            .attr("class", "node caption")
	            .attr("x", (node) => { return node.x + node.radius; })
	            .attr("y", (node) => { return node.y + node.radius; })
	            .attr("fill", (node) => { return node.color })
	            .attr("text-anchor", "middle")
	            .attr("font-size",  "50px")
	            .attr("alignment-baseline", "central")
	            .text((node) => { return node.caption; })
	}
	
	renderRelationships(gRelationships){
	    let gRel = gRelationships.selectAll("g.groups")
	        .data(this.relationships);

	    let rel = gRel.enter()
	        .append("g")
	            .attr("class", "groups")
	          .selectAll("path.relationships")
	            .data((g) => { return g; });
	            
	    rel.enter()
	        .append("path")
	            .attr("class", "relationships")
	            .attr("transform", (rl) => {
	                return "translate("
	                + (rl.source.x + rl.source.radius)
	                + ","
	                + (rl.source.y + rl.source.radius)
	                + ")" + "rotate(" + rl.angle + ")";
	            })
	            .attr("d", (rl) => { return rl.path.outline; })
	            .attr("fill", (rl) => { return rl.fill; });
	            

	    rel.enter()
	        .append("g")
	            .attr("class", "group")
	            .attr("transform", (rl) => {
	                return "translate("
	                + (rl.source.x + rl.source.radius)
	                + ","
	                + (rl.source.y + rl.source.radius)
	                + ")" + "rotate(" + rl.angle + ")";
	            })
	        .append("text")
	            .attr("x", (rl) => { return rl.path.apex.x; })
	            .attr("y", (rl) => { return rl.path.apex.y - 40; })
	            .attr("fill", "#333333")
	            .attr("class", "relationship type")
	            .attr("text-anchor", "middle")
	            .attr("font-size",  "50px")
	            .attr("alignment-baseline", "central")
	            .text((rl) => { return rl.type; });

	    rel.enter()
	        .append("g")
	            .attr("class", "group")
	            .attr("transform", (rl) => {
	                return "translate("
	                + (rl.source.x + rl.source.radius)
	                + ","
	                + (rl.source.y + rl.source.radius)
	                + ")" + "rotate(" + rl.angle + ")";
	            })
	        .append("path")
	            .attr("class", "relationship bubble")
	            .attr("transform", (rl) => {
	                return "translate("
	                + rl.path.apex.x
	                + ","
	                + rl.path.apex.y
	                + ")";
	            })
	            .attr("d", (rl) => { return rl.propertiesPath; })
	            .attr("fill", "white")
	            .attr("stroke", "#333333")
	            .attr("stroke-width", 2);

	    let gProperties = rel.enter()
	        .append("g")
	        .attr("class", "relationship properties")
	        .attr("transform", (rl) => {
	            if(rl.properties) {
	                return "translate("
	                + (rl.source.x + rl.source.radius)
	                + ","
	                + (rl.source.y + rl.source.radius)
	                + ")" + "rotate(" + rl.angle + ")";
	            } else { 
	                return "";
	            }
	        })
	    gProperties.selectAll("text")
	        .enter()    
	        .data((rl) => { 
	            if(rl.properties){
	                let list = [];
	                for(let i = 0; i < rl.properties.length; i++){;
	                    list.push({
	                        "text": rl.properties[i],
	                        "x": rl.path.apex.x,
	                        "y": rl.path.apex.y + (i * 12) + 30,
	                        "color": rl.fill,
	                        "angle": rl.angle
	                    });
	                }
	                return list;
	            } else {
	                return [];
	            }
	        })
	        .enter()
	        .append("text")
	            .attr("x", (p) => { return p.x; })
	            .attr("y", (p) => { return p.y; })
	            .attr("fill", (p) => { return p.color; })
	            .attr("class", "properties")
	            .attr("text-anchor", "middle")
	            .attr("font-size", "24px")
	            .attr("alignment-baseline", "central")
	            .text((p) => { return p.text; });
	}
}