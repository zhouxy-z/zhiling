import { Component, Label, sp } from "cc";
import { HeadItem } from "../common/HeadItem";
import { SPlayerViewInfo, SWorldBossRankItemData } from "../roleModule/PlayerStruct";

export class WorldBossHurtRankItem extends Component {
    private head:HeadItem;
    private nameLab: Label;
    private rankLab: Label;
    private hurtLab: Label;
    private roleData:SWorldBossRankItemData;
    private isInit:boolean = false;
    private rank:number = 0;
    protected onLoad(): void {
        this.head = this.node.getChildByPath("HeadItem").addComponent(HeadItem);
        this.nameLab = this.node.getChildByName("nameLab").getComponent(Label);
        this.rankLab = this.node.getChildByName("rankLab").getComponent(Label);
        this.hurtLab = this.node.getChildByPath("hurtCont/hurtLab").getComponent(Label);
        this.isInit = true;
        this.updateShow();
    }

    SetData(roleData:SWorldBossRankItemData, rank:number) {
        this.roleData = roleData;
        this.rank = rank;
        this.updateShow();
    }

    private updateShow():void{
        if(!this.isInit || !this.roleData) return;
        this.nameLab.string = this.roleData.name;
        this.rankLab.string = this.rank.toString();
        this.hurtLab.string = this.roleData.harm.toString();
        

        let data:SPlayerViewInfo = {
            player_id:this.roleData.id,
        };
        this.head.SetData(data);
    }
}