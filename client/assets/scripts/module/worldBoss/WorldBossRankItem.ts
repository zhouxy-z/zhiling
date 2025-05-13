import { Component, Label } from "cc";
import { HeadItem } from "../common/HeadItem";
import { ConsumeItem } from "../common/ConsumeItem";
import { ItemUtil } from "../../utils/ItemUtils";
import { CfgMgr, ThingType } from "../../manager/CfgMgr";
import { SPlayerViewInfo, SWorldBossRankItemData } from "../roleModule/PlayerStruct";

export class WorldBossRankItem extends Component {
    private head:HeadItem;
    private nameLab: Label;
    private rankLab: Label;
    private hurtLab:Label;
    private roleData:SWorldBossRankItemData;
    private rank:number;
    private isInit:boolean = false;
    protected onLoad(): void {
        this.head = this.node.getChildByPath("HeadItem").addComponent(HeadItem);
        this.nameLab = this.node.getChildByName("nameLab").getComponent(Label);
        this.rankLab = this.node.getChildByName("rankLab").getComponent(Label);
        this.hurtLab = this.node.getChildByName("hurtLab").getComponent(Label);
        this.isInit = true;
        this.initShow();
    }

    SetData(roleData:SWorldBossRankItemData, rank:number):void {
        this.roleData = roleData;
        this.rank = rank;
        this.initShow();
    }
    private initShow():void{
        if(!this.isInit || !this.roleData) return;
        this.nameLab.string = this.roleData.name;
        this.hurtLab.string = this.roleData.harm.toString();
        if(this.rank > 0){
            this.rankLab.string = this.rank.toString();
        }else{
            this.rankLab.string = "未上榜";
        }
        let data:SPlayerViewInfo = {
            player_id:this.roleData.id,
            
        };
        this.head.SetData(data);
        
    }
}