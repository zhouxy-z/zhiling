import { Component, Label, Node, Sprite, Button, path, SpriteFrame } from "cc";
import { CfgMgr, StdFishHeroPart } from "../../manager/CfgMgr";
import { FishingEquipUpgradePanel } from "./FishingEquipUpgradePanel";
import { ResMgr } from "../../manager/ResMgr";

export class FishingEquipItem extends Component {
    private btn?:Button;
    private icon:Sprite;
    private lvCont:Node;
    private lvLab:Label;
    private lock:Node;
    private isInit:boolean = false;
    private slot:number;
    private lv:number = 0;
    private stdPart:StdFishHeroPart;
    private heroId:number;
    private part:number;
    protected onLoad(): void {
        this.btn = this.node.getComponent(Button);
        this.icon = this.node.getChildByName("icon").getComponent(Sprite);
        this.lvCont = this.node.getChildByName("lvCont");
        this.lvLab = this.node.getChildByPath("lvCont/lvLab").getComponent(Label);
        this.lock = this.node.getChildByName("lock");
        this.btn?.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.isInit = true;
        this.updateShow();
    }
    private onBtnClick(btn:Button):void{
        switch(btn){
            case this.btn:
                FishingEquipUpgradePanel.Show(this.heroId, this.slot, this.stdPart.ID);
                break;
        }
    }
    SetData(heroId:number, slot:number, stdPart:StdFishHeroPart, lv:number):void{
        this.heroId = heroId;
        this.stdPart = stdPart;
        this.slot = slot;
        this.lv = lv;
        this.updateShow();
    }
    private updateShow():void{
        if(!this.isInit || isNaN(this.slot) || !this.slot) return;
        this.icon.node.active = false;
        if(this.lv <= 0){
            this.lock.active = this.slot > 1;
            this.lvCont.active = false;
            return;   
        }
        this.lock.active = false;
        this.lvCont.active = true;
        this.lvLab.string = `Lv.${this.lv}`;
        if(this.slot > 1){
            if(this.stdPart.IconRes){
                this.icon.node.active = true;
                let iconUrl = path.join("sheets/fishingEquip", this.stdPart.IconRes, "spriteFrame");
                ResMgr.LoadResAbSub(iconUrl, SpriteFrame, res => {
                    this.icon.spriteFrame = res;
                });
            }else{
                this.icon.node.active = false;
            }
        }
        
    }
}