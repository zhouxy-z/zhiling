import { CfgMgr, StdWorldBossComm } from "../../manager/CfgMgr";
import { EventMgr, Evt_WorldBossChallengeNumUpdate, Evt_WorldBossHurtLog, Evt_WorldBossRankUpdate, Evt_WorldBossStateUpdate } from "../../manager/EventMgr";
import { MsgTypeRet, MsgTypeSend } from "../../MsgType";
import { Session } from "../../net/Session";
import { ItemUtil } from "../../utils/ItemUtils";
import { MsgPanel } from "../common/MsgPanel";
import { RewardTips } from "../common/RewardTips";
import PlayerData from "../roleModule/PlayerData";
import { SThing, SWorldBossStateData, SWorldBossRankData, SPlayerBossData, SWorldBossBaseData, SWorldBossData, SWorldBossBattleResult, SWorldBossHurtLogData } from "../roleModule/PlayerStruct";

export class WorldBossModule {
    private interval:any;
    constructor() {
        Session.on(MsgTypeRet.TryToJoinRet, this.onTryToJoinRet, this);
        Session.on(MsgTypeRet.GetDefeatRewardRet, this.onGetDefeatRewardRet, this);
        Session.on(MsgTypeRet.BuyBossTimesRet, this.BuyBossTimesRet, this);
        Session.on(MsgTypeRet.BossUpdate, this.onBossUpdate, this);
        Session.on(MsgTypeRet.GetDefeatStatusRet, this.onGetDefeatStatusRet, this);
        Session.on(MsgTypeRet.GetBossFightRankRet, this.onGetBossFightRankRet, this);
        Session.on(MsgTypeRet.GetBossFightRankRet, this.onGetBossFightRankRet, this);
        Session.on(MsgTypeRet.GetPlayerOnceDataRet, this.onGetPlayerOnceDataRet, this);
    }

    private onTryToJoinRet(data:{code:number}):void{
        if(data.code != 0){
            if (data.code == 101) {
                MsgPanel.Show("世界boss战斗进入中...");
            } else {
                MsgPanel.Show("战斗进行中，暂无法进入!");
            }
            return;
        }
        //PlayerData.roleInfo.boss_data = data.Data;
        //EventMgr.emit(Evt_WorldBossChallengeNumUpdate);
    }

    private onGetDefeatRewardRet(data:{code:number}):void{
        if(data.code == 0){
            let std:StdWorldBossComm = CfgMgr.GetWorldBossComm;
            let itemList:SThing[] = ItemUtil.GetSThingList(std.RewardType, std.RewardItemType, std.RewardNumber);
            RewardTips.Show(itemList);
            let worldBossData:SWorldBossData = PlayerData.worldBossData;
            if(worldBossData){
                let newBaseData:SWorldBossBaseData = {
                    terminator:worldBossData.terminator,
                    settle:worldBossData.settle,
                    start:worldBossData.start,
                    end:worldBossData.end,
                    boss_type:worldBossData.boss_type,
                    boss_lv:worldBossData.boss_lv,
                    HP:worldBossData.HP,
                    max_HP:worldBossData.max_Hp,
                    r:worldBossData.roundId,
                }
                let newData:SWorldBossStateData = {
                    code:0,
                    base:newBaseData,
                    reward_status:1
                }
                this.setBossData(newData);
            }
        }
    }
    private onGetBossFightRankRet(data:SWorldBossRankData):void{
        if(data.code == 0){
            PlayerData.SetWorldBossRankData(data);
        }
        EventMgr.emit(Evt_WorldBossRankUpdate);
    }
    private onGetDefeatStatusRet(data:SWorldBossStateData):void{
        let worldBossData:SWorldBossData = PlayerData.worldBossData;
        //新刷出来的boss重置排行榜数据
        if(worldBossData && worldBossData.roundId != data.base.r){
            PlayerData.SetWorldBossRankData(null);
            EventMgr.emit(Evt_WorldBossRankUpdate);
        }
        this.setBossData(data);
    }
    
    private BuyBossTimesRet(data:{boss_data:SPlayerBossData}):void{
        PlayerData.roleInfo.boss_data = data.boss_data;
        EventMgr.emit(Evt_WorldBossChallengeNumUpdate);
    }
    
    private onBossUpdate(data:SWorldBossBaseData):void{
        let newData:SWorldBossStateData = {
            code:0,
            base:data,
            reward_status:0
        }
        
        this.setBossData(newData);
    }
    private setBossData(data:SWorldBossStateData):void{
        PlayerData.SetWorldBossDataData(data);
        EventMgr.emit(Evt_WorldBossStateUpdate);
        if(this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.interval = setInterval(this.sendGetBossDataCheck, 1000);
        
    }
    private sendGetBossDataCheck():void{
        let curTime:number = PlayerData.GetServerTime();
        if(!PlayerData.worldBossData || curTime >= PlayerData.worldBossData.end){
            if(PlayerData.CheckWorldBossNearOpneTime()){
                //请世界boss状态
                Session.Send({ type: MsgTypeSend.GetDefeatStatus, data: {} });
            }
        }else{
            //请世界boss状态
            if(PlayerData.worldBossData.terminator != "" || PlayerData.worldBossData.HP <= 0) return;
            Session.Send({ type: MsgTypeSend.GetDefeatStatus, data: {} });
        }
    }
    private onGetPlayerOnceDataRet(data:{data:SWorldBossHurtLogData[]}):void{

        EventMgr.emit(Evt_WorldBossHurtLog, data.data ? data.data : []);
    }

}
