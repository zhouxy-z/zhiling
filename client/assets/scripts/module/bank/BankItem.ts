import { Color, Component, Label,  path,  Sprite, SpriteFrame, Node, Button, sp, Vec3} from "cc";
import { ConsumeItem } from "../common/ConsumeItem";
import {CfgMgr, StdBank} from "../../manager/CfgMgr";
import { ResMgr } from "../../manager/ResMgr";
import { EventMgr, Evt_GuildBankMenuShow } from "../../manager/EventMgr";
import { SBankTotal, SThing } from "../roleModule/PlayerStruct";
import { ItemUtil } from "../../utils/ItemUtils";
import { BankBackInfoPanel } from "./BankBackInfoPanel";
import { GameSet } from "../GameSet";

export class BankItem extends Component {
    private bg:Sprite;
    private titleImg:Sprite;
    private boxIcon:Sprite;
    private dayTitle:Sprite;
    private savingsTitleLab:Label;
    private backGetTitleLab:Label;
    private consumeItem:ConsumeItem;
    private backGetItem:ConsumeItem;
    private helpBtn:Button;
    private numTitleLab:Label;
    private numLab:Label;
    private isInit:boolean = false;
    private std:StdBank;
    private total:{[key:string]:SBankTotal};
    protected onLoad(): void {
        this.bg = this.node.getChildByName("bg").getComponent(Sprite);
        this.titleImg = this.node.getChildByName("titleImg").getComponent(Sprite);
        this.boxIcon = this.node.getChildByName("boxIcon").getComponent(Sprite);
        this.dayTitle = this.node.getChildByName("dayTitle").getComponent(Sprite);
        this.savingsTitleLab = this.node.getChildByName("savingsTitleLab").getComponent(Label);
        this.backGetTitleLab = this.node.getChildByName("backGetTitleLab").getComponent(Label);
        this.consumeItem = this.node.getChildByName("consumeItem").addComponent(ConsumeItem);
        this.backGetItem = this.node.getChildByName("backGetItem").addComponent(ConsumeItem);
        this.helpBtn = this.node.getChildByName("helpBtn").getComponent(Button);
        this.numTitleLab = this.node.getChildByName("numTitleLab").getComponent(Label);
        this.numLab = this.node.getChildByName("numLab").getComponent(Label);
        this.helpBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.isInit = true;
        this.updateShow(); 
    }
    private onBtnClick(btn:Button):void{
        switch(btn){
            case this.helpBtn:
                BankBackInfoPanel.Show(this.std);
                break;
        }
    }
    SetData(std:StdBank, total:{[key:string]:SBankTotal}) {
        this.std = std;
        this.total = total;
        this.updateShow();
    }
    
    private updateShow():void{
        if(!this.isInit || !this.std) return;
        let url = path.join("sheets/bank", `itemBg_${this.std.SavingsType}`, "spriteFrame");
        ResMgr.LoadResAbSub(url, SpriteFrame, res => {
            this.bg.spriteFrame = res;
        });

        url = path.join("sheets/bank", `typeTitle_${this.std.SavingsType}`, "spriteFrame");
        ResMgr.LoadResAbSub(url, SpriteFrame, (res:SpriteFrame)=>{
            this.titleImg.spriteFrame = res;
        });
        
        url = path.join("sheets/bank", `dayTitle_${this.std.SavingsType}`, "spriteFrame");
        ResMgr.LoadResAbSub(url, SpriteFrame, (res:SpriteFrame)=>{
            this.dayTitle.spriteFrame = res;
        });

        let boxName:string = "box_";
        if (GameSet.GetServerMark() == "hc"){
            boxName = "box_hc_";
        }else if (GameSet.GetServerMark() == "xf"){
            boxName = "box_xf_";
        }
        boxName += this.std.SavingsType;
        let boxUrl = path.join("sheets/bank", boxName, "spriteFrame");
        ResMgr.LoadResAbSub(boxUrl, SpriteFrame, (res:SpriteFrame)=>{
            this.boxIcon.spriteFrame = res;
        });
        let itemData:SThing = ItemUtil.CreateThing(this.std.CostType, this.std.CostId, this.std.CostNum);
        this.consumeItem.SetData(itemData);

        itemData = ItemUtil.CreateThing(this.std.CostType, this.std.CostId, CfgMgr.GetBankBackNum(this.std));
        this.backGetItem.SetData(itemData);

        let tota:SBankTotal = this.total[this.std.DonateId];
        let curNum:number = tota ? tota.total_record : 0;
        this.numLab.string = `${curNum}/${this.std.CostTimes}`;

        let colorList:string[] = CfgMgr.GetSavingsTypeColor(this.std.SavingsType);
        let titleOutlineColor:Color = new Color().fromHEX(colorList[0]);
        let numColor:Color = new Color().fromHEX(colorList[1]);
        this.savingsTitleLab.outlineColor = titleOutlineColor;
        this.backGetTitleLab.outlineColor = titleOutlineColor;
        this.numTitleLab.color = numColor;
        this.numLab.color = numColor;
        this.setPos();
    }
    private setPos():void{
        if(this.std.SavingsType == 2){
            this.titleImg.node.position = new Vec3(-356, 106, 0);
            this.boxIcon.node.position = new Vec3(378, 4, 0);
            this.dayTitle.node.position = new Vec3(128, 98, 0);
            this.savingsTitleLab.node.position = new Vec3(-486, 30, 0);
            this.backGetTitleLab.node.position = new Vec3(-490, -36, 0);
            this.consumeItem.node.position = new Vec3(-224, 30, 0);
            this.backGetItem.node.position = new Vec3(-224, -36, 0);
            this.helpBtn.node.position = new Vec3(48, -36, 0);
        }else{
            this.titleImg.node.position = new Vec3(356, 106, 0);
            this.boxIcon.node.position = new Vec3(-378, 4, 0);
            this.dayTitle.node.position = new Vec3(-128, 98, 0);
            this.savingsTitleLab.node.position = new Vec3(82, 30, 0);
            this.backGetTitleLab.node.position = new Vec3(0, -36, 0);
            this.consumeItem.node.position = new Vec3(260, 30, 0);
            this.backGetItem.node.position = new Vec3(260, -36, 0);
            this.helpBtn.node.position = new Vec3(478, -36, 0);
        }
    }
    
}