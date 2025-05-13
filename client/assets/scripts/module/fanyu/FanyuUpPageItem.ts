import { Input, Label, Node, Sprite, SpriteFrame, UITransform, Slider, path, ScrollView, instantiate, EventTouch, Component } from "cc";
import PlayerData, {} from "../roleModule/PlayerData"
 import {SDownlineInfo,SFriendSortType,SGetDownlines} from "../roleModule/PlayerStruct";
import { CardQuality, CfgMgr, StdItem, StdRoleQuality } from "../../manager/CfgMgr";
import { ResMgr, folder_icon, folder_item } from "../../manager/ResMgr";
import { ToFixed } from "../../utils/Utils";

export class FanyuUpPageItem extends Component {

    private itemUpLabel: Label;
    private itemAddNum: Label;
    private itemNameLabel: Label;
    private consumeNum: Label;
    private hasNum: Label;
    private label_1: Label;
    private Slider: Slider;
    private progress: Node;
    private icon: Sprite;
    private iocnBg: Sprite;
    private itemCountLabel:Label

    private itemcount = 0;
    private itemNum = 0;
    private maxItemcount: number;
    private suss_rate = 0;
    private callback: Function;
    private UpItemNumMax: number;
    private UpItemRate: number;
    private UpItemID: number;
    private UpItemRateMax: number;

    private type: number;
    protected onLoad(): void {
        this.itemCountLabel = this.node.getChildByPath("itemCountNode/itemCountLabel").getComponent(Label);
        this.itemUpLabel = this.node.getChildByPath("itemLabelNode/itemUpLabel").getComponent(Label);
        this.label_1 = this.node.getChildByPath("itemLabelNode/label_1").getComponent(Label);
        this.itemAddNum = this.node.getChildByPath("itemAddNum").getComponent(Label);
        this.itemNameLabel = this.node.getChildByPath("itemNameLabel").getComponent(Label);
        this.consumeNum = this.node.getChildByPath("page1/consumeNum").getComponent(Label);
        this.hasNum = this.node.getChildByPath("page1/hasNum").getComponent(Label);
        this.icon = this.node.getChildByPath("iocnBg/icon").getComponent(Sprite);
        this.iocnBg = this.node.getChildByPath("iocnBg").getComponent(Sprite);
        this.Slider = this.node.getChildByPath("page1/Slider").getComponent(Slider);
        this.progress = this.node.getChildByPath("page1/Slider/progress");
        this.node.getChildByPath("page1/right").on(Input.EventType.TOUCH_END, this.onAdd, this);
        this.node.getChildByPath("page1/left").on(Input.EventType.TOUCH_END, this.onDel, this);
        this.Slider.node.on('slide', this.onSlide, this);
    }

    setData(callback: Function, itemcount: number, up_item_id: number, up_item_rate: number, up_item_num_max: number, up_item_rate_max: number, type: number) {
        this.callback = callback;
        this.itemcount = itemcount ? itemcount : 0;
        this.UpItemID = up_item_id;
        this.UpItemRate = up_item_rate;
        this.UpItemNumMax = up_item_num_max;
        this.UpItemRateMax = up_item_rate_max;
        this.type = type;
        let itemData = CfgMgr.Getitem(this.UpItemID);
        this.itemNameLabel.string = itemData.ItemName;
        this.setIcon(itemData);
        this.itemAddNum.string = this.UpItemRate * 100 + "%";
        let item_num = PlayerData.GetItemCount(this.UpItemID)
        this.itemCountLabel.string = item_num + ""
        this.itemNum = item_num > this.UpItemNumMax ? this.UpItemNumMax : item_num;
        this.hasNum.string = "/" + this.itemNum;
        this.maxItemcount = this.UpItemNumMax > this.itemNum ? this.itemNum : this.UpItemNumMax;
        this.updateCount();
        if (this.itemNum == 0) {
            this.Slider.progress = 0;
            this.Slider.enabled = false;
            return;
        } else {
            this.Slider.enabled = true;
        }
        this.updateProgress();
    }

    private async setIcon(itemData: StdItem) {
        let icon_url = path.join(folder_item, itemData.Icon, "spriteFrame");
        this.icon.spriteFrame = await ResMgr.LoadResAbSub(icon_url, SpriteFrame);
        let icon_bg_url = path.join(folder_icon, "quality", CardQuality[itemData.Quality] + "_bag_bg", "spriteFrame");
        this.iocnBg.spriteFrame = await ResMgr.LoadResAbSub(icon_bg_url, SpriteFrame);
    }

    private updateCount() {
        this.label_1.string = this.UpItemRateMax * 100 + "%";
        let item_rate = this.UpItemRate * 100 * this.itemcount;
        this.itemUpLabel.string = ToFixed(item_rate, 2) + "%";

        this.consumeNum.string = this.itemcount + "";
        this.suss_rate = item_rate > 100 ? 100 : item_rate;
        let callback = this.callback;
        callback?.(this.type, this.itemcount, this.suss_rate);
    }

    private updateProgress() {
        this.Slider.progress = this.itemcount / this.maxItemcount;
    }

    protected update(dt: number): void {
        let size = this.Slider.node.getComponent(UITransform).contentSize;
        this.progress.getComponent(UITransform).setContentSize(this.Slider.progress * size.width, 28);
    }

    private onAdd(e?: any) {
        if (this.itemNum <= 0) return;
        this.itemcount++;
        let max = this.UpItemRate * this.itemcount;
        //超出最大概率或者超出最大数量
        if (max > this.UpItemRateMax || this.itemcount > this.UpItemNumMax) {
            this.itemcount = this.UpItemNumMax
        }

        //超出拥有数量
        if (this.itemcount > this.itemNum) {
            this.itemcount = this.itemNum
        }
        this.updateCount();
        this.updateProgress();
    }

    private onDel(e?: any) {
        if (this.itemcount <= 0) return;
        this.itemcount--;
        if (this.itemcount < 0) {
            this.itemcount = 0;
        }
        this.updateCount();
        this.updateProgress();
    }

    private onSlide(e?: Slider) {
        this.itemcount = Math.ceil(this.maxItemcount * this.Slider.progress);
        this.updateCount();
        this.updateProgress();
    }
}