import { Component, Label, Node, path, Sprite, SpriteFrame } from "cc";
import { ConsumeItem } from "../common/ConsumeItem";
import { } from "../roleModule/PlayerData"
 import {SFishingItem,SThing} from "../roleModule/PlayerStruct";
import { CfgMgr, StdFishItem, ThingType } from "../../manager/CfgMgr";
import { folder_icon, ResMgr } from "../../manager/ResMgr";
import { ItemUtil } from "../../utils/ItemUtils";
import { formatNumber } from "../../utils/Utils";
export class FishTradeFishSelectItem extends Component {
    private nameLab: Label;
    private icon:Sprite;
    private weightLab:Label;
    private rainbowItem: ConsumeItem;
    private select:Node;
    private data:SFishingItem;
    private isInit:boolean = false;
    protected onLoad(): void {
        this.nameLab = this.node.getChildByName("nameLab").getComponent(Label);
        this.icon = this.node.getChildByName("icon").getComponent(Sprite);
        this.weightLab = this.node.getChildByName("weightLab").getComponent(Label);
        this.rainbowItem = this.node.getChildByName("rainbowItem").addComponent(ConsumeItem);
        this.isInit = true;
        this.updateShow();
    }

    SetData(data:SFishingItem) {
        this.data = data;
        this.updateShow();
        
    }
    private updateShow():void{
        if (!this.isInit || !this.data) return;
        
        this.icon.node.active = false;
        let std:StdFishItem = CfgMgr.GetFishItem(this.data.fish_id);
        this.nameLab.string = std.Fishsname;
        let url = path.join(folder_icon, `fish/${std.Icon}`, "spriteFrame");
        ResMgr.LoadResAbSub(url, SpriteFrame, res => {
            this.icon.node.active = true;
            this.icon.spriteFrame = res;
        });
        this.weightLab.string = formatNumber(this.data.weight, 2 );
        let thing:SThing = ItemUtil.CreateThing(ThingType.ThingTypeCurrency, 0, this.data.weight);
        this.rainbowItem.SetData(thing);
    }

    public get Data():SFishingItem{
        return this.data;
    }
}