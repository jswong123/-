// data/campaigns.js

 

// 多战场 / 阶段 / 战役目录

 

 

 

export const CAMPAIGNS = [

 

    {

 

        id: "eastern_front",

 

        name: "苏德战场",

 

        subtitle: "Eastern Front",

 

        phases: [

 

            {

 

                id: "barbarossa_1941",

 

                name: "1941：巴巴罗萨",

 

                scenarios: [

 

                    {

 

                        id: "dubno",

 

                        name: "杜布诺战役",

 

                        subtitle: "Battle of Dubno",

 

                        dateText: "1941年6月26日",

 

                        location: "乌克兰西部",

 

                        status: "available",

 

                        scenarioPath: "./data/scenario.json",

 

                        unitsPath: "./data/units.json",

 

                        factions: ["GER", "USSR"],

 

                        roles: { attacker: "german", defender: "soviet" },

 

                        start: {

 

                            year: 1941, month: 6, day: 26,

 

                            hour: 8, minute: 0,

 

                            hoursPerTurn: 2,

 

                            startingPhase: "german"

 

                        }

 

                    },

 

                    {

 

                        id: "smolensk",

 

                        name: "斯摩棱斯克战役",

 

                        subtitle: "Battle of Smolensk",

 

                        dateText: "1941年7月10日",

 

                        location: "斯摩棱斯克",

 

                        status: "available",

 

                        scenarioPath: "./data/scenario-smolensk.json",

 

                        unitsPath: "./data/units-smolensk.json",

 

                        factions: ["GER", "USSR"],

 

                        roles: { attacker: "german", defender: "soviet" },

 

                        start: {

 

                            year: 1941, month: 7, day: 10,

 

                            hour: 8, minute: 0,

 

                            hoursPerTurn: 2,

 

                            startingPhase: "german"

 

                        }

 

                    }

 

                ]

 

            },

 

            { id: "blue_1942", name: "1942：蓝色方案", scenarios: [] },

 

            { id: "counteroffensive_1943", name: "1943：战略反攻", scenarios: [] },

 

            { id: "germany_1944_45", name: "1944–45：攻入德国", scenarios: [] }

 

        ]

 

    },

 

 

 

    {

 

        id: "china_front",

 

        name: "中国战场",

 

        subtitle: "China Front",

 

        phases: [

 

            { id: "china_1937", name: "1937：全面战争爆发", scenarios: [] },

 

            {

 

                id: "china_1938",

 

                name: "1938：徐州—武汉阶段",

 

                scenarios: [

 

                    {

 

                        id: "taierzhuang",

 

                        name: "台儿庄战役",

 

                        subtitle: "Battle of Taierzhuang",

 

                        dateText: "1938年3月—4月",

 

                        location: "山东·台儿庄",

 

                        status: "available",

 

                        scenarioPath: "./data/scenario-taierzhuang.json",

 

                        unitsPath: "./data/units-taierzhuang.json",

 

                        factions: ["CHN", "JPN"],

 

                        roles: { attacker: "japanese", defender: "chinese" },

 

                        start: {

 

                            year: 1938, month: 3, day: 24,

 

                            hour: 8, minute: 0,

 

                            hoursPerTurn: 2,

 

                            startingPhase: "japanese"

 

                        }

 

                    },

 

                    { id: "xuzhou", name: "徐州会战", status: "locked" },

 

                    { id: "wuhan", name: "武汉会战", status: "locked" }

 

                ]

 

            },

 

            { id: "china_1939_41", name: "1939–41：战略相持", scenarios: [] },

 

            { id: "china_1942_45", name: "1942–45：战争后期", scenarios: [] }

 

        ]

 

    },

 

 

 

    {

 

        id: "eastern_europe",

 

        name: "东欧战场",

 

        subtitle: "Eastern Europe",

 

        phases: [

 

            { id: "poland_1939", name: "1939：波兰战役", scenarios: [] },

 

            { id: "balkans_1941", name: "1941：巴尔干战役", scenarios: [] },

 

            { id: "romania_hungary_1944", name: "1944：罗马尼亚—匈牙利", scenarios: [] },

 

            { id: "central_europe_1945", name: "1945：中欧决战", scenarios: [] }

 

        ]

 

    },

 

 

 

    {

 

        id: "north_africa",

 

        name: "北非战场",

 

        subtitle: "North Africa",

 

        phases: [

 

            { id: "desert_1940_41", name: "1940–41：沙漠战争初期", scenarios: [] },

 

            { id: "rommel_1941_42", name: "1941–42：隆美尔攻势", scenarios: [] },

 

            { id: "el_alamein_1942", name: "1942：阿拉曼阶段", scenarios: [] },

 

            { id: "tunisia_1942_43", name: "1942–43：突尼斯战役", scenarios: [] }

 

        ]

 

    }

 

];

 

 

 

export function findScenarioById(id) {

 

    for (const theater of CAMPAIGNS) {

 

        for (const phase of theater.phases) {

 

            const scenario = phase.scenarios.find(item => item.id === id);

 

            if (scenario) return { theater, phase, scenario };

 

        }

 

    }

 

    return null;

 

}

