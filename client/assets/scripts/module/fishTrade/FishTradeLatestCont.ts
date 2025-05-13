import { Component, instantiate, Label, Layout, Node, Vec3 } from "cc";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import { EventMgr, Evt_FishTradeLogDataUpdate } from "../../manager/EventMgr";
import { } from "../roleModule/PlayerData"
 import {SFishingTradePlayerSettlementRecordData,SFishingTradeRoundSettlementRecordData} from "../roleModule/PlayerStruct";
import { CfgMgr, StdFishTradeShip } from "../../manager/CfgMgr";

export class FishTradeLatestCont extends Component {
    private devilCityCont:Node;
    private fairytaleTownCont:Node;
    private rainbowIslandCont:Node;
    private tempSign:Node;
    private contList:Node [] = [];
    protected onLoad(): void {
        this.tempSign = this.node.getChildByName("tempSign");
        this.devilCityCont = this.node.getChildByName("devilCityCont");
        this.fairytaleTownCont = this.node.getChildByName("fairytaleTownCont");
        this.rainbowIslandCont = this.node.getChildByName("rainbowIslandCont");
        this.contList = [this.devilCityCont, this.fairytaleTownCont, this.rainbowIslandCont];
    }
    onShow(isNew:boolean = false):void{
        this.node.active = true;
        
        EventMgr.off(Evt_FishTradeLogDataUpdate, this.onFishTradeDataLogUpdate, this);
        EventMgr.on(Evt_FishTradeLogDataUpdate, this.onFishTradeDataLogUpdate, this);
        if(isNew){
            Session.Send({type: MsgTypeSend.FishingTradeRecordQuery, data:{query_type:0, count:5}});
        }
    }
    onHide():void{
        this.node.active = false;
        EventMgr.off(Evt_FishTradeLogDataUpdate, this.onFishTradeDataLogUpdate, this);
    }
    private onFishTradeDataLogUpdate(query_type:number, round_records:SFishingTradeRoundSettlementRecordData[], player_records:SFishingTradePlayerSettlementRecordData[]):void{
        if(query_type != 0) return;
        let stdList:StdFishTradeShip[] = CfgMgr.GetFishTradeShipList;
        let std:StdFishTradeShip;
        for (let index = 0; index < stdList.length; index++) {
            std = stdList[index];
            this.updateCont(round_records, this.contList[index], std.ShipId);
        }
    }
    private updateCont(datas:SFishingTradeRoundSettlementRecordData[], cont:Node, shipId:number):void{
        let len:number = datas.length > 5 ? 5 : datas.length;
        let maxLen = Math.max(len, cont.children.length);
        let signNode:Node;
        let winNode:Node;
        let failNode:Node;
        let logData:SFishingTradeRoundSettlementRecordData;
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
                logData = datas[index];
                if(logData.kill_ship_list){
                    if(logData.kill_ship_list.indexOf(shipId) > -1){
                        winNode.active = false;
                        failNode.active = true;
                    }else{
                        winNode.active = true;
                        failNode.active = false;
                    }
                    signNode.active = true;
                }else{
                    signNode.active = false;
                }
            }else{
                signNode.active = false;
            }
        }
        let layout:Layout = cont.getComponent(Layout);
        layout.updateLayout();
    }
}