export const SpeechBubblePath = (width, height, style, margin, padding) => {
    let styles = {
        diagonal: [
            "M", 0, 0,
            "L", margin + padding, margin,
            "L", margin + width + padding, margin,
            "A", padding, padding, 0, 0, 1, margin + width + padding * 2, margin + padding,
            "L", margin + width + padding * 2, margin + height + padding,
            "A", padding, padding, 0, 0, 1, margin + width + padding, margin + height + padding * 2,
            "L", margin + padding, margin + height + padding * 2,
            "A", padding, padding, 0, 0, 1, margin, margin + height + padding,
            "L", margin, margin + padding,
            "Z"
        ],
        horizontal: [
            "M", 0, 0,
            "L", margin, -padding,
            "L", margin, -height / 2,
            "A", padding, padding, 0, 0, 1, margin + padding, -height / 2 - padding,
            "L", margin + width + padding, -height / 2 - padding,
            "A", padding, padding, 0, 0, 1, margin + width + padding * 2, -height / 2,
            "L", margin + width + padding * 2, height / 2,
            "A", padding, padding, 0, 0, 1, margin + width + padding, height / 2 + padding,
            "L", margin + padding, height / 2 + padding,
            "A", padding, padding, 0, 0, 1, margin, height / 2,
            "L", margin, padding,
            "Z"
        ],
        vertical: [
            "M", 0, 0,
            "L", -padding, margin,
            "L", -width / 2, margin,
            "A", padding, padding, 0, 0, 0, -width / 2 - padding, margin + padding,
            "L", -width / 2 - padding, margin + height + padding,
            "A", padding, padding, 0, 0, 0, -width / 2, margin + height + padding * 2,
            "L", width / 2, margin + height + padding * 2,
            "A", padding, padding, 0, 0, 0, width / 2 + padding, margin + height + padding,
            "L", width / 2 + padding, margin + padding,
            "A", padding, padding, 0, 0, 0, width / 2, margin,
            "L", padding, margin,
            "Z"
        ]
    };

    return styles[style].join(" ");
}