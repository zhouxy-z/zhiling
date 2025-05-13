import { Color, Input, Label, Node, Slider, Sprite, SpriteFrame, Toggle, Tween, UITransform, game, path, random, tween, v3 } from "cc";
import { Panel } from "../../GameRoot";
import { Tips } from "../login/Tips";
import { AutoScroller } from "../../utils/AutoScroller";
import { Second, ToFixed } from "../../utils/Utils";
import { FanyuUpSelectFriendItem } from "./FanyuUpSelectFriendItem";
import { MsgTypeSend } from "../../MsgType";
import { Session } from "../../net/Session";
import { EventMgr, Evt_GetDownLineInfo, Evt_GetRandomDownline } from "../../manager/EventMgr";
import { } from "../roleModule/PlayerData"
import { SDownlineInfo, SFriendSortType, SGetDownlines } from "../roleModule/PlayerStruct";

export class FanyuUpSelectFriendPage extends Panel {
    protected prefab: string = "prefabs/panel/fanyu/FanyuUpSelectFriendPage";

    protected tile: Label;
    private sussLabel: Label;
    protected scroller: AutoScroller;

    protected type: number = 0;
    protected limit = 0;
    private friendsRate = 0;

    protected callback: Function;
    protected datas: { info: SDownlineInfo, select: boolean, sussNum: number, isend: boolean }[] = [];

    private page: number = 1;
    private page_size: number = 10;
    private ishas: boolean = false;
    private ActivityValue: number;

    private select_friend = [];
    protected onLoad() {
        this.CloseBy("mask");
        this.CloseBy("panel/closeBtn");
        // this.tile = this.find("tileBar/buildName", Label);
        this.sussLabel = this.find("panel/Node/sussLabel", Label);
        this.scroller = this.find("panel/ScrollView", AutoScroller);
        this.scroller.SetHandle(this.updateItem.bind(this));
        this.scroller.node.on('select', this.onSelect, this);
        this.find("panel/okBtn").on(Input.EventType.TOUCH_END, this.onOk, this);
        // this.find("panel/closeBtn").on(Input.EventType.TOUCH_END, this.Hide, this);
    }

    protected onShow(): void {
        this.page = 1;
        EventMgr.on(Evt_GetRandomDownline, this.updateFriendData, this);
        this.onSend();
    }

    flush(playerCount: number, friendsRate: number, ActivityValue: number, callBack: Function) {
        this.callback = callBack;
        this.limit = playerCount;
        this.friendsRate = friendsRate;
        this.sussLabel.string = "0%";
        this.ActivityValue = ActivityValue;
    }

    private onSend() {
        let data = {
            type: MsgTypeSend.GetDownlinesRequest,
            data: { page: this.page, page_size: this.page_size, sort_type: SFriendSortType.SortDailyActivityDesc, filter_type: 0, SearchPlayerID: "", include_role: false }
        }
        Session.Send(data);
    }

    private updateFriendData(data: SGetDownlines) {
        let datas: SDownlineInfo[] = data.downlines;
        for (const iterator of datas) {
            if (iterator.is_upline && !this.ishas) {
                let _data = {
                    info: iterator,
                    select: false,
                    sussNum: this.friendsRate,
                    isend: false,
                }
                this.datas.push(_data)
                this.ishas = true
            } else {
                if (!iterator.is_upline) {
                    let _data = {
                        info: iterator,
                        select: false,
                        sussNum: this.friendsRate,
                        isend: false,
                    }
                    this.datas.push(_data)
                }
            }
        }
        this.scroller.UpdateDatas(this.datas);
    }

    protected updateItem(item: Node, data: { info: SDownlineInfo, select: boolean, sussNum: number, isend: boolean }) {
        let itemNode = item.getComponent(FanyuUpSelectFriendItem);
        if (!itemNode) itemNode = item.addComponent(FanyuUpSelectFriendItem);
        itemNode.setData(data, this.ActivityValue);
        item["friendData"] = data;
        if (this.select_friend.indexOf(data) != -1) {
            item.getComponent(Toggle).isChecked = true;
        }
        for (let child of this.scroller.children) {
            child.getChildByName("hightlight").getComponent(Sprite).node.active = false;
        }
        this.checkPage(data);
    }

    protected onOk() {
        let callback = this.callback;
        this.callback = undefined;
        this.datas = [];
        callback?.(this.select_friend);
        this.Hide();
    }

    protected async onSelect(index: number, item: Node) {
        if (!this.limit) return;
        await Second(0);
        if (!this.datas[index].info.is_upline && this.datas[index].info.daily_activity < this.ActivityValue) {
            item.getComponent(Toggle).isChecked = false;
            Tips.Show("活跃度不足");
            return;
        }

        let num = this.select_friend.length;
        let is_select = item["friendData"].select;
        if (!is_select) {
            if (num >= this.limit) {
                item.getComponent(Toggle).isChecked = false;
                Tips.Show("只能选择" + this.limit + "个");
                return;
            } else {
                this.select_friend.push(item["friendData"])
                item["friendData"].select = true;
                item.getComponent(Toggle).isChecked = true;
            }
        } else {
            let index = this.select_friend.indexOf(item["friendData"])
            this.select_friend.splice(index, 1)
            item["friendData"].select = false;
            item.getComponent(Toggle).isChecked = false;
        }

        let chidlren = this.scroller.children;
        for (let child of chidlren) {
            child.getChildByName("hightlight").getComponent(Sprite).node.active = false;
        }
        item.getChildByName("hightlight").getComponent(Sprite).node.active = true;
        let rate_num = this.select_friend.reduce((friendsRate, data) => {
            return friendsRate + data.sussNum;
        }, 0)
        this.sussLabel.string = ToFixed(rate_num * 100, 2) + "%";
    }

    private checkPage(data: { info: SDownlineInfo, select: boolean, sussNum: number, isend: boolean }) {
        if (!(data.isend) && this.datas[this.datas.length - 1] == data) {
            data.isend = true;
            this.page++;
            this.onSend();
        }
    }

    protected onHide(...args: any[]): void {
        let ls = this.scroller.children;
        for (let obj of ls) {
            let item = obj.getComponent(Toggle);
            if (item.isChecked) {
                item.isChecked = false;
            }
            obj.getChildByName("hightlight").getComponent(Sprite).node.active = false;
        }
        this.datas = [];
        this.ishas = false;
        this.select_friend = [];
        EventMgr.off(Evt_GetRandomDownline)
    }
}
