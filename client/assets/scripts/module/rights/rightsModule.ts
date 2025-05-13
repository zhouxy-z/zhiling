import { MsgTypeRet } from "../../MsgType";
import { CfgMgr, StdEquityCard, StdEquityList } from "../../manager/CfgMgr";
import { CheckCondition } from "../../manager/ConditionMgr";
import { EventMgr, Evt_RightsGetReward } from "../../manager/EventMgr";
import { Session } from "../../net/Session";
import { ItemUtil } from "../../utils/ItemUtils";
import { MsgPanel } from "../common/MsgPanel";
import { RewardTips } from "../common/RewardTips";
import PlayerData, { } from "../roleModule/PlayerData"
 import {SBenefit,SThing} from "../roleModule/PlayerStruct";
import { RightsGetTips } from "./RightsGetTips";


export class rightsModule {
    constructor() {
        Session.on(MsgTypeRet.BenefitPush, this.onBenefitPush, this);
        Session.on(MsgTypeRet.ClaimBenefitByCardRet, this.onClaimDailyBenefit, this);    
    }

    private onBenefitPush(data:SBenefit){
        data = PlayerData.CorrectionRightsCardTime(data);
        // console.log("权益" ,  data)
        let stdEquityCard:StdEquityCard;
        if(PlayerData.rightsData){
            let oldCard: {[key:number]:number} = PlayerData.rightsData.benefit_card.cards;
            if(data.benefit_card && data.benefit_card.cards){
                for (let key in data.benefit_card.cards) {
                    if(!oldCard[key] || oldCard[key] < data.benefit_card.cards[key]){
                        stdEquityCard = CfgMgr.getEquityCardById(Number(key));
                    }
                }
                
            }
        }
        
        PlayerData.rightsData = data;
        if(!PlayerData.rightsData.benefit_card_can_claim) PlayerData.rightsData.benefit_card_can_claim = {};
        EventMgr.emit(Evt_RightsGetReward);
        if(stdEquityCard && stdEquityCard.GetEquityIcon && stdEquityCard.GetEquityIcon.length){
            RightsGetTips.Show(stdEquityCard);
        }
    }

    private onClaimDailyBenefit(data:{code:number,benefit_card_id:number, pveTimes:number, pvpTimes:number}){
        if(!data || data.code > 0) return;
        if(data && data.pveTimes > 0){
            PlayerData.pveData.times = data.pveTimes;
        }
        if(data && data.benefit_card_id > 0){
            let stdEquityList:StdEquityList[] = CfgMgr.GetEquityList(data.benefit_card_id);
            let typeList:number[] = [];
            let idList:number[] = [];
            let numList:number[] = [];
            let std:StdEquityList;
            for (let index = 0; index < stdEquityList.length; index++) {
                std = stdEquityList[index];
                if(std.Equity_Type == 2){
                    typeList = typeList.concat(std.RewardType);
                    idList = idList.concat(std.RewardID);
                    numList = numList.concat(std.RewardNumber);
                }
                
            }
            let awardDatas:SThing[] = ItemUtil.GetSThingList(typeList, idList, numList);
            if(awardDatas && awardDatas.length > 0){
                RewardTips.Show(awardDatas);
            }else{
                MsgPanel.Show("领取权益成功");
            } 
            EventMgr.emit(Evt_RightsGetReward);
        }
    }
       


}