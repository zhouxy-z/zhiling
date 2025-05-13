import { Component, Label, sp, Sprite, Node, Button, path, SpriteFrame, UIOpacity, Tween, Vec3, tween, game } from "cc";
import { AutoScroller } from "../../utils/AutoScroller";
import { CfgMgr, StdEquityId, StdShop, StdShopCommodity, StdShopGroup, StdShopIndex } from "../../manager/CfgMgr";
import PlayerData, {} from "../roleModule/PlayerData"
 import {SAdvister,SShopContent,SShopItem} from "../roleModule/PlayerStruct";
import { DateUtils } from "../../utils/DateUtils";
import { MsgTypeSend } from "../../MsgType";
import { Session } from "../../net/Session";
import { EventMgr, Evt_ShopUpdate } from "../../manager/EventMgr";
import { ResMgr } from "../../manager/ResMgr";
import { GameSet } from "../GameSet";
import { NodeTrickleOutEffect } from "../common/BaseUI";
import { ShopRefreshPanel } from "../shop/ShopRefreshPanel";
import { MsgPanel } from "../common/MsgPanel";
import { AdHelper } from "../../AdHelper";
import { getAdcfg, getQbAdCfg } from "../../Platform";
import { Tips } from "../login/Tips";
import { ShopBuyPanel } from "../shop/ShopBuyPanel";
import { GemShopItem } from "./GemShopItem";

export class GemShopPage extends Component {
    protected shopList: AutoScroller;
    protected timeCont: Node;
    protected timeLab: Label;
    protected refreshBtn: Button;
    protected refreshBtnLab: Label;
    protected stdShopIndex: StdShopIndex;
    protected shopData: SShopContent;
    protected noneListCont: Node;
    protected shopDatas: SShopItem[];
    private isPlayListEffect: boolean = true;
    protected data:StdShopGroup;
    protected shopId:number;
    private isInit:boolean = false;
    protected onLoad(): void {
        this.noneListCont = this.node.getChildByName("noneListCont");
        this.shopList = this.node.getChildByName("shopList").getComponent(AutoScroller);
        this.shopList.SetHandle(this.updateShopItem.bind(this));
        this.shopList.node.on('select', this.onShopSelect, this);
        this.timeCont = this.node.getChildByPath("timeCont");
        this.timeLab = this.node.getChildByPath("timeCont/timeLab").getComponent(Label);
        this.refreshBtn = this.node.getChildByPath("timeCont/refreshBtn").getComponent(Button);
        this.refreshBtnLab = this.node.getChildByPath("timeCont/refreshBtn/refreshBtnLab").getComponent(Label);
        this.refreshBtn.node.on(Button.EventType.CLICK, this.onRefreshClcik, this);
        EventMgr.on(Evt_ShopUpdate, this.onShopUpdate, this);
        this.isInit = true;
        this.updateShow();
    }
    private tempTime: number = 0;
    protected update(dt: number): void {
        if (this.shopData) {

            let residueTime: number = Math.max(Math.floor(this.shopData.refresh_time - PlayerData.GetServerTime()), 0);
            this.timeLab.string = "刷新时间：" + DateUtils.FormatTime(residueTime, "%{hh}:%{mm}:%{ss}");
            if (residueTime <= 0) {
                if (this.tempTime <= 0) {
                    this.tempTime = 1;
                    Session.Send({ type: MsgTypeSend.ShopGetIndex, data: { shop_index_id: [this.stdShopIndex.ID] } });
                } else {
                    this.tempTime -= dt;
                }

            } else {
                this.tempTime = 1;
            }
        } else {

            this.timeLab.string = "刷新时间：--:--:--";
        }
    }

    onShow(): void {
        this.isPlayListEffect = true;
        this.node.active = true;
        this.updateShow();
    }

    onHide(): void {
        this.isPlayListEffect = false;
        this.node.active = false;
    }
    SetData(data:StdShopGroup):void{
        this.data = data;
        this.updateShow();
    }
    private onShopUpdate():void{
        if(!this.node.activeInHierarchy) return;
        this.updateShow();
    }
    private updateShow(): void {
        if(!this.data || !this.isInit) return;
        this.stdShopIndex = CfgMgr.GetShopIndex(this.data.ShopGroupId, this.data.ShopType);
        
        this.shopId = this.stdShopIndex.ID;
        this.shopData = PlayerData.GetCommShopData(this.shopId);
        if(!this.shopData) {
            this.noneListCont.active = true;
            this.shopList.UpdateDatas([]);
            return;
        }
        let std: StdShop = CfgMgr.GetShop(this.shopData.shop_id);
        this.refreshBtn.node.active = std.IsCanManualRefresh > 0;
        if (this.shopData) {
            this.noneListCont.active = false;
            //this.refreshBtnLab.string = `${this.shopData.manual_count}次`;
        } else {
            this.noneListCont.active = true;
            //this.refreshBtnLab.string = `--次`;
        }
        let soldOut: SShopItem[] = [];
        let normal: SShopItem[] = [];
        let adItemList: SShopItem[] = [];
        if (this.shopData) {
            let lists: SShopItem[] = this.shopData.shop_items;
            adItemList = this.shopData.ad_shop_items ? this.shopData.ad_shop_items.concat() : [];
            for (let adItem of adItemList) {
                adItem.isAdItem = true;
            }
            for (let index = 0; index < lists.length; index++) {
                let shopItem: SShopItem = lists[index];
                let std: StdShopCommodity = CfgMgr.GetCommShopItem(shopItem.id);
                if (std.GoodAmount > 0 && shopItem.count < 1 ||
                    std.LimitBuyTime > 0 && shopItem.expiration_time - PlayerData.GetServerTime() <= 0) {
                    soldOut.push(shopItem);
                } else {
                    normal.push(shopItem);
                }
            }
        }
        soldOut.sort(this.shopSort);
        normal.sort(this.shopSort);
        this.shopDatas = normal.concat(soldOut);
        // this.shopDatas = adItemList.concat(this.shopDatas);
        if (GameSet.Server_cfg.Mark) {     
        } else {
             this.shopDatas = adItemList.concat(this.shopDatas);
        }
        this.shopList.UpdateDatas(this.shopDatas);
        if (this.isPlayListEffect) {
            NodeTrickleOutEffect(this.shopList.children, 0.2);
            this.isPlayListEffect = false;
        }
    }
    private shopSort(a: SShopItem, b: SShopItem): number {
        let stdA: StdShopCommodity = CfgMgr.GetCommShopItem(a.id);
        let stdB: StdShopCommodity = CfgMgr.GetCommShopItem(b.id);
        return stdB.Order - stdA.Order;
    }

    private onRefreshClcik(): void {
        if (this.shopData) {
            let std: StdShop = CfgMgr.GetShop(this.shopData.shop_id);
            if (std.RefreshThingType && std.RefreshThingType) {
                ShopRefreshPanel.Show(std, this.shopId);
            } else {
                Session.Send({ type: MsgTypeSend.ShopManualRefresh, data: { shop_index_id: this.shopId } });
            }
        }
    }

    protected updateShopItem(item: Node, data: SShopItem, index: number) {
        let shopItem = item.getComponent(GemShopItem) || item.addComponent(GemShopItem);
        shopItem.SetData(data, this.shopData.shop_id);
    }
    private loop = 0;
    private async onShopSelect(index: number, item: Node): Promise<void> {
        let shopData = this.shopDatas[index];
        let std = CfgMgr.GetCommShopItem(shopData.id);
        if (shopData.isAdItem) {
            let stdShop: StdShop = CfgMgr.GetShop(this.shopData.shop_id);
            if (stdShop.AdId > 0) {
                let adData: SAdvister = PlayerData.GetAdvisterData(stdShop.AdId);
                if (adData.count <= 0) {
                    MsgPanel.Show("今日广告奖励次数已达上限");
                    return;
                }
                if (game.totalTime < adData.cdEndTime) {
                    MsgPanel.Show("冷却中，请稍后！");
                    return;
                }
                if (this.loop) return;
                this.loop = game.totalTime;
                if(PlayerData.GetIsActivateRights(StdEquityId.Id_9) || PlayerData.GetIsActivateRights(StdEquityId.Id_10)){
                    AdHelper.JumpAd(stdShop.AdId, "")
                }else{
                    console.log("AdHelper---> rewardAdId2:", GameSet.globalCfg.ad_channel.rewardAdId2);
                    let action, errorCode, errorMsg;
                    if (Math.abs(GameSet.globalCfg.ad_channel.rewardAdId2) == 1) {
                        [action, errorCode, errorMsg] = await AdHelper.rewardAd(getAdcfg().rewardAdId2, stdShop.AdId, "");
                    } else {
                        [action, errorCode, errorMsg] = await AdHelper.rewardQbAd(getQbAdCfg().rewardAdId2, stdShop.AdId, "");
                    }
                    if (action == "onLoadFailed") {
                        Tips.Show("广告加载失败，请稍后再试！");
                        
                        if (Math.abs(GameSet.globalCfg.ad_channel.rewardAdId2) == 1) {
                            if (GameSet.globalCfg.ad_channel.rewardAdId2 > 0) GameSet.globalCfg.ad_channel.rewardAdId2 = 2;
                            Tips.Show("广告加载失败，请稍后再试！");
                        } else {
                            if (GameSet.globalCfg.ad_channel.rewardAdId2 > 0) GameSet.globalCfg.ad_channel.rewardAdId2 = 1;
                            Tips.Show("广告展示失败，请稍后再试！");
                        }
                    }
                    this.loop = undefined;
                    PlayerData.SetAdvisterCd(stdShop.AdId);
                }
            }
        } else {
            if (std.GoodAmount > 0 && shopData.count < 1) {
                MsgPanel.Show("道具已售馨");
                return;
            }
            if (std.LimitBuyTime > 0 && shopData.expiration_time - PlayerData.GetServerTime() <= 0) {
                MsgPanel.Show("道具已超出时间，无法继续兑换");
                return;
            }
            ShopBuyPanel.Show(this.shopId, shopData);
        }

    }
}