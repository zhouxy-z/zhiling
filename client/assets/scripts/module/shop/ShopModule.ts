import { DEV, IOS } from "cc/env";
import { EventMgr, Evt_ShopLuckyGet, Evt_ShopUpdate } from "../../manager/EventMgr";
import { MsgTypeRet, MsgTypeSend } from "../../MsgType";
import { Session } from "../../net/Session";
import { Api_Bind_Gem, Api_Gem_Exchange, Api_Open_Url, CallApp, CheckGemInstalled, Check_Gem_Installed, CopyToClip } from "../../Platform";
import { BeforeGameUtils } from "../../utils/BeforeGameUtils";
import { MsgPanel } from "../common/MsgPanel";
import { RewardTips } from "../common/RewardTips";
import PlayerData, { } from "../roleModule/PlayerData"
import { SShopIndexContent, SThings } from "../roleModule/PlayerStruct";
import { Tips } from "../login/Tips";
import { GameSet } from "../GameSet";
import LocalStorage from "../../utils/LocalStorage";
import { Second } from "../../utils/Utils";

/**错误码类型*/
export enum ShopErrorCodeType {
    ErrorShopInvalidShopIndexID = 100, // 无效的商店索引ID
    ErrorShopInvalidShopIndexType = 101, // 无效的商店类型
    ErrorShopInvalidShopNotFindItem = 102, // 无效的商店道具
    ErrorShopInvalidShopInsufficientBuyCount = 103, // 无效的商店购买数量
    ErrorShopShopLuckyFrequencyMax = 104, // 已到达商店抽奖次数上限
    ErrorShopBuyItemHasExpired = 105, // 道具已过期
    ErrorShopConsumeItemFailed = 106, // 消耗道具失败
    ErrorShopCanNotManualRefresh = 107, // 不允许手动刷新的商店
    ErrorShopHasExpired = 108, // 商店已过期
    ErrorShopBuyPaymentCallFailed = 120,//支付调用失败
    ErrorShopBuyPaymentCallSuccess = 121,//
    ErrorShopBuyPaymentFailed = 122,//支付失败
    ErrorShopNotOpen = 123,//商城未开启
    ErrorShopBuyPending = 124,//有支付中的订单
    ErrorShopShopLuckyGlobalFrequencyMax = 126,
    ErrorshopInvalidshopInsufficientGlobalBuyCount = 127,
    ErrorshopIsNotOpenCantBuy = 128,
}
export class ShopModule {
    private errorStr: { [key: string]: string } = BeforeGameUtils.toHashMapObj(
        ShopErrorCodeType.ErrorShopInvalidShopIndexID, "无效的商店索引ID",
        ShopErrorCodeType.ErrorShopInvalidShopIndexType, "无效的商店类型",
        ShopErrorCodeType.ErrorShopInvalidShopNotFindItem, "无效的商店道具",
        ShopErrorCodeType.ErrorShopInvalidShopInsufficientBuyCount, "无效的商店兑换数量",
        ShopErrorCodeType.ErrorShopShopLuckyFrequencyMax, "已到达商店抽奖次数上限",
        ShopErrorCodeType.ErrorShopBuyItemHasExpired, "道具已过期",
        ShopErrorCodeType.ErrorShopConsumeItemFailed, "消耗道具失败",
        ShopErrorCodeType.ErrorShopCanNotManualRefresh, "不允许手动刷新的商店",
        ShopErrorCodeType.ErrorShopHasExpired, "商店已过期",
        ShopErrorCodeType.ErrorShopBuyPaymentCallFailed, "支付调用失败",
        ShopErrorCodeType.ErrorShopBuyPaymentFailed, "支付失败",
        ShopErrorCodeType.ErrorShopNotOpen, "商城未开启",
        ShopErrorCodeType.ErrorShopBuyPending, "有支付中的订单",
        ShopErrorCodeType.ErrorShopShopLuckyGlobalFrequencyMax, "已到达商店抽奖全局次数上限",
        ShopErrorCodeType.ErrorshopInvalidshopInsufficientGlobalBuyCount, "己到达全局购买次数上限",
        ShopErrorCodeType.ErrorshopIsNotOpenCantBuy, "商店未到购买时间，暂不能购买",
    );

    constructor() {
        Session.on(MsgTypeRet.ShopGetIndexRet, this.onShopGetIndexRet, this);
        Session.on(MsgTypeRet.ShopBuyItemRet, this.onShopBuyItemRet, this);
        Session.on(MsgTypeRet.ShopManualRefreshRet, this.onShopRefreshRet, this);
        Session.on(MsgTypeRet.ShopDoLuckyRet, this.onShopDoLotteryRet, this);
        Session.on(MsgTypeRet.ShopConvertLuckyItemRet, this.onShopConvertLotteryItemRet, this);
        Session.on(MsgTypeRet.ChaowanPayInfoPush, this.onChaowanPayInfoPush, this);
        Session.on(MsgTypeRet.ShopBuyWithPaymentSuccess, this.onShopGetIndexRet, this);
        Session.on(MsgTypeRet.UserAuthRet, this.onSign, this);
        Session.on(MsgTypeRet.WithdrawRet, this.onWithdrawRet, this);//提现结果

        EventMgr.on("gem_exchange", data => {
            if (IOS) {
                if (data.result == 1 || data.result == 2) {
                    Session.Send({ type: "77_PaymentClose", data: { order_no: data.orderNo } });
                } else if (GameSet.globalCfg?.debug || DEV) {
                    Session.Send({ type: "77_PaymentConfirm", data: { order_no: data.orderNo } });
                }
            } else {
                if (data.code == 51801 || data.code == 51802) {
                    Session.Send({ type: "77_PaymentClose", data: { order_no: data.orderNo } });
                } else if (GameSet.globalCfg?.debug || DEV) {
                    Session.Send({ type: "77_PaymentConfirm", data: { order_no: data.orderNo } });
                }
            }
            LocalStorage.SetNumber(MsgTypeRet.ChaowanPayInfoPush, 0);
        });
    }
    onSign(data) {
        console.log("signRet", data.signRes);
        if (!IOS && !CheckGemInstalled()) {
            let self = this;
            CallApp({ api: Check_Gem_Installed }, result => {
                if (result) {
                    self.onSign(data);
                } else {
                    Tips.Show("请先安装宝石app，是否跳转安装页面？", () => {
                        CallApp({ api: Api_Open_Url, url: "https://h5.lucklyworld.com/download.html?_v=v15&isOpenByBrowser=1" });
                    }, () => { });
                }
            });
            return;
        }
        CallApp({ api: Api_Bind_Gem, clientInfo: data.signRes });
    }
    /**提现结果 */
    onWithdrawRet(data) {
        Tips.Show("宝石提取中，请于世界宝石APP查看提取结果");
    }
    onShopGetIndexRet(data: { code: number, shop_index_content: SShopIndexContent[] }): void {
        if (data.code) {
            this.showErrorCode(data.code);
            return;
        }
        PlayerData.SetShopData(data.shop_index_content);
        EventMgr.emit(Evt_ShopUpdate);
    }
    onShopBuyItemRet(data: { code: number, new_things: SThings, shop_index_content: SShopIndexContent }): void {
        if (data.code) {
            this.showErrorCode(data.code);
            return;
        }
        PlayerData.SetShopData([data.shop_index_content]);
        EventMgr.emit(Evt_ShopUpdate);
        if (data.new_things && data.new_things.data && data.new_things.data.length) {
            RewardTips.Show(data.new_things.data);
        }
    }
    onShopRefreshRet(data: { code: number, shop_index_content: SShopIndexContent }): void {
        if (data.code) {
            this.showErrorCode(data.code);
            return;
        }
        PlayerData.SetShopData([data.shop_index_content]);
        EventMgr.emit(Evt_ShopUpdate);
    }
    onShopDoLotteryRet(data: { code: number, new_things: SThings, shop_index_content: SShopIndexContent }): void {
        if (data.code) {
            this.showErrorCode(data.code);
            return;
        }
        PlayerData.SetShopData([data.shop_index_content]);
        EventMgr.emit(Evt_ShopUpdate);
        if (data.new_things && data.new_things.data && data.new_things.data.length) {
            EventMgr.emit(Evt_ShopLuckyGet, data.new_things.data, data.shop_index_content.lucky.lucky_id);

        }
    }
    onShopConvertLotteryItemRet(data: { code: number, new_things: SThings }): void {
        if (data.code) {
            this.showErrorCode(data.code);
            return;
        }
        EventMgr.emit(Evt_ShopUpdate);
        if (data.new_things && data.new_things.data && data.new_things.data.length) {
            RewardTips.Show(data.new_things.data);
        }
    }
    async onChaowanPayInfoPush(data: PaymentRecordVo) {
        if (!IOS && !CheckGemInstalled()) {
            let self = this;
            CallApp({ api: Check_Gem_Installed }, result => {
                if (result) {
                    self.onChaowanPayInfoPush(data);
                } else {
                    CopyToClip("https://h5.lucklyworld.com/download.html?_v=v15&isOpenByBrowser=1");
                    Tips.Show("已复制宝石app下载链接，是否直接跳转安装页面？", () => {
                        CallApp({ api: Api_Open_Url, url: "https://h5.lucklyworld.com/download.html?_v=v15&isOpenByBrowser=1" });
                    }, () => { });
                }
            });
            return;
        }
        CallApp({ api: Api_Gem_Exchange, credential: data.chaowan_reqs, outTradeNo: data.order_no });
        LocalStorage.SetNumber(MsgTypeRet.ChaowanPayInfoPush, data.time_expires);
        await Second(data.time_expires - data.time_created);
        if (LocalStorage.GetNumber(MsgTypeRet.ChaowanPayInfoPush)) Tips.Show("订单已过期,请重新下单。");
    }
    private showErrorCode(code: number): void {
        let errorStr: string = this.errorStr[code];
        if (errorStr) {
            MsgPanel.Show(errorStr);
        }
    }
}

type PaymentRecordVo = {
    version: number;  // 版本
    goods_id: string; // 支付道具ID（交易行挂单ID）
    goods_extra_info: string;
    order_type: string;
    order_no: string;
    order: any;
    player_id: string;
    status: string;       // 支付状态
    time_created: number; // 创建时间
    time_expires: number; // 过期时间
    chaowan_reqs: string;
}