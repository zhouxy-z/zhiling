import { Color, Input, Label, Node, Slider, Sprite, SpriteFrame, Toggle, Tween, UITransform, Vec2, Widget, game, path, tween, v3 } from "cc";
import { Panel } from "../../../GameRoot";
import { BaseNavPage } from "./BaseNavPage";
import { BaseLvPage } from "./BaseLvPage";
import PlayerData, { } from "../../roleModule/PlayerData"
import { Tips2ID } from "../../roleModule/PlayerStruct";
import { BuildingType } from "../HomeStruct";
import { Tips } from "../../login/Tips";
import { EventMgr, Evt_Hide_Home_Ui, Evt_Show_Home_Ui } from "../../../manager/EventMgr";
import { Tips2 } from "./Tips2";
import { CfgMgr } from "../../../manager/CfgMgr";
import { BaseWorkPage } from "./BaseWorkPage";
import { DefensePage } from "./DefensePage";
import { JidiBaseWorkPage } from "./JidiBaseWorkPage";
import { PANEL_TYPE } from "../../../manager/PANEL_TYPE";
import { GameSet } from "../../GameSet";

export class JidiPanel extends Panel {
    protected prefab: string = "prefabs/panel/JidiPanel";

    protected buildingId: number;
    protected navPage: BaseNavPage;
    protected lvPage: BaseLvPage;
    protected JidiworkPage: JidiBaseWorkPage;
    private bg:Node;

    protected selectPage = 0;
    private pages: (BaseLvPage | JidiBaseWorkPage)[] = [];

    private heleBtn: Node;
    protected onLoad() {
        this.CloseBy("mask");
        this.bg = this.find("BaseNavPage/frame");
        this.heleBtn = this.find("BaseNavPage/frame/tileBar/helpBtn");
        this.navPage = this.find("BaseNavPage").getComponent(BaseNavPage);
        this.lvPage = this.find("BaseLvPage").addComponent(BaseLvPage);
        this.JidiworkPage = this.find("BaseWorkPage").addComponent(JidiBaseWorkPage);
        this.pages = [this.lvPage, this.JidiworkPage];
        for (let page of this.pages) {
            page.Hide();
        }
        this.heleBtn.on(Input.EventType.TOUCH_END, this.onHelpBtn, this);
        this.navPage.node.on('select', this.onSelect, this);
        this.navPage.node.on("close", this.Hide, this);
    }

    public flush(buildingId: number) {
        if (!this.buildingId && !buildingId) return;
        if (buildingId) this.buildingId = buildingId;
        this.navPage.SetNav(["升级", "工作"], [], this.lvPage, this.JidiworkPage);
        let state = PlayerData.GetBuildingByType(BuildingType.ji_di, PlayerData.RunHomeId)[0];
        if (!state) {
            this.Hide();
            Tips.Show("兵营尚未解锁");
            return;
        }
        let std = CfgMgr.GetBuildingUnLock(this.buildingId);
        this.navPage.SetTile(std.remark, buildingId, state.level, true);
        this.lvPage.Show(state.id);
    }

    protected onShow(): void {
        EventMgr.emit(Evt_Hide_Home_Ui);
    }

    protected onSelect(index: number, target?: Node) {
        if (!this.buildingId) return;
        if(index == 0){
            this.bg.getComponent(UITransform).setContentSize(1080,1100);
        }else{
            if(GameSet.GetServerMark() == "hc" || GameSet.GetServerMark() == "xf"){
                this.bg.getComponent(UITransform).setContentSize(1080,1450);
            }else{
                this.bg.getComponent(UITransform).setContentSize(1080,820);
            }
        }
        this.bg.children.forEach((node)=>{
            if (node.getComponent(Widget)) {
                node.getComponent(Widget).updateAlignment();
            }
        })
        
        this.selectPage = index;
        this.pages[index].Show(this.buildingId);
    }

    private onHelpBtn() {
        Tips2.Show(Tips2ID.HomeJiDi);
    }
    protected onHide(...args: any[]): void {
        this.lvPage.Hide();
        EventMgr.emit(Evt_Show_Home_Ui, PANEL_TYPE.JidiPanel);
    }

}
