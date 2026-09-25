// ============================================================

// SaveSystem.js

// 东线 1941 V1.4

// localStorage 存档系统

// ============================================================

export class SaveSystem {

    constructor({ maxSlots = 6, storagePrefix = "eastern-front-1941-v1.4" } = {}) {

        this.maxSlots = maxSlots;

        this.storagePrefix = storagePrefix;

        this.autoKey = `${storagePrefix}:autosave`;

    }

 

    clone(value) {

        return JSON.parse(JSON.stringify(value));

    }

 

    key(slot) {

        const n = Math.max(1, Math.min(this.maxSlots, Number(slot) || 1));

        return `${this.storagePrefix}:slot:${n}`;

    }

 

    createSnapshot({ units, turnSystem, gameState, gameOver, scenario }) {

        return {

            version: "1.4",

            savedAt: new Date().toISOString(),

            units: this.clone(units ?? []),

            gameOver: gameOver === true,

            playerFaction:

                gameState?.playerFaction ??

                gameState?.playerSide ??

                gameState?.selectedFaction ??

                gameState?.selectedSide ??

                null,

            mode: gameState?.mode ?? "player",

            scenario: scenario ? this.clone(scenario) : null,

            turn: {

                turn: turnSystem?.turn ?? turnSystem?.getTurnNumber?.() ?? 1,

                phase: turnSystem?.phase ?? "german",

                year: turnSystem?.year ?? 1941,

                month: turnSystem?.month ?? 6,

                day: turnSystem?.day ?? 26,

                hour: turnSystem?.hour ?? 8,

                minute: turnSystem?.minute ?? 0

            }

        };

    }

 

    save(slot, state) {

        const snapshot = this.createSnapshot(state);

        localStorage.setItem(this.key(slot), JSON.stringify(snapshot));

        return snapshot;

    }

 

    load(slot) {

        const raw = localStorage.getItem(this.key(slot));

        if (!raw) return null;

        try {

            return JSON.parse(raw);

        } catch (error) {

            console.error("[存档系统] 存档损坏：", error);

            return null;

        }

    }

 

    has(slot) {

        return localStorage.getItem(this.key(slot)) !== null;

    }

 

    remove(slot) {

        localStorage.removeItem(this.key(slot));

    }

 

    autoSave(state) {

        const snapshot = this.createSnapshot(state);

        localStorage.setItem(this.autoKey, JSON.stringify(snapshot));

        return snapshot;

    }

 

    loadAutoSave() {

        const raw = localStorage.getItem(this.autoKey);

        if (!raw) return null;

        try {

            return JSON.parse(raw);

        } catch (error) {

            console.error("[存档系统] 自动存档损坏：", error);

            return null;

        }

    }

}

