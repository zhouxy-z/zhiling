import { Component, Label, Node, Button, Size, UITransform, Vec3} from "cc";
import { AutoScroller } from "../../utils/AutoScroller";
import PlayerData, { } from "../roleModule/PlayerData"
 import {SFishBombLogDataRet, SFishBombLogItemData} from "../roleModule/PlayerStruct";
import { ClickTipsPanel } from "../common/ClickTipsPanel";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import { EventMgr, Evt_FishBombLogDataUpdate } from "../../manager/EventMgr";
import { ToFixed } from "../../utils/Utils";
import { FishBombLogItem } from "./FishBombLogItem";

export class FishBombLogPage extends Component {
    private rainbowNumLab:Label;
    private downBtnCont:Node;
    private downBtnArrow:Node;
    private downBtn:Button;
    private downBtnTitle:Label;
    private allBtn:Button;
    private winBtn:Button;
    private failBtn:Button;
    private logList:AutoScroller;
    private noneListCont:Node;
    private logData:SFishBombLogDataRet;
    private curSotr:number;
    protected onLoad(): void {
        this.rainbowNumLab = this.node.getChildByPath("rainbowCont/rainbowNumLab").getComponent(Label);
        this.downBtnCont = this.node.getChildByName("downBtnCont");
        this.allBtn = this.node.getChildByPath("downBtnCont/allBtn").getComponent(Button);
        this.winBtn = this.node.getChildByPath("downBtnCont/winBtn").getComponent(Button);
        this.failBtn = this.node.getChildByPath("downBtnCont/failBtn").getComponent(Button);
        this.downBtn = this.node.getChildByName("downBtn").getComponent(Button);
        this.downBtnTitle = this.node.getChildByPath("downBtn/downBtnTitle").getComponent(Label);
        this.downBtnArrow = this.node.getChildByPath("downBtn/downBtnArrow");
        this.logList = this.node.getChildByName("logList").getComponent(AutoScroller);
        this.logList.SetHandle(this.updateLogItem.bind(this));
        this.noneListCont = this.node.getChildByName("noneListCont");
        this.allBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.winBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.failBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.downBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        
        
    }

    private onLogDataUpdate(logData:SFishBombLogDataRet):void{
        if(!this.node.activeInHierarchy || logData.query_type != 1) return;
        this.logData = logData;
        
        this.sortLogData(this.curSotr);
    }
    onShow():void{
        this.node.active = true;
        this.noneListCont.active = false;
        EventMgr.off(Evt_FishBombLogDataUpdate, this.onLogDataUpdate, this);
        EventMgr.on(Evt_FishBombLogDataUpdate, this.onLogDataUpdate, this);
        this.rainbowNumLab.string =  ToFixed(PlayerData.roleInfo.currency, 2) + "";
        this.curSotr = 0;
        this.downBtnArrow.angle = 0;
        if(!this.logData){
            this.logList.UpdateDatas([]);
            Session.Send({type: MsgTypeSend.FishingBombRecordQuery, data:{query_type:1, count:50}});
        }else{
            this.sortLogData(this.curSotr);
        }
    }
    onHide():void{
        this.node.active = false;
        this.logData = null;
        EventMgr.off(Evt_FishBombLogDataUpdate, this.onLogDataUpdate, this);
    }
    private onBtnClick(btn:Button):void{
        switch(btn){
            case this.allBtn:
                this.sortLogData(0);
                ClickTipsPanel.Hide();
                break;
            case this.winBtn:
                this.sortLogData(1);
                ClickTipsPanel.Hide();
                break;
                case this.failBtn:
                    this.sortLogData(2);
                    ClickTipsPanel.Hide();
                break;
            case this.downBtn:
                
                let btnNode:Node = this.downBtn.node;
                let btnSize:Size = btnNode.getComponent(UITransform).contentSize;
                let showPos:Vec3 = btnNode.worldPosition.clone();
                showPos.y = showPos.y - btnSize.height / 2 - this.downBtnCont.getComponent(UITransform).height / 2 + 6;
                this.downBtnArrow.angle = 0;
                ClickTipsPanel.Show(this.downBtnCont, this.node, this.downBtn, showPos, 0, ()=>{
                    this.downBtnArrow.angle = -180;
                });
                break;
            
        }
    }
    private sortLogData(type:number):void{
        this.curSotr = type;
        let logDatas:SFishBombLogItemData[] = [];
        switch(type){
            case 0:
                this.downBtnTitle.string = "全部";
                if(this.logData && this.logData.player_records){
                    logDatas = this.logData.player_records.concat();
                }
                break;
            case 1:
                this.downBtnTitle.string = "成功";
                if(this.logData && this.logData.player_records){
                    for (let log of this.logData.player_records) {
                        if(log.is_win){
                            logDatas.push(log);
                        }
                    }
                }
                break;
            case 2:
                this.downBtnTitle.string = "失败";
                if(this.logData && this.logData.player_records){
                    for (let log of this.logData.player_records) {
                        if(!log.is_win){
                            logDatas.push(log);
                        }
                    }
                }
                break;
        }
        logDatas.sort((a:SFishBombLogItemData, b:SFishBombLogItemData)=>{
            return b.round - a.round;
        })
        this.noneListCont.active = logDatas.length < 1;
        this.logList.UpdateDatas(logDatas);
    }
    
    protected updateLogItem(item: Node, data: SFishBombLogItemData) {
        let logItem = item.getComponent(FishBombLogItem) || item.addComponent(FishBombLogItem);
        logItem.SetData(data);
    }
}