import * as go from 'gojs';

import { GenogramLayout } from './layout.model';
import { Node } from './node.model';

export class Diagram extends go.Diagram {
	goMake: any;
	layout: GenogramLayout

	// create and initialize the Diagram.model given an array of node data representing people
	init(array, focusId) {
		this.goMake = go.GraphObject.make;

		this.layout = this.goMake(GenogramLayout, { direction: 90, layerSpacing: 30, columnSpacing: 10 });

		this.initialAutoScale = go.Diagram.Uniform;
		this.initialContentAlignment= go.Spot.Center;
		this.undoManager.isEnabled = true;


		this.personTemplate("M", "#90CAF9"); //male
		this.personTemplate("F", "#F48FB1"); //female
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


	personTemplate(sex: string, color: string){
		this.nodeTemplateMap.add(sex,  // male
		this.goMake(go.Node, "Auto",
            { locationSpot: go.Spot.Center, locationObjectName: "ICON" },
            // for sorting, have the Node.text be the data.name
			new go.Binding("text", "n"),
			// bind the Part.layerName to control the Node's layer depending on whether it isSelected
			new go.Binding("layerName", "isSelected", function(sel) { return sel ? "Foreground" : ""; }).ofObject(),
			new go.Binding("visible", "visible"),
			// define the node's outer shape
			this.goMake(go.Shape, "Rectangle",
			{
				name: "SHAPE", fill: color, stroke: null,
				// set the port properties:
				portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer"
			}),
			this.goMake(go.Panel, "Horizontal",
				this.goMake(go.Picture,
					{
					name: "Picture",
					desiredSize: new go.Size(39, 50),
					margin: new go.Margin(6, 8, 6, 10),
					},
					new go.Binding("source", "key", this.findHeadShot)),
				// define the panel where the text will appear
				this.goMake(go.Panel, "Table",
					{
					maxSize: new go.Size(150, 999),
					margin: new go.Margin(6, 10, 0, 3),
					defaultAlignment: go.Spot.Left
					},
					this.goMake(go.RowColumnDefinition, { column: 2, width: 4 }),
					this.goMake(go.TextBlock, this.textStyle(),  // the name
					{
						row: 0, column: 0, columnSpan: 5,
						font: "12pt Segoe UI,sans-serif",
						editable: true, isMultiline: false,
						minSize: new go.Size(10, 16)
					},
					new go.Binding("text", "n").makeTwoWay()),

					this.goMake(go.TextBlock, "Gender: ", this.textStyle(),
					{ row: 1, column: 0 }),
					this.goMake(go.TextBlock, this.textStyle(),
					{
						row: 1, column: 1, columnSpan: 4,
						editable: true, isMultiline: false,
						minSize: new go.Size(10, 14),
						margin: new go.Margin(0, 0, 0, 3)
					},
					new go.Binding("text", "s").makeTwoWay()),
				
					this.goMake(go.TextBlock, "Age: ", this.textStyle(),
					{ row: 2, column: 0 }),
					this.goMake(go.TextBlock, this.textStyle(),  // age
					{
						row: 2, column: 1, columnSpan: 5,
						font: "italic 9pt sans-serif",
						wrap: go.TextBlock.WrapFit,
						editable: true,  // by default newlines are allowed
						minSize: new go.Size(10, 14)
					},
					new go.Binding("text", "a").makeTwoWay())
				)  // end Table Panel
			) // end Horizontal Panel
		));
	}


	updateNode(data: Node){
		let node = this.findNodeForKey(data.key);
		if(node){
			if(data.s && node.data.s !== data.s){
				this.removeNode(node);
				this.addNode(data);
			} else {
				this.startTransaction('update node ' + data.key);
				Object.assign(node.data, data);
				node.updateTargetBindings();
				this.commitTransaction('update node ' + data.key);
			}
		} else {
			this.addNode(data);
		}
	}

	addNode(data: Node){
		this.startTransaction('add node ' + data.key);
		this.model.addNodeData(data);
		this.commitTransaction('add node ' + data.key);		
	}

	removeNode(node){
		this.startTransaction('remove node ' + node.data.key);
		this.model.removeNodeData(node.data);
		this.commitTransaction('remove node ' + node.data.key);	
	}
	
	addMarriage(data){
		let link = this.findMarriage(this, data.key, data.ux);

		if(link === null) {
			this.startTransaction('add marriage ' + data.key);
			let model = this.model as go.GraphLinksModel;
			// add a label node for the marriage link
			let mlab = { s: "LinkLabel" } as Node;
			model.addNodeData(mlab);
			// add the marriage link itself, also referring to the label node
			let mdata = { from: data.key, to: data.ux, labelKeys: [mlab.key], category: "Marriage" };
			model.addLinkData(mdata);
			this.commitTransaction('add marriage ' + data.key);

			return true;
		}
		return false;
	}

	addParent(data){
		let key = data.key;
		let mother = data.m;
		let father = data.f;
		let model = this.model as go.GraphLinksModel;

		if (mother !== undefined && father !== undefined) {
			let link = this.findMarriage(this, mother, father);
			if (link !== null) {
				this.startTransaction('add parent ' + data.key);
				let mdata = link.data;
				let mlabkey = mdata.labelKeys[0];
				let cdata = { from: mlabkey, to: key };
				model.addLinkData(cdata);
				this.commitTransaction('add parent ' + data.key);
				return true;
			}	
		}
		return false;
	}

	// This function provides a common style for most of the TextBlocks.
    // Some of these values may be overridden in a particular TextBlock.
    textStyle() {
		return { font: "9pt  Segoe UI,sans-serif", stroke: "black" };
	}

	// This converter is used by the Picture.
    findHeadShot(key) {
		return "assets/headshot.svg";
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
			let data = nodeDataArray[i] as Node;
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
						let mlab = { s: "LinkLabel" } as Node;
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
						let mlab = { s: "LinkLabel" } as Node;
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
			let data = nodeDataArray[i] as Node;
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