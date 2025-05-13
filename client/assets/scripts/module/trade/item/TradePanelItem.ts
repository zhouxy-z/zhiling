import { _decorator, Component, find, Input, Label, Node, path, Sprite, SpriteFrame, System, Tween, tween, TweenSystem } from 'cc';
import PlayerData from '../../roleModule/PlayerData'
 import {SCrossOrderData,SOrderData,SOrderType,SPlayerDataItem,SPlayerDataSkill,SThing} from '../../roleModule/PlayerStruct';
import Logger from '../../../utils/Logger';
import { CardQuality, CfgMgr, StdCommonType, StdItem, StdPassiveLevel, ThingItemId } from '../../../manager/CfgMgr';
import { ResMgr, folder_common, folder_head_card, folder_icon, folder_item, folder_quality, folder_skill } from '../../../manager/ResMgr';
import { AutoScroller } from '../../../utils/AutoScroller';
import { copyToClip, Second, ToFixed } from '../../../utils/Utils';
import { BagItem } from '../../bag/BagItem';
import { MsgTypeSend } from '../../../MsgType';
import { Session } from '../../../net/Session';
import { CopyToClip } from '../../../Platform';
import { MsgPanel } from '../../common/MsgPanel';
import { Goto } from '../../../manager/EventMgr';
const { ccclass, property } = _decorator;

@ccclass('TradePanelItem')
export class TradePanelItem extends Component {
    start() {

    }

    update(deltaTime: number) {

    }

    //is_world_trade true 代表世界交易所
    public async SetData(_data: SOrderData | SCrossOrderData, selectType: number, selectGroup: number, is_world_trade:boolean) {
        let item = this.node;
        let data = undefined;
        let resetItem = (bagItem) => {
            bagItem.children.forEach((node) => {
                node.active = false;
                if (node.name == `bg` || node.name == `maskbg` || node.name == `icon`) {
                    node.active = true;
                }
            })
        }
        let bagItem = item.getChildByName(`BagItem`);
        if (!bagItem) {
            item.children.forEach((Node) => {
                if (Node.getComponent(BagItem)) bagItem = Node
            })
        }
        resetItem(bagItem)
        let msgNode = item.getChildByName(`msgItem`);
        item.getChildByName(`msgItem`).active = false;
        item.getChildByName(`msgRole`).active = false;

        let priceicon = find(`PriceLayout/caizuan`, msgNode).getComponent(Sprite);
        let price = find(`PriceLayout/Price`, msgNode).getComponent(Label);
        let btnBuy = item.getChildByName(`BtnBuy`);
        let btnSell = item.getChildByName(`BtnSell`);
        let serverFrom = find("serverFrom", msgNode);
        btnBuy.off(Input.EventType.TOUCH_END);
        btnSell.off(Input.EventType.TOUCH_END);
        if(!is_world_trade){
            data = _data as SOrderData;
            if(!data) return;
            serverFrom.active = false;
            btnBuy.getComponent(Sprite).grayscale = data.player_id == PlayerData.roleInfo.player_id || data.unit_count == 0;
            btnSell.getComponent(Sprite).grayscale = data.player_id == PlayerData.roleInfo.player_id || data.unit_count == 0;
            if (data.order_type == `sell`) {
                btnBuy.active = true;
                btnSell.active = false;
                btnBuy.on(Input.EventType.TOUCH_END, () => {
                    //打开购买页面
                    if (data.player_id != PlayerData.roleInfo.player_id && data.unit_count != 0) {
                        if (data.things.data[0].role) {
                            Goto("RoleMsgPanel",SOrderType.BUY, data);
                        } else {
                            console.log(data)
                            Goto("BuyPanel",SOrderType.BUY, data, false);
                        }
                    }
                })
            } else {
                btnBuy.active = false;
                btnSell.active = true;
                btnSell.on(Input.EventType.TOUCH_END, () => {
                    //打开出售页面
                    if (data.player_id != PlayerData.roleInfo.player_id && data.unit_count != 0) {
                        if (data.things.data[0].role) {
                            Goto("RoleMsgPanel",SOrderType.SELL, data);
                        } else {
                            Goto("BuyPanel",SOrderType.SELL, data, false);
                        }
                    }
                })
            }
            let itemData = data.things.data[0].item;
            let roleData = data.things.data[0].role;
            let resource = data.things.data[0].resource;
    
            let item_data = bagItem.getComponent(BagItem);
            item_data = item_data ? item_data : bagItem.addComponent(BagItem);
            item_data.SetData(data.things.data[0]);
            item_data.setIsShowSelect(false);
            item_data.setIsShowTips(true);
    
            if (selectType == 1 && selectGroup == 0) {//购买角色
                if (roleData) {
                    msgNode = item.getChildByName(`msgRole`);
                    let help = find(`help`, msgNode);
                    let skillNum = find(`skillNum`, msgNode).getComponent(Label);
                    let skillLayout = find(`skillLayout`, msgNode).getComponent(AutoScroller);
                    priceicon = find(`PriceLayout/caizuan`, msgNode).getComponent(Sprite);
                    price = find(`PriceLayout/Price`, msgNode).getComponent(Label);
                    skillNum.string = `${roleData.passive_skills.length}/10`
                    help.active = false;
                    help.on(Input.EventType.TOUCH_END, () => { });
                    skillLayout.SetHandle(this.onUpdateSkill.bind(this));
                    skillLayout.UpdateDatas(roleData.passive_skills);
                }
            } else {//道具或者求购角色
                let name = find(`Name`, msgNode).getComponent(Label);
                let count = find(`Count`, msgNode).getComponent(Label);
                if (itemData || resource) {
                    if (resource) {
                        let itemId = 6;
                        if (resource.rock > 0) {
                            itemId = 7;
                        } else if (resource.seed > 0) {
                            itemId = 9;
                        } else if (resource.water > 0) {
                            itemId = 8;
                        }
                        itemData = {
                            id: itemId,
                            count: data.unit_count,
                        }
                    }
                    let itemCfg = CfgMgr.Getitem(itemData.id);
                    name.string = itemCfg.ItemName;
                } else if (roleData) {
                    let stdRole = CfgMgr.GetRole()[roleData.type];
                    name.string = stdRole.Name;
                }
                count.string = `${data.unit_count}`;
            }  
            price.string = `${ToFixed(data.unit_value, 2)}`;
            let spr_icon = await ResMgr.LoadResAbSub(path.join(folder_item, "caizuan", "spriteFrame"), SpriteFrame);
            priceicon.spriteFrame = spr_icon;
        }else{
            data = _data as SCrossOrderData;
            if(!data) return;
            serverFrom.active = true;
            let serverFromName = find("serverFrom/serverName", msgNode).getComponent(Label);
            let server_name = "彩虹村";
            if(data.from_server == "hc"){
                server_name = "幻彩城"
            }
            serverFromName.string = server_name;
            let is_lock = PlayerData.getOrderIsLockByViewId(data.view_id);
            if(data.union_id == PlayerData.tradeAllBalances.unionid){
                console.log("订单置灰，同一个玩家")
            }
            if(is_lock){
                console.log("订单置灰，锁单")
            }
            btnBuy.getComponent(Sprite).grayscale = data.is_lock || data.union_id == PlayerData.tradeAllBalances.unionid || data.group_count == 0 || is_lock;
            btnBuy.active = true;
            btnSell.active = false;
            btnBuy.on(Input.EventType.TOUCH_END, () => {
                //打开购买页面
                if (data.union_id != PlayerData.tradeAllBalances.unionid && data.group_count != 0 && !is_lock) {
                    console.log(data)
                    Goto("BuyPanel",SOrderType.BUY, data, true);
                }
            })
            
            let cross_bours_cfg = CfgMgr.GetCrossBoursCurrencyByServer(data.bourse_id)      
            let keepPre = 2;
            if(cross_bours_cfg.PayItemID == ThingItemId.ItemId_202){
                keepPre = CfgMgr.GetCommon(StdCommonType.Gem).KeepPre;
            } 
            let itemData:SPlayerDataItem = {id:cross_bours_cfg.SellItemID, count: data.items.count}      
            let item_data = bagItem.getComponent(BagItem);
            item_data = item_data ? item_data : bagItem.addComponent(BagItem);
            item_data.SetData(itemData);
            item_data.setIsShowSelect(false);
            if(itemData.id != 1 && itemData.id != 201){
                item_data.setIsShowTips(true);
            }else{
                item_data.setIsShowTips(false);
            }
            let name = find(`Name`, msgNode).getComponent(Label);
            let count = find(`Count`, msgNode).getComponent(Label);
            if (data.items ) {
                await Second(0);
                let itemCfg = CfgMgr.Getitem(itemData.id);
                let name_str = itemCfg.Items == 1 ? "彩虹体" : itemCfg.Items == 201 ? "幻彩石" : itemCfg.ItemName;
                console.log(name_str)
                name.string = name_str;
                let bag_item_icon = itemCfg.Icon == "caizuan" ? "caizuan_hc" : itemCfg.Icon;
                bagItem.getChildByName("icon").getComponent(Sprite).spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_item, bag_item_icon, "spriteFrame"), SpriteFrame);
            }
            count.string = `${data.group_count}`;
            price.string = `${ToFixed(data.group_value, keepPre)}`;
            
            let pay_item_cfg = CfgMgr.Getitem(cross_bours_cfg.PayItemID);
            let spr = pay_item_cfg.Icon == "caizuan" ? "caizuan_hc" : pay_item_cfg.Icon;
            let spr_icon = await ResMgr.LoadResAbSub(path.join(folder_item, spr, "spriteFrame"), SpriteFrame);
            priceicon.spriteFrame = spr_icon;
        }
        msgNode.active = true;
        let icon = find(`icon`, msgNode).getComponent(Sprite);
        icon.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_common, data.order_type, "spriteFrame"), SpriteFrame);
        let playerName = find(`playerName`, msgNode).getComponent(Label);
        playerName.string = data.player_name;
        let time = find(`time`, msgNode).getComponent(Label);
        time.string = `剩余时间：${PlayerData.countDown(data.close_time)}`;
        if (TweenSystem.instance.ActionManager.getNumberOfRunningActionsInTarget(item) > 0) {
            Tween.stopAllByTarget(item);
        }
        tween(item).repeatForever(tween().delay(1).call(() => {
            time.string = `剩余时间：${PlayerData.countDown(data.close_time)}`;
        })).start();
    }

    public SetOrderData(_data: SOrderData | SCrossOrderData, selectType: number, is_world_trade:boolean) {
        let item = this.node;
        let empty = item.getChildByName(`empty`);
        let bagItem = item.getChildByName(`BagItem`);
        if (!bagItem) {
            item.children.forEach((Node) => {
                if (Node.getComponent(BagItem)) bagItem = Node
            })
        }
        let msgNode = item.getChildByName(`msgItem`);
      
        if (_data) {
            empty.active = false;
            bagItem.active = true;
            msgNode.active = true;
            bagItem.children.forEach((node) => {
                node.active = false;
                if (node.name == `bg` || node.name == `maskbg` || node.name == `icon`) {
                    node.active = true;
                }
            })
            let count = find(`countLayout/count`, msgNode).getComponent(Label);
            let time = find(`time`, msgNode).getComponent(Label);
            let price = find(`priceLayout/Price`, msgNode).getComponent(Label);
            let code = find(`code`, msgNode).getComponent(Label);
            let copyCodeBtn = find(`copyCodeBtn`, msgNode);
            let less = find(`lessLayout/less`, msgNode).getComponent(Label);
            let cost = find(`costLayout/cost`, msgNode).getComponent(Label);
            let costTitle = find(`costTitle`, msgNode);
            let removeBtn = find(`removeBtn`, msgNode);
            removeBtn.off(Input.EventType.TOUCH_END);
            if(!is_world_trade){
                let data = _data as SOrderData
                if(!data) return;
                let itemData = data.things.data[0].item;
                let roleData = data.things.data[0].role;
                let resource = data.things.data[0].resource;
                let name = find(`name`, msgNode).getComponent(Label);
                let item_data = bagItem.getComponent(BagItem);
                item_data = item_data ? item_data : bagItem.addComponent(BagItem);
                item_data.SetData(data.things.data[0]);
                item_data.setIsShowSelect(false);
                item_data.setIsShowTips(true);
                if (itemData || resource) {
                    if (resource) {
                        let itemId = 6;
                        if (resource.rock > 0) {
                            itemId = 7;
                        } else if (resource.seed > 0) {
                            itemId = 9;
                        } else if (resource.water > 0) {
                            itemId = 8;
                        }
                        itemData = {
                            id: itemId,
                            count: data.unit_count,
                        }
                    }
                    let itemCfg = CfgMgr.Getitem(itemData.id);
                    name.string = itemCfg.ItemName;
                } else if (roleData) {
                    let stdRole = CfgMgr.GetRole()[roleData.type];
                    name.string = stdRole.Name;
                }
                count.string = `${data.unit_count}`;
                this.setPayItemIcon("caizuan",msgNode)           
                price.string = `${ToFixed(data.unit_value,2)}`;
                removeBtn.on(Input.EventType.TOUCH_END, () => {
                    let sessionData = {
                        type: MsgTypeSend.ExchangesCancelOrder,
                        data: {
                            order_id: data.order_id
                        }
                    }
                    Session.Send(sessionData);
                })  
            }else{
                let data = _data as SCrossOrderData 
                if(!data) return;   
                let keepPre = 2;
               
                
                let cross_bours_cfg = CfgMgr.GetCrossBoursCurrencyByServer(data.bourse_id)
                if(cross_bours_cfg.PayItemID == ThingItemId.ItemId_202){
                    keepPre = CfgMgr.GetCommon(StdCommonType.Gem).KeepPre;
                }
                let itemData:SPlayerDataItem = {id:cross_bours_cfg.SellItemID, count: data.items.count}         
                let name = find(`name`, msgNode).getComponent(Label);
                let item_data = bagItem.getComponent(BagItem);
                item_data = item_data ? item_data : bagItem.addComponent(BagItem);
                item_data.SetData(itemData);
                item_data.setIsShowSelect(false);
                item_data.setIsShowTips(true);
              
                let itemCfg = CfgMgr.Getitem(itemData.id);
                let name_str = itemCfg.Items == 1 ? "彩虹体" : itemCfg.Items == 201 ? "幻彩石" : itemCfg.ItemName;
                console.log(name_str)
                name.string = name_str;
                count.string = `${data.group_count}`;

                let pay_item_cfg = CfgMgr.Getitem(cross_bours_cfg.PayItemID) 
                let spr = pay_item_cfg.Icon == "caizuan" ? "caizuan_hc" : pay_item_cfg.Icon;
                this.setPayItemIcon(spr,msgNode)
                price.string = `${ToFixed(data.group_value,keepPre)}`; 
                removeBtn.on(Input.EventType.TOUCH_END, () => {
                    let sessionData = {
                        type: MsgTypeSend.CrossExchangesCancelOrder,
                        data: {
                            order_id: data.order_id
                        }
                    }
                    Session.Send(sessionData);
                })
            }
            if (_data.order_type == `sell`) {
                if(!is_world_trade){
                    let data = _data as SOrderData
                    cost.string = `${Math.ceil(data.unit_count * data.unit_value * CfgMgr.GetCommon(StdCommonType.Bourse).Fees * 100) / 100}`
                }else{
                    let data = _data as SCrossOrderData;
                    let cross_bours_cfg = CfgMgr.GetCrossBoursCurrencyByServer(data.bourse_id)
                    let keepPre = 2;
                    if(cross_bours_cfg.PayItemID == ThingItemId.ItemId_202){
                        keepPre = CfgMgr.GetCommon(StdCommonType.Gem).KeepPre;
                    } 
                    cost.string = `${Math.ceil(data.group_count * data.group_value * cross_bours_cfg.Fees * Math.pow(10,keepPre)) / Math.pow(10,keepPre)}`
                }
                less.node.parent.active = false;
                code.node.active = true;
                copyCodeBtn.active = true;
                code.string = `${_data.view_id}`
                msgNode.getChildByName(`codeTtitle`).active = true;
                msgNode.getChildByName(`lessTtitle`).active = false;
                cost.node.parent.active = true
                costTitle.active = true
                copyCodeBtn.on(Input.EventType.TOUCH_END, () => {
                    Goto("TradePanel.ins.SetCopyCode",_data.view_id);
                    CopyToClip(_data.view_id, (desc: string) => {
                        if (desc == _data.view_id) {
                            MsgPanel.Show("已复制到粘贴板");
                        }
                    });
                })
            } else {
                if(!is_world_trade){
                    let data = _data as SOrderData
                    less.node.parent.active = true;
                    code.node.active = false;
                    copyCodeBtn.active = false;
                    less.node.active = true;
                    less.string = `${ToFixed(data.unit_value * data.unit_count,2)}`;
                    msgNode.getChildByName(`lessTtitle`).active = true;
                    msgNode.getChildByName(`codeTtitle`).active = false;
                    cost.node.parent.active = false
                    costTitle.active = false
                }
            }

            time.string = `订单倒计时${PlayerData.countDown(_data.close_time)}`;
            if (TweenSystem.instance.ActionManager.getNumberOfRunningActionsInTarget(item) > 0) {
                Tween.stopAllByTarget(item);
            }
            tween(item).repeatForever(tween().delay(1).call(() => {
                time.string = `订单倒计时${PlayerData.countDown(_data.close_time)}`;
            })).start();
        } else {
            empty.active = true;
            bagItem.active = false;
            msgNode.active = false;
            empty.off(Input.EventType.TOUCH_END);
            empty.on(Input.EventType.TOUCH_END, (() => {
                Logger.log("打开订单页面>>>", selectType);
                Goto("TradeCreateOrderPanel",selectType, is_world_trade)
            }))
        }
    }

    private async setPayItemIcon(item_icon:string, msgNode:Node){  
        let spr_icon:SpriteFrame = await ResMgr.LoadResAbSub(path.join(folder_item, item_icon, "spriteFrame"), SpriteFrame);
        let icon1 = find(`priceLayout/caizuan`, msgNode).getComponent(Sprite);
        let icon2 = find(`costLayout/caizuan`, msgNode).getComponent(Sprite);
        let icon3 = find(`lessLayout/caizuan`, msgNode).getComponent(Sprite);
        if (icon1) icon1.spriteFrame = spr_icon;
        if (icon2) icon2.spriteFrame = spr_icon;
        if (icon3) icon3.spriteFrame = spr_icon;
    }

    private async onUpdateSkill(item: Node, data: SPlayerDataSkill) {
        if (data) {
            item.off(Node.EventType.TOUCH_END);
            item.on(Node.EventType.TOUCH_END, () => {
                Goto("PassiveSkillTipsPanel",data);
            }, this);
            let stdSkill: StdPassiveLevel = CfgMgr.GetPassiveSkill(data.skill_id, data.level);
            if (stdSkill) {
                let bg = item.getChildByName(`frame`).getComponent(Sprite)
                bg.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_quality, "p_skill_bg_" + stdSkill.RareLevel, "spriteFrame"), SpriteFrame);


                let iconUrl: string = path.join(folder_skill, stdSkill.Icon.toString(), "spriteFrame");
                ResMgr.LoadResAbSub(iconUrl, SpriteFrame, res => {
                    item.getChildByPath(`Mask/icon`).getComponent(Sprite).spriteFrame = res;
                });
            }
        }
    }
}


