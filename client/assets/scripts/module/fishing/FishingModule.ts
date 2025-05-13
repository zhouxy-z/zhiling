import { MessagId, ThingType } from "../../manager/CfgMgr";
import { EventMgr, Evt_FishBombDataUpdate, Evt_FishBombLogDataUpdate, Evt_FishConvertItemUpdate, Evt_FishDataUpdate, Evt_FishEquipUpdate, Evt_FishHeroActive, Evt_FishItemUpdate, Evt_FishLogDataUpdate, Evt_FishRankUpdate, Evt_FishShopDataUpdate, Evt_FishTradeDataUpdate, Evt_FishTradeLogDataUpdate, Evt_FishTradeRankUpdate, Evt_FlipGrandPrize, Evt_FlipGrandPrizeLog, Evt_FlipGrandPrizeTake, Evt_FlipInitData, Evt_FlipRankUpdate, Evt_SellFishUpdate} from "../../manager/EventMgr";
import { MsgTypeRet, MsgTypeSend } from "../../MsgType";
import { Session } from "../../net/Session";
import { BeforeGameUtils } from "../../utils/BeforeGameUtils";
import { ItemUtil } from "../../utils/ItemUtils";
import TimerMgr from "../../utils/TimerMgr";
import { formatNumber } from "../../utils/Utils";
import { MsgPanel } from "../common/MsgPanel";
import { RewardTips } from "../common/RewardTips";
import PlayerData from "../roleModule/PlayerData"
 import {SFishingTradePlayerSettlementRecordData,SFishingTradeRoundSettlementRecordData,SFishingItem,SFishingLogData,SFishingRankQueryRet,SFishingSettlementData,SFishingShopGetContentRet,SFishingStateData,SFishingTradeStateData,SPlayerDataItem,SThing,SFishingHeroData,SFishingHeroSkillEffect,SFishingMatchInfoRet, SFishingBombStateData, SFishBombLogDataRet, SFlipData, SFlipGrandPrizeData, SFlipGetPrizeData, SFlipPrizeLogData, SFishingTradeRankPlayerInfoData, SFlipRankPlayerInfoData} from "../roleModule/PlayerStruct";
/**错误码类型*/
export enum FishErrorCodeType {
    FishingErrorRoundNotOpen            = 100, // 回合未开启
	FishingErrorInvalidLakeID           = 101, //  无效的湖泊ID
	FishingErrorRoundStateError         = 102, //  回合状态错误
	FishingErrorNotSelectLake           = 103, //  未选择湖泊
	FishingErrorConvertMount            = 104, //  无效的兑换数量
	FishingErrorInsufficientCurrency    = 105, //  彩虹币不足
	FishingErrorInsufficientFatigue     = 106, //  疲劳值不足
	FishingErrorCostExceedingRoundLimit = 107, // 投入超出回合限制
	FishingErrorCostExceedingDailyLimit = 108, // 投入超出每日限制
	FishingErrorBadArg                  = 109, // 参数错误
    FishingErrorFishBagMax              = 110, // 鱼类背包已满
	FishingErrorNoCost                  = 111, // 未投入任何鱼饵
	FishingErrorFishItemNotFound        = 112, // 鱼类商品未找到
	FishingErrorShopItemNotFound        = 113, // 商店商品未找到
	FishingErrorShopItemInvalidBuyCount = 114, // 无效的购买数量
	FishingErrorInsufficientScore       = 115, // 钓鱼积分不足
    FishingErrorLevelNotEnough          = 116, // 等级不足
    FishingErrorHeroIsMaxLevel          = 117, // 英雄已满级
	FishingErrorHeroIsLocked            = 118, // 英雄未解锁
	FishingErrorHeroActivateTimeMax     = 119, // 英雄激活时间已达上限
}
/**运鱼错误码类型*/
export enum FishTradeErrorCodeType {
    FishingTradeErrorInsufficientFatigue     = 500, // 运鱼疲劳值不足
	FishingTradeErrorCostExceedingDailyLimit = 501, // 消耗超过每日限制
	FishingTradeErrorCostExceedingRoundLimit = 502,// 消耗超过每回合限制
	FishingTradeErrorRoundNotOpen            = 503, // 回合未开启
	FishingTradeErrorRoundStateError         = 504, // 回合状态错误
	FishingTradeErrorInvalidShipID           = 505, // 无效的船只ID
	FishingTradeErrorNotSelectShip           = 506, // 未选择船只
    FishingTradeErrorRoundIsSettlement       = 507, // 状体错误,已经结算
	FishingTradeErrorRoundIsDeparture        = 509, // 状体错误,已经出发
    FishingTradeErrorSoonDeparture           = 510 // 即将出发，不可投入
}
/**炸鱼错误码类型*/
export enum FishBombErrorCodeType {
    FishingBombErrorInsufficientFatigue     = 600, // 运鱼疲劳值不足
    FishingBombErrorCostExceedingDailyLimit = 601, // 消耗超过每日限制
    FishingBombErrorCostExceedingRoundLimit = 602, // 消耗超过每回合限制
    FishingBombErrorRoundNotOpen            = 603, // 回合未开启
    FishingBombErrorRoundStateError         = 604, // 回合状态错误
    FishingBombErrorInvalidFishPoolID       = 605, // 无效的池塘ID
    FishingBombErrorNotSelectFishPool       = 606, // 未选择池塘
    FishingBombErrorRoundIsSettlement       = 607, // 状体错误,已经结算
    FishingBombErrorRoundIsDeparture        = 609, // 状体错误,已经出发
    FishingBombErrorSoonIgnite              = 610, // 即将引燃，不可投入
    FishingBombErrorCostExceedingStageLimit = 611, // 消耗超过每回合阶段限制
    FishingBombErrorEliminated              = 612, // 已被淘汰, 无法参与
	FishingBombErrorNotJoinFirstStage       = 613, // 未从开始阶段参与游戏
	FishingBombErrorLevelNotEnough          = 614, // 等级不足
	FishingBombErrorNotJoinBeforeStage      = 615, // 需在第二回合使用过更多炸弹
    FishingBombErrorNotWinCantContinue      = 616, // 未赢得游戏, 无法继续
	FishingBombErrorNotJoinCantClaimReward  = 617, // 未加入游戏, 无法领取奖励
	FishingBombErrorContinueRoundCantLoad   = 618, // 继续的回合无法加注
	FishingBombErrorMaxContinueRound        = 619, // 已到达最大继续回合次数，无法继续游戏
	FishingBombErrorNextRoundNotOpen        = 620, // 无下回合游戏，请等待下活动开启时间
    FishingBombQueryTypeRound       = 0, // 回合记录
    FishingBombQueryTypePlayerRound = 1, // 玩家回合记录
}
/**翻牌错误码类型*/
export enum FlipErrorCodeType {
    FlipErrorInsufficientRewardsAvailable     = 700, // 可领取奖励不足
    FlipErrorInsufficientFatigue = 701, // 疲劳值不足
    FlipErrorCostExceedingDailyLimit = 702, // 超过每日限制
    FilpErrorFishBagMax = 703,//鱼库已满
    FlipErrorBombErrorLevelNotEnough = 704, // 等级不足
	FlipErrorGameNotOpen = 705, // 游戏未开启
}
export class FishingModule{
    private errorStr:{[key: string]: string} = BeforeGameUtils.toHashMapObj(
        FishErrorCodeType.FishingErrorRoundNotOpen, "回合未开启",
        FishErrorCodeType.FishingErrorInvalidLakeID, "无效的湖泊ID",
        FishErrorCodeType.FishingErrorRoundStateError, "回合状态错误",
        FishErrorCodeType.FishingErrorNotSelectLake, "未选择湖泊",
        FishErrorCodeType.FishingErrorConvertMount, "无效的兑换数量",
        FishErrorCodeType.FishingErrorInsufficientCurrency, "彩虹币不足",
        FishErrorCodeType.FishingErrorInsufficientFatigue, "疲劳值不足",
        FishErrorCodeType.FishingErrorCostExceedingRoundLimit, "投入超出回合限制",
        FishErrorCodeType.FishingErrorCostExceedingDailyLimit, "投入超出每日限制",
        FishErrorCodeType.FishingErrorBadArg, "参数错误",
        FishErrorCodeType.FishingErrorFishBagMax, "鱼类背包已满",
        FishErrorCodeType.FishingErrorNoCost, "未投入任何鱼饵",
        FishErrorCodeType.FishingErrorFishItemNotFound, "鱼类道具未找到",
        FishErrorCodeType.FishingErrorShopItemNotFound, "商店道具未找到",
        FishErrorCodeType.FishingErrorShopItemInvalidBuyCount, "无效的购买数量",
        FishErrorCodeType.FishingErrorInsufficientScore, "钓鱼积分不足",
        FishErrorCodeType.FishingErrorLevelNotEnough, "等级不足",
        FishErrorCodeType.FishingErrorHeroIsMaxLevel,"英雄已满级",
        FishErrorCodeType.FishingErrorHeroIsLocked,"英雄未解锁",
        FishErrorCodeType.FishingErrorHeroActivateTimeMax,"英雄激活时间已达上限",
        
    );
    private FishTradeErrorStr:{[key: string]: string} = BeforeGameUtils.toHashMapObj(
        FishTradeErrorCodeType.FishingTradeErrorInsufficientFatigue,"体力值不足",
        FishTradeErrorCodeType.FishingTradeErrorCostExceedingDailyLimit,"装船数量超过每日限制",
        FishTradeErrorCodeType.FishingTradeErrorCostExceedingRoundLimit,"装船数量超过回合限制",
        FishTradeErrorCodeType.FishingTradeErrorRoundNotOpen,"回合未开启",
        FishTradeErrorCodeType.FishingTradeErrorRoundStateError,"回合状态错误",
        FishTradeErrorCodeType.FishingTradeErrorInvalidShipID,"飞船无效",
        FishTradeErrorCodeType.FishingTradeErrorNotSelectShip,"未选择飞船",
        FishTradeErrorCodeType.FishingTradeErrorRoundIsSettlement,"回合已结算",
        FishTradeErrorCodeType.FishingTradeErrorRoundIsDeparture,"飞船已出发",
        FishTradeErrorCodeType.FishingTradeErrorRoundIsDeparture,"飞船即将出发不可投入",
    );
    private FishBombErrorStr:{[key: string]: string} = BeforeGameUtils.toHashMapObj(
        FishBombErrorCodeType.FishingBombErrorInsufficientFatigue, "炸鱼疲劳值不足",
        FishBombErrorCodeType.FishingBombErrorCostExceedingDailyLimit, "消耗超过每日限制",
        FishBombErrorCodeType.FishingBombErrorCostExceedingRoundLimit, "消耗超过每回合限制",
        FishBombErrorCodeType.FishingBombErrorRoundNotOpen, "回合未开启",
        FishBombErrorCodeType.FishingBombErrorRoundStateError, " 回合状态错误",
        FishBombErrorCodeType.FishingBombErrorInvalidFishPoolID, "无效的池塘ID",
        FishBombErrorCodeType.FishingBombErrorNotSelectFishPool, "未选择池塘",
        FishBombErrorCodeType.FishingBombErrorRoundIsSettlement, "状态错误,已经结算",
        FishBombErrorCodeType.FishingBombErrorRoundIsDeparture, "状态错误,已经引爆",
        FishBombErrorCodeType.FishingBombErrorSoonIgnite, "即将引燃，不可投入",
        FishBombErrorCodeType.FishingBombErrorCostExceedingStageLimit, "消耗超过每回合阶段限制",
        FishBombErrorCodeType.FishingBombErrorEliminated, "已被淘汰, 无法参与",
        FishBombErrorCodeType.FishingBombErrorNotJoinFirstStage, "未从开始阶段参与游戏",
        FishBombErrorCodeType.FishingBombErrorLevelNotEnough, "等级不足",
        FishBombErrorCodeType.FishingBombErrorNotJoinBeforeStage, "需在上回合使用过炸弹",
        FishBombErrorCodeType.FishingBombErrorNotWinCantContinue, "未赢得游戏, 无法继续",
        FishBombErrorCodeType.FishingBombErrorNotJoinCantClaimReward, "未加入游戏, 无法领取奖励",
        FishBombErrorCodeType.FishingBombErrorContinueRoundCantLoad, "继续的回合无法加注",
        FishBombErrorCodeType.FishingBombErrorMaxContinueRound, "已到达最大继续回合次数，无法继续游戏",
        FishBombErrorCodeType.FishingBombErrorNextRoundNotOpen, "无下回合游戏，请等待下活动开启时间",
        //FishBombErrorCodeType.FishingBombQueryTypeRound       = 0 // 回合记录
        //FishBombErrorCodeType.FishingBombQueryTypePlayerRound = 1 // 玩家回合记录
    );

    private FlipErrorStr:{[key: string]: string} = BeforeGameUtils.toHashMapObj(
        FlipErrorCodeType.FlipErrorInsufficientRewardsAvailable, "可领取奖励不足",
        FlipErrorCodeType.FlipErrorInsufficientFatigue, "疲劳值不足",
        FlipErrorCodeType.FlipErrorCostExceedingDailyLimit, "超过每日限制",
        FlipErrorCodeType.FilpErrorFishBagMax, "鱼库已经满",
        FlipErrorCodeType.FlipErrorBombErrorLevelNotEnough, "生命树等级不足",
        FlipErrorCodeType.FlipErrorGameNotOpen, "活动未开始",
    );
    constructor() {
        Session.on(MsgTypeRet.FishingGetPlayerDataRet, this.onPlayerDataUpdate, this);
        Session.on(MsgTypeRet.FishingRoundPush, this.onRoundDataUpdate, this);
        Session.on(MsgTypeRet.FishingSelectLakeRet, this.onSelectLakeUpdate, this);
        Session.on(MsgTypeRet.FishingRodRet, this.onFishFeedUpdate, this);
        Session.on(MsgTypeRet.FishingRecordQueryRet, this.onLogUpdate, this);
        Session.on(MsgTypeRet.FishingShopGetContentRet, this.onShopUpdate, this);
        Session.on(MsgTypeRet.FishingShopBuyItemRet, this.onShopUpdate, this);
        Session.on(MsgTypeRet.FishingSellFishItemRet, this.onSellFishUpdate, this);
        Session.on(MsgTypeRet.FishingRankQueryRet, this.onRankUpdate, this);
        Session.on(MsgTypeRet.FishingItemPush, this.onFishItemUpdate, this);
        Session.on(MsgTypeRet.FishingConvertItemRet, this.onConvertItem, this);
        Session.on(MsgTypeRet.FishingMatchInfoRet, this.onFishingMatchInfoRet, this);
        Session.on(MsgTypeRet.FishingGetConvertItemRet, this.onFishingGetConvertItemRet, this);

        //运鱼
        
        Session.on(MsgTypeRet.FishingTradeGetDataRet, this.onFishingTradeGetDataRet, this);
        Session.on(MsgTypeRet.FishingTradeSelectShipRet, this.onFishingTradeSelectShipRet, this);
        Session.on(MsgTypeRet.FishingTradeRoundPush, this.onFishingTradeRoundPush, this);
        Session.on(MsgTypeRet.FishingTradeConvertItemRet, this.onFishingTradeConvertItemRet, this);
        Session.on(MsgTypeRet.FishingTradeLoadFishRet, this.onFishingTradeLoadFishRet, this);
        Session.on(MsgTypeRet.FishingTradeRecordQueryRet, this.onFishingTradeRecordQueryRet, this);
        Session.on(MsgTypeRet.FishingTradeRankQueryRet, this.onFishingTradeRankQueryRet, this);

        //钓鱼装备
        Session.on(MsgTypeRet.FishingHeroSelectRet, this.onFishingHeroSelectRet, this);
        Session.on(MsgTypeRet.FishingHeroUpgradeRet, this.onFishingHeroUpgradeRet, this);
        Session.on(MsgTypeRet.FishingHeroActiveRet, this.onFishingHeroActiveRet, this);

        //炸鱼
        Session.on(MsgTypeRet.FishingBombGetDataRet, this.onFishingBombGetDataRet, this);
        Session.on(MsgTypeRet.FishingBombSelectRet, this.onFishingBombSelectRet, this);
        Session.on(MsgTypeRet.FishingBombLoadRet, this.onFishingBombLoadRet, this);
        Session.on(MsgTypeRet.FishingBombRoundPush, this.onFishingBombRoundPush, this);
        Session.on(MsgTypeRet.FishingBombConvertItemRet, this.onFishingBombConvertItemRet, this);
        Session.on(MsgTypeRet.FishingBombRecordQueryRet, this.onFishingBombRecordQueryRet, this);
        Session.on(MsgTypeRet.FishingBombClaimRewardRet, this.onFishingBombClaimRewardRet, this);

        //翻牌
        Session.on(MsgTypeRet.FlipStatusRet, this.onFlipStatusRet, this);
        Session.on(MsgTypeRet.FlipGrandPrizeRet, this.onFlipGrandPrizeRet, this);
        Session.on(MsgTypeRet.FlipGrandPrizeTakeRet, this.onFlipGrandPrizeTakeRet, this);
        Session.on(MsgTypeRet.FlipGetGrandRewardRecordRet, this.onFlipGetGrandRewardRecordRet, this);
        Session.on(MsgTypeRet.FlipRankQueryRet, this.onFlipRankQueryRet, this);
        
    }
    onPlayerDataUpdate(data: {code:number, state: SFishingStateData, fish_items:SFishingItem[], heros:SFishingHeroData[], hero_select:number}):void{
        if(data.code){
            this.showErrorCode(data.code);
            return;
        } 
        PlayerData.fishData = data.state;
        PlayerData.fishItems = data.fish_items;
        PlayerData.fishHeros = data.heros;
        PlayerData.SetFishingHeroId(data.hero_select || 0);
        EventMgr.emit(Evt_FishDataUpdate);
    }
    onRoundDataUpdate(data:{type:number, state: SFishingStateData}):void{
        //console.log("回合数据推送类型---->" + data.type + "----->" + "回合是否开启" + data.state.round_info.is_open + "回合时长--->" + (data.state.round_info.end_time - data.state.round_info.start_time));
        //console.log("回合开始时间---->" + data.state.round_info.start_time + "回合冰封时间---->" + data.state.round_info.frozen_time + "回合结算时间---->" + data.state.round_info.settlement_time + "  回合结束时间----->" + data.state.round_info.end_time);
        //console.log("当前服务器时间---->" + PlayerData.GetServerTime());
        //console.log("kill_type---->" + data.state.round_info.kill_type);
        let oldRound = PlayerData.CurFishRoundInfo;
        if(oldRound && oldRound.round != data.state.round_info.round){
            Session.Send({type: MsgTypeSend.FishingJoin, data:{}});
        }
        PlayerData.fishData = data.state;
        EventMgr.emit(Evt_FishDataUpdate);
    }
    onSelectLakeUpdate(data:{code:number, lake_id:number, state:SFishingStateData}):void{
        if(data.code){
            this.showErrorCode(data.code);
            return;
        } 
        PlayerData.fishData = data.state;
        EventMgr.emit(Evt_FishDataUpdate);
    }
    onFishFeedUpdate(data:{code: number, state: SFishingStateData}):void{
        if(data.code){
            this.showErrorCode(data.code);
            return;
        } 
        PlayerData.fishData = data.state;
        EventMgr.emit(Evt_FishDataUpdate);
    }
    onLogUpdate(data:SFishingLogData):void{
        if(data.code){
            this.showErrorCode(data.code);
            return;
        } 
        EventMgr.emit(Evt_FishLogDataUpdate, data);
    }
    private onShopUpdate(data:SFishingShopGetContentRet):void{
        if(data.code){
            this.showErrorCode(data.code);
            return;
        } 
        PlayerData.fishShop = data;
        //TimerMgr.Register(this.SendShopRefresh, this, data.refresh_time);
        EventMgr.emit(Evt_FishShopDataUpdate);
        if(data.new_item){
            RewardTips.Show([data.new_item]);
        }
    }
    private SendShopRefresh():void{
        Session.Send({type: MsgTypeSend.FishingShopGetContent, data:{}});
    }
   
    private onSellFishUpdate(data:{code:number}):void{
        if(data.code){
            this.showErrorCode(data.code);
            return;
        } 
        EventMgr.emit(Evt_SellFishUpdate, data);
    }
    private onRankUpdate(data:SFishingRankQueryRet):void{
        if(data.code){
            this.showErrorCode(data.code);
            return;
        } 
        EventMgr.emit(Evt_FishRankUpdate, data);
    }
    private onFishItemUpdate(data:{type:string, fish_items:SFishingItem[], source:string}):void{
        //source ----> reward/trade_reward/sell/ trade_load
        if(data.type == "add"){
            PlayerData.FishItemAdd(data.fish_items);
        }else if(data.type == "remove"){
            PlayerData.FishItemRemove(data.fish_items);
            if(data.fish_items && data.fish_items.length){
                let num:number = 0;
                for (let fishItem of data.fish_items) {
                    num += fishItem.weight;
                }
                if(data.source == "sell"){
                    let newItem:SThing = ItemUtil.CreateThing(ThingType.ThingTypeCurrency, 0, num);
                    RewardTips.Show([newItem]);
                    PlayerData.AddChannelMsg(MessagId.Messag_26, formatNumber(num, 2), newItem.resData.name);
                }
                
            }
        }
        EventMgr.emit(Evt_FishItemUpdate, data.type);
        
    }
    private onConvertItem(data:{code:number, convert_items:SPlayerDataItem[], req_count: number, total_count: number}):void{
        if(data.code){
            this.showErrorCode(data.code);
            return;
        }else{
            if(data.convert_items.length){
                MsgPanel.Show("兑换成功");
                PlayerData.fishConvertNum += data.req_count;
                EventMgr.emit(Evt_FishConvertItemUpdate);
            }else{
                MsgPanel.Show("兑换失败");
            }
        } 
    }
    private onFishingMatchInfoRet(data:SFishingMatchInfoRet):void{
        if(data.code){
            this.showErrorCode(data.code);
            return;
        }
        PlayerData.fishingMatch = data;
    }

    private onFishingHeroSelectRet(data:{code:number, hero_id:number}):void{
        if(data.code){
            this.showErrorCode(data.code);
            return;
        }
        PlayerData.SetFishingHeroId(data.hero_id || 0);
    }   

    private onFishingHeroUpgradeRet(data:{code:number, hero_id:number, part_slot_id:number, upgrade_success:boolean, hero:SFishingHeroData, effective_skills:{[key:string]:SFishingHeroSkillEffect}}):void{
        if(data.code){
            this.showErrorCode(data.code);
            return;
        }
        let heroList:SFishingHeroData[] = PlayerData.fishHeros;
        let heroData:SFishingHeroData;
        for (let i = 0; i < heroList.length; i++) {
            heroData = heroList[i];
            if(heroData.id == data.hero_id){
                PlayerData.fishHeros[i] = data.hero;
                break;
            }
        }
        EventMgr.emit(Evt_FishEquipUpdate, data.hero_id, data.part_slot_id, data.upgrade_success);
    }
    private onFishingHeroActiveRet(data:{code:number, hero_id:number, hero:SFishingHeroData}):void{
        if(data.code){
            this.showErrorCode(data.code);
            return;
        }
        let heroList:SFishingHeroData[] = PlayerData.fishHeros;
        let heroData:SFishingHeroData;
        for (let i = 0; i < heroList.length; i++) {
            heroData = heroList[i];
            if(heroData.id == data.hero_id){
                PlayerData.fishHeros[i] = data.hero;
                break;
            }
        }
        EventMgr.emit(Evt_FishHeroActive, data.hero_id);
    }
    private showErrorCode(code:number):void{
        let errorStr:string = this.errorStr[code];
        if(errorStr){
            MsgPanel.Show(errorStr);
        }
    }


    /***********************运鱼 ***********************/
    private onFishingTradeGetDataRet(data:{code:number, state:SFishingTradeStateData, fish_items:SFishingItem[]}):void{
        if(data.code > 0){
            this.showFishTradeErrorCode(data.code);
            return;
        }
        PlayerData.fishTradeData = data.state;
        PlayerData.fishItems = data.fish_items;
        EventMgr.emit(Evt_FishTradeDataUpdate);
    }

    private onFishingTradeSelectShipRet(data:{code:number, state:SFishingTradeStateData}):void{
        if(data.code > 0){
            this.showFishTradeErrorCode(data.code);
            return;
        }
        PlayerData.fishTradeData = data.state;
        EventMgr.emit(Evt_FishTradeDataUpdate);
    }

    private onFishingTradeRoundPush(data:{code:number, type:string, state:SFishingTradeStateData}):void{
        if(data.code > 0){
            this.showFishTradeErrorCode(data.code);
            return;
        }
        //console.log("运鱼回合数据---->" + data.type + "----->" + "回合是否开启" + data.state.round_info.is_open + "回合时长--->" + (data.state.round_info.end_time - data.state.round_info.start_time));
        //console.log("回合开始时间---->" + data.state.round_info.start_time + "回合出发时间---->" + data.state.round_info.departure_time + "回合结算时间---->" + data.state.round_info.settlement_time + "  回合结束时间----->" + data.state.round_info.end_time);
        //console.log("当前服务器时间---->" + PlayerData.GetServerTime());
        //console.log("kill_type---->" + data.state.round_info.kill_type);
        let oldRound = PlayerData.CurFishTradeRoundInfo;
        if(oldRound && oldRound.round != data.state.round_info.round){
            Session.Send({type: MsgTypeSend.FishingTradeJoin, data:{}});
        }
        PlayerData.fishTradeData = data.state;
        EventMgr.emit(Evt_FishTradeDataUpdate);
    }
    private onFishingTradeConvertItemRet(data:{code:number, convert_items:SThing[]}):void{
        if(data.code > 0){
            this.showFishTradeErrorCode(data.code);
            return;
        }
        if(data.convert_items.length){
            MsgPanel.Show("兑换成功");
        }else{
            MsgPanel.Show("兑换失败");
        }
    }
    private onFishingTradeLoadFishRet(data:{code:number, type:string, fish_item_id_list:number[], state:SFishingTradeStateData}):void{
        if(data.code > 0){
            this.showFishTradeErrorCode(data.code);
            return;
        }
        PlayerData.fishTradeData = data.state;
        EventMgr.emit(Evt_FishTradeDataUpdate, data.fish_item_id_list);
    }
    
    private onFishingTradeRecordQueryRet(data:{code:number, query_type:number, round_records:SFishingTradeRoundSettlementRecordData[], player_records:SFishingTradePlayerSettlementRecordData[]}):void{
        if(data.code > 0){
            this.showFishTradeErrorCode(data.code);
            return;
        }
        EventMgr.emit(Evt_FishTradeLogDataUpdate, data.query_type, data.round_records || [], data.player_records || []);
    }

    private onFishingTradeRankQueryRet(data:{code:number, trade_rank:{rank_size: number, self_ranking: number, top_rank_players: SFishingTradeRankPlayerInfoData[]}}): void {
        let rankList: SFishingTradeRankPlayerInfoData[] = [];
        if(data.code > 0){
            this.showFishTradeErrorCode(data.code);
        }
        if (data.trade_rank && data.trade_rank.top_rank_players) {
            rankList = data.trade_rank.top_rank_players;
        }
        EventMgr.emit(Evt_FishTradeRankUpdate, rankList);
    }

    private showFishTradeErrorCode(code:number):void{
        let errorStr:string = this.FishTradeErrorStr[code];
        if(errorStr){
            MsgPanel.Show(errorStr);
        }
    }

    /********* 炸鱼 *********/
    private onFishingBombGetDataRet(data:{code:number, state:SFishingBombStateData}):void{
        if(data.code){
            this.showFishBombErrorCode(data.code);
            return;
        } 
        this.setFishBombData(data.state, "InitData");
        
    }
    private onFishingBombSelectRet(data:{code:number, fish_pool_id:number, state:SFishingBombStateData}):void{
        if(data.code){
            this.showFishBombErrorCode(data.code);
            return;
        } 
        this.setFishBombData(data.state, "PondSelect");
    }
    private onFishingBombLoadRet(data:{code:number, state:SFishingBombStateData}):void{
        if(data.code){
            this.showFishBombErrorCode(data.code);
            return;
        } 
        this.setFishBombData(data.state, "BombLoad");
    }
    private onFishingBombRoundPush(data:{type:string, state:SFishingBombStateData}):void{
        this.setFishBombData(data.state, data.type);
    }
    private onFishingBombConvertItemRet(data:{code:number, convert_items:SPlayerDataItem[]}):void{
        if(data.code){
            this.showFishBombErrorCode(data.code);
            return;
        }else{
            if(data.convert_items.length){
                MsgPanel.Show("兑换成功");
            }else{
                MsgPanel.Show("兑换失败");
            }
        } 
    }
    private onFishingBombRecordQueryRet(data:SFishBombLogDataRet):void{
        if(data.code){
            this.showErrorCode(data.code);
            return;
        } 
        EventMgr.emit(Evt_FishBombLogDataUpdate, data);
    }
    private onFishingBombClaimRewardRet(data:{code:number}):void{
        if(data.code){
            this.showErrorCode(data.code);
            return;
        } 
        //MsgPanel.Show("领取成功");
    }

    private setFishBombData(state:SFishingBombStateData, type:string = null):void{
        //不同回合或者不同阶段请求加入炸鱼玩法
        if(PlayerData.fishBombData && PlayerData.fishBombData.round_info){
            if(PlayerData.fishBombData.round != state.round){
                Session.Send({type: MsgTypeSend.FishingBombJoin, data:{}});
            }else if(PlayerData.fishBombData.round == state.round && state.round_info){
                if(PlayerData.fishBombData.round_info.stage_index != state.round_info.stage_index){
                    Session.Send({type: MsgTypeSend.FishingBombJoin, data:{}});
                }
            }
        }   
       
        PlayerData.fishBombData = state;
        EventMgr.emit(Evt_FishBombDataUpdate, type);
    }

    private showFishBombErrorCode(code:number):void{
        let errorStr:string = this.FishBombErrorStr[code];
        if(errorStr){
            MsgPanel.Show(errorStr);
        }
    }

    private onFishingGetConvertItemRet(data:{code: number, count: number}){
        PlayerData.fishConvertNum = data.count
        EventMgr.emit(Evt_FishConvertItemUpdate);
    }

    private onFlipStatusRet(data:{code: number, state: SFlipData}):void{

        EventMgr.emit(Evt_FlipInitData, data.state);
    }

    private onFlipGrandPrizeRet(data:{code: number, reward_count: number, is_take_reward: boolean, prize_type: number, grand_prize_id:number}):void{
        if(data.code){
            this.showFlipErrorCode(data.code);
            return;
        } 
        let prize: SFlipGrandPrizeData = {
            reward_count: data.reward_count,
            is_take_reward: data.is_take_reward,
            prize_type: data.prize_type,
            grand_prize_id: data.grand_prize_id
        };
        EventMgr.emit(Evt_FlipGrandPrize, prize);
    }

    private onFlipGrandPrizeTakeRet(data:{code: number, reward_count: number, grand_prize_id: number}):void{
        if(data.code){
            this.showFlipErrorCode(data.code);
            return;
        } 
        let prize: SFlipGetPrizeData = {
            reward_count: data.reward_count,
            grand_prize_id: data.grand_prize_id
        };
        EventMgr.emit(Evt_FlipGrandPrizeTake, prize);
    }

    private onFlipGetGrandRewardRecordRet(data:{code: number, records: SFlipPrizeLogData[]}):void{
        if(data.code){
            this.showFlipErrorCode(data.code);
            return;
        } 
        EventMgr.emit(Evt_FlipGrandPrizeLog, data.records||[]);
        
    }

    private onFlipRankQueryRet(data:{code:number, flip_rank:{rank_size: number, self_ranking: number, top_rank_players: SFlipRankPlayerInfoData[]}}): void {
        let rankList: SFlipRankPlayerInfoData[] = [];
        if(data.code > 0){
            this.showFlipErrorCode(data.code);
        }
        if (data.flip_rank && data.flip_rank.top_rank_players) {
            rankList = data.flip_rank.top_rank_players;
        }
        EventMgr.emit(Evt_FlipRankUpdate, rankList);
    }

    private showFlipErrorCode(code:number):void{
        let errorStr:string = this.FlipErrorStr[code];
        if(errorStr){
            MsgPanel.Show(errorStr);
        }
    }
}