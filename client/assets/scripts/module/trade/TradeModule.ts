import { MsgTypeRet, MsgTypeSend } from "../../MsgType";
import { Api_Gem_Exchange, CallApp } from "../../Platform";
import { CfgMgr, StdCommonType, ThingType } from "../../manager/CfgMgr";
import { Session } from "../../net/Session";
import { MsgPanel } from "../common/MsgPanel";
import { RewardTips } from "../common/RewardTips";
import { SAllBalances } from "../home/HomeStruct";
import { Tips } from "../login/Tips";
import PlayerData from "../roleModule/PlayerData"
 import {SPlayerDataItem,SPlayerDataRole,SOonViewData,SOrderData,SSerchData,SOrderThings,SThing,SCrossOrderData} from "../roleModule/PlayerStruct";
import { BuyFailPanel } from "./BuyFailPanel";
import { BuyPanel } from "./BuyPanel";
import { RoleMsgPanel } from "./RoleMsgPanel";
import { TradeCreateOrderPanel } from "./TradeCreateOrderPanel";
import { TradePanel } from "./TradePanel";

// "出售订单已满" = 100,
// "订单未开放",
// "不可以兑换自己的订单",
// "仅能取消自己的订单"=103,
// "订单已过期",
// ""= 105,
// "无效的附件内容"=106,
// "订单可用数量不足",
export enum TradeCodeMessag  {
   "trade_123" = "下架失败，订单锁单中",
   "trade_100" = "订单已满",
   "trade_108" = "创建失败",
   "trade_121" = "其它服务器没有账户无法兑换",
   "trade_125" = "有支付未完成的订单请稍后再试",
   "trade_117" = "该订单正在兑换，请选择其他道具",
   "trade_126" = "相关功能已暂停使用！"

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

export class TradeModule {
    constructor() {
        Session.on(MsgTypeRet.ExchangesQueryViewRet, this.onViewRet, this);
        Session.on(MsgTypeRet.ExchangesCancelOrderRet, this.onCanelOrder, this);
        Session.on(MsgTypeRet.ExchangesCreateSellOrderRet, this.onSelllOrder, this);
        Session.on(MsgTypeRet.ExchangesCreateBuyOrderRet, this.onBuyOrder, this);
        Session.on(MsgTypeRet.ExchangesTradeRet, this.onExchangesTradeRet, this)
        Session.on(MsgTypeRet.ExchangesQueryViewIDListRet, this.onSerchRet, this);

        //世界交易所协议返回
        Session.on(MsgTypeRet.CrossExchangesQueryViewRet, this.onViewRet, this);
        Session.on(MsgTypeRet.CrossExchangesCancelOrderRet, this.onCanelOrder, this);
        Session.on(MsgTypeRet.CrossExchangesCreateSellOrderRet, this.onSelllOrder, this);
        Session.on(MsgTypeRet.CrossExchangesTradeRet, this.onCrossExchangesTradeRet, this)
        Session.on(MsgTypeRet.CrossExchangesQueryViewIDListRet, this.onSerchRet, this);
        Session.on(MsgTypeRet.CrossExchangesGetAllBalancesRet, this.onAllBalances, this);
        //支付成功后推送
        Session.on(MsgTypeRet.CrossExchangesChaowanPush, this.onGetBuyOrderRet, this);


    }

    private onViewRet(data: SOonViewData) {
        if (data.code == 0) {//请求数据成功
            PlayerData.tradeViewData = data;
            TradePanel.ins.onGetViewData(data);
        } else {
            if (data.code == 111) {
                MsgPanel.Show("点击速度过快");
            } else {
                MsgPanel.Show(`请求数据错误！`)
            }
        }
    }



    /**下架订单 */
    private onCanelOrder(data: SOonViewData) {
        if (data.code == 0) {//请求数据成功
            Tips.Show(`下架成功！`)
        }else {
            let str = "trade_" + data.code
            if(TradeCodeMessag[str]){
                MsgPanel.Show(TradeCodeMessag[str])
            }else{
                MsgPanel.Show("下架失败")
            }
        }
        TradePanel.ins.SendSessionView();
    }
    private onSelllOrder(data) {
        if (data.code == 0) {
            TradePanel.ins.SendSessionView();
            MsgPanel.Show("道具上架成功")
            this.GetCurrencyList();
        } else{  
            let str = "trade_" + data.code
            if(TradeCodeMessag[str]){
                MsgPanel.Show(TradeCodeMessag[str])
            }else{
                MsgPanel.Show("道具上架失败")
            }
        }
        TradeCreateOrderPanel.Hide();
    }

    private onBuyOrder(data) {
        if (data.code == 0) {
            TradePanel.ins.SendSessionView();
            MsgPanel.Show("求购信息已发出")
            this.GetCurrencyList();
            TradeCreateOrderPanel.Hide();
        }
    }

    private onExchangesTradeRet(reward_data: { code: number, order: SOrderData, payment_things: SOrderThings }) {
        if (reward_data.code == 0) {
            if (reward_data.order.order_type == "sell") {         
                if (reward_data.order.things.data[0].item) {
                    BuyPanel.Hide();
                } else if (reward_data.order.things.data[0].role) {
                    RoleMsgPanel.Hide();
                } else if (reward_data.order.things.data[0].resource) {
                    BuyPanel.Hide();
                }
                MsgPanel.Show("兑换成功，请到邮件领取道具")
            } else {  
                if (reward_data.order.things.data[0].item) {
                    BuyPanel.Hide();
                } else if(reward_data.order.things.data[0].resource) {
                    BuyPanel.Hide();
                } else if(reward_data.order.things.data[0].role) {
                    RoleMsgPanel.Hide();
                }
                MsgPanel.Show("提供成功，请到邮件领取彩")
            }
            
            let list:SOrderData[] = PlayerData.tradeViewData.order_list;
            for (let index = 0; index < list.length; index++) {
                let element = list[index];
                if(element.view_id == reward_data.order.view_id){
                    if(element.order_id != reward_data.order.order_id){
                        element.close_time = reward_data.order.close_time;
                        element.from_order_id = reward_data.order.from_order_id;
                        element.nonce = reward_data.order.nonce;
                        element.open_time = reward_data.order.open_time;
                        element.order_id = reward_data.order.order_id;
                        element.order_type = reward_data.order.order_type;
                        element.player_id = reward_data.order.player_id;
                        element.player_name = reward_data.order.player_name;
                        element.things = reward_data.order.things;
                        element.unit_count = reward_data.order.unit_count;
                        element.unit_step = reward_data.order.unit_step;
                        element.unit_value = reward_data.order.unit_value;
                        element.view_id = reward_data.order.view_id;
                    }else{
                        element.unit_count = 0;
                    }  
                }
            } 
            this.GetCurrencyList();
            TradePanel.ins.updateItemData(PlayerData.tradeViewData)
            // TradePanel.ins.SendSessionView();
        } else if(reward_data.code == 101){  
            BuyFailPanel.Show(reward_data.code);
            TradePanel.ins.SendSessionView();  
        }
        BuyPanel.Hide();
    }

    private onCrossExchangesTradeRet(reward_data: { code: number, order: SCrossOrderData, async_payment:boolean }) {
        
        if (reward_data.code == 0) {      
            if (reward_data.order.order_type == "sell" && !reward_data.async_payment) {         
                BuyPanel.Hide();
                MsgPanel.Show("兑换成功，请到邮件查看")
            }     
            let list:SCrossOrderData[] = PlayerData.tradeViewData.order_list;
            for (let index = 0; index < list.length; index++) {
                let element = list[index];
                if(element.view_id == reward_data.order.view_id){
                    if(reward_data.async_payment){
                        element.is_lock = true;
                    }else{
                        if(element.order_id != reward_data.order.order_id){
                            element.close_time = reward_data.order.close_time;
                            element.from_order_id = reward_data.order.from_order_id;      
                            element.open_time = reward_data.order.open_time;
                            element.order_id = reward_data.order.order_id;
                            element.order_type = reward_data.order.order_type;
                            element.player_id = reward_data.order.player_id;
                            element.player_name = reward_data.order.player_name;
                            element.items = reward_data.order.items;
                            element.group_count = reward_data.order.group_count;
                            element.group_step = reward_data.order.group_step;
                            element.group_value = reward_data.order.group_value;
                            element.view_id = reward_data.order.view_id;
                            element.union_id = reward_data.order.union_id;
                            element.bourse_id = reward_data.order.bourse_id;
                        }else{
                            element.group_count = 0;
                        }  
                    }
                }
            } 
            this.GetCurrencyList();
            TradePanel.ins.updateItemData(PlayerData.tradeViewData)
            // TradePanel.ins.SendSessionView();
        } else if(reward_data.code == 101){  
            BuyFailPanel.Show(reward_data.code);
            TradePanel.ins.SendSessionView();  
        }else {      
            let str = "trade_" + reward_data.code
            if(TradeCodeMessag[str]){
                MsgPanel.Show(TradeCodeMessag[str])
            }else{
                MsgPanel.Show("兑换失败")
            } 
        }
        BuyPanel.Hide();
    }

    private onSerchRet(data: SSerchData) {
        TradePanel.ins.onGetSerchData(data)
    }

    /**交易所货币展示 */
    private onAllBalances(data:{code:number, balances:SAllBalances[], serverid:string, unionid:string}){
        for (let index = 0; index < data.balances.length; index++) {
            const element = data.balances[index];
            if(element.server_id == "jy" ){
                PlayerData.tradeAllBalances.jy = element.currency1;   
            }else if(element.server_id == "hc"){
                PlayerData.tradeAllBalances.hc = element.currency1;
            }
            if(data.serverid == element.server_id){
                PlayerData.tradeAllBalances.score = element.currency_77; 
            }
        }
        
        PlayerData.tradeAllBalances.serverid = data.serverid;
        PlayerData.tradeAllBalances.unionid = data.unionid;

        TradePanel.ins.updateCurrency();
    }

    private onGetBuyOrderRet(data:{order_id:string}): void {
        let list:SCrossOrderData[] = PlayerData.tradeViewData.order_list;
        for (let index = 0; index < list.length; index++) {
            let element = list[index];
            if(element.order_id == data.order_id){
                element.group_count = 0;
                TradePanel.ins.updateItemData(PlayerData.tradeViewData);
                MsgPanel.Show("兑换成功，请到邮件查看")
                this.GetCurrencyList();
                return;
            }
        } 
    }

    private GetCurrencyList(){
        let data = {
            type:MsgTypeSend.CrossExchangesGetAllBalances,
            data:{}
        }
        Session.Send(data);
    }
}