import { Button, Component, Event, EventTouch, Input, Label, Layout, Node, RichText, ScrollView, Sprite, SpriteFrame, Toggle, Tween, UIOpacity, UITransform, Vec3, Widget, easing, find, instantiate, js, path, sp, tween, view } from "cc";
import { Panel } from "../../GameRoot";
import { AutoScroller } from "../../utils/AutoScroller";
import PlayerData, { CountPower, RoleCardPower } from "../roleModule/PlayerData"
import { SPlayerData, SPlayerDataItem, SPlayerDataRole, SPlayerDataSkill, SThing, Tips2ID } from "../roleModule/PlayerStruct";
import { Attr, AttrFight, AttrType, CardQuality, CfgMgr, StdActiveSkill, StdMerge, StdPassiveLevel, StdRoleQuality, StdRoleQualityUp, ThingType } from "../../manager/CfgMgr";
import { ResMgr, folder_attr, folder_common, folder_icon, folder_item, folder_quality, folder_skill } from "../../manager/ResMgr";
import { Session } from "../../net/Session";
import { Tips } from "../login/Tips";
import { MsgTypeRet, MsgTypeSend } from "../../MsgType";
import { FormatAttrUp, FormatAttrUpByRole, GetSolderNum, SetNodeGray, SpliceSolderNum } from "../common/BaseUI"
import { AttrSub, ConditionSub } from "../common/AttrSub";
import { Second, ToFixed } from "../../utils/Utils";
import Logger from "../../utils/Logger";
import { SelectHeroPanel } from "../common/SelectHeroPanel";
import { FanyuUpPage } from "./FanyuUpPage";
import { ShowHeroPanel } from "../common/ShowHeroPanel";
import { EventMgr, Evt_Hide_Scene, Evt_Show_Scene, Goto } from "../../manager/EventMgr";
import { CLICKLOCK } from "../common/Drcorator";
import { FanyuCard } from "./FanyuCard";
import { ActiveSkillTipsPanel } from "../common/ActiveSkillTipsPanel";
import { PassiveSkillTipsPanel } from "../common/PassiveSkillTipsPanel";
import { Tips2 } from "../home/panel/Tips2";
import { AudioMgr, Audio_FanyuFail, Audio_FanyuSucc } from "../../manager/AudioMgr";
import { HomeLogic } from "../home/HomeLogic";
import LocalStorage from "../../utils/LocalStorage";
import { DateUtils } from "../../utils/DateUtils";
import { fanyuTips } from "./fanyuTips";
import { RewardTips } from "../common/RewardTips";
import { PANEL_TYPE } from "../../manager/PANEL_TYPE";
import { GameSet } from "../GameSet";
import { ItemUtil } from "../../utils/ItemUtils";


export class FanyuPanel extends Panel {
    protected prefab: string = "prefabs/panel/FanyuPanel";

    static get ins(): FanyuPanel { return this.$instance; }
    private mainCard: FanyuCard;
    private otherCard: FanyuCard;
    private Main_body: sp.Skeleton;
    private Main_quality: Sprite;
    private Main_attrScroller: AutoScroller;
    // private Main_fightScroller: AutoScroller;
    private Main_skillScroller: AutoScroller;
    private Main_skillRadioScroller: AutoScroller;
    private Main_radio: Label;
    private Main_okBtn: Sprite;
    private costLabel: Label;
    private addBtn: Node;
    private showNode: Node;
    private okBtn2: Node;
    private Main: Node;
    private Top: Node;
    private closeBtn: Node;
    private Lock: Node;
    private helpBtn1: Node;
    private Main_helpBtn2: Node;
    //数据
    private upitems: string[] = [];
    private upitemNum: number[] = [];
    private upexitems: string[] = [];
    private upexitemNum: number[] = [];
    private friend_ids: string[] = [];
    private std: StdMerge;
    private mainRole: SPlayerDataRole;
    private otherRole: SPlayerDataRole;
    private TopY: number = 0;
    private friendData = [];
    //特效
    private Main_light: sp.Skeleton;
    private Energy: sp.Skeleton;
    private Egg: sp.Skeleton;
    private Merger: sp.Skeleton;
    private Aurora: sp.Skeleton;
    private fanyu_closeBtn: Node;
    private navBar: Node;
    private fanyuPage: Node;

    private type:number;
    protected onLoad() {
        this.closeBtn = this.find(`closeBtn`);
        this.fanyuPage = this.find("fanyuPage");
        this.fanyu_closeBtn = this.find("fanyuPage/fanyu_closeBtn");
        this.helpBtn1 = this.find(`fanyuPage/showUnselect/tipsBg/helpBtn`);
        this.Main_helpBtn2 = this.find(`fanyuPage/Main/helpBtn`);
        this.mainCard = this.find("fanyuPage/Top/main").addComponent(FanyuCard);
        this.otherCard = this.find("fanyuPage/Top/other").addComponent(FanyuCard);
        this.Main_body = this.find("fanyuPage/Main/body", sp.Skeleton);
        this.Main_quality = this.find("fanyuPage/Main/quality", Sprite);
        this.Main_attrScroller = this.find("fanyuPage/Main/leftLayout", AutoScroller);
        this.Main_skillScroller = this.find("fanyuPage/Main/skills", AutoScroller);
        this.Main_skillRadioScroller = this.find("fanyuPage/Main/skillLayout", AutoScroller);
        this.Main_radio = this.find("fanyuPage/Main/radio", Label);
        this.Main_okBtn = this.find("fanyuPage/Main/okBtn", Sprite);
        this.okBtn2 = this.find("fanyuPage/showUnselect/okBtn");
        this.costLabel = this.find("fanyuPage/Main/okBtn/layout/value", Label);
        this.addBtn = this.find(`fanyuPage/Main/addBtn`);
        this.showNode = this.find(`fanyuPage/showUnselect`);
        this.Main = this.find(`fanyuPage/Main`);
        this.Top = this.find(`fanyuPage/Top`);
        this.Lock = this.find(`fanyuPage/Lock`);

        this.Main_light = this.find(`fanyuPage/Main/light/spine`, sp.Skeleton);
        this.Energy = this.find(`fanyuPage/Top/ui_breed_Energy`, sp.Skeleton);
        this.Egg = this.find(`fanyuPage/egg/ui_breed_egg`, sp.Skeleton);
        this.Merger = this.find(`fanyuPage/ui_breed_Merger`, sp.Skeleton);
        this.Aurora = this.find(`fanyuPage/ui_breed_Aurora`, sp.Skeleton);

        this.mainCard.SetMain(true);
        this.otherCard.SetMain(false);

        this.Main_attrScroller.SetHandle(this.UpdateAttrItem.bind(this));
        // this.Main_fightScroller.SetHandle(this.updateItem.bind(this));
        this.Main_skillScroller.SetHandle(this.updateSkillItem.bind(this));
        this.Main_skillRadioScroller.SetHandle(this.updateRadioItem.bind(this));
        let thisObj = this;
        this.scheduleOnce(() => {
            thisObj.TopY = thisObj.Top.getPosition().y;
        })
        this.navBar = this.find("navBar");
        this.navBar.children.forEach((node, index) => {
            node.on(Input.EventType.TOUCH_END, () => {
                thisObj.setNav(index)
            })
        })

        this.Main_okBtn.node.on(Input.EventType.TOUCH_END, this.onFanyu, this);
        this.okBtn2.on(Input.EventType.TOUCH_END, this.onFanyu, this);
        this.closeBtn.on(Input.EventType.TOUCH_END, this.Hide, this);
        this.fanyu_closeBtn.on(Input.EventType.TOUCH_END, this.onBackFanyu, this);
        this.mainCard.node.on(Input.EventType.TOUCH_END, this.onClickCard, this);
        this.otherCard.node.on(Input.EventType.TOUCH_END, this.onClickCard, this);
        this.addBtn.on(Input.EventType.TOUCH_END, this.onClickAdd, this);
        this.helpBtn1.on(Input.EventType.TOUCH_END, this.onHelpBtn, this);
        this.Main_helpBtn2.on(Input.EventType.TOUCH_END, this.onHelpBtn, this);
    }

    //切页
    private setNav(index) {
        if (index == 0) {
        } else if (index == 1) {
            Goto(PANEL_TYPE.FanyuJinHuaPanel);
            this.Hide();
        } else if (index == 2) {
            Goto(PANEL_TYPE.FanyuChongSuiPanel);
            this.Hide();
            return;
        }else if (index == 3) {
           Goto(PANEL_TYPE.FanyuXiLianPanel);
            this.Hide();
            return;
        }
    }

    /**重置UI和数据 */
    public Reset() {
        this.Main_body.node.active = false;
        this.Main_quality.spriteFrame = undefined;
        this.Main_radio.string = 0 + "%"
        this.upitems = [];
        this.upitemNum = [];
        this.upexitems = [];
        this.upexitemNum = [];
        this.friend_ids = [];
        this.type = undefined;
        this.navBar.children[0].getComponent(Toggle).isChecked = true;
    }

    /**点击卡片 */
    @CLICKLOCK(1)
    private onClickCard(event: EventTouch) {
        if (event.target == this.mainCard.node) {//主卡
            this.selectMainRole();
        } else {//副卡
            this.selectMainRole();
        }
    }

    /**选择主卡 */
    private selectMainRole() {
        let curRoles = PlayerData.getFanyuMainRole();
        SelectHeroPanel.SelectMerge(curRoles, [this.mainRole, this.otherRole], 2, this.selectCallBack.bind(this));
    }

    /**选择副卡 */
    private selectOrtherRole() {
        let curRoles = PlayerData.getFanyuOrtherRole(this.mainRole, this.std);
        SelectHeroPanel.SelectMerge(curRoles, [this.mainRole, this.otherRole], 2, this.selectCallBack.bind(this));
    }

    private selectCallBack(selects: SPlayerDataRole[]) {
        if (selects[0]) {
            this.mainCard.SetData(selects[0]);
            this.mainRole = selects[0];
            let stds = CfgMgr.Get("role_quality");
            let thisObj = this;
            stds.forEach((curStd) => {
                if (curStd.MainRoleid == thisObj.mainRole.type && thisObj.mainRole.quality + 1 === curStd.RoleQuailty) {
                    thisObj.std = curStd;
                }
            })
            if (selects[1]) {
                this.otherCard.SetData(selects[1]);
                this.otherRole = selects[1];
            } else {
                this.otherRole = undefined;
                this.otherCard.SetData(this.otherRole);
            }
        } else {
            this.mainRole = undefined;
            this.mainCard.SetData(this.mainRole);
            this.otherRole = undefined;
            this.otherCard.SetData(this.otherRole);
        }
        this.flush();
    }
    protected onShow(): void {
        this.Lock.active = false;
        this.mainRole = undefined;
        this.otherRole = undefined;
        EventMgr.emit(Evt_Hide_Scene, js.getClassName(this));
    }

    /**刷新,初始化 */
    async flush(...args: any[]) {
        if(GameSet.GetServerMark() != "hc"){
            this.navBar.children[2].active = false;
        }
        this.Reset();
        this.setNav(0)
        this.Energy.node.active = true;
        this.setMainMoveAction();
        this.mainCard.SetData(this.mainRole);
        this.otherCard.SetData(this.otherRole);
        let datas1: AttrSub[] = [];
        let datas2: AttrSub[] = [];
        let datas3: any[] = [];
        let datas4: any[] = [];
        if (this.mainRole) {
            this.navBar.active = false;
            this.closeBtn.active = false;
            let std = CfgMgr.GetRole()[this.mainRole.type];
            let scale = std.Scale || 1;
            this.Main_body.node.active = true;
            this.Main_body.node.setScale(0.7 * scale, 0.7 * scale);
            this.Main_body.skeletonData = await ResMgr.LoadResAbSub(path.join("spine/role_p", std.Prefab, std.Prefab), sp.SkeletonData);
            this.Main_body.setAnimation(0, `Idle`, true);
            let url = path.join(folder_icon + "quality", CardQuality[this.std.RoleQuailty] + "_big", "spriteFrame");
            this.Main_quality.spriteFrame = await ResMgr.LoadResAbSub(url, SpriteFrame);
            //品质特效
            let lightPath = path.join("spine/effect", `ui_breed_Magic_${CardQuality[this.std.RoleQuailty]}`, `ui_breed_Magic_${CardQuality[this.std.RoleQuailty]}`);
            this.Main_light.skeletonData = await ResMgr.LoadResAbSub(lightPath, sp.SkeletonData);
            this.Main_light.setAnimation(0, "Loop", true);

            // 基础属性
            let stdNow = CfgMgr.GetRoleQuality(this.mainRole.type, this.mainRole.quality);
            let stdNext: StdRoleQuality;
            if (this.std) stdNext = CfgMgr.GetRoleQuality(this.mainRole.type, this.std.RoleQuailty);
            datas1 = FormatAttrUpByRole(stdNow, this.mainRole.type, stdNext);
            let soldierNumData = GetSolderNum(datas1);
            for (let index = 0; index < datas1.length; index++) {
                const element = datas1[index];
                if (element.id == Attr.LeaderShip) {
                    element.value = (soldierNumData.value || 0) + this.mainRole.soldier_num + (soldierNumData.per || 0);
                    if (stdNow) {
                        element.next = (stdNow.SoldierNum[0] + (soldierNumData.next || 0) + (soldierNumData.per || 0)) + "~" + (stdNow.SoldierNum[1] + (soldierNumData.next || 0) + (soldierNumData.per || 0));
                    }
                }
            }

            if (stdNow) {
                this.Main.getChildByName(`skillBg`).getChildByPath("Node/num").getComponent(Label).string = stdNow.PassiveSkillNumAdd[0] + "~" + stdNow.PassiveSkillNumAdd[1]
            }

            this.Main_radio.string = ToFixed(stdNow.BaseRate * 100, 2) + "%"
            datas3 = [this.mainRole.active_skills[0]];
            let thisObj = this;
            stdNow.ActiveSkillUp.forEach((value, index) => {
                if (value == 1) {
                    datas3 = [thisObj.mainRole.active_skills[index]];
                }
            })
            datas4 = this.mainRole.passive_skills;
        } else {
            // this.okBtn.grayscale = true;
            this.navBar.active = true;
            this.closeBtn.active = true;
            this.costLabel.node.parent.active = false;
        }
        this.Main_attrScroller.UpdateDatas(datas1);
        // this.Main_fightScroller.UpdateDatas(datas2);
        this.Main_skillScroller.UpdateDatas(datas3);
        this.Main_skillRadioScroller.UpdateDatas(datas4);
    }

    /**设置spine动画 */
    private setSpineAction() {
        this.Energy.setAnimation(0, `Loop`, true);
        this.Egg.setAnimation(0, `Loop`, true);
    }

    private setMainMoveAction() {
        let mainOpacity = this.Main.getComponent(UIOpacity);
        Tween.stopAllByTarget(this.Main);
        Tween.stopAllByTarget(this.Top);
        Tween.stopAllByTarget(mainOpacity);
        this.Aurora.node.active = false;
        if (!this.mainRole) {
            this.Main.active = false;
            this.showNode.active = true;
            this.Egg.node.parent.active = true;
            mainOpacity.opacity = 255;
            this.Top.setPosition(new Vec3(0, this.TopY, 1));
            this.setSpineAction();
        } else {
            this.showNode.active = false;
            this.Egg.node.parent.active = false;
            this.Main.active = true;
            this.Top.position = new Vec3(0, 230, 1);
        }
    }

    /**刷新Item */
    protected async UpdateAttrItem(item: Node, data: any) {
        let icon = item.getChildByName("icon")?.getComponent(Sprite);
        let name = item.getChildByName("name")?.getComponent(Label);
        let now = item.getChildByName("nowValue")?.getComponent(Label);
        let next = item.getChildByName("nextValue")?.getComponent(Label);
        if (data.icon) {
            icon.node.active = true;
            icon.spriteFrame = await ResMgr.LoadResAbSub(data.icon, SpriteFrame);
        } else {
            icon.node.active = false;
        }
        if (name) name.string = data.name;
        now.string = data.value + data.per;
        if (next) {
            if (data.next) {
                next.node.active = true;
                next.string = "+" + data.next + data.per;
            } else {
                next.node.active = false;
            }
        }
    }

    protected updateItem(item: Node, data: any) {
        let name = item.getChildByName("name")?.getComponent(Label);
        let now = item.getChildByName("nowValue")?.getComponent(Label);
        let next = item.getChildByName("nextValue")?.getComponent(Label);
        if (name) name.string = data.name;
        now.string = data.value + data.per;
        if (next) {
            if (data.next) {
                next.node.active = true;
                next.string = "+" + data.next + data.per;
            } else {
                next.node.active = false;
            }
        }
    }

    protected async updateSkillItem(item: Node, data: SPlayerDataSkill) {
        let bg = item.getChildByName("bg").getComponent(Sprite);
        let icon = item.getChildByPath("Mask/icon").getComponent(Sprite);
        let name = item.getChildByName("name").getComponent(Label);
        let level = item.getChildByName("level").getComponent(Label);
        let next = item.getChildByName("next").getComponent(Label);
        if (data) {
            icon.node.on(Node.EventType.TOUCH_END, () => {
                ActiveSkillTipsPanel.Show(data);
            }, this);
            let stdSkill: StdActiveSkill = CfgMgr.GetActiveSkill(data.skill_id, data.level);
            name.string = stdSkill.Name;
            level.string = `lv.${data.level}`;
            next.string = `lv.${data.level + 1}`;
            if (stdSkill) {
                let iconUrl: string = path.join(folder_skill, stdSkill.icon.toString(), "spriteFrame");
                ResMgr.LoadResAbSub(iconUrl, SpriteFrame, res => {
                    icon.spriteFrame = res;
                });
                bg.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_quality, "a_skill_bg_" + stdSkill.Quality, "spriteFrame"), SpriteFrame);
            }
        }

    }
    protected updateRadioItem(item: Node, data: SPlayerDataSkill) {
        let icon = find(`Mask/icon`, item).getComponent(Sprite);
        let level = item.getChildByName("lvCont").getComponentInChildren(Label);
        let bg = item.getChildByName("bg").getComponent(Sprite);
        let up = item.getChildByName("up");
        if (data) {
            icon.node.on(Node.EventType.TOUCH_END, () => {
                PassiveSkillTipsPanel.Show(data);
            }, this);
            let stdSkill: StdPassiveLevel = CfgMgr.GetPassiveSkill(data.skill_id, data.level);
            let stdNextSkill: StdPassiveLevel = CfgMgr.GetPassiveSkill(data.skill_id, data.level + 1);
            level.string = `${data.level}`;
            if (stdNextSkill) {
                up.active = true;
            } else {
                up.active = false;
            }
            if (stdSkill) {
                let iconUrl: string = path.join(folder_skill, stdSkill.Icon.toString(), "spriteFrame");
                ResMgr.LoadResAbSub(iconUrl, SpriteFrame, res => {
                    icon.spriteFrame = res;
                });
                let bgUrl = path.join(folder_icon, "quality", "p_skill_bg_" + stdSkill.RareLevel, "spriteFrame");
                ResMgr.LoadResAbSub(bgUrl, SpriteFrame, res => {
                    bg.spriteFrame = res;
                });
            }
        }
    }

    protected onHide(...args: any[]): void {
        HomeLogic.ins.ExistFanyuScene();
        if (FanyuUpPage.ins) FanyuUpPage.ins.resetData();
        let name = js.getClassName(this);
        EventMgr.emit(Evt_Show_Scene, name);
    }

    public OnMerge(role, return_items: SPlayerDataItem[], return_things:SThing[]) {
        PlayerData.DelRole(this.otherRole.id);
        this.Main.active = false;
        this.Top.active = true;
        this.friendData = [];
        this.Egg.node.parent.active = true;
        this.Egg.setAnimation(0, `Start`, true);
        if (this.mainRole.quality == role.quality) {
            AudioMgr.PlayOnce(Audio_FanyuFail);
        } else {
            AudioMgr.PlayOnce(Audio_FanyuSucc);
        }

        let self = this;
        let action1 = () => {
            tween(self.otherCard.node)
                .to(0.17, { scale: new Vec3(0, 1, 1) })
                .call(() => {
                    self.otherCard.node.active = false;
                    self.otherCard.node.scale = new Vec3(1, 1, 1);
                })
                .start();
        }

        let action2 = (callback) => {
            tween(self.Egg)
                .call(() => {
                    // self.Egg.setCompleteListener(() => { self.Egg.clearAnimations(); })
                    self.Egg.setAnimation(0, `Break`, false);
                })
                .delay(1.66)
                .call(() => {
                    if (self.mainRole.quality == role.quality) {
                        ShowHeroPanel.ShowMerge(role, null, callback);
                    } else {
                        ShowHeroPanel.ShowMerge(role, self.mainRole, callback);
                    }
                    self.Aurora.node.active = false;
                })
                .start();
        }
        //卡牌1/6秒反转90度
        tween(self.mainCard.node)
            .to(0.17, { scale: new Vec3(0, 1, 1) })
            .call(() => {
                self.mainCard.node.active = false;
                self.mainCard.node.scale = new Vec3(1, 1, 1);
                self.Merger.setCompleteListener(() => {
                    self.Merger.node.active = false;
                })
                self.Merger.node.active = true;
                self.Merger.setAnimation(0, `animation`, false);
                if (self.mainRole.quality == role.quality) {
                    self.Aurora.node.active = false;
                } else {
                    self.Aurora.node.active = true;
                    self.Aurora.setAnimation(0, `Start`, false);
                }

            })
            .call(action1)
            .delay(1)
            .call(() => {
                self.Top.active = false;
                self.mainCard.node.active = true;
                self.otherCard.node.active = true;
                let callback = () => {
                    self.Top.active = true;
                    self.Main.active = true;
                    self.Lock.active = false;
                    if (self.mainRole.quality == role.quality) {
                        self.ResetOther();
                    } else {
                        self.ResetSelect();
                    }
                    let data = []              
                    if (return_items && return_items.length > 0) {
                        for (let index = 0; index < return_items.length; index++) {
                            const element = return_items[index];  
                            if(element.count > 0){
                                data.push(ItemUtil.CreateThing(ThingType.ThingTypeItem, element.id, element.count))
                            }
                        }
                    }
                    if (return_things && return_things.length > 0) {
                        for (let index = 0; index < return_things.length; index++) {
                            const element = return_things[index];
                            if(element.currency && element.currency.value <=0){
                                continue
                            }else if(element.item.count <= 0){
                                continue
                            }
                            data.push(element)  
                        }
                    }
                    if(data.length > 0){
                        RewardTips.Show(data);
                    }
                }
                action2(callback);
            })
            .start();

    }

    /**重置选择 */
    public ResetSelect() {
        let self = this;
        this.scheduleOnce(() => {
            self.mainRole = undefined;
            self.otherRole = undefined;
            self.Reset()
            if (FanyuUpPage.ins) FanyuUpPage.ins.resetData();
            self.flush();
        }, .1)
    }

    public ResetOther() {
        let self = this;
        this.scheduleOnce(() => {
            self.otherRole = undefined;
            self.Reset()
            if (FanyuUpPage.ins) FanyuUpPage.ins.resetData();
            self.flush();
        }, .1)
    }

    @CLICKLOCK(1)
    private onClickAdd() {
        if (!this.mainRole || !this.otherRole) {
            return Tips.Show(`请先选择需要繁育的英雄`);
        }
        FanyuUpPage.Show(this.mainRole.type, this.mainRole.quality, this.addCallBack.bind(this), this.upitemNum, this.friend_ids, this.friendData, this.upexitemNum)
    }

    private addCallBack(upitems: string[], upitemNums: number[], friendIds: string[], radio: number, friendData, upexitems: string[], upexitemNums: number[]) {
        this.upitems = upitems;
        this.upitemNum = upitemNums;
        this.upexitems = upexitems;
        this.upexitemNum = upexitemNums;
        this.friend_ids = friendIds;
        this.Main_radio.string = ToFixed(radio, 2) + "%"
        this.friendData = friendData;
    }

    @CLICKLOCK(1)
    protected onFanyu() {
        if (this.mainRole) {
            if (!this.otherRole) {
                Tips.Show("请选择繁育副卡！");
                return;
            }
            let stdNow = CfgMgr.GetRoleQuality(this.mainRole.type, this.mainRole.quality);
            if (PlayerData.roleInfo.currency >= stdNow.CoinCostNum) {
                if (this.otherRole) {
                    let thisObj = this;
                    let callback = () => {
                        thisObj.Lock.active = true;
                        thisObj.Energy.node.active = false;
                        let data = {
                            type: MsgTypeSend.MergeRoleRequest,
                            data: {
                                role_id: thisObj.mainRole.id,
                                target_quality: thisObj.std.RoleQuailty,
                                consume_role_id: thisObj.otherRole.id,
                                up_item_ids: thisObj.upitems,
                                up_item_nums: thisObj.upitemNum,
                                friend_ids: thisObj.friend_ids,
                                ex_item_ids: thisObj.upexitems,
                                ex_item_nums: thisObj.upexitemNum
                            }
                        }
                        Session.Send(data, MsgTypeRet.MergeRoleRet)
                    }
                    if (this.otherRole.level > 1 || this.mainRole.level > 1) {
                        let time = LocalStorage.GetNumber("Fanyu" + PlayerData.roleInfo.player_id)
                        if (time) {
                            let isopen = DateUtils.isSameDay(time)
                            if (isopen) {
                                callback();
                                return;
                            }
                        }
                        fanyuTips.Show(callback.bind(this));
                    } else {
                        callback();
                    }
                }
            } else {
                Tips.Show("彩钻不足!");
            }
        } else {
            Tips.Show("请先选择需要繁育的英雄");
        }
    }

    private onHelpBtn() {
        Tips2.Show(Tips2ID.Fanyu);
    }

    private onBackFanyu(){
        this.mainRole = null;
        this.otherRole = null;
        this.flush();
    }
}