import { Node,Label } from "cc";
import { Panel } from "../../GameRoot";
import { AutoScroller } from "../../utils/AutoScroller";
import { WorldBossRankAwardItem } from "./WorldBossRankAwardItem";
import { CfgMgr, StdWorldBossRankAward } from "../../manager/CfgMgr";
import { SWorldBossRankData } from "../roleModule/PlayerStruct";
import PlayerData from "../roleModule/PlayerData";
import { DateUtils } from "../../utils/DateUtils";

export class WorldBossRankAwardPanel extends Panel {
    protected prefab: string = "prefabs/panel/worldBoss/WorldBossRankAwardPanel";
    private list: AutoScroller;
    private myRankAwardItem: WorldBossRankAwardItem;
    private timeLab: Label;
    private rankData:SWorldBossRankData;
    private endTime:number;
    protected onLoad() {
        
        this.list = this.find(`list`, AutoScroller);
        this.list.SetHandle(this.updateRankAward.bind(this));
        this.myRankAwardItem = this.find(`myRankAwardItem`).addComponent(WorldBossRankAwardItem);
        this.timeLab = this.find(`timeCont/timeLab`, Label);
        this.CloseBy("closeBtn");
        this.CloseBy("mask");
        
    }
    protected update(dt: number): void {
        if(this.endTime > 0){
            let residueTime = Math.max(Math.floor(this.endTime - PlayerData.GetServerTime()), 0);
            this.timeLab.string = DateUtils.FormatTime(residueTime, "%{h}时%{m}分%{s}秒");
        }else{
            this.timeLab.string = "--时--分--秒";
        }
    }
    protected onShow(): void {
        
    }

    public flush(rankData:SWorldBossRankData): void {
        this.rankData = rankData;
        this.endTime = PlayerData.worldBossData ? PlayerData.worldBossData.end : 0;
        this.updateShow();
    }

    protected onHide(...args: any[]): void {
       
    }

    private updateShow():void{
        let datas:StdWorldBossRankAward[] = CfgMgr.GetWorldBossRankTypeAwardList(1);
        this.list.UpdateDatas(datas);
        let myRank:number = this.rankData ? this.rankData.rank : 0;
        let myRankData:StdWorldBossRankAward = null;
        let std:StdWorldBossRankAward;
        for (let index = 0; index < datas.length; index++) {
            std = datas[index];
            if(std.Ranking[1] == myRank){
                myRankData = std;
                break;
            }
        }
        if(!myRankData){
            myRankData = {
                ListModeID:0,
                ListType:1,
                Ranking:[],
                RewardType:[],
                RewardItemType:[],
                RewardNumber:[],
            }
        }
        this.myRankAwardItem.SetData(myRankData);
    }

    private updateRankAward(item: Node, data: StdWorldBossRankAward) {
        let rankItem = item.getComponent(WorldBossRankAwardItem) || item.addComponent(WorldBossRankAwardItem);
        rankItem.SetData(data);
    }
    
}