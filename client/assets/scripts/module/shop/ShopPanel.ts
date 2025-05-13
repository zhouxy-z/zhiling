import { Node, Toggle, js} from "cc";
import { Panel } from "../../GameRoot";
import { ShopLuckyPage } from "./ShopLuckyPage";
import { ShopDayPage } from "./ShopDayPage";
import { EventMgr, Evt_Change_Scene_Bgm, Evt_Currency_Updtae, Evt_Hide_Scene, Evt_Item_Change, Evt_Show_Scene } from "../../manager/EventMgr";
import { ConsumeItem, ConsumeNumFormatType } from "../common/ConsumeItem";
import { ItemUtil } from "../../utils/ItemUtils";
import { CfgMgr, ShopGroupId, ShopType, StdLuckyShop, StdShop, StdShopGroup, StdShopIndex, ThingType } from "../../manager/CfgMgr";
import PlayerData, { } from "../roleModule/PlayerData"
 import {SThing,SThingItem} from "../roleModule/PlayerStruct";
import { formatNumber } from "../../utils/Utils";
import { BeforeGameUtils } from "../../utils/BeforeGameUtils";
import { AutoScroller } from "../../utils/AutoScroller";
import { ShopTabBtnItem } from "./ShopTabBtnItem";
import { ShopBasePage } from "./ShopPageBase";
import { ShopWeekPage } from "./ShopWeekPage";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import { SceneBgmId } from "../../manager/AudioMgr";
import { ShopTempPage } from "./ShopTempPage";
export class ShopPanel extends Panel {
    protected prefab: string = "prefabs/panel/shop/ShopPanel";
    private haveItemList:AutoScroller;
    private luckyPage:ShopLuckyPage;
    private dayPage:ShopDayPage;
    private weekPage:ShopWeekPage;
    private tempPage:ShopTempPage;
    private tabBtnList:AutoScroller;
    private tabDatas:StdShopGroup[];
    private curTabIndex:number;
    private shopPageInfo:{[key: string]: ShopBasePage};
    protected onLoad() {
        this.haveItemList = this.find("haveItemList", AutoScroller);
        this.haveItemList.SetHandle(this.updateHaveItem.bind(this));
        this.tabBtnList = this.find("tabBtnList", AutoScroller);
        this.tabBtnList.SetHandle(this.updateTabBtnItem.bind(this));
        this.tabBtnList.node.on('select', this.onTabBtnSelect, this);
        this.luckyPage = this.node.getChildByName("luckyPage").addComponent(ShopLuckyPage);
        this.luckyPage.onHide();
        this.dayPage = this.node.getChildByName("dayPage").addComponent(ShopDayPage);
        this.dayPage.onHide();
        this.weekPage = this.node.getChildByName("weekPage").addComponent(ShopWeekPage);
        this.weekPage.onHide();
        this.tempPage = this.node.getChildByName("tempPage").addComponent(ShopTempPage);
        this.tempPage.onHide();
        this.shopPageInfo = BeforeGameUtils.toHashMapObj(
            ShopType.LuckyShop, this.luckyPage,
            ShopType.DayShop, this.dayPage,
            ShopType.WeekShop, this.weekPage,
            ShopType.TempShop, this.tempPage,
        );
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
        EventMgr.emit(Evt_Show_Scene, js.getClassByName(this));
        EventMgr.emit(Evt_Change_Scene_Bgm); 
        EventMgr.off(Evt_Currency_Updtae, this.onCurrencyUpdate, this);
        EventMgr.off(Evt_Item_Change, this.onItemChange, this);
    }
    
    public async flush(shopGroupId:number): Promise<void> {
        this.curTabIndex = -1;
        let showShopList:StdShopGroup[] = [];
        let defShowList:StdShopGroup[] = PlayerData.ShopGroupInfo[shopGroupId];
        let stdShopGroup:StdShopGroup;
        let stdShopIndex:StdShopIndex;
        for (let index = 0; index < defShowList.length; index++) {
            stdShopGroup = defShowList[index];
            stdShopIndex = CfgMgr.GetShopIndex(stdShopGroup.ShopGroupId, stdShopGroup.ShopType);
            if(stdShopIndex && stdShopIndex.SystemOpen){
                stdShopGroup.TabSort = stdShopIndex.TabSort??0;
                showShopList.push(stdShopGroup);
            }
        }
        showShopList.sort((a:StdShopGroup, b:StdShopGroup)=>{
            return a.TabSort - b.TabSort;
        });
        this.tabDatas = showShopList;
        this.tabBtnList.UpdateDatas(this.tabDatas);
        this.tabBtnList.SelectFirst(0);
    }
    protected update(dt: number): void {
        
    }
    private onItemChange():void{
        this.updateHave();
    }
    private onCurrencyUpdate():void{
        this.updateHave();
    }
    private updateHave():void{
        let haveItems:SThing[] = [];
        let tabData:StdShopGroup = this.tabDatas[this.curTabIndex];
        let stdShopIndex:StdShopIndex = CfgMgr.GetShopIndex(tabData.ShopGroupId, tabData.ShopType);
        if(stdShopIndex){
            haveItems = ItemUtil.GetSThingList(stdShopIndex.MoneyType, stdShopIndex.MoneyID);
        }
        this.haveItemList.UpdateDatas(haveItems);
    }
    private updateTabSelect():void{
        let shopType:number;
        let shopBasePage:ShopBasePage;
        let tabData:StdShopGroup = this.tabDatas[this.curTabIndex];
        for (let key in this.shopPageInfo) {
            shopType = Number(key);
            shopBasePage = this.shopPageInfo[key];
            if(shopType == tabData.ShopType){
                shopBasePage.onShow();
                shopBasePage.SetData(tabData);
            }else{
                shopBasePage.onHide();
            }
        }
        this.updateHave();
    }
    private updateHaveItem(item:Node, data:SThing):void{
        let consumeItem = item.getComponent(ConsumeItem);
        if (!consumeItem) consumeItem = item.addComponent(ConsumeItem);
        consumeItem.numFormatType = ConsumeNumFormatType.Have;
        consumeItem.SetData(data);
    }
    protected updateTabBtnItem(item: Node, data: StdShopGroup, index:number) {
        let tabBtnItem = item.getComponent(ShopTabBtnItem);
        if (!tabBtnItem) tabBtnItem = item.addComponent(ShopTabBtnItem);
        let select:Node = item.getChildByName("selectCont");
        select.active = index == this.curTabIndex;
        tabBtnItem.SetData(data);
    }
    private onTabBtnSelect(index: number, item: Node):void{
        if(this.curTabIndex == index) return;
        this.resetSelect();
        let select:Node = item.getChildByName("selectCont");
        select.active = true;
        this.curTabIndex = index;
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