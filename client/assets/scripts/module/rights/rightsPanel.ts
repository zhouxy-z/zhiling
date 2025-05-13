import { Button, EventTouch, Input, Label, Layout, Node, ScrollView, Sprite, SpriteFrame, Toggle, Widget, instantiate, js, path } from "cc";
import { Panel } from "../../GameRoot";
import { EventMgr, Evt_Hide_Scene, Evt_RightsGetReward, Evt_RightsToPage, Evt_Show_Scene, Goto } from "../../manager/EventMgr";
import { CfgMgr, StdEquityList, StdShopowner } from "../../manager/CfgMgr";
import { ResMgr, folder_loot } from "../../manager/ResMgr";
import { AutoScroller } from "../../utils/AutoScroller";
import { ItemUtil } from "../../utils/ItemUtils";
import PlayerData, { } from "../roleModule/PlayerData"
 import {SPlayerDataRole,SThing} from "../roleModule/PlayerStruct";
import { BagItem } from "../bag/BagItem";
import { MsgTypeSend } from "../../MsgType";
import { Session } from "../../net/Session";
import { Tips } from "../login/Tips";
import { MsgPanel } from "../common/MsgPanel";
import { CLICKLOCK } from "../common/Drcorator";
import { TradeHeroPanel } from "../trade/TradeHeroPanel";
import { SetNodeGray } from "../common/BaseUI";
import { GameSet } from "../GameSet";
import { LinkmanItem } from "./LinkmanItem";
import LocalStorage from "../../utils/LocalStorage";
import { RightsPage } from "./RightsPage";
import { RightsGiftPage } from "./RightsGiftPage";
import { RightsChannelPage } from "./RightsChannelPage";

enum RightsPageType {
    RightsPage = 0,//权益卡
    GiftPage,//礼包
    ChannelPage//联系渠道
}
export class rightsPanel extends Panel {
    protected prefab: string = "prefabs/panel/rights/rightsPanel";
    private navBtns: Node[];
    private rightsPage: RightsPage;
    private giftPage: RightsGiftPage;
    private channelPage:RightsChannelPage;
    private page:number;
    private seleceCardId:number;
    protected onLoad(): void {
        
        this.rightsPage = this.find("panel/rightsPage").addComponent(RightsPage);
        this.giftPage = this.find("panel/giftPage").addComponent(RightsGiftPage);
        this.channelPage = this.find("panel/channelPage").addComponent(RightsChannelPage);
        this.navBtns = this.find("navBar").children.concat();
        for (let btn of this.navBtns) {
            btn.on('toggle', this.onPage, this);
        }
        this.navBtns[RightsPageType.GiftPage].on(Input.EventType.TOUCH_END, ()=>{
            MsgPanel.Show("暂未开放");
        }, this);
        if(GameSet.GetServerMark() == "jy"){
            this.navBtns[RightsPageType.ChannelPage].getComponent(Toggle).enabled = false;
            this.navBtns[RightsPageType.ChannelPage].on(Input.EventType.TOUCH_END, ()=>{
                MsgPanel.Show("暂未开放");
            }, this);
        }else{
            this.navBtns[RightsPageType.ChannelPage].getComponent(Toggle).enabled = true;
        }
        this.CloseBy("closeBtn");
    }

    protected onShow(): void {
        EventMgr.emit(Evt_Hide_Scene, js.getClassName(this));
        EventMgr.on(Evt_RightsToPage, this.onToChannelPage, this);
        
    }

    async flush(selectCardId:number = 0) {
        this.seleceCardId = selectCardId;
        this.SetPage(0);
    }

    SetPage(page: number) {   
        if (!this.navBtns[page]) return;
        this.page = undefined;
        this.navBtns[page].getComponent(Toggle).isChecked = true;
        this.onPage(this.navBtns[page].getComponent(Toggle));
    }

    private onPage(toggle: Toggle) {
        let page = this.navBtns.indexOf(toggle.node);
        if (page < 0 || page == this.page) return;
        this.page = page; 
        this.rightsPage.onHide();
        this.giftPage.onHide();
        this.channelPage.onHide();
        switch (this.page) {
            case RightsPageType.RightsPage:
                this.rightsPage.onShow(this.seleceCardId);
                this.seleceCardId = 0;
                break;
            case RightsPageType.GiftPage:
                this.giftPage.onShow();
                break;
            case RightsPageType.ChannelPage:
                this.channelPage.onShow();
                break;
                
            default:
                break;
        }
    }

    protected update(dt: number): void {
        
    }

    protected onHide(...args: any[]): void {
        EventMgr.emit(Evt_Show_Scene, js.getClassByName(this));
        this.rightsPage.onHide();
        EventMgr.off(Evt_RightsToPage, this.onToChannelPage, this);
    }

    private onToChannelPage():void{
        this.SetPage(RightsPageType.ChannelPage);
    }
    
}