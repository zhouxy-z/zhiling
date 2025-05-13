import { Component, Label, path, Sprite, SpriteFrame } from "cc";
import { StdEquityList } from "../../manager/CfgMgr";
import { ResMgr } from "../../manager/ResMgr";

export class RightsItem extends Component {
    private icon:Sprite;
    private nameLab:Label;
    private isInit:boolean = false;
    private std:StdEquityList;
    protected onLoad(): void {
        this.icon = this.node.getChildByPath("icon").getComponent(Sprite);
        this.nameLab = this.node.getChildByPath("nameLab").getComponent(Label);
        this.isInit = true;
        this.updateShow();
    }
    
    SetData(data:StdEquityList) {
        this.std = data;
        this.updateShow();
        
    }
    
    private updateShow():void {
        if(!this.isInit || !this.std) return;
        this.nameLab.string = this.std.describe;
        let url = path.join("sheets/rights", `${this.std.Icon}`, "spriteFrame");
        ResMgr.LoadResAbSub(url, SpriteFrame, res => {
            this.icon.spriteFrame = res;
        });
    }
}