import { Button, Color, Component, Event, EventTouch, Input, Label, Layout, Node, RichText, ScrollView, Sprite, SpriteFrame, Toggle, Tween, UIOpacity, UITransform, Vec3, Widget, easing, find, instantiate, js, path, sp, tween, view } from "cc";
import { Panel } from "../../GameRoot";
import { AutoScroller } from "../../utils/AutoScroller";
import { SPlayerDataSkill, SThing, Tips2ID } from "../roleModule/PlayerStruct";
import { Attr, AttrFight, AttrType, CardQuality, CfgMgr, StdActiveSkill, StdMerge, StdPassiveLevel, StdRoleQuality, StdRoleQualityUp, StdRoleSkillClear, ThingType } from "../../manager/CfgMgr";
import { ResMgr, folder_attr, folder_common, folder_icon, folder_item, folder_quality, folder_skill, skill_quality_color } from "../../manager/ResMgr";
import { EventMgr, Evt_Hide_Scene, Evt_Show_Scene, Evt_XiLianSkillLogUpdate } from "../../manager/EventMgr";
import { MsgTypeSend } from "../../MsgType";
import { Session } from "../../net/Session";
import { DateUtils } from "../../utils/DateUtils";


export class FanyuXiLianLogPanel extends Panel {
    protected prefab: string = "prefabs/panel/FanyuXiLianLogPanel";

    private LogScrollView: AutoScroller;
    private closeBtn: Node
    private noneListCont:Node;

    private roleId:string;
    protected onLoad() {
        this.closeBtn = this.find(`closeBtn`);
        this.noneListCont = this.find(`noneListCont`);
        this.LogScrollView = this.find("LogScrollView", AutoScroller);
        this.LogScrollView.SetHandle(this.updateSkillLog.bind(this));
        this.closeBtn.on(Input.EventType.TOUCH_END, this.Hide, this);
        EventMgr.on(Evt_XiLianSkillLogUpdate, this.showXiLianLog, this)
    }

    protected onShow(): void {
        EventMgr.emit(Evt_Hide_Scene, js.getClassName(this));
    }

    public flush(role_id): void {
        this.LogScrollView.UpdateDatas([])
        this.noneListCont.active = true;
        this.roleId = role_id;  
        this.onSend();
    }

    private onSend(){
        if(this.roleId){
            let XiLianData = {
                type: MsgTypeSend.GetRoleSkillShuffleRecords,
                data: { role_id: this.roleId, page:1, page_size:50}
            }
            Session.Send(XiLianData)
        }
    }

    private showXiLianLog(data:{record_timestamp:number, player_id:string, role_id:string, shuffle_id:string,new_passive_skills:SPlayerDataSkill[]}[]){
        if(data  && data.length > 0){
            this.noneListCont.active = false;
            this.LogScrollView.UpdateDatas(data)
        }else{
            this.noneListCont.active = true;
        }
    }

    private updateSkillLog(item: Node, data:{record_timestamp:number, player_id:string, role_id:string, shuffle_id:string,new_passive_skills:SPlayerDataSkill[]}, index: number) {
        let countLab = item.getChildByName("countLab").getComponent(Label);
        let time_data:string[] = DateUtils.TimestampToDate(data.record_timestamp * 1000, true);
        countLab.string = `${time_data[0]}年${time_data[1]}月${time_data[2]}日${time_data[3]}时${time_data[4]}分${time_data[5]}秒`;
        let SkillScrollView = item.getChildByName("SkillScrollView").getComponent(AutoScroller);
        SkillScrollView.SetHandle(this.updateSkillItem.bind(this));
        let skill_lsit = [];
        for (let index = 0; index < 10; index++) {
            if(data.new_passive_skills[index]){
                skill_lsit.push(data.new_passive_skills[index]);
            }else{
                skill_lsit.push(null);
            }
        }
        SkillScrollView.UpdateDatas(skill_lsit);
    }

    private updateSkillItem(item: Node, data: SPlayerDataSkill, index: number) {
        let bg = item.getChildByName("bg").getComponent(Sprite);
        let icon = item.getChildByPath("Mask/icon").getComponent(Sprite);
        let nameLab = item.getChildByPath("nameLab").getComponent(Label);
        let lvCont = item.getChildByName("lvCont");
        let lvLab = item.getChildByPath("lvCont/lvLab").getComponent(Label);
        let resIcon = item.getChildByName("resIcon");
        let lock = item.getChildByName("lock");

        let qual: number = 0;
        if (data) {
            let stdSkill: StdPassiveLevel = CfgMgr.GetPassiveSkill(data.skill_id, data.level);
            qual = stdSkill.RareLevel;
            lock.active = false;
            lvCont.active = true;
            icon.node.active = true;
            nameLab.color = new Color().fromHEX(skill_quality_color[stdSkill.RareLevel]);
            nameLab.string = stdSkill.Name;
            resIcon.active = stdSkill.ResoureType > 0;
            lvLab.string = data.level.toString();
            let iconUrl: string = path.join(folder_skill, stdSkill.Icon.toString(), "spriteFrame");
            ResMgr.LoadResAbSub(iconUrl, SpriteFrame, res => {
                if (icon) icon.spriteFrame = res;
            });
        } else {
            lock.active = true;
            lvCont.active = false;
            icon.node.active = false;
            nameLab.string = "";
            resIcon.active = false;
            lvLab.string = "";
        }
        let bgUrl = path.join(folder_icon, "quality", "p_skill_bg_" + qual, "spriteFrame");
        ResMgr.LoadResAbSub(bgUrl, SpriteFrame, res => {
            if (bg) bg.spriteFrame = res;
        });
    }

    protected onHide(...args: any[]): void {
        EventMgr.emit(Evt_Show_Scene, js.getClassByName(this));
    }

}