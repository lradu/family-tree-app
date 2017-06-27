export class Zoom {
    public zoom: any;

    constructor() {}

    zoomEvent(d3) {
        this.zoom = d3.zoom()
            .scaleExtent([1/10, 10])
            .on("zoom", zoomed);

        function zoomed() {
            d3.selectAll("g.layer").attr("transform", d3.event.transform);
        }
    }

    zoomFit(d3, svg, gNodes){
        let box = gNodes.node().getBBox();
        if (box.width == 0 || box.height == 0) { return; }

        let node = svg.node();
        let fullWidth = node.clientWidth || node.parentNode.clientWidth,
            fullHeight = node.clientHeight || node.parentNode.clientHeight;

        let midX = box.x + box.width / 2,
            midY = box.y + box.height / 2;


        let scale = 0.80 / Math.max(box.width / fullWidth, box.height / fullHeight);
        let tx = fullWidth / 2 - scale * midX,
                ty = fullHeight / 2 - scale * midY;
        let t = d3.zoomIdentity.translate(tx, ty).scale(scale);

        svg.transition()
            .call(this.zoom.transform, t);
    }

    zoomIn(svg) {
        svg.transition()
            .call(this.zoom.scaleBy, 1.2);
    }

    zoomOut(svg) {
        svg.transition()
            .call(this.zoom.scaleBy, 0.8);
    }
}