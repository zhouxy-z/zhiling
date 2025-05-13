import { Input, Label, Node, Sprite, SpriteFrame, UITransform, Slider, path, ScrollView, instantiate, EventTouch } from "cc";
import { Panel } from "../../GameRoot";
import PlayerData, {} from "../roleModule/PlayerData"
 import {SDownlineInfo,SFriendSortType,SGetDownlines} from "../roleModule/PlayerStruct";
import { CardQuality, CfgMgr, StdRoleQuality } from "../../manager/CfgMgr";
import { ResMgr, folder_icon, folder_item } from "../../manager/ResMgr";
import { AutoScroller } from "../../utils/AutoScroller";
import { FanyuUpSelectFriendPage } from "./FanyuUpSelectFriendPage";
import { FanyuUpItem } from "./FanyuUpItem";
import Logger from "../../utils/Logger";
import { MsgTypeSend } from "../../MsgType";
import { Session } from "../../net/Session";
import { EventMgr, Evt_GetRandomDownline } from "../../manager/EventMgr";
import { Tips } from "../login/Tips";
import { ToFixed } from "../../utils/Utils";
import { FanyuUpPageItem } from "./FanyuUpPageItem";

export class FanyuUpPage extends Panel {
    protected prefab: string = "prefabs/panel/fanyu/FanyuUpPage";
    static get ins(): FanyuUpPage { return this.$instance; }

    private layNode: Node;



    protected scroller: ScrollView;
    private sussLabel: Label;
    private friendUpLabel: Label;
    private label_2: Label;
    private item: Node;

    private carId: number;
    private quality: number;
    private cfg: StdRoleQuality;
    private maxFriendCoun: number;
    private suss_rate = 0;
    private callback: Function;
    private friendData = [];
    private upItemRate = { type: 0, count: 0, rate: 0 };
    private upExItemRate = { type: 1, count: 0, rate: 0 };
    private up_item_list = [];

    private selectFriendIds: string[] = [];
    private oldSelectFriendIds: string[] = [];
    protected onLoad(): void {
        this.CloseBy("mask");
        this.CloseBy("frame/closeBtn");
        this.find("frame/okBtn").on(Input.EventType.TOUCH_END, this.onOk, this);
        this.layNode = this.find("frame/layNode");

        this.label_2 = this.find("frame/friendNode/frinendLabelNode/label_2", Label);
        this.friendUpLabel = this.find("frame/friendNode/frinendLabelNode/friendUpLabel", Label);
        this.sussLabel = this.find("frame/Node/sussLabel", Label);
        this.scroller = this.find("frame/friendNode/ScrollView", ScrollView);
        this.item = this.find("frame/friendNode/ScrollView/view/content/FanyuUpItem");
    }

    protected onShow(): void {
    }

    async flush(...args: any[]) {
        this.carId = args[0];
        this.quality = args[1];
        this.callback = args[2];
        this.upItemRate.count = args[3][0] ? args[3][0] : 0;
        this.oldSelectFriendIds = args[4];
        this.friendData = args[5];
        this.upExItemRate.count = args[6][0] ? args[6][0] : 0;
        this.cfg = CfgMgr.GetRoleQuality(this.carId, this.quality)
        this.up_item_list = [this.cfg.UpItemID[0], this.cfg.ExItemID[0]];
        let up_item_rate_list = [this.cfg.UpItemRate_display[0], this.cfg.ExItemRate[0]];
        let up_item_num_max_list = [this.cfg.UpItemNumMax[0], this.cfg.ExItemMAx[0]];
        let up_item_rate_max_list = [this.cfg.UpItemRateMax_display, this.cfg.ExRateMax];
        let item_use_count_list = [this.upItemRate.count, this.upExItemRate.count]
        for (let index = 0; index < this.layNode.children.length; index++) {
            const element = this.layNode.children[index];
            let up_item = element.getComponent(FanyuUpPageItem)
            up_item = up_item ? up_item : element.addComponent(FanyuUpPageItem);
            up_item.setData(this.setSussRate.bind(this), item_use_count_list[index], this.up_item_list[index], up_item_rate_list[index], up_item_num_max_list[index], up_item_rate_max_list[index], index)
        }

        this.maxFriendCoun = this.cfg.FriendsNum;
        this.scroller.content.removeAllChildren();
        for (let index = 0; index < this.maxFriendCoun; index++) {
            let node = instantiate(this.item);
            node.off(Input.EventType.TOUCH_END, this.onSelect, this)
            node.on(Input.EventType.TOUCH_END, this.onSelect, this)
            this.updateItem(node);
            this.scroller.content.addChild(node);
        }
        this.getPlayeId(this.friendData, true)
        this.updateCount();
    }

    private setSussRate(type: number, itemcount: number, suss_rate: number) {
        // console.log(type, itemcount, suss_rate);
        let data = { type: type, count: itemcount, rate: suss_rate }
        if (type == 1) {
            ;
            this.upExItemRate = data
        } else {
            this.upItemRate = data
        }

        this.updateCount();
    }


    private updateCount() {
        this.label_2.string = this.cfg.FriendsRateMax * 100 + "%";

        let item_rate = this.upItemRate.rate + this.upExItemRate.rate;
        let friend_rate = this.cfg.FriendsRate * 100 * this.friendData.length;
        this.friendUpLabel.string = ToFixed(friend_rate, 2) + "%"
        let max_suss_rate = this.cfg.BaseRate * 100 + item_rate + friend_rate
        this.suss_rate = max_suss_rate > 100 ? 100 : max_suss_rate;
        this.sussLabel.string = ToFixed(this.suss_rate, 2) + "%"
    }

    private async updateItem(item: Node) {
        let data = null;
        let itemNode = item.getComponent(FanyuUpItem);
        if (!itemNode) itemNode = item.addComponent(FanyuUpItem);
        itemNode.setData(data);
    }

    private onSelect(event: EventTouch) {
        let chidlren = this.scroller.content.children;
        let num = event.currentTarget.getSiblingIndex();
        let child = chidlren[num]
        let itemNode = child.getChildByPath("bg/icon").getComponent(Sprite).node;
        if (itemNode.active) {
            itemNode.active = false;

            let num_lbl = child.getChildByPath("lbl_bg/num").getComponent(Label);
            num_lbl.string = "0%";
            let label = child.getChildByName("playerName").getComponent(Label);
            let select = 0;
            for (const key in this.friendData) {
                if (Object.prototype.hasOwnProperty.call(this.friendData, key)) {
                    const element = this.friendData[key];
                    if (element.info.name == label.string) {
                        select = parseInt(key);
                        break;
                    }
                }
            }
            label.string = "";
            this.friendData.splice(select, 1);
            this.updateCount()
            return;
        } else {
            EventMgr.on(Evt_GetRandomDownline, this.updateFriendData, this);
            let data = {
                type: MsgTypeSend.GetDownlinesRequest,
                data: { page: 1, page_size: 10, sort_type: SFriendSortType.SortDailyActivityDesc, filter_type: 0, SearchPlayerID: "", include_role: false }
            }
            Session.Send(data);
        }
    }

    private updateFriendData(data: SGetDownlines) {
        EventMgr.off(Evt_GetRandomDownline, this.updateFriendData, this);
        if (data.downlines.length > 0) {
            FanyuUpSelectFriendPage.Show(this.maxFriendCoun, this.cfg.FriendsRate, this.cfg.ActivityValue, this.getPlayeId.bind(this))
        } else {
            Tips.Show("暂无符合要求好友")
        }
    }

    private getPlayeId(data: { info: SDownlineInfo, select: boolean, sussNum: number }[], is_frist?: boolean) {
        if (data.length == 0) {
            return;
        }

        let chidlren = this.scroller.content.children;
        this.selectFriendIds = [];
        if (is_frist && this.oldSelectFriendIds && this.friendData) {
            for (let i = 0; i < this.oldSelectFriendIds.length; i++) {
                let is_has = false;
                const id = this.oldSelectFriendIds[i];
                for (let index = 0; index < this.friendData.length; index++) {
                    const element = this.friendData[index];
                    if (element.info.player_id == id) {
                        let itemNode = chidlren[i].getComponent(FanyuUpItem);
                        if (itemNode) {
                            this.selectFriendIds.push(element.info.player_id)
                            itemNode.setData(element);
                            break;
                        }
                    }
                }
            }
        } else {
            let num = 0;
            this.friendData = data;
            for (let child of chidlren) {
                let itemNode = child.getComponent(FanyuUpItem);
                if (itemNode) {
                    itemNode.setData(data[num]);
                    if (data[num]) {
                        this.selectFriendIds.push(data[num].info.player_id)
                    }
                    num++;
                }
            }
        }

        this.updateCount();
    }

    protected onOk() {
        let callback = this.callback;
        this.callback = undefined;
        callback?.([this.up_item_list[0]], [this.upItemRate.count], this.selectFriendIds, this.suss_rate, this.friendData, [this.up_item_list[1]], [this.upExItemRate.count]);
        this.Hide();
    }


    resetData() {
        this.upItemRate.count = 0;
        this.upExItemRate.count = 0;
        this.friendData = [];
        this.suss_rate = 0;
        this.scroller.getComponent(ScrollView).content.removeAllChildren();
    }

    protected onHide(...args: any[]): void {
        // this.resetData();
        // this.itemcount = 0;
        // this.friendCount = 0;
        // this.suss_rate = 0;
        // this.scroller.getComponent(ScrollView).content.removeAllChildren();
    }

}