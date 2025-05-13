import { MsgTypeRet, MsgTypeSend } from "../../MsgType";
import { BattleReadyLogic } from "../../battle/Ready/BattleReadyLogic";
import { EventMgr, Evt_BuyPlunderTimes, Evt_LootApplyStateUpdate, Evt_LootGetPlayerBattleData, Evt_LootLastSeasonData, Evt_LootPlayerData, Evt_LootPlunder, Evt_LootPlunderRecord, Evt_LootRankUpdate, Evt_LootSeasonData, Evt_LootShopUpdate, Evt_Matching, Evt_Matching2 } from "../../manager/EventMgr";
import { Session } from "../../net/Session";
import { MsgPanel } from "../common/MsgPanel";
import { RewardTips } from "../common/RewardTips";
import { SLastSeasonInfo, SLootRankInfo } from "../home/HomeStruct";
import { HomeUI } from "../home/panel/HomeUI";
import { Tips } from "../login/Tips";
import PlayerData, {} from "../roleModule/PlayerData"
 import {LootSeasonApplyState,SLootSeasonApplyInfo,SPvpShopGetContentRet} from "../roleModule/PlayerStruct";
import { LootVsPanel } from "./LootVsPanel";

export class LootModule {
    constructor() {
        Session.on(MsgTypeRet.PlunderOpenRet, this.PlunderOpen, this);
        Session.on(MsgTypeRet.GetPlunderOpenStatusRet, this.GetPlunderOpenStatus, this);
        Session.on(MsgTypeRet.GetMatchPlayerDataRet, this.onPlayerData, this);
        Session.on(MsgTypeRet.GetLastSeasonInfoRet, this.onLastSeasonData, this);
        Session.on(MsgTypeRet.GetCurrentSeasonInfoRet, this.onSeasonData, this);
        Session.on(MsgTypeRet.MatchmakingRet, this.onMatchking, this);
        Session.on(MsgTypeRet.GetPlayerBattleDataRet, this.onGetPlayerBattleData, this);
        Session.on(MsgTypeRet.QueryBattlePlunderRecordRet, this.onPlunderRecord, this);
        Session.on(MsgTypeRet.PlunderRet, this.onPlunder, this);
        Session.on(MsgTypeRet.BuyPlunderTimesRet, this.onBuyPlunderTimes, this);
        Session.on(MsgTypeRet.GetRankingListRet, this.onGetRankingList, this);
    }

    /**开启关闭抢夺战返回 */
    private PlunderOpen(data:{open:boolean}){
        //if(PlayerData.LootSeasonApplyInfo) PlayerData.LootSeasonApplyInfo.open = data.open;
        //this.updateApplpState();
        //强求查询赛季报名状态
        if(data && data.open) MsgPanel.Show("报名成功！");
        Session.Send({
            type:MsgTypeSend.GetPlunderOpenStatus,
            data:{}
        });
    }

    /**抢夺战是否开启查询返回 */
    private GetPlunderOpenStatus(data:{currentSeasonId:number, enrolledSeasonId:number, open:boolean}){
        PlayerData.LootSeasonApplyInfo = data;
        this.updateApplpState();
        
    }
    private updateApplpState():void{
        let state:LootSeasonApplyState = LootSeasonApplyState.Type_0;
        let info:SLootSeasonApplyInfo = PlayerData.LootSeasonApplyInfo;
        if(info){
            if(info.currentSeasonId == info.enrolledSeasonId){
                state = info.open ? LootSeasonApplyState.Type_3 : LootSeasonApplyState.Type_1; 
            }else if(info.currentSeasonId > info.enrolledSeasonId){
                state = info.open ? LootSeasonApplyState.Type_4 : LootSeasonApplyState.Type_2; 
            }
        }
    
        EventMgr.emit(Evt_LootApplyStateUpdate, state);
    }
    private onPlayerData(data) {
        PlayerData.LootPlayerData = data.match_player_data;
        if (PlayerData.LootPlayerData)
            PlayerData.LootPlayerData.is_use_item = false;
        EventMgr.emit(Evt_LootPlayerData, data);
    }
    private onLastSeasonData(data: SLastSeasonInfo) {
        PlayerData.LootLastSeasonInfo = data;
        //请求当前排行榜信息拿取总人数
        if(data.seasonId != 0){
            let last_rank_data = {
                type: MsgTypeSend.GetRankingList,
                data: {
                    seasonId: data.seasonId
                }
            }
            Session.Send(last_rank_data);
        }
        EventMgr.emit(Evt_LootLastSeasonData);
    }

    private onSeasonData(data) {
        PlayerData.LootSeasonInfo = data;
        //请求当前排行榜信息拿取总人数
        let cur_rank_data = {
            type: MsgTypeSend.GetRankingList,
            data: {
                seasonId: data.season_id
            }
        }
        Session.Send(cur_rank_data);
        EventMgr.emit(Evt_LootSeasonData, data);
    }

    private onMatchking(data) {
        if(data){
            PlayerData.LootMatchList = data.matches;
            LootVsPanel.Show(data.matches);
            EventMgr.emit(Evt_Matching);
        }
        EventMgr.emit(Evt_Matching2);
    }
    private onGetPlayerBattleData(data: any) {
        // LootRoleInfoPanel.Show(data.battle_data);
        EventMgr.emit(Evt_LootGetPlayerBattleData, data);
    }
    private onPlunder(data) {
        EventMgr.emit(Evt_LootPlunder, data);
    }
    private onPlunderRecord(data) {
        EventMgr.emit(Evt_LootPlunderRecord, data);
    }
    private onBuyPlunderTimes(data) {
        let addNum:number = data.match_count - PlayerData.LootPlayerData.match_count;
        PlayerData.LootPlayerData.match_count = data.match_count;
        
        if (PlayerData.LootPlayerData.paid_refresh_count > 0 && data.match_count > 0 && !PlayerData.LootPlayerData.is_use_item) {
            PlayerData.LootPlayerData.paid_refresh_count = PlayerData.LootPlayerData.paid_refresh_count - addNum;
        }
        EventMgr.emit(Evt_BuyPlunderTimes);
        PlayerData.LootPlayerData.is_use_item = false;
    }
    private onGetRankingList(data: { seasonId: number, rankingList: SLootRankInfo[] }) {
        if(data.seasonId == PlayerData.LootSeasonInfo.season_id){
            PlayerData.LootSeasonInfo.all_player = data.rankingList.length;
            PlayerData.LootSeasonInfo.rank_list = data.rankingList;
        }else{
            PlayerData.LootLastSeasonInfo.all_player = data.rankingList.length;
            PlayerData.LootLastSeasonInfo.rank_list = data.rankingList;
        }

        EventMgr.emit(Evt_LootRankUpdate, data);
    }
    
    private onShopUpdate(data:SPvpShopGetContentRet):void{
        if(data.code){
            return;
        } 
        PlayerData.PvpShopData = data;
        EventMgr.emit(Evt_LootShopUpdate);
        if(data.new_item){
            RewardTips.Show([data.new_item]);
        }
    }
}