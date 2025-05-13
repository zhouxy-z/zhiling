import { Button, Label, Sprite, Node, path, SpriteFrame } from "cc";
import { Panel } from "../../GameRoot";
import { AutoScroller } from "../../utils/AutoScroller";
import {  } from "../roleModule/PlayerData"
 import {SThing} from "../roleModule/PlayerStruct";
import { CfgMgr, StdFishHero } from "../../manager/CfgMgr";
import { ResMgr } from "../../manager/ResMgr";
import { ItemUtil } from "../../utils/ItemUtils";
import { AwardItem } from "../common/AwardItem";
import { ItemTips } from "../common/ItemTips";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import { DateUtils } from "../../utils/DateUtils";

export class FishingEquipHeroActivePanel extends Panel {
    protected prefab: string = "prefabs/panel/fishingEquip/FishingEquipHeroActivePanel";
    private equipNameLab:Label;
    private icon:Sprite;
    private addTimeLab:Label;
    private awardList:AutoScroller;
    private activeBtn:Button;
    
    private awList:SThing[] = [];
    private stdHero:StdFishHero;
    protected onLoad(): void {
        this.equipNameLab = this.find("equipNameLab", Label);
        this.icon = this.find("icon", Sprite);
        this.addTimeLab = this.find("addTimeCont/addTimeLab", Label);
        this.awardList = this.find("awardList", AutoScroller);
        this.awardList.SetHandle(this.updateAwardItem.bind(this));
        this.awardList.node.on('select', this.onItemSelect, this);
        this.activeBtn = this.find("activeBtn", Button);
        this.activeBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.CloseBy("mask");
        
    }
    public flush(heroId:number): void {
        this.stdHero = CfgMgr.GetFishHero(heroId);
        this.updateShow();
    }
    
    protected onShow(): void {
        
    }

    protected onHide(...args: any[]): void {
        
    }
    
    private onBtnClick(btn:Button):void{
        switch(btn){
            case this.activeBtn:
                if(!ItemUtil.CheckThingConsumes(this.stdHero.ActivateCostType, this.stdHero.ActivateCostItemID, this.stdHero.ActivateCostItemNumber, true)){
                    return;
                }
                Session.Send({type: MsgTypeSend.FishingHeroActive, data:{hero_id:this.stdHero.ID}});
                this.Hide();
                break;
        }
        
    }

    private updateShow():void{
        
        if(this.stdHero.IconRes){
            this.icon.node.active = true;
            let iconUrl = path.join("sheets/fishingEquip", this.stdHero.IconRes, "spriteFrame");
            ResMgr.LoadResAbSub(iconUrl, SpriteFrame, res => {
                this.icon.spriteFrame = res;
            });
        }else{
            this.icon.node.active = false;
        }
        this.addTimeLab.string = DateUtils.FormatTime(this.stdHero.ActivateTime, "%{hh}:%{mm}:%{ss}"); 
        this.equipNameLab.string = this.stdHero.Name;
        this.awList = ItemUtil.GetSThingList(this.stdHero.ActivateCostType, this.stdHero.ActivateCostItemID, this.stdHero.ActivateCostItemNumber);
        this.awardList.UpdateDatas(this.awList);
    }

    private updateAwardItem(item: Node, data: SThing) {
        let awardItem = item.getComponent(AwardItem) || item.addComponent(AwardItem);
        awardItem.SetData({ itemData: data });
    }

    private onItemSelect(index: number, item: Node) {
        let selectData = this.awList[index];
        if(selectData){
            ItemTips.Show(selectData);
        }
    }

}