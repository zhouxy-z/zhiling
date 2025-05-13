import { Node } from "cc";
import { Panel } from "../../GameRoot";
import { AutoScroller } from "../../utils/AutoScroller";
import { FishingRaceAwardItem } from "./FishingRaceAwardItem";
import { CfgMgr, StdFishRankAward, StdFishRankType } from "../../manager/CfgMgr";
import PlayerData, {  } from "../roleModule/PlayerData"
 import {SFishingRankPlayerInfoData} from "../roleModule/PlayerStruct";

export class FishingRaceAwardPanel extends Panel {
    protected prefab: string = "prefabs/panel/fishingRaceRank/FishingRaceAwardPanel";
    private rankAwardList:AutoScroller;
    private mayRankAwardItem:FishingRaceAwardItem;
    private noneListCont:Node;
    private datas:StdFishRankAward[] = [];
    private rankDatas:SFishingRankPlayerInfoData[];
    protected onLoad(): void {
        this.rankAwardList = this.find("rankAwardList", AutoScroller);
        this.rankAwardList.SetHandle(this.updateRankAwardItem.bind(this));
        this.mayRankAwardItem = this.find("mayRankAwardItem").addComponent(FishingRaceAwardItem);
        this.noneListCont = this.find("noneListCont");
        this.CloseBy("mask");
        this.CloseBy("closeBtn");
    }
    public flush(datas:SFishingRankPlayerInfoData[]):void {
        this.rankDatas = datas;
        this.updateShow();
    }
    
    protected onShow(): void {
        
    }

    protected onHide(...args: any[]): void {

    }

    private updateShow():void{
        let list:StdFishRankAward[] = CfgMgr.GetFishRankAwardList(101, StdFishRankType.Type_4);
        this.datas = list || [];
        this.rankAwardList.UpdateDatas(list);
        this.noneListCont.active = this.datas.length < 1;
        let myRank:number = 0;
        let rankData:SFishingRankPlayerInfoData;
        for(let i = 0; i < this.rankDatas.length; ++i){
            rankData = this.rankDatas[i];
            if(rankData.player_id == PlayerData.roleInfo.player_id){
                myRank = i + 1;
            }
        }
        this.mayRankAwardItem.SetData(myRank > 0 ? this.datas[myRank - 1] : {} as any, myRank);
    }

    private updateRankAwardItem(item:Node, data:StdFishRankAward, index:number):void{
        let rankAwardItem:FishingRaceAwardItem = item.getComponent(FishingRaceAwardItem) || item.addComponent(FishingRaceAwardItem);
        rankAwardItem.SetData(data, index + 1);
    }
}