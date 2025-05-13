import { Button, Color, Component, js, Label, Node, path, sp, Sprite, SpriteFrame } from "cc";
import { AutoScroller } from "../../utils/AutoScroller";
import { CfgMgr, StdEquityCard, StdEquityCardTab, StdEquityList, StdEquityType } from "../../manager/CfgMgr";
import { RightsTabItem } from "./RightsTabItem";
import { RightsItem } from "./RightsItem";
import PlayerData, {  } from "../roleModule/PlayerData"
 import {SThing} from "../roleModule/PlayerStruct"
import { ItemUtil } from "../../utils/ItemUtils";
import { AwardItem } from "../common/AwardItem";
import { SetNodeGray } from "../common/BaseUI";
import { RightsMiniTabItem } from "./RightsMiniTabItem";
import { ResMgr } from "../../manager/ResMgr";
import { BeforeGameUtils } from "../../utils/BeforeGameUtils";
import { MsgPanel } from "../common/MsgPanel";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import { EventMgr, Evt_RightsGetReward, Evt_RightsToPage } from "../../manager/EventMgr";
import { ItemTips } from "../common/ItemTips";
import { GameSet } from "../GameSet";
import { KefuPanel } from "../notice/KefuPanel";
import { GemShopPanel } from "../gemShop/GemShopPanel";

export class RightsPage extends Component {
    private effect:sp.Skeleton;
    private maxTitleImg:Sprite;
    private miniTitleImg:Sprite;
    private nameLab:Label;
    private mxaTabBtnList:AutoScroller;
    private miniTabBtnList:AutoScroller;
    private activate:Node;
    private list:AutoScroller;
    private dayAwardList:AutoScroller;
    private storageBtn:Button;
    private btn:Button;
    private btnLab:Label;
    private btnEffect:Node;
    private timeLab:Label;
    private curSelectMaxTabIndex:number = 0;
    private maxTabDatas:StdEquityCardTab[];
    private curSelectMaxTabData:StdEquityCardTab;
    private miniTabDatas:StdEquityCard[];
    private curSelectMiniTabIndex:number = 0;
    private curSelectMiniTabData:StdEquityCard;
    private awList:SThing[] = [];
    private nameCor:Color = new Color();
    private corStr:{[key:string]:string} = BeforeGameUtils.toHashMapObj(
        StdEquityType.Type_1,"#3E86AF",
        StdEquityType.Type_2,"#37B541",
        StdEquityType.Type_3,"#A64CE1",
        StdEquityType.Type_4,"#EA5B1C",
    );

    protected onLoad(): void {
        this.maxTabDatas = CfgMgr.GetEquityCardTabList();
        this.effect = this.node.getChildByName("effect").getComponent(sp.Skeleton);
        this.maxTitleImg = this.node.getChildByName("maxTitleImg").getComponent(Sprite);
        this.miniTitleImg = this.node.getChildByName("miniTitleImg").getComponent(Sprite);
        this.nameLab = this.node.getChildByName("nameLab").getComponent(Label);
        this.mxaTabBtnList = this.node.getChildByName("maxTabBtnList").getComponent(AutoScroller);
        this.mxaTabBtnList.SetHandle(this.updateMaxTabItem.bind(this));
        this.mxaTabBtnList.node.on('select', this.onMaxTabSelect, this);
        this.miniTabBtnList = this.node.getChildByName("miniTabBtnList").getComponent(AutoScroller);
        this.miniTabBtnList.SetHandle(this.updateMiniTabItem.bind(this));
        this.miniTabBtnList.node.on('select', this.onMiniTabSelect, this);
        this.activate = this.node.getChildByName("activate");
        this.list = this.node.getChildByName("list").getComponent(AutoScroller);
        this.dayAwardList = this.node.getChildByPath("awardCont/dayCont/dayAwardList").getComponent(AutoScroller);
        this.storageBtn = this.node.getChildByPath("awardCont/dayCont/datBtnCont/storageBtn").getComponent(Button);
        this.btn = this.node.getChildByPath("awardCont/dayCont/datBtnCont/btn").getComponent(Button);
        this.btnLab = this.node.getChildByPath("awardCont/dayCont/datBtnCont/btn/btnLab").getComponent(Label);
        this.btnEffect = this.node.getChildByPath("awardCont/dayCont/datBtnCont/btn/effect");
        this.timeLab = this.node.getChildByPath("awardCont/dayCont/timeLab").getComponent(Label);

        this.list.SetHandle(this.updateListItem.bind(this));
        this.dayAwardList.SetHandle(this.updateAwardItem.bind(this));
        this.dayAwardList.node.on('select', this.onAwardSelect, this);
        //this.mxaTabBtnList.SelectFirst(0);
        //his.updateShow();
        
        this.storageBtn.node.active = false;
        this.btn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.storageBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.btnEffect.active = false;
    }

    onShow(seleceCardId:number):void{
        this.node.active = true;
        let selectMaxIndex:number = -1;
        let selectMiniIndex:number = -1;
        if(seleceCardId > 0){
            let maxTab:StdEquityCardTab;
            for (let index = 0; index < this.maxTabDatas.length; index++) {
                maxTab = this.maxTabDatas[index];
                selectMiniIndex = maxTab.EquityCardIds.indexOf(seleceCardId);
                if(selectMiniIndex > -1){
                    selectMaxIndex = index;
                    break;
                }
            }
        }else{
            let maxTab:StdEquityCardTab;
            let miniIndex:number = -1;
            for (let index = 0; index < this.maxTabDatas.length; index++) {
                maxTab = this.maxTabDatas[index];
                for (let i = 0; i < maxTab.EquityCardIds.length; i++) {
                    if(PlayerData.CheckEquityMiniTabRead(maxTab.EquityCardIds[i])){
                        miniIndex = i;
                        break;
                    }
                    
                }
                if(miniIndex > -1){
                    selectMiniIndex = miniIndex;
                    selectMaxIndex = index;
                    break;
                }
            }
            
        }
        if(selectMiniIndex > -1){
            this.curSelectMaxTabIndex = selectMaxIndex;
        }else{
            selectMiniIndex = this.curSelectMiniTabIndex;
        }
        this.curSelectMaxTabData = this.maxTabDatas[this.curSelectMaxTabIndex];
        this.mxaTabBtnList.UpdateDatas(this.maxTabDatas);
        this.updateMaxSelectShow(selectMiniIndex);
        EventMgr.on(Evt_RightsGetReward, this.onUpdateData, this);

    }
    onHide():void{
        this.node.active = false;
        EventMgr.off(Evt_RightsGetReward, this.onUpdateData, this);
    }
    private onUpdateData():void{
        this.updateBtnState();
    }
    private onBtnClick(btn:Button): void {
        switch(btn){
            case this.btn:
                if(PlayerData.GetEquityCardResidueTime(this.curSelectMiniTabData.Equity_CardID) < 1)
                {
                    if (GameSet.GetServerMark() == "hc"){
                        if( this.curSelectMiniTabData.Equity_CardID == 1003 ||
                            this.curSelectMiniTabData.Equity_CardID == 1004 ||
                            this.curSelectMiniTabData.Equity_CardID == 1005)
                        {
                            // KefuPanel.Show(); 
                            //EventMgr.emit(Evt_RightsToPage);
                        }
                        
                        return;
                    }
                    if (GameSet.GetServerMark() == "jy"){
                        if( this.curSelectMiniTabData.Equity_CardID == 1001 )
                        {
                            //GemShopPanel.Show(1); 
                        }
                        
                        return;
                    }
                    //EventMgr.emit(Evt_RightsToPage);
                    
                }
                if(!PlayerData.GetEquityCardIsCanGetAward(this.curSelectMiniTabData.Equity_CardID)){
                    MsgPanel.Show("今日已领取");
                    return;
                }
                Session.Send({
                    type: MsgTypeSend.ClaimDailyBenefitRequest,
                    data: {benefit_card_id:this.curSelectMiniTabData.Equity_CardID}
                });
                break;
            case this.storageBtn:
                break;
        }
    }
    private resetMaxTabSelect():void{
        let children:Node[] = this.mxaTabBtnList.node.getChildByPath("view/content").children;
        for (let i = 0; i < children.length; i++) {
            let node:Node = children[i];
            this.updateMaxTabState(node, false);
        }
    }
    private resetMiniTabSelect():void{
        let children:Node[] = this.miniTabBtnList.node.getChildByPath("view/content").children;
        for (let i = 0; i < children.length; i++) {
            let node:Node = children[i];
            this.updateMiniTabState(node, false);
        }
    }
    private updateMaxTabState(item:Node, isSelect:boolean):void{
        let select:Node = item.getChildByName("select");
        let def:Node = item.getChildByName("def");
        if(isSelect){
            select.active = true;
            def.active = false;
        }else{
            select.active = false;
            def.active = true;
        }
    }
    private updateMiniTabState(item:Node, isSelect:boolean):void{
        let select:Node = item.getChildByName("select");
        let def:Node = item.getChildByName("def");
        if(isSelect){
            select.active = true;
            def.active = false;
        }else{
            select.active = false;
            def.active = true;
        }
    }
    private onMaxTabSelect(index: number, item: Node):void{
        if(index == this.curSelectMaxTabIndex) return;
        this.resetMaxTabSelect();
        if(item){
            this.updateMaxTabState(item, true);
        }
        this.curSelectMaxTabIndex = index;
        this.curSelectMaxTabData = this.maxTabDatas[index];
        this.updateMaxSelectShow(0);
    }
    private updateMaxTabItem(item: Node, data: StdEquityCardTab, index:number):void {
        let tabItem = item.getComponent(RightsTabItem) || item.addComponent(RightsTabItem);
        tabItem.SetData(data);
        this.updateMaxTabState(item, index == this.curSelectMaxTabIndex);
    }
    private onMiniTabSelect(index: number, item: Node):void{
        if(index == this.curSelectMiniTabIndex) return;
        this.resetMiniTabSelect();
        if(item){
            this.updateMiniTabState(item, true);
        }
        this.curSelectMiniTabIndex = index;
        this.curSelectMiniTabData = this.miniTabDatas[index];
        this.updateMiniSelectShow();
    }
    private updateMiniTabItem(item: Node, data: StdEquityCard, index:number):void {
        let tabItem = item.getComponent(RightsMiniTabItem) || item.addComponent(RightsMiniTabItem);
        tabItem.SetData(data);
        this.updateMiniTabState(item, index == this.curSelectMiniTabIndex);
    }
    private updateMaxSelectShow(selectMiniIndex:number = 0):void{
        this.effect.setAnimation(0,`K${this.curSelectMaxTabIndex + 1}`, true);
        let url:string = path.join("sheets/rights", `maxTitle_${this.curSelectMaxTabData.ID}`, "spriteFrame");
        ResMgr.LoadResAbSub(url, SpriteFrame, res => {
            this.maxTitleImg.spriteFrame = res;
        });

        this.miniTabDatas = [];
        let std:StdEquityCard;
        for (let index = 0; index < this.curSelectMaxTabData.EquityCardIds.length; index++) {
            std = CfgMgr.getEquityCardById(this.curSelectMaxTabData.EquityCardIds[index]);
            if(std) this.miniTabDatas.push(std);
        }
        this.curSelectMiniTabIndex = selectMiniIndex < 0 ? 0 : selectMiniIndex;
        this.curSelectMiniTabData = this.miniTabDatas[this.curSelectMiniTabIndex];
        this.miniTabBtnList.UpdateDatas(this.miniTabDatas);
       
        this.updateMiniSelectShow();
    }
    private updateMiniSelectShow():void{
        let url:string = path.join("sheets/rights", `miniTitleBg_${this.curSelectMiniTabData.CardType}`, "spriteFrame");
        ResMgr.LoadResAbSub(url, SpriteFrame, res => {
            this.miniTitleImg.spriteFrame = res;
        });
        this.updateBtnState();
        this.nameLab.string = this.curSelectMiniTabData.name;
        let nameColor:string = this.corStr[this.curSelectMiniTabData.CardType];
        this.nameLab.color = this.nameCor.fromHEX(nameColor);
        let stdEquityList:StdEquityList[] = CfgMgr.GetEquityList(this.curSelectMiniTabData.Equity_CardID, true);
        this.list.UpdateDatas(stdEquityList);
        let typeList:number[] = [];
        let idList:number[] = [];
        let numList:number[] = [];
        let std:StdEquityList;
        for (let index = 0; index < stdEquityList.length; index++) {
            std = stdEquityList[index];
            if(std.Equity_Type == 2){
                typeList = typeList.concat(std.RewardType);
                idList = idList.concat(std.RewardID);
                numList = numList.concat(std.RewardNumber);
            }
            
        }
        this.awList = ItemUtil.GetSThingList(typeList, idList, numList);
        this.dayAwardList.UpdateDatas(this.awList);
    }
    private updateListItem(item: Node, data: StdEquityList):void {
        let lisItem = item.getComponent(RightsItem) || item.addComponent(RightsItem);
        lisItem.SetData(data);
    }

    private updateAwardItem(item: Node, data:SThing) {
        let awardItem = item.getComponent(AwardItem) || item.addComponent(AwardItem);
        awardItem.SetData({itemData:data});
    }
    private onAwardSelect(index: number, item: Node) {
        let selectData = this.awList[index];
        if(selectData){
            ItemTips.Show(selectData);
        }
    }
    private updateBtnState():void{
        let btnStr:string = "领取奖励";
        this.activate.active = true;
        this.btnEffect.active = false;
        let time:number = PlayerData.GetEquityCardResidueTime(this.curSelectMiniTabData.Equity_CardID) || 0;
        if(time < 1)
        {
            this.timeLab.string = ``;
            this.activate.active = false;
            btnStr = "前往兑换";
            if (GameSet.GetServerMark() == "hc" || GameSet.GetServerMark() == "xf"){
                if( this.curSelectMiniTabData.Equity_CardID == 1003 ||
                    this.curSelectMiniTabData.Equity_CardID == 1004 ||
                    this.curSelectMiniTabData.Equity_CardID == 1005)
                {
                    this.btnEffect.active = true;
                    SetNodeGray(this.btn.node, false, true);
                }else{
                    
                    SetNodeGray(this.btn.node, true, true);
                }
            }else if(GameSet.GetServerMark() == "jy"){
                if( this.curSelectMiniTabData.Equity_CardID == 1001)
                {
                    this.btnEffect.active = true;
                    SetNodeGray(this.btn.node, false, true);
                }else{
                    SetNodeGray(this.btn.node, true, true);
                }
            }
        }else{
            this.timeLab.string = `当前累计剩余时间：${Math.floor(time/86400)}天`;
            if(!PlayerData.GetEquityCardIsCanGetAward(this.curSelectMiniTabData.Equity_CardID)){
                btnStr = "明日再领";
                SetNodeGray(this.btn.node, true, true);
            }else{
                SetNodeGray(this.btn.node, false, true);
            }
        } 
        this.btnLab.string = btnStr;
    }
    
}