import { GameSet } from '../module/GameSet';
import { Http } from '../net/Http';

let gmserver = {
    ["http://192.168.0.60:7882"]: 18001,
    ["http://124.71.83.101:7880"]: 17999,
    ["http://124.71.83.101:7881"]: 18000,
    ["http://192.168.0.18:7880"]: 7999,
    ["http://192.168.0.71:7882"]: 18001,
    ["http://192.168.0.95:7881"]: 18000,
    ["http://192.168.0.54:7882"]: 18001,
    ["http://192.168.0.94:7880"]: 17999,
}

export class GmTest {
    private static url: string = "";
    private static playerId: string = "";

    static init(url: string, player_id?: string) {
        let post = gmserver[url];
        let host = url.replace(/\:[^\:]+$/, "");
        if (!post || !post) return [];
        this.url = host + ":" + post;
        this.playerId = player_id;
        return [host, post];
    }

    static async addItem(item_id: number, item_count: number) {
        if (!item_id || !item_count) {
            console.error("缺少道具id或数量");
            return;
        }
        await Http.Send({ serverUrl: this.url, uri: "/api/player", },
            { player_id: this.playerId, type: "AddItem", data: { "item_id": item_id, "count": item_count } }
        );
    }

    static async addCurrency(count: number, type: number = 0) {
        if (!this.url) return;
        if (type == undefined || !count) {
            console.error("缺少货币类型或数量")
            return;
        }
        await Http.Send({ serverUrl: this.url, uri: "/api/player", },
            { player_id: this.playerId, type: "AddCurrency", data: { "type": type, "value": count } }
        );
    }

    static async addResource(wood: number = 0, water: number = 0, rock: number = 0, seed: number = 0) {
        if (!this.url) return;
        await Http.Send({ serverUrl: this.url, uri: "/api/player", },
            { player_id: this.playerId, type: "AddResource", data: { "wood": wood, "water": water, "rock": rock, "seed": seed } }
        );
    }

    static async addRole(type: number = 101, count: number = 1) {
        if (!this.url) return;
        let ls = [];
        //增加角色
        for (let index = 0; index < count; index++) {
            let id = "d9c71dea-7d3e-tttt-ttt1-a89a7af05909" + index;
            let p = Http.Send({ serverUrl: this.url, uri: "/api/player", },
                {
                    player_id: this.playerId, type: "AddRole",
                    data: {
                        "role": {
                            "id": id, "type": type, "level": 1, "quality": 1, "experience": 0, "soldier_num": 0,
                            "active_skills": [{ "skill_id": 10101, "level": 1 }, { "skill_id": 10102, "level": 1 }],
                            "passive_skills": [{ "skill_id": 70101, "level": 1 }, { "skill_id": 60101, "level": 1 }],
                            "battle_power": 11435,
                            "is_in_building": false,
                            "building_id": 0,
                            "is_assisting": false
                        }
                    }
                }
            )
            ls.push(p);
        }
        await Promise.all(ls);
    }

    static async deletlItem(item_id: number, item_count: number) {
        if (!this.url) return;
        if (!item_id || !item_count) {
            console.error("缺少道具id或数量");
            return;
        }
        await Http.Send({ serverUrl: this.url, uri: "/api/player", },
            { player_id: this.playerId, type: "ConsumeItem", data: { "item_id": item_id, "count": item_count } }
        );
    }

    static async deletlCurrency(type: number, count: number) {
        if (!this.url) return;
        if (type == undefined || !count) {
            console.error("缺少货币类型或数量")
            return;
        }
        await Http.Send({ serverUrl: this.url, uri: "/api/player", },
            { player_id: this.playerId, type: "ConsumeCurrency", data: { "type": type, "value": count } }
        );
    }

    static async deletlResource(wood: number = 0, water: number = 0, rock: number = 0, seed: number = 0) {
        if (!this.url) return;
        await Http.Send({ serverUrl: this.url, uri: "/api/player", },
            { player_id: this.playerId, type: "ConsumeResource", data: { "wood": wood, "water": water, "rock": rock, "seed": seed } }
        );

    }

    static async deletlRole(id: string) {
        if (!this.url) return;
        //删除角色
        await Http.Send({ serverUrl: this.url, uri: "/api/player", }, { player_id: this.playerId, type: "ConsumeRole", data: { role_id: id } })
    }

    // private static getAddInfo() {
    //     let url_list = GameSet.Local_host.split(":")
    //     this.url = url_list[0] + ":" + url_list[1];
    //     let url = ["http://192.168.0.60:7882", "http://124.71.83.101:7880", "http://124.71.83.101:7881", "http://192.168.0.18:7880"];
    //     let post_list = ["18001", "17999", "18000", "7999"];
    //     for (let index = 0; index < url.length; index++) {
    //         const element = url[index];
    //         if (GameSet.Local_host == element) {
    //             this.post = post_list[index];
    //         }
    //     }     
    // }

}
