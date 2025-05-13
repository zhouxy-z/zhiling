import { Button, Color, Component, EventTouch, Input, Label, Node, Slider, Sprite, SpriteFrame, Toggle, UITransform, find, instantiate, path, sp, tween, view } from "cc";
import { Panel } from "../../GameRoot";
import PlayerData from "../roleModule/PlayerData"
import { SPlayerData, SPlayerDataItem, SPlayerDataRole, SOrderData, SOrderType, SOrderThing, SCrossOrderData, SThing } from "../roleModule/PlayerStruct";
import { Attr, AttrFight, CardQuality, CfgMgr, ItemType, ResourceType, StdCommonType, StdCrossBours, StdItem, StdMerge, StdRole, StdRoleQuality, ThingItemId, ThingType } from "../../manager/CfgMgr";
import { ResMgr, folder_icon, folder_item } from "../../manager/ResMgr";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import { Tips } from "../login/Tips";
import { BagPanel } from "../bag/BagPanel";
import { SetNodeGray } from "../common/BaseUI";
import { ItemUtil } from "../../utils/ItemUtils";
import { ToFixed } from "../../utils/Utils";
import { CheckRisk, isFengkong } from "../../Platform";
import { IOS } from "cc/env";
import { RiskPanel } from "../login/RiskPanel";


export class BuyPanel extends Panel {
    protected prefab: string = "prefabs/panel/Trade/BuyPanel";

    private tittle: Label;
    private qualBg: Sprite;
    private icon: Sprite;
    private item_name: Label;
    private item_count: Label;
    private Price: Label;
    private money_icon: Sprite;
    private need_count: Label;
    private maxBtn: Button;
    private buyBtn: Button;
    private buyVaule: Label;
    private buyicon: Sprite;
    private sellNode: Node;
    private sellBtn: Button;
    private sellVaule: Label;
    private get_money_icon: Sprite;
    private costVaule: Label;
    private Slider: Slider;
    private progress: Node;
    private numLab: Label;
    private max_count: Label;
    private right: Node;
    private left: Node;
    private item_tips: Label;

    private type: number;//买or卖
    private selectData: SOrderData | SCrossOrderData;
    private selectCount: number;//当前选择的数量
    private costNum: number;//损耗
    private item_type: number;//商品的类型
    private itemSelectData: SPlayerDataItem;//选择的商品是道具
    private maxItemNum: number;//能够买卖的最大组数   
    private touchIndex = 0;
    private touchTime = 0;
    private addNum = 0;
    private single = 0;

    private is_world_trade: boolean = false; //是否是世界交易所 false不是 ture是

    protected onLoad() {
        this.CloseBy("mask");
        this.CloseBy("spriteFrame/Close");
        this.tittle = this.find("spriteFrame/top/name", Label);
        this.item_tips = this.find("spriteFrame/main/item_tips", Label);
        this.qualBg = this.find("spriteFrame/main/AwardItem/qualBg", Sprite);
        this.icon = this.find("spriteFrame/main/AwardItem/icon", Sprite);
        this.item_name = this.find("spriteFrame/main/item_name", Label);
        this.item_count = this.find("spriteFrame/main/item_count", Label);
        this.Price = this.find("spriteFrame/main/PriceLayout/Price", Label);
        this.money_icon = this.find("spriteFrame/main/PriceLayout/money_icon", Sprite);
        this.need_count = this.find("spriteFrame/mid/need_count", Label);
        this.max_count = this.find("spriteFrame/mid/max_count", Label);
        this.maxBtn = this.find("spriteFrame/mid/page1/maxBtn", Button);
        this.buyBtn = this.find("spriteFrame/mid/buyBtn", Button);
        this.buyVaule = this.find("spriteFrame/mid/buyBtn/layout/buyVaule", Label);
        this.buyicon = this.find("spriteFrame/mid/buyBtn/layout/icon", Sprite);
        this.sellNode = this.find("spriteFrame/mid/sellNode");
        this.sellBtn = this.find("spriteFrame/mid/sellNode/sellBtn", Button);
        this.sellVaule = this.find("spriteFrame/mid/sellNode/layout/sellVaule", Label);
        this.get_money_icon = this.find("spriteFrame/mid/sellNode/layout/get_money_icon", Sprite);
        this.costVaule = this.find("spriteFrame/mid/sellNode/layout/costVaule", Label);
        this.Slider = this.find("spriteFrame/mid/page1/Slider", Slider);
        this.progress = this.find("spriteFrame/mid/page1/Slider/progress");
        this.right = this.find("spriteFrame/mid/page1/right")
        this.left = this.find("spriteFrame/mid/page1/left")
        this.numLab = this.find("spriteFrame/main/numLab", Label);
        this.buyBtn.node.on("click", this.onSend, this);
        this.sellBtn.node.on("click", this.onSend, this);

    }

    protected onShow(): void {
    }

    async flush(type: number, _data: SOrderData | SCrossOrderData, is_world_trade) {
        if (!_data) return;
        this.type = type;
        this.is_world_trade = is_world_trade
        let keepPre = 2;
        if (!is_world_trade) {
            let data = _data as SOrderData
            this.selectData = data;

            this.costNum = CfgMgr.GetCommon(StdCommonType.Bourse).Fees;
            let item_cfg: StdItem;
            let str: string;
            this.addNum = 1;
            this.single = CfgMgr.GetTradeData(data.things.data[0], this.type).Single;
            if (data.things.data[0].item) {
                this.itemSelectData = data.things.data[0].item;
                item_cfg = CfgMgr.Getitem(data.things.data[0].item.id);
                this.item_type = ThingType.ThingTypeItem;
                if (item_cfg) {
                    this.qualBg.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_icon, "quality", CardQuality[item_cfg.Quality] + "_bag_bg", "spriteFrame"), SpriteFrame);
                    this.icon.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_item, item_cfg.Icon, "spriteFrame"), SpriteFrame);
                    str = item_cfg.ItemName;
                }
            } else if (data.things.data[0].resource) {
                this.item_type = ThingType.ThingTypeResource;
                let item = data.things.data[0].resource
                let id: number;
                let count: number;
                let item_id: number;
                if (item.wood > 0) {
                    id = ResourceType.wood;
                    item_id = ThingItemId.ItemId_6;
                } else if (item.water > 0) {
                    id = ResourceType.water;
                    item_id = ThingItemId.ItemId_8;
                } else if (item.rock > 0) {
                    id = ResourceType.rock;
                    item_id = ThingItemId.ItemId_7;
                } else if (item.seed > 0) {
                    id = ResourceType.seed;
                    item_id = ThingItemId.ItemId_9;
                }
                count = data.unit_count;
                this.itemSelectData = { id: id, count: count }
                item_cfg = CfgMgr.Getitem(item_id);
                if (item_cfg) {
                    this.qualBg.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_icon, "quality", CardQuality[item_cfg.Quality] + "_bag_bg", "spriteFrame"), SpriteFrame);
                    this.icon.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_item, item_cfg.Icon, "spriteFrame"), SpriteFrame);
                    str = item_cfg.ItemName;
                }
            } else {
                this.item_type = ThingType.ThingTypeEquipment;
                //装备
            }
            if (type == SOrderType.SELL) {
                //数量不够置灰
                let hasNum: number
                if (data.things.data[0].resource) {
                    if (this.itemSelectData.id == ResourceType.wood) {
                        hasNum = PlayerData.roleInfo.resources.wood
                    } else if (this.itemSelectData.id == ResourceType.water) {
                        hasNum = PlayerData.roleInfo.resources.water
                    } else if (this.itemSelectData.id == ResourceType.rock) {
                        hasNum = PlayerData.roleInfo.resources.rock
                    } else if (this.itemSelectData.id == ResourceType.seed) {
                        hasNum = PlayerData.roleInfo.resources.seed
                    }
                } else {
                    hasNum = PlayerData.GetItemCount(this.itemSelectData.id);
                }

                if (hasNum == 0) {
                    this.sellBtn.enabled = false
                    this.sellBtn.node.getComponent(Sprite).grayscale = true;

                } else {
                    this.sellBtn.enabled = true
                    this.sellBtn.node.getComponent(Sprite).grayscale = false;
                }
                let max_has = Math.floor(hasNum / this.single);
                this.maxItemNum = max_has > this.selectData.unit_count ? this.selectData.unit_count : max_has;
            } else {
                this.maxItemNum = this.selectData.unit_count;
            }
            this.item_tips.string = item_cfg.Remark;
            this.selectCount = this.addNum;
            let tittle_name = ["提供物品", "兑换物品"]
            this.tittle.string = tittle_name[type];
            this.item_name.string = str;
            this.item_count.string = this.single + "个";
            this.max_count.string = "/" + data.unit_count;
            this.Price.string = ToFixed(data.unit_value, keepPre);
            this.need_count.string = "0";
            this.costVaule.string = "(扣除" + this.costNum * 100 + "%损耗)";
            this.sellNode.active = (type == SOrderType.SELL)
            this.buyBtn.node.active = !(type == SOrderType.SELL)
            if (this.selectCount > this.maxItemNum || this.maxItemNum <= 0) {
                this.selectCount = 0;
                this.maxItemNum = 1;
                this.Slider.enabled = false;
                this.Slider.node.off('slide');
                this.right.off(Input.EventType.TOUCH_END);
                this.left.off(Input.EventType.TOUCH_END);
                this.right.off(Input.EventType.TOUCH_CANCEL);
                this.left.off(Input.EventType.TOUCH_CANCEL);
                this.right.off(Input.EventType.TOUCH_START);
                this.left.off(Input.EventType.TOUCH_START);
                this.maxBtn.node.off("click");
                this.Slider.progress = 0;
                SetNodeGray(this.sellBtn.node, true);
            } else {
                this.Slider.enabled = true;
                this.Slider.node.on('slide', this.onSlide, this);
                this.right.on(Input.EventType.TOUCH_END, this.onAdd, this);
                this.left.on(Input.EventType.TOUCH_END, this.onDel, this);
                this.right.on(Input.EventType.TOUCH_CANCEL, this.onAdd, this);
                this.left.on(Input.EventType.TOUCH_CANCEL, this.onDel, this);
                this.right.on(Input.EventType.TOUCH_START, () => { this.onTouchStart(1) }, this);
                this.left.on(Input.EventType.TOUCH_START, () => { this.onTouchStart(2) }, this);
                this.maxBtn.node.on("click", this.onMaxBtn, this);
                SetNodeGray(this.sellBtn.node, false);
            }
            this.updateProgress();
        } else {
            let data = _data as SCrossOrderData;
            this.selectData = data;
            let cfg_bours: StdCrossBours = CfgMgr.GetCrossBoursCurrencyByServer(data.bourse_id);
            this.costNum = cfg_bours.Fees;
            let item_cfg: StdItem;
            let str: string;
            this.addNum = 1;
            this.single = cfg_bours.Single;

            if (cfg_bours.PayItemID == ThingItemId.ItemId_202) {
                keepPre = CfgMgr.GetCommon(StdCommonType.Gem).KeepPre;
            }

            if (data.items) {
                item_cfg = CfgMgr.Getitem(cfg_bours.SellItemID);
                this.item_type = ThingType.ThingTypeItem;
                if (item_cfg) {
                    this.qualBg.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_icon, "quality", CardQuality[item_cfg.Quality] + "_bag_bg", "spriteFrame"), SpriteFrame);
                    let spr = item_cfg.Icon == "caizuan" ? "caizuan_hc" : item_cfg.Icon;
                    this.icon.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_item, spr, "spriteFrame"), SpriteFrame);
                    str = item_cfg.ItemName;
                }
            }
            let pay_item_cfg = CfgMgr.Getitem(cfg_bours.PayItemID);
            if (pay_item_cfg) {
                let spr = pay_item_cfg.Icon == "caizuan" ? "caizuan_hc" : pay_item_cfg.Icon;
                let spr_icon = await ResMgr.LoadResAbSub(path.join(folder_item, spr, "spriteFrame"), SpriteFrame);
                this.money_icon.spriteFrame = spr_icon;
                this.buyicon.spriteFrame = spr_icon;
            }
            this.maxItemNum = this.selectData.group_count;
            this.item_tips.string = item_cfg.Remark;
            this.selectCount = this.addNum;
            let tittle_name = ["提供物品", "购买物品"]
            this.tittle.string = tittle_name[type];
            this.item_name.string = str;
            this.item_count.string = this.single + "个";
            this.max_count.string = "/" + data.group_count;
            this.Price.string = ToFixed(data.group_value, keepPre);
            this.need_count.string = "0";
            this.costVaule.string = "(扣除" + this.costNum * 100 + "%损耗)";
            this.sellNode.active = (type == SOrderType.SELL)
            this.buyBtn.node.active = !(type == SOrderType.SELL)
            if (this.selectCount > this.maxItemNum || this.maxItemNum <= 0) {
                this.selectCount = 0;
                this.maxItemNum = 1;
                this.Slider.enabled = false;
                this.Slider.node.off('slide');
                this.right.off(Input.EventType.TOUCH_END);
                this.left.off(Input.EventType.TOUCH_END);
                this.right.off(Input.EventType.TOUCH_CANCEL);
                this.left.off(Input.EventType.TOUCH_CANCEL);
                this.right.off(Input.EventType.TOUCH_START);
                this.left.off(Input.EventType.TOUCH_START);
                this.maxBtn.node.off("click");
                this.Slider.progress = 0;
                SetNodeGray(this.sellBtn.node, true);
            } else {
                this.Slider.enabled = true;
                this.Slider.node.on('slide', this.onSlide, this);
                this.right.on(Input.EventType.TOUCH_END, this.onAdd, this);
                this.left.on(Input.EventType.TOUCH_END, this.onDel, this);
                this.right.on(Input.EventType.TOUCH_CANCEL, this.onAdd, this);
                this.left.on(Input.EventType.TOUCH_CANCEL, this.onDel, this);
                this.right.on(Input.EventType.TOUCH_START, () => { this.onTouchStart(1) }, this);
                this.left.on(Input.EventType.TOUCH_START, () => { this.onTouchStart(2) }, this);
                this.maxBtn.node.on("click", this.onMaxBtn, this);
                SetNodeGray(this.sellBtn.node, false);
            }
            if (cfg_bours.PaymentType == ThingType.ThingTypeGem) {
                this.selectCount = this.maxItemNum;
                this.Slider.enabled = false;
                this.Slider.node.off('slide');
                this.right.off(Input.EventType.TOUCH_END);
                this.left.off(Input.EventType.TOUCH_END);
                this.right.off(Input.EventType.TOUCH_CANCEL);
                this.left.off(Input.EventType.TOUCH_CANCEL);
                this.right.off(Input.EventType.TOUCH_START);
                this.left.off(Input.EventType.TOUCH_START);
                this.maxBtn.node.off("click");
            }
            this.updateProgress();
        }
    }
    private onTouchStart(index: number) {
        this.touchIndex = index;
    }

    private onAdd(e?: any) {
        this.selectCount += this.addNum;
        //超出拥有数量
        if (this.selectCount > this.maxItemNum) {
            this.selectCount = this.maxItemNum;
        }
        this.updateProgress();
        if (e) {
            this.touchIndex = 0;
            this.touchTime = 0;
        }
    }

    private onDel(e?: any) {
        if (this.selectCount <= this.addNum) return;
        this.selectCount -= this.addNum;
        if (this.selectCount < this.addNum) {
            this.selectCount = this.addNum;
        }
        this.updateProgress();
        if (e) {
            this.touchIndex = 0;
            this.touchTime = 0;
        }
    }

    private onSlide(e?: Slider) {
        this.selectCount = Math.ceil(this.maxItemNum * this.Slider.progress);
        if (this.selectCount % this.addNum != 0) {
            this.selectCount = Math.ceil(this.selectCount / this.addNum) * this.addNum;
        }
        if (this.selectCount > this.maxItemNum) {
            this.selectCount = this.maxItemNum;
        }
        if (this.selectCount < this.addNum) {
            this.selectCount = this.addNum;
        }
        this.updateProgress();
        if (e) {
            this.touchIndex = 0;
            this.touchTime = 0;
        }
    }

    private onMaxBtn() {
        this.selectCount = this.maxItemNum;
        this.updateProgress();
        this.touchIndex = 0;
        this.touchTime = 0;
    }

    private updateProgress() {
        let count = 0
        let keepPre = 2;

        if (!this.is_world_trade) {
            count = (this.selectData as SOrderData).unit_value
        } else {
            let _selectData = this.selectData as SCrossOrderData;
            count = _selectData.group_value
            let cross_bours_cfg = CfgMgr.GetCrossBoursCurrencyByServer(_selectData.bourse_id)
            if (cross_bours_cfg.PayItemID == ThingItemId.ItemId_202) {
                keepPre = CfgMgr.GetCommon(StdCommonType.Gem).KeepPre;
            }
        }

        let Max_num = Math.pow(10, keepPre);
        this.need_count.string = this.selectCount + "";
        let num = this.selectCount * count;
        this.buyVaule.string = Math.ceil(num * Max_num) / Max_num + "";
        let is_can_buy = (Math.ceil(num * Max_num) / Max_num) <= PlayerData.roleInfo.currency;
        this.buyVaule.color = is_can_buy ? new Color().fromHEX("#ffffff") : new Color().fromHEX("#ff3f3f");
        this.sellVaule.string = Math.ceil((num - num * this.costNum) * Max_num) / Max_num + "";
        this.Slider.progress = this.selectCount / this.maxItemNum;
        this.numLab.string = this.selectCount * this.single + "";
    }

    private onSend() {
        let value = 0
        let currency = PlayerData.roleInfo.currency;
        let is_gem: boolean = true
        if (this.is_world_trade) {
            let _selectData = this.selectData as SCrossOrderData
            value = _selectData.group_value
            let cfg = CfgMgr.GetCrossBoursCurrencyByServer(_selectData.bourse_id)
            if (cfg.PaymentType == ThingType.ThingTypeGem) {
                currency = PlayerData.roleInfo.currency_77;
                is_gem = false
            }
        } else {
            value = (this.selectData as SOrderData).unit_value
        }
        if (this.type == SOrderType.BUY && is_gem) {
            let need_currency = Math.ceil(this.selectCount * value * 100) / 100
            if (currency < need_currency) {
                Tips.Show("货币不足")
                return;
            }
        }


        if (this.is_world_trade) {
            if (isFengkong()) {
                RiskPanel.Show();
                CheckRisk((data: { authorization: string, rc_token: string }) => {
                    RiskPanel.Hide();
                    let is_ios = IOS ? 1 : 2;
                    let buyData = {
                        type: MsgTypeSend.CrossExchangesTrade,
                        data: {
                            order_id: this.selectData.order_id,
                            group_count: this.selectCount,
                            authorization: data.authorization,
                            rc_token: data.rc_token,
                            client_os: is_ios,
                        }
                    }
                    Session.Send(buyData)
                })
            } else {
                let is_ios = IOS ? 1 : 2;
                let buyData = {
                    type: MsgTypeSend.CrossExchangesTrade,
                    data: {
                        order_id: this.selectData.order_id,
                        group_count: this.selectCount,
                        authorization: "",
                        rc_token: "",
                        client_os: is_ios,
                    }
                }
                Session.Send(buyData);
            }
        } else {

            let getThing = () => {
                let value
                switch (this.item_type) {
                    case ThingType.ThingTypeItem:
                        value = {
                            type: this.item_type,
                            item: { id: this.itemSelectData.id, count: this.selectCount }
                        }
                        break;
                    case ThingType.ThingTypeEquipment:
                        break;
                    case ThingType.ThingTypeResource:
                        switch (this.itemSelectData.id - 1) {
                            case 0:
                                value = {
                                    type: this.item_type,
                                    resource: { wood: this.selectCount, water: 0, rock: 0, seed: 0 }
                                }
                                break;
                            case 1:
                                value = {
                                    type: this.item_type,
                                    resource: { wood: 0, water: 0, rock: this.selectCount, seed: 0 }
                                }
                                break;
                            case 2:
                                value = {
                                    type: this.item_type,
                                    resource: { wood: 0, water: this.selectCount, rock: 0, seed: 0 }
                                }
                                break;
                            case 3:
                                value = {
                                    type: this.item_type,
                                    resource: { wood: 0, water: 0, rock: 0, seed: this.selectCount }
                                }
                                break;
                        }
                        break;

                }
                return value
            }
            if (isFengkong()) {
                RiskPanel.Show();
                CheckRisk((data: { authorization: string, rc_token: string }) => {
                    RiskPanel.Hide();
                    let is_ios = IOS ? 1 : 2;
                    let buyData = {
                        type: MsgTypeSend.ExchangesTrade,
                        data: {
                            order_id: this.selectData.order_id,
                            payment_things: {
                                data: [getThing()]
                            },
                            unit_count: this.selectCount,
                            authorization: data.authorization,
                            rc_token: data.rc_token,
                            client_os: is_ios,
                        }
                    }
                    Session.Send(buyData)
                })
            } else {
                let is_ios = IOS ? 1 : 2;
                let buyData = {
                    type: MsgTypeSend.ExchangesTrade,
                    data: {
                        order_id: this.selectData.order_id,
                        payment_things: {
                            data: [getThing()]
                        },
                        unit_count: this.selectCount,
                        authorization: "",
                        rc_token: "",
                        client_os: is_ios,
                    }
                }
                Session.Send(buyData);
            }
        }

    }

    protected update(dt: number): void {
        let size = this.Slider.node.getComponent(UITransform).contentSize;
        this.progress.getComponent(UITransform).setContentSize(this.Slider.progress * size.width, 28);
        if (this.touchIndex != 0) {
            this.touchTime += dt;
            if (this.touchTime >= 0.5) {
                this.touchTime = 0.47;
                switch (this.touchIndex) {
                    case 1:
                        this.onAdd()
                        break;
                    case 2:
                        this.onDel();
                        break;
                }
            }
        }
    }

    protected onHide(...args: any[]): void {
        this.selectData = undefined;
        this.Slider.node.off('slide');
        this.right.off(Input.EventType.TOUCH_END);
        this.left.off(Input.EventType.TOUCH_END);
        this.right.off(Input.EventType.TOUCH_CANCEL);
        this.left.off(Input.EventType.TOUCH_CANCEL);
        this.right.off(Input.EventType.TOUCH_START);
        this.left.off(Input.EventType.TOUCH_START);
        this.maxBtn.node.off("click");

    }
}