import { Color, Input, Label, Node, RichText, Size, Slider, Sprite, SpriteFrame, Toggle, Tween, UITransform, Vec3, game, path, tween, v3 } from "cc";
import { Panel } from "../../../GameRoot";
import { BaseNavPage } from "./BaseNavPage";
import { BaseLvPage } from "./BaseLvPage";
import PlayerData, { } from "../../roleModule/PlayerData"
import { Tips2ID } from "../../roleModule/PlayerStruct";
import { BuildingType } from "../HomeStruct";
import { Tips } from "../../login/Tips";
import { BaseWorkPage } from "./BaseWorkPage";
import { CfgMgr } from "../../../manager/CfgMgr";
import { DefensePage } from "./DefensePage";
import { EventMgr, Evt_Hide_Home_Ui, Evt_Show_Home_Ui, Evt_ShowWorkEquityTips } from "../../../manager/EventMgr";
import { Tips2 } from "./Tips2";
import { ClickTipsPanel } from "../../common/ClickTipsPanel";
import { ResMgr } from "../../../manager/ResMgr";
import { SetNodeGray } from "../../common/BaseUI";
import { PANEL_TYPE } from "../../../manager/PANEL_TYPE";

export class ResourcesPanel extends Panel {
    protected prefab: string = "prefabs/panel/ResourcesPanel";

    protected buildingId: number;
    protected navPage: BaseNavPage;
    protected lvPage: BaseLvPage;
    protected workPage: BaseWorkPage;
    protected defensePage: DefensePage;
    private cardTipsCont: Node;
    protected selectPage = 0;
    private pages: (BaseLvPage | BaseWorkPage | DefensePage)[] = [];
    private helpBtn: Node;

    protected onLoad() {
        this.CloseBy("mask");
        this.helpBtn = this.node.getChildByPath("BaseNavPage/frame/tileBar/helpBtn");
        this.navPage = this.find("BaseNavPage").addComponent(BaseNavPage);
        this.lvPage = this.find("BaseLvPage").addComponent(BaseLvPage);
        this.workPage = this.find("BaseWorkPage").addComponent(BaseWorkPage);
        this.defensePage = this.find("DefensePage").addComponent(DefensePage);
        this.cardTipsCont = this.find("cardTipsCont");
        this.pages = [this.lvPage, this.workPage, this.defensePage];
        for (let page of this.pages) {
            page.Hide();
        }

        this.helpBtn.on(Input.EventType.TOUCH_END, this.onHelpBtn, this);
        this.navPage.node.on('select', this.onSelect, this);
        this.navPage.node.on('close', this.Hide, this);
    }

    public flush(buildingId: number, selectPage?: number) {
        if (!buildingId) return;
        if (buildingId) this.buildingId = buildingId;
        let std = CfgMgr.GetBuildingUnLock(this.buildingId);
        let levelPreview = false;
        if (std.BuildingType == BuildingType.cheng_qiang) {
            this.navPage.SetNav(["升级", "驻守"], [], this.lvPage, this.defensePage);
            this.pages = [this.lvPage, this.defensePage];
        } else if (std.BattleType == 2) {
            this.navPage.SetNav(["升级", "工作"], [], this.lvPage, this.workPage);
            this.pages = [this.lvPage, this.workPage];
            levelPreview = true;
        } else if (std.BattleType == 1) {
            this.navPage.SetNav(["升级"], [], this.lvPage);
            this.pages = [this.lvPage];
        }
        let state = PlayerData.GetBuilding(std.BuildingId, PlayerData.RunHomeId);
        if (!state || state.level == 0) {
            this.Hide();
            Tips.Show(std.remark + "尚未解锁");
            return;
        }
        this.navPage.SetTile(std.remark, buildingId, state.level, levelPreview);
        if (selectPage) {
            this.selectPage = this.selectPage;
        } else {
            this.selectPage = this.selectPage || 0;
        }
        if (selectPage) this.selectPage = selectPage;
        this.navPage.SetPage(this.selectPage);
    }

    protected onShow(): void {
        this.selectPage = undefined;
        EventMgr.emit(Evt_Hide_Home_Ui);
        EventMgr.on(Evt_ShowWorkEquityTips, this.onShowWorkEquityTips, this);
    }
    protected onHide(...args: any[]): void {
        this.lvPage.node.active = false;
        this.workPage.node.active = false;
        this.defensePage.node.active = false;
        EventMgr.off(Evt_ShowWorkEquityTips, this.onShowWorkEquityTips, this);
        EventMgr.emit(Evt_Show_Home_Ui, PANEL_TYPE.ResourcesPanel);
        ClickTipsPanel.Hide();

    }

    async SetPage(page: number) {
        if (!this.$hasLoad) await this.initSub;
        this.onSelect(page);
    }

    protected onSelect(index: number, target?: Node) {
        if (!this.buildingId) return;
        this.selectPage = index;
        this.pages[index].Show(this.buildingId);
        ClickTipsPanel.Hide();
    }
    private onHelpBtn() {
        Tips2.Show(Tips2ID.Collect);
    }
    private onShowWorkEquityTips(tipsStr: string, attrIconUrl: string, cardNameList: string[], btnNode: Node): void {
        let tipsLab: RichText = this.cardTipsCont.getChildByPath("tipsLab").getComponent(RichText);
        tipsLab.string = tipsStr;
        let attrIcon: Sprite = this.cardTipsCont.getChildByPath("iconCont/attrIcon").getComponent(Sprite);
        ResMgr.LoadResAbSub(attrIconUrl, SpriteFrame, res => {
            attrIcon.spriteFrame = res;
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
        showPos.x = showPos.x - 180;
        showPos.y = showPos.y - btnSize.height - this.cardTipsCont.getComponent(UITransform).height * 0.5 + 60;
        ClickTipsPanel.Show(this.cardTipsCont, this.node, btnNode, showPos, 0, () => {

        });
    }
}
