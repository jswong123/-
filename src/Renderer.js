// ============================================================

// Renderer.js

// 东线 1941

//

// 地图渲染系统

// V0.4A

//

// 功能：

// - 六角格地图

// - 地形

// - 河流

// - 道路

// - 铁路

// - 城镇

// - 军事单位

// - 单位选中框

// - 移动范围

// ============================================================

import {

    drawHexPath

} from "./Hex.js";

export class Renderer {

    constructor(

        canvas,

        world,

        camera

    ) {

        this.canvas = canvas;

        this.ctx =

            canvas.getContext("2d");

        this.world =

            world;

        this.camera =

            camera;

        // ----------------------------------------------------

        // Hex 大小

        // ----------------------------------------------------

        this.hexSize = Number(this.world?.hexSize ?? 24);

        // ----------------------------------------------------

        // 外部系统引用

        // ----------------------------------------------------

        this.selection = null;

        this.movementSystem = null;

        // ----------------------------------------------------

        // 地图颜色

        // ----------------------------------------------------

        this.colors = {

            plain:

                "#b4b28f",

            forest:

                "#65705a",

            marsh:

                "#87917b",

            urban:

                "#aaa184",

            water:

                "#7693a1",

            grid:

                "#747660",

            road:

                "#a38e69",

            railway:

                "#57564c",

            river:

                "#668ba0"

        };

    }

    // ========================================================

    // 清空画布

    // ========================================================

    clear() {

        const ctx =

            this.ctx;

        ctx.save();

        ctx.setTransform(

            1,

            0,

            0,

            1,

            0,

            0

        );

        ctx.clearRect(

            0,

            0,

            this.canvas.width,

            this.canvas.height

        );

        ctx.fillStyle =

            "#8f9078";

        ctx.fillRect(

            0,

            0,

            this.canvas.width,

            this.canvas.height

        );

        ctx.restore();

    }

    // ========================================================

    // Hex → 世界坐标

    // ========================================================

    hexToWorld(

        q,

        r

    ) {

        const size =

            this.hexSize;

        return {

            x:

                size *

                Math.sqrt(3) *

                (

                    q +

                    r / 2

                ),

            y:

                size *

                1.5 *

                r

        };

    }

    // ========================================================

    // 世界坐标 → 屏幕坐标

    // ========================================================

    worldPointToScreen(

        x,

        y

    ) {

        return {

            x:

                x *

                this.camera.zoom +

                this.camera.x,

            y:

                y *

                this.camera.zoom +

                this.camera.y

        };

    }

    // ========================================================

    // Hex → 屏幕坐标

    // ========================================================

    worldToScreen(

        q,

        r

    ) {

        const world =

            this.hexToWorld(

                q,

                r

            );

        return this.worldPointToScreen(

            world.x,

            world.y

        );

    }

    // ========================================================

    // 地形颜色

    // ========================================================

    terrainColor(

        terrain

    ) {

        return (

            this.colors[terrain] ??

            this.colors.plain

        );

    }

    // ========================================================

    // 绘制基础地图

    // ========================================================

    drawTerrain() {

        const ctx =

            this.ctx;

        const size =

            this.hexSize *

            this.camera.zoom;

        for (

            let r = 0;

            r < this.world.height;

            r++

        ) {

            for (

                let q = 0;

                q < this.world.width;

                q++

            ) {

                const p =

                    this.worldToScreen(

                        q,

                        r

                    );

                const terrain =

                    this.world.terrainAt(

                        q,

                        r

                    );

                drawHexPath(

                    ctx,

                    p.x,

                    p.y,

                    size

                );

                ctx.fillStyle =

                    this.terrainColor(

                        terrain

                    );

                ctx.fill();

                ctx.strokeStyle =

                    this.colors.grid;

                ctx.lineWidth =

                    Math.max(

                        0.6,

                        this.camera.zoom

                    );

                ctx.stroke();

            }

        }

    }

    // ========================================================

    // 获取地图要素

    // ========================================================

    getFeatureArray(

        ...names

    ) {

        for (

            const name

            of names

        ) {

            if (

                Array.isArray(

                    this.world[name]

                )

            ) {

                return this.world[name];

            }

        }

        return [];

    }

    // ========================================================

    // 将地图要素节点转换成 Hex

    // ========================================================

    featureHex(

        point

    ) {

        if (!point) {

            return null;

        }

        if (

            Array.isArray(point)

        ) {

            return {

                q: Number(point[0]),

                r: Number(point[1])

            };

        }

        if (

            point.q !== undefined &&

            point.r !== undefined

        ) {

            return {

                q: Number(point.q),

                r: Number(point.r)

            };

        }

        return null;

    }

    // ========================================================

    // 绘制线路

    // ========================================================

    drawFeatureLines(

        features,

        options = {}

    ) {

        const ctx =

            this.ctx;

        const color =

            options.color ??

            "#000000";

        const width =

            options.width ??

            2;

        const dashed =

            options.dashed ??

            false;

        ctx.save();

        ctx.strokeStyle =

            color;

        ctx.lineWidth =

            width *

            this.camera.zoom;

        ctx.lineCap =

            "round";

        ctx.lineJoin =

            "round";

        if (dashed) {

            ctx.setLineDash([

                5 * this.camera.zoom,

                5 * this.camera.zoom

            ]);

        }

        for (

            const feature

            of features

        ) {

            const points =

                feature.points ??

                feature.path ??

                feature.hexes ??

                feature;

            if (

                !Array.isArray(points) ||

                points.length < 2

            ) {

                continue;

            }

            ctx.beginPath();

            let started =

                false;

            for (

                const rawPoint

                of points

            ) {

                const hex =

                    this.featureHex(

                        rawPoint

                    );

                if (!hex) {

                    continue;

                }

                const p =

                    this.worldToScreen(

                        hex.q,

                        hex.r

                    );

                if (!started) {

                    ctx.moveTo(

                        p.x,

                        p.y

                    );

                    started =

                        true;

                }

                else {

                    ctx.lineTo(

                        p.x,

                        p.y

                    );

                }

            }

            if (started) {

                ctx.stroke();

            }

        }

        ctx.restore();

    }

    // ========================================================

    // 河流

    // ========================================================

    drawRivers() {

        const rivers =

            this.getFeatureArray(

                "rivers",

                "riverFeatures"

            );

        this.drawFeatureLines(

            rivers,

            {

                color:

                    this.colors.river,

                width:

                    3.2

            }

        );

    }

    // ========================================================

    // 道路

    // ========================================================

    drawRoads() {

        const roads =

            this.getFeatureArray(

                "roads",

                "roadFeatures"

            );

        this.drawFeatureLines(

            roads,

            {

                color:

                    this.colors.road,

                width:

                    1.8

            }

        );

    }

    // ========================================================

    // 铁路

    // ========================================================

    drawRailways() {

        const railways =

            this.getFeatureArray(

                "railways",

                "rails",

                "railwayFeatures"

            );

        this.drawFeatureLines(

            railways,

            {

                color:

                    this.colors.railway,

                width:

                    1.2,

                dashed:

                    true

            }

        );

    }

    // ========================================================

    // 城镇

    // ========================================================

    drawSettlements() {

        const settlements =

            this.getFeatureArray(

                "settlements",

                "cities",

                "towns"

            );

        const ctx =

            this.ctx;

        ctx.save();

        for (

            const settlement

            of settlements

        ) {

            const q =

                settlement.q;

            const r =

                settlement.r;

            if (

                q === undefined ||

                r === undefined

            ) {

                continue;

            }

            const p =

                this.worldToScreen(

                    q,

                    r

                );

            const radius =

                Math.max(

                    3,

                    4 *

                    this.camera.zoom

                );

            ctx.beginPath();

            ctx.arc(

                p.x,

                p.y,

                radius,

                0,

                Math.PI * 2

            );

            ctx.fillStyle =

                "#34352e";

            ctx.fill();

            ctx.font =

                `${

                    Math.max(

                        10,

                        13 *

                        this.camera.zoom

                    )

                }px FangSong, STKaiti, serif`;

            ctx.fillStyle =

                "#4c493f";

            ctx.textAlign =

                "left";

            ctx.textBaseline =

                "middle";

            ctx.fillText(

                settlement.name ??

                "",

                p.x +

                radius +

                5,

                p.y

            );

        }

        ctx.restore();

    }

    // ========================================================

    // 移动范围

    // ========================================================

    drawMovementRange() {

        if (

            !this.movementSystem ||

            !this.movementSystem.selectedUnit

        ) {

            return;

        }

        const ctx =

            this.ctx;

        const size =

            this.hexSize *

            this.camera.zoom;

        ctx.save();

        for (

            const [

                key,

                cost

            ]

            of this.movementSystem

                .reachable

                .entries()

        ) {

            const [

                q,

                r

            ] =

                key

                    .split(",")

                    .map(Number);

            const p =

                this.worldToScreen(

                    q,

                    r

                );

            drawHexPath(

                ctx,

                p.x,

                p.y,

                size * 0.92

            );

            ctx.fillStyle =

                "rgba(96, 137, 91, 0.32)";

            ctx.fill();

            ctx.strokeStyle =

                "rgba(65, 103, 65, 0.82)";

            ctx.lineWidth =

                Math.max(

                    1,

                    1.5 *

                    this.camera.zoom

                );

            ctx.stroke();

            // 放大后显示移动成本

            if (

                this.camera.zoom >= 1.15

            ) {

                ctx.fillStyle =

                    "rgba(35, 55, 35, 0.75)";

                ctx.font =

                    `${

                        Math.max(

                            8,

                            9 *

                            this.camera.zoom

                        )

                    }px FangSong, serif`;

                ctx.textAlign =

                    "center";

                ctx.textBaseline =

                    "middle";

                ctx.fillText(

                    String(cost),

                    p.x,

                    p.y

                );

            }

        }

        ctx.restore();

    }

    // ========================================================

    // 单位颜色

    // ========================================================

    factionColor(faction) {

        const f = String(faction ?? "").trim().toLowerCase();

        if (["ger", "german", "germany", "deutsch", "wehrmacht", "axis"].includes(f)) return "#6f8292";

        if (["ussr", "soviet", "redarmy", "red_army", "苏军"].includes(f)) return "#c65d57";

        return "#a9a68f";

    }

    // ========================================================

    // 绘制军事符号

    // ========================================================

    drawMilitarySymbol(unit, x, y, width, height) {

        const ctx = this.ctx;

        const rawType = String(unit.type ?? unit.unitType ?? unit.branch ?? "infantry").toLowerCase();

        const name = String(unit.name ?? "");

        const echelon = String(unit.echelon ?? unit.level ?? unit.formation ?? unit.commandLevel ?? "").toLowerCase();

        const role = String(unit.role ?? unit.unitRole ?? unit.category ?? "").toLowerCase();

        const type = rawType.replace(/[ _-]/g, "");

        const normalizedRole = role.replace(/[ _-]/g, "");

        const isGuard = type.includes("guard") || normalizedRole.includes("guard") || /警卫/.test(name);

        const explicitHQ = ["headquarters", "hq", "command", "commandpost"].includes(type) ||

            ["headquarters", "hq", "command", "commandpost", "guardhq"].includes(normalizedRole);

        const namedHQ = /司令部|指挥部|军部|师部|旅部|团部|营部|团部警卫|军警卫|集团军警卫|方面军警卫|集群警卫/.test(name);

        // 警卫单位在渲染逻辑中强制属于 HQ 家族，绝不再落入普通步兵符号。

        const isHQ = explicitHQ || namedHQ || isGuard;

        const isEngineer = type.includes("engineer") || type.includes("sapper") || /工兵/.test(name);

        const isAT = type.includes("antitank") || type === "at" || /反坦克/.test(name);

        const isRecon = type.includes("recon") || /侦察/.test(name);

        const isArmor = type.includes("armor") || type.includes("tank") || /装甲|坦克/.test(name);

        const isArtillery = type.includes("artillery") || type.includes("gun") || /炮兵|火炮/.test(name);

        const isCavalry = type.includes("cavalry") || /骑兵/.test(name);

        const rankText = `${echelon} ${role} ${name}`.toLowerCase();

        const commandStars = (() => {

            // 方面军 / 集团军群：4星

            if (/front|方面军|army\s*group|armygroup|集团军群|集团军集群/.test(rankText)) return 4;

            // 集团军 / 德军装甲集群：3星

            if (/panzer\s*group|panzergroup|装甲集群/.test(rankText)) return 3;

            if (/(^|[^a-z])army([^a-z]|$)|集团军/.test(rankText) &&

                !/army\s*group|armygroup|集团军群|集团军集群/.test(rankText)) return 3;

            // 军：2星。排除“军司令部”之外可能出现的集团军、方面军。

            if (/corps|军级|装甲军|步兵军|骑兵军|机械化军|摩托化军|第[一二三四五六七八九十百\d]+军/.test(rankText) &&

                !/集团军|方面军/.test(rankText)) return 2;

            // 师：1星

            if (/division|步兵师|装甲师|摩托化师|机械化师|骑兵师|师司令部|师部/.test(rankText)) return 1;

            // 团及以下 HQ：不加星

            return 0;

        })();

        ctx.save();

        ctx.strokeStyle = "#171916";

        ctx.fillStyle = "#171916";

        ctx.lineWidth = Math.max(1.35, 1.8 * this.camera.zoom);

        ctx.lineCap = "round";

        ctx.lineJoin = "round";

        if (isHQ) {

            // 解放军式指挥机构：左侧旗杆 + 右伸三角旗。

            const left = x - width * 0.29;

            const top = y - height * 0.27;

            const notch = y - height * 0.08;

            const tip = x + width * 0.07;

            ctx.beginPath();

            ctx.moveTo(left, y + height * 0.27);

            ctx.lineTo(left, top);

            ctx.lineTo(tip, y - height * 0.19);

            ctx.lineTo(left, notch);

            ctx.stroke();

            // 警卫机构使用旗内实心圆点作为专用识别记号，但仍属于 HQ。

            if (isGuard) {

                ctx.beginPath();

                ctx.arc(x - width * 0.12, y - height * 0.19, Math.max(1.25, height * 0.052), 0, Math.PI * 2);

                ctx.fill();

            }

            // 层级星标：方面军/集团军群4，集团军/装甲集群3，军2，师1，团及以下0。

            if (commandStars > 0) {

                const gap = width * 0.125;

                const total = (commandStars - 1) * gap;

                const sx = x + width * 0.12 - total / 2;

                const sy = y + height * 0.11;

                const radius = Math.max(1.35, height * 0.050);

                for (let i = 0; i < commandStars; i++) {

                    this.drawPLAStar(sx + i * gap, sy, radius * 1.72);

                }

            }

        } else if (isEngineer) {

            ctx.beginPath();

            ctx.moveTo(x - width * 0.25, y + height * 0.22);

            ctx.lineTo(x - width * 0.25, y - height * 0.18);

            ctx.lineTo(x + width * 0.25, y - height * 0.18);

            ctx.lineTo(x + width * 0.25, y + height * 0.22);

            ctx.stroke();

        } else if (isAT) {

            ctx.beginPath();

            ctx.moveTo(x - width * 0.28, y);

            ctx.lineTo(x + width * 0.28, y);

            ctx.stroke();

            ctx.beginPath();

            ctx.arc(x, y, height * 0.12, 0, Math.PI * 2);

            ctx.stroke();

        } else if (isRecon) {

            ctx.beginPath();

            ctx.moveTo(x - width * 0.28, y + height * 0.20);

            ctx.lineTo(x, y - height * 0.22);

            ctx.lineTo(x + width * 0.28, y + height * 0.20);

            ctx.stroke();

        } else if (isArmor) {

            ctx.beginPath();

            ctx.ellipse(x, y, width * 0.27, height * 0.18, 0, 0, Math.PI * 2);

            ctx.stroke();

        } else if (isArtillery) {

            ctx.beginPath();

            ctx.moveTo(x - width * 0.27, y);

            ctx.lineTo(x + width * 0.27, y);

            ctx.stroke();

            ctx.beginPath();

            ctx.arc(x, y, height * 0.10, 0, Math.PI * 2);

            ctx.fill();

        } else if (isCavalry) {

            ctx.beginPath();

            ctx.moveTo(x - width * 0.26, y + height * 0.22);

            ctx.lineTo(x + width * 0.24, y - height * 0.22);

            ctx.stroke();

        } else {

            // 普通步兵：交叉线。

            ctx.beginPath();

            ctx.moveTo(x - width * 0.28, y - height * 0.24);

            ctx.lineTo(x + width * 0.28, y + height * 0.24);

            ctx.moveTo(x + width * 0.28, y - height * 0.24);

            ctx.lineTo(x - width * 0.28, y + height * 0.24);

            ctx.stroke();

        }

        ctx.restore();

    }

    // 绘制单位

    // ========================================================

    drawUnits(units = []) {

        const ctx = this.ctx;

        const zoom = Number(this.camera.zoom ?? 1);

        for (const unit of units) {

            const current = Number(unit?.manpower ?? unit?.strength ?? 0);

            if (unit?.destroyed === true || !Number.isFinite(current) || current <= 0) continue;

            if (unit.q === undefined || unit.r === undefined) continue;

            const p = this.worldToScreen(unit.q, unit.r);

            const baseW = zoom < 0.72 ? 26 : zoom < 1.18 ? 32 : 36;

            const baseH = zoom < 0.72 ? 18 : zoom < 1.18 ? 22 : 25;

            const width = baseW * zoom;

            const height = baseH * zoom;

            const selected = this.selection && this.selection.selectedUnit === unit;

            if (selected) {

                ctx.save();

                ctx.strokeStyle = "#e8c85b";

                ctx.lineWidth = Math.max(2, 3 * zoom);

                ctx.strokeRect(p.x - width / 2 - 4, p.y - height / 2 - 4, width + 8, height + 8);

                ctx.restore();

            }

            ctx.save();

            ctx.fillStyle = this.factionColor(unit.faction);

            ctx.strokeStyle = "#171916";

            ctx.lineWidth = Math.max(1.3, 1.8 * zoom);

            ctx.fillRect(p.x - width / 2, p.y - height / 2, width, height);

            ctx.strokeRect(p.x - width / 2, p.y - height / 2, width, height);

            ctx.restore();

            this.drawMilitarySymbol(unit, p.x, p.y, width, height);

            if (zoom < 0.72) continue;

            const shortName = this.compactUnitName(unit.shortName ?? unit.name ?? unit.id ?? "");

            if (shortName) {

                ctx.save();

                ctx.fillStyle = "#34352f";

                ctx.font = `${Math.max(7, 8.5 * zoom)}px FangSong, STKaiti, serif`;

                ctx.textAlign = "center";

                ctx.textBaseline = "top";

                ctx.fillText(shortName, p.x, p.y + height / 2 + 3);

                ctx.restore();

            }

            if (zoom < 1.18) continue;

            const maximum = Math.max(1, Number(unit.maxManpower ?? unit.maxStrength ?? current));

            ctx.save();

            ctx.fillStyle = "#20231f";

            ctx.font = `${Math.max(7, 8 * zoom)}px Consolas, monospace`;

            ctx.textAlign = "center";

            ctx.textBaseline = "bottom";

            ctx.fillText(`${Math.max(0, current)}/${maximum}`, p.x, p.y - height / 2 - 3);

            ctx.restore();

        }

    }

    // ========================================================

    // 总渲染

    // ========================================================

    render(

        units = []

    ) {

        this.clear();

        // 地形

        this.drawTerrain();

        // 防御工事

        this.drawFortifications();

        // 地理要素

        this.drawRoads();

        this.drawRailways();

        this.drawRivers();

        this.drawSettlements();

        // 移动范围必须位于单位下面

        this.drawMovementRange();

        // 单位

        this.drawUnits(

            units

        );

    }

}
