import { _decorator, Button, Color, Component, find, Input, js, Label, Layout, Node, path, RichText, Size, Sprite, SpriteFrame, Toggle, UITransform, Vec3 } from 'cc';
import { AutoScroller } from '../../../utils/AutoScroller';
import { Attr, CardQuality, CfgMgr, StdBuilding, StdCommonType, StdDefineBuilding, StdEquityCard, StdEquityListType, StdEquityType, StdRole } from '../../../manager/CfgMgr';
import { folder_head_round, folder_icon, folder_item, folder_quality, ResMgr } from '../../../manager/ResMgr';
import PlayerData, { } from '../../roleModule/PlayerData'
import { SBattleRole, SPlayerDataBuilding, SPlayerDataRole } from '../../roleModule/PlayerStruct';
import { Evt_Building_Upgrade, Evt_Building_Upgrade_Complete, EventMgr, Evt_Item_Change, Evt_FlushWorker, Evt_FlushJiDiReward, Goto } from '../../../manager/EventMgr';
import { DeepCopy, formatK, formatNumber, formatTime, minn } from '../../../utils/Utils';
import { Session } from '../../../net/Session';
import { Tips } from '../../login/Tips';
import { MsgTypeSend } from '../../../MsgType';
import { FormatAttr, FormatRoleAttr, GetAttrValue, GetAttrValueByIndex, SetNodeGray, UpdateBuildingAttr } from '../../common/BaseUI'
import { AttrSub, ConditionSub } from '../../common/AttrSub';
import { BuildingType } from '../HomeStruct';
import { SelectHeroPanel } from '../../common/SelectHeroPanel';
import { BeforeGameUtils } from '../../../utils/BeforeGameUtils';
import { Audio_CommonWork, AudioMgr } from '../../../manager/AudioMgr';
import { GameSet } from '../../GameSet';
import { PANEL_TYPE } from '../../../manager/PANEL_TYPE';
import { ClickTipsPanel } from '../../common/ClickTipsPanel';
import { ComponentType } from '../../../../../extensions/plugin-import-2x/static/migrate-resources/default-assets-2d/scripts/studio-component';
const { ccclass, disallowMultiple, property } = _decorator;

@ccclass('BaseLvPage')
@disallowMultiple(true)
export class JidiBaseWorkPage extends Component {
    private value: Label;
    private rateCont: Node;
    private rateIcon: Sprite;
    private rateValLab: Label;
    private titleLab: Node;
    private btn: Node;
    private get_btn: Node;
    private rateCont2: Node;
    private rateIcon2: Sprite;
    private rateValLab2: Label;

    private cardNode: Node
    private cardHelpBtn: Node;
    private card_rateIcon: Sprite;
    private card_rateValLab: Label;
    private card_rateIcon2: Sprite;
    private card_rateValLab2: Label;
    private Icon: Sprite;
    private itemIcon: Sprite;
    private itemValue: Label;
    private card_titleLab: Label;
    private card_value: Label;
    private card_Scroller: AutoScroller;
    private cardTipsCont: Node;
    private helpBtn: Node
    private rateShowNode: Node;
    private rateShowNodeClsoe: Node;
    private rateShowScroller: AutoScroller;
    private left: Node;
    private right: Node;
    private page_label: Label;
    private navBtns: Node[];


    private workScroller: AutoScroller;
    private buildingId: number;
    private canCollect: boolean;
    private curCardList: StdEquityCard[] = [];
    private page = 1;
    private max_page = 1;
    private role_type_lsit = [];
    private type: number;
    protected onLoad(): void {
        this.cardTipsCont = this.node.getChildByName("cardTipsCont");
        this.rateCont = this.node.getChildByName("rateCont");
        this.rateIcon = this.node.getChildByPath("rateCont/icon").getComponent(Sprite);
        this.rateValLab = this.node.getChildByPath("rateCont/valueLab").getComponent(Label);
        this.titleLab = this.node.getChildByPath("rateCont/titleLab");

        this.rateCont2 = this.node.getChildByName("rateCont2");
        this.rateIcon2 = this.node.getChildByPath("rateCont2/icon").getComponent(Sprite);
        this.rateValLab2 = this.node.getChildByPath("rateCont2/valueLab").getComponent(Label);
        this.helpBtn = this.node.getChildByPath("rateCont2/helpBtn");
        this.helpBtn.on(Input.EventType.TOUCH_END, this.onRateShow, this);
        this.value = this.node.getChildByPath("workerCount/count/value").getComponent(Label);

        this.workScroller = this.node.getChildByPath("workLayout/ScrollView").getComponent(AutoScroller);
        this.workScroller.SetHandle(this.updateWorkerItem.bind(this));
        this.workScroller.node.on("select", this.onSelectWorker, this);

        this.btn = this.node.getChildByPath("btnNode/btn");
        this.btn.on(Input.EventType.TOUCH_END, this.onTouch, this);

        this.get_btn = this.node.getChildByPath("btnNode/get_btn");
        this.get_btn.on(Input.EventType.TOUCH_END, this.getReward, this);

        this.cardNode = this.node.getChildByPath("cardNode");
        this.cardHelpBtn = this.node.getChildByPath("cardNode/workLayout/rateCont/helpBtn");
        this.cardHelpBtn.on(Input.EventType.TOUCH_END, this.onHelp, this);
        this.Icon = this.node.getChildByPath("cardNode/infoBar/icon").getComponent(Sprite);
        this.itemIcon = this.node.getChildByPath("cardNode/infoBar/Item/icon").getComponent(Sprite);
        this.itemValue = this.node.getChildByPath("cardNode/infoBar/Item/value").getComponent(Label);
        this.card_rateIcon = this.node.getChildByPath("cardNode/workLayout/rateCont/icon").getComponent(Sprite);
        this.card_rateValLab = this.node.getChildByPath("cardNode/workLayout/rateCont/valueLab").getComponent(Label);

        this.card_rateIcon2 = this.node.getChildByPath("cardNode/workLayout/rateCont2/icon").getComponent(Sprite);
        this.card_rateValLab2 = this.node.getChildByPath("cardNode/workLayout/rateCont2/valueLab").getComponent(Label);

        this.card_titleLab = this.node.getChildByPath("cardNode/workLayout/title").getComponent(Label);
        this.card_value = this.node.getChildByPath("cardNode/workLayout/workerCount/count/value").getComponent(Label);
        this.card_Scroller = this.node.getChildByPath("cardNode/workLayout/ScrollView1").getComponent(AutoScroller);
        this.card_Scroller.SetHandle(this.updateCardItem.bind(this));

        this.rateShowNode = this.node.getChildByPath("rateShowNode")
        this.rateShowNodeClsoe = this.node.getChildByPath("rateShowNode/close")
        this.rateShowNodeClsoe.on(Input.EventType.TOUCH_END, this.onCloseRateShowNode, this);
        this.rateShowScroller = this.node.getChildByPath("rateShowNode/ScrollView").getComponent(AutoScroller);
        this.rateShowScroller.SetHandle(this.updatShoweRateItem.bind(this));
        this.left = this.node.getChildByPath("rateShowNode/left")
        this.left.on(Input.EventType.TOUCH_END, this.onLeft, this);
        this.right = this.node.getChildByPath("rateShowNode/right")
        this.right.on(Input.EventType.TOUCH_END, this.onRight, this);
        this.page_label = this.node.getChildByPath("rateShowNode/page_label").getComponent(Label);

        EventMgr.on(Evt_FlushWorker, this.flush, this);
        EventMgr.on(Evt_FlushJiDiReward, this.updateReward, this);
    }

    Show(buildingId: number,) {
        EventMgr.on(Evt_FlushWorker, this.flush, this);
        this.node.active = true;
        this.buildingId = buildingId;

        this.flush();
    }
    Hide() {
        EventMgr.off(Evt_FlushWorker, this.flush, this);
        if (this.workScroller) this.workScroller.Clean();
        this.node.active = false;
    }

    /**
     * 更新等级状态
     * @returns 
     */
    private flush(buildingId?: number) {
        if (buildingId && buildingId != this.buildingId) return;
        this.cardNode.active = false;
        this.rateShowNode.active = false;


        let workerRate: number = 0;//熔铸石工作效率
        let workerRate_medal: number = 0;//勋章工作效率
        this.updateReward();

        let info = PlayerData.GetBuilding(this.buildingId);
        if (!info) return;
        let std = CfgMgr.GetBuildingLv(this.buildingId, info.level);
        if (GameSet.GetServerMark() == "hc" || GameSet.GetServerMark() == "xf") {
            this.cardNode.active = true;
            let cards: StdEquityCard[] = PlayerData.GetEquityByTypeGetCardList(StdEquityListType.Type_5);
            let cardRadio: number = PlayerData.GetEquityByTypeTotalValue(StdEquityListType.Type_5);
            this.curCardList = PlayerData.GetEquityByTypeGetCardList(StdEquityListType.Type_5, true);
            cards.sort((a, b) => {
                let a_residueTime = PlayerData.GetEquityCardResidueTime(a.Equity_CardID);
                let b_residueTime = PlayerData.GetEquityCardResidueTime(b.Equity_CardID);
                if (a_residueTime == b_residueTime) {
                    return a.Equity_CardID - b.Equity_CardID
                }
                return b_residueTime - a_residueTime;
            })
            this.card_Scroller.UpdateDatas(cards);
            this.card_value.string = `${this.curCardList.length}/${cards.length}`;
            this.card_titleLab.string = "月卡权益";
            this.card_Scroller.node.active = true;
            this.itemValue.string = std.produce_casting + "/24h";
            let card_workerRate: number = std.produce_casting.mul(cardRadio);//totalCollectValue * collectRate;//工作效率
            let cardRadio_medal: number = PlayerData.GetEquityByTypeTotalValue(StdEquityListType.Type_7);
            let card_workerRate_medal: number = cardRadio_medal;//totalCollectValue * collectRate;//工作效率
            this.card_rateValLab.string = Math.floor(card_workerRate) + "/24h";
            let time = CfgMgr.GetCommon(StdCommonType.Gather).PointTime / 3600
            this.card_rateValLab2.string = Math.floor(card_workerRate_medal) + "/" + time + "h";

        }
        //工人属性
        for (let index = 0; index < info.workerIdArr.length; index++) {
            let roleData: SPlayerDataRole = info.workerIdArr[index];
            let cfg = CfgMgr.GetProduceCasting(roleData.type, roleData.quality)
            let produce_casting_num: number = 0
            if (cfg) {
                produce_casting_num = roleData.ownership_type ? cfg.produce_casting_lock : cfg.produce_casting;
            }
            workerRate = workerRate + produce_casting_num;

            let cfg_medal = CfgMgr.GetProduceMedal(roleData.type, roleData.quality)
            let produce_medal_num: number = 0
            if (cfg_medal) {
                produce_medal_num = roleData.ownership_type ? cfg_medal.produce_medal_lock : cfg_medal.produce_medal;
            }
            workerRate_medal = workerRate_medal + produce_medal_num;
        }

        this.rateCont.active = true;
        ResMgr.LoadResAbSub(path.join(folder_item, "qianghuashi", "spriteFrame"), SpriteFrame, res => {
            this.rateIcon.spriteFrame = res;
            this.itemIcon.spriteFrame = res;
            this.card_rateIcon.spriteFrame = res;
            this.Icon.spriteFrame = res;
        });

        ResMgr.LoadResAbSub(path.join(folder_item, "xunzhang", "spriteFrame"), SpriteFrame, res => {
            this.rateIcon2.spriteFrame = res;
            this.card_rateIcon2.spriteFrame = res;
        });

        this.titleLab.active = true;
        this.rateValLab.string = `${formatNumber(workerRate, 2)}/8h`;
        let time = CfgMgr.GetCommon(StdCommonType.Gather).RolepointTime / 3600
        this.rateValLab2.string = `${formatNumber(workerRate_medal, 2)}/` + time + "h";;

        let max = CfgMgr.GetMaxWorkerNum(this.buildingId);
        let len = std.WorkingRolesNum;
        this.value.string = info.workerIdArr.length + "/" + len;

        info.workerIdArr.sort(this.workerAttrSort.bind(this))
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
    }

    private async updateWorkerItem(item: Node, data: { lock: string, info: SPlayerDataRole }) {
        let icon = item.getChildByPath("mask/icon").getComponent(Sprite);
        let lock = item.getChildByName("lock");
        let add = item.getChildByName("add");
        let name = item.getChildByName("name").getComponent(Label);
        let value = find(`lbl_bg/num`, item).getComponent(Label);
        let resIcon = find(`lbl_bg/icon`, item).getComponent(Sprite);

        let medal_num = find(`medal_bg/medal_num`, item).getComponent(Label);

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
                v = data.info.ownership_type ? cfg.produce_casting_lock : cfg.produce_casting;
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
            if (cfg_medal) {
                v_medal = data.info.ownership_type ? cfg_medal.produce_medal_lock : cfg_medal.produce_medal;
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
    private nameCor: Color = new Color();
    private corStr: { [key: string]: string } = BeforeGameUtils.toHashMapObj(
        StdEquityType.Type_1, "#3E86AF",
        StdEquityType.Type_2, "#37B541",
        StdEquityType.Type_3, "#A64CE1",
        StdEquityType.Type_4, "#EA5B1C",
    );
    private updateCardItem(item: Node, stdEquityCard: StdEquityCard) {
        let icon: Sprite = item.getChildByPath("mask/icon").getComponent(Sprite);
        let noActivate: Node = item.getChildByName("noActivate");
        let timeCont: Node = item.getChildByName("timeCont");
        let timeLab: Label = item.getChildByPath("timeCont/timeLab").getComponent(Label);
        let nameLab: Label = item.getChildByName("nameLab").getComponent(Label);
        let effect: Node = item.getChildByName("effect");
        let value = find(`lbl_bg/num`, item).getComponent(Label);
        let resIcon = find(`lbl_bg/icon`, item).getComponent(Sprite);
        let value_medal = find(`lbl_bg/num_1`, item).getComponent(Label);
        let res_medal_icon = find(`lbl_bg/icon_1`, item).getComponent(Sprite);
        nameLab.string = stdEquityCard.name;
        let nameColor: string = this.corStr[stdEquityCard.CardType];
        nameLab.color = this.nameCor.fromHEX(nameColor);
        ResMgr.LoadResAbSub(path.join(folder_item, CfgMgr.Getitem(stdEquityCard.Item_Id).Icon, "spriteFrame"), SpriteFrame, sf => {
            icon.spriteFrame = sf;
        });
        ResMgr.LoadResAbSub(path.join(folder_item, "qianghuashi", "spriteFrame"), SpriteFrame, res => {
            resIcon.spriteFrame = res
        });

        ResMgr.LoadResAbSub(path.join(folder_item, "xunzhang", "spriteFrame"), SpriteFrame, res => {
            res_medal_icon.spriteFrame = res
        });

        item.off(Input.EventType.TOUCH_END);

        let residueTime = PlayerData.GetEquityCardResidueTime(stdEquityCard.Equity_CardID);
        if (residueTime > 0) {
            noActivate.active = false;
            timeCont.active = true;
            effect.active = true;
            SetNodeGray(icon.node, false, false);
            if (residueTime > 86400) {
                timeLab.string = `剩余${Math.floor(residueTime / 86400)}天`;
            } else if (residueTime > 3600) {
                timeLab.string = `剩余${Math.floor(residueTime / 3600)}小时`;
            } else if (residueTime > 360) {
                timeLab.string = `剩余${Math.floor(residueTime / 360)}分钟`;
            } else {
                timeLab.string = `剩余1分钟`;
            }
            let radio: number = PlayerData.GetEquityCardByTypeValue(stdEquityCard.Equity_CardID, StdEquityListType.Type_5);
            value.string = "×" + Math.floor(radio);
            value.color = new Color().fromHEX("#DF861E");

            let cardRadio_medal: number = PlayerData.GetEquityCardByTypeValue(stdEquityCard.Equity_CardID, StdEquityListType.Type_7);
            value_medal.string = "×" + Math.floor(cardRadio_medal);
            value_medal.color = new Color().fromHEX("#DF861E");
        } else {
            value.string = "0";
            value.color = new Color().fromHEX("#5D7978");

            value_medal.string = "0";
            value_medal.color = new Color().fromHEX("#5D7978");
            noActivate.active = true;
            timeCont.active = false;
            effect.active = false;
            SetNodeGray(icon.node, true, false);
            item.on(Input.EventType.TOUCH_END, e => {
                Goto(PANEL_TYPE.rightsPanel, stdEquityCard.Equity_CardID);
            }, this);
        }
    }

    private onSelectWorker(index: number, item: Node) {
        let info = PlayerData.GetBuilding(this.buildingId);
        info.workerIdArr.sort(this.workerAttrSort.bind(this))
        let role = info.workerIdArr[index];
        if (role) {
            let sendData = {
                type: MsgTypeSend.BuildingRemoveRole,
                data: {
                    building_id: this.buildingId,
                    role_id: role.id
                }
            }
            Session.Send(sendData);
        } else {
            let std = CfgMgr.GetBuildingLv(this.buildingId, info.level);
            let len = std.WorkingRolesNum;
            if (index < len) {
                let roles = [];
                let ls = PlayerData.GetRoles();
                if (ls.length < 1) {
                    Tips.Show("英雄不足，无法派遣工作");
                    return;
                }
                let results = info.workerIdArr

                for (let role of ls) {
                    let is_has = true;
                    if (results.indexOf(role) == -1) {
                        is_has = false;
                    }
                    // for (let index = 0; index < results.length; index++) {
                    //     const element = results[index];
                    //     if(role.type == element.type){
                    //         // console.log(role.type, element.type)
                    //         is_has = true;
                    //         break
                    //     }        
                    // }
                    if (!is_has) {
                        roles.push(role);
                    }
                }
                roles.sort(this.workerAttrSort.bind(this));
                SelectHeroPanel.SelectWork(roles, info.workerIdArr, 1, this.fileWorkers.bind(this), true);
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
    private fileWorkers(selects: SPlayerDataRole[]) {
        //每个类型的角色只能上一个相同类型的需要替换掉
        let info = PlayerData.GetBuilding(this.buildingId);
        let results = info.workerIdArr.concat();
        for (let select of selects) {
            for (let index = 0; index < results.length; index++) {
                const element = results[index];
                if (select.id == element.id) {
                    let sendData = {
                        type: MsgTypeSend.BuildingRemoveRole,
                        data: {
                            building_id: this.buildingId,
                            role_id: element.id
                        }
                    }
                    Session.Send(sendData);
                }
            }
            if (results.indexOf(select) == -1) {
                let sendData = {
                    type: MsgTypeSend.BuildingAssignRole,
                    data: {
                        building_id: this.buildingId,
                        role_id: select.id
                    }
                }
                Session.Send(sendData);
            }
        }
    }

    private onTouch() {

        AudioMgr.PlayOnce(Audio_CommonWork);
        let info = PlayerData.GetBuilding(this.buildingId);
        let std = CfgMgr.GetBuildingLv(this.buildingId, info.level);
        let len = std.WorkingRolesNum;
        if (len == 0) {
            Tips.Show("等级不足，无法派遣工作");
            return;
        }
        let roles = PlayerData.GetRoles();

        if (roles.length < 1) {
            Tips.Show("英雄不足，无法全部派遣工作");
            return;
        }
        roles.sort(this.workerAttrSort.bind(this));

        let sort_roles = [];
        for (const iterator of roles) {
            // console.log(CfgMgr.GetProduceCasting(iterator.type, iterator.quality))
            if (sort_roles.length <= 0) {
                sort_roles.push(iterator)
            } else {
                let is_jump = false;
                for (let index = 0; index < sort_roles.length; index++) {
                    const element = sort_roles[index];
                    if (iterator.id == element.id) {
                        is_jump = true;
                        break;
                    }
                }
                if (!is_jump) {
                    sort_roles.push(iterator)
                }
            }
            if (sort_roles.length >= len) {
                break;
            }
        }

        let results = info.workerIdArr.concat();
        let isChange = false;
        for (let index = 0; index < len; index++) {
            if (results.indexOf(sort_roles[index]) == -1) {
                isChange = true;
            }
        }
        if (!isChange) {
            Tips.Show(`目前已是最佳指派方案`);
            return;
        }

        //只下掉不是最优的角色
        for (let index = 0; index < results.length; index++) {
            if (sort_roles.indexOf(results[index]) == -1) {
                let sendData = {
                    type: MsgTypeSend.BuildingRemoveRole,
                    data: {
                        building_id: this.buildingId,
                        role_id: results[index].id
                    }
                }
                Session.Send(sendData);
            }   
        }

        for (let i = 0; i < len; i++) {
            let role = sort_roles[i]
            if (role &&  results.indexOf(role) == -1) {
                let sendData = {
                    type: MsgTypeSend.BuildingAssignRole,
                    data: {
                        building_id: this.buildingId,
                        role_id: role.id
                    }
                }
                Session.Send(sendData);
            }
        }
    }

    private getColletcTime() {
        let stone_data = PlayerData.roleInfo.fusion_stone_data;
        let is_can_1 = false;
        if (stone_data && stone_data.amount) {
            let ids = Object.keys(PlayerData.roleInfo.fusion_stone_data.amount);
            is_can_1 = ids.length > 0 && PlayerData.roleInfo.fusion_stone_data.amount[BuildingType.ji_di] > 0
        }

        let medal_data = PlayerData.roleInfo.plunderData
        let is_can_2 = false;
        if (medal_data && medal_data.last_collect_efficiency) {
            let ids = Object.keys(PlayerData.roleInfo.plunderData.last_collect_efficiency);
            is_can_2 = ids.length > 0 && PlayerData.roleInfo.plunderData.last_collect_efficiency[BuildingType.ji_di] > 0
        }
        this.canCollect == is_can_1 || is_can_2;
    }
    private updateReward() {
        this.getColletcTime();
        this.get_btn.active = this.canCollect;
    }

    /**领取奖励 */
    private getReward() {
        let sendData = {
            type: MsgTypeSend.CollectFusionStonesRequest,
            data: {
                building_id: this.buildingId,
            }
        }
        Session.Send(sendData);
    }

    private onHelp() {
        let tipsStr:string = "";
        if(GameSet.GetServerMark() == "xf"){
            tipsStr = `(      采集效率) x (      初级战魂卡+     中级战魂卡+      高级战魂卡)`
        }else{
            tipsStr = `(      采集效率) x (      初级战令卡+     中级战令卡+      高级战令卡)`
        }
        let cardNameList: string[] = [];
        for (let index = 0; index < this.curCardList.length; index++) {
            cardNameList.push("card_" + this.curCardList[index].Equity_CardID);
        }
        this.onShowWorkEquityTips(tipsStr, cardNameList, this.cardHelpBtn);
    }

    private onShowWorkEquityTips(tipsStr: string, cardNameList: string[], btnNode: Node): void {
        let tipsLab: RichText = this.cardTipsCont.getChildByPath("tipsLab").getComponent(RichText);
        tipsLab.string = tipsStr;
        let attrIcon: Sprite = this.cardTipsCont.getChildByPath("iconCont/quaneng").getComponent(Sprite);
        ResMgr.LoadResAbSub(path.join(folder_item, "qianghuashi", "spriteFrame"), SpriteFrame, res => {
            attrIcon.spriteFrame = res
        });
        let cardNodeList: Node[] = this.cardTipsCont.getChildByPath("cardCont").children;
        let cardNode: Node;
        for (let index = 0; index < cardNodeList.length; index++) {
            cardNode = cardNodeList[index];
            if (cardNameList.indexOf(cardNode.name) > -1) {
                SetNodeGray(cardNode, false, false);
            } else {
                SetNodeGray(cardNode, true, false);
            }
        }
        let btnSize: Size = btnNode.getComponent(UITransform).contentSize;
        let showPos: Vec3 = btnNode.worldPosition.clone();
        showPos.x = showPos.x - 250;
        showPos.y = showPos.y - btnSize.height - this.cardTipsCont.getComponent(UITransform).height * 0.5 + 40;
        ClickTipsPanel.Show(this.cardTipsCont, this.node, btnNode, showPos, 0, () => {
        });
    }

    private onRateShow() {
        this.rateShowNode.active = true;
        this.navBtns = this.node.getChildByPath("rateShowNode/content").children.concat();
        for (let btn of this.navBtns) {
            btn.on('toggle', this.onPage, this);
        }
        this.onPage(this.navBtns[0].getComponent(Toggle));
    }

    private onPage(toggle: Toggle) {
        let page = this.navBtns.indexOf(toggle.node);
        if (page < 0 || page == this.type) return;
        this.page = 1;
        this.type = page
        let role_data = CfgMgr.GetRole();
        this.role_type_lsit = [];
        for (const key in role_data) {
            let role = role_data[key];
            if (role.isHeroGallery == 1) {
                this.role_type_lsit.push(role);
            }
        }
        this.max_page = Math.ceil(this.role_type_lsit.length / 6);
        this.showPage();
        this.setShowData();
    }

    private setShowData() {
        let list_data = []
        for (let index = 0; index < this.role_type_lsit.length; index++) {
            const element = this.role_type_lsit[index];
            let num = Math.floor(index / 6)
            if (num + 1 == this.page) {
                list_data.push(element)
            }
        }

        this.rateShowScroller.UpdateDatas(list_data)
    }

    private showPage() {
        this.page_label.string = this.page + "/" + this.max_page;
    }

    private onLeft() {
        if (this.page <= 1) return
        this.page--;
        this.showPage();
        this.setShowData();
    }

    private onRight() {
        if (this.page >= this.max_page) return
        this.page++;
        this.showPage();
        this.setShowData();
    }

    private onCloseRateShowNode() {
        this.rateShowNode.active = false;
    }

    private updatShoweRateItem(node: Node, data: StdRole) {
        let icon = node.getChildByPath("mask/icon").getComponent(Sprite);
        ResMgr.LoadResAbSub(path.join(folder_head_round, data.Icon, "spriteFrame"), SpriteFrame, res => {
            icon.spriteFrame = res
        });

        let layout = node.getChildByName("layout");
        for (let index = 0; index < layout.children.length; index++) {
            const element = layout.children[index];
            element.active = false

        }
        let quality_lsit = [];
        if (this.type == 0) {
            quality_lsit = CfgMgr.GetAllProduceCasting(data.RoleType);
        } else {
            quality_lsit = CfgMgr.GetAllProduceMedal(data.RoleType);
        }
        let time = CfgMgr.GetCommon(StdCommonType.Gather).RolepointTime / 3600;
        for (let index = 0; index < quality_lsit.length; index++) {
            const element = quality_lsit[index];
            layout.children[index].active = true;
            let quality_icon = layout.children[index].getChildByName("N").getComponent(Sprite);
            ResMgr.LoadResAbSub(path.join(folder_quality, CardQuality[element.RoleQuailty], "spriteFrame"), SpriteFrame, res => {
                quality_icon.spriteFrame = res
            });

            let lbl = layout.children[index].getChildByName("lab").getComponent(Label);
            if (this.type == 0) {
                lbl.string = element.produce_casting + "/8h";
            } else {
                lbl.string = element.produce_medal + "/" + time + "h";
            }

        }
    }
}
