import { Node, Label, js, Sprite, path, SpriteFrame, Button, sp} from "cc";
import { Panel } from "../../GameRoot";
import { EventMgr, Evt_Hide_Scene, Evt_Show_Scene, Evt_WorldBossRankUpdate, Evt_WorldBossStateUpdate } from "../../manager/EventMgr";
import { WorldBossHurtRankTopItem } from "./WorldBossHurtRankTopItem";
import { AutoScroller } from "../../utils/AutoScroller";
import { WorldBossHurtRankItem } from "./WorldBossHurtRankItem";
import PlayerData from "../roleModule/PlayerData";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import { SWorldBossData, SWorldBossRankData, SWorldBossRankItemData, Tips2ID } from "../roleModule/PlayerStruct";
import { ResMgr } from "../../manager/ResMgr";
import { WorldBossRankPanel } from "./WorldBossRankPanel";
import { DateUtils } from "../../utils/DateUtils";
import { MsgPanel } from "../common/MsgPanel";
import { Tips2 } from "../home/panel/Tips2";

export class WorldBossHurtRankPanel extends Panel {
    protected prefab: string = "prefabs/panel/worldBoss/WorldBossHurtRankPanel";
    private bossModel:sp.Skeleton;
    private winTitleFlag:Node;
    private failTitleFlag:Node;
    private gbaBtn:Button;
    private rankBtn:Button;
    private awardBtn:Button;
    private openTimeLab:Label;
    private top3Cont:Node;
    private top3Item: WorldBossHurtRankTopItem[] = [];
    private killTimeTitleLab:Label;
    private killTimeLab:Label;
    private myRankLab:Label;
    private myhurtLab:Label;
    private rankList:AutoScroller;
    private noneListCont:Node;
    private worldBossData:SWorldBossData;
    private rankData:SWorldBossRankData;
    private nextOpenTime:number;
    protected onLoad(): void {
        this.bossModel = this.find("topCont/bossModel", sp.Skeleton);
        this.winTitleFlag = this.find("topCont/winTitleFlag");
        this.failTitleFlag = this.find("topCont/failTitleFlag");
        this.openTimeLab = this.find("topCont/openTimeLab", Label);
        this.awardBtn = this.find("topCont/awardBtn", Button);
        this.rankBtn = this.find("topCont/rankBtn", Button);
        this.gbaBtn = this.find("topCont/gbaBtn", Button);
        this.top3Cont = this.find("topCont/hurtTop3Cont");
        let rankNode:Node;
        let rankCom:WorldBossHurtRankTopItem;
        for (let index = 0; index < this.top3Cont.children.length; index++) {
            rankNode = this.top3Cont.children[index];
            rankCom = rankNode.addComponent(WorldBossHurtRankTopItem);
            this.top3Item.push(rankCom);
        }
        this.killTimeTitleLab = this.find("bottomCont/killTimeTitleLab", Label);
        this.killTimeLab = this.find("bottomCont/killTimeLab", Label);
        this.myRankLab = this.find("bottomCont/myRankLab", Label);
        this.myhurtLab = this.find("bottomCont/myHurtLab", Label);

        this.rankList = this.find("bottomCont/rankList", AutoScroller);
        this.rankList.SetHandle(this.updateRankItem.bind(this));
        this.noneListCont = this.find("bottomCont/noneListCont");
        this.CloseBy("backBtn");
        this.awardBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.rankBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.gbaBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
    }

    protected update(dt: number): void {
        let residueTime:number = Math.max(Math.floor(this.nextOpenTime - PlayerData.GetServerTime()), 0);
        if(residueTime > 0){
            this.openTimeLab.string = "Boss刷新时间：" + DateUtils.FormatTime(residueTime, "%{h}时%{m}分%{s}秒");
        }else{
            this.openTimeLab.string = "Boss刷新时间：--时--分--秒";
        }    
       
    }

    public flush(): void{
        this.nextOpenTime = 0;
        let nextDayTime:number;
        let worldBossOpenTimeList:{startHour:number, startMinute:number, endHour:number,endMinute:number}[] = PlayerData.GetWorldOpenTimeList();
        let serverTime: number = PlayerData.GetServerTime();
        for (let index = 0; index < worldBossOpenTimeList.length; index++) {
            let timeData: { startHour: number, startMinute: number, endHour: number, endMinute: number } = worldBossOpenTimeList[index];
            let startS: number = DateUtils.weeHoursTime(serverTime) + (timeData.startHour * 60 + timeData.startMinute) * 60;
            if(index == 0){
                nextDayTime = startS + 86400;
            }
            if (startS > serverTime) {
                this.nextOpenTime = startS;
                break;
            }
        }
        if(this.nextOpenTime == 0){
            this.nextOpenTime = nextDayTime;
        }
        this.worldBossData = PlayerData.worldBossData;
        if(!this.worldBossData) return;
        let endTime:number;
        if(this.worldBossData.settle && this.worldBossData.settle > 0){
            endTime = this.worldBossData.settle - this.worldBossData.start;
            this.killTimeTitleLab.string = `击败时间`;
        }else{
            this.killTimeTitleLab.string = `持续时间`;
            endTime = this.worldBossData.end - this.worldBossData.start;
        }
        
        this.killTimeLab.string = DateUtils.FormatTime(endTime, "%{hh}:%{mm}:%{ss}");

        if(this.worldBossData.terminator != ""){
            this.failTitleFlag.active = false;
            this.winTitleFlag.active = true;
        }else{
            this.failTitleFlag.active = true;
            this.winTitleFlag.active = false;
        }
        ResMgr.LoadResAbSub(path.join("spine/role", this.worldBossData.model, this.worldBossData.model), sp.SkeletonData, (res:sp.SkeletonData)=>{
            if(this.bossModel.skeletonData != res){
                this.bossModel.skeletonData = res; 
                this.bossModel.setAnimation(0, "Idel_Back", true);
            }
        });
        this.updateShow();
        
        Session.Send({ type: MsgTypeSend.GetBossFightRank, data: {type:1, cnt:10, t: 0} });
    }
    
    protected onShow(): void {
        EventMgr.emit(Evt_Hide_Scene, js.getClassName(this));
        EventMgr.on(Evt_WorldBossRankUpdate, this.onWorldBossRankUpdate, this);
        
    }

    protected onHide(...args: any[]): void {
        this.rankData = null;
        EventMgr.emit(Evt_Show_Scene, js.getClassByName(this));
        EventMgr.off(Evt_WorldBossRankUpdate, this.onWorldBossRankUpdate, this);
    }
    private onBtnClick(btn:Button):void{
        switch(btn){
            case this.gbaBtn:
                Tips2.Show(Tips2ID.WorldBoss);
                break;
            case this.awardBtn:
                if(this.worldBossData.terminator == ""){
                    MsgPanel.Show("未能成功击杀Boss,无法获得奖励");
                    return;
                }
                if(this.worldBossData.reward_status > 0){
                    MsgPanel.Show("已领取过奖励了");
                    return;
                }
                Session.Send({ type: MsgTypeSend.GetDefeatReward, data: {}});
                break;
            case this.rankBtn:
                WorldBossRankPanel.Show();
                break;
        }
    }
    private onWorldBossRankUpdate():void{
        this.rankData = PlayerData.worldBossRankData;
        this.updateShow();
    }
    private updateShow():void{
        let totalHurt:number = 0;
        let myHurt:number = 0;
        let myRank:number = 0;
        let top3List:SWorldBossRankItemData[] = [
            {
                id:null,
                name:"虚位以待",
                harm:0,
            },
            {
                id:null,
                name:"虚位以待",
                harm:0,
            },
            {
                id:null,
                name:"虚位以待",
                harm:0,
            },
        ];
        let otherList:SWorldBossRankItemData[] = [];
        let otherLen:number = 7;
        if(this.rankData){
            totalHurt = this.rankData.boss_harm;
            myHurt = this.rankData.harm;
            myRank = this.rankData.rank;
            if(this.rankData.rank_data_list){
                let rank_data_list:SWorldBossRankItemData[] = this.rankData.rank_data_list.concat();
                for (let index = 0; index < rank_data_list.length; index++) {
                    if(index < top3List.length){
                        top3List[index] = rank_data_list[index];
                    }else{
                        if(otherList.length >= otherLen) break;
                        otherList.push(rank_data_list[index]);
                    }
                }
            }
        }
        for (let index = 0; index < this.top3Item.length; index++) {
            let rankItem = this.top3Item[index];
            rankItem.SetData(top3List[index]);
        }
        this.myRankLab.string = myRank > 0 ? myRank.toString() : "未上榜";
        this.myhurtLab.string = myHurt.toString();
        this.rankList.UpdateDatas(otherList);
        this.noneListCont.active = otherList.length <= 0;
    }
    protected updateRankItem(item: Node, data: SWorldBossRankItemData, index:number) {
        let rankItem = item.getComponent(WorldBossHurtRankItem) || item.addComponent(WorldBossHurtRankItem);
        rankItem.SetData(data, index + 4);
    }
}