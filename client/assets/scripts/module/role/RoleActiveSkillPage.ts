import { Component, Node } from "cc";
import { AutoScroller } from "../../utils/AutoScroller";
import { RoleActiveSkillItem } from "./RoleActiveSkillItem";
import PlayerData, {  } from "../roleModule/PlayerData"
 import {SPlayerDataSkill} from "../roleModule/PlayerStruct";
import { ActiveSkillTipsPanel } from "../common/ActiveSkillTipsPanel";
import { RoleActiveSkillUpgradePanel } from "./RoleActiveSkillUpgradePanel";
import { EventMgr, Evt_Passive_Skill_Update } from "../../manager/EventMgr";
import { GameSet } from "../GameSet";


export class RoleActiveSkillPage extends Component {
    private activeSkillItemLits:AutoScroller;
    private roleId:string;
    private isInit:boolean = false;
    private skillDataList:SPlayerDataSkill[];
    protected onLoad(): void {
        this.activeSkillItemLits = this.node.getChildByName("activeSkillItemLits").getComponent(AutoScroller);
        this.activeSkillItemLits.SetHandle(this.updatSkillItem.bind(this));
        this.activeSkillItemLits.node.on('select', this.onSelect, this);
        EventMgr.on(Evt_Passive_Skill_Update, this.SetData, this);
        this.isInit = true;
        this.initShow();
    }

    /**
     * 设置角色数据
     * @param roleId 
     */
    SetData(roleId: string) {
        this.roleId = roleId;
        this.initShow();

    }

    private updatSkillItem(item:Node, data: SPlayerDataSkill):void{
        let skillItem:RoleActiveSkillItem = item.getComponent(RoleActiveSkillItem);
        if(!skillItem) skillItem = item.addComponent(RoleActiveSkillItem);
        skillItem.SetData(data, this.roleId);
    }

    protected onSelect(index: number, item: Node) {
        let skillData:SPlayerDataSkill = this.skillDataList[index];
        if(!skillData) return;
        if(GameSet.GetServerMark() == "hc"){
            RoleActiveSkillUpgradePanel.Show(this.roleId, index);
        }else{
            ActiveSkillTipsPanel.Show(skillData);
        }
    }

    private initShow():void {
        if (!this.isInit || !this.roleId) return;
        let roleData = PlayerData.GetRoleByPid(this.roleId);
        this.skillDataList = roleData.active_skills ? roleData.active_skills.concat() : [];
        this.activeSkillItemLits.UpdateDatas(this.skillDataList);
    }

    protected onDestroy(): void {
        EventMgr.off(Evt_Passive_Skill_Update, this.SetData, this);
    }
}