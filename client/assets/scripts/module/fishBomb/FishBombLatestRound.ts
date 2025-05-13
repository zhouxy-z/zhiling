import { Component, instantiate, Label, Layout, Node, Vec3 } from "cc";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import { EventMgr, Evt_FishBombLogDataUpdate } from "../../manager/EventMgr";
import { } from "../roleModule/PlayerData"
 import {SFishBombLogDataRet, SFishBombRoundLogData, SFishBombStageLogData} from "../roleModule/PlayerStruct";
import { CfgMgr, StdFishBombPond } from "../../manager/CfgMgr";

export class FishBombLatestRound extends Component {
    private pptCont:Node;
    private tttCont:Node;
    private bbtCont:Node;
    private tempSign:Node;
    private contList:Node [] = [];
    protected onLoad(): void {
        this.tempSign = this.node.getChildByName("tempSign");
        this.pptCont = this.node.getChildByName("pptCont");
        this.tttCont = this.node.getChildByName("tttCont");
        this.bbtCont = this.node.getChildByName("bbtCont");
        this.contList = [this.bbtCont, this.tttCont, this.pptCont];
    }
    onShow(isNew:boolean = false):void{
        this.node.active = true;
        
        EventMgr.off(Evt_FishBombLogDataUpdate, this.onFishBombDataLogUpdate, this);
        EventMgr.on(Evt_FishBombLogDataUpdate, this.onFishBombDataLogUpdate, this);
        if(isNew){
            Session.Send({type: MsgTypeSend.FishingBombRecordQuery, data:{query_type:0, count:5}});
        }
    }
    onHide():void{
        this.node.active = false;
        EventMgr.off(Evt_FishBombLogDataUpdate, this.onFishBombDataLogUpdate, this);
    }
    private onFishBombDataLogUpdate(logData:SFishBombLogDataRet):void{
        if(!this.node.activeInHierarchy || logData.query_type != 0) return;
        
        let stdList:StdFishBombPond[] = CfgMgr.GetFishBombPondList();
        let std:StdFishBombPond;
        for (let index = 0; index < stdList.length; index++) {
            std = stdList[index];
            this.updateCont(logData.round_records, this.contList[index], std.Id);
        }
    }
    private updateCont(datas:SFishBombRoundLogData[], cont:Node, id:number):void{
        let logDataList:SFishBombRoundLogData[] = datas ? datas : [];
        let len:number = logDataList.length > 5 ? 5 : logDataList.length;
        let maxLen = Math.max(len, cont.children.length);
        let signNode:Node;
        let winNode:Node;
        let failNode:Node;
        let logData:SFishBombRoundLogData;
        for (let index = 0; index < maxLen; index++) {
            signNode = cont.children[index];
            if(!signNode){
                signNode = instantiate(this.tempSign);
                signNode.position = new Vec3(0,0,0);
                signNode.parent = cont;
            }
            winNode = signNode.getChildByName("win");
            failNode = signNode.getChildByName("fail");
            if(index < len){
                signNode.active = false;
                logData = datas[index];
                let stageLogData:SFishBombStageLogData;
                let isKill:boolean = false;
                if(logData.stages){
                    stageLogData = logData.stages[1];
                    if(stageLogData){
                        let killList:number[] = stageLogData.kill_pool_list;
                        if(killList && killList.length > 0){
                            signNode.active = true;
                            isKill = killList.indexOf(id) > -1;
                        }
                    }
                }
                
                if(isKill){
                    winNode.active = false;
                    failNode.active = true;
                }else{
                    winNode.active = true;
                    failNode.active = false;
                }
            }else{
                signNode.active = false;
            }
        }
        let layout:Layout = cont.getComponent(Layout);
        layout.updateLayout();
    }
}