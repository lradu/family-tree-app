import * as go from 'gojs';

import { GenogramLayout } from './layout.model';

export class Diagram extends go.Diagram {
	goMake: any;

	// create and initialize the Diagram.model given an array of node data representing people
	init(array, focusId) {
		this.goMake = go.GraphObject.make;

		this.layout = this.goMake(GenogramLayout, { direction: 90, layerSpacing: 30, columnSpacing: 10 });

		this.initialAutoScale = go.Diagram.Uniform;
		this.initialContentAlignment= go.Spot.Center;
		this.undoManager.isEnabled = true;


		this.maleTemplate();
		this.femaleTemplate();
		this.linkLabel();
		this.marriage();
		this.parentChild();

		this.model =
            go.GraphObject.make(go.GraphLinksModel,
                { // declare support for link label nodes
                linkLabelKeysProperty: "labelKeys",
                // this property determines which template is used
                nodeCategoryProperty: "s",
                // create all of the nodes for people
                nodeDataArray: array
            });
		this.setupMarriages(this);
		this.setupParents(this);
  
		let node = this.findNodeForKey(focusId);
		if (node !== null) {
            this.select(node);
            // remove any spouse for the person under focus:
            //node.linksConnected.each(function(l) {
            //  if (!l.isLabeledLink) return;
            //  l.opacity = 0;
            //  let spouse = l.getOtherNode(node);
            //  spouse.opacity = 0;
            //  spouse.pickable = false;
            //});
		}
    }

	// two different node templates, one for each sex,
	// named by the category value in the node data object
	maleTemplate(){
		this.nodeTemplateMap.add("M",  // male
		this.goMake(go.Node, "Vertical",
            { locationSpot: go.Spot.Center, locationObjectName: "ICON" },
            this.goMake(go.Panel,
                { name: "ICON" },
                this.goMake(go.Shape, "Square",
                { width: 40, height: 40, strokeWidth: 2, fill: "white", portId: "" })
            ),
            this.goMake(go.TextBlock,
                { textAlign: "center", maxSize: new go.Size(80, NaN) },
                new go.Binding("text", "n"))
		));
	}

	femaleTemplate(){
		this.nodeTemplateMap.add("F",  // female
        this.goMake(go.Node, "Vertical",
          { locationSpot: go.Spot.Center, locationObjectName: "ICON" },
          this.goMake(go.Panel,
            { name: "ICON" },
            this.goMake(go.Shape, "Circle",
              { width: 40, height: 40, strokeWidth: 2, fill: "white", portId: "" })
          ),
          this.goMake(go.TextBlock,
            { textAlign: "center", maxSize: new go.Size(80, NaN) },
            new go.Binding("text", "n"))
        ));
	}

	// the representation of each label node -- nothing shows on a Marriage Link
	linkLabel(){
		this.nodeTemplateMap.add("LinkLabel",
        this.goMake(go.Node, { selectable: false, width: 1, height: 1, fromEndSegmentLength: 20 }));
	}

	// for parent-child relationships
	parentChild(){
		this.linkTemplate =
		this.goMake(go.Link,
		  {
				routing: go.Link.Orthogonal, curviness: 15,
				layerName: "Background", selectable: false,
				fromSpot: go.Spot.Bottom, toSpot: go.Spot.Top
		  },
		  this.goMake(go.Shape, { strokeWidth: 2 })
		);
	}

	// for marriage relationships
	marriage(){
		this.linkTemplateMap.add("Marriage",
        this.goMake(go.Link,
          { selectable: false },
          this.goMake(go.Shape, { strokeWidth: 2, stroke: "blue" })
      ));
	}
	
  findMarriage(diagram: go.Diagram, a: number, b: number) {  // A and B are node keys
    let nodeA = diagram.findNodeForKey(a);
    let nodeB = diagram.findNodeForKey(b);
    if (nodeA !== null && nodeB !== null) {
        let it = nodeA.findLinksBetween(nodeB);  // in either direction
        while (it.next()) {
            let link = it.value;
            // Link.data.category === "Marriage" means it's a marriage relationship
            if (link.data !== null && link.data.category === "Marriage") return link;
        }
    }
    return null;
  }
  // now process the node data to determine marriages
	setupMarriages(diagram: go.Diagram) {
		let model = diagram.model as go.GraphLinksModel;
		let nodeDataArray = model.nodeDataArray;
		for (let i = 0; i < nodeDataArray.length; i++) {
			let data = nodeDataArray[i] as Data;
			let key = data.key;
			if (data.ux !== undefined) {
				let uxs: Array<number> = [];
				if (typeof data.ux === "number") uxs = [ data.ux ] as Array<number>;
				for (let j = 0; j < uxs.length; j++) {
					let wife = uxs[j];
					if (key === wife) {
						// or warn no reflexive marriages
						continue;
					}
					let link = this.findMarriage(diagram, key, wife);
					if (link === null) {
						// add a label node for the marriage link
						let mlab = { s: "LinkLabel" } as Data;
						model.addNodeData(mlab);
						// add the marriage link itself, also referring to the label node
						let mdata = { from: key, to: wife, labelKeys: [mlab.key], category: "Marriage" };
						model.addLinkData(mdata);
					}
				}
			}
			if (data.vir !== undefined) {
				let virs: Array<number> = (typeof data.vir === "number") ? [ data.vir ] : data.vir as Array<number>;
				for (let j = 0; j < virs.length; j++) {
					let husband = virs[j];
					if (key === husband) {
						// or warn no reflexive marriages
						continue;
					}
					let link = this.findMarriage(diagram, key, husband);
					if (link === null) {
						// add a label node for the marriage link
						let mlab = { s: "LinkLabel" } as Data;
						model.addNodeData(mlab);
						// add the marriage link itself, also referring to the label node
						let mdata = { from: key, to: husband, labelKeys: [mlab.key], category: "Marriage" };
						model.addLinkData(mdata);
					}
				}
			}
		}
	}
  
	// process parent-child relationships once all marriages are known
  setupParents(diagram: go.Diagram) {
    let model = diagram.model as go.GraphLinksModel;
    let nodeDataArray = model.nodeDataArray;
    for (let i = 0; i < nodeDataArray.length; i++) {
        let data = nodeDataArray[i] as Data;
        let key = data.key;
        let mother = data.m;
        let father = data.f;
        if (mother !== undefined && father !== undefined) {
            let link = this.findMarriage(diagram, mother, father);
            if (link === null) {
            // or warn no known mother or no known father or no known marriage between them
            if (window.console) window.console.log("unknown marriage: " + mother + " & " + father);
            continue;
            }
            let mdata = link.data;
            let mlabkey = mdata.labelKeys[0];
            let cdata = { from: mlabkey, to: key };
            model.addLinkData(cdata);
        }
    }
  }   
}

// n: name, s: sex, m: mother, f: father, ux: wife, vir: husband, a: attributes/markers
type Data = {
    key: number,
    n: string,
    s: string,
    m: number,
    f: number,
    ux: number,
    vir: number,
    a: string
}
