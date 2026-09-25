// src/ui/CampaignSelection.js

import { CAMPAIGNS } from "../../data/campaigns.js";

 

export class CampaignSelection {

    constructor() {

        this.overlay = null;

        this.theater = null;

        this.phase = null;

        this.onScenarioSelected = null;

    }

 

    show(onScenarioSelected) {

        this.onScenarioSelected = onScenarioSelected;

        this.renderTheaters();

    }

 

    close() {

        this.overlay?.remove();

        this.overlay = null;

    }

 

    ensureOverlay() {

        this.close();

        this.overlay = document.createElement("div");

        this.overlay.id = "campaign-selection";

        Object.assign(this.overlay.style, {

            position: "fixed", inset: "0", zIndex: "100000",

            background: "rgba(28,31,26,.94)",

            display: "flex", alignItems: "center", justifyContent: "center",

            fontFamily: "FangSong, STFangsong, SimSun, serif"

        });

        document.body.appendChild(this.overlay);

        return this.overlay;

    }

 

    shell(title, subtitle, body, back = "") {

        const overlay = this.ensureOverlay();

        overlay.innerHTML = `

            <div style="width:min(980px,calc(100vw - 48px));max-height:90vh;overflow:auto;

                padding:32px 38px;box-sizing:border-box;background:#d6cfb2;color:#24251f;

                border:2px solid #5a5646;outline:1px solid #c6b98b;outline-offset:-8px;">

                <h1 style="margin:0;text-align:center;font-size:34px;letter-spacing:.12em;">${title}</h1>

                <div style="margin:8px 0 28px;text-align:center;color:#666253;">${subtitle}</div>

                ${body}

                ${back ? `<button id="campaign-back" style="margin-top:24px;padding:9px 18px;">返回</button>` : ""}

            </div>`;

        if (back) overlay.querySelector("#campaign-back").onclick = back;

        return overlay;

    }

 

    renderTheaters() {

        const cards = CAMPAIGNS.map(item => `

            <button data-theater="${item.id}" style="min-height:150px;padding:20px;

                border:1px solid #696553;background:#c8c1a4;cursor:pointer;font:inherit;text-align:left;">

                <strong style="display:block;font-size:26px;margin-bottom:10px;">${item.name}</strong>

                <span>${item.subtitle}</span>

            </button>`).join("");

 

        const overlay = this.shell(

            "选择战场",

            "WORLD WAR II · 战役合集",

            `<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;">${cards}</div>`

        );

 

        overlay.querySelectorAll("[data-theater]").forEach(button => {

            button.onclick = () => {

                this.theater = CAMPAIGNS.find(x => x.id === button.dataset.theater);

                this.renderPhases();

            };

        });

    }

 

    renderPhases() {

        const cards = this.theater.phases.map(item => `

            <button data-phase="${item.id}" style="min-height:110px;padding:18px;

                border:1px solid #696553;background:#c8c1a4;cursor:pointer;font:inherit;text-align:left;">

                <strong style="font-size:21px;">${item.name}</strong>

                <div style="margin-top:10px;color:#625e50;">

                    ${item.scenarios.some(s => s.status === "available") ? "可进入" : "尚未开放"}

                </div>

            </button>`).join("");

 

        const overlay = this.shell(

            this.theater.name,

            "选择战役阶段",

            `<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;">${cards}</div>`,

            () => this.renderTheaters()

        );

 

        overlay.querySelectorAll("[data-phase]").forEach(button => {

            button.onclick = () => {

                this.phase = this.theater.phases.find(x => x.id === button.dataset.phase);

                this.renderScenarios();

            };

        });

    }

 

    renderScenarios() {

        const list = this.phase.scenarios.length

            ? this.phase.scenarios.map(item => {

                const locked = item.status !== "available";

                return `<button data-scenario="${item.id}" ${locked ? "disabled" : ""}

                    style="min-height:130px;padding:20px;border:1px solid #696553;

                    background:${locked ? "#aaa58f" : "#c8c1a4"};cursor:${locked ? "not-allowed" : "pointer"};

                    font:inherit;text-align:left;opacity:${locked ? ".65" : "1"};">

                    <strong style="display:block;font-size:24px;">${item.name}</strong>

                    <span style="display:block;margin-top:8px;">${item.dateText ?? "开发中"}</span>

                    <span style="display:block;margin-top:8px;color:#625e50;">

                        ${locked ? "尚未开放" : (item.location ?? "可进入战役")}

                    </span>

                </button>`;

            }).join("")

            : `<div style="padding:40px;text-align:center;">该阶段战役尚未开放。</div>`;

 

        const overlay = this.shell(

            this.phase.name,

            this.theater.name,

            `<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;">${list}</div>`,

            () => this.renderPhases()

        );

 

        overlay.querySelectorAll("[data-scenario]:not([disabled])").forEach(button => {

            button.onclick = () => this.renderBriefing(button.dataset.scenario);

        });

    }

 

    renderBriefing(id) {

        const scenario = this.phase.scenarios.find(x => x.id === id);

        const overlay = this.shell(

            scenario.name,

            `${scenario.dateText ?? ""} · ${scenario.location ?? ""}`,

            `<div style="padding:24px;background:#c8c1a4;border:1px solid #696553;line-height:1.8;">

                <div><strong>战场：</strong>${this.theater.name}</div>

                <div><strong>阶段：</strong>${this.phase.name}</div>

                <div><strong>战役：</strong>${scenario.name}</div>

                <div><strong>规模：</strong>营 / 连级战术单位</div>

                <button id="campaign-start" style="display:block;margin:28px auto 0;padding:12px 34px;

                    font:inherit;font-size:18px;cursor:pointer;">开始战役</button>

            </div>`,

            () => this.renderScenarios()

        );

 

        overlay.querySelector("#campaign-start").onclick = () => {

            this.close();

            this.onScenarioSelected?.(scenario.id);

        };

    }

}
