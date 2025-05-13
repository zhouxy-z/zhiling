import { Button, Component, path, Sprite, SpriteFrame, Node, Label, Vec3, game } from "cc";
import { ConsumeItem } from "../common/ConsumeItem";
import { CfgMgr, ItemType, StdAdvister, StdEquityId, StdLuckyShop, StdShop, StdShopCommodity, StdShopLucky } from "../../manager/CfgMgr";
import PlayerData, { } from "../roleModule/PlayerData"
import { SAdvister, SLuckyContent, SShopContent, SShopItem, SThing } from "../roleModule/PlayerStruct";
import { ResMgr } from "../../manager/ResMgr";
import { AwardItem } from "../common/AwardItem";
import { ItemUtil } from "../../utils/ItemUtils";
import { DateUtils } from "../../utils/DateUtils";

export class ShopCommItem extends Component {
    private bg: Sprite;
    private adBg: Sprite;
    private disCont: Node;
    private disNumLab: Label;
    private awardItem: AwardItem;
    private limitCont: Node;
    private limtNumLab: Label;
    private timeCont: Node;
    private limtTimeTitle: Label;
    private limtTimeLab: Label;
    private mask: Node;
    private openTimeLab: Label;
    private adCont: Node;
    private jumpAd: Node;
    private adNumLab: Label;
    private consumeItem: ConsumeItem;
    private noBuy: Node;
    private sellOut: Node;
    private overTime: Node;
    private isInit: boolean = false;
    private std: StdShopCommodity;
    private data: SShopItem;
    private shopId: number;
    protected onLoad(): void {
        this.bg = this.node.getChildByName("bg").getComponent(Sprite);
        this.adBg = this.node.getChildByName("adBg").getComponent(Sprite);
        this.disCont = this.node.getChildByName("disCont");
        this.disNumLab = this.node.getChildByPath("disCont/disNumLab").getComponent(Label);
        this.awardItem = this.node.getChildByName("AwardItem").addComponent(AwardItem);
        this.limitCont = this.node.getChildByName("limitCont");
        this.limtNumLab = this.node.getChildByPath("limitCont/limtNumLab").getComponent(Label);
        this.timeCont = this.node.getChildByPath("limitCont/timeCont");
        this.limtTimeTitle = this.node.getChildByPath("limitCont/timeCont/limtTimeTitle").getComponent(Label);
        this.limtTimeLab = this.node.getChildByPath("limitCont/timeCont/limtTimeLab").getComponent(Label);
        this.mask = this.node.getChildByPath("mask");
        this.openTimeLab = this.node.getChildByPath("limtTimeTitle").getComponent(Label);
        this.consumeItem = this.node.getChildByName("consumeItem").addComponent(ConsumeItem);
        this.adCont = this.node.getChildByName("adCont");
        this.jumpAd = this.node.getChildByPath("adCont/icon/jumpAd");
        this.adNumLab = this.node.getChildByPath("adCont/adNumLab").getComponent(Label);
        this.noBuy = this.node.getChildByName("noBuy");
        this.sellOut = this.node.getChildByPath("noBuy/sellOut");
        this.overTime = this.node.getChildByPath("noBuy/overTime");
        this.isInit = true;
        this.updateShow();
    }
    protected update(dt: number): void {
        if (this.data && this.std.LimitBuyTime > 0) {
            let residueTime: number = Math.max(Math.floor(this.data.expiration_time - PlayerData.GetServerTime()), 0);
            this.limtTimeLab.string = DateUtils.FormatTime(residueTime, "%{hh}:%{mm}:%{ss}");
            if (residueTime > 86400) {
                this.limtTimeLab.string = DateUtils.FormatTime(residueTime, "%{d}天%{hh}:%{mm}:%{ss}");
            } else {
                if (residueTime > 0) {
                    this.limtTimeLab.string = DateUtils.FormatTime(residueTime, "%{hh}:%{mm}:%{ss}");
                } else {
                    this.limtTimeLab.string = "活动结束";
                    //this.SetData(this.data);
                }
            }
        }
        this.updateShopState();
        this.updateAdTime();
    }
    private updateAdTime(): void {
        if (!this.data) return;
        //是否才有广告的商品
        if (this.data.isAdItem) {
            let std: StdShop = CfgMgr.GetShop(this.shopId);
            if (std.AdId > 0) {
                this.adBg.node.active = true;
                let adData: SAdvister = PlayerData.GetAdvisterData(std.AdId);
                let stdAd: StdAdvister = CfgMgr.GetAdvister(std.AdId);
                let cd: number = adData.cdEndTime - game.totalTime;
                if (cd > 0) {
                    this.adNumLab.string = DateUtils.FormatTime(cd / 1000, "%{mm}:%{ss}");
                } else {
                    this.adNumLab.string = `广告（${adData.count}/${stdAd.Max_numb}）`;
                }
                this.consumeItem.node.active = false;
                this.adCont.active = true;

            } else {
                this.adBg.node.active = false;
                this.consumeItem.node.active = true;
                this.adCont.active = false;
            }
        } else {
            this.adBg.node.active = false;
            this.consumeItem.node.active = true;
            this.adCont.active = false;
        }

    }
    SetData(data: SShopItem, shopId: number) {
        this.data = data;
        this.shopId = shopId;
        this.updateShow();
        this.updateShopState();
    }
    private updateShopState(): void {
        if (!this.data || !this.std) return;
        this.noBuy.active = false;
        if (this.std.GoodAmount > 0) {
            if (this.data.count < 1) {
                this.noBuy.active = true;
                this.sellOut.active = true;
                this.overTime.active = false;
            }
        }
        if (this.std.LimitBuyTime > 0 && !this.noBuy.active) {
            if (this.data.expiration_time - PlayerData.GetServerTime() <= 0) {
                this.noBuy.active = true;
                this.sellOut.active = false;
                this.overTime.active = true;
            }
        }

        this.openTimeLab.node.active = true;
        if (this.data.start_buy_time && this.data.start_buy_time > PlayerData.GetServerTime()) {
            this.mask.active = true;
            if (this.data.start_buy_time - PlayerData.GetServerTime() > 86400) {
                this.openTimeLab.string = "待开放";
            } else {
                let str = this.formatTime(this.data.start_buy_time - PlayerData.GetServerTime());
                this.openTimeLab.string = "开启倒计时：" + str;
            }
        } else if (this.data.end_buy_time) {
            if (this.data.end_buy_time > PlayerData.GetServerTime()) {
                this.mask.active = false;
                let str = this.formatTime(this.data.end_buy_time - PlayerData.GetServerTime());
                this.openTimeLab.string = "下架倒计时：" + str;
            } else {
                this.mask.active = true;
                this.openTimeLab.string = "已过期";
            }
        } else {
            this.mask.active = false;
            this.openTimeLab.string = "";
        }
        // this.data.start_buy_time;//开始购买时间
        // this.data.end_buy_time;//结束购买时间
    }

    private formatTime(time: number) {
        let residueTime: number = Math.max(Math.floor(time), 0);
        if (residueTime > 86400) {
            return DateUtils.FormatTime(residueTime, "%{d}天%{hh}:%{mm}:%{ss}");
        } else {
            if (residueTime > 0) {
                return DateUtils.FormatTime(residueTime, "%{hh}:%{mm}:%{ss}");
            } else {
                return undefined;
            }
        }
        // return DateUtils.FormatTime(residueTime, "%{hh}:%{mm}:%{ss}");
    }

    private updateShow(): void {
        if (!this.isInit || !this.data) return;
        this.std = CfgMgr.GetCommShopItem(this.data.id);
        if (this.std.Discount > 0) {
            this.disCont.active = true;
            this.disNumLab.string = this.std.Discount.toString();
        } else {
            this.disCont.active = false;
        }

        if (this.std.GoodAmount > 0) {
            this.limtNumLab.node.active = true;
            if (this.data.whole_amount_max) {
                let num = this.data.whole_amount ? this.data.whole_amount : 0
                this.limtNumLab.string = `个人:${this.data.count}/${this.std.GoodAmount} 全局:(${num}/${this.data.whole_amount_max})`;
            } else {
                this.limtNumLab.string = `数量：${this.data.count}/${this.std.GoodAmount}`;
            }
        } else {
            this.limtNumLab.node.active = false;
        }
        this.timeCont.active = this.std.LimitBuyTime > 0;

        let thing: SThing;
        thing = ItemUtil.CreateThing(this.std.Goodstype[0], this.std.GoodsID[0], this.std.GoodsNum[0]);
        let url = path.join("sheets/shop", `qualBg_${thing.resData.qual}`, "spriteFrame");
        ResMgr.LoadResAbSub(url, SpriteFrame, res => {
            this.bg.spriteFrame = res;
        });
        this.awardItem.SetData({ itemData: thing });
        let awNumLab = this.awardItem.node.getChildByName("numLab").getComponent(Label);
        let otherNumLab = this.awardItem.node.getChildByName("otherNumLab").getComponent(Label);
        let awNameLab = this.awardItem.node.getChildByName("nameLab");
        awNumLab.node.active = true;
        otherNumLab.node.active = false;
        otherNumLab.string = this.std.GoodsNum[0].toString();
        let awPosY: number = 62;
        let awNamePosY: number = -142;
        if (thing.item) {
            let stdItem = CfgMgr.Getitem(thing.item.id);
            if (stdItem) {
                if (stdItem.Itemtpye == ItemType.shard) {
                    awPosY = 50;
                    awNamePosY = -130;
                    awNumLab.node.active = false;
                    otherNumLab.node.active = true;
                } else {
                    awNumLab.string = "x" + this.std.GoodsNum[0];
                }
            }
        }
        awNameLab.position = new Vec3(0, awNamePosY, 0);
        this.awardItem.node.position = new Vec3(this.awardItem.node.position.x, awPosY, 0);
        thing = ItemUtil.CreateThing(this.std.CostType[0], this.std.CostID[0], this.std.CostNumber[0]);
        this.consumeItem.SetData(thing);
        this.jumpAd.active = PlayerData.GetIsActivateRights(StdEquityId.Id_9) || PlayerData.GetIsActivateRights(StdEquityId.Id_10);
    }
}