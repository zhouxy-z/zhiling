import { Component, Label, sp } from "cc";
import { HeadItem } from "../common/HeadItem";
import { SPlayerViewInfo, SWorldBossRankItemData } from "../roleModule/PlayerStruct";

export class WorldBossHurtRankTopItem extends Component {
    private head:HeadItem;
    private effect:sp.Skeleton;
    private nameLab: Label;
    private hurtNumLab: Label;
    private isInit:boolean = false;
    private roleData:SWorldBossRankItemData;
    protected onLoad(): void {
        this.head = this.node.getChildByName("HeadItem").addComponent(HeadItem);
        this.effect = this.node.getChildByPath("effect").getComponent(sp.Skeleton);
        this.nameLab = this.node.getChildByName("nameLab").getComponent(Label);
        this.hurtNumLab = this.node.getChildByPath("hurtCont/hurtNumLab").getComponent(Label);
        this.isInit = true;
        this.initShow();
    }

    SetData(roleDaya:SWorldBossRankItemData):void {
        this.roleData = roleDaya;
        this.initShow();
    }
    private initShow():void{
        if(!this.isInit || !this.roleData) return;
        this.effect.setAnimation(0, this.roleData.id ? "animation" : "stop", true);
        this.nameLab.string = this.roleData.name;
        this.hurtNumLab.string = this.roleData.harm.toString();
        let data:SPlayerViewInfo = {
            player_id:this.roleData.id,
        };
        this.head.SetData(data);
    }
}