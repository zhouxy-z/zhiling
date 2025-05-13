import { Button, Component, EventTouch, Input, Label, Layout, Node, RichText, ScrollView, Slider, Sprite, SpriteFrame, Toggle, UITransform, Widget, instantiate, path, size, sp, sys, tween } from "cc";
import { Panel } from "../../GameRoot";
import { BagItem } from "../bag/BagItem";
import PlayerData, { } from "../roleModule/PlayerData"
import { SPlayerDataRole, SOrderType, SThing } from "../roleModule/PlayerStruct";
import { AutoScroller } from "../../utils/AutoScroller";
import { Bourse, CfgMgr, StdCommonType, StdCrossBours, ThingItemId, ThingType } from "../../manager/CfgMgr";
import { SetNodeGray } from "../common/BaseUI"
import { ResMgr, folder_head_card, folder_icon, folder_item } from "../../manager/ResMgr";
import { ComboBox } from "../../utils/ComboBox";
import { EventMgr, Evt_Item_Change } from "../../manager/EventMgr";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import { Tips } from "../login/Tips";
import { OrderAgainConfirmPanel } from "./OrderAgainConfirmPanel";
import { DateUtils } from "../../utils/DateUtils";
import LocalStorage from "../../utils/LocalStorage";
import { TradeHeroPanel } from "./TradeHeroPanel";
import { MsgPanel } from "../common/MsgPanel";
import { Second, ToFixed, formatNumber } from "../../utils/Utils";
import { CheckRisk, isFengkong } from "../../Platform";
import { IOS } from "cc/env";
import { RiskPanel } from "../login/RiskPanel";

export class TradeCreateOrderPanel extends Panel {
    protected prefab: string = "prefabs/panel/Trade/TradeCreateOrderPanel";

    private page: number;
    private page1: Node;
    private scroller1: AutoScroller;
    private page2: Node;
    private scroller2: AutoScroller;
    private page3: Node;
    private scroller3: AutoScroller;
    private combo1: ComboBox;
    private combo2: ComboBox;

    private navBtns: Node[];
    private scroller: AutoScroller;

    private order_item_node: Node;
    private order_item: BagItem;
    private itemName: Label;
    private cost_slider: Slider;
    private cost_progress: Node;
    private cost_consumeNum: Label;
    private cost_hasNum: Label;

    private num_slider: Slider;
    private num_consumeNum: Label;
    private num_hasNum: Label;
    private num_progress: Node;

    private buyNum: Label;
    private sellNum: Label;
    private cost_num: Label;
    private btnCreate: Button;
    private buyNode: Node;
    private sellNode: Node;
    private cost_slider_node: Node;
    private num_slider_node: Node;
    private item_num: Label;
    private num_left_btn: Node;
    private num_right_btn: Node;
    private orderNode: Node;
    private noneListCont: Node;
    private arry_num: Label;
    private tips: Node;
    private sellBoothNum: Label;//摊位费
    private buyBoothNum: Label;//摊位费

    private currencyNode: Node
    private layoutNode: Node
    private currencyIconNode: Node
    private iconNode: Node[] = []

    private combo1Str = { [1]: "全部", [2]: "肉盾", [3]: "战士", [4]: "射手", [5]: "辅助", }
    private combo2Str = { [1]: "全部", [2]: "N", [3]: "R", [4]: "SR", [5]: "SSR", [6]: "UR", }
    private sorts1: { value: number } = { value: 1 };
    private sorts2: { value: number } = { value: 1 };

    private Data: SThing[];
    private selectData: SThing;

    private tradeData: Bourse | StdCrossBours;//交易商品配置
    private cost_count = 0;
    private num_count = 0;
    private type: SOrderType;
    private max_num_count: number;//最大交易数量；
    private touchIndex = 0;
    private touchTime = 0;
    private cur_role_data: SPlayerDataRole;
    private select_index: number;
    private sort_role_data: SThing[];
    private min_booth_num = 0;
    private isworldTrade: boolean = false; //ture代表世界交易所
    private showCanChangeCurrency: any[] = []
    private changeItemType: number = 0;

    protected onLoad() {
        this.CloseBy("mask");
        this.CloseBy("layout/closeBtn");
        this.page1 = this.find("layout/page1");
        this.scroller1 = this.page1.getChildByPath("ScrollView").getComponent(AutoScroller);
        this.scroller1.SetHandle(this.UpdateBagItem.bind(this));
        this.scroller1.node.on('select', this.SelectItem, this);

        this.page2 = this.find("layout/page2");
        this.scroller2 = this.page2.getChildByPath("ScrollView").getComponent(AutoScroller);
        this.scroller2.SetHandle(this.UpdateBagItem.bind(this));
        this.scroller2.node.on('select', this.SelectItem, this);
        this.combo1 = this.find("layout/page2/selectJob", ComboBox);
        this.combo1.Init([1, 2, 3, 4, 5], this.updateJobItem.bind(this), this.updateHead1.bind(this));
        this.combo1.node.on('select', this.onSelectJob, this);
        this.combo2 = this.find("layout/page2/selectQuality", ComboBox);
        this.combo2.Init([1, 2, 3, 4, 5, 6], this.updatequalityItem.bind(this), this.updateHead2.bind(this));
        this.combo2.node.on('select', this.onSelectquality, this);

        this.page3 = this.find("layout/page3");
        this.scroller3 = this.page3.getChildByPath("ScrollView").getComponent(AutoScroller);
        this.scroller3.SetHandle(this.UpdateBagItem.bind(this));
        this.scroller3.node.on('select', this.SelectItem, this);

        this.orderNode = this.find("layout/orderNode");
        this.noneListCont = this.find("layout/noneListCont");
        this.order_item_node = this.find("layout/orderNode/itemNode");
        this.order_item = this.find("layout/orderNode/itemNode/item").addComponent(BagItem);
        this.item_num = this.find("layout/orderNode/itemNode/num", Label);
        this.itemName = this.find("layout/orderNode/name", Label);
        this.sellNum = this.find("layout/orderNode/sellNode/sellNum", Label);
        this.cost_num = this.find("layout/orderNode/sellNode/cost_num", Label);
        this.buyNum = this.find("layout/orderNode/buyNode/buyNum", Label);
        this.cost_slider_node = this.find("layout/orderNode/layout/page1");
        this.cost_slider = this.find("layout/orderNode/layout/page1/Slider", Slider);
        this.cost_progress = this.find("layout/orderNode/layout/page1/Slider/progress");
        this.cost_consumeNum = this.find("layout/orderNode/layout/page1/consumeNum", Label);
        this.cost_hasNum = this.find("layout/orderNode/layout/page1/hasNum", Label);
        this.num_slider_node = this.find("layout/orderNode/layout/page2");
        this.num_slider = this.find("layout/orderNode/layout/page2/Slider", Slider);
        this.num_progress = this.find("layout/orderNode/layout/page2/Slider/progress");
        this.num_consumeNum = this.find("layout/orderNode/layout/page2/consumeNum", Label);
        this.num_hasNum = this.find("layout/orderNode/layout/page2/hasNum", Label);
        this.btnCreate = this.find("layout/orderNode/btnCreate", Button);
        this.buyNode = this.find("layout/orderNode/buyNode");
        this.sellNode = this.find("layout/orderNode/sellNode");
        this.arry_num = this.find("layout/orderNode/arryNode/arry_num", Label);
        this.tips = this.find("layout/orderNode/tips");
        this.sellBoothNum = this.find("layout/orderNode/sellNode/sellBoothNum", Label);
        this.buyBoothNum = this.find("layout/orderNode/buyNode/buyBoothNum", Label);
        this.currencyNode = this.find("layout/orderNode/currencyNode");
        this.layoutNode = this.find("layout/orderNode/currencyNode/currency_bg/LayoutNode");
        this.currencyIconNode = this.find("layout/orderNode/currencyNode/currency_bg/LayoutNode/Icon");
        let icon_1 = this.find("layout/orderNode/sellNode/neddItem");
        let icon_2 = this.find("layout/orderNode/sellNode/neddItem1");
        let icon_3 = this.find("layout/orderNode/sellNode/neddItem2");
        let icon_4 = this.find("layout/orderNode/buyNode/neddItem");
        let icon_5 = this.find("layout/orderNode/buyNode/neddItem_1");
        this.iconNode.push(icon_1);
        this.iconNode.push(icon_2);
        this.iconNode.push(icon_3);
        this.iconNode.push(icon_4);
        this.iconNode.push(icon_5);

        this.num_left_btn = this.find("layout/orderNode/layout/page2/left");
        this.num_right_btn = this.find("layout/orderNode/layout/page2/right");
        this.find("layout/orderNode/layout/page1/right").on(Input.EventType.TOUCH_END, this.onAddCost, this);
        this.find("layout/orderNode/layout/page1/left").on(Input.EventType.TOUCH_END, this.onDelCost, this);
        this.find("layout/orderNode/layout/page1/right").on(Input.EventType.TOUCH_CANCEL, this.onAddCost, this);
        this.find("layout/orderNode/layout/page1/left").on(Input.EventType.TOUCH_CANCEL, this.onDelCost, this);
        this.find("layout/orderNode/layout/page1/right").on(Input.EventType.TOUCH_START, () => { this.onTouchStart(1) }, this);
        this.find("layout/orderNode/layout/page1/left").on(Input.EventType.TOUCH_START, () => { this.onTouchStart(2) }, this);
        this.cost_slider.node.on('slide', this.onSlideCost, this);
        this.num_slider.node.on('slide', this.onSlideNum, this);
        this.btnCreate.node.on("click", this.onCreate, this)
        this.order_item_node.on(Input.EventType.TOUCH_START, this.onItem, this)
        this.navBtns = this.find("layout/nav").children.concat();
        for (let btn of this.navBtns) {
            btn.off('toggle', this.onPage, this);
            btn.on('toggle', this.onPage, this);
        }
    }
    async SetPage(page: number) {
        if (!this.$hasLoad) await this.initSub;
        if (!this.navBtns[page]) return;
        this.page = undefined;
        this.navBtns[page].getComponent(Toggle).isChecked = true;
        this.onPage(this.navBtns[page].getComponent(Toggle));
    }
    protected onShow(...args: any[]): void {
        console.log(args)
        this.isworldTrade = args[1];

        this.SetPage(0);
        this.SelectItem(0, null);

        // this.scroller.getComponent(ScrollView).content.children[0].getComponent(Toggle).isChecked = true;
    }
    public flush(...args: any[]): void {
        if (this.isworldTrade) {
            this.changeItemType = 0;
            this.orderNode.getComponent(UITransform).contentSize = size(915, 660)
            this.currencyNode.active = true;
            this.type = 0;
            this.sellNode.active = this.isworldTrade;
            this.buyNode.active = !this.isworldTrade;
        } else {
            this.orderNode.getComponent(UITransform).contentSize = size(915, 440)
            this.currencyNode.active = false;
            this.type = args[0];
            this.sorts1.value = 1;
            this.sorts2.value = 1;
            this.sellNode.active = this.type == SOrderType.SELL;
            this.buyNode.active = this.type == SOrderType.BUY;
        }
        this.orderNode.children.forEach((node) => {
            node.getComponent(Widget).updateAlignment();
        })
    }
    protected async onHide(...args: any[]) {
        if (!this.$hasLoad) await this.initSub;
        this.combo1.HideList();
        this.combo2.HideList();
        this.scroller = undefined;
        this.Data = undefined;
        TradeHeroPanel.Hide();
    }

    // protected onItemChange() {
    //     if (!this.node.parent) return;
    //     this.SetPage(this.page);
    // }

    protected updateHead1(item: Node, data: number) {
        item.getChildByName("label").getComponent(Label).string = this.combo1Str[data];
    }
    protected async updateJobItem(item: Node, job: number) {
        let icon = item.getChildByName("icon").getComponent(Sprite);
        icon.node.active = false;
        item.getChildByName("label").getComponent(Label).string = this.combo1Str[job];

    }
    protected onSelectJob(value: number) {
        this.sorts1.value = value;
        this.Sort();
    }
    protected updateHead2(item: Node, data: number) {
        item.getChildByName("label").getComponent(Label).string = this.combo2Str[data];
    }
    protected async updatequalityItem(item: Node, quality: number) {
        let icon = item.getChildByName("icon").getComponent(Sprite);
        icon.node.active = false;
        item.getChildByName("label").getComponent(Label).string = this.combo2Str[quality];
    }
    protected onSelectquality(value: number) {
        this.sorts2.value = value;
        this.Sort();
    }


    protected async onPage(t: Toggle, ...arg: any[]) {
        if (!t.isChecked) return;
        await Second(0);
        let page = this.navBtns.indexOf(t.node);
        // if(page == 1){
        //     t.isChecked = false;
        //     this.navBtns[this.page].getComponent(Toggle).isChecked = true;
        //     MsgPanel.Show("角色交易尚未开启");
        //     return;
        // }
        if (page < 0 || page == this.page) return;
        this.combo1.hideScroller();
        this.combo2.hideScroller();
        TradeHeroPanel.Hide();
        this.page = page;
        this.page1.active = false;
        this.page2.active = false;
        this.page3.active = false;
        this.num_slider_node.active = true;
        let cur_page
        let datas = []
        if (this.isworldTrade) {
            if (this.page != 0) {
                MsgPanel.Show("暂未开放");
                this.SetPage(0);
                return;
            }
            let can_change_item_lsit = CfgMgr.GetCrossBoursCanTrade();
            for (let index = 0; index < can_change_item_lsit.length; index++) {
                const element = can_change_item_lsit[index];
                let data: SThing = {
                    type: ThingType.ThingTypeItem,
                    item: { id: element.SellItemID, count: 0 }
                }
                if (element.SellItemID == 1 || element.SellItemID == 201) {
                    data.item.count = PlayerData.roleInfo.currency;
                } else if (element.SellItemID == 202) {
                    data.item.count = PlayerData.roleInfo.currency_77;
                } else {
                    data.item.count = PlayerData.GetItemCount(element.SellItemID);
                }
                datas.push(data);
            }
            this.Data = datas
            cur_page = this.page1
            this.scroller = this.scroller1;
        } else {
            if (this.type == SOrderType.BUY) {
                this.Data = CfgMgr.GetTradeAllData(this.page + 1);
            } else {
                this.Data = PlayerData.GetResBySubType(page);
            }
            switch (page) {
                case 0: // 道具
                    this.Data.forEach((data) => {
                        if (this.type == SOrderType.BUY) {
                            if (CfgMgr.GetTradeData(data, this.type)) {
                                let role_data: SThing = {
                                    type: ThingType.ThingTypeItem,
                                    item: data.item,
                                }
                                datas.push(role_data)
                            }
                        } else {
                            if (data.item.count > 0 && CfgMgr.GetTradeData(data, this.type)) {
                                let role_data: SThing = {
                                    type: ThingType.ThingTypeItem,
                                    item: data.item,
                                }
                                datas.push(role_data)
                            }
                        }
                    });
                    this.Data = datas;
                    // this.page1.active = true;
                    cur_page = this.page1
                    this.scroller = this.scroller1;
                    break;
                case 1: // 角色
                    this.Data.forEach((data) => {
                        if (CfgMgr.GetTradeData(data, this.type)) {
                            let role_data: SThing = {
                                type: ThingType.ThingTypeRole,
                                role: data.role,
                            }
                            datas.push(role_data)
                        }
                    })
                    datas.sort((a, b) => {
                        return a.role.type - b.role.type
                    })

                    this.orderNode.active = true;
                    this.page2.getChildByName("frame").active = true;
                    this.page2.getChildByName("ScrollView").active = true;
                    this.noneListCont.active = false;
                    let node1 = this.combo1.node.getChildByPath("layout/input");
                    this.updateHead1(node1, 1)
                    let node2 = this.combo2.node.getChildByPath("layout/input")
                    this.updateHead2(node2, 1)

                    this.num_slider_node.active = false;
                    this.Data = datas;
                    this.sort_role_data = datas;
                    // this.page2.active = true;
                    cur_page = this.page2
                    this.scroller = this.scroller2;
                    break;
                case 2: // 资源
                    if (this.type == SOrderType.BUY) {
                        this.Data.forEach((data) => {
                            if (data.resource.wood > 0 || data.resource.water > 0 || data.resource.seed || data.resource.rock > 0) {
                                datas.push(data)
                            }
                        })
                        this.Data = datas;
                    } else {
                        this.Data.forEach((data) => {
                            if (data.resource.wood > 0) {
                                datas.push(data)
                            } else if (data.resource.water > 0) {
                                datas.push(data)
                            } else if (data.resource.seed > 0) {
                                datas.push(data)
                            } else if (data.resource.rock > 0) {
                                datas.push(data)
                            }
                        })
                        this.Data = datas;
                    }
                    // this.page3.active = true;
                    cur_page = this.page3
                    this.scroller = this.scroller3;
                    break;
                default:
                    this.Data.length = 0;
            }
        }
        if (!this.Data || this.Data.length == 0) {
            this.orderNode.active = false;
            cur_page.active = false;
            this.noneListCont.active = true;
            return;
        } else {
            this.orderNode.active = true;
            cur_page.active = true;
            this.noneListCont.active = false;
        }
        if (this.scroller && this.Data) {
            this.scroller.UpdateDatas(this.Data);
            if (this.Data.length) {
                this.scroller.SelectFirst();
            } else {
                this.SelectItem(0, null);
            }
        }
    }

    protected Sort() {
        if (!this.scroller || !this.sort_role_data || this.sort_role_data.length <= 0) return;
        this.orderNode.active = true;
        this.page2.getChildByName("frame").active = true;
        this.page2.getChildByName("ScrollView").active = true;
        this.noneListCont.active = false;
        // 职业排序
        let sortData = [];
        let sort2data = []
        if (this.sorts1.value != 1) {
            for (let data of this.sort_role_data) {
                let role_type = CfgMgr.GetRole()[data.role.type].PositionType;
                if (role_type == this.sorts1.value - 1) {
                    sortData.push(data);
                }
            }
        } else {
            sortData = this.sort_role_data;
        }
        // 品质排序
        if (this.sorts2.value != 1) {
            let count = sortData.length - 1
            for (let index = count; index >= 0; index--) {
                const element = sortData[index];
                let role_qualit = element.role.quality;
                if (role_qualit == this.sorts2.value - 1) {
                    sort2data.push(element)
                    // sortData.splice(index, 1);
                }
            }
        } else {
            sort2data = sortData
        }
        this.Data = sort2data;
        if (!this.Data || this.Data.length == 0) {
            this.orderNode.active = false;
            this.page2.getChildByName("frame").active = false;
            this.page2.getChildByName("ScrollView").active = false;
            this.noneListCont.active = true;
            return;
        }
        this.scroller.UpdateDatas(this.Data);
    }

    /**
     * 选中道具
     * @param index 
     */
    protected async SelectItem(index: number, item: Node) {
        if (!this.$hasLoad) await this.initSub;
        if (!this.Data || !this.Data[index]) return;
        for (let i = 0; i < this.scroller.children.length; i++) {
            const element = this.scroller.children[i];
            if (index == element["$$index"]) {
                element.getChildByName("select").active = true;
                this.select_index = element["$$index"];
            } else {
                element.getChildByName("select").active = false;
            }
        }
        let data = this.Data[index];
        this.selectData = data;
        this.max_num_count = 1;
        this.order_item.node.parent.active = data ? true : false;
        if (data.item) {
            this.max_num_count = data.item.count;
        } else if (data.resource) {
            let count: number;
            if (data.resource.wood) {
                count = data.resource.wood;
            } else if (data.resource.water) {
                count = data.resource.water;
            } else if (data.resource.rock) {
                count = data.resource.rock;
            } else if (data.resource.seed) {
                count = data.resource.seed;
            }
            this.max_num_count = count;
        }
        if (this.isworldTrade) {
            this.changeItemType = 0;
            this.showCanChangeCurrency = [];
            this.layoutNode.removeAllChildren();
            let can_pay_lsit = CfgMgr.GetCrossBoursPayDataById(data.item.id);
            for (let index = 0; index < can_pay_lsit.length; index++) {
                const element = can_pay_lsit[index];
                this.showCanChangeCurrency.push(element)
                let clone_item = instantiate(this.currencyIconNode);
                let item_cfg = CfgMgr.Getitem(element.PayItemID);
                let spr = item_cfg.Icon == "caizuan" ? "caizuan_hc" : item_cfg.Icon;
                let name = item_cfg.Items == 1 ? "彩虹体" : item_cfg.Items == 201 ? "幻彩石" : item_cfg.ItemName;
                console.log(name)
                clone_item.getChildByName("item_name").getComponent(Label).string = name;
                clone_item.getChildByName("icon").getComponent(Sprite).spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_item, spr, "spriteFrame"), SpriteFrame);
                this.layoutNode.addChild(clone_item)
            }

            let itemBtns = this.layoutNode.children.concat();
            for (let btn of itemBtns) {
                btn.off('toggle', this.onSelectChangeItem, this);
                btn.on('toggle', this.onSelectChangeItem, this);
            }
        }
        this.updateOrderInfo(data)
    }

    protected async onSelectChangeItem(t: Toggle, ...arg: any[]) {
        if (!t.isChecked) return;
        await Second(0);
        let index = this.layoutNode.children.indexOf(t.node);
        if (index < 0 || index == this.changeItemType) return;
        this.changeItemType = index;
        //刷新货币相关的信息
        this.updateCrossOrderCurrencyInfo()
    }

    private async updateOrderInfo(data: SThing) {
        this.cur_role_data = null;
        this.tips.active = false;
        if (data.item) {
            let std = CfgMgr.Getitem(data.item.id);
            this.itemName.string = std.ItemName;
        } else if (data.role) {
            this.cur_role_data = data.role;
            let stdRole = CfgMgr.GetRole()[data.role.type];
            this.itemName.string = stdRole.Name;
        } else if (data.resource) {
            if (data.resource.rock >= 0) {
                this.itemName.string = "石灵";
            } else if (data.resource.seed >= 0) {
                this.itemName.string = "源种";
            } else if (data.resource.water >= 0) {
                this.itemName.string = "水宝";
            } else if (data.resource.wood >= 0) {
                this.itemName.string = "古木";
            }
        }
        this.order_item.setIsShowTips(true);
        this.order_item.setIsShowSelect(false);
        this.order_item.SetData(data)
        for (let index = 0; index < this.iconNode.length; index++) {
            const element = this.iconNode[index];
            element.getComponent(Sprite).spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_item, "caizuan", "spriteFrame"), SpriteFrame);
        }
        if (this.isworldTrade) {
            this.updateCrossOrderCurrencyInfo();
        } else {
            this.tradeData = CfgMgr.GetTradeData(data, this.type);
            this.setIsCanCreate()
            if (data.role) {
                let time = data.role.trade_cd - PlayerData.GetServerTime();
                if (time > 0) {
                    SetNodeGray(this.btnCreate.node, true);
                    this.tips.active = true;
                }
            }
        }
    }

    private async updateCrossOrderCurrencyInfo() {
        if (this.isworldTrade) {
            //**不同服对应不同的货币 */  
            this.tradeData = this.showCanChangeCurrency[this.changeItemType];
            let cross_bours = this.tradeData as StdCrossBours;
            let item_cfg = CfgMgr.Getitem(cross_bours.PayItemID);
            let spr = item_cfg.Icon == "caizuan" ? "caizuan_hc" : item_cfg.Icon;
            for (let index = 0; index < this.iconNode.length; index++) {
                const element = this.iconNode[index];
                element.getComponent(Sprite).spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_item, spr, "spriteFrame"), SpriteFrame);
            }
            this.setIsCanCreate();
        }
    }

    private setIsCanCreate() {
        if (!this.tradeData) {
            Tips.Show("缺少配置");
            return;
        }

        let _max_num_count = Math.floor(this.max_num_count / this.tradeData.Single)
        this.max_num_count = _max_num_count > this.tradeData.Stack ? this.tradeData.Stack : _max_num_count;
        if (this.type == SOrderType.BUY) {
            this.max_num_count = this.tradeData.Stack;
        }
        this.arry_num.string = this.tradeData.Single + "个";
        this.num_hasNum.string = "/" + this.max_num_count;
        this.cost_count = this.getLowestPrice();
        let _highestPrice = this.getHighestPrice();
        this.cost_hasNum.string = "/" + _highestPrice;
        this.num_count = this.tradeData.Mini > this.max_num_count ? 0 : this.tradeData.Mini;
        if (this.max_num_count == 0) {
            SetNodeGray(this.btnCreate.node, true);
            this.num_slider.enabled = false;
            this.num_left_btn.off(Input.EventType.TOUCH_END, this.onDelNum, this);
            this.num_left_btn.off(Input.EventType.TOUCH_CANCEL, this.onDelNum, this);
            this.num_left_btn.off(Input.EventType.TOUCH_START);
            this.num_right_btn.off(Input.EventType.TOUCH_END, this.onAddNum, this);
            this.num_right_btn.off(Input.EventType.TOUCH_CANCEL, this.onAddNum, this);
            this.num_right_btn.off(Input.EventType.TOUCH_START);
            this.num_slider.progress = 0;
            this.sellNum.string = 0 + "";
            this.cost_num.string = 0 + "";
            this.item_num.string = 0 + "";
            this.buyBoothNum.string = 0 + "";
            this.sellBoothNum.string = 0 + "";
            return;
        } else {
            SetNodeGray(this.btnCreate.node, false);
            this.num_slider.enabled = true;
            this.num_left_btn.on(Input.EventType.TOUCH_END, this.onDelNum, this);
            this.num_left_btn.on(Input.EventType.TOUCH_CANCEL, this.onDelNum, this);
            this.num_left_btn.on(Input.EventType.TOUCH_START, () => { this.onTouchStart(4) }, this);
            this.num_right_btn.on(Input.EventType.TOUCH_END, this.onAddNum, this);
            this.num_right_btn.on(Input.EventType.TOUCH_CANCEL, this.onAddNum, this);
            this.num_right_btn.on(Input.EventType.TOUCH_START, () => { this.onTouchStart(3) }, this);
        }
        this.updateCostProgress();
        this.updateNumProgress();

    }

    private onItem() {
        if (this.cur_role_data) {
            TradeHeroPanel.Show(this.cur_role_data);
        }
    }

    private onCreate() {
        if (this.type == SOrderType.BUY) {
            let currency = PlayerData.roleInfo.currency;
            let buy_boot_cost = CfgMgr.GetCommon(StdCommonType.Bourse).book;//求购摊位费率
            let _buyBoothNum = this.cost_count * this.num_count * buy_boot_cost;
            _buyBoothNum = _buyBoothNum > 0.01 ? _buyBoothNum : this.min_booth_num;
            let need_cost = this.cost_count * this.num_count + _buyBoothNum;
            if (currency < need_cost) {
                Tips.Show("货币不足")
                return;
            }
        } else {
            if (this.num_count < this.tradeData.Mini) {
                Tips.Show("数量不可低于" + this.tradeData.Mini)
                return;
            }

            if (this.num_count > this.max_num_count) {
                Tips.Show("数量不足")
                return;
            }
        }

        let type = [6, 5, 1, 4]
        let num = type[this.page]

        let data = null;
        // let is_jump = false;
        if (num == ThingType.ThingTypeItem) {
            data = {
                type: num,
                selectData: this.selectData,
                price: this.cost_count,
                num: this.num_count,
            }
        } else if (num == ThingType.ThingTypeRole) {
            // is_jump = true;
            data = {
                type: num,
                selectData: this.selectData,
                price: this.cost_count,
                num: this.num_count,
            }
        } else if (num == ThingType.ThingTypeResource) {
            data = {
                type: num,
                selectData: this.selectData,
                price: this.cost_count,
                num: this.num_count,
            }
        }
        let okCallBack = () => {
            let time = LocalStorage.GetNumber("OrderAgainConfirmPanel" + PlayerData.roleInfo.player_id)
            if (time) {
                // let isopen = !is_jump && DateUtils.isSameDay(time)
                let isopen = DateUtils.isSameDay(time)
                if (isopen) {
                    this.callBack();
                    return;
                }
            }
            OrderAgainConfirmPanel.Show(this.type, data, this.page, this.tradeData, this.isworldTrade)
        }
        let noCallBack = () => {
        }
        if (num == ThingType.ThingTypeRole) {
            // if(this.selectData.role.level > 1){
            //     Tips.Show("出提供植灵等级将重置为1级，通过邮件返回90%经验道具以及全部突破道具。", okCallBack.bind(this), noCallBack.bind(this))
            // }else{
            //     okCallBack();
            // }
            okCallBack();
        } else {
            okCallBack();
        }

    }
    private callBack() {
        if (this.isworldTrade) {
            if (isFengkong()) {
                RiskPanel.Show();
                CheckRisk((data: { authorization: string, rc_token: string }) => {
                    RiskPanel.Hide();
                    let is_ios = IOS ? 1 : 2;
                    let orderData = {
                        type: MsgTypeSend.CrossExchangesCreateSellOrder,
                        data: {
                            bourse_id: this.tradeData.Id,
                            group_value: this.cost_count,
                            group_count: this.num_count,
                            authorization: data.authorization,
                            rc_token: data.rc_token,
                            client_os: is_ios,
                            // sell_items: { type:cross_bours.PaymentType, id:cross_bours.PaymentID, count:this.num_count },
                        }
                    }
                    Session.Send(orderData)
                })
            } else {
                let is_ios = IOS ? 1 : 2;
                let orderData = {
                    type: MsgTypeSend.CrossExchangesCreateSellOrder,
                    data: {
                        bourse_id: this.tradeData.Id,
                        group_value: this.cost_count,
                        group_count: this.num_count,
                        authorization: "",
                        rc_token: "",
                        client_os: is_ios,
                        // sell_items: { type:cross_bours.PaymentType, id:cross_bours.PaymentID, count:this.num_count },
                    }
                }
                Session.Send(orderData);
            }
        } else {
            let getThing = () => {
                let type = [1, 5, 6, 4]
                let num = type[this.page]
                let value
                switch (num) {
                    case ThingType.ThingTypeItem:
                        value = {
                            type: num,
                            item: { id: this.selectData.item.id, count: this.num_count * this.tradeData.Single }
                        }
                        break;
                    case ThingType.ThingTypeRole:
                        value = {
                            type: num,
                            role: {
                                id: this.selectData.role.id,
                                type: this.selectData.role.type,
                                level: this.selectData.role.level,
                                quality: this.selectData.role.quality,
                                experience: this.selectData.role.experience,
                                soldier_num: this.selectData.role.soldier_num,
                                active_skills: this.selectData.role.active_skills ? this.selectData.role.active_skills : [],
                                passive_skills: this.selectData.role.passive_skills ? this.selectData.role.passive_skills : [],
                                is_in_building: this.selectData.role.is_in_building,
                                building_id: this.selectData.role.building_id ? this.selectData.role.building_id : 0,
                                battle_power: this.selectData.role.battle_power ? this.selectData.role.battle_power : 0,
                                skills: this.selectData.role.skills ? this.selectData.role.skills : [],
                                is_assisting: this.selectData.role.is_assisting,
                            }
                        }
                        break;
                    case ThingType.ThingTypeResource:
                        if (this.selectData.resource.rock >= 0) {
                            value = {
                                type: num,
                                resource: { wood: 0, water: 0, rock: this.num_count * this.tradeData.Single, seed: 0 }
                            }
                        } else if (this.selectData.resource.seed >= 0) {
                            value = {
                                type: num,
                                resource: { wood: 0, water: 0, rock: 0, seed: this.num_count * this.tradeData.Single }
                            }
                        } else if (this.selectData.resource.water >= 0) {
                            value = {
                                type: num,
                                resource: { wood: 0, water: this.num_count * this.tradeData.Single, rock: 0, seed: 0 }
                            }
                        } else if (this.selectData.resource.wood >= 0) {
                            value = {
                                type: num,
                                resource: { wood: this.num_count * this.tradeData.Single, water: 0, rock: 0, seed: 0 }
                            }
                        }
                        break;
                }
                return value
            }
            if (this.type == SOrderType.SELL) {
                if (isFengkong()) {
                    RiskPanel.Show();
                    CheckRisk((data: { authorization: string, rc_token: string }) => {
                        RiskPanel.Hide();
                        let orderData = {
                            type: MsgTypeSend.ExchangesCreateSellOrder,
                            data: {
                                unit_value: this.cost_count,
                                unit_count: this.num_count,
                                sell_things: { data: [getThing()] },
                                authorization: data.authorization,
                                rc_token: data.rc_token,
                                client_os: IOS ? 1 : 2,
                            }

                        }
                        Session.Send(orderData)
                    })
                } else {
                    let orderData = {
                        type: MsgTypeSend.ExchangesCreateSellOrder,
                        data: {
                            unit_value: this.cost_count,
                            unit_count: this.num_count,
                            sell_things: { data: [getThing()] },
                            authorization: "",
                            rc_token: "",
                            client_os: IOS ? 1 : 2,
                        }

                    }
                    Session.Send(orderData);
                }
            } else {
                if (isFengkong()) {
                    RiskPanel.Show();
                    CheckRisk((data: { authorization: string, rc_token: string }) => {
                        RiskPanel.Hide();
                        let orderData = {
                            type: MsgTypeSend.ExchangesCreateBuyOrder,
                            data: {
                                unit_value: this.cost_count,
                                unit_count: this.num_count,
                                request_things: { data: [getThing()] },
                                authorization: data.authorization,
                                rc_token: data.rc_token,
                                client_os: IOS ? 1 : 2,
                            }

                        }
                        Session.Send(orderData)
                    })
                } else {
                    let orderData = {
                        type: MsgTypeSend.ExchangesCreateBuyOrder,
                        data: {
                            unit_value: this.cost_count,
                            unit_count: this.num_count,
                            request_things: { data: [getThing()] },
                            authorization: "",
                            rc_token: "",
                            client_os: IOS ? 1 : 2,
                        }

                    }
                    Session.Send(orderData);
                }
            }
        }
    }
    private onTouchStart(index: number) {
        this.touchIndex = index;
    }
    private onAddCost(event?) {
        if (!this.tradeData) return;
        this.cost_count += 0.01;
        let _highestPrice = this.getHighestPrice();
        if (this.cost_count > _highestPrice) {
            this.cost_count = _highestPrice;
        }
        this.updateCostProgress();
        if (event) {
            this.touchIndex = 0;
            this.touchTime = 0;
        }
    }
    private onDelCost(event?) {
        if (!this.tradeData) return;
        this.cost_count -= 0.01;
        let _lowestPrice = this.getLowestPrice();
        if (this.cost_count < _lowestPrice) {
            this.cost_count = _lowestPrice;
        }
        this.updateCostProgress();
        if (event) {
            this.touchIndex = 0;
            this.touchTime = 0;
        }
    }
    private onSlideCost(e?: Slider) {
        if (!this.tradeData) return;
        let _highestPrice = this.getHighestPrice();    
        this.cost_count = Math.ceil((_highestPrice * this.cost_slider.progress * 100)) / 100;
        let _lowestPrice = this.getLowestPrice();
        if (this.cost_count < _lowestPrice) {
            this.cost_count = _lowestPrice;
        }
        this.touchIndex = 0;
        this.touchTime = 0;
        this.updateCostProgress();
    }
    private onAddNum(event?) {
        if (!this.tradeData) return;
        this.num_count++;
        if (this.num_count > this.max_num_count) {
            this.num_count = this.max_num_count
        }
        this.updateNumProgress();
        if (event) {
            this.touchIndex = 0;
            this.touchTime = 0;
        }
    }
    private onDelNum(event?) {
        if (!this.tradeData) return;
        this.num_count--;
        if ((this.num_count < this.tradeData.Mini) && (this.tradeData.Mini <= this.max_num_count)) {
            this.num_count = this.tradeData.Mini;
        }
        if (this.max_num_count < this.tradeData.Mini) {
            this.num_count = 0;
        }
        this.updateNumProgress();
        if (event) {
            this.touchIndex = 0;
            this.touchTime = 0;
        }
    }
    private onSlideNum(e?: Slider) {
        if (!this.tradeData) return;
        this.num_count = Math.ceil(this.max_num_count * this.num_slider.progress);
        if ((this.num_count < this.tradeData.Mini) && (this.tradeData.Mini <= this.max_num_count)) {
            this.num_count = this.tradeData.Mini;
        }
        if (this.max_num_count < this.tradeData.Mini) {
            this.num_count = 0;
        }
        this.touchIndex = 0;
        this.touchTime = 0;
        this.updateNumProgress();
    }
    private updateCostProgress() {
        this.cost_consumeNum.string = ToFixed(this.cost_count, 2);
        let _highestPrice = this.getHighestPrice();
        this.cost_slider.progress = this.cost_count / _highestPrice;
        this.updateCount();
    }
    private updateNumProgress() {
        this.num_consumeNum.string = this.num_count + "";
        let progress_num = this.tradeData.Mini;
        if (this.selectData) {
            progress_num = this.num_count / this.max_num_count;
        }
        this.num_slider.progress = progress_num;
        this.updateCount();
    }
    private async updateCount() {
        let need_cost = CfgMgr.GetCommon(StdCommonType.Bourse).Fees;//手续费
        let keepPre = 2;
        if (this.isworldTrade) {
            let cross_bours_cfg = this.tradeData as StdCrossBours
            need_cost = cross_bours_cfg.Fees;
            if (cross_bours_cfg.PayItemID == ThingItemId.ItemId_202) {
                keepPre = CfgMgr.GetCommon(StdCommonType.Gem).KeepPre;
            }
        }

        let sell_boot_cost = CfgMgr.GetCommon(StdCommonType.Bourse).stall;//上架摊位费率
        let buy_boot_cost = CfgMgr.GetCommon(StdCommonType.Bourse).book;//求购摊位费率
        let total_sell = Math.ceil(this.cost_count * this.num_count * Math.pow(10, keepPre));
        let server_cost = Math.ceil(this.cost_count * this.num_count * need_cost * Math.pow(10, keepPre));

        let _buyBoothNum = this.cost_count * this.num_count * buy_boot_cost;
        let _sellBoothNum = this.cost_count * this.num_count * sell_boot_cost;
        this.buyBoothNum.string = _buyBoothNum > 0.01 ? ToFixed((_buyBoothNum), keepPre) : this.min_booth_num + "";
        this.sellBoothNum.string = _sellBoothNum > 0.01 ? ToFixed((_sellBoothNum), keepPre) : this.min_booth_num + "";
        this.sellNum.string = (total_sell - server_cost) / Math.pow(10, keepPre) + "";
        this.cost_num.string = server_cost / Math.pow(10, keepPre) + "";
        this.buyNum.string = total_sell / Math.pow(10, keepPre) + "";
        if (this.page == 2) {
            this.item_num.string = formatNumber(this.num_count * this.tradeData.Single, keepPre);
        } else {
            this.item_num.string = formatNumber(this.num_count * this.tradeData.Single);
        }
    }

    private UpdateBagItem(item: Node, data: SThing, index: number) {
        item.getChildByName("select").active = index == this.select_index;
        let bagItem = item.getComponent(BagItem);
        if (!bagItem) bagItem = item.addComponent(BagItem);
        item.getComponent(BagItem).setIsShowSelect(false);
        bagItem.setIsShowNum(this.type == SOrderType.SELL);
        bagItem.setIsRoleLockShow(true);
        bagItem.SetData(data);
    }

    protected update(dt: number): void {
        let size = this.cost_slider.node.getComponent(UITransform).contentSize;
        this.cost_progress.getComponent(UITransform).setContentSize(this.cost_slider.progress * size.width, 28);
        this.num_progress.getComponent(UITransform).setContentSize(this.num_slider.progress * size.width, 28);
        if (this.touchIndex != 0) {
            this.touchTime += dt;
            if (this.touchTime >= 0.5) {
                this.touchTime = 0.47;
                switch (this.touchIndex) {
                    case 1:
                        this.onAddCost()
                        break;
                    case 2:
                        this.onDelCost();
                        break;
                    case 3:
                        this.onAddNum();
                        break;
                    case 4:
                        this.onDelNum();
                        break;
                }
            }
        }
    }

    private getHighestPrice(){
        let _highestPrice = 0
        if(this.isworldTrade){
            _highestPrice = this.tradeData.HighestPrice
        }else{
            let _tradeData = this.tradeData as Bourse
            _highestPrice = this.type == 0 ? _tradeData.HighestPrice : _tradeData.Book_HighestPrice;
        }
        return _highestPrice;
    }

    private getLowestPrice(){
        let _lowestPrice = 0
        if(this.isworldTrade){
            _lowestPrice = this.tradeData.LowestPrice
        }else{
            let _tradeData = this.tradeData as Bourse
            _lowestPrice = this.type == 0 ? _tradeData.LowestPrice : _tradeData.Book_LowestPrice;
        }
        return _lowestPrice;
    }
}
