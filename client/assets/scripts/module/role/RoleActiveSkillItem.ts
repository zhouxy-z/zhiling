import { Button, Component, Label, Node, RichText, Sprite, SpriteFrame, path } from "cc";
import { AutoScroller } from "../../utils/AutoScroller";
import PlayerData, {  } from "../roleModule/PlayerData"
 import {SPlayerDataSkill} from "../roleModule/PlayerStruct";
import { ResMgr, folder_icon, folder_item, folder_quality, folder_skill } from "../../manager/ResMgr";
import { CfgMgr, StdActiveSkill } from "../../manager/CfgMgr";
import { ItemUtil } from "../../utils/ItemUtils";
import { GameSet } from "../GameSet";


export class RoleActiveSkillItem extends Component {
    private bg:Sprite;
    private icon:Sprite;
    private nameLab:Label;
    private lvLab:Label;
    private upIcon:Node;
    private skillDescLab:RichText;
    private data: SPlayerDataSkill;
    private roleId:string;
    protected $loadSub: Promise<any>;
    protected complete: Function;
    protected hasLoad = false;

    protected onLoad(): void {
        this.bg = this.node.getChildByName("bg").getComponent(Sprite);
        this.icon = this.node.getChildByPath("Mask/icon").getComponent(Sprite);
        this.nameLab = this.node.getChildByPath("titleCont/nameLab").getComponent(Label);
        this.lvLab = this.node.getChildByPath("titleCont/lvLab").getComponent(Label);
        this.skillDescLab = this.node.getChildByName("skillDescLab").getComponent(RichText);
        this.upIcon = this.node.getChildByName("upIcon");
        this.hasLoad = true;
        this.complete?.();
    }
    protected get loadSub() {
        if (this.$loadSub) return this.$loadSub;
        let thisObj = this;
        this.$loadSub = new Promise((resolve, reject) => {
            thisObj.complete = resolve;
        });
    }

    async SetData(data: SPlayerDataSkill , role_id) {
        if (!this.hasLoad) await this.loadSub;
        this.data = data;
        this.roleId = role_id
        this.initShow();

    }

    private async initShow():Promise<void> {
        let stdSkill:StdActiveSkill = CfgMgr.GetActiveSkill(this.data.skill_id, this.data.level);
        if(!stdSkill) return;
        this.upIcon.active = false;
        this.nameLab.string = stdSkill.Name;
        this.lvLab.string = ` Lv.${this.data.level}`;
        this.skillDescLab.string = stdSkill.Text;
        this.bg.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_quality, "a_skill_bg_" + stdSkill.Quality, "spriteFrame"), SpriteFrame);
        this.icon.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_skill, stdSkill.icon.toString(), "spriteFrame"), SpriteFrame);
        if(GameSet.GetServerMark() == "hc"){
            let nextLv:number = this.data.level + 1;
            let nextStd:StdActiveSkill = CfgMgr.GetActiveSkill(this.data.skill_id, nextLv);
            if(nextStd){
                let cfg = CfgMgr.GetActiveSkillUp(this.data.skill_id, this.data.level)
                let is_up = PlayerData.GetActiveSkillIsUp(this.roleId)
                this.upIcon.active = ItemUtil.CheckThingConsumes(cfg.RewardType, cfg.RewardItemType, cfg.RewardNumber) && is_up;
            }
        }
    }
}