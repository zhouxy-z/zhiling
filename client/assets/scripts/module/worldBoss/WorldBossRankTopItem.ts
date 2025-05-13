import { Component, Label, sp } from "cc";
import { ConsumeItem } from "../common/ConsumeItem";
import { ItemUtil } from "../../utils/ItemUtils";
import { CfgMgr, ThingType } from "../../manager/CfgMgr";
import { SWorldBossRankItemData } from "../roleModule/PlayerStruct";

export class WorldBossRankTopItem extends Component {
    private bodyModel:sp.Skeleton;
    private nameLab: Label;
    private rankLab: Label;
    private hurtLab:Label;
    private roleData:SWorldBossRankItemData;
    private rank:number;
    private isInit:boolean = false;
    protected onLoad(): void {
        this.bodyModel = this.node.getChildByName("bodyModel").getComponent(sp.Skeleton);
        this.nameLab = this.node.getChildByName("nameLab").getComponent(Label);
        this.rankLab = this.node.getChildByName("rankLab").getComponent(Label);
        this.hurtLab = this.node.getChildByPath("hurtCont/numLab").getComponent(Label);
        this.isInit = true;
        this.initShow();
    }

    SetData(roleData:SWorldBossRankItemData, rank:number) {
        this.roleData = roleData;
        this.rank = rank;
        this.initShow();
    }
    private initShow():void{
        if(!this.isInit || !this.roleData) return;
        this.nameLab.string = this.roleData.name;
        this.hurtLab.string = this.roleData.harm.toString();
        this.rankLab.string = this.rank.toString();
        
    }
}