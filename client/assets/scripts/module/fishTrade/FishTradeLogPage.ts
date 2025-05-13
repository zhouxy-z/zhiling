import { Component, Label, Node, Button, Size, UITransform, Vec3} from "cc";
import { AutoScroller } from "../../utils/AutoScroller";
import PlayerData, { } from "../roleModule/PlayerData"
 import {SFishingTradePlayerSettlementRecordData,SFishingTradeRoundSettlementRecordData} from "../roleModule/PlayerStruct";
import { FishTradeLogItem } from "./FishTradeLogItem";
import { ClickTipsPanel } from "../common/ClickTipsPanel";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import { EventMgr, Evt_FishTradeLogDataUpdate } from "../../manager/EventMgr";
import { ToFixed, formatNumber } from "../../utils/Utils";
import { CfgMgr } from "../../manager/CfgMgr";

export class FishTradeLogPage extends Component {
    private rainbowNumLab:Label;
    private yuPiaoNumLab:Label;
    private downBtnCont:Node;
    private downBtnArrow:Node;
    private downBtn:Button;
    private downBtnTitle:Label;
    private allBtn:Button;
    private winBtn:Button;
    private failBtn:Button;
    private logList:AutoScroller;
    private noneListCont:Node;
    protected $loadSub:Promise<any>;
    protected complete:Function;
    protected hasLoad = false;
    private logDatas:SFishingTradePlayerSettlementRecordData[];
    private curSotr:number;
    private isCanUpdate:boolean;
    protected onLoad(): void {
        this.rainbowNumLab = this.node.getChildByPath("rainbowCont/rainbowNumLab").getComponent(Label);
        this.yuPiaoNumLab = this.node.getChildByPath("yuPiaoCont/numLab").getComponent(Label);
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
        EventMgr.on(Evt_FishTradeLogDataUpdate, this.onFishTradeDataLogUpdate, this);

        this.hasLoad = true;
        this.complete?.();   
        
    }

    protected get loadSub() {
        if (this.$loadSub) return this.$loadSub;
        let thisObj = this;
        this.$loadSub = new Promise((resolve, reject) => {
            thisObj.complete = resolve;
        });
    }
    private onFishTradeDataLogUpdate(query_type:number, round_records:SFishingTradeRoundSettlementRecordData[], player_records:SFishingTradePlayerSettlementRecordData[]):void{
        if(query_type != 1) return;
        if(!this.node.activeInHierarchy) return;
        if(!this.isCanUpdate) return;
        this.isCanUpdate = false;
        this.logDatas = player_records;
        this.sortLogData(this.curSotr);
    }
    async onShow():Promise<void>{
        this.node.active = true;
        if (!this.hasLoad) await this.loadSub;
        this.isCanUpdate = true;
        this.rainbowNumLab.string = formatNumber(PlayerData.roleInfo.currency, 2) + "";
        let yuPiaoNum:number = PlayerData.GetItemCount(CfgMgr.GetFishTradeCommon.ScoreItemId);
        this.yuPiaoNumLab.string = yuPiaoNum.toString();
        this.curSotr = 0;
        this.downBtnArrow.angle = 0;
        this.logDatas = [];
        Session.Send({type: MsgTypeSend.FishingTradeRecordQuery, data:{query_type:1, count:50}});
    }
    onHide():void{
        this.node.active = false;
        this.logDatas = null;
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
        let logs:SFishingTradePlayerSettlementRecordData[] = [];
        switch(type){
            case 0:
                this.downBtnTitle.string = "全部";
                logs = this.logDatas;
                break;
            case 1:
                this.downBtnTitle.string = "成功";
                for (let log of this.logDatas) {
                    if(log.fish_item && log.fish_item.length > 0){
                        logs.push(log);
                    }
                }
                break;
            case 2:
                this.downBtnTitle.string = "失败";
                for (let log of this.logDatas) {
                    if(!log.fish_item || log.fish_item.length < 1){
                        logs.push(log);
                    }
                }
                break;
        }
        logs.sort((a:SFishingTradePlayerSettlementRecordData, b:SFishingTradePlayerSettlementRecordData)=>{
            return b.round - a.round;
        })
        this.noneListCont.active = logs.length < 1;
        this.logList.UpdateDatas(logs);
    }
    
    protected updateLogItem(item: Node, data: SFishingTradePlayerSettlementRecordData) {
        let logItem = item.getComponent(FishTradeLogItem);
        if (!logItem) logItem = item.addComponent(FishTradeLogItem);
        logItem.SetData(data);
    }
}