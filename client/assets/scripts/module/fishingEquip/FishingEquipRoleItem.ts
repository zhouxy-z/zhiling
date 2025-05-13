import { Component, Label, Node, path, Sprite, SpriteFrame} from "cc";
import { StdFishEquipSoltType, StdFishHero } from "../../manager/CfgMgr";
import { folder_head_round, ResMgr } from "../../manager/ResMgr";
import PlayerData, { } from "../roleModule/PlayerData"
 import {SFishingHeroData,SFishingHeroPartData} from "../roleModule/PlayerStruct";
import { SetNodeGray } from "../common/BaseUI";
import { DateUtils } from "../../utils/DateUtils";

export class FishingEquipRoleItem extends Component {
    private select:Node;
    private cont:Node;
    private icon:Sprite;
    private nameLab:Label;
    private user:Node;
    private timeCont:Node;
    private timeLab:Label;
    private noActivate:Node;
    private std:StdFishHero;
    private heroData:SFishingHeroData;
    private isInit:boolean = false;
    protected onLoad(): void {
        this.select = this.node.getChildByName("select");
        this.cont = this.node.getChildByName("cont");
        this.icon = this.node.getChildByPath("cont/icon").getComponent(Sprite);
        this.nameLab = this.node.getChildByPath("cont/nameLab").getComponent(Label);
        this.user = this.node.getChildByName("user");
        this.noActivate = this.node.getChildByName("noActivate");
        this.timeCont = this.node.getChildByName("timeCont");
        this.timeLab = this.node.getChildByPath("timeCont/timeLab").getComponent(Label);
        this.isInit = true;
        this.updateShow();
    }
    protected update(dt: number): void {
        if(this.heroData && this.heroData.activate_end_time > PlayerData.GetServerTime()){
            this.timeCont.active = true;
            let residueTime:number = Math.max(Math.floor(this.heroData.activate_end_time - PlayerData.GetServerTime()), 0);
            if(residueTime > 86400){
                this.timeLab.string = DateUtils.FormatTime(residueTime, "%{d}天%{hh}:%{mm}:%{ss}");
            }else{
                this.timeLab.string = DateUtils.FormatTime(residueTime, "%{hh}:%{mm}:%{ss}");
            }
        }else{
            this.timeCont.active = false;
        }
    }
    SetData(std:StdFishHero):void{
        this.std = std;
        this.updateShow();
    }
    private updateShow():void{
        if(!this.isInit || !this.std) return;
        this.nameLab.string = this.std.Name;
        this.heroData = PlayerData.GetFishingEquipHero(this.std.ID);
        this.user.active = PlayerData.GetFishingHeroId() == this.std.ID;
        let headUrl = path.join("sheets/fishingEquip", this.std.IconRes, "spriteFrame");
        ResMgr.LoadResAbSub(headUrl, SpriteFrame, res => {
            this.icon.spriteFrame = res;
        });

        let heroPartData:SFishingHeroPartData = PlayerData.GetFishingEquipData(this.std.ID, StdFishEquipSoltType.Type_1);
        if(heroPartData && (heroPartData.level > 0 || heroPartData.upgrade > 0)){
            SetNodeGray(this.cont, false, true);
            this.noActivate.active = false;
            
        }else{
            this.noActivate.active = true;
            SetNodeGray(this.cont, true, true);

        }
    }
}