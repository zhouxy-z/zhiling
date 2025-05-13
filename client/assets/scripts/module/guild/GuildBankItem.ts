import { Color, Component, Label,  path,  Sprite, SpriteFrame, Node, Button, sp} from "cc";
import { ConsumeItem } from "../common/ConsumeItem";
import { CfgMgr, StdGuildBank, StdGuildBankType, ThingType } from "../../manager/CfgMgr";
import { ResMgr } from "../../manager/ResMgr";
import { ItemUtil } from "../../utils/ItemUtils";
import PlayerData, {} from "../roleModule/PlayerData"
 import {SDeposit,SGuildDepositTotal,SThing} from "../roleModule/PlayerStruct";
import { EventMgr, Evt_GuildBankMenuShow } from "../../manager/EventMgr";
import { GameSet } from "../GameSet";

export class GuildBankItem extends Component {
    private bg:Sprite;
    private savingsIconEffect:sp.Skeleton;
    private consumeItem:ConsumeItem;
    private downBtn:Button;
    private timeTitleLab:Label;
    private timeLab:Label;
    private dayAwardItemTitle:Label;
    private dayAwardItem:ConsumeItem;
    private totalAwardItemTitle:Label;
    private totalAwardItem:ConsumeItem;
    private isInit:boolean = false;
    private data:StdGuildBank;
    private curSelectTotlaData:SGuildDepositTotal;
    private info:SDeposit;
    private total:{[key:string]:SGuildDepositTotal};
    private costIndex:number;
    private listNode:Node;

    protected onLoad(): void {
        this.bg = this.node.getChildByName("bg").getComponent(Sprite);
        this.savingsIconEffect = this.node.getChildByName("savingsIconEffect").getComponent(sp.Skeleton);
        this.consumeItem = this.node.getChildByName("consumeItem").addComponent(ConsumeItem);
        this.downBtn = this.node.getChildByName("downBtn").getComponent(Button);
        this.timeTitleLab = this.node.getChildByName("timeTitleLab").getComponent(Label);
        this.timeLab = this.node.getChildByName("timeLab").getComponent(Label); 
        this.dayAwardItemTitle = this.node.getChildByName("dayAwardItemTitle").getComponent(Label); 
        this.dayAwardItem = this.node.getChildByName("dayAwardItem").addComponent(ConsumeItem); 
        this.totalAwardItemTitle = this.node.getChildByName("totalAwardItemTitle").getComponent(Label); 
        this.totalAwardItem = this.node.getChildByName("totalAwardItem").addComponent(ConsumeItem); 
        this.downBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.isInit = true;
        
        this.updateShow();

        
    }
    private onBtnClick():void{
        this.listNode.emit("select", this.node["$$index"], this.node);
        this.downBtn.node.angle = 0;
        let itemPos = this.downBtn.node.worldPosition.clone();
        EventMgr.emit(Evt_GuildBankMenuShow, this.node, this.data, itemPos, this.downBtn.node);
    }
    SetData(info:SDeposit, data:StdGuildBank, total:{[key:string]:SGuildDepositTotal}, costIndex:number = 0, listNode:Node = null) {
        this.info = info;
        this.data = data;
        this.total = total;
        this.costIndex = costIndex;
        this.listNode = listNode;
        this.updateShow();
    }
    
    private updateShow():void{
        if(!this.isInit || !this.data) return;
        
        this.downBtn.node.angle = -90;
        let url = path.join("sheets/guild", this.data.TypeBg, "spriteFrame");
        ResMgr.LoadResAbSub(url, SpriteFrame, res => {
            this.bg.spriteFrame = res;
        });
        
        let costType:number = this.data.CostType[this.costIndex];
        let costNum:number = this.data.CostNum[this.costIndex];
        let effectName:string;
        if(costType == ThingType.ThingTypeCurrency){
            effectName = "ui_Synthetic_workshop_gemstone_02";
            if (GameSet.GetServerMark() == "hc"){
                effectName = "ui_hcs";
            }else if (GameSet.GetServerMark() == "xf"){
                effectName = "ui_HCS_xf";
            }
        }else{
            if (GameSet.GetServerMark() != "xf"){
                effectName = "ui_HuiYao";
            }else{
                effectName = "ui_HuiYao_xf";
            }
            
        }
        
        

        let effectUrl:string = path.join("spine/effect", effectName, effectName);
        ResMgr.LoadResAbSub(effectUrl, sp.SkeletonData, (res:sp.SkeletonData)=>{
            this.savingsIconEffect.skeletonData = res; 
            this.savingsIconEffect.setAnimation(0,"Idle", true);
            
        });

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
        let itemData:SThing = ItemUtil.CreateThing(costType,0,costNum);
        this.consumeItem.SetData(itemData);
        let colorList:string[] = CfgMgr.GetGuildSavingsTypeColor(this.data.SavingsType);
        let titleOutlineColor:Color = new Color().fromHEX(colorList[0]);
        let valColor:Color = new Color().fromHEX(colorList[1]);
        let valOutlineColor:Color = new Color().fromHEX(colorList[2]);
        this.timeTitleLab.outlineColor = titleOutlineColor;
        this.timeLab.outlineColor = valOutlineColor;
        this.timeLab.color = valColor;
        this.dayAwardItemTitle.outlineColor = titleOutlineColor;
        this.totalAwardItemTitle.outlineColor = titleOutlineColor;
        
        
        this.timeLab.string = `${this.data.Duration}天`;
        let stdGuildBankType:StdGuildBankType = CfgMgr.GetGuildBankType(costType);
        
        let totalAddRate:number[] = CfgMgr.GetGuildSavingsTotalRate(this.data.DonateId, this.curSelectTotlaData.total_amount, PlayerData.GetMyGuildLimit().ID);
        let myRate:number = CfgMgr.GetGuildSavingsRate(this.data.DonateId, PlayerData.MyGuild.type, PlayerData.GetMyGuildLimit().ID);
        if(totalAddRate) myRate += totalAddRate[1];

        itemData = ItemUtil.CreateThing(stdGuildBankType.Rebate_type, 0,costNum * myRate / 100);
        this.dayAwardItem.SetData(itemData);
        let dayValueLab:Label = this.dayAwardItem.node.getChildByName("numLab").getComponent(Label);
        dayValueLab.color = valColor;
        dayValueLab.outlineColor = valOutlineColor;

        itemData = ItemUtil.CreateThing(stdGuildBankType.Rebate_type, 0,costNum * myRate * this.data.Duration / 100);
        this.totalAwardItem.SetData(itemData);
        let totalValueLab:Label = this.totalAwardItem.node.getChildByName("numLab").getComponent(Label);
        totalValueLab.color = valColor;
        totalValueLab.outlineColor = valOutlineColor
    }
    
    
}