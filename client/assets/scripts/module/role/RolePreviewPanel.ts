import { Button, EventTouch, Input, Label, Layout, Node, ProgressBar, RichText, ScrollView, Sprite, SpriteFrame, Toggle, Widget, instantiate, js, path } from "cc";
import { Panel } from "../../GameRoot";
import { EventMgr, Evt_Hide_Scene, Evt_RightsGetReward, Evt_Show_Scene, Goto } from "../../manager/EventMgr";
import { CardQuality, CfgMgr, ItemType, StdActiveSkill, StdEquityList, StdItem, StdPassiveLevel, StdRole, StdRoleLevel, StdRoleQuality, StdShopowner, ThingType } from "../../manager/CfgMgr";
import { ResMgr, folder_icon, folder_loot, folder_quality, folder_skill } from "../../manager/ResMgr";
import { AutoScroller } from "../../utils/AutoScroller";
import { ItemUtil } from "../../utils/ItemUtils";
import PlayerData, {} from "../roleModule/PlayerData"
 import {SPlayerDataItem,SPlayerDataRole,SThing} from "../roleModule/PlayerStruct";
import { BagItem } from "../bag/BagItem";
import { MsgTypeSend } from "../../MsgType";
import { Session } from "../../net/Session";
import { Tips } from "../login/Tips";
import { MsgPanel } from "../common/MsgPanel";
import { CLICKLOCK } from "../common/Drcorator";
import { TradeHeroPanel } from "../trade/TradeHeroPanel";
import { FormatAttr, FormatRewards, FormatRoleAttr, FormatRoleFightAttr, SetNodeGray, SetPerValue, UpdateAttrItem } from "../common/BaseUI"
import { AttrSub, ConditionSub } from "../common/AttrSub";
import { GameSet } from "../GameSet";
import { LinkmanItem } from "../rights/LinkmanItem";
import LocalStorage from "../../utils/LocalStorage";
import { ItemTips } from "../common/ItemTips";


export class RolePreviewPanel extends Panel {
    protected prefab: string = "prefabs/panel/role/RolePreviewPanel";

    private navBtns: Node[];
    private page1: Node;
    private LvScrollView: AutoScroller;
    private page2: Node;
    private QualityScrollView: AutoScroller;
    private page3: Node;
    private SkillScrollView: ScrollView;
    private page3_item: Node;

    private page: number
    private roleData: StdRole;
    private playerDataRole: SPlayerDataRole;

    protected onLoad(): void {
        this.CloseBy("bg/closeBtn");
        this.CloseBy("mask");
        this.page1 = this.find("bg/page1");
        this.LvScrollView = this.find("bg/page1/LvScrollView", AutoScroller);
        this.LvScrollView.SetHandle(this.updateRoleLvData.bind(this));
        this.page2 = this.find("bg/page2");
        this.QualityScrollView = this.find("bg/page2/QualityScrollView", AutoScroller);
        this.QualityScrollView.SetHandle(this.updateRoleQualityData.bind(this));
        this.page3 = this.find("bg/page3");
        this.SkillScrollView = this.find("bg/page3/SkillScrollView", ScrollView);

        this.navBtns = this.find("bg/navBar").children.concat();
        for (let btn of this.navBtns) {
            btn.on('toggle', this.onPage, this);
        }
        this.page3_item = this.find("bg/page3/SkillScrollView/view/content/skillItem");
    }

    protected onShow(): void {
        EventMgr.emit(Evt_Hide_Scene, js.getClassName(this));
    }

    public flush(role: StdRole, playerDataRole: SPlayerDataRole) {
        this.roleData = role;
        this.playerDataRole = playerDataRole
        this.SetPage(0);
    }

    public SetPage(page: number) {
        if (!this.navBtns[page]) return;
        this.page = undefined;
        this.navBtns[page].getComponent(Toggle).isChecked = true;
        this.onPage(this.navBtns[page].getComponent(Toggle));
    }

    private onPage(toggle: Toggle) {
        let page = this.navBtns.indexOf(toggle.node);
        if (page < 0 || page == this.page) return;
        this.page = page;
        this.page1.active = false;
        this.page2.active = false;
        this.page3.active = false;

        switch (this.page) {
            case 0:
                this.page1.active = true;
                let role_lv_list = []
                let lvstds: StdRoleLevel[] = CfgMgr.Get("role_level");
                for (let std of lvstds) {
                    if (std.RoleType == this.roleData.RoleType && std.Level <= 50) {
                        role_lv_list.push(std)
                    }
                }
                this.LvScrollView.UpdateDatas(role_lv_list);
                break;
            case 1:
                this.page2.active = true;
                let role_quality_list = []
                let qualitystds: StdRoleQuality[] = CfgMgr.Get("role_qualityuo");
                for (let std of qualitystds) {
                    if (std.Roleid == this.roleData.RoleType) {
                        role_quality_list.push(std)
                    }
                }
                this.QualityScrollView.UpdateDatas(role_quality_list);
                break;
            case 2:
                this.page3.active = true;
                let skill_data: any[] = []

                let data_active = { is_active: true, skill_list: [] }
                let active_skills = [];
                active_skills.push(this.roleData.Skill1);
                active_skills.push(this.roleData.Skill2);
                data_active.skill_list = active_skills;
                data_active.is_active = true;
                skill_data.push(data_active)

                let data_passive = { is_active: true, skill_list: [] }
                let passive_skills = [];
                passive_skills.push(this.roleData.PassiveGife);
                passive_skills.push(this.roleData.PassiveJob);
                data_passive.skill_list = passive_skills;
                data_passive.is_active = false;
                skill_data.push(data_passive)

                this.SkillScrollView.content.removeAllChildren();
                for (let index = 0; index < skill_data.length; index++) {
                    const element = skill_data[index];
                    let item = instantiate(this.page3_item);
                    this.updateRoleSkillData(item, element);
                    this.SkillScrollView.content.addChild(item);
                }
            default:
                break;
        }
    }
    private updateRoleLvData(item: Node, data: StdRoleLevel) {
        let role_name = item.getChildByPath("item_bg/text").getComponent(Label);
        role_name.string = this.roleData.Name + "  Lv." + data.Level + "   战力预览:" + data.Power;

        // let nowLevelIcon = item.getChildByPath("item_bg/nowLevelIcon");
        // nowLevelIcon.active = this.playerDataRole && this.playerDataRole.level == data.Level;

        let attrList = item.getChildByPath("item_bg/CaiLiaoScrollView").getComponent(AutoScroller);
        attrList.SetHandle(this.UpdateAttrItem.bind(this));

        let newList: AttrSub[] = [];
        let list1 = [];
        let list2 = [];
        //角色等级属性   
        if (data && data.AttrFight.length) {
            list1 = this.forAttr(data.AttrFight, data.AttrFightValue, true);
        }
        if (data && data.Attr.length) {
            list2 = this.forAttr(data.Attr, data.AttrValue, false);
        }
        newList = list1.concat(list2);
        attrList.UpdateDatas(newList);

        let JiangLIScrollView = item.getChildByPath("item_bg/JiangLIScrollView").getComponent(AutoScroller);
        JiangLIScrollView.SetHandle(this.UpdateRewardItem.bind(this));
        if (data.TaskID) {
            let config = CfgMgr.GetTaskById(data.TaskID)
            let reward_list = FormatRewards(config);
            JiangLIScrollView.UpdateDatas(reward_list)
        } else {
            JiangLIScrollView.UpdateDatas([])
        }

        let jindu = item.getChildByPath("item_bg/jindu");
        let Progress = item.getChildByPath("item_bg/jindu/ProgressBar").getComponent(ProgressBar);
        let ProgressLabel = item.getChildByPath("item_bg/jindu/ProgressLabel").getComponent(Label);
        let upCostItemScrollView = item.getChildByPath("item_bg/upCostNode/upCostItemScrollView").getComponent(AutoScroller);
        upCostItemScrollView.SetHandle(this.updateCostData.bind(this));
        let lbl = item.getChildByPath("item_bg/upCostNode/lbl").getComponent(Label);
        // let point = item.getChildByName("point");
        // point.active = true;
        // point.children.forEach((child: Node) => {
        //     child.active = false;
        // })
        // let name = "future";
        // if (this.playerDataRole && this.playerDataRole.level >= data.Level) {
        //     name = this.playerDataRole.level == data.Level ? "now" : "finish";
        //     name = data.Level == 1 ? name == "now" ? "oneNow" : "oneFinish" : name;
        // }
        // point.getChildByName(name).active = true;

        let item_type: number[] = [];
        let item_id: number[] = [];
        let item_num: number[] = []
        if (data.Exp) {
            jindu.active = true;
            lbl.string = "等级升级消耗材料"
            let items: any[] = [];
            let stdItem = CfgMgr.Get("Item");
            for (let index in stdItem) {
                let item = stdItem[index]
                if (item.Type == ThingType.ThingTypeItem && item.Itemtpye == ItemType.exp) {
                    items.push(item);
                }
            }

            for (let index = 0; index < items.length; index++) {
                const element: StdItem = items[index];
                item_type.push(1);
                item_id.push(element.Items)
                item_num.push(0)
            }
            let cost_list = ItemUtil.GetSThingList(item_type, item_id, item_num);
            upCostItemScrollView.UpdateDatas(cost_list)
            Progress.progress = 1;
            ProgressLabel.string = data.Exp + "";
            // if (this.playerDataRole && this.playerDataRole.level >= data.Level) {
            //     let exp = this.playerDataRole.level == data.Level ? this.playerDataRole.experience : data.Exp;
            //     Progress.progress = exp / data.Exp;
            //     ProgressLabel.string = exp + "/" + data.Exp;
            // } else {
            //     Progress.progress = 0;
            //     ProgressLabel.string = 0 + "/" + data.Exp;
            // }
        } else {
            lbl.string = "等级突破消耗材料"
            jindu.active = false;
            for (let index = 0; index < data.BreakItem.length; index++) {
                item_type.push(1);
                item_id.push(data.BreakItem[index])
                item_num.push(data.BreakCost[index])
            }
            if (data.Cost) {
                item_type.push(2);
                item_id.push(0);
                item_num.push(data.Cost);
            }
            let cost_list = ItemUtil.GetSThingList(item_type, item_id, item_num);
            upCostItemScrollView.UpdateDatas(cost_list)
        }
    }

    private async updateCostData(item: Node, data: SThing) {
        let icon = item.getChildByName("icon").getComponent(Sprite);
        let count = item.getChildByName("count").getComponent(Label);
        icon.spriteFrame = await ResMgr.LoadResAbSub(path.join(data.resData.iconUrl), SpriteFrame);
        count.string = data.item.count == 0 ? "" : data.item.count + "";
    }

    private async updateRoleQualityData(item: Node, data: StdRoleQuality) {
        let role_name = item.getChildByPath("item_bg/role_name").getComponent(Label);
        role_name.string = this.roleData.Name;
        let quality_icon = item.getChildByPath("item_bg/quality_icon").getComponent(Sprite);
        quality_icon.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_quality, CardQuality[data.QualityType], "spriteFrame"), SpriteFrame);
        let power = item.getChildByPath("item_bg/power").getComponent(Label);
        power.string = "战力预览:" + data.Power;
        let attrList = item.getChildByPath("item_bg/attrScrollView").getComponent(AutoScroller);
        attrList.SetHandle(this.UpdateAttrItem.bind(this));
        
        let newList: AttrSub[] = [];
        let list1 = [];
        let list2 = [];
        //角色品质属性
        let stdQuality = CfgMgr.GetRoleQuality(data.Roleid, data.QualityType);
        if (stdQuality && stdQuality.AttrFight.length) {
            list1 = this.forAttr(stdQuality.AttrFight, stdQuality.AttrFightValue, true);
        }
        let stdQualitycji = CfgMgr.GetRoleQuality(data.Roleid, data.QualityType);
        if (stdQualitycji && stdQualitycji.Attr.length) {
            list2 = this.forAttr(stdQualitycji.Attr, stdQualitycji.AttrValue, false);
        }
        newList = list1.concat(list2);
        for (let index = 0; index < newList.length; index++) {
            const element = newList[index];
            if (element.name == "带兵数量") {
                element.value = data.SoldierNum[0] + "~" + data.SoldierNum[1];
            }
        }
        attrList.UpdateDatas(newList);

        let reawd = item.getChildByPath("item_bg/JiangLIScrollView").getComponent(AutoScroller);
        reawd.SetHandle(this.UpdateRewardItem.bind(this));
        if (data.RewardID) {
            let config = CfgMgr.GetTaskById(data.RewardID)
            let reward_list = FormatRewards(config);
            reawd.UpdateDatas(reward_list);
        } else {
            reawd.UpdateDatas([]);
        }
    }
    private updateRoleSkillData(item: Node, data: { is_active: boolean, skill_list: number[] }) {
        let title = item.getChildByPath("bg/title").getComponent(Label);
        title.string = data.is_active ? "主动技能" : "被动技能";
        let content = item.getChildByPath("skill_lv_conten");
        let skill_lv_conten_item = item.getChildByPath("skill_lv_conten/skill_lv_conten_item");
        content.removeAllChildren();
        for (let index = 0; index < data.skill_list.length; index++) {
            const element = data.skill_list[index];
            let item = instantiate(skill_lv_conten_item);
            this.setSkillLVData(item, element, data.is_active, index + 1)
            content.addChild(item);
        }
    }

    private setSkillLVData(item: Node, skill_id: number, is_active: boolean, num) {
        let title = item.getChildByPath("skill_bg/text").getComponent(Label);
        title.string = is_active ? "主动技能" + num : "被动技能" + num;
        let content = item.getChildByPath("skill_lv_desc_conten");
        let skill_lv_desc_conten_item = item.getChildByPath("skill_lv_desc_conten/skill_lv_desc_conten_item");
        content.removeAllChildren();

        let allSkillList: StdActiveSkill[] | StdPassiveLevel[] = is_active ? CfgMgr.GetActiveSkillList() : CfgMgr.Get("PassiveLevel");

        let skill_list: any[] = []
        for (let index = 0; index < allSkillList.length; index++) {
            const stdSkill = allSkillList[index];
            let skill_data_list: { name: string, lv: number, icon: any, desc: string, is_active: boolean } = { name: "", lv: 1, icon: "", desc: "", is_active: is_active }
            if (is_active) {
                let skill_data = stdSkill as StdActiveSkill
                if (skill_data.SkillId == skill_id) {
                    skill_data_list.name = skill_data.Name;
                    skill_data_list.lv = skill_data.SkillType;
                    skill_data_list.icon = skill_data.icon;
                    skill_data_list.desc = skill_data.Text
                    skill_list.push(skill_data_list);
                }
            } else {
                let skill_data = stdSkill as StdPassiveLevel
                if (skill_data.ID == skill_id) {
                    skill_data_list.name = skill_data.Name;
                    skill_data_list.lv = skill_data.Level;
                    skill_data_list.icon = skill_data.Icon;
                    skill_data_list.desc = skill_data.Desc
                    skill_list.push(skill_data_list);
                }
            }

        }
        for (let index = 0; index < skill_list.length; index++) {
            const element = skill_list[index];
            let item = instantiate(skill_lv_desc_conten_item);
            this.setSkillDescData(item, element)
            content.addChild(item);
        }

    }

    private async setSkillDescData(item: Node, data: { name: string, lv: any, icon: string, desc: string, is_active: boolean }) {
        let skill_name = item.getChildByName("skill_name").getComponent(Label);
        skill_name.string = data.name + "   Lv." + data.lv;
        let skill_desc = item.getChildByName("skill_desc").getComponent(RichText);
        skill_desc.string = data.desc;
        let bg = item.getChildByPath("skill_icon/bg").getComponent(Sprite);
        let skill_bg = data.is_active ? "a_skill_bg_" : "p_skill_bg_";
        bg.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_quality, skill_bg + data.lv, "spriteFrame"), SpriteFrame);
        let icon = item.getChildByPath("skill_icon/Mask/icon").getComponent(Sprite);
        icon.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_skill, data.icon.toString(), "spriteFrame"), SpriteFrame);
    }

    private forAttr = (attrList: number[], valList: number[], iscaiji: boolean) => {
        let typeIndexMap: { [key: string]: number } = js.createMap();
        let newList: AttrSub[] = [];
        let typeIndex: number;
        let attrSub: AttrSub;
        let type: number;
        let val: number;
        for (let i = 0; i < attrList.length; i++) {
            type = attrList[i];
            //策划让屏蔽掉战斗力这个属性
            if (type == 3) {
                continue;
            }
            val = valList && i < valList.length ? valList[i] : 0;
            attrSub = FormatAttr(type, iscaiji);
            // if (attrSub.per && attrSub.per != "") val = val * 100;
            val = SetPerValue(attrSub, val);
            attrSub.value = val;
            typeIndex = newList.length;
            typeIndexMap[type] = typeIndex;
            newList[typeIndex] = attrSub;
        }
        return newList
    }

    private UpdateAttrItem(item: Node, data: AttrSub) {
        let name = item.getChildByName("name").getComponent(Label);
        let value = item.getChildByName("value").getComponent(Label);

        name.string = data.name;
        value.string = "+" + data.value + data.per;
    }

    private async UpdateRewardItem(item: Node, data: AttrSub) {
        let bg = item.getChildByName("bg").getComponent(Sprite);
        let icon = item.getChildByName("icon").getComponent(Sprite);
        let count = item.getChildByName("count").getComponent(Label);

        bg.spriteFrame = await ResMgr.LoadResAbSub<SpriteFrame>(path.join(folder_icon, "quality", data.quality + "_bag_bg", "spriteFrame"), SpriteFrame);
        icon.spriteFrame = await ResMgr.LoadResAbSub<SpriteFrame>(path.join(data.icon), SpriteFrame);
        count.string = data.value;
        let cfg = CfgMgr.Getitem(data.id);
        item.off(Button.EventType.CLICK);
        item.on(Button.EventType.CLICK, () => { ItemTips.Show(cfg) }, this);
    }

    protected onHide(...args: any[]): void {
        EventMgr.emit(Evt_Show_Scene, js.getClassByName(this));
    }
}