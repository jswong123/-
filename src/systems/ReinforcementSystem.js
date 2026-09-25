// ========================================

// ReinforcementSystem.js

// 台儿庄战役 - 增援与战役事件系统

//

// 功能：

// 1. 按回合投入增援

// 2. 按地图入口部署部队

// 3. 条件式增援

// 4. 战役事件触发

// 5. 防止增援单位开局提前出现

// 6. 为AI、胜利条件和战役日志提供事件信息

// ========================================

 

export class ReinforcementSystem {

 

    constructor(world) {

        this.world = world;

 

        this.triggeredEvents = new Set();

        this.arrivedGroups = new Set();

 

        this.schedule =

            this.createTaierzhuangSchedule();

    }

 

 

    // ========================================

    // 台儿庄增援表

    //

    // 这里使用游戏化回合设计：

    // 每回合约2小时。

    // 后续可以直接调整 arrivalTurn。

    // ========================================

 

    createTaierzhuangSchedule() {

        return [

 

            // --------------------------------

            // 中国军

            // --------------------------------

 

            {

                id: "CHI_52C_ADVANCE",

                faction: "chinese",

                name: "第52军投入战斗",

                arrivalTurn: 8,

 

                unitPrefixes: [

                    "CHI_52C",

                    "CHI_2D",

                    "CHI_25D"

                ],

 

                entry: {

                    q: 22,

                    r: 20

                },

 

                message:

                    "第二十军团第52军开始从西北方向投入战斗。"

            },

 

 

            {

                id: "CHI_85C_ADVANCE",

                faction: "chinese",

                name: "第85军投入战斗",

                arrivalTurn: 12,

 

                unitPrefixes: [

                    "CHI_85C",

                    "CHI_4D",

                    "CHI_89D"

                ],

 

                entry: {

                    q: 10,

                    r: 25

                },

 

                message:

                    "第85军进入战场，对日军西翼形成压力。"

            },

 

 

            {

                id: "CHI_75C_RESERVE",

                faction: "chinese",

                name: "第75军预备队",

                arrivalTurn: 18,

 

                unitPrefixes: [

                    "CHI_75C",

                    "CHI_6D",

                    "CHI_139D"

                ],

 

                entry: {

                    q: 8,

                    r: 42

                },

 

                message:

                    "第75军预备队从徐州方向进入战场。"

            },

 

 

            // --------------------------------

            // 日军

            // --------------------------------

 

            {

                id: "JPN_SAKAMOTO",

                faction: "japanese",

                name: "坂本支队增援",

                arrivalTurn: 10,

 

                unitPrefixes: [

                    "JPN_5D",

                    "JPN_SAK",

                    "JPN_R21",

                    "JPN_R11",

                    "JPN_R42",

                    "JPN_FA5",

                    "JPN_MA5"

                ],

 

                entry: {

                    q: 92,

                    r: 12

                },

 

                message:

                    "坂本支队从临沂方向进入战场。"

            }

        ];

    }

 

 

    // ========================================

    // 单位是否属于某增援组

    // ========================================

 

    belongsToGroup(unit, group) {

        if (!unit || !group) {

            return false;

        }

 

        return group.unitPrefixes.some(

            prefix =>

                unit.id === prefix ||

                unit.id.startsWith(

                    prefix + "_"

                )

        );

    }

 

 

    // ========================================

    // 初始化

    //

    // 应在场景载入完成后调用一次。

    // 尚未到达的单位被标记为 offMap。

    // ========================================

 

    initialize(units, currentTurn = 1) {

 

        for (const group of this.schedule) {

 

            if (

                currentTurn >=

                group.arrivalTurn

            ) {

                continue;

            }

 

            for (const unit of units) {

 

                if (

                    this.belongsToGroup(

                        unit,

                        group

                    )

                ) {

                    unit.offMap = true;

                    unit.reinforcementGroup =

                        group.id;

                }

            }

        }

    }

 

 

    // ========================================

    // 检查本回合增援

    // ========================================

 

    processTurn(

        currentTurn,

        units

    ) {

        const results = [];

 

        for (const group of this.schedule) {

 

            if (

                this.arrivedGroups.has(

                    group.id

                )

            ) {

                continue;

            }

 

            if (

                currentTurn <

                group.arrivalTurn

            ) {

                continue;

            }

 

            const result =

                this.deployGroup(

                    group,

                    units

                );

 

            if (result.success) {

                this.arrivedGroups.add(

                    group.id

                );

 

                results.push(result);

            }

        }

 

        const events =

            this.processBattleEvents(

                currentTurn,

                units

            );

 

        return {

            reinforcements: results,

            events

        };

    }

 

 

    // ========================================

    // 部署整个增援组

    // ========================================

 

    deployGroup(group, units) {

 

        const groupUnits =

            units.filter(

                unit =>

                    this.belongsToGroup(

                        unit,

                        group

                    )

            );

 

        if (groupUnits.length === 0) {

            return {

                success: false,

                reason:

                    `没有找到增援组 ${group.id} 的单位`

            };

        }

 

        let index = 0;

 

        for (const unit of groupUnits) {

 

            const position =

                this.getEntryPosition(

                    group.entry,

                    index

                );

 

            unit.q = position.q;

            unit.r = position.r;

 

            unit.offMap = false;

 

            unit.hasMoved = false;

            unit.hasAttacked = false;

            unit.hasBombarded = false;

 

            index++;

        }

 

        return {

            success: true,

            type: "reinforcement",

            groupId: group.id,

            faction: group.faction,

            name: group.name,

            message: group.message,

            units: groupUnits

        };

    }

 

 

    // ========================================

    // 在入口附近展开

    //

    // 防止所有单位重叠在同一六角格。

    // ========================================

 

    getEntryPosition(

        entry,

        index

    ) {

 

        const offsets = [

            [0, 0],

            [-1, 0],

            [1, 0],

            [0, -1],

            [0, 1],

            [-1, 1],

            [1, -1],

 

            [-2, 0],

            [2, 0],

            [0, -2],

            [0, 2],

            [-2, 1],

            [2, -1],

            [-1, 2],

            [1, -2]

        ];

 

        const ring =

            Math.floor(

                index /

                offsets.length

            );

 

        const offset =

            offsets[

                index %

                offsets.length

            ];

 

        return {

            q:

                Math.max(

                    0,

                    Math.min(

                        95,

                        entry.q +

                        offset[0] +

                        ring

                    )

                ),

 

            r:

                Math.max(

                    0,

                    Math.min(

                        59,

                        entry.r +

                        offset[1] +

                        ring

                    )

                )

        };

    }

 

 

    // ========================================

    // 查询尚未到达的增援

    // ========================================

 

    getPendingReinforcements(

        faction,

        currentTurn

    ) {

 

        return this.schedule

            .filter(

                group =>

                    group.faction === faction &&

                    !this.arrivedGroups.has(

                        group.id

                    ) &&

                    group.arrivalTurn >

                        currentTurn

            )

            .map(

                group => ({

                    id: group.id,

                    name: group.name,

                    arrivalTurn:

                        group.arrivalTurn,

                    turnsRemaining:

                        group.arrivalTurn -

                        currentTurn

                })

            );

    }

 

 

    // ========================================

    // 单位是否在地图上

    // ========================================

 

    isUnitActive(unit) {

        return !!unit &&

            unit.offMap !== true &&

            unit.destroyed !== true &&

            (unit.strength ?? 0) > 0;

    }

 

 

    getActiveUnits(units) {

        return units.filter(

            unit =>

                this.isUnitActive(unit)

        );

    }

 

 

    // ========================================

    // 战役事件

    // ========================================

 

    processBattleEvents(

        currentTurn,

        units

    ) {

 

        const events = [];

 

        // --------------------------------

        // 事件1：台儿庄进入激烈巷战

        // --------------------------------

 

        const urbanBattle =

            this.checkUrbanBattle(units);

 

        if (

            urbanBattle &&

            !this.triggeredEvents.has(

                "TAIERZHUANG_URBAN_BATTLE"

            )

        ) {

            this.triggeredEvents.add(

                "TAIERZHUANG_URBAN_BATTLE"

            );

 

            events.push({

                id:

                    "TAIERZHUANG_URBAN_BATTLE",

 

                name:

                    "台儿庄巷战爆发",

 

                message:

                    "日军进入台儿庄核心城区，双方开始激烈巷战。",

 

                effects: {

                    chineseMorale: 3,

                    japaneseFatigue: 5

                }

            });

        }

 

 

        // --------------------------------

        // 事件2：日军久攻不下

        // --------------------------------

 

        if (

            currentTurn >= 24 &&

            !this.isTaierzhuangControlledBy(

                units,

                "japanese"

            ) &&

            !this.triggeredEvents.has(

                "JPN_STALLED"

            )

        ) {

 

            this.triggeredEvents.add(

                "JPN_STALLED"

            );

 

            events.push({

                id: "JPN_STALLED",

                name: "日军攻势受阻",

                message:

                    "日军未能迅速攻占台儿庄，攻势开始出现疲态。",

                effects: {

                    japaneseMorale: -3,

                    japaneseFatigue: 8

                }

            });

        }

 

 

        // --------------------------------

        // 事件3：中国军形成侧翼压力

        // --------------------------------

 

        if (

            currentTurn >= 18 &&

            this.hasChineseFlankingForce(

                units

            ) &&

            !this.triggeredEvents.has(

                "CHI_FLANK_PRESSURE"

            )

        ) {

 

            this.triggeredEvents.add(

                "CHI_FLANK_PRESSURE"

            );

 

            events.push({

                id:

                    "CHI_FLANK_PRESSURE",

 

                name:

                    "中国军侧翼反击",

 

                message:

                    "第二十军团在日军侧翼形成明显压力，日军补给线受到威胁。",

 

                effects: {

                    japaneseSupplyPressure:

                        true

                }

            });

        }

 

 

        return events;

    }

 

 

    // ========================================

    // 台儿庄城区战判断

    // ========================================

 

    checkUrbanBattle(units) {

 

        const city = {

            q: 48,

            r: 35

        };

 

        const chineseNear =

            units.some(unit =>

                this.isUnitActive(unit) &&

                unit.faction === "chinese" &&

                this.getDistance(

                    unit,

                    city

                ) <= 2

            );

 

        const japaneseNear =

            units.some(unit =>

                this.isUnitActive(unit) &&

                unit.faction === "japanese" &&

                this.getDistance(

                    unit,

                    city

                ) <= 2

            );

 

        return (

            chineseNear &&

            japaneseNear

        );

    }

 

 

    // ========================================

    // 台儿庄控制权

    // ========================================

 

    isTaierzhuangControlledBy(

        units,

        faction

    ) {

 

        const city = {

            q: 48,

            r: 35

        };

 

        const friendly =

            units.some(unit =>

                this.isUnitActive(unit) &&

                unit.faction === faction &&

                this.getDistance(

                    unit,

                    city

                ) <= 1

            );

 

        const enemy =

            units.some(unit =>

                this.isUnitActive(unit) &&

                unit.faction !== faction &&

                this.getDistance(

                    unit,

                    city

                ) <= 1

            );

 

        return (

            friendly &&

            !enemy

        );

    }

 

 

    // ========================================

    // 中国军侧翼部队判断

    // ========================================

 

    hasChineseFlankingForce(units) {

 

        return units.some(unit => {

 

            if (

                !this.isUnitActive(unit) ||

                unit.faction !== "chinese"

            ) {

                return false;

            }

 

            // 台儿庄西北方向进入关键区域，

            // 视为形成侧翼压力。

            return (

                unit.q >= 25 &&

                unit.q <= 40 &&

                unit.r >= 12 &&

                unit.r <= 28

            );

        });

    }

 

 

    // ========================================

    // 六角格距离

    // ========================================

 

    getDistance(a, b) {

        if (!a || !b) {

            return Infinity;

        }

 

        const dq =

            a.q - b.q;

 

        const dr =

            a.r - b.r;

 

        return Math.max(

            Math.abs(dq),

            Math.abs(dr),

            Math.abs(dq + dr)

        );

    }

 

 

    // ========================================

    // 应用事件效果

    // ========================================

 

    applyEventEffects(

        event,

        units

    ) {

 

        if (!event?.effects) {

            return;

        }

 

        for (const unit of units) {

 

            if (

                !this.isUnitActive(unit)

            ) {

                continue;

            }

 

            if (

                event.effects.chineseMorale &&

                unit.faction === "chinese"

            ) {

                unit.morale =

                    Math.min(

                        100,

                        (unit.morale ?? 80) +

                        event.effects.chineseMorale

                    );

            }

 

            if (

                event.effects.japaneseMorale &&

                unit.faction === "japanese"

            ) {

                unit.morale =

                    Math.max(

                        0,

                        (unit.morale ?? 80) +

                        event.effects.japaneseMorale

                    );

            }

 

            if (

                event.effects.japaneseFatigue &&

                unit.faction === "japanese"

            ) {

                unit.fatigue =

                    Math.min(

                        100,

                        (unit.fatigue ?? 0) +

                        event.effects.japaneseFatigue

                    );

            }

        }

 

        if (

            event.effects

                .japaneseSupplyPressure

        ) {

            this.applyJapaneseSupplyPressure();

        }

    }

 

 

    // ========================================

    // 日军补给压力

    //

    // 若 world 中存在 supplySources，

    // 可直接削弱峄县补给节点容量。

    // ========================================

 

    applyJapaneseSupplyPressure() {

 

        const sources =

            this.world?.supplySources ??

            this.world?.map?.supplySources ??

            [];

 

        const yixian =

            sources.find(

                source =>

                    source.id ===

                    "JPN_YIXIAN"

            );

 

        if (yixian) {

            yixian.capacity =

                Math.max(

                    40,

                    Number(

                        yixian.capacity ??

                        100

                    ) - 25

                );

        }

    }

 

 

    // ========================================

    // UI / 战役日志辅助

    // ========================================

 

    getReinforcementStatus(

        currentTurn,

        faction

    ) {

 

        const pending =

            this.getPendingReinforcements(

                faction,

                currentTurn

            );

 

        if (pending.length === 0) {

            return "无待到达增援";

        }

 

        return pending

            .map(

                item =>

                    `${item.name}：${item.turnsRemaining}回合后到达`

            )

            .join("\n");

    }

}
