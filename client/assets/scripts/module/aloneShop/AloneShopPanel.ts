import { Label, Node } from "cc";
import { Panel } from "../../GameRoot";
import { AutoScroller } from "../../utils/AutoScroller";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import PlayerData, {} from "../roleModule/PlayerData"
 import {SShopContent,SShopItem,SThing} from "../roleModule/PlayerStruct";
import { CfgMgr, ShopGroupId, StdShopCommodity, StdShopGroup, StdShopIndex } from "../../manager/CfgMgr";
import { ItemUtil } from "../../utils/ItemUtils";
import { ConsumeItem, ConsumeNumFormatType } from "../common/ConsumeItem";
import { EventMgr, Evt_Currency_Updtae, Evt_Item_Change, Evt_ShopUpdate } from "../../manager/EventMgr";
import { DateUtils } from "../../utils/DateUtils";
import { MsgPanel } from "../common/MsgPanel";
import { ShopBuyPanel } from "../shop/ShopBuyPanel";
import { AloneShopItem } from "./AloneShopItem";

export class AloneShopPanel extends Panel {
    protected prefab: string = "prefabs/panel/aloneShop/AloneShopPanel";
    private titleLab:Label;
    private haveItemList:AutoScroller;
    private shopList:AutoScroller;
    private noneListCont: Node;
    private timeCont: Node;
    private timeLab: Label;
    private timetips: Label;
    private shopDatas: SShopItem[];
    protected shopData: SShopContent;
    private stdShop:StdShopGroup;
    private stdShopIndex: StdShopIndex;

    private is_can_buy:boolean = false
    protected onLoad() {
        this.titleLab = this.find("titleLab", Label);
        this.haveItemList = this.find("haveItemList", AutoScroller);
        this.haveItemList.SetHandle(this.updateHaveItem.bind(this));
        this.shopList = this.find("shopList", AutoScroller);
        this.shopList.SetHandle(this.updateShopItem.bind(this));
        this.shopList.node.on('select', this.onShopSelect, this);
        this.noneListCont = this.find("noneListCont");
        this.timeCont = this.find("timeCont");
        this.timeLab = this.find("timeCont/timeLab", Label);
        this.timetips = this.find("timetips", Label);
        this.CloseBy("closeBtn");
        this.CloseBy("mask"); 
    }
    protected onShow(): void {
        EventMgr.on(Evt_ShopUpdate, this.onShopUpdate, this);
        Session.Send({type: MsgTypeSend.ShopGetIndex, data:{}});
        EventMgr.on(Evt_Currency_Updtae, this.onCurrencyUpdate, this);
        EventMgr.on(Evt_Item_Change, this.onItemChange, this);
    }
    protected onHide(...args: any[]): void {
        EventMgr.off(Evt_ShopUpdate, this.onShopUpdate, this);
        EventMgr.off(Evt_Currency_Updtae, this.onCurrencyUpdate, this);
        EventMgr.on(Evt_Item_Change, this.onItemChange, this);
    }
    
    public flush(shopGroupId:ShopGroupId): void{
        this.stdShop = PlayerData.ShopGroupInfo[shopGroupId][0];
        this.titleLab.string = this.stdShop.ShopName;
        this.stdShopIndex = CfgMgr.GetShopIndex(this.stdShop.ShopGroupId, this.stdShop.ShopType);
        let shop_data = CfgMgr.GetShop(this.stdShopIndex.ShopID);
        if(shop_data.ShopOpen && shop_data.ShopOpen.length > 0){
            const now = new Date();
            const currentDay = now.getDay(); // 0 表示星期天, 1 表示星期一, ..., 6 表示星期六
            for (let index = 0; index < shop_data.ShopOpen.length; index++) {
                const element = shop_data.ShopOpen[index];
                if(element != 0){
                    let day = element
                    if(element == 7){
                        day = 0
                    }
                    //只有当天才可以购买
                    const daysUntilNextMonday = (day + 7 - currentDay) % 7;
                    if(daysUntilNextMonday == 0){
                        this.is_can_buy = true;
                        break;
                    }
                }
            }
        }else{
            this.is_can_buy = true;
        }
        let str_list = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
        if(shop_data.ShopOpen && shop_data.ShopOpen.length > 0){
            let str = ""
            for (let index = 0; index < shop_data.ShopOpen.length; index++) {
                const element = shop_data.ShopOpen[index];
                let day = element == 7 ? 0 : element;
                str = str + str_list[day]
            }
            this.timetips.string = str + "开放购买";
        }
        this.shopDatas = [];
        this.updateItem();
        this.updateShow();
    }
    private tempTime: number = 0;
    protected update(dt: number): void {
        if (this.shopData && this.shopData.refresh_time > 0) {

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
    private onItemChange():void{
        this.updateShow();
    }
    private onCurrencyUpdate():void{
        this.updateItem();
    }
    private onShopUpdate():void{
        this.updateShow();
    }
    private updateItem():void{
        
        let haveItems:SThing[] = [];
        if(this.stdShopIndex){
            haveItems = ItemUtil.GetSThingList(this.stdShopIndex.MoneyType, this.stdShopIndex.MoneyID);
        }
        this.haveItemList.UpdateDatas(haveItems);
    }
    private updateHaveItem(item:Node, data:SThing):void{
        let consumeItem = item.getComponent(ConsumeItem);
        if (!consumeItem) consumeItem = item.addComponent(ConsumeItem);
        consumeItem.numFormatType = ConsumeNumFormatType.Have;
        consumeItem.SetData(data);
    }
    protected updateShopItem(item: Node, data: SShopItem, index: number) {
        let shopItem = item.getComponent(AloneShopItem) || item.addComponent(AloneShopItem);
        shopItem.SetData(data, this.shopData.shop_id);
    }
    private updateShow():void {
        
        this.shopDatas = [];
        if(this.stdShopIndex){
            this.shopData = PlayerData.GetCommShopData(this.stdShopIndex.ID);
        } 
        
        let soldOut: SShopItem[] = [];
        let normal: SShopItem[] = [];
        let lists: SShopItem[] = this.shopData ? this.shopData.shop_items : [];
       
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
        soldOut.sort(this.shopSort);
        normal.sort(this.shopSort);
        this.shopDatas = normal.concat(soldOut);
        
        this.shopList.UpdateDatas(this.shopDatas);
        this.noneListCont.active = this.shopDatas.length < 1;
    }
    private shopSort(a: SShopItem, b: SShopItem): number {
        let stdA: StdShopCommodity = CfgMgr.GetCommShopItem(a.id);
        let stdB: StdShopCommodity = CfgMgr.GetCommShopItem(b.id);
        return stdB.Order - stdA.Order;
    }

    private onShopSelect(index: number, item: Node): void {
        let shopData = this.shopDatas[index];
        if(!this.is_can_buy){
            MsgPanel.Show("未到购买时间");
            return;
        }
        let std = CfgMgr.GetCommShopItem(shopData.id);
        if (std.GoodAmount > 0 && shopData.count < 1) {
            MsgPanel.Show("道具已售馨");
            return;
        }
        if (std.LimitBuyTime > 0 && shopData.expiration_time - PlayerData.GetServerTime() <= 0) {
            MsgPanel.Show("道具已超出时间，无法继续兑换");
            return;
        }
        ShopBuyPanel.Show(this.stdShopIndex.ID, shopData);

    }
}