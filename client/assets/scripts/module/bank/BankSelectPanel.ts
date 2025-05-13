import { Node, Button, Label, sp, Sprite, js, path, RichText, SpriteFrame } from "cc";
import { Panel } from "../../GameRoot";
import { ConsumeItem } from "../common/ConsumeItem";
import { AutoScroller } from "../../utils/AutoScroller";
import { ClickTipsPanel } from "../common/ClickTipsPanel";
import { CfgMgr, StdBank, ThingType } from "../../manager/CfgMgr";
import { BankItem } from "./BankItem";
import { GameSet } from "../GameSet";
import { ResMgr } from "../../manager/ResMgr";
import { ItemUtil } from "../../utils/ItemUtils";
import { formatNumber } from "../../utils/Utils";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import { MsgPanel } from "../common/MsgPanel";
import { SBank, SBankTotal } from "../roleModule/PlayerStruct";

export class BankSelectPanel extends Panel {
    protected prefab: string = "prefabs/panel/bank/BankSelectPanel";
    private topBg:Sprite;
    private savingsIconEffect:sp.Skeleton;
    private totalNumLab:Label;
    private list:AutoScroller;
    private haveItem:ConsumeItem;
    private okBtn:Button;
    private curSelectIndex:number = -1;
    private stdList:StdBank[];
    private curSelectStd:StdBank;
    private total:{[key:string]:SBankTotal};
    protected onLoad(): void {
        this.stdList = CfgMgr.GetBankList();
        this.topBg = this.find("topBg",Sprite);
        this.savingsIconEffect = this.find("effectNode/savingsIconEffect", sp.Skeleton);
        this.totalNumLab = this.find("totalNumLab", Label);
        this.list = this.find("list", AutoScroller);
        this.list.SetHandle(this.updateBankItem.bind(this));
        this.list.node.on('select', this.onBankSelect, this);
        this.haveItem = this.find("bottomCont/haveItem").addComponent(ConsumeItem);
        this.okBtn = this.find("bottomCont/okBtn", Button);
        this.okBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.CloseBy("backBtn");
        
    }
    public flush(total:{[key:string]:SBankTotal}): void{
        this.total = total;
        let totalNum:number = 0;
        let tota:SBankTotal;
        for (let key in this.total) {
            tota = this.total[key];
            totalNum = totalNum.add(tota.total_amount);
        }
        this.totalNumLab.string = formatNumber(totalNum, 2);
        if(this.curSelectIndex < 0) this.curSelectIndex = 0; 
        this.list.UpdateDatas(this.stdList);
        this.curSelectStd = this.stdList[this.curSelectIndex];
        this.updateHaveItem();
    }
    
    protected onShow(): void {

        let name:string = "topBg";
        if(GameSet.GetServerMark() == "hc"){
            name = "topBg_hc";
        }else if(GameSet.GetServerMark() == "xf" ){
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

    }

    protected onHide(...args: any[]): void {
      
       
    }
   
    private onBtnClick(btn:Button):void{
        switch(btn){
            case this.okBtn:
                if(!this.curSelectStd) {
                    MsgPanel.Show("请先选择储蓄项目");
                    break;
                }
                //let curLv:number = 
                if(!ItemUtil.CheckThingConsumes([this.curSelectStd.CostType], [this.curSelectStd.CostId], [this.curSelectStd.CostNum], true)){
                    return;
                }
                Session.Send({ type: MsgTypeSend.FlexibleBankDeposit, 
                    data: {
                        donate_id: this.curSelectStd.DonateId.toString(),
                    } 
                });
                break;
        }
    }
    
    private updateBankItem(item: Node, data: StdBank, index:number):void{
        let bankItem:BankItem = item.getComponent(BankItem) || item.addComponent(BankItem);
        item.getChildByName("select").active = index == this.curSelectIndex;
        bankItem.SetData(this.stdList[index], this.total);
    }
    private onBankSelect(index: number, item: Node):void{
        this.resetSelect();
        if(item){
            let select:Node = item.getChildByName("select");
            if(select){
                select.active = true;
            }else{
                return;
            } 
        }
        this.curSelectIndex = index;
        this.curSelectStd = this.stdList[this.curSelectIndex];

        this.updateHaveItem();
    }
    private updateHaveItem():void{
        let itemData = ItemUtil.CreateThing(this.curSelectStd.CostType, this.curSelectStd.CostId, this.curSelectStd.CostNum);
        this.haveItem.SetData(itemData);
        let currLab:RichText = this.haveItem.node.getChildByName("currLab").getComponent(RichText);
        if(ItemUtil.CheckItemIsHave(this.curSelectStd.CostType, this.curSelectStd.CostNum, 0)){
            currLab.string = `${formatNumber(this.curSelectStd.CostNum, 2)}/${formatNumber(ItemUtil.GetHaveThingNum(this.curSelectStd.CostType), 2)}`;
        }else{
            currLab.string = `<color=#BF1600>${formatNumber(this.curSelectStd.CostNum, 2)}</color>/${formatNumber(ItemUtil.GetHaveThingNum(this.curSelectStd.CostType), 2)}`;
        }
    }
    private resetSelect():void{
        let children:Node[] = this.list.node.getChildByPath("view/content").children;
        for (let i = 0; i < children.length; i++) {
            let node:Node = children[i];
            node.getChildByName("select").active = false;
        }
    }
    
}