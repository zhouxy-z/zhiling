import { Button, Component, EditBox, EventTouch, Input, Label, Layout, Node, ScrollView, Sprite, SpriteFrame, Toggle, Tween, TweenSystem, UITransform, Widget, debug, find, instantiate, js, path, sp, tween, view } from "cc";
import { Panel } from "../../GameRoot";
import { AutoScroller } from "../../utils/AutoScroller";
import PlayerData from "../roleModule/PlayerData"
import { SQueryType, SPlayerData, SPlayerDataItem, SPlayerDataRole, SOonViewData, SOrderData, SOrderType, SSerchData, SQueryArgs, SQuerySortType, Tips2ID } from "../roleModule/PlayerStruct";
import { Attr, AttrFight, Bourse, CardQuality, CfgMgr, StdCommonType, StdMerge, StdRoleQuality, ThingType } from "../../manager/CfgMgr";
import { ResMgr, folder_common, folder_head_card, folder_head_round, folder_icon } from "../../manager/ResMgr";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import { Second, ToFixed, randomI, randomf } from "../../utils/Utils";
import { TradePanelItem } from "./item/TradePanelItem";
import { EventMgr, Evt_Currency_Updtae, Evt_Hide_Scene, Evt_Show_Scene, Goto } from "../../manager/EventMgr";
import { Tips2 } from "../home/panel/Tips2";
import { AdaptBgTop } from "../common/BaseUI";
import { GameSet } from "../GameSet";
import { Tips } from "../login/Tips";
import { MsgPanel } from "../common/MsgPanel";
import LocalStorage from "../../utils/LocalStorage";
import { Tips3 } from "../home/panel/Tips3";

export enum GroupType {
    Buy = 0,
    Sell = 1,
    Order = 2
}

export enum TradePanelType {
    Trad = 0,//本地交易所
    WorldTrade = 1,//世界交易所
}

export class TradePanel extends Panel {
    protected prefab: string = "prefabs/panel/Trade/TradePanel";

    static get ins(): TradePanel { return this.$instance; }
    private body: sp.Skeleton;
    private navBtns: Node[];
    private localNode: Node;
    private worldNode: Node;
    private toggleOrder: Node = null;
    private ToggleCurrency: Node = null;
    private btnSort: Node = null;
    private scrollItem: AutoScroller = null;
    private scrollOrder: AutoScroller = null;
    private toggleGroup: Node = null;
    /**selectType 在本服交易所中0~2代表道具、角色、资源， 在世界交易所中代表彩虹体、幻彩石 */
    private selectType: number = 0;
    /**selectGroup 代表不同的功能页0交易大厅，1求购大厅，2上架管理 */
    private selectGroup: number = 0;
    private pageLabel: Label = null;
    private left: Node = null;
    private right: Node = null;
    private playerId: Label = null;
    private heleBtn: Node;
    private noneListCont: Node;
    private currency_jy: Label = null;
    private currency_hc: Label = null;
    private currency_score: Label = null;


    private combox_item: Node;
    private combox_open: Node;
    private combox_close: Node;
    private item_name: Label
    private open: Node;
    private combox_item_bg: Node;
    private content: Node;
    private combox_item1: Node;
    private combox_item2: Node;
    private item_3: Node;
    private serch: Node = null;
    private close_combox_item_node: Node;

    private pageSize = 30;
    private curPage = 1;
    private copyCode: string = null;


    /**SortQueryType 代表不同的筛选条件 在本服交易所中代表0全部类型，1上架管理，2代表是交易大厅、求购大厅道具的具体筛选（灵根，碎片，等），
     *  3代表是交易大厅、求购大厅默认大类和资源具体筛选（道具，角色，资源和，古木，石头等）， 4代表是交易大厅、求购大厅角色类具体筛选（肉盾，南瓜侠等）
     * 在世界交易所中 1上架管理，4代表挂交易大厅
     * 需搭配SortQArgs使用
     */
    private SortQueryType: number;
    /**SortQArgs 不同的筛选条件所传的参数不同搭配 thing_type代表小类型，1道具 5角色 6资源
     * 在世界交易所中 search_group_id 1代表展示彩虹体的订单， 2代表展示幻彩石，是由策划配置的
     */
    private SortQArgs: SQueryArgs;
    /**交易大厅的排序规则 */
    private buy_SortQArgs: SQueryArgs = {};
    /**求购大厅的排序规则 */
    private sell_SortQArgs: SQueryArgs = {};
    private TimeLock: number;

    /**当前所在的交易所0本服交易所、1世界交易所 */
    private tag: number;

    /**当前是否是筛选状态 */
    private is_select: boolean = false;

    /**能否切换道具（道具有刷新时间限制3是） */
    private is_can_change: boolean = true;
    private time = 0;

    private currencyGroupType = [{ type: 1, currency_name: "彩虹体" }, { type: 2, currency_name: "幻彩石" }, { type: 3, currency_name: "道具" }]

    protected onLoad() {
        this.CloseBy("closeBtn");
        this.noneListCont = this.find("noneListCont")
        this.currency_jy = this.find(`currency_jy/currencyLabel`, Label);
        this.currency_hc = this.find(`currency_hc/currencyLabel`, Label);
        this.currency_score = this.find(`currency_score/currencyLabel`, Label);
        this.body = this.find(`effBg/body`, sp.Skeleton);
        this.navBtns = this.find("Bg/navBtn").children.concat();
        for (let btn of this.navBtns) {
            btn.off('toggle', this.onPage, this);
            btn.on('toggle', this.onPage, this);
        }
        this.localNode = this.find(`Main/localNode`);
        this.worldNode = this.find(`Main/worldNode`);
        this.toggleOrder = this.find(`Main/localNode/ToggleOrder`);
        this.ToggleCurrency = this.find(`Main/worldNode/ToggleCurrency`);
        this.btnSort = this.find(`Main/btnSort`);
        this.scrollItem = this.find(`Main/ScrollView`, AutoScroller);
        this.scrollOrder = this.find(`Main/ScrollViewOrder`, AutoScroller);
        this.toggleGroup = this.find(`Main/ToggleGroup`);
        this.pageLabel = this.find(`Main/pageBg/Label`, Label);
        this.left = this.find(`Main/pageBg/left`);
        this.right = this.find(`Main/pageBg/right`);
        this.heleBtn = this.find("Bg/heleBtn");

        this.combox_item = this.find("combox_item");
        this.combox_open = this.find("combox_item/combox/open");
        this.combox_close = this.find("combox_item/combox/close");
        this.item_name = this.find("combox_item/combox/item_name", Label);
        this.open = this.find("combox_item/combox/open");
        this.combox_item_bg = this.find("combox_item/combox_item_bg");
        this.content = this.find("combox_item/combox_item_bg/ScrollView/view/content");
        this.combox_item1 = this.find("combox_item/combox_item1");
        this.combox_item2 = this.find("combox_item/combox_item2");
        this.item_3 = this.find("combox_item/item_3");
        this.serch = this.find(`Main/serch`);
        this.close_combox_item_node = this.find("combox_item/combox_item_bg/close_combox_item_node");

        EventMgr.on(Evt_Currency_Updtae, this.updateCurrency, this);
        this.onBtnEvent();
    }

    private onBtnEvent() {
        this.heleBtn.on(Input.EventType.TOUCH_END, this.onHelpBtn, this);
        this.find("Bg/heleBtn2").on(Input.EventType.TOUCH_END, this.onHelpBtn2, this);
        this.btnSort.on(Input.EventType.TOUCH_END, this.onTouchSort, this);

        this.combox_open.on(Input.EventType.TOUCH_END, this.onOpenComboxItem, this);
        this.combox_close.on(Input.EventType.TOUCH_END, this.onCloseComboxItem, this);
        this.close_combox_item_node.on(Input.EventType.TOUCH_END, this.onCloseComboxItem, this);
        this.serch.getChildByName(`EditBox`).on(EditBox.EventType.EDITING_DID_ENDED, this.onEditEnd, this)
        // this.serch.getChildByName(`EditBox`).on(EditBox.EventType.EDITING_DID_BEGAN, this.onEditBegan, this)
        //订单单选
        this.toggleOrder.children.forEach((node, index) => {
            node.on(Input.EventType.TOUCH_END, () => {
                node.getComponent(Toggle).isChecked = true;
                this.onSetScrollItemData(index);
            })
        })
        //功能单选
        this.toggleGroup.children.forEach((node, index) => {
            node.on(Input.EventType.TOUCH_END, () => {
                node.getComponent(Toggle).isChecked = true;
                this.onSetScrollGroupData(index);
            })
        })

        //货币单选
        this.ToggleCurrency.children.forEach((node, index) => {
            node.on(Input.EventType.TOUCH_END, () => {
                node.getComponent(Toggle).isChecked = true;
                this.onSetScrollItemData(index, true);
            })
        })


        this.left.on(Input.EventType.TOUCH_END, () => {
            if (this.curPage > 1) {
                this.curPage--;
            }
            if (this.tag != TradePanelType.WorldTrade) {
                if (this.is_select) {
                    this.SendSortOrSerch(this.curPage);
                } else {
                    this.SendSessionView(this.curPage);
                }
            } else {
                if (this.SortQArgs.search_group_id) {
                    this.SendSessionView(this.curPage);
                } else {
                    this.SendSortOrSerch(this.curPage);
                }
            }
        })
        this.right.on(Input.EventType.TOUCH_END, () => {
            this.curPage++;
            if (this.tag != TradePanelType.WorldTrade) {
                if (this.is_select) {
                    this.SendSortOrSerch(this.curPage);
                } else {
                    this.SendSessionView(this.curPage);
                }
            } else {
                if (this.SortQArgs.search_group_id) {
                    this.SendSessionView(this.curPage);
                } else {
                    this.SendSortOrSerch(this.curPage);
                }
            }
        })
        this.scrollItem.SetHandle(this.updateItem.bind(this));
        this.scrollOrder.SetHandle(this.updateOrderItem.bind(this));
    }

    /**重置UI和数据 */
    public reset() {
        this.scrollItem.UpdateDatas([]);
        this.scrollOrder.UpdateDatas([]);
        this.copyCode = null;
        this.SortQueryType = null;
        this.SortQArgs = {};
        this.TimeLock = 0;
        this.is_select = false;
        this.onSetScrollGroupData(0)
    }

    public GetCopyCode() {
        return this.copyCode;
    }
    public ResetCopyCode() {
        return this.copyCode = null;
    }
    public SetCopyCode(code: string) {
        return this.copyCode = code;
    }

    protected onShow(): void {
        let data = {
            type: MsgTypeSend.CrossExchangesGetAllBalances,
            data: {}
        }
        Session.Send(data);
        EventMgr.emit(Evt_Hide_Scene, js.getClassName(this));
    }

    async flush(...args: any[]) {
        AdaptBgTop(this.node.getChildByPath("di"));

        let is_first = LocalStorage.GetBool("firsr_trade" + PlayerData.roleInfo.player_id);
        if(!is_first){
            this.onHelpBtn2();
            LocalStorage.SetBool("firsr_trade" + PlayerData.roleInfo.player_id, true);
        }

        this.initSortListData();
        this.SetPage(0);
        this.updateCurrency();
            this.onEditBegan();
            this.navBtns[1].active = true;
        this.navBtns[1].active = false;
        if(GameSet.GetServerMark() == "xf"){
            this.currency_hc.node.parent.active = false;
            this.currency_score.node.parent.active = false;
        }
    }
    async SetPage(page: number) {
        if (!this.$hasLoad) await this.initSub;
        if (!this.navBtns[page]) return;
        this.tag = undefined;
        this.navBtns[page].getComponent(Toggle).isChecked = true;
        this.onPage(this.navBtns[page].getComponent(Toggle));
    }

    /**本服交易 世界交易页签切换 */
    private onPage(t: Toggle) {
        let page = this.navBtns.indexOf(t.node);
        if (page < 0 || page == this.tag) return;
        this.tag = page;
        this.localNode.active = (this.tag != TradePanelType.WorldTrade) && (this.selectGroup == 2);
        this.combox_item.active = this.tag != TradePanelType.WorldTrade;
        this.serch.active = this.tag != TradePanelType.WorldTrade;
        this.worldNode.active = this.tag == TradePanelType.WorldTrade;
        this.toggleGroup.children[1].active = this.tag != TradePanelType.WorldTrade;
        EventMgr.emit("SortPanel.ins.reset");
        this.reset();
    }

    public updateCurrency() {
        if(GameSet.GetServerMark() == "xf"){
            this.currency_jy.string = PlayerData.tradeAllBalances.jy ? ToFixed(PlayerData.tradeAllBalances.jy, 2) : ToFixed(PlayerData.roleInfo.currency, 2);
        }else{
            this.currency_jy.string = ToFixed(PlayerData.tradeAllBalances.jy, 2);
        }
        this.currency_hc.string = ToFixed(PlayerData.tradeAllBalances.hc, 2);
        let keepPre = CfgMgr.GetCommon(StdCommonType.Gem).KeepPre;
        this.currency_score.string = ToFixed(PlayerData.tradeAllBalances.score, keepPre);
    }

    protected onHide(...args: any[]): void {
        EventMgr.emit("SortPanel.ins.reset");
        EventMgr.emit(Evt_Show_Scene, js.getClassByName(this));
    }

    private onTouchSort() {
        if (this.tag != TradePanelType.WorldTrade) {
            Goto("SortPanel", this.selectType, false, this.SortQArgs, this.SortQueryType);
        } else {
            Goto("SortPanel", 0, true, this.SortQArgs, this.SortQueryType);
        }
    }

    onGetViewData(data: SOonViewData) {
        if (this.tag != TradePanelType.WorldTrade) {
            if (data.page_index > data.page_last_index && data.page_last_index != 0) {
                if (this.is_select) {
                    return this.SendSortOrSerch(data.page_last_index);
                } else {
                    return this.SendSessionView(data.page_last_index);
                }
            }
            if (data.query_args.selection_time_lock) {
                this.TimeLock = data.query_args.selection_time_lock;
                this.SortQArgs.selection_time_lock = this.TimeLock;
                this.is_can_change = false;
                //开始计时
                this.is_select = true;
            }
            if (data.query_args.role_selection || data.query_args.thing_res) {
                this.is_select = true;
            }
            this.curPage = data.page_index;
            // let datas = data.order_list;
            let datas = data.order_list ? PlayerData.getOrderListData(data.order_list) : [];
            this.pageLabel.string = `${data.page_index}/${data.page_last_index || 1}`;
            if (data.page_last_index <= 0) { this.pageLabel.string = `1/1` };
            if (this.selectGroup == 2) {//订单页面
                let length = CfgMgr.GetCommon(StdCommonType.Bourse).Warehourse
                if (this.selectType == 1) {
                    length = CfgMgr.GetCommon(StdCommonType.Bourse).OrdersLimit
                }
                if (data.total_count < length) datas.unshift(0 as never);
                this.scrollOrder.UpdateDatas(datas);
            } else {//求购购买页面
                this.noneListCont.active = false;
                if (!datas || datas.length == 0) {
                    this.noneListCont.active = true;
                }
                this.scrollItem.UpdateDatas(datas);
            }
            this.scrollItem.ScrollToHead();
            this.scrollOrder.ScrollToHead();
        } else {
            if (data.page_index > data.page_last_index && data.page_last_index != 0) {
                if (this.SortQArgs.search_group_id) {
                    return this.SendSessionView(data.page_last_index);
                } else {
                    return this.SendSortOrSerch(data.page_last_index);
                }
            }
            this.curPage = data.page_index;
            // let datas = data.order_list;
            let datas = data.order_list ? PlayerData.getCrossOrderListData(data.order_list) : [];
            this.pageLabel.string = `${data.page_index}/${data.page_last_index || 1}`;
            if (data.page_last_index <= 0) { this.pageLabel.string = `1/1` };
            if (this.selectGroup == 2) {//订单页面
                let length = CfgMgr.GetCommon(StdCommonType.Bourse).Warehourse
                if (data.total_count < length) datas.unshift(0 as never);
                this.scrollOrder.UpdateDatas(datas);
            } else {//求购购买页面
                this.noneListCont.active = false;
                if (!datas || datas.length == 0) {
                    this.noneListCont.active = true;
                }
                this.scrollItem.UpdateDatas(datas);
            }
            this.scrollItem.ScrollToHead();
            this.scrollOrder.ScrollToHead();
        }
    }

    onGetSerchData(data: SSerchData) {
        this.pageLabel.string = `1/1`;
        let datas = [];
        if (this.tag == TradePanelType.WorldTrade) {
            datas = data.order_list ? PlayerData.getCrossOrderListData(data.order_list) : [];
        } else {
            datas = data.order_list ? PlayerData.getOrderListData(data.order_list) : [];
        }
        this.selectType = 0;
        this.selectGroup = 0;
        this.setScrollView();
        if (datas) {
            this.scrollItem.UpdateDatas(datas);
        }
        this.noneListCont.active = false;
        if (!datas || datas.length == 0) {
            this.noneListCont.active = true;
        }
        this.scrollItem.ScrollToHead();
        this.scrollOrder.ScrollToHead();
    }

    /**在交易大厅和求购大厅中代表物品种类， 在上架管理中代表订单种类 （头顶小页签）*/
    private onSetScrollItemData(index, is_show?: boolean) {
        if (this.tag != TradePanelType.WorldTrade) {
            this.selectType = index;
            this.SortQArgs = {};
            let _SortQArgs = this.selectGroup == 0 ? this.buy_SortQArgs : this.sell_SortQArgs;
            this.SortQArgs.reverse = _SortQArgs.reverse;
            this.SortQArgs.sort_type = _SortQArgs.sort_type;

            this.setScrollView();
            this.SendSessionView()
        } else {
            this.selectType = index;
            this.SortQArgs = { search_group_id: this.currencyGroupType[index].type };
            this.setScrollView();
            this.SendSessionView()
        }
    }

    /**
     * 页面 交易大厅", "求购大厅", "上架管理 页签切换
     * @param index 
     */
    private async onSetScrollGroupData(index) {
        this.noneListCont.active = false;
        let spineData = ["role_001_ngr", "role_005_mg", "role_010_xrz"]
        this.body.skeletonData = await ResMgr.LoadResAbSub(path.join("spine/role_p", spineData[index], spineData[index]), sp.SkeletonData);
        this.body.setAnimation(0, "Idle", true)

        this.btnSort.active = index != GroupType.Order

        this.selectGroup = index;
        if (this.tag != TradePanelType.WorldTrade) {
            this.combox_item.active = this.selectGroup == GroupType.Order ? false : true;
            this.serch.active = this.selectGroup == GroupType.Order ? false : true;
            this.selectType = 0;
            this.SortQArgs = {};
            let _SortQArgs = this.selectGroup == 0 ? this.buy_SortQArgs : this.sell_SortQArgs;
            this.SortQArgs.reverse = _SortQArgs.reverse;
            this.SortQArgs.sort_type = _SortQArgs.sort_type;
            this.setScrollView();
            this.SendSessionView();
            this.AllCloseList();
        } else {
            this.worldNode.active = index != GroupType.Order
            this.ToggleCurrency.children[0].getComponent(Toggle).isChecked = true;
            this.selectType = 0;
            this.SortQArgs = {};
            this.setScrollView();
            this.SendSessionView();
        }
    }

    public SendSessionView(page: number = 1) {
        this.TimeLock = 0;
        this.is_select = false;
        if (this.tag != TradePanelType.WorldTrade) {
            let index = this.selectGroup;
            let seleType = this.selectType;
            let queryType: SQueryType = SQueryType.Global, queryArgs: SQueryArgs = {}, orderType: string = `sell`;
            switch (seleType) {
                case 0:
                    queryArgs.thing_type = ThingType.ThingTypeItem
                    break;
                case 1:
                    queryArgs.thing_type = ThingType.ThingTypeRole
                    break;
                case 2:
                    queryArgs.thing_type = ThingType.ThingTypeResource
                    break;
                case 3:
                    queryArgs.thing_type = ThingType.ThingTypeEquipment
                    break;
            }
            switch (index) {
                case GroupType.Buy:
                    orderType = `sell`;
                    queryType = SQueryType.ThingType
                    if (this.SortQArgs) {
                        queryArgs.sort_type = this.SortQArgs.sort_type;
                        queryArgs.reverse = this.SortQArgs.reverse;
                    }
                    break;
                case GroupType.Sell:
                    orderType = `buy`;
                    queryType = SQueryType.ThingType
                    if (this.SortQArgs) {
                        queryArgs.sort_type = this.SortQArgs.sort_type;
                        queryArgs.reverse = this.SortQArgs.reverse;
                    }
                    break;
                case GroupType.Order:
                    queryType = SQueryType.PlayerID
                    queryArgs.player_id = PlayerData.roleInfo.player_id
                    if (seleType == 1) {
                        orderType = `buy`;
                    } else {
                        orderType = `sell`;
                    }
                    break;
                default:
                    break;
            }
            console.log("切换刷新", queryType, queryArgs, page, this.pageSize, orderType)
            this.SendSerchViewByThingType(queryType, queryArgs, page, this.pageSize, orderType);
        } else {
            let index = this.selectGroup;
            let seleType = this.selectType;
            let queryType: SQueryType = SQueryType.RoleType, queryArgs: SQueryArgs = { search_group_id: 1 };
            switch (index) {
                case GroupType.Buy:
                    break;
                case GroupType.Sell:
                    break;
                case GroupType.Order:
                    queryType = SQueryType.PlayerID
                    queryArgs.player_id = PlayerData.roleInfo.player_id
                    break;
                default:
                    break;
            }
            switch (seleType) {
                case 0:
                    queryArgs.search_group_id = seleType + 1
                    break;
                case 1:
                    queryArgs.search_group_id = seleType + 1
                    break;
                case 2:
                    queryArgs.search_group_id = seleType + 1
                    break;
            }
            this.SortQArgs = queryArgs;
            this.SendSerchViewByThingType(queryType, queryArgs, page, this.pageSize, null);
        }
    }

    /**筛选排序 */
    public SendSortOrSerch(page = 1, type?: SQueryType, QArgs?: SQueryArgs) {
        if (this.tag != TradePanelType.WorldTrade) {
            if (type != null) this.SortQueryType = type;
            if (QArgs != null) this.SortQArgs = QArgs;
            let _SortQArgs = this.selectGroup == 0 ? this.buy_SortQArgs : this.sell_SortQArgs;
            if (QArgs) {
                if (typeof QArgs.reverse === "boolean") {
                    _SortQArgs.reverse = QArgs.reverse;
                } else {
                    this.SortQArgs.reverse = _SortQArgs.reverse;
                }
                if (typeof QArgs.sort_type === "number") {
                    _SortQArgs.sort_type = QArgs.sort_type;
                } else {
                    this.SortQArgs.sort_type = _SortQArgs.sort_type;
                }
            }


            if (type == SQueryType.ThingType) {
                switch (this.selectType) {
                    case 0:
                        QArgs.thing_type = ThingType.ThingTypeItem
                        break;
                    case 1:
                        QArgs.thing_type = ThingType.ThingTypeRole
                        break;
                    case 2:
                        QArgs.thing_type = ThingType.ThingTypeResource
                        break;
                    case 3:
                        QArgs.thing_type = ThingType.ThingTypeEquipment
                        break;
                }

            }
            let index = this.selectGroup;
            let seleType = this.selectType;
            let orderType = `sell`;
            switch (index) {
                case GroupType.Buy:
                    orderType = `sell`;
                    break;
                case GroupType.Sell:
                    orderType = `buy`;
                    break;
                case GroupType.Order:
                    if (seleType == 1) {
                        orderType = `buy`;
                    } else {
                        orderType = `sell`;
                    }
                    break;
                default:
                    break;
            }
            console.log("筛选刷新", this.SortQueryType, this.SortQArgs, page, this.pageSize, orderType)
            this.SendSerchViewByThingType(this.SortQueryType, this.SortQArgs, page, this.pageSize, orderType);
        } else {
            if (type != null) this.SortQueryType = type;
            if (QArgs != null) this.SortQArgs = QArgs;
            if (type == SQueryType.RoleType) {
                QArgs.search_group_id = this.currencyGroupType[this.selectType].type
            } else if (type == SQueryType.ThingType) {
            }
            let orderType = `sell`;
            this.SendSerchViewByThingType(this.SortQueryType, this.SortQArgs, page, this.pageSize, orderType);
        }
    }


    /**设置当前展示的列表 */
    private setScrollView() {
        this.SortQueryType = null;
        if (this.selectGroup == 2) {//订单页面
            this.scrollOrder.node.active = true;
            this.scrollItem.node.active = false;
            // this.toggleOrder.active = true;
            this.localNode.active = true && (this.tag != TradePanelType.WorldTrade);

            this.toggleOrder.children.forEach((node, index) => {
                if (index == this.selectType) {
                    node.getComponent(Toggle).isChecked = true;
                }
            })
        } else {//求购购买页面
            this.scrollOrder.node.active = false;
            this.scrollItem.node.active = true;
            // this.toggleOrder.active = false;
            this.localNode.active = false;
        }
        this.toggleGroup.children.forEach((node, i) => {
            if (i == this.selectGroup) {
                node.getComponent(Toggle).isChecked = true;
            }
        })
    }

    /**
     * 交易道具角色item
     * @param item 
     * @param data 
     */
    protected async updateItem(item: Node, data: SOrderData, index: number) {
        let itemScropt = item.getComponent(TradePanelItem);
        itemScropt = itemScropt ? itemScropt : item.addComponent(TradePanelItem);
        itemScropt.SetData(data, this.selectType, this.selectGroup, this.tag == TradePanelType.WorldTrade);
    }

    /**
     * 订单道具角色item
     * @param item 
     * @param data 
     */
    protected async updateOrderItem(item: Node, data: SOrderData) {
        let itemScropt = item.getComponent(TradePanelItem);
        itemScropt = itemScropt ? itemScropt : item.addComponent(TradePanelItem);
        itemScropt.SetOrderData(data, this.selectType, this.tag == TradePanelType.WorldTrade);
    }

    public SendSerchViewByThingType(QueryType: SQueryType, QueryArgs: SQueryArgs, PageIndex: number, PageSize: number, OrderType: string) {
        if (this.tag != TradePanelType.WorldTrade) {
            let data = {
                type: MsgTypeSend.ExchangesQueryView,
                data: {
                    query_type: QueryType,
                    query_args: QueryArgs,
                    page_index: PageIndex,
                    page_size: PageSize,
                    order_type: OrderType,
                }
            }
            Session.Send(data)
        } else {
            let data = {
                type: MsgTypeSend.CrossExchangesQueryView,
                data: {
                    query_type: QueryType,
                    query_args: QueryArgs,
                    page_index: PageIndex,
                    page_size: PageSize,
                }
            }
            Session.Send(data)
        }
    }

    private onHelpBtn() {
        Tips2.Show(Tips2ID.Trade);
    }

    private onHelpBtn2() {
        Tips3.Show(1);
    }

    public updateItemData(data) {
        let datas = [];
        if (this.tag == TradePanelType.WorldTrade) {
            datas = data.order_list ? PlayerData.getCrossOrderListData(data.order_list) : [];
        } else {
            datas = data.order_list ? PlayerData.getOrderListData(data.order_list) : [];
        }
        this.noneListCont.active = false;
        if (!datas || datas.length == 0) {
            this.noneListCont.active = true;
        }
        this.scrollItem.UpdateDatas(datas);
        //    this.scheduleOnce(()=>{
        //        thisObj.scrollItem.ScrollToHead();
        //    }, 0.01)
    }


    /**打开列表 */
    private onOpenComboxItem() {
        this.combox_open.active = false;
        this.combox_close.active = true;
        this.combox_item_bg.active = true;
    }

    /**隐藏列表 */
    private onCloseComboxItem() {
        this.combox_open.active = true;
        this.combox_close.active = false;
        this.combox_item_bg.active = false;
    }

    //初始化筛选列表数据
    private initSortListData() {
        //获取商品种类
        this.content.removeAllChildren();
        let all_tag = [1, 2, 3];
        let all_tag_name = ["道具", "角色", "资源"];
        let all_tag_data = []
        for (let index = 0; index < all_tag.length; index++) {
            let bourseData: Bourse[] = CfgMgr.GetTradeAllCfgData(all_tag[index]);
            let data = {
                tag: all_tag[index],
                tagData: bourseData,
                tagName: all_tag_name[index]
            }
            all_tag_data.push(data);
            let item = instantiate(this.combox_item1);
            item.name = "item" + index;
            item.setPosition(0, 0);
            item["bourseData"] = bourseData;
            item["sort_type"] = all_tag[index];
            item.getChildByPath("layout/input/label").getComponent(Label).string = all_tag_name[index];
            item.off(Input.EventType.TOUCH_END, this.openOneTag.bind(this), this)
            item.on(Input.EventType.TOUCH_END, this.openOneTag.bind(this), this)
            this.content.addChild(item);
        }
    }

    //打开1级列表
    private openOneTag(e: EventTouch) {
        let item: Node = e.target;
        this.closeGroupList(item);
        this.TimeLock = 0;
        this.selectType = item.getSiblingIndex();
        let content = item.getChildByPath("layout/content")
        //选中后修改展示数据
        this.onSetScrollItemData(this.selectType);
        if (content.children.length > 0) {
            content.removeAllChildren();
            item.children.forEach(element => {
                element.getComponent(Layout).updateLayout(true);
            }) 
            return
        }
        content.removeAllChildren();
        //设置选中标题
        this.item_name.string = item.getChildByPath("layout/input/label").getComponent(Label).string;
        
        let bourseData: Bourse[] = item["bourseData"];
        //根据物品的类别细分到不同的组
        let group_id = [];
        let group_list_data: Bourse[][] = [];
        //一级页签下未分组的物品 加到最后
        let no_group_list_data: Bourse[] = []
        for (let index = 0; index < bourseData.length; index++) {
            const element = bourseData[index];
            if (group_id.length > 0) {
                if (element.Group != 0) {
                    let i = group_id.indexOf(element.Group);
                    if (i == -1) {
                        group_id.push(element.Group)
                        group_list_data.push([])
                        group_list_data[group_id.length - 1].push(element)
                    } else {
                        group_list_data[i].push(element)
                    }
                } else {
                    no_group_list_data.push(element)
                }
            } else {
                if (element.Group != 0) {
                    group_id.push(element.Group)
                    group_list_data.push([])
                    group_list_data[group_id.length - 1].push(element)
                } else {
                    no_group_list_data.push(element)
                }
            }
        }
        if (no_group_list_data.length > 0) {
            group_list_data.push(no_group_list_data)
        }

        for (let index = 0; index < group_list_data.length; index++) {
            const element = group_list_data[index];
            if (element[0].Group == 0) {
                for (let index = 0; index < element.length; index++) {
                    const item3 = element[index];
                    let tag_item3 = instantiate(this.item_3);
                    tag_item3.name = "item3" + index;
                    tag_item3.setPosition(0, 0);
                    tag_item3["bourseData3"] = item3;
                    tag_item3.getChildByName("item_name").getComponent(Label).string = item3.Name;
                    tag_item3.getChildByPath("item_select/item_name").getComponent(Label).string = item3.Name;
                    tag_item3.off(Input.EventType.TOUCH_END, this.setectItemName.bind(this), this);
                    tag_item3.on(Input.EventType.TOUCH_END, this.setectItemName.bind(this), this);
                    content.addChild(tag_item3);
                }
            } else {
                let tag_item2 = instantiate(this.combox_item2);
                tag_item2.name = "item2" + index;
                tag_item2.setPosition(0, 0);
                tag_item2["bourseData2"] = element;
                tag_item2.getChildByPath("layout/input/frame/label").getComponent(Label).string = element[0].GroupName;
                tag_item2.getChildByPath("layout/input/frame_select/label").getComponent(Label).string = element[0].GroupName;
                let callBack = (item) => {
                    console.log(this.is_can_change)
                    if (element[0].WaresType == 1 && !this.is_can_change) {
                        return MsgPanel.Show("点击过快");
                    }
                    this.openTwoTag(item);
                }
                tag_item2.off(Input.EventType.TOUCH_END, callBack, this);
                tag_item2.on(Input.EventType.TOUCH_END, callBack, this);
                content.addChild(tag_item2);
            }
        }
        item.children.forEach(element => {
            element.getComponent(Layout).updateLayout(true);
        });
    }

    //打开2级列表
    private openTwoTag(e: EventTouch) {
        let item = e.target;
        this.closeGroupList(item, 2);
        this.TimeLock = 0;
        let content = item.getChildByPath("layout/content")
        let bourseData: Bourse[] = item["bourseData2"];
        this.setectItemListName(bourseData);
        if (content.children.length > 0) {
            content.removeAllChildren();
            item.children.forEach(element => {
                element.getComponent(Layout).updateLayout(true);
            })
            return
        }
        content.removeAllChildren();
        for (let index = 0; index < bourseData.length; index++) {
            const element = bourseData[index];
            let tag_item3 = instantiate(this.item_3);
            tag_item3.setPosition(0, 0);
            tag_item3["bourseData3"] = element;
            tag_item3.getChildByName("item_name").getComponent(Label).string = element.Name;
            tag_item3.getChildByPath("item_select/item_name").getComponent(Label).string = element.Name;
            let callBack = (item) => {
                console.log(this.is_can_change)
                if (element.WaresType == 1 && !this.is_can_change) {
                    return MsgPanel.Show("点击过快");
                }
                this.setectItemName(item);
            }
            tag_item3.off(Input.EventType.TOUCH_END, callBack, this);
            tag_item3.on(Input.EventType.TOUCH_END, callBack, this);
            content.addChild(tag_item3);
        }
        console.log(content.children, content.children.length)
        item.children.forEach(element => {
            element.getComponent(Layout).updateLayout(true);
        });
    }

    /**选中某个物品 */
    private setectItemName(e: EventTouch) {
        this.TimeLock = 0;
        let item = e.target;
        item.parent.parent.getChildByPath("input/frame_select").active = false;
        let content = item.parent.children;
        for (let index = 0; index < content.length; index++) {
            const element = content[index];
            let _combox_item2 = element.getChildByPath("layout/input/frame_select");
            if (_combox_item2) {
                element.getChildByPath("layout/input/frame_select").active = false;
                this.closeTag(element)
            } else {
                element.getChildByName("item_select").active = false;
            }
        }

        let cur_combox_item2 = item.getChildByPath("layout/input/frame_select");
        if (cur_combox_item2) {
            item.getChildByPath("layout/input/frame_select").active = true;
        } else {
            item.getChildByName("item_select").active = true;
        }
        let bourseData: Bourse = item["bourseData3"];
        let ids = [];
        let str = ""
        let QArgs: SQueryArgs = {};
        let type = SQueryType.ThingType
        if (this.selectType == 2) {
            type = SQueryType.ThingType;
            switch (bourseData.ItemId) {
                case 1:
                    str = "wood";
                    break;
                case 2:
                    str = "water";
                    break;
                case 3:
                    str = "rock";
                    break;
                case 4:
                    str = "seed";
                    break;
                default:
                    break;
            }
            QArgs.thing_res = str;
        } else if (this.selectType == 1) {
            type = SQueryType.RoleType;
            let quality_id = CfgMgr.GetSelectionDataByRoleType(bourseData.Roletype, 5)
            if (quality_id) {
                ids.push(quality_id.EnumerateID);
            }
            let occupation = CfgMgr.GetSelectionDataByRoleType(bourseData.Rolequality, 2);
            if (occupation) {
                ids.push(occupation.EnumerateID);
            }
            console.log("筛选角色", ids)
            QArgs.role_selection = ids;
        } else {//筛选道具
            type = SQueryType.ItemType;
            ids.push(bourseData.ItemId);
            QArgs.item_selection = ids;
        }

        if (ids.length > 0 || str != "") {//筛选或者排序有已选项，发送查询协议
            console.log(`发送协议查询！选中某个物品`, QArgs);
            this.SendSortOrSerch(1, type, QArgs);
        }

    }

    //收起列表
    private closeTag(node) {
        let item: Node = node;
        let content = item.getChildByPath("layout/content")
        content.removeAllChildren();
    }

    /**关闭同组下的其它列表 */
    private closeGroupList(item: Node, tag?: number) {
        if (tag == 2) {
            //该组的上级标签置灰
            item.parent.parent.getChildByPath("input/frame_select").active = false;
        }
        //关闭同组下的其它列表
        let item_content = item.parent.children
        for (let index = 0; index < item_content.length; index++) {
            const element = item_content[index];
            let _combox_item2 = element.getChildByPath("layout/input/frame_select");
            if (_combox_item2) {
                element.getChildByPath("layout/input/frame_select").active = false;
                if (element.name != item.name) {
                    this.closeTag(element)
                }
            } else {
                element.getChildByName("item_select").active = false;
            }

        }
        //点亮当前标签页
        let cur_combox_item = item.getChildByPath("layout/input/frame_select");
        if (cur_combox_item) {
            item.getChildByPath("layout/input/frame_select").active = true;
        } else {
            item.getChildByName("item_select").active = true;
        }
    }


    /**选中某组物品 */
    private setectItemListName(data: Bourse[]) {
        this.TimeLock = 0;
        let bourseData: Bourse[] = data;
        let ids = []
        let QArgs: SQueryArgs = {};
        let type = SQueryType.ThingType
        if (this.selectType != 0) {
            type = SQueryType.RoleType;
            let occupation = bourseData[0].Group - 20;
            ids.push(occupation);
            QArgs.role_selection = ids;

        } else {//筛选道具
            type = SQueryType.ItemType;
            for (let index = 0; index < bourseData.length; index++) {
                const element = bourseData[index];
                ids.push(element.ItemId);
            }
            QArgs.item_selection = ids;
        }

        if (ids.length > 0) {//筛选或者排序有已选项，发送查询协议
            console.log(`发送协议查询！选中某组物品`, QArgs);
            this.SendSortOrSerch(1, type, QArgs);
        }

    }

    private onEditBegan() {
        //编辑时文本会发生偏移在输入时刷新一次对齐
        this.serch.children.forEach((node) => {
            if (node.getComponent(Widget)) {
                node.getComponent(Widget).updateAlignment();
            }
        })
    }

    /**搜索栏事件 */
    private onEditEnd() {
        if (this.serch.getComponentInChildren(EditBox).string) {
            let ids = []
            let QArgs: SQueryArgs = {};
            let type = SQueryType.ThingType
            let str = this.serch.getComponentInChildren(EditBox).string;
            let cfg: Bourse[] = CfgMgr.Get("bourse")
            for (const iterator of cfg) {
                if (iterator.Name == str) {
                    if (iterator.WaresType != 1) {
                        Tips.Show("请输入有效字符")
                    } else {
                        ids.push(iterator.ItemId);
                        type = SQueryType.ItemType
                        QArgs.item_selection = ids;
                        QArgs.init = 1;
                        this.SendSortOrSerch(1, type, QArgs);
                    }
                    this.serch.getComponentInChildren(EditBox).string = ``;
                    return;
                }
            }
        }
        if (this.serch.getComponentInChildren(EditBox).string) {
            let data = {
                "type": MsgTypeSend.ExchangesQueryViewIDList,
                "data": {
                    view_id_list: [
                        this.serch.getComponentInChildren(EditBox).string
                    ]
                }
            }
            Session.Send(data);
            this.serch.getComponentInChildren(EditBox).string = "";
            this.ResetCopyCode();
            this.AllCloseList();
        }
    }

    /**关闭所有的标签列表 */
    private AllCloseList() {
        for (let index = 0; index < this.content.children.length; index++) {
            this.closeTag(this.content.children[index])
        }
        this.onCloseComboxItem();
        this.item_name.string = "道具";
    }

    protected update(dt: number): void {
        if (!this.is_can_change) {
            this.time += dt;
            if (this.time >= 2) {
                this.is_can_change = true;
                this.time = 0;
            }
        }
    }

}