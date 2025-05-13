import { Component, Input, Label, Node, Sprite, SpriteFrame, path, sp } from "cc";
import { } from "../roleModule/PlayerData"
 import {SPlayerDataRole, SRankData,SRankType} from "../roleModule/PlayerStruct";
import { CfgMgr } from "../../manager/CfgMgr";
import { ResMgr, folder_common, folder_head_round, folder_item } from "../../manager/ResMgr";
import { TradeHeroPanel } from "../trade/TradeHeroPanel";
import { GameSet } from "../GameSet";
import { ToFixed } from "../../utils/Utils";
export class RankTopItem extends Component {
    private bodyModel:sp.Skeleton;
    private nameLab: Label;
    private rankLab: Label;
    private fightIcon: Node;
    private valueLab: Label;
    private data:SRankData;
    private isInit:boolean = false;
    private rankType:SRankType;
    private roleInfoBtn: Node;
    private role_data: SPlayerDataRole;
    private icon: Sprite
    protected onLoad(): void {
        this.bodyModel = this.node.getChildByName("bodyModel").getComponent(sp.Skeleton);
        this.nameLab = this.node.getChildByName("nameLab").getComponent(Label);
        this.rankLab = this.node.getChildByName("rankLab").getComponent(Label);
        this.fightIcon = this.node.getChildByPath("valueCont/icon");
        this.valueLab = this.node.getChildByPath("valueCont/numLab").getComponent(Label);
        this.roleInfoBtn = this.node.getChildByPath("roleInfoBtn");
        this.icon = this.node.getChildByPath("roleInfoBtn/mack/icon").getComponent(Sprite);

        this.roleInfoBtn.on(Input.EventType.TOUCH_END, this.showInfo, this);
        this.isInit = true;
        this.initShow();
    }

    SetData(data:SRankData, rankType:SRankType) {
        this.data = data;
        this.rankType = rankType;
        this.initShow();
    }
    private initShow():void{
        if(!this.isInit || !this.data) return;
        this.nameLab.string = this.data.name;
        this.rankLab.string = this.data.rank.toString();
        this.fightIcon.active = false;
        if(this.rankType == SRankType.Fight || this.rankType == SRankType.Role){
            let url = path.join(folder_common, "战斗力-002", "spriteFrame");
            ResMgr.LoadResAbSub(url, SpriteFrame, res=>{
                this.fightIcon.getComponent(Sprite).spriteFrame = res;
            })
            this.fightIcon.active = true;
            this.valueLab.string = this.data.battle_power + "";
        }else if(this.rankType == SRankType.Level){ 
            this.valueLab.string = "Lv." + this.data.level + "";
        }else if(this.rankType == SRankType.Currency){
            let icon = GameSet.GetServerMark() == "hc" ? "huancaishi" : "caizuan";
            let url = path.join(folder_item, icon, "spriteFrame");
            ResMgr.LoadResAbSub(url, SpriteFrame, res=>{
                this.fightIcon.getComponent(Sprite).spriteFrame = res;
            })
            this.fightIcon.active = true;
            this.valueLab.string = ToFixed(this.data.currency, 2);
        }else{
            this.valueLab.string = this.data.progress + ""
        }
        this.roleInfoBtn.active = this.data.role_type ? true : false;
        if(this.data.role_type){
            let std = CfgMgr.GetRole()[this.data.role_type];
            let url = path.join(folder_head_round, std.Icon, "spriteFrame");
            ResMgr.LoadResAbSub(url, SpriteFrame, res=>{
                this.icon.spriteFrame = res;
            })
            this.role_data = {
                id: "",
                type:this.data.role_type,
                level:this.data.level,
                experience: 0,
                soldier_num: 0,
                active_skills: [],
                passive_skills:this.data.passive_skills ? this.data.passive_skills : [],
                is_in_building: false,
                building_id: 0,
                battle_power:this.data.battle_power,
                quality:this.data.quality,
                skills: [],
                is_assisting: false,
                is_in_attack_lineup: false,
                is_in_defense_lineup: false,
                trade_cd: 0,
            }  
        }
    }

    private showInfo(){
        if(this.role_data){
            TradeHeroPanel.Show(this.role_data)
        }
    }
}