import { Button, Label, Node, path, ProgressBar, RichText, sp, Sprite, SpriteFrame, UITransform, Vec3 } from "cc";
import { Panel } from "../../GameRoot";
import { AutoScroller } from "../../utils/AutoScroller";
import PlayerData, { } from "../roleModule/PlayerData"
 import {SFishingHeroPartData,SThing} from "../roleModule/PlayerStruct";
import { AwardItem } from "../common/AwardItem";
import { ItemTips } from "../common/ItemTips";
import { CfgMgr, StdFishHeroPart, StdItem } from "../../manager/CfgMgr";
import { ItemUtil } from "../../utils/ItemUtils";
import { ResMgr } from "../../manager/ResMgr";
import { EventMgr, Evt_FishEquipUpdate } from "../../manager/EventMgr";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import { MsgPanel } from "../common/MsgPanel";

export class FishingEquipUpgradePanel extends Panel {
    protected prefab: string = "prefabs/panel/fishingEquip/FishingEquipUpgradePanel";
    private equipNameLab:Label;
    private icon:Sprite;
    private winEffect:sp.Skeleton;
    private lvCont:Node;
    private lvLab:Label;
    private pro:ProgressBar;
    private bar:Node;
    private barEffectCont:Node;
    private barBombEffect:sp.Skeleton;
    private numLab:Label;
    private descLab:RichText;
    private upgradeCont:Node;
    private awardList:AutoScroller;
    private upgradeBtn:Button;
    private unlockBtn:Button;
    private maxCont:Node;
    private awList:SThing[] = [];
    private heroId:number;
    private slot:number;
    private part:number;
    private std:StdFishHeroPart;
    private equipData:SFishingHeroPartData;
    private oldLv:number = 0;
    protected onLoad(): void {
        this.equipNameLab = this.find("cont/baseCont/equipNameLab", Label);
        this.icon = this.find("cont/baseCont/icon", Sprite);
        this.lvCont = this.find("cont/baseCont/lvCont");
        this.lvLab = this.find("cont/baseCont/lvCont/lvLab", Label);
        this.winEffect = this.find("cont/baseCont/winEffect", sp.Skeleton);
        this.pro = this.find("cont/baseCont/pro", ProgressBar);
        this.bar = this.find("cont/baseCont/pro/bar");
        this.barEffectCont = this.find("cont/baseCont/pro/barEffectCont");
        this.barBombEffect = this.find("cont/baseCont/pro/barEffectCont/barBombEffect", sp.Skeleton);
        this.numLab = this.find("cont/baseCont/pro/numLab", Label);
        this.descLab = this.find("cont/baseCont/descLab", RichText);

        this.upgradeCont = this.find("cont/upgradeCont");
        this.awardList = this.find("cont/upgradeCont/awardList", AutoScroller);
        this.awardList.SetHandle(this.updateAwardItem.bind(this));
        this.awardList.node.on('select', this.onItemSelect, this);
        this.upgradeBtn = this.find("cont/upgradeCont/upgradeBtn", Button);
        this.unlockBtn = this.find("cont/upgradeCont/unlockBtn", Button);

        this.maxCont = this.find("cont/maxCont");
        this.upgradeCont.active = false;
        this.maxCont.active = false;
        
        this.upgradeBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.unlockBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.CloseBy("mask");
        
    }
    public flush(heroId:number, slot:number, part:number): void {
        this.heroId = heroId;
        this.slot = slot;
        this.part = part;
        this.updateShow();
    }
    
    protected onShow(): void {
        EventMgr.on(Evt_FishEquipUpdate, this.onEquipUpdate, this);
    }

    protected onHide(...args: any[]): void {
        EventMgr.off(Evt_FishEquipUpdate, this.onEquipUpdate, this);
    }
    private onEquipUpdate(hero_id:number, part_slot_id:number, upgrade_success:boolean):void{
        if(upgrade_success){
            if(this.oldLv == 0){
                MsgPanel.Show("解锁成功");
            }else{
                MsgPanel.Show("升级成功");
            }
            this.winEffect.node.active = true;
            this.winEffect.setAnimation(0,"animation", false);
            this.winEffect.setCompleteListener(()=>{
                this.winEffect.node.active = false;
            });
        }else{
            this.barBombEffect.node.active = true;
            this.barBombEffect.setAnimation(0,"animation", false);
            this.barBombEffect.setCompleteListener(()=>{
                this.barBombEffect.node.active = false;
            });
        }
        this.updateShow();
        
    }
    private onBtnClick(btn:Button):void{
        switch(btn){
            case this.upgradeBtn:
            case this.unlockBtn:
                if(!ItemUtil.CheckThingConsumes(this.std.CostType, this.std.CostID, this.std.CostNumber, true)) return;
                Session.Send({type: MsgTypeSend.FishingHeroUpgrade, data:{hero_id:this.heroId, part_slot_id:this.slot}});
                break;
        }
        
    }

    private updateShow():void{
        this.equipData = PlayerData.GetFishingEquipData(this.heroId, this.slot);
        this.oldLv = this.equipData ? this.equipData.level : 0;
        let lv:number = this.equipData ? this.equipData.level : 0;
        this.std = CfgMgr.GetFishHeroPartLv(this.part, Math.max(lv, 1));
        let curVal:number = this.equipData ? this.equipData.upgrade : 0;
        let nextStd:StdFishHeroPart = CfgMgr.GetFishHeroPartLv(this.part, lv + 1);
        if(!nextStd){
            this.maxCont.active = true;
            this.upgradeCont.active = false;
            this.lvLab.string = `Lv.${this.equipData ? this.equipData.level : 0}`;
            this.pro.node.active = false;
        }else{
            this.pro.node.active = true;
            this.pro.progress = curVal / nextStd.BarUpgradeMax;
            this.numLab.string = `${curVal}/${nextStd.BarUpgradeMax}`;
            if(lv > 0){
                this.lvCont.active = true;
                this.upgradeBtn.node.active = true;
                this.unlockBtn.node.active = false;
                this.lvLab.string = `Lv.${this.equipData ? this.equipData.level : 0}`;
            }else{
                this.lvCont.active = false;
                this.upgradeBtn.node.active = false;
                this.unlockBtn.node.active = true;
            }
            this.maxCont.active = false;
            this.upgradeCont.active = true;
            this.awList = ItemUtil.GetSThingList(nextStd.CostType, nextStd.CostID, nextStd.CostNumber);
            this.awardList.UpdateDatas(this.awList);
        }
        this.barEffectCont.position = new Vec3(this.bar.getComponent(UITransform).width + this.bar.position.x);
        if(this.std.IconRes){
            this.icon.node.active = true;
            let iconUrl = path.join("sheets/fishingEquip", this.std.IconRes, "spriteFrame");
            ResMgr.LoadResAbSub(iconUrl, SpriteFrame, res => {
                this.icon.spriteFrame = res;
            });
        }else{
            this.icon.node.active = false;
        }
        if(this.slot == 1){
            this.icon.node.position = new Vec3(0,76,0);
        }else{
            this.icon.node.position = new Vec3(0,60,0);
        }
        this.equipNameLab.string = this.std.Name;
        let defStd = CfgMgr.GetFishHeroPartLv(this.part, 1);
        let defSth:SThing[] = ItemUtil.GetSThingList(defStd.CostType, defStd.CostID, defStd.CostNumber);
        let stdItem:StdItem = CfgMgr.Getitem(defSth[0].item.id);
        this.descLab.string = stdItem.Remark;
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