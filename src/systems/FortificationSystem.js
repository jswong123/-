// ============================================================

// FortificationSystem.js

// 防御工事与工兵构筑系统 V1.0

// ============================================================

 

export class FortificationSystem {

    constructor(world) {

        this.world = world;

    }

 

    getAt(q, r) {

        return this.world?.fortificationAt?.(q, r) ?? null;

    }

 

    defenseMultiplier(q, r) {

        const fort = this.getAt(q, r);

        if (!fort) return 1;

 

        const level = Number(fort.level ?? 0);

 

        if (fort.type === "fortified_urban") {

            return 1 + level * 0.18;

        }

 

        return 1 + level * 0.12;

    }

 

    suppressionMultiplier(q, r) {

        const fort = this.getAt(q, r);

        if (!fort) return 1;

 

        const level = Number(fort.level ?? 0);

        return Math.max(0.55, 1 - level * 0.12);

    }

 

    canEntrench(unit) {

        if (!unit || unit.destroyed || Number(unit.strength ?? unit.manpower ?? 0) <= 0) {

            return false;

        }

 

        const type = String(unit.type ?? "").toLowerCase();

        return [

            "infantry",

            "motorized",

            "motorized_infantry",

            "engineer",

            "engineering",

            "antitank",

            "anti_tank"

        ].includes(type);

    }

 

    build(unit) {

        if (!this.canEntrench(unit)) {

            return { success:false, reason:"该单位不能构筑工事" };

        }

 

        const q = Number(unit.q);

        const r = Number(unit.r);

        const terrain = this.world.terrainAt(q, r);

        const current = this.getAt(q, r);

 

        const type = String(unit.type ?? "").toLowerCase();

        const isEngineer = type === "engineer" || type === "engineering";

 

        const oldLevel = Number(current?.level ?? 0);

        const gain = isEngineer ? 1 : 0.5;

        const progress = Number(current?.progress ?? 0) + gain;

 

        let newLevel = oldLevel;

        let newProgress = progress;

 

        if (progress >= 1 && oldLevel < 3) {

            newLevel += 1;

            newProgress = progress - 1;

        }

 

        const fortType = terrain === "urban" ? "fortified_urban" : "fieldworks";

 

        this.world.setFortification(q, r, {

            type: fortType,

            level: Math.max(1, newLevel),

            progress: newProgress,

            owner: unit.faction

        });

 

        unit.hasMoved = true;

        unit.hasAttacked = true;

        unit.movementPoints = 0;

 

        return {

            success:true,

            level:Math.max(1, newLevel),

            type:fortType

        };

    }

 

    assaultModifier(attacker, defender) {

        if (!defender) return 1;

 

        const fort = this.getAt(defender.q, defender.r);

        if (!fort) return 1;

 

        const attackerType = String(attacker?.type ?? "").toLowerCase();

        const engineer =

            attackerType === "engineer" ||

            attackerType === "engineering";

 

        // 工兵攻击工事时削弱工事效果

        return engineer ? 0.82 : 0.68;

    }

}

