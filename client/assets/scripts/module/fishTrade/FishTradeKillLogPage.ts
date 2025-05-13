import { Color, Component, Label, Node} from "cc";
import { EventMgr, Evt_FishTradeLogDataUpdate } from "../../manager/EventMgr";
import { } from "../roleModule/PlayerData"
 import {SFishingTradePlayerSettlementRecordData,SFishingTradeRoundSettlementRecordData,SFishingFrozenLogData,SFishingLogData} from "../roleModule/PlayerStruct";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import { AutoScroller } from "../../utils/AutoScroller";
import { CfgMgr, StdFishTradeShip, StdLake } from "../../manager/CfgMgr";

export class FishTradeKillLogPage extends Component {
    private oneHundredList:AutoScroller;
    private twentyList:AutoScroller;
    protected $loadSub: Promise<any>;
    protected complete: Function;
    protected hasLoad = false;
    private logDatas:SFishingTradeRoundSettlementRecordData[];
    private killShip:{[key:string]:{shipId:number, num:number, isTop:boolean}};
    private isCanUpdate:boolean;
    protected onLoad(): void {
        this.oneHundredList = this.node.getChildByName("oneHundredList").getComponent(AutoScroller);
        this.twentyList = this.node.getChildByName("twentyList").getComponent(AutoScroller);
        this.oneHundredList.SetHandle(this.updateOneHundItem.bind(this));
        this.twentyList.SetHandle(this.updateTwentyItem.bind(this));
        
        this.hasLoad = true;
        this.complete?.();   
        EventMgr.on(Evt_FishTradeLogDataUpdate, this.onFishTradeDataLogUpdate, this);
    }

    protected get loadSub() {
        if (this.$loadSub) return this.$loadSub;
        let thisObj = this;
        this.$loadSub = new Promise((resolve, reject) => {
            thisObj.complete = resolve;
        });
    }
    async onShow():Promise<void>{
        this.node.active = true;
        this.isCanUpdate = true;
        if (!this.hasLoad) await this.loadSub;
        this.killShip = {};
        this.logDatas = [];
        Session.Send({type: MsgTypeSend.FishingTradeRecordQuery, data:{query_type:0, count:100}});
    }
    onHide():void{
        this.node.active = false;
        this.logDatas = null;
        this.killShip = {};
    }
    private onFishTradeDataLogUpdate(query_type:number, round_records:SFishingTradeRoundSettlementRecordData[], player_records:SFishingTradePlayerSettlementRecordData[]):void{
        if(query_type != 0) return;
        if(!this.node.activeInHierarchy) return;
        if(!this.isCanUpdate) return;
        this.isCanUpdate = false;
        this.logDatas = round_records;
        this.killShip = {};
        if(this.logDatas && this.logDatas.length){
            let shipInfo:{shipId:number, num:number, isTop:boolean};
            let topId:number = 0;
            let topNum:number = 0;
            
            for (const log of this.logDatas) {
                if(log.kill_ship_list){
                    for (let index = 0; index < log.kill_ship_list.length; index++) {
                        shipInfo = this.killShip[log.kill_ship_list[index]];
                        if(!shipInfo){
                            shipInfo = {shipId:log.kill_ship_list[index], num:0, isTop:false};
                            this.killShip[log.kill_ship_list[index]] = shipInfo;
                        }
                        shipInfo.num++;
                        if(topId > 0){
                            if(topNum < shipInfo.num)
                            {
                                topId = shipInfo.shipId;
                                topNum = shipInfo.num;
                            }
                        }else{
                            topId = shipInfo.shipId;
                            topNum = shipInfo.num;
                        }
                        
                    }
                }
            }
            if(this.killShip[topId]) this.killShip[topId].isTop = true;
        }
        
        this.updateCont();
    }
    private updateCont():void{
        this.oneHundredList.UpdateDatas(CfgMgr.GetFishTradeShipList);
        this.twentyList.UpdateDatas(this.logDatas);
    }
    protected updateOneHundItem(item: Node, stdShip: StdFishTradeShip) {
        let shipNameLab:Label = item.getChildByName("cityNameLab").getComponent(Label);
        shipNameLab.string = stdShip.Name;
        let numLab:Label = item.getChildByName("numLab").getComponent(Label);
        let shipInfo:{shipId:number, num:number, isTop:boolean} = this.killShip[stdShip.ShipId];
        if(shipInfo){
            numLab.color = new Color().fromHEX(shipInfo.isTop ? "#DC7816" : "#3D7A97");
            numLab.string = shipInfo.num.toString();
        }else{
            numLab.color = new Color().fromHEX("#3D7A97");
            numLab.string = "0";
        }
        
    }
    protected updateTwentyItem(item: Node, data: SFishingTradeRoundSettlementRecordData) {
        let phaseLab:Label = item.getChildByName("phaseLab").getComponent(Label);
        let shipNameLab:Label = item.getChildByName("cityNameLab").getComponent(Label);
        let nameStr:string = "";
        let stdShip:StdFishTradeShip;
        if(data.kill_ship_list){
            for (let index = 0; index < data.kill_ship_list.length; index++) {
                stdShip = CfgMgr.GetFishTradeShip(data.kill_ship_list[index]);
                if(nameStr!="") nameStr += "、";
                nameStr += stdShip.Name;
            }
        }
        
        shipNameLab.string = nameStr != "" ? nameStr : "无";
        phaseLab.string = `${data.round}期`;
    }
}