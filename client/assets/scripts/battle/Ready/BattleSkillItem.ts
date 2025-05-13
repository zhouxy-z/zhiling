import { Button, Component, Label, Node, path, ProgressBar, Sprite, SpriteFrame, Tween, tween, Vec3 } from "cc";
import { Runtime } from "../BattleLogic/Runtime";
import { FightState, SPlayerDataSkill } from "../../module/roleModule/PlayerStruct";
import { folder_head_card, folder_skill, ResMgr } from "../../manager/ResMgr";
import { CfgMgr, StdActiveSkill, StdRole } from "../../manager/CfgMgr";
import { SetNodeGray } from "../../module/common/BaseUI";

export class BattleSkillItem extends Component {
    private heroCont:Node;
    private heroIcon:Sprite;
    private cdMask:Sprite;
    private cdTimeLab:Label;
    private skillCont:Node;
    private skillBtn:Button;
    private skillIcon:Sprite;
    private hp:ProgressBar;
    private data:any;
    private roleId:string;
    private stdSkill:StdActiveSkill;
    private slotId:number;
    private battleType:FightState;
    private isInit:boolean = false;
    private isEffect:boolean = false;
    protected onLoad(): void {
        this.heroCont = this.node.getChildByName("heroCont");
        this.heroIcon = this.node.getChildByPath("heroCont/icon").getComponent(Sprite);
        this.cdMask = this.node.getChildByPath("heroCont/cdMask").getComponent(Sprite);
        this.cdTimeLab = this.node.getChildByPath("heroCont/cdTimeLab").getComponent(Label);
        this.skillCont = this.node.getChildByName("skillCont");
        this.skillBtn =  this.node.getChildByName("skillCont").getComponent(Button);
        this.skillIcon =  this.node.getChildByPath("skillCont/icon").getComponent(Sprite);
        this.hp = this.node.getChildByPath("hp").getComponent(ProgressBar);
        this.skillBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.isInit = true;
        this.updateShow();
    }
    protected update(dt: number): void {
        if(this.data){
            let hero = Runtime.gameLogic.GetHeroBySkillSlot(this.slotId);
            if(!hero || hero.isDie){
                this.stopCdTimeEffct();
                this.cdMask.node.active = false;
                this.cdTimeLab.node.active = false;
                SetNodeGray(this.heroCont, true, false);
                this.hp.progress = 0;
            }else{
                SetNodeGray(this.heroCont, false, false);
                let skill = hero.GetSlotSkillInfo();
                if (skill.cdTime > 0) {
                    this.cdMask.fillRange = skill.cdPercent;
                    this.cdTimeLab.string = Math.ceil(skill.cdTime).toString();
                    this.cdTimeLab.node.active = true;
                    this.cdMask.node.active = true;
                    this.playCdTimeEffct(1);
                }else{
                    this.cdTimeLab.node.active = false;
                    this.cdMask.node.active = false;
                    this.playCdTimeEffct(2);
                }
                this.hp.progress = hero.GetHpPercent();
            }
        }
    }
    private playCdTimeEffct(type:number):void{
        if(this.isEffect) return;
        this.isEffect = true;
        let headTween:Node;
        let endTween:Node;
        if(type == 1){
            headTween = this.skillCont;
            endTween = this.heroCont;
        }else{
            headTween = this.heroCont;
            endTween = this.skillCont;
        }

        tween(headTween)
        .to(0.3, { scale: new Vec3(0, 1, 1) })
        .call(() => {
            
        }).start();

        tween(endTween)
        .delay(0.3)
        .to(0.3, { scale: new Vec3(1, 1, 1) })
        .call(() => {
            this.isEffect = false;
        }).start();
    }
    private stopCdTimeEffct():void{
        this.skillCont.setScale(0, 1);
        this.heroCont.setScale(1, 1);
        this.isEffect = false;
    }
    SetData(data:any, slotId:number):void{
        this.data = data;
        this.slotId = slotId;
        this.stopCdTimeEffct();
        this.updateShow();
    }
    
    private onBtnClick(btn:Button):void{
        switch(btn){
            case this.skillBtn:
                if (Runtime.game) {
                    if(this.battleType == FightState.WorldBoss) return;
                    Runtime.game.PlayerInput({type: "PlayerCastSkill", slotId: this.slotId});
                }
                break;
        }
    }
    private updateShow():void{
        if(!this.isInit||!this.data) return;
        this.roleId = this.data.id;
        let roleType:number = this.data.type;
        let roleSkillList:SPlayerDataSkill[] = this.data.active_skills;
        let skillData:SPlayerDataSkill = roleSkillList && roleSkillList.length > 1 ? roleSkillList[1] : null;
        this.stdSkill = CfgMgr.GetActiveSkill(skillData?.skill_id, skillData.level);
        let stdRole:StdRole = CfgMgr.GetRole()[roleType];
        ResMgr.LoadResAbSub(`${folder_head_card}${stdRole.Icon.toString()}/spriteFrame`, SpriteFrame, (res:SpriteFrame)=>{
            this.heroIcon.spriteFrame = res; 
        });
        if(this.stdSkill){
            ResMgr.LoadResAbSub(`${folder_skill}${this.stdSkill.icon.toString()}/spriteFrame`, SpriteFrame, (res:SpriteFrame)=>{
                this.skillIcon.spriteFrame = res; 
            });
            this.skillCont.active = true;
        }else{
            this.skillCont.active = false;
        }
        Tween.stopAllByTarget(this.skillCont);
        Tween.stopAllByTarget(this.heroCont);

    }

}