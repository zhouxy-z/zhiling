import { Button, Color, js, Label, Node, path, sp, Sprite, SpriteFrame, tween, UITransform, Vec3 } from "cc";
import { Panel } from "../../GameRoot";
import { FishingEquipItem } from "./FishingEquipItem";
import { AutoScroller } from "../../utils/AutoScroller";
import { FishingEquipAttrItem } from "./FishingEquipAttrItem";
import { FishingEquipSuitAttrItem } from "./FishingEquipSuitAttrItem";
import { FishingEquipRoleItem } from "./FishingEquipRoleItem";
import { CfgMgr, StdFishEquipSoltType, StdFishHero, StdFishHeroPart, StdFishHeroSkill } from "../../manager/CfgMgr";
import { ResMgr } from "../../manager/ResMgr";
import { SetNodeGray } from "../common/BaseUI";
import PlayerData, {} from "../roleModule/PlayerData"
 import {SFishingHeroData,SFishingHeroPartData,SFishingHeroSkillEffect} from "../roleModule/PlayerStruct";
import { EventMgr, Evt_FishEquipUpdate, Evt_FishHeroActive, Evt_FishHeroUpdate } from "../../manager/EventMgr";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import { MsgPanel } from "../common/MsgPanel";
import { FishingEquipHeroActivePanel } from "./FishingEquipHeroActivePanel";
import { FishingEquipUpgradePanel } from "./FishingEquipUpgradePanel";
import { BeforeGameUtils } from "../../utils/BeforeGameUtils";

export class FishingEquipPanel extends Panel {
    protected prefab: string = "prefabs/panel/fishingEquip/FishingEquipPanel";
    private attrList:AutoScroller;
    private suitAttrList:AutoScroller;
    private leftBtn:Button;
    private rightBtn:Button;
    private selectRoleCont:Node;
    //private closeBtn:Button;
    private roleList:AutoScroller;
    private unlockedIcon:Sprite;
    private unlockedBtn:Button;
    private roleModelCont:Node;
    private roleModel:sp.Skeleton;
    private roleModelBtn:Button;
    //private showSelectBtn:Button;
    private userBtn:Button;
    private userBtnLab:Label;
    private roleIndex:number;
    private curHero:StdFishHero;
    private heroData:SFishingHeroData;
    private roles:StdFishHero[];
    private equipItemMap:{[key:number]:FishingEquipItem} = js.createMap();
    private tempColor:Color = new Color();
    private unlockedIconPos: { [key: string]: Vec3} = BeforeGameUtils.toHashMapObj(
        "lock_ngr", new Vec3(-58,312,0),
        "lock_dyl", new Vec3(0,358,0),
    );
    private oldActiveState:number = 0;
    private mainPartData:SFishingHeroPartData;
    protected onLoad(): void {

        this.roles = CfgMgr.GetFishHeroList();

        let equipCont:Node = this.find("equipCont");
        for (let index = 0; index < equipCont.children.length; index++) {
            let equipItem:Node = equipCont.children[index];
            let equipItemCom:FishingEquipItem = equipItem.addComponent(FishingEquipItem);

            this.equipItemMap[index + 1] = equipItemCom;
        }
        this.unlockedIcon = this.find("unlockedIcon", Sprite);
        this.unlockedBtn = this.find("unlockedIcon", Button);
        this.roleModelCont = this.find("roleModelCont");
        this.roleModelBtn = this.find("roleModelCont", Button);

        this.roleModel = this.find("roleModelCont/roleModel", sp.Skeleton);
        
        //this.showSelectBtn = this.find("showSelectBtn", Button);
        this.userBtn = this.find("userBtn", Button);
        this.userBtnLab = this.find("userBtn/lab", Label);
        this.attrList = this.find("attrList", AutoScroller);
        this.attrList.SetHandle(this.updateAttrItem.bind(this));
        this.suitAttrList = this.find("suitAttrList", AutoScroller);
        this.suitAttrList.SetHandle(this.updateSuitAttrItem.bind(this));

        this.selectRoleCont = this.find("selectRoleCont");
        //this.closeBtn = this.find("selectRoleCont/closeBtn", Button);
        this.roleList = this.find("selectRoleCont/roleList", AutoScroller);
        this.roleList.SetHandle(this.updateRoleItem.bind(this));
        
        this.roleList.node.on('select', this.onRoleSelect, this);
        
        
        this.leftBtn = this.find("leftBtn", Button);
        this.rightBtn = this.find("rightBtn", Button);
        this.leftBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.rightBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        //this.closeBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        //this.showSelectBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.userBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.unlockedBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.roleModelBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.CloseBy("mask");
        this.CloseBy("closeBtn");
        //this.selectRoleCont.active = false;
    }
    public flush(...args: any[]): void {
        let curIndex:number = 0;
        let userHeroId:number = PlayerData.GetFishingHeroId();
        if(userHeroId > 0){
            curIndex = this.roles.findIndex(item => item.ID == userHeroId);
        }
        this.roleIndex = curIndex > -1 ? curIndex : 0;
        this.changeRole();
        this.updateShow();
        this.onFishHeroUpdate();
    }
    
    protected onShow(): void {
        let suitAttrList:string[] = ["套装效果：暂无"];
        this.suitAttrList.UpdateDatas(suitAttrList);
        EventMgr.on(Evt_FishEquipUpdate, this.onEquipUpdate, this);
        EventMgr.on(Evt_FishHeroUpdate, this.onFishHeroUpdate, this);
        EventMgr.on(Evt_FishHeroActive, this.onFishHeroActive, this);
    }

    protected onHide(...args: any[]): void {
        EventMgr.off(Evt_FishEquipUpdate, this.onEquipUpdate, this);
        EventMgr.off(Evt_FishHeroUpdate, this.onFishHeroUpdate, this);
        EventMgr.off(Evt_FishHeroActive, this.onFishHeroActive, this);
    }
    private onEquipUpdate(hero_id:number, part_slot_id:number, upgrade_success:boolean):void{
        if(!this.curHero || this.curHero.ID != hero_id) return;
        
        this.updateShow();
    }
    private onFishHeroUpdate():void{
        this.updateShow();
    }
    private onFishHeroActive(hero_id:number):void{
        MsgPanel.Show("激活成功");
        if(this.curHero && this.curHero.ID == hero_id){
            this.onFishHeroUpdate();    
        }
        
    }
    private onBtnClick(btn:Button):void{
        let isChangeRole:boolean = false;
        switch(btn){
            case this.leftBtn:
                if(this.roleIndex < 1){
                    return;
                }
                this.roleIndex --;
                isChangeRole = true;
                break;
            case this.rightBtn:
                if(this.roleIndex >= this.roles.length - 1){
                    return;
                }
                this.roleIndex ++;
                isChangeRole = true;
                break;
            //case this.showSelectBtn:
                //this.showSelectCont();
                //break;
            case this.userBtn:
                
                if(this.mainPartData && this.mainPartData.level > 0){
                    if(this.heroData.activate_end_time - PlayerData.GetServerTime() <= 0){
                        FishingEquipHeroActivePanel.Show(this.curHero.ID);
                        return;   
                    }
                    Session.Send({type: MsgTypeSend.FishingHeroSelect, data:{hero_id:this.curHero.ID}});
                }else{
                    FishingEquipUpgradePanel.Show(this.curHero.ID, this.curHero.Slot[0], this.curHero.Part[0]);
                }
                break;
            //case this.closeBtn:
                //this.hideSelectCont();
               // break;
               case this.unlockedBtn:
                if(this.mainPartData && this.mainPartData.level > 0){
                    return;
                }else{
                    FishingEquipUpgradePanel.Show(this.curHero.ID, this.curHero.Slot[0], this.curHero.Part[0]);
                }
                break;
                case this.roleModelBtn:
                    if(this.mainPartData && this.mainPartData.level > 0){
                        FishingEquipUpgradePanel.Show(this.curHero.ID, this.curHero.Slot[0], this.curHero.Part[0]);
                    }
                    break;
        }
        if(isChangeRole){
            this.changeRole();
            this.updateShow();
        } 
    }
    private changeRole():void{
        this.leftBtn.node.active = this.roleIndex > 0;
        this.rightBtn.node.active = this.roleIndex < this.roles.length - 1;
    }
    /* private showSelectCont():void{
        if(this.selectRoleCont.active){
            this.hideSelectCont();
            return;
        } 
        let trans:UITransform = this.node.getComponent(UITransform);
        let conTrans:UITransform = this.selectRoleCont.getComponent(UITransform);
        let showY:number = -(trans.height - conTrans.height) * 0.5;
        let hideY:number = showY - conTrans.height;
        this.selectRoleCont.position = new Vec3(0, hideY,0);
        this.selectRoleCont.active = true;
        tween(this.selectRoleCont)
        .to(0.3, { position: new Vec3(0, showY, 0) }, {
            easing: "backIn",                                         
        })
        .start();
        this.roleList.UpdateDatas(this.roles);
       
    }
    private hideSelectCont():void{
        if(!this.selectRoleCont.active) return;
        let trans:UITransform = this.node.getComponent(UITransform);
        let conTrans:UITransform = this.selectRoleCont.getComponent(UITransform);
        let showY:number = -(trans.height - conTrans.height) * 0.5;
        let hideY:number = showY - conTrans.height;
        this.selectRoleCont.position = new Vec3(0, showY,0);
        tween(this.selectRoleCont)
        .to(0.3, { position: new Vec3(0, hideY, 0) }, {
            easing: "backOut",                                         
        })
        .call(()=>{
            this.selectRoleCont.active = false;
        })
        .start();
    } */
    private updateShow():void{
        if(this.selectRoleCont.active){
            this.resetRoleSelect(this.roleIndex);
        }
        this.roleList.UpdateDatas(this.roles);
        this.curHero = this.roles[this.roleIndex];
        this.heroData = PlayerData.GetFishingEquipHero(this.curHero.ID);
        this.mainPartData = PlayerData.GetFishingEquipData(this.curHero.ID, StdFishEquipSoltType.Type_1);
        this.updateBtnState();
        this.updateHeroEquip();
        this.updateHeroModel();
    }
    private updateBtnState():void{
        
        let heroPartData:SFishingHeroPartData = PlayerData.GetFishingEquipData(this.curHero.ID, StdFishEquipSoltType.Type_1);
        if(heroPartData && heroPartData.level > 0){
            this.userBtnLab.string = "使用";
        }else{
            this.userBtnLab.string = "解锁";
        }
    }
    private updateHeroModel():void{
        let equipData:SFishingHeroPartData = PlayerData.GetFishingEquipData(this.curHero.ID, StdFishEquipSoltType.Type_1);
        if(equipData && (equipData.level > 0 || equipData.upgrade > 0)){
            this.unlockedIcon.node.active = false;
            this.oldActiveState = 1;
            if(this.curHero.HeorModel && this.curHero.HeorModel.length > 0){
                let url:string = path.join("spine/effect", this.curHero.HeorModel, this.curHero.HeorModel);
                ResMgr.LoadResAbSub(url, sp.SkeletonData, (res:sp.SkeletonData)=>{
                    this.roleModelCont.active = true;
                    this.roleModel.skeletonData = res; 
                    if(this.roleModel.animation == "Idlediaoyu") return;
                    this.roleModel.setAnimation(0, "Idlediaoyu", true);
                });
            }else{
                this.roleModelCont.active = false;
            }
        }else{
            this.oldActiveState = 0;
            this.roleModelCont.active = false;
            let pos:Vec3 = this.unlockedIconPos[this.curHero.HeroUnlockedRes] || new Vec3(0,0,0);
            if(this.curHero.HeroUnlockedRes && this.curHero.HeroUnlockedRes.length > 0){
                let iconUrl = path.join("sheets/fishingEquip", this.curHero.HeroUnlockedRes, "spriteFrame");
                ResMgr.LoadResAbSub(iconUrl, SpriteFrame, res => {
                    this.unlockedIcon.node.active = true;
                    this.unlockedIcon.spriteFrame = res;
                    this.unlockedIcon.node.position = pos;
                });
            }else{
                this.unlockedIcon.node.active = false;
            }
        }
    }
    private updateHeroEquip():void{
        let slot:number;
        let part:number;
        let equipItem:FishingEquipItem;
        let equipSkill:StdFishHeroSkill;
        let stdPart:StdFishHeroPart;
        let lv:number = 0;
        let skillVal:number = 0;
        let skillList:{stdSkill:StdFishHeroSkill, value:number}[] = [];
        let equipData:SFishingHeroPartData;
        let equipSkillData:SFishingHeroSkillEffect;
        for (let index = 0; index < this.curHero.Slot.length; index++) {
            slot = this.curHero.Slot[index];
            part = this.curHero.Part[index];
            equipData = PlayerData.GetFishingEquipData(this.curHero.ID, slot);
            lv = equipData ? equipData.level : 0;
            stdPart = CfgMgr.GetFishHeroPartLv(part, Math.max(lv, 1));
            equipItem = this.equipItemMap[slot];
            equipItem.SetData(this.curHero.ID, slot, stdPart, lv);
            equipSkill = CfgMgr.GetFishHeroSkill(stdPart.SkillType);
            equipSkillData = PlayerData.GetFishingEquipSkill(this.curHero.ID, slot);
            if(lv > 0){
                skillVal = stdPart.SkillValue;
            }else{
                skillVal = 0;
            }
            skillList.push({stdSkill:equipSkill, value:skillVal});
        }
        this.attrList.UpdateDatas(skillList);
    }
    private updateAttrItem(item: Node, data: {stdSkill:StdFishHeroSkill, value:number}) {
        let attrItem = item.getComponent(FishingEquipAttrItem) || item.addComponent(FishingEquipAttrItem);
        attrItem.SetData(data);
    }
    private updateSuitAttrItem(item: Node, data: string):void{
        let suitAttrItem = item.getComponent(FishingEquipSuitAttrItem) || item.addComponent(FishingEquipSuitAttrItem);
        suitAttrItem.SetData(data);
    }
    private resetRoleSelect(selectIndex:number = -1):void{
        let children:Node[] = this.roleList.node.getChildByPath("view/content").children;
        for (let i = 0; i < children.length; i++) {
            let node:Node = children[i];
            this.changeRoleSelect(node, selectIndex < 0 ? false : node["$$index"] == selectIndex);
        }
    }
    private updateRoleItem(item: Node, data: any, index:number):void{
        this.changeRoleSelect(item, this.roleIndex == index);
        let roleItem = item.getComponent(FishingEquipRoleItem) || item.addComponent(FishingEquipRoleItem);
        roleItem.SetData(data);
    }
    private changeRoleSelect(item:Node, isSelect:boolean):void{
        let select:Node = item.getChildByName("select");
        let nameLab:Label = item.getChildByPath("cont/nameLab").getComponent(Label);
        if(isSelect){
            select.active = true;
            this.tempColor.fromHEX("#2AFFA5");
        }else{
            select.active = false;
            this.tempColor.fromHEX("#84AB9B");
        }
        nameLab.color = this.tempColor;
    }
    private onRoleSelect(index: number, item: Node):void {
        if(this.roleIndex == index) return;
        this.resetRoleSelect();
        this.roleIndex = index;
        this.changeRole();
        this.changeRoleSelect(item, this.roleIndex == index);
        this.updateShow();
        
    }
}