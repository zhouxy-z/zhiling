import { Button, Color, Label, Node, Slider, UITransform } from "cc";
import { Panel } from "../../GameRoot";
import { AutoScroller } from "../../utils/AutoScroller";
import { ItemTips } from "../../module/common/ItemTips";
import PlayerData, { } from "../../module/roleModule/PlayerData"
 import {SPlayerDataPve,SThing} from "../../module/roleModule/PlayerStruct";
import { CfgMgr, StdCommonType, StdLevel } from "../../manager/CfgMgr";
import { ItemUtil } from "../../utils/ItemUtils";
import { AwardItem } from "../../module/common/AwardItem";
import { SetNodeGray } from "../../module/common/BaseUI";
import { MsgPanel } from "../../module/common/MsgPanel";
import { MsgTypeRet, MsgTypeSend } from "../../MsgType";
import { Session } from "../../net/Session";
import { RewardTips } from "../../module/common/RewardTips";

export class PveSaoDangPanel extends Panel {
    protected prefab: string = "prefabs/pve/PveSaoDangPanel";
    private residueNumLab:Label;
    private numLab:Label;
    private leftBtn:Button;
    private slider:Slider;
    private sliderBar:Node;
    private rightBtn:Button;
    private maxBtn:Button;
    private awardList:AutoScroller;
    private saoDangNumLab:Label;
    private saoDangOkBtn:Button;
    private curPowerLab:Label;
    private needPowerLab:Label;
    private passNumLab:Label;
    private awDatas:SThing[];
    private datas:number[] = [];
    private pveData: SPlayerDataPve;
    private maxNum:number;
    private std:StdLevel;
    private curNum:number;
    private totalNum:number;
    private isShaoDang:boolean = false;
    private stdPve;
    protected onLoad(): void {
        this.stdPve = CfgMgr.GetCommon(StdCommonType.PVE);
        this.residueNumLab = this.find("numCont/residueNumLab", Label);
        this.numLab = this.find("numLab", Label);
        this.awardList = this.find("awardCont/awardLits", AutoScroller);
        this.awardList.SetHandle(this.updateAwardList.bind(this));
        this.awardList.node.on('select', this.onSelect, this);
        this.leftBtn = this.find("saoDangCont/sliderCont/leftBtn", Button);
        this.slider = this.find("saoDangCont/sliderCont/slider", Slider);
        this.sliderBar = this.find("saoDangCont/sliderCont/slider/sliderBar");
        this.rightBtn = this.find("saoDangCont/sliderCont/rightBtn", Button);
        this.maxBtn = this.find("saoDangCont/sliderCont/maxBtn", Button);
        this.saoDangNumLab = this.find("saoDangCont/numLab", Label);
        this.curPowerLab = this.find("saoDangCont/curPowerLab", Label);
        this.needPowerLab = this.find("saoDangCont/needPowerLab", Label);
        this.saoDangOkBtn = this.find("saoDangCont/okBtn",Button);
        this.passNumLab = this.find("saoDangCont/passNumLab",Label);
        this.slider.node.on('slide', this.onSlide, this);
        this.leftBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.rightBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.maxBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.saoDangOkBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.CloseBy("mask");
        this.CloseBy("closeBtn");

        Session.on(MsgTypeRet.PvESweepRet, this.onPvESweepRet, this);
    }
    public flush(): void{
        this.totalNum = 0;
        this.isShaoDang = false;
        this.pveData = PlayerData.pveData;
        let szBattlePower:number = PlayerData.roleInfo.role_type_max_sum_battle_power||0;
        this.std = CfgMgr.GetSaoDangLevel(this.pveData.progress || 1, szBattlePower) || CfgMgr.GetLevel(this.pveData.progress || 1);
        this.curPowerLab.string = szBattlePower.toString();
        this.needPowerLab.string = this.std.SweepPower.toString();
        if(szBattlePower < this.std.SweepPower){
            this.curPowerLab.color = new Color().fromHEX('#ff4f38');
        }else{
            this.curPowerLab.color = new Color().fromHEX('#22555E');
        }
        this.numLab.string = ``;
        this.passNumLab.string = `扫荡第${this.std.ID}关`;
        this.curNum = 1;
        this.datas = [];
        this.maxNum = Math.min(this.stdPve.Sweepnumb - this.pveData.sweep_times, this.pveData.times);
        this.residueNumLab.string = `${this.stdPve.Sweepnumb - this.pveData.sweep_times}次`;
        this.initShow();
        this.updateBtnState();
        this.changeSlidePro(3);
    }
    
    protected onShow(): void {
        
    }

    protected onHide(...args: any[]): void {
        if(this.totalNum > 0){
            let itemType:number[] = this.std.sweepType.concat();
            let itemId:number[] = this.std.sweepID.concat();
            let itemNum:number[] = [];
            let count:number = 0;
            for(let i = 0; i < this.std.sweepType.length; i++){
                count = this.std.sweepNumber[i];
                itemNum[i] = count.mul(this.totalNum);
            }
            let awDatas = ItemUtil.GetSThingList(itemType, itemId, itemNum);
            RewardTips.Show(awDatas); 
        }
        this.unschedule(this.updateShow);
    }
    private onSlide(event: Slider) {
        let tempNum:number = Math.ceil(event.progress * this.maxNum);
        if(tempNum > this.maxNum) tempNum = this.maxNum;
        this.curNum = Math.max(tempNum, this.maxNum > 0 ? 1 : 0);
        this.changeSlidePro(3);
    }
    private changeSlidePro(type:number):void{
        if(type == 0){
            if(this.curNum > 1){
                this.curNum --;
            }
        }else if(type == 1){
            if(this.curNum < this.maxNum){
                this.curNum ++;
            }
        }else if(type == 2){
            if(this.curNum != this.maxNum){
                this.curNum = this.maxNum;
            }
        }
        this.slider.progress = this.maxNum < 1 ? 0 : this.curNum / this.maxNum;
        let barTrans = this.sliderBar.getComponent(UITransform);
        let sliderTrans = this.slider.getComponent(UITransform);
        barTrans.setContentSize(this.slider.progress * sliderTrans.width, barTrans.height);
        this.saoDangNumLab.string = this.curNum.toString();
    }
    private onBtnClick(btn:Button):void{

        switch (btn) {
            case this.leftBtn:
                this.changeSlidePro(0);
                break;
            case this.rightBtn:
                this.changeSlidePro(1);
                break;
            case this.maxBtn:
                this.changeSlidePro(2);
                break;
            case this.saoDangOkBtn:
                let szBattlePower:number = 0;
                let stdInfo:StdLevel;
                if(this.pveData.progress < 1){
                    MsgPanel.Show("未通关任何关卡不可扫荡");
                    return;
                }
                if(this.maxNum < 1){
                    MsgPanel.Show("扫荡次数不足");
                    return;
                }
                if(this.pveData.sweep_times >= this.stdPve.Sweepnumb){
                    MsgPanel.Show("今日扫荡次数已用完");
                    return;
                }
                if(this.stdPve.Sweepnumb - this.pveData.sweep_times < this.curNum){
                    MsgPanel.Show(`最多还可以扫荡${this.stdPve.Sweepnumb - this.pveData.sweep_times}数`);
                    return;
                }
                if(this.curNum < 0){
                    MsgPanel.Show("扫荡次数不足");
                    return;
                }
                
                szBattlePower = PlayerData.roleInfo.role_type_max_sum_battle_power||0;
                stdInfo = CfgMgr.GetSaoDangLevel(this.pveData.progress || 1, szBattlePower) || CfgMgr.GetLevel(this.pveData.progress||1);
                if(!stdInfo) return;
                if(stdInfo.SweepPower > szBattlePower){
                    MsgPanel.Show(`上阵战力不足${stdInfo.SweepPower}`);
                    return;
                }
                if(this.isShaoDang){
                    MsgPanel.Show("正在扫荡次中");
                    return;
                }
                Session.Send({ type: MsgTypeSend.PvESweep, data: {stage_id: stdInfo.ID, times:this.curNum} });
                break;
        }
    }
    private onPvESweepRet(data:{stage_id:number, result:string,reward_types:number[],reward_ids:number[],reward_numbers:number[], casualties:any, pve_data:SPlayerDataPve}):void{
        this.totalNum = 0;
        if (data.pve_data){
            this.totalNum = this.pveData.times - data.pve_data.times;
            PlayerData.updataPveData(data.pve_data);
            this.pveData = PlayerData.pveData;
        }
        this.curNum = this.pveData.times > 0 ? 1 : 0;
        this.maxNum = Math.min(this.pveData.sweep_times - this.pveData.sweep_times, this.pveData.times);
        this.residueNumLab.string = `${this.stdPve.Sweepnumb - this.pveData.sweep_times}次`;
        this.updateBtnState();
        this.changeSlidePro(3);
        if(data.result == "win"){
            if(this.node.activeInHierarchy){
                if(this.totalNum > 0){
                    this.datas = [];
                    let loop:number = 1;
                    for (let index = 0; index < this.totalNum; index++) {
                        this.datas.push(loop);
                        loop ++;
                    }
                }
                this.unschedule(this.updateShow);
                if(this.datas.length > 0){
                    this.isShaoDang = true; 
                    this.updateShow();
                    this.schedule(this.updateShow, 1.5);
                }
            }
        }
        
    }
    private updateShow():void{
        if(this.datas.length < 1){
            this.isShaoDang = false; 
            this.Hide();
            
            return;
        }
        let num:number = this.datas.shift();
        let itemType:number[] = this.std.sweepType.concat();
        let itemId:number[] = this.std.sweepID.concat();
        let itemNum:number[] = [];
        let count:number = 0;
        for(let i = 0; i < this.std.sweepType.length; i++){
            count = this.std.sweepNumber[i];
            itemNum[i] = count.mul(num);
        }
        this.awDatas = ItemUtil.GetSThingList(itemType, itemId, itemNum);
        this.awardList.UpdateDatas(this.awDatas);
        this.numLab.string = `扫荡(${num}/${this.totalNum})次`;
    }
    private updateAwardList(item:Node, data:SThing):void{
        let awardItem:AwardItem = item.getComponent(AwardItem)||item.addComponent(AwardItem);
        awardItem.SetData({itemData:data});
    }
    private onSelect(index: number, item: Node){
        let selectData = this.awDatas[index];
        if(selectData){
            ItemTips.Show(selectData);
        }
    }
    

    private initShow():void{
        this.awDatas = ItemUtil.GetSThingList(this.std.sweepType, this.std.sweepID, this.std.sweepNumber);
        this.awardList.UpdateDatas(this.awDatas);
    }

    private updateBtnState():void{
        SetNodeGray(this.saoDangOkBtn.node, this.maxNum <= 0, false);
    }
}