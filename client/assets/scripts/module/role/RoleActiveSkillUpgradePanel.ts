import { Label, Sprite, Node, Button, RichText, Color, path, SpriteFrame } from "cc";
import { Panel } from "../../GameRoot";
import { AutoScroller } from "../../utils/AutoScroller";
import { AwardItem } from "../common/AwardItem";
import PlayerData, { } from "../roleModule/PlayerData"
 import {SPlayerDataRole, SPlayerDataSkill,SThing} from "../roleModule/PlayerStruct";
import { CfgMgr, StdActiveSkill, StdActiveSkillUp, StdPassiveLevel, StdRoleQuality } from "../../manager/CfgMgr";
import { ResMgr, folder_icon, folder_skill, skill_quality_color } from "../../manager/ResMgr";
import { ItemUtil } from "../../utils/ItemUtils";
import { MsgTypeRet, MsgTypeSend } from "../../MsgType";
import { Session } from "../../net/Session";
import { EventMgr, Evt_Passive_Skill_Update } from "../../manager/EventMgr";

export class RoleActiveSkillUpgradePanel extends Panel {
    protected prefab: string = "prefabs/panel/role/RoleActiveSkillUpgradePanel";
    private nameLvLab: Label;
    private bg: Sprite;
    private icon: Sprite;
    private nameLab: Label;
    private lvLab: Label;
    private resIcon: Node;
    private descLabel: RichText;
    private nextItem: Node;
    private nextDescLab: RichText;
    private consumeCont: Node;
    private consumeItemLits: AutoScroller;
    private upgradeBtn: Button;
    private fullLv:Node;
    private leftBtn: Button;
    private rightBtn: Button;
    private roleId: string;
    private curSkillIndex: number;
    private skillDataList: SPlayerDataSkill[];
    private curStd: StdActiveSkill;
    private skill_id: number
    private skillUpData:StdActiveSkillUp
    private roleData:SPlayerDataRole
    protected onLoad() {
        this.nameLvLab = this.find("skillItemCont/nameLvLab", Label);
        this.bg = this.find("skillItemCont/skillItem/bg", Sprite);
        this.icon = this.find("skillItemCont/skillItem/Mask/icon", Sprite);
        this.nameLab = this.find("skillItemCont/skillItem/nameLab", Label);
        this.lvLab = this.find("skillItemCont/skillItem/lvLab", Label);
        this.resIcon = this.find("skillItemCont/skillItem/resIcon");
        this.descLabel = this.find("skillItemCont/skillItem/descLab", RichText);
        this.nextItem = this.find("skillItemCont/nextItem");
        this.nextDescLab = this.find("skillItemCont/nextItem/nextDescLab", RichText);
        this.consumeCont = this.find("consumeCont");
        this.consumeItemLits = this.find("consumeCont/consumeItemLits", AutoScroller);
        this.upgradeBtn = this.find("upgradeBtn", Button);
        this.fullLv = this.find("fullLv");
        this.leftBtn = this.find("leftBtn", Button);
        this.rightBtn = this.find("rightBtn", Button);
        this.consumeItemLits.SetHandle(this.updateItem.bind(this));

        this.CloseBy("closeBtn");
        this.CloseBy("mask");
        this.upgradeBtn.node.on(Button.EventType.CLICK, this.onClick, this);
        this.leftBtn.node.on(Button.EventType.CLICK, this.onClick, this);
        this.rightBtn.node.on(Button.EventType.CLICK, this.onClick, this);
        EventMgr.on(Evt_Passive_Skill_Update, this.onUpdateSkill, this);
    }
    protected async onShow(...args: any[]): Promise<void> {
        if (!this.$hasLoad) await this.initSub;

    }

    public async flush(...args: any[]): Promise<void> {
        this.roleId = args[0];
        this.curSkillIndex = args[1];
        this.roleData = PlayerData.GetRoleByPid(this.roleId);
        this.skillDataList = this.roleData.active_skills.concat();
        this.updateSkillItem();
    }
    protected onHide(...args: any[]): void {

    }
    private onUpdateSkill(roleId: string): void {
        if (this.roleId != roleId) return;
        this.flush(this.roleId, this.curSkillIndex);
    }
    private onClick(btn: Button): void {
        switch (btn) {
            case this.upgradeBtn:
                if (!ItemUtil.CheckThingConsumes(this.skillUpData.RewardType, this.skillUpData.RewardItemType, this.skillUpData.RewardNumber, true)) {
                    return;
                }
                let data = {
                    type: MsgTypeSend.RoleActiveSkillUpgrade,
                    data: {
                        role_id: this.roleId,
                        skill_id: this.skill_id
                    }
                }
                Session.Send(data);
                break;
            case this.leftBtn:
                if (this.curSkillIndex > 0) {
                    this.curSkillIndex--;
                    this.updateSkillItem();
                }
                break;
            case this.rightBtn:
                if (this.curSkillIndex < this.skillDataList.length - 1) {
                    this.curSkillIndex++;
                    this.updateSkillItem();
                }
                break;
        }
    }
    protected updateItem(item: Node, data: SThing) {
        let awardItem = item.getComponent(AwardItem);
        if (!awardItem) awardItem = item.addComponent(AwardItem);
        awardItem.SetData({ itemData: data }, true);
    }
    private updateSkillItem(): void {
        this.fullLv.active = false;
        this.leftBtn.node.active = this.curSkillIndex > 0;
        this.rightBtn.node.active = this.curSkillIndex < this.skillDataList.length - 1;
        let skillData: SPlayerDataSkill = this.skillDataList[this.curSkillIndex];
        this.curStd = CfgMgr.GetActiveSkill(skillData.skill_id, skillData.level);
        this.skillUpData = CfgMgr.GetActiveSkillUp(skillData.skill_id, skillData.level)
        this.skill_id = skillData.skill_id
        let qual = this.curStd.Quality;
        this.nameLab.color = new Color().fromHEX(skill_quality_color[this.curStd.Quality]);
        this.nameLab.string = this.curStd.Name;
        this.resIcon.active = true;
        this.lvLab.string = skillData.level.toString();
        this.nameLvLab.string = `${this.curStd.Name}   Lv.${skillData.level}`;
        this.descLabel.string = this.curStd.Text;
        let iconUrl: string = path.join(folder_skill, this.curStd.icon.toString(), "spriteFrame");
        ResMgr.LoadResAbSub(iconUrl, SpriteFrame, res => {
            this.icon.spriteFrame = res;
        });
        let bgUrl = path.join(folder_icon, "quality", "p_skill_bg_" + qual, "spriteFrame");
        ResMgr.LoadResAbSub(bgUrl, SpriteFrame, res => {
            this.bg.spriteFrame = res;
        });
        let nextLv: number = skillData.level + 1;
        let nextStd: StdActiveSkill = CfgMgr.GetActiveSkill(skillData.skill_id, nextLv);
        if (!nextStd) {
            this.fullLv.active = true;
            this.upgradeBtn.node.active = false;
            this.consumeCont.active = false;
            this.nextItem.active = false;
            return;
        }
        let is_up = PlayerData.GetActiveSkillIsUp(this.roleId)
        this.upgradeBtn.node.active = is_up;
        this.consumeCont.active = true;
        this.nextItem.active = true;
        this.nextDescLab.string = nextStd.Text;
        let itemDataList: SThing[] = ItemUtil.GetSThingList(this.skillUpData.RewardType, this.skillUpData.RewardItemType, this.skillUpData.RewardNumber);
        this.consumeItemLits.UpdateDatas(itemDataList);
    }
}