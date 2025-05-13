import { _decorator, Button, Canvas, Component, EditBox, EventTouch, find, Input, instantiate, JsonAsset, Label, native, Node, RenderTexture, Sprite, TextAsset, Texture2D } from 'cc';
import { CfgMgr, ItemSubType, StdItem, ThingType } from '../manager/CfgMgr';
import PlayerData from '../module/roleModule/PlayerData'
import { RoleStateType, SOrderData, SOrderType, SPlayerData, SPlayerDataRole, SThing } from '../module/roleModule/PlayerStruct';
import { Http } from '../net/Http';
import { Panel } from '../GameRoot';
import { GameSet } from '../module/GameSet';
import { Tips } from '../module/login/Tips';
import { GmTest } from './GmTest';

export class GmTestPaenl extends Panel {
    protected prefab: string = "prefabs/GM/GmTestPaenl";

    private url: string
    private id_or_type: number;
    private count: number;
    private post: number
    private label1: EditBox
    private label2: EditBox
    private item: Node
    private content: Node
    private sendBtn: Node;
    private type: number


    protected async onLoad() {
        this.label1 = this.find("name").getComponent(EditBox);
        this.label2 = this.find("start").getComponent(EditBox);
        this.content = this.find("ScrollView/view/content");
        this.item = this.find("ScrollView/view/content/Button-001");
        this.CloseBy("closeBtn");
        this.sendBtn = this.find("sendBtn");
        this.sendBtn.on(Input.EventType.TOUCH_END, this.onButton, this)
    }

    protected onShow(): void {
        [this.url, this.post] = GmTest.init(GameSet.Local_host);
        // let url_list = GameSet.Local_host.split(":")
        // this.url = url_list[0] + ":" + url_list[1];

        // let url = ["http://192.168.0.60:7882", "http://124.71.83.101:7880", "http://124.71.83.101:7881", "http://192.168.0.18:7880", "http://192.168.0.71:7882"];
        // let post_list = [18001, 17999, 18000, 7999, 18001];
        // for (let index = 0; index < url.length; index++) {
        //     const element = url[index];
        //     if (GameSet.Local_host == element) {
        //         this.post = post_list[index];
        //         return;
        //     }
        // }
        if (!this.post) {
            Tips.Show("该服暂不支持")
            return
        }
    }

    public flush(...args: any[]): void {
        this.label1.string = "";
        this.label2.string = "";
        this.content.removeAllChildren();
        let item_list: StdItem[] = CfgMgr.Get("Item");
        for (const key in item_list) {
            let item = instantiate(this.item);
            item.getChildByName("Label").getComponent(Label).string = item_list[key].ItemName;
            item.off(Input.EventType.TOUCH_END, this.additem, this);
            item.on(Input.EventType.TOUCH_END, this.additem, this)
            item["item_data"] = item_list[key];
            this.content.addChild(item);
        }
    }

    private additem(e: EventTouch) {
        let a = e.currentTarget
        console.log(a["item_data"])
        this.label1.string = a["item_data"].Items + "";
        this.type = a["item_data"].Type;
        if (a["item_data"].Items == 1) {
            this.label1.string = 0 + ""
        } else if (this.type == 77) {
            this.label1.string = 77 + ""
        }
    }

    protected onHide(...args: any[]): void {

    }


    private onButton(e: EventTouch) {
        this.getAddInfo()
        if (this.count < 0) {
            switch (this.type) {
                case 1:
                    //减少道具
                    if (!this.id_or_type) return;
                    Http.Send({ serverUrl: this.url + ":" + this.post, uri: "/api/player", },
                        { player_id: PlayerData.roleInfo.player_id, type: "ConsumeItem", data: { "item_id": this.id_or_type, "count": Math.abs(this.count) } }
                    );
                    break;
                case 2:
                case 3:
                case 7:
                case 77:
                    //减少货币
                    Http.Send({ serverUrl: this.url + ":" + this.post, uri: "/api/player", },
                        { player_id: PlayerData.roleInfo.player_id, type: "ConsumeCurrency", data: { "type": this.id_or_type, "value": Math.abs(this.count) } }
                    );
                    break;
                case 6:
                    //减少资源
                    let delete_wood_count = 0;
                    let delete_water_count = 0;
                    let delete_rock_count = 0;
                    let delete_seed_count = 0;
                    switch (this.id_or_type) {
                        case 9:
                            delete_seed_count = Math.abs(this.count)
                            break;
                        case 8:
                            delete_water_count = Math.abs(this.count)
                            break;
                        case 7:
                            delete_rock_count = Math.abs(this.count)
                            break;
                        case 6:
                            delete_wood_count = Math.abs(this.count)
                            break;
                        default:
                            break;
                    }
                    Http.Send({ serverUrl: this.url + ":" + this.post, uri: "/api/player", },
                        { player_id: PlayerData.roleInfo.player_id, type: "ConsumeResource", data: { "wood": delete_wood_count, "water": delete_water_count, "rock": delete_rock_count, "seed": delete_seed_count } }
                    );
                    break;
                default:
                    break;
            }
        } else {
            switch (this.type) {
                case 1:
                    //增加道具
                    if (!this.id_or_type) return;
                    Http.Send({ serverUrl: this.url + ":" + this.post, uri: "/api/player", },
                        { player_id: PlayerData.roleInfo.player_id, type: "AddItem", data: { "item_id": this.id_or_type, "count": Math.abs(this.count) } }
                    );
                    break;
                case 2:
                case 3:
                case 7:
                case 77:
                    //增加货币
                    Http.Send({ serverUrl: this.url + ":" + this.post, uri: "/api/player", },
                        { player_id: PlayerData.roleInfo.player_id, type: "AddCurrency", data: { "type": this.id_or_type, "value": Math.abs(this.count) } }
                    );
                    break;
                case 6:
                    //增加资源
                    let delete_wood_count = 0;
                    let delete_water_count = 0;
                    let delete_rock_count = 0;
                    let delete_seed_count = 0;
                    switch (this.id_or_type) {
                        case 9:
                            delete_seed_count = Math.abs(this.count)
                            break;
                        case 8:
                            delete_water_count = Math.abs(this.count)
                            break;
                        case 7:
                            delete_rock_count = Math.abs(this.count)
                            break;
                        case 6:
                            delete_wood_count = Math.abs(this.count)
                            break;
                        default:
                            break;
                    }
                    Http.Send({ serverUrl: this.url + ":" + this.post, uri: "/api/player", },
                        { player_id: PlayerData.roleInfo.player_id, type: "AddResource", data: { "wood": delete_wood_count, "water": delete_water_count, "rock": delete_rock_count, "seed": delete_seed_count } }
                    );
                    break;
                default:
                    break;
            }
        }
    }

    private getAddInfo() {
        let id_or_type = Number(this.label1.string);
        let count = Number(this.label2.string);
        this.id_or_type = isNaN(id_or_type) ? null : id_or_type;
        this.count = isNaN(count) ? 0 : count;
        if (!this.type && this.id_or_type >= 0) {
            if (this.id_or_type == 0) {
                this.type = 2;
                return;
            }
            let item_list: StdItem[] = CfgMgr.Get("Item");
            for (const key in item_list) {
                if (this.id_or_type == item_list[key].Items) {
                    this.type = item_list[key].Type;
                    return;
                }
            }
        }
    }

}
