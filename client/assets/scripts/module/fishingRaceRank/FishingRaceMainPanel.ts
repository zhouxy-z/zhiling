import { Button, Label, Node, js } from "cc";
import { Panel } from "../../GameRoot";
import { EventMgr, Evt_FishRankUpdate, Evt_Hide_Scene, Evt_Show_Scene, Goto } from "../../manager/EventMgr";
import { AdaptBgTop } from "../common/BaseUI";
import { DateUtils } from "../../utils/DateUtils";
import PlayerData, { } from "../roleModule/PlayerData"
 import {SFishingRankInfoData,SFishingRankPlayerInfoData,SFishingRankQueryRet,SThing} from "../roleModule/PlayerStruct";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import { CfgMgr, StdFishRankAward, StdFishRankType } from "../../manager/CfgMgr";
import { FishingRankTopItem } from "../fishing/FishingRankTopItem";
import { FishingRaceRankAwardTopItem } from "./FishingRaceRankAwardTopItem";
import { AwardItem } from "../common/AwardItem";
import { ItemUtil } from "../../utils/ItemUtils";

export class FishingRaceMainPanel extends Panel {
    protected prefab: string = "prefabs/panel/fishingRaceRank/FishingRaceMainPanel";
    private top3Item:FishingRaceRankAwardTopItem[] = [];
    private timeLab:Label;
    private awardItem:AwardItem;
    private rankBtn:Button;
    private awardBtn:Button;
    private goToFishBtn:Button;
    private data:SFishingRankQueryRet;
    private awardList:StdFishRankAward[];
    protected onLoad(): void {
        this.awardList = CfgMgr.GetFishRankAwardList(101, StdFishRankType.Type_4);
        this.top3Item.push(this.find("top3Cont/rank1").addComponent(FishingRaceRankAwardTopItem));
        this.top3Item.push(this.find("top3Cont/rank2").addComponent(FishingRaceRankAwardTopItem));
        this.top3Item.push(this.find("top3Cont/rank3").addComponent(FishingRaceRankAwardTopItem));
        this.timeLab = this.find("timeCont/timeLab").getComponent(Label);
        this.awardItem = this.find("awardCont/awardItem").addComponent(AwardItem);
        this.rankBtn = this.find("rankBtn").getComponent(Button);
        this.awardBtn = this.find("awardBtn").getComponent(Button);
        this.goToFishBtn = this.find("goToFishBtn").getComponent(Button);
        this.CloseBy("backBtn");
        this.rankBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.awardBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.goToFishBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
    }
    public flush(): void {
        Session.Send({type: MsgTypeSend.FishingRankQuery, data:{}});
        //this.updateShow();
    }
    
    protected onShow(): void {
        AdaptBgTop(this.find("titleCont"));
        let std:StdFishRankAward;
        let itemType:number = 0;
        let itemId:number = 0;
        let itemNum:number = 0;
        for (let index = 0; index < this.awardList.length; index++) {
            std = this.awardList[index];
            if(itemType < 1){
                itemType = std.RewardType[0];
                itemId = std.RewardItemType[0];
            }
            if(std.RewardNumber && std.RewardNumber.length > 0){
                itemNum += std.RewardNumber[0];    
            }
        }
        let itemData:SThing = ItemUtil.CreateThing(itemType, itemId, itemNum);
        this.awardItem.SetData({itemData:itemData});
        if(PlayerData.fishingMatch && (PlayerData.fishingMatch.current_match || PlayerData.fishingMatch.next_match)) {
            let startTime:number;
            let endTime:number;
            if(PlayerData.fishingMatch.current_match && PlayerData.GetServerTime() <PlayerData.fishingMatch.current_match.CloseTime){
                startTime = PlayerData.fishingMatch.current_match.StartTime;
                endTime = PlayerData.fishingMatch.current_match.CloseTime;
            }else if(PlayerData.fishingMatch.next_match && PlayerData.GetServerTime() < PlayerData.fishingMatch.next_match.CloseTime){
                startTime = PlayerData.fishingMatch.next_match.StartTime;
                endTime = PlayerData.fishingMatch.next_match.CloseTime;
            }else{

            }
            if(startTime > 0){
                let startDate:string[] = DateUtils.TimestampToDate(startTime * 1000, true);
                let endDate:string[] = DateUtils.TimestampToDate(endTime * 1000, true);
                this.timeLab.string = `${startDate[0]}年${startDate[1]}月${startDate[2]}日 - ${endDate[0]}年${endDate[1]}月${endDate[2]}日`;
            }else{
                this.timeLab.string = "活动时间：--年--月--日 - --年--月--日";
            }
        }else{
            this.timeLab.string = "活动时间：--年--月--日 - --年--月--日";
        }
        this.updateShow();
        Session.Send({type: MsgTypeSend.FishingRankQuery, data:{}});
        EventMgr.on(Evt_FishRankUpdate, this.onRankUpdate, this);
        EventMgr.emit(Evt_Hide_Scene, js.getClassName(this));
    }

    protected onHide(...args: any[]): void {
        this.data = null;
        EventMgr.off(Evt_FishRankUpdate, this.onRankUpdate, this);
        EventMgr.emit(Evt_Show_Scene, js.getClassByName(this));
    }
    private onRankUpdate(data:SFishingRankQueryRet):void{
        this.data = data;
        this.updateShow();
    }
    private onBtnClick(btn:Button):void{
        switch(btn){
            case this.rankBtn:
                Goto("FishingRankPanel",this.data, StdFishRankType.Type_4);
                break;
            case this.awardBtn:
                Goto("FishingRaceAwardPanel",this.data && this.data.match_rank && this.data.match_rank.top_rank_players ? this.data.match_rank.top_rank_players : []);
                break;
            case this.goToFishBtn:
                Goto("FishingPanel");
                break;
        }
    }
    private updateShow():void{
        let top3List:SFishingRankPlayerInfoData[] = [
            {
                player_id:null,
                name:"虚位以待",
                score:0,
                rank:1,
            },
            {
                player_id:null,
                name:"虚位以待",
                score:0,
                rank:2,
            },
            {
                player_id:null,
                name:"虚位以待",
                score:0,
                rank:3,
            },
        ];
        let rankList:SFishingRankPlayerInfoData[] = this.data && this.data.match_rank ? this.data.match_rank.top_rank_players : [];
        for (let index = 0; index < rankList.length; index++) {
            let rankData:SFishingRankPlayerInfoData = rankList[index];
            rankData.rank = index + 1;
            if(index < top3List.length){
                top3List[index] = rankData;
            }
        }
        this.updateTop3Cont(top3List);
        
    }
    private updateTop3Cont(topRankList:SFishingRankPlayerInfoData[]):void{
        for (let index = 0; index < this.top3Item.length; index++) {
            let rankItem = this.top3Item[index];
            rankItem.SetData(topRankList[index], this.awardList[index]);
        }
    }
}