export const HorizontalArrow = (start, end, arrowWidth) => {
    let shaftRadius = arrowWidth / 2;
    let headRadius = arrowWidth * 2;
    let headLength = headRadius * 2;
    let shoulder = start < end ? end - headLength : end + headLength;

    return {
        outline: [
            "M", start, shaftRadius,
            "L", shoulder, shaftRadius,
            "L", shoulder, headRadius,
            "L", end, 0,
            "L", shoulder, -headRadius,
            "L", shoulder, -shaftRadius,
            "L", start, -shaftRadius,
            "Z"
        ].join(" "),
        apex: {
            "x": start + (shoulder - start) / 2,
            "y": 0
        }
    };
}

export const CurvedArrow = (startRadius, endRadius, endCentre, minOffset, arrowWidth, headWidth, headLength) => {
  let startAttach, endAttach, offsetAngle;

  function square(l){ return l * l; }

  let radiusRatio = startRadius / (endRadius + headLength);
  let homotheticCenter = -endCentre * radiusRatio / (1 - radiusRatio);

  function intersectWithOtherCircle(fixedPoint, radius, xCenter, polarity){
    let gradient = fixedPoint.y / (fixedPoint.x - homotheticCenter);
    let hc = fixedPoint.y - gradient * fixedPoint.x;

    let A = 1 + square(gradient);
    let B = 2 * (gradient * hc - xCenter);
    let C = square(hc) + square(xCenter) - square(radius);

    let intersection = { "x": (-B + polarity * Math.sqrt( square( B ) - 4 * A * C )) / (2 * A) };
    intersection["y"] = (intersection.x - homotheticCenter) * gradient;

    return intersection;
  }

  if(endRadius + headLength > startRadius){
    offsetAngle = minOffset / startRadius;
    startAttach = {
      x: Math.cos( offsetAngle ) * (startRadius),
      y: Math.sin( offsetAngle ) * (startRadius)
    };
    endAttach = intersectWithOtherCircle( startAttach, endRadius + headLength, endCentre, -1 );
  } else {
    offsetAngle = minOffset / endRadius;
    endAttach = {
      x: endCentre - Math.cos( offsetAngle ) * (endRadius + headLength),
      y: Math.sin( offsetAngle ) * (endRadius + headLength)
    };
    startAttach = intersectWithOtherCircle( endAttach, startRadius, 0, 1 );
  }

  let
  g1 = -startAttach.x / startAttach.y,
  c1 = startAttach.y + (square( startAttach.x ) / startAttach.y),
  g2 = -(endAttach.x - endCentre) / endAttach.y,
  c2 = endAttach.y + (endAttach.x - endCentre) * endAttach.x / endAttach.y;

  let cx = ( c1 - c2 ) / (g2 - g1);
  let cy = g1 * cx + c1;

  let arcRadius = Math.sqrt(square(cx - startAttach.x) + square(cy - startAttach.y));

  function startTangent(dr){
    let dx = (dr < 0 ? -1 : 1) * Math.sqrt(square(dr) / (1 + square(g1)));
    let dy = g1 * dx;
    return [
    startAttach.x + dx,
    startAttach.y + dy
    ].join(",");
  }

  function endTangent(dr){
    let dx = (dr < 0 ? -1 : 1) * Math.sqrt(square(dr) / (1 + square(g2)));
    let dy = g2 * dx;
    return [
    endAttach.x + dx,
    endAttach.y + dy
    ].join(",");
  }

  function endNormal(dc){
    let dx = (dc < 0 ? -1 : 1) * Math.sqrt(square(dc) / (1 + square(1 / g2)));
    let dy = dx / g2;
    return [
    endAttach.x + dx,
    endAttach.y - dy
    ].join(",");
  }

  let shaftRadius = arrowWidth / 2;
  let headRadius = headWidth / 2;

  return {
    outline: [
    "M", startTangent(-shaftRadius),
    "L", startTangent(shaftRadius),
    "A", arcRadius - shaftRadius, arcRadius - shaftRadius, 0, 0, minOffset > 0 ? 0 : 1, endTangent(-shaftRadius),
    "L", endTangent(-headRadius),
    "L", endNormal(headLength),
    "L", endTangent(headRadius),
    "L", endTangent(shaftRadius),
    "A", arcRadius + shaftRadius, arcRadius + shaftRadius, 0, 0, minOffset < 0 ? 0 : 1, startTangent(-shaftRadius)
    ].join( " " ),
    apex: {
      "x": cx,
      "y": cy > 0 ? cy - arcRadius : cy + arcRadius
    }
  };
}