import { Component, Input, AfterViewInit } from '@angular/core';

import { zoomIdentity, zoom, selectAll, event } from 'd3';

@Component({
    selector: 'diagram-zoom',
    templateUrl: './zoom.component.html',
    styleUrls: ['./zoom.component.css']
})
export class ZoomComponent implements AfterViewInit {
    private zoom;

    @Input() svg: any;
    @Input() gNodes: any;

    constructor() {}

    ngAfterViewInit(){
       this.zoomEvent(); 
    }

    zoomEvent() {
        this.zoom = zoom()
            .scaleExtent([1/10, 10])
            .on("zoom", zoomed);

        this.svg.call(this.zoom)
            .on("wheel.zoom", null)
            .on("dblclick.zoom", null);

        function zoomed() {
            selectAll("g.layer").attr("transform", event.transform);
        }
    }

    zoomFit(){
        let box = this.gNodes.node().getBBox();
        if (box.width == 0 || box.height == 0) { return; }

        let node = this.svg.node();
        let fullWidth = node.clientWidth || node.parentNode.clientWidth,
            fullHeight = node.clientHeight || node.parentNode.clientHeight;

        let midX = box.x + box.width / 2,
            midY = box.y + box.height / 2;


        let scale = 0.80 / Math.max(box.width / fullWidth, box.height / fullHeight);
        let tx = fullWidth / 2 - scale * midX,
                ty = fullHeight / 2 - scale * midY;
        let t = zoomIdentity.translate(tx, ty).scale(scale);

        this.svg.transition()
            .call(this.zoom.transform, t);
    }

    zoomIn() {
        this.svg.transition()
            .call(this.zoom.scaleBy, 1.2);
    }

    zoomOut(svg) {
        this.svg.transition()
            .call(this.zoom.scaleBy, 0.8);
    }
}
