import { js, Node} from "cc";
import { Panel } from "../../GameRoot";
import { SceneBgmId } from "../../manager/AudioMgr";
import { CfgMgr, ShopGroupId, ShopType, StdShopGroup, StdShopIndex, ThingType } from "../../manager/CfgMgr";
import { EventMgr, Evt_Change_Scene_Bgm, Evt_Currency_Updtae, Evt_Hide_Scene, Evt_Item_Change, Evt_Show_Scene } from "../../manager/EventMgr";
import { MsgTypeSend } from "../../MsgType";
import { Session } from "../../net/Session";
import { AutoScroller } from "../../utils/AutoScroller";
import { ItemUtil } from "../../utils/ItemUtils";
import { ConsumeItem, ConsumeNumFormatType } from "../common/ConsumeItem";
import PlayerData, {  } from "../roleModule/PlayerData"
 import {SThing} from "../roleModule/PlayerStruct";
import { GemConversionPage } from "./GemConversionPage";
import { GemShopPage } from "./GemShopPage";
import { GemShopTabBtnItem } from "./GemShopTabBtnItem";
import { MsgPanel } from "../common/MsgPanel";
import { GameSet } from "../GameSet";

export class GemShopPanel extends Panel {
    protected prefab: string = "prefabs/panel/gemShop/GemShopPanel";
    private haveItemList:AutoScroller;
    private gemShop:GemShopPage;
    private gemConversion:GemConversionPage;
    private tabBtnList:AutoScroller;
    private tabDatas:StdShopGroup[];
    private curTabIndex:number = 0;
    private curTabData:StdShopGroup;
    protected onLoad() {
        this.haveItemList = this.find("haveItemList", AutoScroller);
        this.haveItemList.SetHandle(this.updateHaveItem.bind(this));
        this.tabBtnList = this.find("tabBtnList", AutoScroller);
        this.tabBtnList.SetHandle(this.updateTabBtnItem.bind(this));
        this.tabBtnList.node.on('select', this.onTabBtnSelect, this);
        this.gemShop = this.node.getChildByName("gemShopPage").addComponent(GemShopPage);
        this.gemConversion = this.node.getChildByName("gemConversionPage").addComponent(GemConversionPage);
        this.CloseBy("backBtn"); 
        
        
    }
    protected onShow(): void {
        EventMgr.emit(Evt_Hide_Scene, js.getClassName(this));
        Session.Send({type: MsgTypeSend.ShopGetIndex, data:{}});
        EventMgr.emit(Evt_Change_Scene_Bgm, SceneBgmId.SceneBgm_6); 
        EventMgr.on(Evt_Currency_Updtae, this.onCurrencyUpdate, this);
        EventMgr.on(Evt_Item_Change, this.onItemChange, this);
    }
    protected onHide(...args: any[]): void {
        EventMgr.emit(Evt_Show_Scene, js.getClassName(this));
        EventMgr.emit(Evt_Change_Scene_Bgm); 
        this.gemConversion.onHide();
        EventMgr.off(Evt_Currency_Updtae, this.onCurrencyUpdate, this);
        EventMgr.off(Evt_Item_Change, this.onItemChange, this);
    }
    
    public flush(selectIndex:number = 0): void {
        this.tabDatas = PlayerData.ShopGroupInfo[ShopGroupId.GemShop];
        this.curTabIndex = selectIndex;
        this.curTabData = this.tabDatas[this.curTabIndex];
        this.tabBtnList.UpdateDatas(this.tabDatas);
        this.updateTabSelect();
        
    }
    protected update(dt: number): void {
        
    }
    private onItemChange():void{
        this.updateHave();
    }
    private onCurrencyUpdate():void{
        this.updateHave();
    }
    private updateTabSelect():void{
        this.gemShop.onHide();
        this.gemConversion.onHide();
        this.curTabData = this.tabDatas[this.curTabIndex];
        switch(this.curTabData.ShopType){
            case ShopType.GemShop:
                this.gemShop.SetData(this.curTabData);
                this.gemShop.onShow();
                break;
            case ShopType.GemConversion:
                this.gemConversion.onShow();
                break;
        }
        this.updateHave();
        
    }
    private updateHave():void{
        let haveItems:SThing[] = [];
        if(this.curTabData.ShopType == ShopType.GemShop){
            let tabData:StdShopGroup = this.tabDatas[this.curTabIndex];
            let stdShopIndex:StdShopIndex = CfgMgr.GetShopIndex(tabData.ShopGroupId, tabData.ShopType);
            if(stdShopIndex){
                haveItems = ItemUtil.GetSThingList(stdShopIndex.MoneyType, stdShopIndex.MoneyID);
            }
        }else if(this.curTabData.ShopType == ShopType.GemConversion){
            haveItems = ItemUtil.GetSThingList([ThingType.ThingTypeGem], [0]);
        }
        this.haveItemList.UpdateDatas(haveItems);
    }
    private updateHaveItem(item:Node, data:SThing):void{
        let consumeItem = item.getComponent(ConsumeItem) || item.addComponent(ConsumeItem);
        consumeItem.numFormatType = ConsumeNumFormatType.Have;
        consumeItem.SetData(data);
    }
    protected updateTabBtnItem(item: Node, data: StdShopGroup, index:number) {
        let tabBtnItem = item.getComponent(GemShopTabBtnItem) || item.addComponent(GemShopTabBtnItem);
        let select:Node = item.getChildByName("selectCont");
        select.active = index == this.curTabIndex;
        tabBtnItem.SetData(data);
    }
    private onTabBtnSelect(index: number, item: Node):void{
        if(this.curTabIndex == index) return;
        let tabData:StdShopGroup = this.tabDatas[index];
        if (GameSet.GetServerMark() != "jy" && tabData.ShopType == ShopType.GemShop){
            MsgPanel.Show("暂未开放");
            return;
        }
        this.resetSelect();
        let select:Node = item.getChildByName("selectCont");
        select.active = true;
        this.curTabIndex = index;
        this.curTabData = this.tabDatas[this.curTabIndex];
        this.updateTabSelect();
    }
    private resetSelect():void{
        let node:Node;
        let itemIndex:number;
        let select:Node;
        
        for (let index = 0; index < this.tabBtnList.children.length; index++) {
            node = this.tabBtnList.children[index];
            itemIndex = node["$$index"];
            if(itemIndex == this.curTabIndex){
                select = node.getChildByName("selectCont");
                select.active = false;
                break;
            }
        }
    }
}