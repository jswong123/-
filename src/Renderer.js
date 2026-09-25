} else if (isAT) {
    // 反坦克：水平线 + 空心圆
    ctx.beginPath();
    ctx.moveTo(x - width * 0.28, y);
    ctx.lineTo(x + width * 0.28, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(
        x,
        y,
        height * 0.12,
        0,
        Math.PI * 2
    );
    ctx.stroke();

} else if (isRecon) {
    ctx.beginPath();
    ctx.moveTo(x - width * 0.28, y + height * 0.20);
    ctx.lineTo(x, y - height * 0.22);
    ctx.lineTo(x + width * 0.28, y + height * 0.20);
    ctx.stroke();

} else if (isArmor) {
    ctx.beginPath();
    ctx.ellipse(
        x,
        y,
        width * 0.27,
        height * 0.18,
        0,
        0,
        Math.PI * 2
    );
    ctx.stroke();

} else if (isArtillery) {
    // 炮兵：垂直线 + 实心圆
    ctx.beginPath();
    ctx.moveTo(x, y - height * 0.30);
    ctx.lineTo(x, y + height * 0.30);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(
        x,
        y,
        height * 0.10,
        0,
        Math.PI * 2
    );
    ctx.fill();

} else if (isCavalry) {
