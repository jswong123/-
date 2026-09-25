// ============================================================

// TurnSystem.js

// 通用双阵营回合系统

//

// 颜色与回合逻辑分离：

// - 红色 = 当前战役进攻方

// - 蓝色 = 当前战役防守方

// - phaseOrder 决定实际行动顺序

// ============================================================

 

export class TurnSystem {

 

    constructor(options = {}) {

 

        this.year =

            options.year ?? 1941;

 

        this.month =

            options.month ?? 6;

 

        this.day =

            options.day ?? 26;

 

        this.hour =

            options.hour ?? 8;

 

        this.minute =

            options.minute ?? 0;

 

        this.hoursPerTurn =

            options.hoursPerTurn ?? 2;

 

        this.turn =

            options.turn ?? 1;

 

        this.units =

            options.units ?? [];

 

        const fallbackStart =

            this.normalizeSide(

                options.startingPhase ??

                "german"

            );

 

        const fallbackEnemy =

            fallbackStart === "japanese"

                ? "chinese"

                : "soviet";

 

        this.phaseOrder =

            (

                Array.isArray(

                    options.phaseOrder

                ) &&

                options.phaseOrder.length >= 2

                    ? options.phaseOrder

                    : [

                        fallbackStart,

                        fallbackEnemy

                    ]

            )

                .map(

                    side =>

                        this.normalizeSide(

                            side

                        )

                );

 

        this.phase =

            this.normalizeSide(

                options.startingPhase ??

                this.phaseOrder[0]

            );

 

        if (

            !this.phaseOrder.includes(

                this.phase

            )

        ) {

            this.phaseOrder.unshift(

                this.phase

            );

        }

 

        this.defaultActionPoints = {

            infantry: 6,

            armor: 8,

            artillery: 5,

            reconnaissance: 9,

            headquarters: 5,

            default: 6

        };

 

        this.onPhaseChanged = null;

        this.onTurnChanged = null;

        this.onTimeChanged = null;

 

        this.initializeUnits();

    }

 

 

    normalizeSide(side) {

 

        const value =

            String(side ?? "")

                .trim()

                .toLowerCase();

 

        const map = {

            ger: "german",

            germany: "german",

            german: "german",

            axis: "german",

            "德军": "german",

 

            ussr: "soviet",

            soviet: "soviet",

            redarmy: "soviet",

            "苏军": "soviet",

            "红军": "soviet",

 

            chn: "chinese",

            china: "chinese",

            chinese: "chinese",

            "中国军": "chinese",

            "国军": "chinese",

 

            jpn: "japanese",

            japan: "japanese",

            japanese: "japanese",

            "日军": "japanese",

 

            gbr: "british",

            british: "british",

            uk: "british",

 

            ita: "italian",

            italian: "italian",

 

            usa: "american",

            american: "american"

        };

 

        return map[value] ?? value;

    }

 

 

    getSideName(side) {

 

        const names = {

            german: "德军",

            soviet: "苏军",

            chinese: "中国军",

            japanese: "日军",

            british: "英军",

            italian: "意军",

            american: "美军"

        };

 

        return (

            names[

                this.normalizeSide(

                    side

                )

            ] ??

            String(side ?? "")

        );

    }

 

 

    initializeUnits() {

 

        for (const unit of this.units) {

 

            const maxAP =

                this.getUnitMaxAP(

                    unit

                );

 

            unit.maxActionPoints =

                maxAP;

 

            if (

                unit.actionPoints ==

                null

            ) {

                unit.actionPoints =

                    maxAP;

            }

 

            unit.hasMoved = false;

            unit.hasAttacked = false;

        }

    }

 

 

    getUnitMaxAP(unit) {

 

        if (

            Number.isFinite(

                unit.maxActionPoints

            ) &&

            unit.maxActionPoints > 0

        ) {

            return unit.maxActionPoints;

        }

 

        if (

            Number.isFinite(

                unit.maxAP

            ) &&

            unit.maxAP > 0

        ) {

            return unit.maxAP;

        }

 

        const type =

            String(

                unit.type ??

                unit.unitType ??

                unit.branch ??

                ""

            ).toLowerCase();

 

        if (

            /tank|armor|panzer|mechanized/

                .test(type)

        ) {

            return 8;

        }

 

        if (

            /artillery|gun/

                .test(type)

        ) {

            return 5;

        }

 

        if (

            /recon|scout/

                .test(type)

        ) {

            return 9;

        }

 

        if (

            /hq|headquarter/

                .test(type)

        ) {

            return 5;

        }

 

        return 6;

    }

 

 

    isUnitActive(unit) {

 

        if (!unit) {

            return false;

        }

 

        return (

            this.normalizeSide(

                unit.side ??

                unit.faction ??

                unit.camp

            ) ===

            this.phase

        );

    }

 

 

    canUnitAct(unit) {

 

        return (

            this.isUnitActive(unit) &&

            (unit.actionPoints ?? 0) > 0

        );

    }

 

 

    canSpendAP(unit, cost) {

 

        return (

            this.canUnitAct(unit) &&

            (Number(

                unit.actionPoints

            ) || 0) >=

            Math.max(

                0,

                Number(cost) || 0

            )

        );

    }

 

 

    spendAP(unit, cost) {

 

        const value =

            Math.max(

                0,

                Number(cost) || 0

            );

 

        if (

            !this.canSpendAP(

                unit,

                value

            )

        ) {

            return false;

        }

 

        unit.actionPoints =

            Math.max(

                0,

                unit.actionPoints -

                value

            );

 

        return true;

    }

 

 

    registerMove(unit, cost) {

 

        if (

            !this.spendAP(

                unit,

                cost

            )

        ) {

            return false;

        }

 

        unit.hasMoved = true;

 

        return true;

    }

 

 

    registerAttack(

        unit,

        cost = 2

    ) {

 

        if (

            !this.spendAP(

                unit,

                cost

            )

        ) {

            return false;

        }

 

        unit.hasAttacked = true;

 

        return true;

    }

 

 

    getPhaseName() {

 

        return (

            `${this.getSideName(

                this.phase

            )}行动`

        );

    }

 

 

    getTurnNumber() {

        return this.turn;

    }

 

 

    getDateText() {

 

        return (

            `${this.year}年` +

            `${this.month}月` +

            `${this.day}日`

        );

    }

 

 

    getTimeText() {

 

        return (

            `${String(

                this.hour

            ).padStart(

                2,

                "0"

            )}:` +

            `${String(

                this.minute

            ).padStart(

                2,

                "0"

            )}`

        );

    }

 

 

    getHeaderText() {

 

        return (

            `${this.getDateText()} · ` +

            `${this.getTimeText()} ｜ ` +

            `第${this.turn}回合 ｜ ` +

            `${this.getPhaseName()}`

        );

    }

 

 

    getTurnTimeRange() {

 

        const start =

            this.getTimeText();

 

        let endHour =

            this.hour +

            this.hoursPerTurn;

 

        let endDay =

            this.day;

 

        while (

            endHour >= 24

        ) {

            endHour -= 24;

            endDay += 1;

        }

 

        const end =

            `${String(

                endHour

            ).padStart(

                2,

                "0"

            )}:` +

            `${String(

                this.minute

            ).padStart(

                2,

                "0"

            )}`;

 

        if (

            endDay !==

            this.day

        ) {

            return (

                `${start}—次日${end}`

            );

        }

 

        return `${start}—${end}`;

    }

 

 

    endPhase() {

 

        const currentIndex =

            this.phaseOrder.indexOf(

                this.phase

            );

 

        if (

            currentIndex >= 0 &&

            currentIndex <

                this.phaseOrder.length - 1

        ) {

            this.phase =

                this.phaseOrder[

                    currentIndex + 1

                ];

 

            this.resetActionPointsForSide(

                this.phase

            );

 

            this.emitPhaseChanged();

 

            return;

        }

 

        this.finishTurn();

    }

 

 

    finishTurn() {

 

        this.advanceTime(

            this.hoursPerTurn

        );

 

        this.turn += 1;

 

        this.phase =

            this.phaseOrder[0];

 

        this.resetActionPointsForSide(

            this.phase

        );

 

        if (

            typeof this.onTurnChanged ===

            "function"

        ) {

            this.onTurnChanged(

                this

            );

        }

 

        this.emitPhaseChanged();

    }

 

 

    advanceTime(hours) {

 

        this.hour += hours;

 

        while (

            this.hour >= 24

        ) {

            this.hour -= 24;

            this.advanceDay();

        }

 

        if (

            typeof this.onTimeChanged ===

            "function"

        ) {

            this.onTimeChanged(

                this

            );

        }

    }

 

 

    advanceDay() {

 

        const daysInMonth =

            new Date(

                this.year,

                this.month,

                0

            ).getDate();

 

        this.day += 1;

 

        if (

            this.day >

            daysInMonth

        ) {

            this.day = 1;

            this.month += 1;

 

            if (

                this.month > 12

            ) {

                this.month = 1;

                this.year += 1;

            }

        }

    }

 

 

    resetActionPointsForSide(side) {

 

        const target =

            this.normalizeSide(

                side

            );

 

        for (const unit of this.units) {

 

            const unitSide =

                this.normalizeSide(

                    unit.side ??

                    unit.faction ??

                    unit.camp

                );

 

            if (

                unitSide !==

                target

            ) {

                continue;

            }

 

            unit.actionPoints =

                this.getUnitMaxAP(

                    unit

                );

 

            unit.hasMoved = false;

            unit.hasAttacked = false;

            unit.hasBombarded = false;

        }

    }

 

 

    emitPhaseChanged() {

 

        if (

            typeof this.onPhaseChanged ===

            "function"

        ) {

            this.onPhaseChanged(

                this

            );

        }

    }

 

 

    getState() {

 

        return {

            turn: this.turn,

            phase: this.phase,

            phaseOrder: [

                ...this.phaseOrder

            ],

            year: this.year,

            month: this.month,

            day: this.day,

            hour: this.hour,

            minute: this.minute

        };

    }

 

 

    setState(state = {}) {

 

        for (

            const key of [

                "turn",

                "year",

                "month",

                "day",

                "hour",

                "minute"

            ]

        ) {

            if (

                Number.isFinite(

                    Number(

                        state[key]

                    )

                )

            ) {

                this[key] =

                    Number(

                        state[key]

                    );

            }

        }

 

        if (state.phase) {

            this.phase =

                this.normalizeSide(

                    state.phase

                );

        }

 

        if (

            Array.isArray(

                state.phaseOrder

            ) &&

            state.phaseOrder.length

        ) {

            this.phaseOrder =

                state.phaseOrder.map(

                    side =>

                        this.normalizeSide(

                            side

                        )

                );

        }

 

        this.emitPhaseChanged();

    }

}

