import { Button, Component, EventTouch, Input, Label, Node, Slider, Sprite, SpriteFrame, Toggle, UITransform, find, instantiate, path, sp, sys, tween, view } from "cc";
import { Panel } from "../../GameRoot";
import PlayerData, {} from "../roleModule/PlayerData"
 import {SPlayerData,SPlayerDataItem,SPlayerDataRole,SOrderType,SThing} from "../roleModule/PlayerStruct";
import { Attr, AttrFight, Bourse, CardQuality, CfgMgr, StdCommonType, StdCrossBours, StdItem, StdMerge, StdRole, StdRoleQuality, ThingItemId, ThingType } from "../../manager/CfgMgr";
import { ResMgr, folder_head_card, folder_icon, folder_item } from "../../manager/ResMgr";
import LocalStorage from "../../utils/LocalStorage";
import { ItemTips } from "../common/ItemTips";
import { BagItem } from "../bag/BagItem";
import { MsgTypeSend } from "../../MsgType";
import { Session } from "../../net/Session";
import { ToFixed } from "../../utils/Utils";
import { CheckRisk, isFengkong } from "../../Platform";
import { RiskPanel } from "../login/RiskPanel";
import { IOS } from "cc/env";

export class OrderAgainConfirmPanel extends Panel {
    protected prefab: string = "prefabs/panel/Trade/OrderAgainConfirmPanel";

    private item_name: Label;
    private tittle: Label;
    private item_price: Label;
    private item_count: Label;
    private str_name: Label;
    private all_price: Label;
    private toggle: Toggle;
    private Btn: Button;
    private item: Node;
    private iconNode:Node[] = [] 

    private cfg:StdItem;
    private callback: Function;
    private page:number;
    private num_count:number;
    private cost_count:number;
    private type:SOrderType;
    private single:number;
    private num:Label;
    // private roleTipsLbl:Label
    // private jumpNode:Node
    private booth_price:Label
    private min_booth_num = 0;
    
    private selectData:SThing;
    private isworldTrade:boolean = false; //ture代表世界交易所
    private tradeData: Bourse | StdCrossBours;
    protected onLoad() {
        this.CloseBy("mask");
        this.CloseBy("spriteFrame/Close");
        this.Btn = this.find("spriteFrame/Btn", Button);
        this.item_name = this.find("spriteFrame/item_name", Label);
        this.tittle = this.find("spriteFrame/numBg/tittle", Label);
        this.item_price = this.find("spriteFrame/MidBg/PriceLayout/item_price", Label);
        this.item_count = this.find("spriteFrame/MidBg/item_count", Label);
        this.str_name = this.find("spriteFrame/MidBg/str_name", Label);
        this.all_price = this.find("spriteFrame/MidBg/allPrice/all_price", Label);
        this.toggle = this.find("spriteFrame/jumpNode/toggle", Toggle);
        this.item = this.find("spriteFrame/MidBg/BagItem");
        this.num = this.find("spriteFrame/MidBg/num",Label);
        // this.roleTipsLbl = this.find("spriteFrame/roleTipsLbl",Label);
        // this.jumpNode = this.find("spriteFrame/jumpNode");
        this.Btn.node.on("click", this.onBtn, this);
        this.booth_price = this.find("spriteFrame/MidBg/boothPrice/booth_price",Label);
        let icon_1 = this.find("spriteFrame/MidBg/PriceLayout/money_icon");
        let icon_2 = this.find("spriteFrame/MidBg/allPrice/money_icon");
        let icon_3 = this.find("spriteFrame/MidBg/boothPrice/money_icon");
        this.iconNode.push(icon_1);
        this.iconNode.push(icon_2);
        this.iconNode.push(icon_3);
    }

    protected onShow(): void {
    }

    async flush(type: number, data: { type: number, selectData: SThing, price: number, num: number }, page, tradeData: Bourse | StdCrossBours, is_world_trade:boolean) {
        if (!data) return;
        this.isworldTrade = is_world_trade;
        this.tradeData = tradeData;

        let keepPre = 2;
        if(is_world_trade){
            //**不同服对应不同的货币 */  
            let cross_bours = tradeData as StdCrossBours;
            if(cross_bours.PayItemID == ThingItemId.ItemId_202){
                keepPre = CfgMgr.GetCommon(StdCommonType.Gem).KeepPre;
            }
            let item_cfg = CfgMgr.Getitem(cross_bours.PayItemID);
            let spr = item_cfg.Icon == "caizuan" ? "caizuan_hc" : item_cfg.Icon;
            for (let index = 0; index < this.iconNode.length; index++) {
                const element = this.iconNode[index];
                element.getComponent(Sprite).spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_item, spr, "spriteFrame"), SpriteFrame); 
            }
        }else{
            for (let index = 0; index < this.iconNode.length; index++) {
                const element = this.iconNode[index];
                element.getComponent(Sprite).spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_item, "caizuan", "spriteFrame"), SpriteFrame);  
            }
        }
        this.type = type;
        this.cost_count = data.price;
        this.num_count = data.num;
        this.toggle.isChecked = false;
        this.page = page;
        this.single = tradeData.Single;
        this.num.string = data.num * this.single + "";
        // this.callback = callBack;
        // this.roleTipsLbl.node.active = false;
        // this.jumpNode.active = true;
        let name = "";
        if (data.selectData) {
            this.selectData = data.selectData;
            let bagItem = this.item.getComponent(BagItem);
            if (!bagItem) bagItem = this.item.addComponent(BagItem);
            bagItem.setIsShowNum(false);
            bagItem.setIsShowSelect(false);
            bagItem.setIsShowTips(true);
            
           
            if (data.selectData.item) {
                let cfg = null;
                cfg = CfgMgr.Getitem(data.selectData.item.id);
                bagItem.SetData(data.selectData);
                this.cfg = cfg;
            } else if (data.selectData.role) {
                // this.roleTipsLbl.node.active = true;
                // this.jumpNode.active = false;
                this.cfg = null;
                bagItem.SetData(data.selectData);
            } else if (data.selectData.resource) {
                let id: number;
                if (data.selectData.resource.rock >= 0) {
                    id = 7;
                    name = "石灵";
                } else if (data.selectData.resource.seed >= 0) {
                    id = 9;
                    name = "源种";
                } else if (data.selectData.resource.water >= 0) {
                    id = 8;
                    name = "水宝";
                } else if (data.selectData.resource.wood >= 0) {
                    id = 6;
                    name = "古木";
                };
                let item_cfg = CfgMgr.Getitem(id);
                this.cfg = item_cfg;
            }
            bagItem.SetData(data.selectData);
        }
        this.item_name.string = name;
        this.tittle.string = (type == SOrderType.SELL ? "是否确定上架以下道具" : "是否确定上架道具订单");
        this.item_price.string = ToFixed(data.price, keepPre);
        this.item_count.string = data.num + "";
        this.str_name.string = (type == SOrderType.SELL ? "提供价:" : "预消耗:");
        this.all_price.string = ToFixed((data.price * data.num), keepPre);
        let boot_cost = (type == SOrderType.SELL) ? CfgMgr.GetCommon(StdCommonType.Bourse).stall : CfgMgr.GetCommon(StdCommonType.Bourse).book;
        let _booth_price = data.price * data.num * boot_cost;
        this.booth_price.string = _booth_price > 0.01 ? ToFixed((_booth_price), keepPre) : this.min_booth_num + "";
    }

    private onBtn() {
        this.callBack();
        let time = Date.now();
        let id = PlayerData.roleInfo.player_id;
        if (this.toggle.isChecked) {
            LocalStorage.SetNumber("OrderAgainConfirmPanel" + id, time)
        } else {
            LocalStorage.RemoveItem("OrderAgainConfirmPanel" + id)
        }
        this.Hide()
    }

    private callBack() {
        if(this.isworldTrade){
            if (isFengkong()) {
                RiskPanel.Show();
                let thisObj = this;
                CheckRisk((data: { authorization: string, rc_token: string }) => {
                    RiskPanel.Hide();
                    let is_ios = IOS ? 1 : 2;
                    let cross_bours = this.tradeData as StdCrossBours;
                    let orderData = {
                        type: MsgTypeSend.CrossExchangesCreateSellOrder,
                        data: {
                            bourse_id:this.tradeData.Id,
                            group_value: this.cost_count,
                            group_count: this.num_count,
                            authorization: data.authorization,
                            rc_token: data.rc_token,
                            client_os: is_ios,
                            // sell_items: { type:cross_bours.PaymentType, id:cross_bours.PaymentID, count:this.num_count },
                        }
                    }
                    Session.Send(orderData);
                });
            }else{
                let is_ios = IOS ? 1 : 2;
                let orderData = {
                    type: MsgTypeSend.CrossExchangesCreateSellOrder,
                    data: {
                        bourse_id: this.tradeData.Id,
                        group_value: this.cost_count,
                        group_count: this.num_count,
                        authorization: "",
                        rc_token: "",
                        client_os: is_ios,
                        // sell_items: { type:cross_bours.PaymentType, id:cross_bours.PaymentID, count:this.num_count },
                    }
                }
                Session.Send(orderData);
            }
        }else{
            let getThing = () => {
                let type = [1, 5, 6, 4]
                let num = type[this.page]
                let value
                switch (num) {
                    case ThingType.ThingTypeItem:
                        value = {
                            type: num,
                            item: { id: this.selectData.item.id, count: this.num_count * this.single }
                        }
                        break;
                    case ThingType.ThingTypeRole:
                        value = {
                            type: num,
                            role: {
                                id: this.selectData.role.id,
                                type: this.selectData.role.type,
                                level: this.selectData.role.level,
                                quality: this.selectData.role.quality,
                                experience: this.selectData.role.experience,
                                soldier_num: this.selectData.role.soldier_num,
                                active_skills: this.selectData.role.active_skills ? this.selectData.role.active_skills : [],
                                passive_skills: this.selectData.role.passive_skills ? this.selectData.role.passive_skills : [],
                                is_in_building: this.selectData.role.is_in_building,
                                building_id: this.selectData.role.building_id ? this.selectData.role.building_id : 0,
                                battle_power: this.selectData.role.battle_power ? this.selectData.role.battle_power : 0,
                                skills: this.selectData.role.skills ? this.selectData.role.skills : [],
                                is_assisting: this.selectData.role.is_assisting,
                            }
                        }
                        break;
                    case ThingType.ThingTypeResource:
                        if (this.selectData.resource.rock >= 0) {
                            value = {
                                type: num,
                                resource: { wood: 0, water: 0, rock: this.num_count * this.single , seed: 0 }
                            }
                        } else if (this.selectData.resource.seed >= 0) {
                            value = {
                                type: num,
                                resource: { wood: 0, water: 0, rock: 0, seed: this.num_count * this.single  }
                            }
                        } else if (this.selectData.resource.water >= 0) {
                            value = {
                                type: num,
                                resource: { wood: 0, water: this.num_count * this.single , rock: 0, seed: 0 }
                            }
                        } else if (this.selectData.resource.wood >= 0) {
                            value = {
                                type: num,
                                resource: { wood: this.num_count * this.single , water: 0, rock: 0, seed: 0 }
                            }
                        }
                        break;
                }
                return value
            }
            if (this.type == SOrderType.SELL) {
                if (isFengkong()) {
                    RiskPanel.Show();
                    CheckRisk((data: { authorization: string, rc_token: string }) => {
                        RiskPanel.Hide();
                        let orderData = {
                            type: MsgTypeSend.ExchangesCreateSellOrder,
                            data: {
                                unit_value: this.cost_count,
                                unit_count: this.num_count,
                                sell_things: { data: [getThing()] },
                                authorization: data.authorization,
                                rc_token: data.rc_token,
                                client_os: IOS ? 1 : 2,
                            }

                        }
                        Session.Send(orderData)
                    })
                } else {
                    let orderData = {
                        type: MsgTypeSend.ExchangesCreateSellOrder,
                        data: {
                            unit_value: this.cost_count,
                            unit_count: this.num_count,
                            sell_things: { data: [getThing()] },
                            authorization: "",
                            rc_token: "",
                            client_os: IOS ? 1 : 2,
                        }
                    }
                    Session.Send(orderData);
                }
            } else {
                if (isFengkong()) {
                    RiskPanel.Show();
                    CheckRisk((data: { authorization: string, rc_token: string }) => {
                        RiskPanel.Hide();
                        let orderData = {
                            type: MsgTypeSend.ExchangesCreateBuyOrder,
                            data: {
                                unit_value: this.cost_count,
                                unit_count: this.num_count,
                                request_things: { data: [getThing()] },
                                authorization: data.authorization,
                                rc_token: data.rc_token,
                                client_os: IOS ? 1 : 2,
                            }

                        }
                        Session.Send(orderData)
                    })
                } else {
                    let orderData = {
                        type: MsgTypeSend.ExchangesCreateBuyOrder,
                        data: {
                            unit_value: this.cost_count,
                            unit_count: this.num_count,
                            request_things: { data: [getThing()] },
                            authorization: "",
                            rc_token: "",
                            client_os: IOS ? 1 : 2,
                        }

                    }
                    Session.Send(orderData);
                }
            }
        }
    }

    private onShowTips(){
        if(this.cfg){
            ItemTips.Show(this.cfg);
        }
    }


    protected onHide(...args: any[]): void {
    }

}