// src/systems/FactionSystem.js

// 通用阵营定义：替代代码中“只认识德军/苏军”的写死逻辑

 

export const FACTIONS = {

    GER: {

        id: "GER", side: "german",

        name: "德军", fullName: "纳粹德国",

        enemy: "USSR"

    },

    USSR: {

        id: "USSR", side: "soviet",

        name: "苏军", fullName: "苏联红军",

        enemy: "GER"

    },

    CHN: {

        id: "CHN", side: "chinese",

        name: "中国", fullName: "中国军队",

        enemy: "JPN"

    },

    JPN: {

        id: "JPN", side: "japanese",

        name: "日军", fullName: "日军",

        enemy: "CHN"

    },

    GBR: {

        id: "GBR", side: "british",

        name: "英军", fullName: "英国陆军",

        enemy: null

    },

    ITA: {

        id: "ITA", side: "italian",

        name: "意军", fullName: "意大利陆军",

        enemy: null

    },

    USA: {

        id: "USA", side: "american",

        name: "美军", fullName: "美国陆军",

        enemy: null

    }

};

 

const ALIASES = {

    GER: "GER", german: "GER", germany: "GER",

    USSR: "USSR", soviet: "USSR", ussr: "USSR",

    CHN: "CHN", chinese: "CHN", china: "CHN",

    JPN: "JPN", japanese: "JPN", japan: "JPN",

    GBR: "GBR", british: "GBR", uk: "GBR",

    ITA: "ITA", italian: "ITA", italy: "ITA",

    USA: "USA", american: "USA"

};

 

export class FactionSystem {

    static normalizeFaction(value) {

        if (!value) return null;

        return ALIASES[String(value)] ?? ALIASES[String(value).toLowerCase()] ?? null;

    }

 

    static getFaction(value) {

        const id = this.normalizeFaction(value);

        return id ? FACTIONS[id] : null;

    }

 

    static getUnitFaction(unit) {

        if (!unit) return null;

        return this.normalizeFaction(unit.faction ?? unit.side);

    }

 

    static getUnitSide(unit) {

        const faction = this.getFaction(this.getUnitFaction(unit));

        return faction?.side ?? null;

    }

 

    static getName(value) {

        return this.getFaction(value)?.name ?? String(value ?? "");

    }

 

    static getSideName(side) {

        const faction = Object.values(FACTIONS).find(item => item.side === side);

        return faction?.name ?? side ?? "";

    }

 

    static configureGameState(gameState, factionIds = []) {

        if (!gameState) return;

        gameState.factions = {};

 

        for (const id of factionIds) {

            const faction = FACTIONS[id];

            if (faction) gameState.factions[id] = { ...faction };

        }

    }

}
