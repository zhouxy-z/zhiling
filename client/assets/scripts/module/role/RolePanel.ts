import { Button, Input, Label, Node, ScrollView, Size, Sprite, SpriteFrame, Toggle, UITransform, Vec3, instantiate, js, path, sp } from "cc";
import { Panel } from "../../GameRoot";
import { AutoScroller } from "../../utils/AutoScroller";
import { Card, CardType } from "../home/panel/Card";
import PlayerData, { } from "../roleModule/PlayerData"
 import {SBattleRole,SPlayerDataRole} from "../roleModule/PlayerStruct";
import { CardQuality, CfgMgr, StdRole } from "../../manager/CfgMgr";
import { EventMgr, Evt_FlushWorker, Evt_Hide_Scene, Evt_Role_Del, Evt_Role_Update, Evt_Role_Upgrade, Evt_Show_Scene } from "../../manager/EventMgr";
import { RoleInfoPanel } from "./RoleInfoPanel";
import { ClickTipsPanel } from "../common/ClickTipsPanel";
import { SetNodeGray } from "../common/BaseUI";
import { ResMgr, folder_common, folder_icon, folder_quality } from "../../manager/ResMgr";
import { RolePreviewPanel } from "./RolePreviewPanel";
enum RoleListSotrType {
    Def,//默认排序
    Level,//等级排序
    Quality,//品质排序
    Job,//职业排序
    Power,//战力排序
}
export class RolePanel extends Panel {
    protected prefab: string = "prefabs/panel/role/RolePanel";
    private worker: Label;
    private roleNode: Node;
    private downBtnCont: Node;
    private downBtnArrow: Node;
    private downBtnTitle: Label;
    private scroller: AutoScroller;
    private noneListCont: Node;
    private roleIllustratedNode: Node;
    private illustratedScroller: ScrollView;
    private item: Node
    private datas: SPlayerDataRole[];
    private sotrType: number;
    private navBar: Node;
    private type: number;
    protected onLoad() {
        this.roleNode = this.find("roleNode");
        this.roleIllustratedNode = this.find("roleIllustratedNode");
        this.worker = this.find('roleNode/worker/Label', Label);
        this.downBtnCont = this.find("roleNode/downBtnCont");
        let defBtn = this.find("roleNode/downBtnCont/defBtn");
        let levelBtn = this.find("roleNode/downBtnCont/levelBtn");
        let qualBtn = this.find("roleNode/downBtnCont/qualBtn");
        let jobBtn = this.find("roleNode/downBtnCont/jobBtn");
        let fightBtn = this.find("roleNode/downBtnCont/fightBtn");
        let downBtn = this.find("roleNode/downBtn");
        this.downBtnTitle = this.find("roleNode/downBtn/downBtnTitle", Label);
        this.downBtnArrow = this.find("roleNode/downBtn/downBtnArrow");
        this.noneListCont = this.find("roleNode/noneListCont");
        this.scroller = this.find("roleNode/ScrollView", AutoScroller);
        this.scroller.SetHandle(this.updateItem.bind(this));
        this.scroller.node.on('select', this.onSelect, this);
        this.CloseBy("backBtn");
        this.illustratedScroller = this.find("roleIllustratedNode/ScrollView", ScrollView);
        this.item = this.find("roleIllustratedNode/ScrollView/view/content/Node");
        this.navBar = this.find("navBar");
        this.navBar.children.forEach((node, index) => {
            node.on(Input.EventType.TOUCH_END, () => {
                this.setNav(index)
            })
        })
        defBtn.on(Button.EventType.CLICK, this.onBtnClick, this);
        downBtn.on(Button.EventType.CLICK, this.onBtnClick, this);
        levelBtn.on(Button.EventType.CLICK, this.onBtnClick, this);
        qualBtn.on(Button.EventType.CLICK, this.onBtnClick, this);
        jobBtn.on(Button.EventType.CLICK, this.onBtnClick, this);
        fightBtn.on(Button.EventType.CLICK, this.onBtnClick, this);
        EventMgr.on(Evt_Role_Upgrade, this.onUpgrade, this);
        EventMgr.on(Evt_FlushWorker, this.onFlushWorker, this);
        EventMgr.on(Evt_Role_Del, this.onDelRole, this);
        EventMgr.on(Evt_Role_Update, this.onRoleUpdate, this);
    }
    protected onShow(): void {
        EventMgr.emit(Evt_Hide_Scene, js.getClassName(this));
        //this.flush();
    }
    public flush(...args: any[]): void {
        this.setNav(0)

        this.downBtnArrow.angle = 0;
        // this.datas = [];
        // for (let role of PlayerData.GetRoles()) {
        //     if (!role.building_id) this.datas.push(role);
        // }
        this.updateShow();
    }
    //切页
    private setNav(index) {
        if (this.type == index) return;

        this.type = index;
        if (index == 0) {
            this.roleNode.active = true;
            this.roleIllustratedNode.active = false;
        } else {
            this.roleNode.active = false;
            this.roleIllustratedNode.active = true;
            this.updateIllustrate();
        }
    }
    private updateShow(sotr: number = 0): void {
        this.roleDataSotr(sotr);
        this.updateWorker();
    }
    protected onHide(...args: any[]): void {
        this.type = undefined;
        this.navBar.children[0].getComponent(Toggle).isChecked = true;
        EventMgr.emit(Evt_Show_Scene, js.getClassByName(this));
    }

    private onUpgrade(): void {
        this.updateShow(this.sotrType);
    }
    private onFlushWorker(): void {
        if (!this.node.activeInHierarchy) return;
        this.updateWorker();
    }
    private onDelRole(): void {
        if (!this.node.activeInHierarchy) return;
        this.updateShow(this.sotrType);
    }
    private onRoleUpdate(): void {
        if (!this.node.activeInHierarchy) return;
        this.updateShow(this.sotrType);
    }
    //更人刷新
    private updateWorker(): void {
        // let roles = PlayerData.GetRoles();
        /* let count = 0;
        for (let index = 0; index < roles.length; index++) {
            let role = roles[index];
            if (role.building_id > 0) {
                count += 1;
            }
        } */
        this.worker.string = `${PlayerData.GetRoleNum()}`;
    }
    onBtnClick(event: Button) {
        let name = event.node.name;
        switch (name) {
            case 'downBtn':
                let btnNode: Node = event.node;
                let btnSize: Size = btnNode.getComponent(UITransform).contentSize;
                let showPos: Vec3 = btnNode.worldPosition.clone();
                showPos.y = showPos.y - btnSize.height / 2 - this.downBtnCont.getComponent(UITransform).height / 2 + 6;
                this.downBtnArrow.angle = 180;
                ClickTipsPanel.Show(this.downBtnCont, this.node, btnNode, showPos, 0, () => {
                    this.downBtnArrow.angle = 0;
                });
                break;
            case 'levelBtn':
                this.roleDataSotr(RoleListSotrType.Level);
                break;
            case 'qualBtn':
                this.roleDataSotr(RoleListSotrType.Quality);
                break;
            case 'jobBtn':
                this.roleDataSotr(RoleListSotrType.Job);
                break;
            case 'fightBtn':
                this.roleDataSotr(RoleListSotrType.Power);
                break;
            default:
                this.roleDataSotr(RoleListSotrType.Def);
                break;
        }
    }
    private roleDataSotr(type: number): void {
        this.sotrType = type;
        let roleDatas = PlayerData.GetRoles();
        let newRoleDatas: SPlayerDataRole[] = [];
        switch (type) {
            case RoleListSotrType.Def://默认排序
                let attackRoles: SBattleRole[] = PlayerData.attackRoles;
                let defenseRoles: SBattleRole[] = PlayerData.roleInfo.defense_lineup;
                let szRoleDatas: SPlayerDataRole[] = [];//上阵中的角色列表
                let defenseDatas: SPlayerDataRole[] = [];//防守中的角色列表
                let workDatas: SPlayerDataRole[] = [];//工作中的角色列表
                let defRoleDatas: SPlayerDataRole[] = [];//默认的校色列表
                let szFlag: boolean = false;
                let szDic: object = {};
                let dfDic: object = {};
                for (const attack of attackRoles) {
                    if (attack) {
                        szDic[attack.role_id] = true;
                    }

                }
                for (const defense of defenseRoles) {
                    //排除上政角色
                    if (!szDic[defense.role_id]) dfDic[defense.role_id] = true;
                }
                for (const roleData of roleDatas) {

                    if (szDic[roleData.id]) {
                        szRoleDatas.push(roleData);
                    } else if (dfDic[roleData.id]) {
                        defenseDatas.push(roleData);
                    } else if (roleData.building_id > 0) {
                        if (!szDic[roleData.id] || !dfDic[roleData.id]) {
                            workDatas.push(roleData);
                        }
                    } else {
                        defRoleDatas.push(roleData);
                    }
                }
                szRoleDatas.sort(this.powerRank);
                defenseDatas.sort(this.powerRank);
                workDatas.sort(this.powerRank);
                defRoleDatas.sort(this.powerRank);
                newRoleDatas = szRoleDatas.concat(defenseDatas, workDatas, defRoleDatas);
                this.downBtnTitle.string = "默认排列";
                break;
            case RoleListSotrType.Level:
                newRoleDatas = roleDatas;
                newRoleDatas.sort(this.levelRank);
                this.downBtnTitle.string = "等级排列";
                break;
            case RoleListSotrType.Quality:
                newRoleDatas = roleDatas;
                newRoleDatas.sort(this.qualRank);
                this.downBtnTitle.string = "品质排列";
                break;
            case RoleListSotrType.Job:
                newRoleDatas = roleDatas;
                newRoleDatas.sort(this.jobRank);
                this.downBtnTitle.string = "职业排列";
                break;
            case RoleListSotrType.Power:
                newRoleDatas = roleDatas;
                newRoleDatas.sort(this.powerRank);
                this.downBtnTitle.string = "战力排列";
                break;
        }

        this.datas = newRoleDatas;
        this.noneListCont.active = this.datas.length <= 0;
        this.scroller.UpdateDatas(this.datas);
        this.scroller.ScrollToHead();
    }

    //战力排序
    private powerRank(a: SPlayerDataRole, b: SPlayerDataRole): number {
        let stdA: StdRole = CfgMgr.GetRole()[a.type];
        let stdB: StdRole = CfgMgr.GetRole()[b.type];
        if (a.battle_power == b.battle_power) {
            if (a.level == b.level) {
                if (a.quality == b.quality) {
                    if (stdA.PositionType == b.battle_power) {
                        return stdA.RoleType < stdB.RoleType ? -1 : 1;
                    } else {
                        return stdA.PositionType < stdB.PositionType ? -1 : 1;
                    }
                } else {
                    return a.quality > b.quality ? -1 : 1;
                }
            } else {
                return a.level > b.level ? -1 : 1;
            }

        } else {
            return a.battle_power > b.battle_power ? -1 : 1;
        }
    }
    //职业排序
    private jobRank(a: SPlayerDataRole, b: SPlayerDataRole): number {
        let stdA: StdRole = CfgMgr.GetRole()[a.type];
        let stdB: StdRole = CfgMgr.GetRole()[b.type];
        if (stdA.PositionType == stdB.PositionType) {
            if (a.battle_power == b.battle_power) {
                if (a.quality == b.quality) {
                    if (a.level == b.level) {
                        return stdA.RoleType < stdB.RoleType ? -1 : 1;
                    } else {
                        return a.level > a.level ? -1 : 1;
                    }
                } else {
                    return a.quality > b.quality ? -1 : 1;
                }
            } else {
                return a.battle_power > b.battle_power ? -1 : 1;
            }

        } else {
            return stdA.PositionType < stdB.PositionType ? -1 : 1;
        }
    }
    //品质排序
    private qualRank(a: SPlayerDataRole, b: SPlayerDataRole): number {
        let stdA: StdRole = CfgMgr.GetRole()[a.type];
        let stdB: StdRole = CfgMgr.GetRole()[b.type];
        if (a.quality == b.quality) {
            if (a.battle_power == b.battle_power) {
                if (a.level == b.level) {
                    if (stdA.PositionType == stdB.PositionType) {
                        return stdA.RoleType < stdB.RoleType ? -1 : 1;
                    } else {
                        return stdA.PositionType < stdB.PositionType ? -1 : 1;
                    }
                } else {
                    return a.level > b.level ? -1 : 1;
                }
            } else {
                return a.battle_power > b.battle_power ? -1 : 1;
            }

        } else {
            return a.quality > b.quality ? -1 : 1;
        }
    }
    //等级排序
    private levelRank(a: SPlayerDataRole, b: SPlayerDataRole): number {
        let stdA: StdRole = CfgMgr.GetRole()[a.type];
        let stdB: StdRole = CfgMgr.GetRole()[b.type];
        if (a.level == b.level) {
            if (a.battle_power == b.battle_power) {
                if (a.quality == b.quality) {
                    if (stdA.PositionType == stdB.PositionType) {
                        return stdA.RoleType < stdB.RoleType ? -1 : 1;
                    } else {
                        return stdA.PositionType < stdB.PositionType ? -1 : 1;
                    }
                } else {
                    return a.quality > b.quality ? -1 : 1;
                }
            } else {
                return a.battle_power > b.battle_power ? -1 : 1;
            }

        } else {
            return a.level > b.level ? -1 : 1;
        }
    }

    protected updateItem(item: Node, data: SPlayerDataRole) {
        let card = item.getComponent(Card);
        if (!card) card = item.addComponent(Card);
        card.SetData({ role: data, select: false });
        item.getComponent(Toggle).isChecked = false;
        item.getComponent(Toggle).enabled = false;
    }
    protected async onSelect(index: number, item: Node) {
        console.log("onSelect", index);
        item.getComponent(Toggle).isChecked = false;
        RoleInfoPanel.Show(this.datas, index);
    }

    //-----------------------图鉴相关-----------------

    private updateIllustrate() {
        let data = this.getQualityByType()
        this.illustratedScroller.content.removeAllChildren();
        for (let index = 0; index < data.length; index++) {
            const element = data[index];
            let clone = instantiate(this.item);
            this.illustrateUpdateItem(clone, element)
            this.illustratedScroller.content.addChild(clone);
        }
    }

    //获取图鉴展示的角色
    private getQualityByType() {
        let illustrated_role = [];
        let role_data = CfgMgr.GetRole();
        let RoleTypeQual_0 = [];
        let RoleTypeQual_1 = [];
        let RoleTypeQual_2 = [];
        for (const key in role_data) {
            let role = role_data[key];
            if (role.isHeroGallery == 1) {
                if (role.RoleTypeQual == 2) {
                    RoleTypeQual_2.push(role);
                } else if (role.RoleTypeQual == 1) {
                    RoleTypeQual_1.push(role);
                } else {
                    RoleTypeQual_0.push(role);
                }
            }
        }
        illustrated_role.push(RoleTypeQual_2);
        illustrated_role.push(RoleTypeQual_1);
        illustrated_role.push(RoleTypeQual_0);
        return illustrated_role;
    }

    private async illustrateUpdateItem(item: Node, data: StdRole[]) {

        let spr = item.getChildByName("titlebg").getComponent(Sprite)
        let role_data = data[0];
        spr.spriteFrame = await ResMgr.LoadResAbSub(path.join("sheets/role/", "Illustrated" + role_data.RoleTypeQual, "spriteFrame"), SpriteFrame);

        let card_item = item.getChildByPath("content/Card");
        let content = item.getChildByName("content");
        content.removeAllChildren();

        for (let index = 0; index < data.length; index++) {
            const element = data[index];
            let role: SPlayerDataRole = PlayerData.getMaxQualityByType(element.RoleType);
            let card_clone = instantiate(card_item);
            card_clone.off(Input.EventType.TOUCH_END);
            card_clone.on(Input.EventType.TOUCH_END, ()=>{RolePreviewPanel.Show(element, role)}, this);
            content.addChild(card_clone);
            let quality = role ? role.quality : element.Quality
            let is_has = role ? true : false;
            SetNodeGray(card_clone, !is_has)
            this.setCardData(card_clone, element, quality, is_has);
            
        }
    }

    private async setCardData(item: Node, data: StdRole, role_quality, is_has:boolean) {
        let bg = item.getChildByName("bg").getComponent(Sprite);
        let bgEffect = item.getChildByName("bgEffect").getComponent(sp.Skeleton);
        let pillarBg = item.getChildByName("pillarBg").getComponent(Sprite);
        let typeIcon = item.getChildByName("type").getComponent(Sprite);
        let quality = item.getChildByName("quality").getComponent(Sprite);
        let body = item.getChildByName("body").getComponent(sp.Skeleton);
        let role_name = item.getChildByName("role_name").getComponent(Label);
        let unget = item.getChildByName("unget");
        unget.active = !is_has;
        bg.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_icon, "quality", CardQuality[role_quality] + "_card", "spriteFrame"), SpriteFrame);
        let pillarId: number = 0;
        if (data && data.RoleTypeQual > 0) {
            bgEffect.node.active = true;
            pillarId = data.RoleTypeQual;
            let effectName: string = "ui_HeroBackground_0" + data.RoleTypeQual;
            bgEffect.skeletonData = await ResMgr.LoadResAbSub(path.join("spine/effect", effectName, effectName), sp.SkeletonData);
            bgEffect.setAnimation(0, "animation", true);
        } else {
            bgEffect.node.active = false;
        }
        pillarBg.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_common, "pillar_" + pillarId, "spriteFrame"), SpriteFrame);
        typeIcon.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_icon, "pos" + data.PositionType, "spriteFrame"), SpriteFrame);
        quality.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_quality, CardQuality[role_quality], "spriteFrame"), SpriteFrame);
        let prefab = data.Prefab;
        let scale = data.Scale || 1;
        body.node.setScale(0.3 * scale, 0.3 * scale);
        body.skeletonData = await ResMgr.LoadResAbSub(path.join("spine/role", prefab, prefab), sp.SkeletonData);
        body.setAnimation(0, "Idle", true);
        role_name.string = data.Name;
    }
}