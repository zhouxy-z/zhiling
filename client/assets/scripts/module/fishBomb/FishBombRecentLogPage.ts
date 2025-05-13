import { Color, Component, Label, Node} from "cc";
import { EventMgr, Evt_FishBombLogDataUpdate, Evt_FishLogDataUpdate } from "../../manager/EventMgr";
import { } from "../roleModule/PlayerData"
 import {SFishBombStageLogData, SFishBombLogDataRet, SFishBombRoundLogData,SFishingLogData} from "../roleModule/PlayerStruct";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import { AutoScroller } from "../../utils/AutoScroller";
import { CfgMgr, StdFishBombPond, StdLake } from "../../manager/CfgMgr";

export class FishBombRecentLogPage extends Component {
    private oneHundredList:AutoScroller;
    private twentyList:AutoScroller;
    private noneListCont:Node;
    private logData:SFishBombLogDataRet;
    private killPond:{[key:string]:{pondId:number, num:number, isTop:boolean}};
    private isCanUpdate:boolean;
    protected onLoad(): void {
        this.oneHundredList = this.node.getChildByName("oneHundredList").getComponent(AutoScroller);
        this.twentyList = this.node.getChildByName("twentyList").getComponent(AutoScroller);
        this.noneListCont = this.node.getChildByName("noneListCont");
        this.oneHundredList.SetHandle(this.updateOneHundItem.bind(this));
        this.twentyList.SetHandle(this.updateTwentyItem.bind(this));
        
        
    }

    onShow():void{
        this.node.active = true;
        this.noneListCont.active = false;
        this.isCanUpdate = true;
        EventMgr.off(Evt_FishBombLogDataUpdate, this.onLogDataUpdate, this);
        EventMgr.on(Evt_FishBombLogDataUpdate, this.onLogDataUpdate, this);
        if(!this.logData){
            this.killPond = {};
            this.updateCont();
            Session.Send({type: MsgTypeSend.FishingBombRecordQuery, data:{query_type:0, count:100}});
        }else{
            this.updateCont();
        }
    }
    onHide():void{
        this.node.active = false;
        this.logData = null;
        this.killPond = {};
        EventMgr.off(Evt_FishBombLogDataUpdate, this.onLogDataUpdate, this);
    }
    private onLogDataUpdate(logData:SFishBombLogDataRet):void{
        if(!this.node.activeInHierarchy || logData.query_type != 0) return;
        if(!this.isCanUpdate) return;
        this.isCanUpdate = false;
        this.logData = logData;
        this.killPond = {};
        if(this.logData && this.logData.round_records && this.logData.round_records.length){
            let pondInfo:{pondId:number, num:number, isTop:boolean};
            let topId:number = 0;
            let topNum:number = 0;
            let stageLogData:SFishBombStageLogData;
            let len:number = Math.min(this.logData.round_records.length, 100);
            let log:SFishBombRoundLogData;
            for (let i = 0; i < len; i++) {
                log = this.logData.round_records[i];
                stageLogData = log.stages[1];
                if(stageLogData) {
                    let killList:number[] = stageLogData.kill_pool_list;
                    if(!killList) continue;
                    for (let index = 0; index < killList.length; index++) {
                        let pondId:number = killList[index];
                        if(pondId > 0){
                            pondInfo = this.killPond[pondId];
                            if(!pondInfo){
                                pondInfo = {pondId:pondId, num:0, isTop:false};
                                this.killPond[pondId] = pondInfo;
                            }
                            pondInfo.num++;
                            if(topId > 0){
                                if(topNum < pondInfo.num)
                                {
                                    topId = pondInfo.pondId;
                                    topNum = pondInfo.num;
                                }
                            }else{
                                topId = pondInfo.pondId;
                                topNum = pondInfo.num;
                            }
                        }
                    }
                }
            }
            
            if(this.killPond[topId]) this.killPond[topId].isTop = true;
        }
        
        this.updateCont();
    }
    private updateCont():void{
        this.oneHundredList.UpdateDatas(CfgMgr.GetFishBombPondList());
        let logList:SFishBombRoundLogData[] = [];
        if(this.logData && this.logData.round_records && this.logData.round_records.length){
            logList = this.logData.round_records.splice(0, 19);
        }
        this.noneListCont.active = logList.length < 1;
        this.twentyList.UpdateDatas(logList);
    }
    protected updateOneHundItem(item: Node, stdPond: StdFishBombPond) {
        let nameLab:Label = item.getChildByName("nameLab").getComponent(Label);
        let numLab:Label = item.getChildByName("numLab").getComponent(Label);
        nameLab.string = stdPond.Name;
        let pondInfo:{pondId:number, num:number, isTop:boolean} = this.killPond[stdPond.Id];
        if(pondInfo){
            numLab.color = new Color().fromHEX(pondInfo.isTop ? "#CB5839" : "#3D7A97");
            numLab.string = pondInfo.num.toString();
        }else{
            numLab.color = new Color().fromHEX("#3D7A97");
            numLab.string = "0";
        }
    }
    protected updateTwentyItem(item: Node, data: SFishBombRoundLogData) {
        let phaseLab:Label = item.getChildByName("phaseLab").getComponent(Label);
        phaseLab.string = `${data.round}期`;
        let killNameLab:Label = item.getChildByName("killNameLab").getComponent(Label);
        let killNameStr:string = "";
        if(data.stages){
            let stageLogData:SFishBombStageLogData = data.stages[1];
            if(stageLogData){
                let killList:number[] = stageLogData.kill_pool_list;
                let std:StdFishBombPond;
                if(killList){
                    for (let index = 0; index < killList.length; index++) {
                        std = CfgMgr.GetFishBombPond(killList[index]);
                        if(std){
                            if(killNameStr != ""){
                                killNameStr += "、";
                            }
                            killNameStr += std.Name;
                        }
                    }
                }
                
            }
        }
        killNameLab.string = killNameStr == "" ? "--" : killNameStr;
    }
}