import { Button, Color, instantiate, Label, Layout, Node, path, sp, Sprite, SpriteFrame, v3, Vec3} from "cc";
import { Panel } from "../../GameRoot";
import { CfgMgr, StdGuildBank, StdGuildBankType, StdGuildRole } from "../../manager/CfgMgr";
import PlayerData, {} from "../roleModule/PlayerData"
 import {SDeposit,SGuildDepositTotal,SThing} from "../roleModule/PlayerStruct";
import { formatNumber } from "../../utils/Utils";
import { ConsumeItem } from "../common/ConsumeItem";
import { EventMgr, Evt_GuildBankUpdate, Evt_GuildChange } from "../../manager/EventMgr";
import { ItemUtil } from "../../utils/ItemUtils";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import { GuildMySavingsCont } from "./GuildMySavingsCont";
import { GuildBankSelectPanel } from "./GuildBankSelectPanel";
import { GuildSavingsInfoPanel } from "./GuildSavingsInfoPanel";
import { GameSet } from "../GameSet";
import { ResMgr } from "../../manager/ResMgr";
import { SetNodeGray } from "../common/BaseUI";

export class GuildBankPanel extends Panel {
    protected prefab: string = "prefabs/panel/guild/GuildBankPanel";
    private topBg:Sprite;
    private noSavings:Node;
    private savingsIcon:Sprite;
    private savingsIconEffect:sp.Skeleton;
    private tempSavingsItem:Node;
    private savingsCont:Node;
    private mySavingsInfoBtn:Button;
    private curInterestNumLab:Label;
    private savingsNumLab:Label;
    private helpBtn:Button;
    private noSavingsCont:Node;
    private mySavingsCont:GuildMySavingsCont;
    private btn:Button;
    private leftBtn:Button;
    private rightBtn:Button;
    private infoList:SDeposit[] = [];
    private totalsMap:{[key:string]:SGuildDepositTotal};
    private curDeposit:SGuildDepositTotal;
    private info:SDeposit = null;
    private std: StdGuildBank;
    private curIndex:number;
    protected onLoad(): void {
        this.topBg = this.find("topBg", Sprite);
        this.tempSavingsItem = this.find("tempSavingsItem");
        this.savingsCont = this.find("savingsCont/savingsCont");
        this.curInterestNumLab = this.find("guildSavingsCont/curInterestNumLab", Label);
        this.mySavingsInfoBtn = this.find("mySavingsInfoBtn", Button);
        this.helpBtn = this.find("guildSavingsCont/helpBtn", Button);
        this.savingsNumLab = this.find("savingsNumLab", Label);
        this.noSavingsCont = this.find("noSavingsCont");
        this.mySavingsCont = this.find("mySavingsCont").addComponent(GuildMySavingsCont);
        this.noSavings = this.find("mySavingsCont/noSavings");
        this.savingsIcon = this.find("mySavingsCont/savingsIcon", Sprite);
        this.savingsIconEffect = this.find("mySavingsCont/savingsIconEffect", sp.Skeleton);
        this.btn = this.find("btn", Button);
        this.leftBtn = this.find("leftBtn", Button);
        this.rightBtn = this.find("rightBtn", Button);
        this.helpBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.mySavingsInfoBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.btn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.leftBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.rightBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.CloseBy("closeBtn");
        this.CloseBy("mask");
    }
    
    public flush(): void{
        
    }
    
    protected onShow(): void {
        this.info = null;
        this.infoList = [];
        this.curIndex = 0;
        this.totalsMap = {};
        let name:string = "topBg";
        if(GameSet.GetServerMark() == "hc" ){
            name = "topBg_hc";
        }else if(GameSet.GetServerMark() == "xf" ){
            name = "topBg_xf";
        }
        let topBGUrl = path.join("sheets/guild/", name, "spriteFrame");
        ResMgr.LoadResAbSub(topBGUrl, SpriteFrame, res => {
            this.topBg.spriteFrame = res;
        });
        this.updateShow();
        EventMgr.on(Evt_GuildChange, this.onGuildChange, this);
        EventMgr.on(Evt_GuildBankUpdate, this.onBankUpdate, this);
        Session.Send({ type: MsgTypeSend.GuildBankGetDepositInfos, 
            data: {
                guild_id: PlayerData.MyGuild.guild_id,
            } 
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
    }

    protected onHide(...args: any[]): void {
        EventMgr.off(Evt_GuildChange, this.onGuildChange, this);
        EventMgr.off(Evt_GuildBankUpdate, this.onBankUpdate, this);
    }
    private onGuildChange():void{
        if(!this.node.activeInHierarchy) return;
        if(!PlayerData.MyGuild){
            this.Hide();
        }
    }
    private onBankUpdate(list:SDeposit[], totalsMap:{[key:string]:SGuildDepositTotal}):void{
        list.sort((a:SDeposit, b:SDeposit)=>{
            return b.deposit_time - a.deposit_time;
        });
        this.infoList = list;
        this.totalsMap = totalsMap || {};
        this.curIndex = 0;
        this.updateShow();
    }
    private onBtnClick(btn:Button):void{
        switch(btn){
            case this.helpBtn:
                Session.Send({ type: MsgTypeSend.GuildBankGetDonateDeposits, 
                    data: {
                        guild_id: PlayerData.MyGuild.guild_id,
                        donate_id: "",//this.stdGuildBank.DonateId.toString(),
                    } 
                });
                break;
            case this.mySavingsInfoBtn:
                GuildSavingsInfoPanel.Show(this.infoList, this.totalsMap);
                break;
            case this.btn:
                GuildBankSelectPanel.Show(this.info, this.totalsMap);
                break;
            case this.leftBtn:
                if(this.curIndex > 0){
                    this.curIndex --;
                    this.updateShow();
                }
                break;
            case this.rightBtn:
                if(this.curIndex < this.infoList.length - 1){
                    this.curIndex++;
                    this.updateShow();
                }
                break;
        }
    }
    private updateShow():void{
        this.info = this.infoList[this.curIndex] || null;
        
        this.std = null;
        if(this.infoList.length > 0){
            this.leftBtn.node.active = true;
            this.rightBtn.node.active = true;
            SetNodeGray(this.leftBtn.node, this.curIndex < 1, true);
            SetNodeGray(this.rightBtn.node, this.curIndex >= this.infoList.length - 1, true);
        }else{

            this.leftBtn.node.active = false;
            this.rightBtn.node.active = false;
        }
        if(this.info){
            this.noSavings.active = false;
            this.savingsIcon.node.active = true;
            this.std = CfgMgr.GetGuildSavings(Number(this.info.donate_id));
            this.noSavingsCont.active = false;
            this.mySavingsCont.node.active = true;
            this.mySavingsCont.SetData(this.info, this.totalsMap);
            let typeIconUrl = path.join("sheets/guild/", this.std.TypeIcon, "spriteFrame");
            ResMgr.LoadResAbSub(typeIconUrl, SpriteFrame, res => {
                this.savingsIcon.spriteFrame = res;
            });
            this.savingsIconEffect.node.position = new Vec3(12,10,0);
        }else{
            this.savingsIconEffect.node.position = new Vec3(12,80,0);
            this.noSavings.active = true;
            this.savingsIcon.node.active = false;
            this.noSavingsCont.active = true;
            this.mySavingsCont.node.active = false;
        }
        this.savingsNumLab.string = `${this.infoList.length}/${CfgMgr.GetGuildComm().BackDonateMaxCount}`;
        let totalRecord:number = 0;
        let deposit:SGuildDepositTotal;
        let bankTypeList:StdGuildBankType [] = CfgMgr.GetGuildBankTypeList();
        for (const key in this.totalsMap) {
            deposit = this.totalsMap[key];
            totalRecord += deposit.total_record;
        }
        let len:number = bankTypeList.length;
        let maxLen = Math.max(len, this.savingsCont.children.length);
        let typeItemNode:Node;
        let typeItemCom:ConsumeItem;
        let bankType:StdGuildBankType 
        for (let index = 0; index < maxLen; index++) {
            typeItemNode = this.savingsCont.children[index];
            if(!typeItemNode){
                typeItemNode = instantiate(this.tempSavingsItem);
                typeItemNode.position = new Vec3(0,0,0);
                typeItemNode.parent = this.savingsCont;
            }
            if(index < len){
                bankType = bankTypeList[index];
                deposit = this.totalsMap[bankType.CostType];
                typeItemNode.active = true;
                
                typeItemCom = typeItemNode.getComponent(ConsumeItem) || typeItemNode.addComponent(ConsumeItem);
                typeItemCom.SetData(ItemUtil.CreateThing(bankType.CostType,0,deposit ? deposit.total_amount : 0));
                this.savingsCont.getComponent(Layout).updateLayout();
            }else{
                typeItemNode.active = false;
            }
        }
        this.curInterestNumLab.string = `${totalRecord}笔`;
    }
    
}