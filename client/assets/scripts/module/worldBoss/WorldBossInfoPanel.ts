import { Node, Label, RichText } from "cc";
import { Panel } from "../../GameRoot";
import { AutoScroller } from "../../utils/AutoScroller";
import { SPlayerDataSkill, SWorldBossData } from "../roleModule/PlayerStruct";
import { FormatAttr, SetPerValue, UpdateAttrItem } from "../common/BaseUI";
import { AttrSub } from "../common/AttrSub";
import { WorldBossSkillItem } from "./WorldBossSkillItem";

export class WorldBossInfoPanel extends Panel {
    protected prefab: string = "prefabs/panel/worldBoss/WorldBossInfoPanel";
    private nameLab:Label;
    private lvLab:Label;
    private descLab:RichText;
    private attrList:AutoScroller;
    private skillList:AutoScroller;
    private bossData:SWorldBossData;
    protected onLoad(): void {
        this.nameLab = this.find("nameLab", Label);
        this.lvLab = this.find("lvLab", Label);
        this.descLab = this.find("descLab", RichText);
        this.attrList = this.find("attrList", AutoScroller);
        this.attrList.SetHandle(UpdateAttrItem.bind(this));
        this.skillList = this.find("skillList", AutoScroller);
        this.skillList.SetHandle(this.updateSkillItem.bind(this));
        this.CloseBy("backBtn");
        this.CloseBy("mask");
    }
    public flush(bossData:SWorldBossData): void{
        this.bossData = bossData;
        this.updateShow();
    }
    
    protected onShow(): void {
        
    }
    protected onHide(...args: any[]): void {
        
    }

    private updateShow():void{
        if(!this.bossData) return;
        this.nameLab.string = this.bossData.name;
        this.lvLab.string = `Lv.${this.bossData.boss_lv}`;
        this.descLab.string = this.bossData.desc;
        let datas: AttrSub[] = [];
        if (this.bossData.attrTypeList.length) {
            let types = this.bossData.attrTypeList;
            let values = this.bossData.attrValueList;
            for (let i = 0; i < types.length; i++) {
                let data = FormatAttr(types[i], true);
                data.icon = "";
                let val = SetPerValue(data, values[i]);
                data.value = val;
                datas.push(data);
            }
        }
        this.attrList.UpdateDatas(datas);

        let skillList:SPlayerDataSkill[] = [];
        if(this.bossData.skillList){
            for (let index = 0; index < this.bossData.skillList.length; index++) {
                let skillId:number = this.bossData.skillList[index];
                skillList.push({skill_id:skillId, level:1});
            }
        }
        this.skillList.UpdateDatas(skillList);
    }

    private updateSkillItem(item: Node, data: SPlayerDataSkill):void{
        let rankItem = item.getComponent(WorldBossSkillItem) || item.addComponent(WorldBossSkillItem);
        rankItem.SetData(data);
    }
}