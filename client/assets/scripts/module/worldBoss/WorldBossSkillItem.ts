import { Component, Label, path, RichText, Sprite, SpriteFrame } from "cc";
import { SPlayerDataSkill } from "../roleModule/PlayerStruct";
import { CfgMgr, StdActiveSkill } from "../../manager/CfgMgr";
import { folder_quality, folder_skill, ResMgr } from "../../manager/ResMgr";

export class WorldBossSkillItem extends Component {
    private bg:Sprite;
    private icon:Sprite;
    private nameLab:Label;
    private lvLab:Label;
    private skillDescLab:RichText;
    private data: SPlayerDataSkill;
    private isInit = false;

    protected onLoad(): void {
        this.bg = this.node.getChildByName("bg").getComponent(Sprite);
        this.icon = this.node.getChildByPath("Mask/icon").getComponent(Sprite);
        this.nameLab = this.node.getChildByName("nameLab").getComponent(Label);
        this.lvLab = this.node.getChildByPath("lvLab").getComponent(Label);
        this.skillDescLab = this.node.getChildByName("skillDescLab").getComponent(RichText);
        this.isInit = true;
        this.updateShow();
    }
    

    SetData(data: SPlayerDataSkill):void {
        this.data = data;
        this.updateShow();
    }

    private updateShow():void{
        if(!this.isInit || !this.data)  return;
        let stdSkill:StdActiveSkill = CfgMgr.GetActiveSkill(this.data.skill_id, this.data.level);
        if(!stdSkill) return;
        this.nameLab.string = stdSkill.Name;
        this.lvLab.string = ` Lv.${this.data.level}`;
        this.skillDescLab.string = stdSkill.Text;
        ResMgr.LoadResAbSub(path.join(folder_skill, stdSkill.icon.toString(), "spriteFrame"), SpriteFrame, res => {
            if(this.icon.spriteFrame != res){
                this.icon.spriteFrame = res;
            }
        });

        ResMgr.LoadResAbSub(path.join(folder_quality, "a_skill_bg_" + stdSkill.Quality, "spriteFrame"), SpriteFrame, res => {
            if(this.bg.spriteFrame != res){
                this.bg.spriteFrame = res;
            }
        });
    }
}