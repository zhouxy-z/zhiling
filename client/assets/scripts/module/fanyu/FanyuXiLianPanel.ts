import { Button, Color, Input, Label, Node, Quat, Sprite, SpriteFrame, UITransform, Vec3, instantiate, js, path, sp, tween} from "cc";
import { Panel } from "../../GameRoot";
import { AutoScroller } from "../../utils/AutoScroller";
import PlayerData from "../roleModule/PlayerData"
import { SPlayerDataRole, SPlayerDataSkill, Tips2ID} from "../roleModule/PlayerStruct";
import { CardQuality, CfgMgr, StdPassiveLevel, StdRoleSkillClear, ThingItemId, ThingType } from "../../manager/CfgMgr";
import { ResMgr, folder_attr, folder_common, folder_icon, folder_item, folder_quality, folder_skill, skill_quality_color } from "../../manager/ResMgr";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import { SetNodeGray} from "../common/BaseUI"
import { SelectHeroPanel } from "../common/SelectHeroPanel";
import { EventMgr, Evt_Currency_Updtae, Evt_Hide_Scene, Evt_Item_Change, Evt_Show_Scene, Evt_XiLianSkillDataSvaeUpdate, Evt_XiLianSkillDataUpdate, Evt_XiLianSkillLogUpdate, Goto } from "../../manager/EventMgr";
import { ItemUtil } from "../../utils/ItemUtils";
import { PANEL_TYPE } from "../../manager/PANEL_TYPE";
import { Second, ToFixed } from "../../utils/Utils";
import { FanyuXiLianLogPanel } from "./FanyuXiLianLogPanel";
import { FanyuXiLianSavePanel } from "./FanyuXiLianSavePanel";
import { Tips } from "../login/Tips";
import { Tips2 } from "../home/panel/Tips2";
import { PassiveSkillTipsPanel } from "../common/PassiveSkillTipsPanel";
import { GameSet } from "../GameSet";

export class FanyuXiLianPanel extends Panel {
    protected prefab: string = "prefabs/panel/FanyuXiLianPanel";

    private roleNode: Node;
    private car: Node;
    private add_btn: Node;

    private noHasLab:Node;
    private noHasSpr:Node;
    private costLayout: AutoScroller;
    
    private xilianBtn: Button;
    private xilian_cost_node:Node
    private xilian_closeBtn: Node;
    private xilian_helpBtn:Node;
    private logBtn:Node;
    private closeBtn: Node;
    private navBar: Node;
    private sureNode:Node
    private noSaveBtn: Button;
    private saveBtn: Button;
    private PassiveSkillNode:Node
    private XiLianPassiveSkillNode:Node
    private soldier_count1:Label
    private soldier_count2:Label
    private clone_item:Node;
    private spineNode:sp.Skeleton;
    private skillUpContent:Node
    private skillDownContent:Node
    private skillMoveContent:Node
    private tips:Node;
    private fire_spine1:sp.Skeleton
    private fire_spine2:sp.Skeleton



    private xilianRole: SPlayerDataRole;
    private xilianCfg: StdRoleSkillClear;
    private shuffle_id:string;
    private max_solider:number = 0;
    private is_start_tween:boolean = false

    protected onLoad() {
        this.closeBtn = this.find(`closeBtn`);
        this.clone_item = this.find(`xilianPage/skillBg/passiveSkillItem`);
        this.xilian_closeBtn = this.node.getChildByPath("xilianPage/xilian_closeBtn");
        this.roleNode = this.node.getChildByPath("xilianPage/roleNode");
        this.car = this.node.getChildByPath("xilianPage/roleNode/car");
        this.add_btn = this.node.getChildByPath("xilianPage/roleNode/unknown");
        this.noHasLab = this.node.getChildByPath("xilianPage/skillBg/noHasLab");
        this.noHasSpr = this.node.getChildByPath("xilianPage/skillBg/noHasSpr");
        this.soldier_count1 = this.find("xilianPage/skillBg/soldierNode1/soldier_count", Label);
        this.soldier_count2 = this.find("xilianPage/skillBg/soldierNode2/soldier_count", Label);
        this.tips = this.find(`xilianPage/tips`);

        this.xilian_cost_node = this.node.getChildByPath("xilianPage/skillBg/costNode");

        this.costLayout = this.node.getChildByPath("xilianPage/skillBg/costNode/costLayout").getComponent(AutoScroller);
        this.costLayout.SetHandle(this.updateCostItem.bind(this));
        this.PassiveSkillNode = this.find(`xilianPage/skillBg/skillItemNode/PassiveSkillNode`);
        this.XiLianPassiveSkillNode = this.find(`xilianPage/skillBg/skillItemNode/XiLianPassiveSkillNode`);
        this.spineNode = this.find(`xilianPage/skillBg/skillItemNode/spineNode/spine`,sp.Skeleton);
        this.skillUpContent = this.find(`xilianPage/skillBg/skillItemNode/skillUpContent`);
        this.skillDownContent = this.find(`xilianPage/skillBg/skillItemNode/skillDownContent`);
        this.skillMoveContent = this.find(`xilianPage/skillBg/skillItemNode/skillMoveContent`);
        this.fire_spine1 = this.find(`xilianPage/fire_spine`,sp.Skeleton);
        this.fire_spine2 = this.find(`xilianPage/fire_spine2`,sp.Skeleton);

        this.xilianBtn = this.node.getChildByPath("xilianPage/xilianBtn").getComponent(Button);
        this.xilian_helpBtn = this.node.getChildByPath("xilianPage/helpBtn");
        this.logBtn = this.find("xilianPage/logBtn");
        this.sureNode = this.find("xilianPage/sureNode")
        this.noSaveBtn = this.node.getChildByPath("xilianPage/sureNode/noSaveBtn").getComponent(Button);
        this.saveBtn = this.node.getChildByPath("xilianPage/sureNode/saveBtn").getComponent(Button);
        this.navBar = this.find("navBar");
        this.navBar.children.forEach((node, index) => {
            node.on(Input.EventType.TOUCH_END, () => {
                this.setNav(index)
            })
        })
        this.closeBtn.on(Input.EventType.TOUCH_END, this.Hide, this);
        this.add_btn.on(Input.EventType.TOUCH_END, this.onAddXiLianRole, this);
        this.car.on(Input.EventType.TOUCH_END, this.onAddXiLianRole, this);
        this.xilianBtn.node.on("click", this.onXiLian, this);
        this.xilian_closeBtn.on(Input.EventType.TOUCH_END, this.initXiLian, this);
        this.xilian_helpBtn.on(Input.EventType.TOUCH_END, this.onHelpBtn2, this);
        this.logBtn.on(Input.EventType.TOUCH_END, this.onLogBtn, this);
        this.noSaveBtn.node.on("click", this.onIsSvave, this);
        this.saveBtn.node.on("click", this.onIsSvave, this);

        EventMgr.on(Evt_XiLianSkillDataUpdate, this.updateSkill, this)
        EventMgr.on(Evt_XiLianSkillDataSvaeUpdate, this.setXiLianSave, this)
        EventMgr.on(Evt_Item_Change, this.setCostItem, this)
        EventMgr.on(Evt_Currency_Updtae, this.setCostItem, this) 
    }

    protected onShow(): void {
        EventMgr.emit(Evt_Hide_Scene, js.getClassName(this));
    }

    public flush(...args: any[]): void {   
        if(GameSet.GetServerMark() != "hc"){
            this.navBar.children[2].active = false;
        } 
        this.initXiLian();
    }

    //切页
    private setNav(index) {
        if (index == 0) {
            Goto(PANEL_TYPE.FanyuPanel);
            this.Hide();
        } else if (index == 1) {
            Goto(PANEL_TYPE.FanyuJinHuaPanel)
            this.Hide();
        }else if (index == 2) {
            Goto(PANEL_TYPE.FanyuChongSuiPanel)
            this.Hide();
        } else if (index == 3) {
            return;
        }
    }

    private initXiLian(){
        this.skillUpContent.removeAllChildren();
        this,this.skillDownContent.removeAllChildren();
        this.skillMoveContent.removeAllChildren();
        this.fire_spine1.setAnimation(0, "Idle", true);
        this.fire_spine2.setAnimation(0, "Idle", true);
        this.xilianRole = null;
        this.navBar.active = true;
        this.closeBtn.active = true;
        this.xilian_closeBtn.active = false;
        this.soldier_count1.node.parent.active = false;
        this.soldier_count2.node.parent.active = false;
        this.tips.active = false;
        this.updateCarItem(this.roleNode);
        this.noHasLab.active = true;
        this.noHasSpr.active = true;
        this.spineNode.node.parent.active = false;
        this.xilian_cost_node.active = false;
        this.sureNode.active = false;
        SetNodeGray(this.xilianBtn.node, true)
    }

    private onAddXiLianRole() {
        let curRoles = PlayerData.getXiLianRole();
        if(!curRoles || curRoles.length <= 0) return Tips.Show("暂无可洗练英雄")
        SelectHeroPanel.SelectXiLian(curRoles, [this.xilianRole], 1, this.setXiLianRole.bind(this));
    }

    /**初始化角色 */
    private setXiLianRole(selects: SPlayerDataRole[]) {
        if(!selects[0]){
            this.initXiLian();
            return
        }
        this.skillUpContent.removeAllChildren();
        this.skillDownContent.removeAllChildren();
        this.skillMoveContent.removeAllChildren();
        this.xilianRole = selects[0];
        this.navBar.active = false;
        this.closeBtn.active = false;
        this.xilian_closeBtn.active = true;
        this.tips.active = true;
        this.soldier_count1.node.parent.active = true;
        this.spineNode.node.parent.active = false;
        this.sureNode.active = false;
        this.noHasLab.active = false;
        this.max_solider = CfgMgr.GetRoleQuality(selects[0].type, selects[0].quality - 1).SoldierNum[1];
        this.soldier_count1.string = selects[0].soldier_num + "/" + this.max_solider;
        this.updateCarItem(this.roleNode)
        this.skillUpContent.removeAllChildren();
        this.skillDownContent.removeAllChildren();
        this.setInitSkillTween();
        this.setCostItem();
    }

    /**初始化角色技能和技能动画 */
    private setInitSkillTween(){
       //获取玩家技能排除初始的两个
       let init_skill = []
       init_skill.push(CfgMgr.GetRole()[this.xilianRole.type].PassiveGife);
       init_skill.push(CfgMgr.GetRole()[this.xilianRole.type].PassiveJob);
       let has_pass_skill = []
       for (let index = 0; index < this.xilianRole.passive_skills.length; index++) {
            const element_skill = this.xilianRole.passive_skills[index];
            has_pass_skill.push(element_skill);
       }

       for (let index = has_pass_skill.length - 1; index >= 0; index--) {
            const element_skill = has_pass_skill[index];
            for (let i = 0; i < init_skill.length; i++) {
                const element = init_skill[i];
                if(element_skill.skill_id == element){
                    has_pass_skill.splice(index, 1)
                }   
            }
       }
  
       for (let i = 9; i >= 0; i--) {
           let  item1 = instantiate(this.clone_item);
           let skill_data = has_pass_skill[i] ? has_pass_skill[i] : null;
           this.updateSkillItem(item1, skill_data)
           let y = i >= 5 ? 250 : 443
           item1.setPosition(item1.getPosition().x, y)
           this.skillUpContent.addChild(item1);
           tween(item1)
           .to(1, {position:new Vec3(this.PassiveSkillNode.children[i].getPosition())})
           .start()

           let item = instantiate(this.clone_item);
           this.updateSkillItem(item, null)
           let y1 = i >= 5 ? -150 : -343
           item.setPosition(-item.getPosition().x, y1)
           this.skillDownContent.addChild(item);
           tween(item)
           .to(1, {position:new Vec3(this.XiLianPassiveSkillNode.children[9 - i].getPosition())})
           .start()
       }
    }

    /**初始化消耗道具以及洗练按钮状态 */
    private setCostItem(){
        if(!this.xilianRole) return;
        this.xilianCfg = CfgMgr.GetRoleSkillClearCfg(this.xilianRole.type, this.xilianRole.quality);
        this.xilian_cost_node.active = true;
        let is_can_jinhua: boolean = false;
        let is_has_list: boolean[] = [];
        let cost_item = [];
        let itemData = ItemUtil.GetSThingList(this.xilianCfg.RewardType, this.xilianCfg.RewardID, this.xilianCfg.RewardNumber);
        for (let index = 0; index < itemData.length; index++) {
            const element = itemData[index];
            let has_count = 0;
            let cost_data: { icon: string, count: number, has_count: number } = { icon: "", count: 0, has_count: 0 };
            if (element.item) {
                if (element.item.id == ThingItemId.ItemId_1) {
                    has_count = PlayerData.roleInfo.currency;
                } else if (element.item.id == ThingItemId.ItemId_2) {
                    has_count = PlayerData.roleInfo.currency2;
                } else if (element.item.id == ThingItemId.ItemId_3) {
                    has_count = PlayerData.roleInfo.currency3;
                } else {
                    has_count = PlayerData.GetItemCount(element.item.id);
                }
            }
            cost_data.icon = element.resData.iconUrl;
            cost_data.count = element.item.count;
            cost_data.has_count = has_count;
            cost_item.push(cost_data);
            is_has_list.push(element.item.count > has_count);
        }
        this.costLayout.UpdateDatas(cost_item);
        is_can_jinhua = is_has_list.indexOf(true) != -1
        if(!this.is_start_tween){
            SetNodeGray(this.xilianBtn.node, is_can_jinhua)
        }
    }

    /**设置角色卡片信息 */
    private async updateCarItem(item: Node) {
        let unknown = item.getChildByName("unknown");
        let car = item.getChildByName("car");
        unknown.active = this.xilianRole ? false : true;
        car.active = this.xilianRole ? true : false;
        if(!this.xilianRole)return;
        let cfg = CfgMgr.GetRole()[this.xilianRole.type];
        let bg = item.getChildByPath("car/bg").getComponent(Sprite);
        let bgEffect = item.getChildByPath("car/bgEffect").getComponent(sp.Skeleton);
        let pillarBg = item.getChildByPath("car/pillarBg").getComponent(Sprite);
        let typeIcon = item.getChildByPath("car/type").getComponent(Sprite);
        let quality = item.getChildByPath("car/quality").getComponent(Sprite);
        let body = item.getChildByPath("car/body").getComponent(sp.Skeleton);
        let role_power = item.getChildByPath("car/power/value").getComponent(Label);
        let role_Lv = item.getChildByPath("car/level").getComponent(Label);

        bg.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_icon, "quality", CardQuality[this.xilianRole.quality] + "_card", "spriteFrame"), SpriteFrame);
        let pillarId: number = 0;
        if (cfg && cfg.RoleTypeQual > 0) {
            bgEffect.node.active = true;
            pillarId = cfg.RoleTypeQual;
            let effectName: string = "ui_HeroBackground_0" + cfg.RoleTypeQual;
            bgEffect.skeletonData = await ResMgr.LoadResAbSub(path.join("spine/effect", effectName, effectName), sp.SkeletonData);
            bgEffect.setAnimation(0, "animation", true);
        } else {
            bgEffect.node.active = false;
        }
        pillarBg.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_common, "pillar_" + pillarId, "spriteFrame"), SpriteFrame);
        typeIcon.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_icon, "pos" + cfg.PositionType, "spriteFrame"), SpriteFrame);
        quality.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_quality, CardQuality[this.xilianRole.quality], "spriteFrame"), SpriteFrame);
        let prefab = cfg.Prefab;
        let scale = cfg.Scale || 1;
        body.node.setScale(0.3 * scale, 0.3 * scale);
        body.skeletonData = await ResMgr.LoadResAbSub(path.join("spine/role", prefab, prefab), sp.SkeletonData);
        body.setAnimation(0, "Idle", true);
        role_power.string = this.xilianRole.battle_power + "";
        role_Lv.string = this.xilianRole.level + "";
    }

    /**设置技能图标信息 */
    private updateSkillItem(item: Node, skill_data:SPlayerDataSkill) { 
        let bg = item.getChildByName("bg").getComponent(Sprite);
        let icon = item.getChildByPath("Mask/icon").getComponent(Sprite);
        let nameLab = item.getChildByPath("nameLab").getComponent(Label);
        let lvCont = item.getChildByName("lvCont");
        let lvLab = item.getChildByPath("lvCont/lvLab").getComponent(Label);
        // let upIcon = item.getChildByName("upIcon");
        let resIcon = item.getChildByName("resIcon");
        let lock = item.getChildByName("lock");
        let spine1 = item.getChildByName("item_spine1");
        spine1.active = false;
        let spine2 = item.getChildByName("item_spine2");
        spine2.active = false;

        let qual:number = 0;
        // upIcon.active = false;
        if(skill_data && skill_data.skill_id){
            item["skill_data"] = skill_data;
            let stdSkill:StdPassiveLevel = CfgMgr.GetPassiveSkill(skill_data.skill_id, skill_data.level);
            qual = stdSkill.RareLevel;
            lock.active = false;
            lvCont.active = true;
            icon.node.active = true;
            nameLab.color = new Color().fromHEX(skill_quality_color[stdSkill.RareLevel]);
            nameLab.string = stdSkill.Name;
            resIcon.active = stdSkill.ResoureType > 0;
            lvLab.string = skill_data.level + "";
            let iconUrl:string = path.join(folder_skill, stdSkill.Icon.toString(), "spriteFrame");
            ResMgr.LoadResAbSub(iconUrl, SpriteFrame, res => {
                if(icon) icon.spriteFrame = res;
            });
            // let nextLv:number = data.level + 1;
            // let nextStd:StdPassiveLevel = CfgMgr.GetPassiveSkill(stdSkill.ID, nextLv);
            // if(nextStd){
            //    upIcon.active = ItemUtil.CheckThingConsumes(stdSkill.RewardType, stdSkill.RewardID, stdSkill.RewardNumber);
            // }
            item.off(Node.EventType.TOUCH_END, () => {
                PassiveSkillTipsPanel.Show(skill_data);
            }, this);
            item.on(Node.EventType.TOUCH_END, () => {
                PassiveSkillTipsPanel.Show(skill_data);
            }, this);
        }else{
            lock.active = true;
            lvCont.active = false;
            icon.node.active = false;
            nameLab.string = "";
            resIcon.active = false;
            lvLab.string = "";
        }
        let bgUrl = path.join(folder_icon, "quality", "p_skill_bg_" + qual, "spriteFrame");
        ResMgr.LoadResAbSub(bgUrl, SpriteFrame, res => {
            if(bg)bg.spriteFrame = res;
        });
    }

    private updateCostItem(item: Node, data: { icon: string, count: number, has_count: number }) {
        let icon = item.getChildByName("icon").getComponent(Sprite);
        let costLabel = item.getChildByName("costLabel").getComponent(Label);
        ResMgr.LoadResAbSub(data.icon, SpriteFrame, res => {
            icon.spriteFrame = res
        });
        costLabel.string = data.count + "/" + ToFixed(data.has_count, 2)
    }

    /**洗练结果返回 */
    private async updateSkill(data:{player_id:string, role_id:string, shuffle_id:string,new_passive_skills:SPlayerDataSkill[],  new_soldier_num:number}){
        this.fire_spine1.setAnimation(0, "Start", false);
        this.fire_spine2.setAnimation(0, "Start", false);
        this.is_start_tween = true;
        this.xilian_closeBtn.active = false;
        SetNodeGray(this.xilianBtn.node, true)
        this.sureNode.active = false;

        this.noHasSpr.active = false;
        this.shuffle_id = data.shuffle_id;
        this.soldier_count2.node.parent.active = true;
        this.soldier_count2.string = data.new_soldier_num + "/" + this.max_solider;
      
        this.spineNode.node.parent.active = true;
        this.spineNode.setAnimation(0, "animation", false)

        let sort_list = [0,7,2,9,4,5,1,6,3,8]
        for (let index = 0; index < 10; index++) {  
            let num = sort_list[index]
            let item = this.skillDownContent.children[num];
            let skill_data:SPlayerDataSkill
            let skill_id = data.new_passive_skills[num] && data.new_passive_skills[num].skill_id ? data.new_passive_skills[num].skill_id : null;
            if(skill_id){
                skill_data = data.new_passive_skills[num]
            }else{
                skill_data = null
            }
            tween(item)
            .to(0.05, {angle:5})
            .to(0.05, {angle:0})
            .to(0.05, {angle:-5})
            .to(0.05, {angle:0})
            .to(1, {scale: new Vec3(0,0,0), position:new Vec3(this.spineNode.node.parent.getPosition())})
            .call(()=>{
                this.updateSkillItem(item, skill_data)
                item.active = false;
                item.setScale(1,1,1);
                item.setPosition(this.XiLianPassiveSkillNode.children[num].getPosition())
            })
            .start() 
            await Second(0.04)           
        }  
  
        let num = 0
        tween(this.skillDownContent.children)
        .delay(1.5)
        .call(()=>{
            this.spineNode.node.parent.active = false;
            this.fire_spine1.setAnimation(0, "Idle", true);
            this.fire_spine2.setAnimation(0, "Idle", true)
        })
        .repeat(10,tween().call(()=>{       
            let element = this.skillDownContent.children[num]
            element.active = true;
            let item_spine1 = element.getChildByName("item_spine1");
            item_spine1.active = true;
            let spine = item_spine1.getComponent(sp.Skeleton);
            if(!spine) item_spine1.addComponent(sp.Skeleton);
            spine.setAnimation(0, "animation", false);
            num+=1;
            if(num == 10){
                this.xilian_closeBtn.active = true;
                SetNodeGray(this.xilianBtn.node, false)
                this.sureNode.active = true;
                this.is_start_tween = false;
            }
        }).delay(0.16))
        .start()            
    }

    private onXiLian() {
        let XiLianData = {
            type: MsgTypeSend.RoleSkillShuffle,
            data: { role_id: this.xilianRole.id }
        }
        Session.Send(XiLianData, MsgTypeSend.RoleSkillShuffle, 500)
    }

    private onHelpBtn2(){
        Tips2.Show(Tips2ID.XiLian);
    }

    //查询洗练技能
    private onLogBtn(){    
        if(this.xilianRole){
            FanyuXiLianLogPanel.Show(this.xilianRole.id)
        }
    }

    private onIsSvave(e:Button){
        let name = e.node.name
        switch (name) {
            case "noSaveBtn":
                this.shuffle_id = undefined;
                break;
            case "saveBtn":
                FanyuXiLianSavePanel.Show(this.onSave.bind(this))
                break;
            default:
                break;
        }  
        this.sureNode.active = false;
    }

    /**保存请求 */
    private onSave(){
        if(this.shuffle_id){
            let SaveData = {
                type: MsgTypeSend.RoleSkillShuffleSave,
                data: { role_id: this.xilianRole.id, shuffle_id:this.shuffle_id}
            }
            Session.Send(SaveData, MsgTypeSend.RoleSkillShuffleSave, 1000)
            this.shuffle_id = undefined;
        }  
    }

    /**洗练保存返回 */
    private  setXiLianSave(role:SPlayerDataRole){
        this.soldier_count1.string = role.soldier_num + "/" + this.max_solider;
        this.skillMoveContent.removeAllChildren()
        for (let index = 0; index < 10; index++) {
            const up_element = this.skillUpContent.children[index];
            this.updateSkillItem(up_element, null)
            const down_element = this.skillDownContent.children[index];
            let down_is_has = down_element.getChildByName("lock").active;
            if(!down_is_has){
                let clone_down_skill = instantiate(down_element);
                clone_down_skill.off(Node.EventType.TOUCH_END, () => {
                    PassiveSkillTipsPanel.Show(down_element["skill_data"]);
                }, this);
                clone_down_skill.on(Node.EventType.TOUCH_END, () => {
                    PassiveSkillTipsPanel.Show(down_element["skill_data"]);
                }, this);
                clone_down_skill.setPosition(down_element.getPosition())
                this.skillMoveContent.addChild(clone_down_skill);
            } 
        }
        this.setTween() 
    }

    /**洗练保存动画 */
    private async setTween(){
        this.xilian_closeBtn.active = false;
        for (let index = 0; index < this.skillMoveContent.children.length; index++) {
            const element = this.skillMoveContent.children[index];  
            tween(element)
            .to(0.16, {position:new Vec3(this.PassiveSkillNode.children[index].getPosition())})
            .delay(0.17)
            .call(()=>{
                let item_spine2 = element.getChildByName("item_spine2");
                item_spine2.active = true;
                let spine = item_spine2.getComponent(sp.Skeleton);
                if(!spine) item_spine2.addComponent(sp.Skeleton);
                spine.setAnimation(0, "animation", false);
            })
            .start()
            await Second(0.16); 
        }
        let time = this.skillMoveContent.children.length * 0.16;
        await Second(time); 
        this.xilian_closeBtn.active = true;
    }

 

    protected onHide(...args: any[]): void {
        EventMgr.emit(Evt_Show_Scene, js.getClassByName(this));
    }
}