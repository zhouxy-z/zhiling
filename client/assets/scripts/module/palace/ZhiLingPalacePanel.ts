import { Button, Input, Label, Node, ScrollView, Sprite, SpriteFrame, instantiate, js, path, sp } from "cc";
import { Panel } from "../../GameRoot";
import { AutoScroller } from "../../utils/AutoScroller";
import PlayerData, { } from "../roleModule/PlayerData"
import { SPlayerDataRole, SThing, Tips2ID } from "../roleModule/PlayerStruct";
import { CardQuality, CfgMgr, StdCommonType, StdLevel, StdRole } from "../../manager/CfgMgr";
import { EventMgr, Evt_Click_Building, Evt_Hide_Scene, Evt_Show_Scene, Goto } from "../../manager/EventMgr";
import { AdaptBgTop, SetNodeGray } from "../common/BaseUI";
import { ResMgr, folder_common, folder_head_round, folder_icon, folder_item, folder_quality } from "../../manager/ResMgr";
import { PANEL_TYPE } from "../../manager/PANEL_TYPE";
import { BuildingType } from "../home/HomeStruct";
import { formatNumber } from "../../utils/Utils";
import { TaskActiveBoxTipsCont } from "../task/TaskActiveBoxTipsCont";
import { ItemUtil } from "../../utils/ItemUtils";
import { SpriteLabel } from "../../utils/SpriteLabel";
import { Tips2 } from "../home/panel/Tips2";


export class ZhiLingPalacePanel extends Panel {
    protected prefab: string = "prefabs/panel/palace/ZhiLingPalacePanel";

    private has_role_label: Label;
    private fighting_label: SpriteLabel;
    private helpBtn: Node;
    private pass_label: Label;
    private sweep_label: Label;
    private max_pass_label: Label;
    private max_sweep_label: Label;
    private expeditionBtn: Button;
    private sweepBtn: Button;
    private rewardBtn: Button;
    private rewardNode: Node;
    private close_node: Node;
    private activeBoxTips: TaskActiveBoxTipsCont;

    private caijiBtn: Button;
    private value: Label;
    private rateIcon: Sprite;
    private rateValLab: Label;
    private workScroller: AutoScroller;

    private illustratedScroller: ScrollView;
    private item: Node

    private has_num: number;
    private max_fighting: number;
    protected onLoad() {
        this.CloseBy("backBtn");
        this.has_role_label = this.find("has_bg/has_role_label", Label);
        this.fighting_label = this.find("bg/fighting_label").addComponent(SpriteLabel);;
        this.helpBtn = this.find("bg/helpBtn");
        this.helpBtn.on(Input.EventType.TOUCH_END, this.onHelpBtn, this);
        this.pass_label = this.find("battle_bg/pass_label", Label);
        this.sweep_label = this.find("battle_bg/sweep_label", Label);
        this.max_pass_label = this.find("battle_bg/max_pass_label", Label);
        this.max_sweep_label = this.find("battle_bg/max_sweep_label", Label);
        this.expeditionBtn = this.find("battle_bg/expeditionBtn", Button);
        this.expeditionBtn.node.on("click", this.onClick, this);
        this.sweepBtn = this.find("battle_bg/sweepBtn", Button);
        this.sweepBtn.node.on("click", this.onClick, this);
        this.rewardBtn = this.find("battle_bg/rewardBtn", Button);
        this.rewardBtn.node.on("click", this.onClick, this);
        this.activeBoxTips = this.find("rewardNode").addComponent(TaskActiveBoxTipsCont);
        this.rewardNode = this.find("rewardNode");
        this.close_node = this.find("rewardNode/close_node");
        this.close_node.on(Input.EventType.TOUCH_END, this.onCloseNode, this)

        this.caijiBtn = this.find("caiji_bg/caijiBtn", Button);
        this.value = this.find("caiji_bg/value", Label);
        this.rateIcon = this.find("caiji_bg/rateCont/icon", Sprite);
        this.rateValLab = this.find("caiji_bg/rateCont/valueLab", Label);
        this.caijiBtn.node.on("click", this.onClick, this);
        this.workScroller = this.node.getChildByPath("caiji_bg/ScrollView").getComponent(AutoScroller);
        this.workScroller.SetHandle(this.updateWorkerItem.bind(this));
        this.workScroller.node.on("select", this.onSelectWorker, this);

        this.illustratedScroller = this.find("roleIllustratedNode/ScrollView", ScrollView);
        this.item = this.find("roleIllustratedNode/ScrollView/view/content/Node");
    }

    protected onShow(): void {
        EventMgr.emit(Evt_Hide_Scene, js.getClassName(this));
    }

    public flush(...args: any[]): void {
        //pve
        AdaptBgTop(this.find("peitu"))
        this.rewardNode.active = false;
        this.max_fighting = PlayerData.roleInfo.role_type_max_sum_battle_power ? PlayerData.roleInfo.role_type_max_sum_battle_power : 0;
        let label = this.fighting_label.getComponent(SpriteLabel);
        label.font = "sheets/common/number/font2";
        label.string = this.max_fighting + "";
        this.pass_label.string = PlayerData.roleInfo.pve_data.progress + "关";
        let max_pass_num = CfgMgr.GetSaoDangMaxLevel(PlayerData.roleInfo.battle_power, 1);
        this.max_pass_label.string = max_pass_num;
        let stdInfo: StdLevel = CfgMgr.GetSaoDangLevel(PlayerData.pveData.progress, this.max_fighting);
        let id: number = stdInfo ? stdInfo.ID : 0;
        this.sweep_label.string = `第${id}关`;
        let max_sweep_num = CfgMgr.GetSaoDangMaxLevel(this.max_fighting, 2);
        this.max_sweep_label.string = max_sweep_num;

        //caiji
        ResMgr.LoadResAbSub(path.join(folder_item, "qianghuashi", "spriteFrame"), SpriteFrame, res => {
            this.rateIcon.spriteFrame = res;
        });
        let info = PlayerData.GetBuilding(BuildingType.ji_di);
        if (!info) return;
        let std = CfgMgr.GetBuildingLv(BuildingType.ji_di, info.level);
        let len = std.WorkingRolesNum;
        this.value.string = info.workerIdArr.length + "/" + len;
        let workerRate: number = 0;//工作效率
        for (let index = 0; index < info.workerIdArr.length; index++) {
            let roleData: SPlayerDataRole = info.workerIdArr[index];
            let cfg = CfgMgr.GetProduceCasting(roleData.type, roleData.quality)
            workerRate = workerRate + cfg.produce_casting;
        }
        this.rateValLab.string = `${formatNumber(workerRate, 2)}/8h`;
        info.workerIdArr.sort(this.workerAttrSort.bind(this))
        let max = CfgMgr.GetMaxWorkerNum(BuildingType.ji_di);
        let datas = [];
        for (let i = 0; i < max.length; i++) {
            let role = info.workerIdArr[i];
            let data = {
                lock: len <= i ? max[i] + "级解锁" : undefined,
                info: role
            }
            datas.push(data);
        }
        this.workScroller.UpdateDatas(datas);
        this.workScroller.ScrollToHead()

        //图鉴
        this.updateIllustrate();
    }

    private onSelectWorker(index: number, item: Node) {
        this.Hide();
        let buildingId = CfgMgr.GetHomeLandBuilding(PlayerData.RunHomeId, BuildingType.ji_di)[0].BuildingId;//获取当前家园基地id
        EventMgr.emit(Evt_Click_Building, buildingId);
    }

    private async updateWorkerItem(item: Node, data: { lock: string, info: SPlayerDataRole }) {
        let icon = item.getChildByPath("mask/icon").getComponent(Sprite);
        let lock = item.getChildByName("lock");
        let add = item.getChildByName("add");
        let name = item.getChildByName("name").getComponent(Label);
        let value = item.getChildByPath(`lbl_bg/num`).getComponent(Label);
        let resIcon = item.getChildByPath(`lbl_bg/icon`).getComponent(Sprite);
        let medal_num = item.getChildByPath(`medal_bg/medal_num`).getComponent(Label);

        value.string = ``;
        medal_num.string = "";
        icon.node.active = false;
        add.active = false;
        lock.active = false;
        if (!data) return;
        if (data.lock) {
            lock.active = true;
            name.string = data.lock;
            item.getChildByName(`lbl_bg`).active = false;
            item.getChildByName(`medal_bg`).active = false;
        } else if (!data.info) {
            add.active = true;
            name.string = "派遣工人";
            item.getChildByName(`lbl_bg`).active = false;
            item.getChildByName(`medal_bg`).active = false;
        } else {
            let std = CfgMgr.GetRole()[data.info.type];
            let url = path.join(folder_head_round, std.Icon, "spriteFrame");
            icon.spriteFrame = await ResMgr.LoadResAbSub(url, SpriteFrame);
            icon.node.active = true;
            name.string = std.Name;
            item.getChildByName(`lbl_bg`).active = false;
            item.getChildByName(`medal_bg`).active = false;

            let cfg = CfgMgr.GetProduceCasting(data.info.type, data.info.quality)
            let v: number = -1
            if (cfg) {
                v = cfg.produce_casting
            }
            if (v >= 0) {
                ResMgr.LoadResAbSub(path.join(folder_item, "qianghuashi", "spriteFrame"), SpriteFrame, res => {
                    resIcon.spriteFrame = res;
                });
                value.string = `+${formatNumber(v, 2)}`
                item.getChildByName(`lbl_bg`).active = true;
            }

            let cfg_medal = CfgMgr.GetProduceMedal(data.info.type, data.info.quality)
            let v_medal: number = -1
            if(cfg_medal){
                v_medal = cfg_medal.produce_medal
            }
            if (v_medal >= 0) {
                // ResMgr.LoadResAbSub(path.join(folder_item, "qianghuashi", "spriteFrame"), SpriteFrame, res => {
                //     resIcon.spriteFrame = res;
                // });
                medal_num.string = `+${formatNumber(v_medal, 2)}`
                item.getChildByName(`medal_bg`).active = true;
            }   
        }
    }

    private workerAttrSort(a: SPlayerDataRole, b: SPlayerDataRole): number {
        let a_cfg = CfgMgr.GetProduceCasting(a.type, a.quality);
        let b_cfg = CfgMgr.GetProduceCasting(b.type, b.quality);
        if (a_cfg && b_cfg) {
            if (b_cfg.produce_casting == a_cfg.produce_casting) {
                return a.type - b.type;
            }
            return b_cfg.produce_casting - a_cfg.produce_casting;
        }
    }

    //-----------------------图鉴相关-----------------
    private updateIllustrate() {
        let data = this.getQualityByType()
        this.illustratedScroller.content.removeAllChildren();
        this.has_num = 0;
        for (let index = 0; index < data.length; index++) {
            const element = data[index];
            let clone = instantiate(this.item);
            this.illustrateUpdateItem(clone, element)
            this.illustratedScroller.content.addChild(clone);
        }
        this.illustratedScroller.scrollToTop();
        this.has_role_label.string = this.has_num + "";
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

    private illustrateUpdateItem(item: Node, data: StdRole[]) {

        let spr = item.getChildByName("titlebg").getComponent(Sprite)
        let role_data = data[0];
        ResMgr.LoadResAbSub(path.join("sheets/role/", "Illustrated" + role_data.RoleTypeQual, "spriteFrame"), SpriteFrame).then(sf => {
            spr.spriteFrame = sf;
        })

        let card_item = item.getChildByPath("content/Card");
        let content = item.getChildByName("content");
        content.removeAllChildren();

        for (let index = 0; index < data.length; index++) {
            const element = data[index];
            let role: SPlayerDataRole = PlayerData.getMaxQualityByType(element.RoleType);
            let card_clone = instantiate(card_item);
            content.addChild(card_clone);
            let quality = role ? role.quality : element.Quality
            let is_has = role ? true : false;
            if (is_has) {
                this.has_num++;
                // this.max_fighting += role.battle_power;
            }
            SetNodeGray(card_clone, !is_has)
            this.setCardData(card_clone, element, quality, is_has);
        }
    }

    private async setCardData(item: Node, data: StdRole, role_quality, is_has: boolean) {
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

    private onClick(e: Button) {
        let name = e.node.name;
        switch (name) {
            case "expeditionBtn":
                Goto(PANEL_TYPE.PvePanel)
                this.Hide();
                break;
            case "sweepBtn":
                Goto(PANEL_TYPE.PvePanel, 1)
                this.Hide();
                break;
            case "rewardBtn":
                this.onShowBoxTips();
                break;
            case "caijiBtn": ;
                this.Hide();
                let buildingId = CfgMgr.GetHomeLandBuilding(PlayerData.RunHomeId, BuildingType.ji_di)[0].BuildingId;//获取当前家园基地id
                EventMgr.emit(Evt_Click_Building, buildingId);
                break;
            default:
                break;
        }
    }

    private onShowBoxTips(): void {
        let stdInfo: StdLevel = CfgMgr.GetSaoDangLevel(PlayerData.pveData.progress, this.max_fighting);
        let max_lv = stdInfo ? stdInfo.ID : 0;;
        let std: StdLevel = null;
        let num = []
        if (max_lv != 0) {
            std = CfgMgr.GetLevel(max_lv)
            let max_count = CfgMgr.GetCommon(StdCommonType.PVE).Sweepnumb
            for (let index = 0; index < std.sweepNumber.length; index++) {
                const element = std.sweepNumber[index] * max_count;
                num.push(element)
            }
        } else {
            max_lv = 1;
            std = CfgMgr.GetLevel(max_lv)
            let max_count = 0
            for (let index = 0; index < std.sweepNumber.length; index++) {
                const element = std.sweepNumber[index] * max_count;
                num.push(element)
            }
        }
        let list: SThing[] = ItemUtil.GetSThingList(std.sweepType, std.sweepID, num);
        this.activeBoxTips.SetData(list);
        this.rewardNode.active = true;
    }

    private onCloseNode() {
        this.rewardNode.active = false;
    }

    private onHelpBtn() {
        Tips2.Show(Tips2ID.Palace);
    }

    protected onHide(...args: any[]): void {
        EventMgr.emit(Evt_Show_Scene, js.getClassByName(this));
    }
}