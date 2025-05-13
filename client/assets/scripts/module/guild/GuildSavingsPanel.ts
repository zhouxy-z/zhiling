import { Button, Color, instantiate, Label, Layout, Node, path, Size, sp, Sprite, SpriteFrame, UITransform, Vec3 } from "cc";
import { Panel } from "../../GameRoot";
import { ConsumeItem, ConsumeNumFormatType } from "../common/ConsumeItem";
import { CfgMgr, StdGuildBank, StdGuildBankType } from "../../manager/CfgMgr";
import { ClickTipsPanel } from "../common/ClickTipsPanel";
import { ItemUtil } from "../../utils/ItemUtils";
import PlayerData, { } from "../roleModule/PlayerData"
 import {SGuildDepositTotal,SThing} from "../roleModule/PlayerStruct";
import { ResMgr } from "../../manager/ResMgr";
import { formatNumber } from "../../utils/Utils";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import { EventMgr, Evt_GuildChange } from "../../manager/EventMgr";
import { GameSet } from "../GameSet";
export class GuildSavingsPanel extends Panel {
    protected prefab: string = "prefabs/panel/guild/GuildSavingsPanel";
    private typeBg:Sprite;
    private typeIcon:Sprite;
    private savingsIconEffect:sp.Skeleton;
    private savingsTitleLab:Label;
    private principalItem:ConsumeItem;
    private savingsTotallItem:ConsumeItem;
    private timeTitleLab:Label;
    private timeLab:Label;
    private dayAwardItemTitle:Label;
    private dayAwardItem:ConsumeItem;
    private totalAwardItemTitle:Label;
    private totalAwardItem:ConsumeItem;
    private interestTitleLab:Label;
    private interestLab:Label;
    private consumeItem:ConsumeItem;
    private btn:Button;
    private downBtnCont: Node;
    private downBtn: Button;
    private btnCont:Node;
    private tempItemBtn:Node;
    private std:StdGuildBank;
    private curIndex:number;
    private total:{[key:string]:SGuildDepositTotal};
    private curSelectTotlaData:SGuildDepositTotal;
    protected onLoad(): void {
        this.typeBg = this.find("typeBg", Sprite);
        this.typeIcon = this.find("typeIcon", Sprite);
        this.savingsIconEffect = this.find("savingsIconEffect", sp.Skeleton);
        this.savingsTitleLab = this.find("savingsTitleLab",Label);
        this.principalItem = this.find("principalItem").addComponent(ConsumeItem);
        this.savingsTotallItem = this.find("totalCont/savingsTotallItem").addComponent(ConsumeItem);
        this.timeTitleLab = this.find("timeTitleLab", Label);
        this.timeLab = this.find("timeLab", Label);

        this.dayAwardItemTitle = this.node.getChildByName("dayAwardItemTitle").getComponent(Label); 
        this.dayAwardItem = this.node.getChildByName("dayAwardItem").addComponent(ConsumeItem); 
        this.totalAwardItemTitle = this.node.getChildByName("totalAwardItemTitle").getComponent(Label); 
        this.totalAwardItem = this.node.getChildByName("totalAwardItem").addComponent(ConsumeItem); 

        this.interestTitleLab = this.find("interestTitleLab", Label);
        this.interestLab = this.find("interestLab", Label);
        this.consumeItem = this.find("consumeItem").addComponent(ConsumeItem);
        this.btn = this.find("btn", Button);
        this.downBtn = this.find("downBtn", Button);
        this.downBtnCont = this.find("downBtnCont");
        this.btnCont = this.find("downBtnCont/btnCont");
        this.tempItemBtn = this.find("tempItemBtn");
        this.tempItemBtn.active = false;
        this.btn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.downBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.CloseBy("closeBtn");
        this.CloseBy("mask");
    }
    public flush(std:StdGuildBank, totlaData:{[key:string]:SGuildDepositTotal}): void{
        this.std = std;
        this.total = totlaData;
        this.curIndex = 0;
        this.showTips();
        
        this.updateSelect();
    }
    
    protected onShow(): void {
        EventMgr.on(Evt_GuildChange, this.onGuildChange, this);
        let effectName:string = "ui_Synthetic_workshop_gemstone_02";
        if (GameSet.GetServerMark() == "hc"){
            effectName = "ui_hcs";
        }else if (GameSet.GetServerMark() == "xf"){
            effectName = "ui_HCS_xf";
        }

        let effectUrl:string = path.join("spine/effect", effectName, effectName);
        ResMgr.LoadResAbSub(effectUrl, sp.SkeletonData, (res:sp.SkeletonData)=>{
            this.savingsIconEffect.skeletonData = res; 
            this.savingsIconEffect.setAnimation(0,"Idle", true);
            
        });
    }

    protected onHide(...args: any[]): void {
        EventMgr.off(Evt_GuildChange, this.onGuildChange, this);
    }
    private onGuildChange():void{
        if(!this.node.activeInHierarchy) return;
        if(!PlayerData.MyGuild){
            this.Hide();
        }
    }
    private onBtnClick(btn:Button):void{
        switch(btn){
            case this.downBtn:
                this.showTips();
                break;
            case this.btn:
                if (!ItemUtil.CheckThingConsumes([this.std.CostType[this.curIndex]], [this.std.CostId[this.curIndex]], [this.std.CostNum[this.curIndex]], true)) {
                    return;
                }
                
                Session.Send({ type: MsgTypeSend.GuildBankDeposit, 
                    data: {
                        guild_id: PlayerData.MyGuild.guild_id,
                        donate_id: this.std.DonateId.toString(),
                        cost_idx: this.curIndex,
                    } 
                });
                break;
        }
    }
    private showTips():void{
        this.downBtn.node.angle = 0;
        this.updateBtnCont();
        let btnNode:Node = this.downBtn.node;
        let btnSize:Size = btnNode.getComponent(UITransform).contentSize;
        let showPos:Vec3 = btnNode.worldPosition.clone();
        showPos.x = showPos.x - btnSize.width - this.downBtnCont.getComponent(UITransform).width * 0.5;
        showPos.y = showPos.y - btnSize.height - this.downBtnCont.getComponent(UITransform).height * 0.5;
        ClickTipsPanel.Show(this.downBtnCont, this.node, this.downBtn, showPos, 0, ()=>{
            this.downBtn.node.angle = -90;
        });
    }
    private updateBtnCont():void{
        let len:number = this.std.CostType.length;
        let maxLen = Math.max(len, this.btnCont.children.length);
        let btn:Button;
        let btnNode:Node;
        let consumeItem:ConsumeItem;
        let idx:number = 0;
        let layout:Layout = this.btnCont.getComponent(Layout);
        let totalH:number = layout.paddingTop + layout.paddingBottom;
        let itemData:SThing;
        let consumeItemList:ConsumeItem[] = [];
        let itemDataList:SThing[] = [];
        for (let index = 0; index < maxLen; index++) {
            btnNode = this.btnCont.children[index];
            if(!btnNode){
                btnNode = instantiate(this.tempItemBtn);
                btnNode.parent = this.btnCont;
            }
            btn = btnNode.getComponent(Button);
            btn.node.off(Button.EventType.CLICK, this.onDownBtnClick, this);
            if(index < len){
                itemData = ItemUtil.CreateThing(this.std.CostType[idx], this.std.CostId[idx], this.std.CostNum[idx]);
                consumeItem = btnNode.getChildByName("consumeItem").getComponent(ConsumeItem);
                if(!consumeItem) consumeItem = btnNode.getChildByName("consumeItem").addComponent(ConsumeItem);
                btnNode.active = true;
                consumeItemList.push(consumeItem);
                itemDataList.push(itemData);
                btn.node.on(Button.EventType.CLICK, this.onDownBtnClick.bind(this, idx), this);
                totalH += btnNode.getComponent(UITransform).height;
                if(idx < len) totalH += layout.spacingY;
                idx++;
            }else{
                btnNode.active = false;
                
            }
        }
        this.downBtnCont.getComponent(UITransform).height = totalH;
        this.scheduleOnce(()=>{
            let item:ConsumeItem;
            for (let index = 0; index < consumeItemList.length; index++) {
                item = consumeItemList[index];
                item.SetData(itemDataList[index]);
            }
        },0.1)
        
    }
    private onDownBtnClick(index:number):void{
        ClickTipsPanel.Hide();
        this.curIndex = index;
        this.updateSelect();
    }
    private updateSelect():void{
        let costType:number = this.std.CostType[this.curIndex];
        let costId:number = this.std.CostId[this.curIndex];
        let costNum:number = this.std.CostNum[this.curIndex];
        let itemData:SThing = ItemUtil.CreateThing(costType, costId, costNum);
        this.curSelectTotlaData = this.total[costType];
        if(!this.curSelectTotlaData){
            this.curSelectTotlaData = {
                _id:"",
                guild_id:"",
                cost_type:costType,
                total_amount:0,
                total_record:0,
            }
        }
        
        this.principalItem.SetData(itemData);
        let curNumLab:Label = this.find("consumeItem/curLab", Label);
        let numLab:Label = this.find("consumeItem/numLab", Label);
        this.consumeItem.SetData(itemData);
        numLab.string = `/${formatNumber(PlayerData.GetItemCount(itemData.item.id), 2)}`;
        curNumLab.string = `${formatNumber(itemData.resData.count, 2)}`; 
        if(ItemUtil.CheckItemIsHave(costType, costId, costNum)){
            curNumLab.color = new Color().fromHEX("#176E80");
        }else{
            curNumLab.color = new Color().fromHEX("#C53130");
        }
        let colorList:string[] = CfgMgr.GetGuildSavingsTypeColor(this.std.SavingsType);
        let principalLab:Label = this.find("principalItem/numLab", Label);
        let valColor:Color = new Color().fromHEX(colorList[1]);
        principalLab.color = valColor;
        let titleColor:Color = new Color().fromHEX(colorList[0]);
        this.dayAwardItemTitle.color = titleColor;
        this.totalAwardItemTitle.color = titleColor;

        let stdGuildBankType:StdGuildBankType = CfgMgr.GetGuildBankType(costType);

        let totalAddRate:number[] = CfgMgr.GetGuildSavingsTotalRate(this.std.DonateId, this.curSelectTotlaData.total_amount, PlayerData.GetMyGuildLimit().ID);
        let myRate:number = CfgMgr.GetGuildSavingsRate(this.std.DonateId, PlayerData.MyGuild.type, PlayerData.GetMyGuildLimit().ID);
        if(totalAddRate) myRate += totalAddRate[1];
        itemData = ItemUtil.CreateThing(stdGuildBankType.Rebate_type, costId,costNum * myRate / 100);
        this.dayAwardItem.SetData(itemData);
        let dayValueLab:Label = this.dayAwardItem.node.getChildByName("numLab").getComponent(Label);
        dayValueLab.color = valColor;

        itemData = ItemUtil.CreateThing(stdGuildBankType.Rebate_type, costId,costNum * myRate * this.std.Duration / 100);
        this.totalAwardItem.SetData(itemData);
        let totalValueLab:Label = this.totalAwardItem.node.getChildByName("numLab").getComponent(Label);
        totalValueLab.color = valColor;

        this.updateShow();
    }
    private updateShow():void{

        let itemData:SThing = ItemUtil.CreateThing(this.curSelectTotlaData.cost_type, 0, this.curSelectTotlaData.total_amount);
        this.savingsTotallItem.SetData(itemData);

        let url = path.join("sheets/guild", this.std.TypeBg, "spriteFrame");
        ResMgr.LoadResAbSub(url, SpriteFrame, res => {
            this.typeBg.spriteFrame = res;
        });
        url = path.join("sheets/guild", this.std.TypeIcon, "spriteFrame");
        ResMgr.LoadResAbSub(url, SpriteFrame, res => {
            this.typeIcon.spriteFrame = res;
        });
        this.timeLab.string = this.std.Duration.toString();

        let colorList:string[] = CfgMgr.GetGuildSavingsTypeColor(this.std.SavingsType);
        let titleColor:Color = new Color().fromHEX(colorList[0]);
        let valColor:Color = new Color().fromHEX(colorList[1]);
        this.savingsTitleLab.color = titleColor;
        this.timeTitleLab.color = titleColor;
        this.interestTitleLab.color = titleColor;
        let principalLab:Label = this.find("principalItem/numLab", Label);
        principalLab.color = valColor;
        this.timeLab.color = valColor;
        this.interestLab.color = valColor;
        this.timeLab.string = `${this.std.Duration}天`;
        let totalAddRate:number[] = CfgMgr.GetGuildSavingsTotalRate(this.std.DonateId, this.curSelectTotlaData.total_amount, PlayerData.GetMyGuildLimit().ID);
        let myRate:number = CfgMgr.GetGuildSavingsRate(this.std.DonateId, PlayerData.MyGuild.type, PlayerData.GetMyGuildLimit().ID);
        if(totalAddRate) myRate += totalAddRate[1];
        this.interestLab.string = `${formatNumber(myRate,2)}%`;
    }
    
}