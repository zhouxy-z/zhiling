import { Button, Color, instantiate, js, Label, Layout, Node, NodePool, sp, Sprite,  tween, UITransform, v3, Vec2, Vec3 } from "cc";
import { Panel } from "../../GameRoot";
import { GameSet } from "../GameSet";
import { FlipGrid } from "./FlipGrid";
import { CfgMgr, OneOffRedPointId, StdFilpAnswer, StdFilpGrandPrize, StdItem } from "../../manager/CfgMgr";
import { formatNumber, numTween, randomf, randomI, randomWeightIndex } from "../../utils/Utils";
import { FlipShowGrid } from "./FlipShowGrid";
import { EventMgr, Evt_Change_Scene_Bgm, Evt_FlipGrandPrize, Evt_FlipGrandPrizeTake, Evt_FlipInitData, Evt_Hide_Scene, Evt_Item_Change, Evt_Show_Scene } from "../../manager/EventMgr";
import { FlipItemBuyPanel } from "./FlipItemBuyPanel";
import PlayerData from "../roleModule/PlayerData";
import { SFlipData, SFlipGetPrizeData, SFlipGrandPrizeData } from "../roleModule/PlayerStruct";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import { FishingShopPanel } from "../fishing/FishingShopPanel";
import { MsgPanel } from "../common/MsgPanel";
import { AudioMgr, FishBombSoundInfo, FlipSoundId, FlipSoundInfo, SceneBgmId } from "../../manager/AudioMgr";
import { BezierTween3 } from "../../utils/Bezier";
import { FlipPrizeLogPanel } from "./FlipPrizeLogPanel";
import { FlipCastRankPanel } from "./FlipCastRankPanel";
export class FlipPanel extends Panel {
    protected prefab: string = "prefabs/panel/flip/FlipPanel";
    private topCont: Node;
    private btnCont: Node;
    private showGridCont: Node;
    private gridCont: Node;
    private boxCont: Node;
    private boxBtnCont: Node;
    private gridMask: Node;
    private showGridMask: Node;
    private inputMask: Node;
    private tiLiNumLab: Label;
    private yuNumLab: Label;
    private addBtn: Button;
    private yuPoolBtn: Button;
    private yuPoolNumLab: Label;
    private shopBtn: Button;
    private gbaBtn: Button;
    private rankBtn: Button;
    private openBtn1: Button;
    private openBtn2: Button;
    private openBtn3: Button;
    private boxNumLab1: Label;
    private boxNumLab2: Label;
    private boxNumLab3: Label;
    private targetLab: Label;
    private bigPrizeEffectLoop: Node;
    private effectCont: Node;
    private effect: sp.Skeleton;
    private fishFlyTemp: Node;
    private fishFlyEffectTemp: Node;
    private contH: number = 0;
    private contLayou: Layout;
    private gridComList: FlipGrid[] = [];
    private showGridComLis: FlipShowGrid[] = [];
    private prizeTypeCfg1: StdFilpAnswer[];
    private prizeTypeCfg2: StdFilpAnswer[];
    private prizeList: StdFilpGrandPrize[];
    private showCardBackIdxs: number[][] = [
        [0], 
        [1, 5],
        [2, 6, 10],
        [3, 7, 11, 15],
        [4, 8, 12, 16, 20],
        [9, 13, 17, 21],
        [14, 18, 22],
        [19, 23],
        [24],
    ]
    private showCardIdxs: number[][] = [
        [0, 5, 10, 15, 20],
        [1, 6, 11, 16, 21],
        [2, 7, 12, 17, 22],
        [3, 8, 13, 18, 23],
        [4, 9, 14, 19, 24],
    ]
    private realMap: Map<number, number> = new Map();//真实中奖map
    private realValeMap: Map<number, boolean> = new Map();//真实中奖map
    private realList: number[][] = [];//真实中奖列表
    private showMap: Map<number, number> = new Map();//显示中奖map
    private showValMap: Map<number, boolean> = new Map();//显示中奖值
    private showList: number[][] = [];//显示中奖列表
    private gridDatas: number[][] = [];
    private prizeData: SFlipGrandPrizeData;
    private curOpenNum: number = 0;
    private curOpenVal: number = 0;
    private isNeedInitShow: boolean = false;
    private data:SFlipData;
    private fishFlyPool:NodePool = new NodePool();
    private flyFishEffectPool:NodePool = new NodePool();
    private openValue: number = 0;
    private curSelectId: number = 0;
    protected onLoad(): void {
        this.prizeTypeCfg1 = CfgMgr.GetFilpAnswerTypeList(1);
        this.prizeTypeCfg2 = CfgMgr.GetFilpAnswerTypeList(2);
        this.prizeList = CfgMgr.GetFilpGrandPrizeList();
        this.contLayou = this.find("cont", Layout);
        this.topCont = this.find("cont/topCont");
        this.btnCont = this.find("cont/btnCont");
        this.showGridCont = this.find("cont/showGridCont");
        this.gridCont  = this.find("cont/gridCont");
        this.boxCont = this.find("cont/boxCont");
        this.boxBtnCont = this.find("cont/boxBtnCont");
        this.gridMask = this.find("gridMask");
        this.showGridMask = this.find("showGridMask");
        this.inputMask = this.find("showGridMask");
        this.tiLiNumLab = this.find("cont/topCont/tiliItem/numLab", Label);
        this.yuNumLab = this.find("cont/topCont/yuItem/numLab", Label);
        this.addBtn = this.find("cont/topCont/yuItem/addBtn", Button);
        this.boxNumLab1 = this.find("cont/boxCont/boxItem1/numLab", Label);
        this.boxNumLab2 = this.find("cont/boxCont/boxItem2/numLab", Label);
        this.boxNumLab3 = this.find("cont/boxCont/boxItem3/numLab", Label);
        this.openBtn1 = this.find("cont/boxBtnCont/btn1", Button);
        this.openBtn2 = this.find("cont/boxBtnCont/btn2", Button);
        this.openBtn3 = this.find("cont/boxBtnCont/btn3", Button);
        this.yuPoolBtn = this.find("cont/btnCont/leftCont", Button);
        this.yuPoolNumLab = this.find("cont/btnCont/leftCont/numLab", Label);
        this.shopBtn = this.find("cont/btnCont/btnCont/shopBtn", Button);
        this.gbaBtn = this.find("cont/btnCont/btnCont/gbaBtn", Button);
        this.rankBtn = this.find("cont/btnCont/btnCont/rankBtn", Button);
        this.targetLab = this.find("cont/btnCont/rightCont/targetLab", Label);
        this.bigPrizeEffectLoop = this.find("bigPrizeEffectLoop");
        this.effectCont = this.find("effectCont");
        this.effect = this.find("effectCont/effect2", sp.Skeleton);
        this.fishFlyTemp = this.find("fishFlyTemp");
        this.fishFlyEffectTemp = this.find("fishFlyEffectTemp");
        this.CloseBy("cont/topCont/closeBtn");
        this.effectCont.active = false;
        this.bigPrizeEffectLoop.active = false;
        for (let node of this.showGridCont.children) {
            let showGridCom: FlipShowGrid = node.addComponent(FlipShowGrid);
            this.showGridComLis.push(showGridCom);
        }
        for (let index = 0; index < this.gridCont.children.length; index++) {
            let node: Node = this.gridCont.children[index];
            let gridCom: FlipGrid = node.addComponent(FlipGrid);
            this.gridComList.push(gridCom);
            node.on(Button.EventType.CLICK, this.onGridClick.bind(this, index), this);
        }
        
        let std: StdFilpAnswer = this.prizeTypeCfg1[0];
        
        this.boxNumLab1.string = std.Grade5.toString();
        this.boxNumLab2.string = std.Grade50.toString();
        this.boxNumLab3.string = std.Grade500.toString();
        
        this.contH += this.topCont.getComponent(UITransform).height;
        this.contH += this.btnCont.getComponent(UITransform).height;
        this.contH += this.showGridCont.getComponent(UITransform).height;
        this.contH += this.gridCont.getComponent(UITransform).height;
        this.contH += this.boxCont.getComponent(UITransform).height;
        this.contH += this.boxBtnCont.getComponent(UITransform).height;
        
        this.shopBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.gbaBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.rankBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.openBtn1.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.openBtn2.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.openBtn3.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.addBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.yuPoolBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
    }

    protected onShow(): void {
        this.effectCont.active = false;
        this.bigPrizeEffectLoop.active = false;
        let h: number = GameSet.UICanvasHeight;
        //this.contLayou.node.getComponent(UITransform).height = h;
        this.contLayou.spacingY = (h - this.contH) / 5;
        this.openValue = 0;
        //this.contLayou.updateLayout(true);
        this.prizeData = null;
        this.curSelectId = 0;
        this.curOpenNum = 0;
        this.curOpenVal = 0;
        this.isNeedInitShow = false;
        this.data = null;
        this.showInputMask();
        this.updateBtnState();
        this.playInitGrid();
        this.onItemUpdate();
        this.updateOpenValue();
        this.yuPoolNumLab.string = "0";
        EventMgr.emit(Evt_Hide_Scene, js.getClassName(this));
        EventMgr.emit(Evt_Change_Scene_Bgm, SceneBgmId.SceneBgm_13);   
        PlayerData.SetOneOffRedPoint(OneOffRedPointId.OffRedPoint_FlipOpen);
        EventMgr.on(Evt_FlipInitData, this.onDataInit, this);
        EventMgr.on(Evt_FlipGrandPrize, this.onGrandPrize, this);
        EventMgr.on(Evt_FlipGrandPrizeTake, this.onGrandPrizeTake, this);
        EventMgr.on(Evt_Item_Change, this.onItemUpdate, this);
        Session.Send({type: MsgTypeSend.FlipStatus, data:{}});
        
        //this.onDataInit({fatigue: 10000, fatigue_max: 20000, daily_cost: 0, grand_pool:{"101":1000,"102":2000, "103": 3000}})
    }
    
    public flush(...args: any[]): void {
        
    }

    protected onHide(...args: any[]): void {
        EventMgr.off(Evt_FlipInitData, this.onDataInit, this);
        EventMgr.off(Evt_FlipGrandPrize, this.onGrandPrize, this);
        EventMgr.off(Evt_FlipGrandPrizeTake, this.onGrandPrizeTake, this);
        EventMgr.off(Evt_Item_Change, this.onItemUpdate, this);
        EventMgr.emit(Evt_Show_Scene, js.getClassByName(this));
        EventMgr.emit(Evt_Change_Scene_Bgm);
    }
    private showInputMask():void{
        this.inputMask.active = true;
        this.scheduleOnce(this.hideInputMask, 3);
    }
    private hideInputMask():void{
        this.unschedule(this.hideInputMask);
        this.inputMask.active = false;
    }
    private onItemUpdate():void{
        let fishItemNum:number = PlayerData.GetItemCount(CfgMgr.GetFlipCommon.CostItemID);
        this.yuNumLab.string = fishItemNum.toString();
        
    }

    private onDataInit(data: SFlipData):void{
        this.hideInputMask();
        this.data = data;
        this.tiLiNumLab.string = formatNumber(this.data.fatigue, 2);
        this.updatePool();
    }
    private updatePool():void{
        let val: number = this.prizeData ? this.data.grand_pool[this.prizeData.grand_prize_id] : 0;
        this.yuPoolNumLab.string = formatNumber(Math.max(val, 0), 2);
    }

    private onGrandPrize(data: SFlipGrandPrizeData): void{
        Session.Send({type: MsgTypeSend.FlipStatus, data:{}});
        this.openValue = 0;
        this.updateOpenValue();
        this.prizeData = data;
        this.curSelectId = this.prizeData.grand_prize_id;
       /*  if (this.prizeData.grand_prize_id == 103) {
            this.prizeData.prize_type = 2;
            let valList: number[] = [88800];
            this.prizeData.reward_count = valList[randomI(valList.length-1, 0)]
        } */
        
        this.hideInputMask();
        this.updatePool();
        this.realMap.clear();
        this.realValeMap.clear();
        this.realList.length = 0;
        this.showMap.clear();
        this.showValMap.clear();
        this.showList.length = 0;
        if(this.isNeedInitShow){
            this.playInitGrid();
        }
        this.isNeedInitShow = true;
        //开大奖
        if (data.prize_type == 2) {
            this.onGrandPrizeLotteryResult();
        } else {
            this.onSimpleLotteryResult();
        }
        
    }

    private onGrandPrizeTake(data: SFlipGetPrizeData):void{
        if (!this.prizeData) {
            return;
        }
        this.curOpenVal += data.reward_count;
    }

    private updateOpenValue():void{
        this.targetLab.string = formatNumber(this.openValue, 2);
    }
    private onBtnClick(btn: Button): void{
        switch(btn) {
            case this.addBtn:
                FlipItemBuyPanel.Show();
                break;
            case this.shopBtn:
                FishingShopPanel.Show();
                break;
            case this.gbaBtn:
                
                break;
            case this.rankBtn:
                FlipCastRankPanel.Show();
                break
            case this.yuPoolBtn:
                if (!this.curSelectId) {
                    MsgPanel.Show("暂未开启任何宝箱")
                    return;
                }
                FlipPrizeLogPanel.Show(this.curSelectId);
                break;
            case this.openBtn1:
                this.onBoxClick(0);
                break;
            case this.openBtn2:
                this.onBoxClick(1);
                break;
            case this.openBtn3:
                this.onBoxClick(2);
                break
        }
    }

    
    private onGridClick(index: number, btn: Button):void{
        if (!this.prizeData) {
            return;
        }
        
        let gridCom: FlipGrid = this.gridComList[index];
        gridCom.onShowCard();
       
        if(this.curOpenVal < this.prizeData.reward_count){
            let getVal: number[] = this.gridDatas[index];
            if (this.realMap.has(getVal[0])) {
                let std: StdFilpGrandPrize;
                for (let index = 0; index < this.prizeList.length; index++) {
                    if (this.prizeList[index].Id == this.prizeData.grand_prize_id){
                        std = this.prizeList[index];
                        break;
                    }
                }
                
                if ((getVal[1] / std.BetonType) >= CfgMgr.GetFlipCommon.BeyondTimes) {
                    AudioMgr.playSound(FlipSoundInfo[FlipSoundId.Flip_1], false);
                }else{
                    AudioMgr.playSound(FlipSoundInfo[FlipSoundId.Flip_2], false);
                }
                this.openValue += getVal[1];
                Session.Send({type: MsgTypeSend.FlipGrandPrizeTake, data:{reward_count: getVal[1]}});
                Session.Send({type: MsgTypeSend.FlipStatus, data:{}});
                this.flyFish(5, btn.node);
                //this.onGrandPrizeTake({grand_prize_id: this.prizeData.grand_prize_id, reward_count: getVal[1]});
            }
            
        }
        
        this.curOpenNum ++;
        //console.error("开启数量 ---- 》" + this.curOpenNum)
        if (this.curOpenNum >= this.gridComList.length) {
            this.prizeData = null;
            this.curOpenVal = 0;
            this.curOpenNum = 0;
            this.updateBtnState();
        }
    }

    private updateBtnState():void {
        let btn: Button;
        let sp: Sprite;
        let btnLab: Label;
        if (!this.prizeData) {
            for (let index = 0; index < this.prizeList.length; index++) {
                btn = this[`openBtn${index + 1}`];
                btnLab = btn.node.getChildByPath("btnLab").getComponent(Label);
                sp = btn.node.getComponent(Sprite);
                btnLab.string = "选择开启";
                btn.interactable = true;
                sp.color = new Color().fromHEX("#FFFFFF");
            }
        } else {
            let std: StdFilpGrandPrize;
            for (let index = 0; index < this.prizeList.length; index++) {
                std = this.prizeList[index];
                btn = this[`openBtn${index + 1}`];
                btnLab = btn.node.getChildByPath("btnLab").getComponent(Label);
                sp = btn.node.getComponent(Sprite);
                if (std.Id == this.prizeData.grand_prize_id) {
                    btnLab.string = "一键开启";
                    btn.interactable = true;
                    sp.color = new Color().fromHEX("#FFFFFF");
                }else{
                    btnLab.string = "选择开启";
                    btn.interactable = false;
                    sp.color = new Color().fromHEX("#979797");
                }

            }
        }
    }

    private playInitGrid(): void{
        this.initShowGrid();
        this.initGrid();
    }

    private initShowGrid(): void{
        this.showGridMask.active = true;
        let delay: number = 0;
        for (let showGridCom of this.showGridComLis) {
            showGridCom.node.active = true;
            showGridCom.onInit();
            showGridCom.onShowCardBack(delay);
            delay += 0.1;
        }
        let thisObj = this;
        this.scheduleOnce(()=>{
            thisObj.showGridMask.active = false;
        }, delay);
    }

    private initGrid():void{
        this.gridMask.active = true;
        for (let gridCom of this.gridComList) {
            gridCom.onInit();
        }
        
        let showCardBackIdxs: number[];
        let delay: number = 0;
        for (let index = 0; index < this.showCardBackIdxs.length; index++) {
            showCardBackIdxs = this.showCardBackIdxs[index];
            for (let idx of showCardBackIdxs) {
                let gridCom: FlipGrid = this.gridComList[idx];
                gridCom.onShowCardBack(delay);
            }
            delay += 0.1;
        }
        let thisObj = this;
        this.scheduleOnce(()=>{
            thisObj.gridMask.active = false;
        }, delay);
    }

    private openAllCard(): void {
        this.gridMask.active = true;
        let showCardIdxs: number[];
        let delay: number = 0;
        let effectGridList: FlipGrid[] = [];
        for (let index = 0; index < this.showCardIdxs.length; index++) {
            showCardIdxs = this.showCardIdxs[index];
            let isAddTime: boolean = false;
            for (let idx of showCardIdxs) {
                let gridCom: FlipGrid = this.gridComList[idx];
                let gridData: number[] = this.gridDatas[idx];
                if (!isAddTime) {
                    isAddTime = !gridCom.GetIsOpen();
                }
                if (this.realMap.has(gridData[0]) && !gridCom.GetIsOpen()) {
                    effectGridList.push(gridCom);
                    this.openValue += gridData[1];
                }
                
                gridCom.onShowCard(delay);
            }
            if (isAddTime) delay += 0.1;
        }
        let thisObj = this;
        this.scheduleOnce(()=>{
            thisObj.gridMask.active = false;
            if (thisObj.curOpenVal < thisObj.prizeData.reward_count) {
                Session.Send({type: MsgTypeSend.FlipGrandPrizeTake, data:{reward_count: thisObj.prizeData.reward_count - thisObj.curOpenVal}});
                Session.Send({type: MsgTypeSend.FlipStatus, data:{}});
                //this.onGrandPrizeTake({grand_prize_id: this.prizeData.grand_prize_id, reward_count: this.prizeData.reward_count - this.curOpenVal});    
            }
            for (let index = 0; index < effectGridList.length; index++) {
                thisObj.flyFish(5, effectGridList[index].node);
                
            }
            thisObj.prizeData = null;
            thisObj.curOpenNum = 0;
            thisObj.curOpenVal = 0;
            thisObj.updateBtnState();
        }, delay);
    }
   
    private onBoxClick(index: number): void{
        
        if (this.prizeData) {
            AudioMgr.playSound(FlipSoundInfo[FlipSoundId.Flip_3], false);
            this.openAllCard();
        }else{
            this.showInputMask();
            let std: StdFilpGrandPrize = this.prizeList[index];
            if(!std || !this.data)return;
            if (this.data.fatigue < std.BetonType) {
                MsgPanel.Show("开启失败体力不足" + std.BetonType);
                return;
            }
            if ((CfgMgr.GetFlipCommon.DailyCostMax - this.data.daily_cost) < std.BetonType) {
                MsgPanel.Show("开启失败当天投入超过上限");
                return;
            }
            let havNum:number = PlayerData.GetItemCount(CfgMgr.GetFlipCommon.CostItemID);
            if(havNum < std.BetonType){
                let stdItem:StdItem = CfgMgr.Getitem(CfgMgr.GetFlipCommon.CostItemID);
                MsgPanel.Show(`开启失败${stdItem.ItemName}不足${std.BetonType}个`);
                FlipItemBuyPanel.Show();
                return;
            }
            
            Session.Send({type: MsgTypeSend.FlipGrandPrize, data:{grand_prize_id: std.Id}});
            /* let groupList: number[] = [];
            for (const group of this.prizeTypeCfg1) {
                groupList = group["RewardNumber" + std.BetonType].concat(groupList);
            }
            
            this.onGrandPrize({
                reward_count:groupList[randomI(groupList.length - 1, 0)],
                is_take_reward:false,
                prize_type:1,
                grand_prize_id: std.Id,
            }) */
        }
    }
    private onGrandPrizeLotteryResult():void {
        this.effectCont.active = true;
        AudioMgr.playSound(FlipSoundInfo[FlipSoundId.Flip_4], false);
        this.bigPrizeEffectLoop.active = true;
        this.effect.setAnimation(0, "Start", false);
        this.effect.setCompleteListener(()=>{
            this.effectCont.active = false;
        })
        
        let std: StdFilpGrandPrize;
        for (let index = 0; index < this.prizeList.length; index++) {
            if (this.prizeList[index].Id == this.prizeData.grand_prize_id){
                std = this.prizeList[index];
                break;
            }
            
        }
       
        this.updateBtnState();
        for (let showGrid of this.showGridCont.children) {
            showGrid.active = false;
        }
        
        console.log("特奖中奖值------->" + this.prizeData.reward_count);
        let groupList: number[] = [];
        let heroIdList:number[] = [];
        let lvName: string = this.getLvName(std.Id);
        for (let awStd of this.prizeTypeCfg2) {
            groupList = groupList.concat(awStd[lvName]);
            heroIdList = heroIdList.concat(awStd.HeroView);
        }
        let selectGroup: number[] = [];
        //中奖的结果组合
        let awardGroupList: number[][] = this.findGroupResult(groupList, this.gridComList.length, this.prizeData.reward_count);
        if (awardGroupList.length > 0) {
            //从奖励结果中随机一组搭配
            selectGroup = awardGroupList[randomI(awardGroupList.length - 1, 0)];
            let count: number = 0;
            for (let index = 0; index < selectGroup.length; index++) {
                count += selectGroup[index];
                
            }
            if (count!=this.prizeData.reward_count) {
                console.error("-----开奖数对不上")
            }
            console.log(count + "<-----大奖精确中奖组合：", awardGroupList);
            console.log("<-----选中组合：", selectGroup);
        }
        if (selectGroup.length < 1) {
            let val:number = this.prizeData.reward_count / this.gridComList.length;
            for (let index = 0; index < this.gridComList.length; index++) {
                selectGroup[index] = val;   
            }
            console.log("<-----组合失败取平均数：", selectGroup);
        }
        
        this.realList = [];
        let total: number = 0;
        for (let index = 0; index < selectGroup.length; index++) {
            let val: number = selectGroup[index];
            for (let awStd of this.prizeTypeCfg2) {
                let cardId: number;
                if (awStd[lvName].indexOf(val) >= 0) {
                    cardId = awStd.HeroView[randomI(awStd.HeroView.length - 1, 0)];
                } else {
                    cardId = heroIdList[randomI(heroIdList.length - 1, 0)];
                }
                this.realMap.set(cardId, val);
                this.realList.push([cardId, val]);
                total+=val;
                break;
            }
        }
        //console.error("-------->" + total)
        let gridDatas: number[][] = [];
        gridDatas = [...this.realList];
        this.gridDatas = this.arratConfuse(gridDatas);
        let grid: FlipGrid;
        
        for (let index = 0; index < this.gridComList.length; index++) {
            grid = this.gridComList[index];
            let cardData: number[] = this.gridDatas[index];
            grid.SetData(cardData, "ui_FFL_icon_04", true);
        }

    }
    //普通开奖结果
    private onSimpleLotteryResult():void{
        this.bigPrizeEffectLoop.active = false;
        let std: StdFilpGrandPrize;
        for (let index = 0; index < this.prizeList.length; index++) {
            if (this.prizeList[index].Id == this.prizeData.grand_prize_id){
                std = this.prizeList[index];
                break;
            }
            
        }
        this.updateBtnState();
        let idx: number = randomWeightIndex(std.PrizeValue);
        let showNum: number = std.PrizeNumber[idx];
        console.log("中奖显示形象数量------->" + showNum);
        this.initAwardGroup(std.Id);
        this.setShowGridData(std.Id, showNum);
        this.setGridData(std.Id);
        
    }
    //初始化奖励
    private initAwardGroup(id: number):void{
        if (this.prizeData.reward_count <= 0) return;
        let lvName:string = this.getLvName(id);
        let groupList: number[] = [];
        let heroIdList: number[] = [];
        for (let awStd of this.prizeTypeCfg1) {
            groupList = groupList.concat(awStd[lvName]);
            heroIdList = heroIdList.concat(awStd.HeroView);
        }

        //中奖的结果组合
        let awardGroupList: number[][] = [];
        let selectGroup: number[] = [];
        awardGroupList = this.findCombination(groupList, this.prizeData.reward_count);
        if (awardGroupList.length > 0) {
            //从奖励结果中随机一组搭配
            selectGroup = awardGroupList[randomI(awardGroupList.length - 1, 0)];
            console.log(this.prizeData.reward_count + "<-----选中组合：", selectGroup);
        } else {
            console.log("中奖值------->" + this.prizeData.reward_count + "无法组合实行自动分配");
            let val: number = this.prizeData.reward_count / 3;
            selectGroup = [val, val, val];
        }
        let heroIdMap: Map<number, number> = new Map();
        for (let index = 0; index < selectGroup.length; index++) {
            let heroValue: number = selectGroup[index];
            let cardId: number = heroIdMap[heroValue];
            if (!cardId) {
                let heroList: number[];
                let allHero: number[] = [];
                let tempHero: number[];
                for (let awStd of this.prizeTypeCfg1) {
                    allHero = awStd.HeroView.concat(allHero);
                    let stdValueList: number[] = awStd[lvName];
                    if (stdValueList.indexOf(heroValue) >= 0) {
                        heroList = awStd.HeroView;
                        break;
                    }
                }
                
                if(heroList){
                    tempHero = heroList;    
                }else{
                    tempHero = allHero;    
                }
                tempHero = this.arratConfuse(tempHero);
                for (let heroIndex = 0; heroIndex < tempHero.length; heroIndex++) {
                    if (!this.realMap.has(tempHero[heroIndex])){
                        cardId = tempHero[heroIndex];
                        break;
                    }
                    
                }
                heroIdMap[heroValue] = cardId;
            }
            if (!this.realMap.has(cardId)){
                this.realMap.set(cardId, heroValue);
                this.realValeMap.set(heroValue, true);
                this.realList.push([cardId, heroValue]);
                this.showMap.set(cardId, heroValue);
                this.showValMap.set(heroValue, true);
                this.showList.push([cardId, heroValue]);
            } else {
                this.realList.push([cardId, heroValue]);
            }
    
        }
        
    }

    //设置可中奖格子数据
    private setShowGridData(id: number, showNum: number):void{
        this.showGridMask.active = true;
        let lvName:string = this.getLvName(id);
        let addNum: number = 0;
        if (this.realMap.size < showNum) {
            addNum = showNum - this.realMap.size;
        } 
        for (let index = 0; index < addNum; index++) {
            
            for (let awStd of this.prizeTypeCfg1) {
                let isCheck: boolean = false;
                let copyValueList: number[] = [...awStd[lvName]];
                copyValueList = this.arratConfuse(copyValueList);
                let addValue: number;
                for (let k = 0; k < copyValueList.length; k++) {
                    addValue = copyValueList[k];
                    if (!this.showValMap.has(addValue)){
                        isCheck = true;
                        let copyHeroList: number[] = [...awStd.HeroView];
                        copyHeroList = this.arratConfuse(copyHeroList);
                        let cardId: number;
                        for (let j = 0; j < copyHeroList.length; j++) {
                            cardId = copyHeroList[j];
                            if (!this.showMap.has(cardId)){
                                this.showMap.set(cardId, addValue);
                                this.showList.push([cardId, addValue]);
                                this.showValMap.set(addValue, true);
                                break;
                            }
                            
                        }
                        break;
                    }
                    
                }
                if(isCheck) break;
            }

        }
        
        this.showList = this.arratConfuse(this.showList);
        console.log("------->最终显示形象" + this.showList)
        let com: FlipShowGrid;
        let delay: number = 0;
        for (let index = 0; index < this.showGridComLis.length; index++) {
            com = this.showGridComLis[index];
            let cardData: number[] = this.showList[index];
            com.SetData(cardData);
            if (cardData) {
                com.node.active = true;
                com.onShowCard(delay);
                delay += 0.1;
            }else{
                com.node.active = false;
            }
        }
        let thisObj = this;
        this.scheduleOnce(()=>{
            thisObj.showGridMask.active = false;
        }, delay);
    }

    //设置奖池格子数据
    private setGridData(id: number): void{
        let lvName:string = this.getLvName(id);
        let gridDatas: number[][] = [];
        gridDatas = [...this.realList];
        let addNum: number = this.gridComList.length - gridDatas.length;
        
        if(addNum > 0){
            let allHeroHero:number[] = [];
            let allValue:number[] = [];
            for (let awStd of this.prizeTypeCfg1) {
                allHeroHero = allHeroHero.concat(awStd.HeroView);
                allValue = allValue.concat(awStd[lvName]);  
            }
            

            for (let index = 0; index < addNum; index++) {
                allHeroHero = this.arratConfuse(allHeroHero);
                allValue = this.arratConfuse(allValue);
                let addVal: number;
                for (let valIndex = 0; valIndex < allValue.length; valIndex++) {
                    addVal = allValue[valIndex];
                    if(!this.showValMap.has(addVal)){
                        let cardId:number;
                        for (let heroIndex = 0; heroIndex < allHeroHero.length; heroIndex++) {
                            cardId = allHeroHero[heroIndex];
                            if(!this.showMap.has(cardId)){
                                gridDatas.push([cardId, addVal]);
                                break;
                            }
                            
                        }
                        break;
                    }
                }
                
            }
        }
        
        this.gridDatas = this.arratConfuse(gridDatas);
        let std: StdFilpGrandPrize;
        for (let index = 0; index < this.prizeList.length; index++) {
            if (this.prizeList[index].Id == this.prizeData.grand_prize_id){
                std = this.prizeList[index];
                break;
            }
            
        }
        let grid: FlipGrid;
        
        for (let index = 0; index < this.gridComList.length; index++) {
            grid = this.gridComList[index];
            let cardData: number[] = this.gridDatas[index];
            let effect:string = null;
            if(this.realMap.has(cardData[0])){
                if((cardData[1] / std.BetonType) >= CfgMgr.GetFlipCommon.BeyondTimes){
                    effect = "ui_FFL_icon_03";
                }else{
                    effect = "ui_FFL_icon_02";
                }
            }
            grid.SetData(cardData, effect, false);
        }
    }
    private flyFish(num:number, node: Node):void{
            let p1:Vec3 = new Vec3(node.worldPosition.x,node.worldPosition.y,0);
            let p2:Vec3 = new Vec3(this.targetLab.node.worldPosition.x, this.targetLab.node.worldPosition.y, 0);
            let c1:Vec3;
            let c2:Vec3;
            let effectNode: Node;
            if (this.flyFishEffectPool.size() > 0) {
                effectNode = this.flyFishEffectPool.get();
            } else {
                effectNode = instantiate(this.fishFlyEffectTemp);   
            }
            this.node.addChild(effectNode);
            effectNode.active = true;
            effectNode.worldPosition = p1;
            let effect:sp.Skeleton = effectNode.getComponent(sp.Skeleton);
            effect.clearAnimation();
            effect.setAnimation(0, "animation", true);
            effect.setCompleteListener(()=>{
                this.flyFishEffectPool.put(effectNode);
            })
            
            
            for (let index = 0; index < num; index++) {
                let angle = randomf(index * 360 / num, (index + 1) * 360 / num);
                let r = randomf(200, 250);// 随机散开半径
                let rx = p1.x + r * Math.cos(angle);
                let ry = p1.y + r * Math.sin(angle);
                c1 = new Vec3(p1.x - randomI(150, 50), p1.y + randomI(350, 300), p1.z);
                c2 = new Vec3(p2.x - randomI(100, 50), p2.y - randomI(150, 50), p2.z);
                let lookAngle = angle * 180 / Math.PI + 90;
                this.creatFlyNode(index * randomf(0.1, 0.05), new Vec3(rx, ry), c1, c2, p2, lookAngle);
            }
        }
        private creatFlyNode(delay:number, p1:Vec3, c1:Vec3, c2:Vec3, p2:Vec3, lookAngle: number):void{
            let feedNode: Node;
            if (this.fishFlyPool.size() > 0) {
                feedNode = this.fishFlyPool.get();
            } else {
                feedNode = instantiate(this.fishFlyTemp);   
            }
            this.node.addChild(feedNode);
            feedNode.active = true;
            feedNode.worldPosition = p1;
            feedNode.setScale(new Vec3(1,1,0));
            feedNode.setRotationFromEuler(0, 0, lookAngle);
            BezierTween3(feedNode, 1, p1, c1, c2, p2, delay, () => {
                this.fishFlyPool.put(feedNode);
                this.updateOpenValue();
            });
            tween(feedNode)
            .delay(delay)
            .to(1, {scale: new Vec3(0.3, 0.3, 0)})
            .start();
            
        }
    private findGroupResult(groupList: number[],count: number,target: number,maxResults: number = 10,maxAttempts: number = 100000,precision:number = 1e-9): number[][] {
        let results: number[][] = [];
        let attempts: number = 0;
        let sortedList = [...groupList].sort((a, b) => b - a);
        let backtrack = (start: number, path: number[], sum: number) => {
            attempts++;
            if (attempts > maxAttempts) {
                console.warn(`达到最大尝试次数 ${maxAttempts}`);
                return true;
            }
            
            if (results.length >= maxResults) {
                return true;
            }
            
            if (path.length === count) {
                if (Math.abs(sum - target) <= precision) {
                    results.push([...path]);
                }
                return false;
            }
            
            let remaining: number = count - path.length;
            let minRemainingSum: number = sortedList[sortedList.length - 1] * remaining;
            if (sum + minRemainingSum > target + precision) return false;
        
            for (let i = start; i < sortedList.length; i++) {
                let num: number = sortedList[i];
                let newSum: number = sum + num;
                if (newSum > target + precision) continue;
                if (backtrack(i, [...path, num], newSum)) {
                    return true;
                }
            }
            return false;
        }
        backtrack(0, [], 0);
        return results;
    }

    /**
     * 高效查找小数面额组合
     * @param groupList 可用的中奖面额数组
     * @param target 目标值
     * @param options 配置选项
     */
    private findCombination(groupList: number[], target: number, maxResults: number = 1000, maxAttempts: number = 100000, precision: number = 4, timeout: number = 200): number[][]{
        // 初始化统计
        let attempts = 0;
        const startTime = Date.now();
        let stopped = false;
    
        // 预处理面额
        const epsilon = 10 ** -precision;
        const processedDenoms = Array.from(new Set(groupList))
            .map(d => parseFloat(d.toFixed(precision)))
            .sort((a, b) => a - b)
            .filter(d => d > 0); // 过滤掉0或负值
    
        const result: number[][] = [];
        
        // 浮点数安全比较
        const safeEquals = (a: number, b: number) => Math.abs(a - b) < epsilon;
        const safeLTE = (a: number, b: number) => a < b + epsilon;
    
        /**
         * 高效回溯算法
         */
        let backtrack = (remaining: number, path: number[], startIdx: number, usedDenoms: Set<number>) => {
            // 安全检查
            if (stopped || attempts >= maxAttempts || result.length >= maxResults) {
                stopped = true;
                return;
            }
    
            // 超时检查
            if (Date.now() - startTime > timeout) {
                stopped = true;
                console.warn(`计算超时，已终止 (${timeout}ms)`);
                return;
            }
    
            attempts++;
    
            // 终止条件检查
            if (safeEquals(remaining, 0)) {
                result.push([...path]);
                return;
            }
    
            // 剪枝条件
            if (path.length >= 25 || usedDenoms.size > 3) {
                return;
            }
    
            // 优化：预估最小可能元素数
            const minPossible = Math.ceil(remaining / processedDenoms[processedDenoms.length - 1]);
            if (path.length + minPossible > 25) {
                return;
            }
    
            // 遍历面额
            for (let i = startIdx; i < processedDenoms.length; i++) {
                const denom = processedDenoms[i];
    
                // 提前终止（因为面额已排序）
                if (denom > remaining + epsilon) break;
    
                // 检查面额种类限制
                const newUsed = new Set(usedDenoms);
                newUsed.add(denom);
                if (newUsed.size > 3) continue;
    
                // 检查剩余金额是否可以用当前面额组合完成
                const maxPossible = Math.floor((remaining + epsilon) / denom);
                if (path.length + maxPossible > 25) continue;
    
                // 优化：优先尝试大面额
                for (let count = Math.min(maxPossible, 25 - path.length); count >= 1; count--) {
                    const newRemaining = remaining - denom * count;
                    if (safeLTE(newRemaining, 0) ){
                        if (safeEquals(newRemaining, 0)) {
                            result.push([...path, ...Array(count).fill(denom)]);
                            if (result.length >= maxResults) {
                                stopped = true;
                                return;
                            }
                        }
                        break;
                    }
    
                    backtrack(
                        newRemaining,
                        [...path, ...Array(count).fill(denom)],
                        i + 1,
                        newUsed
                    );
    
                    if (stopped) return;
                }
    
                if (stopped) return;
            }
        }
    
        backtrack(target, [], 0, new Set());
    
        return result;
    }
    
    
    private arratConfuse<T>(arr:T[]): T[]{
        let j: number, x: T, i: number;
        for (i = arr.length; i; i--) {
            j = Math.floor(Math.random() * i);
            x = arr[i - 1];
            arr[i - 1] = arr[j];
            arr[j] = x;
        }
        return arr;
    }

    private getLvName(id: number): string{
        let idList: {[key: number]: string} = {[101]:"RewardNumber5", [102]:"RewardNumber50", [103]:"RewardNumber500"}
        return idList[id];
    }
    
}