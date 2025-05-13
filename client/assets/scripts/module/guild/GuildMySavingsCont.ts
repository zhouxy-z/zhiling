import { Component, Label, RichText, Node, Color, Button } from "cc";
import { ConsumeItem } from "../common/ConsumeItem";
import { CfgMgr, StdGuildBank, StdGuildBankType, StdGuildRole } from "../../manager/CfgMgr";
import PlayerData, {} from "../roleModule/PlayerData"
 import {SDeposit,SGuildDepositTotal,SThing} from "../roleModule/PlayerStruct";
import { DateUtils } from "../../utils/DateUtils";
import { ItemUtil } from "../../utils/ItemUtils";
import { formatNumber } from "../../utils/Utils";

export class GuildMySavingsCont extends Component {
    private postCont:Node;
    private addCont:Node;
    private totalInterestLab:RichText;
    private nextInterestTitleLab:Label;
    private principalItem:ConsumeItem;
    private interestLab:Label;
    private timeLab:Label;
    private dayInterestlItem:ConsumeItem;
    private leftBtn:Button;
    private rightBtn:Button;
    private stdGuildBank:StdGuildBank;
    private totalsMap:{[key:string]:SGuildDepositTotal};
    private curDeposit:SGuildDepositTotal;
    private info:SDeposit;
    private isInit:boolean = false;
    private curIndex:number = 0;
    protected onLoad(): void {
        this.postCont = this.node.getChildByName("postCont");
        this.addCont = this.node.getChildByPath("postCont/addCont");
        this.nextInterestTitleLab = this.node.getChildByPath("postCont/topCont/nextInterestTitleLab").getComponent(Label);
        this.totalInterestLab = this.node.getChildByPath("postCont/totalInterestLab").getComponent(RichText);
        this.principalItem = this.node.getChildByName("principalItem").addComponent(ConsumeItem);
        this.interestLab = this.node.getChildByName("interestLab").getComponent(Label);
        this.timeLab = this.node.getChildByName("timeLab").getComponent(Label);
        this.dayInterestlItem = this.node.getChildByName("dayInterestlItem").addComponent(ConsumeItem);
        this.leftBtn = this.node.getChildByName("leftBtn").getComponent(Button);
        this.rightBtn = this.node.getChildByName("rightBtn").getComponent(Button);
        this.leftBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.rightBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.isInit = true;
        this.updateShow();
    }
    protected update(dt: number): void {
        if(this.info){
            let residueTime:number = Math.max(Math.floor(this.info.expiration_time - PlayerData.GetServerTime()), 0);
            if(residueTime > 86400){
                this.timeLab.string = DateUtils.FormatTime(residueTime, "%{d}天%{hh}:%{mm}:%{ss}");
            }else{
                this.timeLab.string = DateUtils.FormatTime(residueTime, "%{hh}:%{mm}:%{ss}");
            }
        }
    }
    private onBtnClick(btn:Button):void{
        switch(btn){
            case this.leftBtn:
                if(this.curIndex < 1){
                    return;
                }
                this.curIndex --;
                break;
            case this.rightBtn:
                if(this.curIndex >= 1){
                    return;
                }
                this.curIndex ++;
                break;
        }
        this.changeIndex();
    }
    private changeIndex(isChange:boolean = false):void{
        this.leftBtn.node.active = this.curIndex > 0;
        this.rightBtn.node.active = this.curIndex < 0;
       
    }
    SetData(info:SDeposit, totalsMap:{[key:string]:SGuildDepositTotal}):void{
        this.info = info;
        this.totalsMap = totalsMap;
        this.curIndex = 0;
        this.changeIndex();
        this.updateShow();
    }
    private updateShow():void{
        if(!this.isInit || !this.info) return;
        this.stdGuildBank = CfgMgr.GetGuildSavings(Number(this.info.donate_id));
        this.curDeposit = this.totalsMap[this.info.cost_type];
        if(!this.curDeposit){
            this.curDeposit = {
                _id:"",
                guild_id:"",
                cost_type:this.info.cost_type,
                total_amount:0,
                total_record:0,
            }
            this.totalsMap[this.info.cost_type] = this.curDeposit;
        }
        let itemData:SThing;
        itemData = ItemUtil.CreateThing(this.info.cost_type,0, this.info.amount);
        this.principalItem.SetData(itemData);
        this.postCont.active = false;
        let totalAddRate:number[] = CfgMgr.GetGuildSavingsTotalRate(this.stdGuildBank.DonateId, this.curDeposit.total_amount, PlayerData.GetMyGuildLimit().ID);
        let nextTotalAddRate:number[] = CfgMgr.GetGuildSavingsTotalRate(this.stdGuildBank.DonateId, this.curDeposit.total_amount, PlayerData.GetMyGuildLimit().ID, true);
        if(totalAddRate){
            this.postCont.active = true;
            let stdGuildRoleList:StdGuildRole[] = CfgMgr.GetGuildRoleList();
            let stdGuildRole:StdGuildRole;
            let titleLba:Label;
            let valueLab:Label;
            let nextValue:Label;
            let postNode:Node;
            let addRate:number;
            for (let index = 0; index < stdGuildRoleList.length; index++) {
                stdGuildRole = stdGuildRoleList[index];
                postNode = this.addCont.getChildByName(`post_${stdGuildRole.ID}`);
                if(postNode){
                    if(this.stdGuildBank.TotalRebateRole.indexOf(stdGuildRole.ID) > -1){
                        postNode.active = true;
                        titleLba = postNode.getChildByName("titleLab").getComponent(Label);
                        valueLab = postNode.getChildByName("valueLab").getComponent(Label);
                        nextValue = postNode.getChildByName("nextValueLab").getComponent(Label);
                        titleLba.string = stdGuildRole.Name;
                        addRate = CfgMgr.GetGuildSavingsRate(this.stdGuildBank.DonateId, PlayerData.MyGuild.type, stdGuildRole.ID);
                        valueLab.string = `${formatNumber(addRate + totalAddRate[1],2)}%`;
                        if(nextTotalAddRate){
                            nextValue.string = `${formatNumber(addRate + nextTotalAddRate[1],2)}%`;
                        }else{
                            nextValue.string = `--%`;
                        }
                    }else{
                        postNode.active = false;
                    }
                }
                
            }
        }
        let myRate:number = CfgMgr.GetGuildSavingsRate(this.stdGuildBank.DonateId, PlayerData.MyGuild.type, PlayerData.GetMyGuildLimit().ID);
        if(totalAddRate) myRate += totalAddRate[1];
        this.interestLab.string = `${formatNumber(myRate,2)}%`;

        let stdGuildBankType:StdGuildBankType = CfgMgr.GetGuildBankType(this.info.cost_type);
        let dayVal:number = this.info.amount * myRate / 100;
        itemData = ItemUtil.CreateThing(stdGuildBankType.Rebate_type, 0, dayVal);
        this.dayInterestlItem.SetData(itemData);

        if(!nextTotalAddRate){
            this.nextInterestTitleLab.color = new Color().fromHEX("#FF4931");
            this.nextInterestTitleLab.string = "已达最大值";
            this.totalInterestLab.string = `总额达到 <color=#FF4931>--</color> 开启下一阶段利息`;
        }else{
            this.nextInterestTitleLab.color = new Color().fromHEX("#8DFE3B");
            this.nextInterestTitleLab.string = "下一阶段利息";
            this.totalInterestLab.string = `总额达到 <color=#FF4931>${totalAddRate[0]}</color> 开启下一阶段利息`;
        }
        
    }
}