import {Node, Button, Label, sp, Sprite, path, js, SpriteFrame } from "cc";
import { Panel } from "../../GameRoot";
import { ConsumeItem } from "../common/ConsumeItem";
import { GameSet } from "../GameSet";
import { ResMgr } from "../../manager/ResMgr";
import { EventMgr, Evt_BankUpdate, Evt_Hide_Scene, Evt_Show_Scene } from "../../manager/EventMgr";
import {BankSelectPanel } from "./BankSelectPanel";
import { SBank, SBankTotal, SThing } from "../roleModule/PlayerStruct";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import PlayerData from "../roleModule/PlayerData";
import { CfgMgr, StdBank } from "../../manager/CfgMgr";
import { SetNodeGray } from "../common/BaseUI";
import { BankSavingsInfoPanel } from "./BankSavingsInfoPanel";
import { ItemUtil } from "../../utils/ItemUtils";
import { formatNumber } from "../../utils/Utils";
import { DateUtils } from "../../utils/DateUtils";
import { BankBackInfoPanel } from "./BankBackInfoPanel";

export class BankPanel extends Panel {
    protected prefab: string = "prefabs/panel/bank/BankPanel";
    private topBg:Sprite;
    private savingsIconEffect:sp.Skeleton;
    private totalNumLab:Label;
    private boxIcon:Sprite;
    private boxTitle:Sprite;
    private helpBtn:Button;
    private numLab:Label;
    private noSavingsCont:Node;
    private mySavingsCont:Node;
    private principalItem:ConsumeItem;
    private backGetItem:ConsumeItem;
    private dayGetItem:ConsumeItem;
    private timeLab:Label;
    private backGetHelpBtn:Button;
    private leftBtn:Button;
    private rightBtn:Button;
    private btn:Button;
    private curIndex:number;
    private curBank:SBank = null;
    private datas:SBank[];
    private std:StdBank;
    private total:{[key:string]:SBankTotal};
    protected onLoad(): void {
        this.topBg = this.find("bgCont/topBg", Sprite);
        this.savingsIconEffect = this.find("savingsIconEffect", sp.Skeleton);
        this.totalNumLab = this.find("totalNumLab", Label);
        this.boxIcon = this.find("boxIcon", Sprite);
        this.boxTitle = this.find("boxTitle", Sprite);
        this.helpBtn = this.find("helpBtn", Button);
        this.numLab = this.find("numLab", Label);
        this.noSavingsCont = this.find("noSavingsCont");
        this.mySavingsCont = this.find("mySavingsCont");
        this.principalItem = this.find("mySavingsCont/principalItem").addComponent(ConsumeItem);
        this.backGetItem = this.find("mySavingsCont/backGetItem").addComponent(ConsumeItem);
        this.dayGetItem = this.find("mySavingsCont/dayGetItem").addComponent(ConsumeItem);
        this.backGetHelpBtn = this.find("mySavingsCont/backGetHelpBtn", Button);
        this.timeLab = this.find("mySavingsCont/timeCont/timeLab", Label);
        this.leftBtn = this.find("mySavingsCont/leftBtn", Button);
        this.rightBtn = this.find("mySavingsCont/rightBtn", Button);
        
        this.btn = this.find("btn", Button);
        
        this.helpBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.backGetHelpBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.btn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.leftBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.rightBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.CloseBy("backBtn");
    }
    protected update(dt: number): void {
        if(this.curBank){
            let residueTime:number = Math.max(Math.floor(this.curBank.expiration_time - PlayerData.GetServerTime()), 0);
            if(residueTime > 86400){
                this.timeLab.string = DateUtils.FormatTime(residueTime, "%{d}天%{hh}:%{mm}:%{ss}");
            }else{
                this.timeLab.string = DateUtils.FormatTime(residueTime, "%{hh}:%{mm}:%{ss}");
            }
        }else{
            this.timeLab.string = "";
        }
    }
    public flush(): void{
        
    }
    
    protected onShow(): void {
        EventMgr.emit(Evt_Hide_Scene, js.getClassName(this));

        let name:string = "topBg";
        if (GameSet.GetServerMark() == "hc"){
            name = "topBg_hc";
        }else if (GameSet.GetServerMark() == "xf"){
            name = "topBg_xf";
        }

        let topBGUrl = path.join("sheets/bank/", name, "spriteFrame");
        ResMgr.LoadResAbSub(topBGUrl, SpriteFrame, res => {
            this.topBg.spriteFrame = res;
        });

        let effectName:string = "ui_Synthetic_workshop_gemstone_02";
        if (GameSet.GetServerMark() == "hc"){
            effectName = "ui_hcs";
        }else if (GameSet.GetServerMark() == "xf"){
            effectName = "ui_HCS_xf";
        }

        let url:string = path.join("spine/effect", effectName, effectName);
        ResMgr.LoadResAbSub(url, sp.SkeletonData, (res:sp.SkeletonData)=>{
            this.savingsIconEffect.skeletonData = res; 
            this.savingsIconEffect.setAnimation(0,"Idle", true);
            
        });
        EventMgr.on(Evt_BankUpdate, this.onUpdateBank, this);
        this.curBank = null;
        this.curIndex = 0;
        this.datas = [];
        this.total = {};
        this.updateShow();
        Session.Send({ type: MsgTypeSend.FlexibleBankGetDepositInfos, 
            data: {
                
            } 
        });
    }

    protected onHide(...args: any[]): void {
       EventMgr.emit(Evt_Show_Scene, js.getClassByName(this));
       EventMgr.off(Evt_BankUpdate, this.onUpdateBank, this);
    }
    private onUpdateBank(list:SBank[], total:{[key:string]:SBankTotal}):void{
        list.sort((a:SBank, b:SBank)=>{
            return b.deposit_time - a.deposit_time;
        });
        this.datas = list;
        this.total = total || {};
        this.curIndex = 0;
        this.updateShow();
    }
    private onBtnClick(btn:Button):void{
        switch(btn){
            case this.helpBtn:
                BankSavingsInfoPanel.Show(this.datas);
                break;
            case this.backGetHelpBtn:
                BankBackInfoPanel.Show(this.std, this.curBank);
                break;
            case this.btn:
                BankSelectPanel.Show(this.total);
                break;
            case this.leftBtn:
                if(this.curIndex > 0){
                    this.curIndex --;
                    this.updateShow();
                }
                break;
            case this.rightBtn:
                if(this.curIndex < this.datas.length - 1){
                    this.curIndex++;
                    this.updateShow();
                }
                break;
        }
    }
    private updateShow():void{
        this.curBank = this.datas[this.curIndex] || null;
        
        this.std = null;
        if(this.datas.length > 0){
            this.leftBtn.node.active = true;
            this.rightBtn.node.active = true;
            SetNodeGray(this.leftBtn.node, this.curIndex < 1, true);
            SetNodeGray(this.rightBtn.node, this.curIndex >= this.datas.length - 1, true);
        }else{
            
            this.leftBtn.node.active = false;
            this.rightBtn.node.active = false;
        }
        let boxName:string = "box_";
        if (GameSet.GetServerMark() == "hc"){
            boxName = "box_hc_";
        }else if (GameSet.GetServerMark() == "xf"){
            boxName = "box_xf_";
        }
        if(this.curBank){
            this.boxTitle.node.active = true;
            this.noSavingsCont.active = false;
            this.std = CfgMgr.GetBank(Number(this.curBank.donate_id));
            boxName += this.std.SavingsType;
            let url = path.join("sheets/bank", `typeTitle_${this.std.SavingsType}`, "spriteFrame");
            ResMgr.LoadResAbSub(url, SpriteFrame, (res:SpriteFrame)=>{
                this.boxTitle.spriteFrame = res;
            });
            this.noSavingsCont.active = false;
            this.mySavingsCont.active = true;
            let itemData:SThing;
            itemData = ItemUtil.CreateThing(this.std.CostType,this.std.CostId, this.std.CostNum);
            this.principalItem.SetData(itemData);

            itemData = ItemUtil.CreateThing(this.std.CostType, this.std.CostId, CfgMgr.GetBankBackNum(this.std));
            this.backGetItem.SetData(itemData);

            itemData = ItemUtil.CreateThing(this.std.CostType, this.std.CostId, CfgMgr.GetBankDayBackNum(this.std, this.curBank.settle_days));
            this.dayGetItem.SetData(itemData);
        }else{
            boxName += 1;
            this.boxTitle.node.active = false;
            this.noSavingsCont.active = true;
            this.noSavingsCont.active = true;
            this.mySavingsCont.active = false;
        }
        let boxUrl = path.join("sheets/bank", boxName, "spriteFrame");
        ResMgr.LoadResAbSub(boxUrl, SpriteFrame, (res:SpriteFrame)=>{
            this.boxIcon.spriteFrame = res;
        });
        this.numLab.string = `${this.datas.length}/${CfgMgr.GetBankMaxSavingsCount()}`;
        let totalNum:number = 0;
        let tota:SBankTotal;
        for (let key in this.total) {
            tota = this.total[key];
            totalNum = totalNum.add(tota.total_amount);
        }
        this.totalNumLab.string = formatNumber(totalNum, 2);
    }
    
}