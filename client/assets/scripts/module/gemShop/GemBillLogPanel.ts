import { js, log, Node, Toggle } from "cc";
import { Panel } from "../../GameRoot";
import { AutoScroller } from "../../utils/AutoScroller";
import { EventMgr, Evt_CurrencyIncomInfoUpdate } from "../../manager/EventMgr";
import { MsgTypeSend } from "../../MsgType";
import { Session } from "../../net/Session";
import { ThingType } from "../../manager/CfgMgr";
import {  } from "../roleModule/PlayerData"
 import {SQueryThing} from "../roleModule/PlayerStruct";
import { GemBillLogItem } from "./GemBillLogItem";
/**流水日志类型*/
enum BillLogType {
    Get = 1,//获取
    Conversion,//兑换
}
export class GemBillLogPanel extends Panel {
    protected prefab: string = "prefabs/panel/gemShop/GemBillLogPanel";
    private navBtns:Node[];
    private logList:AutoScroller;
    private noneListCont:Node;
    private page: number;
    private curPage:number = 1;
    private countPage:number = 15;
    private curLogType:BillLogType;
    private dataMap:{[key:string]:SQueryThing[]};
    private logIdMap:{[key:string]:number};
    protected onLoad(): void {
        this.logIdMap = js.createMap(); 
        this.dataMap = js.createMap();
        this.dataMap[BillLogType.Get] = [];
        this.dataMap[BillLogType.Conversion] = [];

        this.noneListCont = this.find("noneListCont");
        this.navBtns = this.find("navBar/view/content").children.concat();
        this.logList = this.find("logList", AutoScroller);
        this.logList.SetHandle(this.updateLogItem.bind(this));
        this.CloseBy("mask");
        this.CloseBy("closeBtn");
        for (let btn of this.navBtns) {
            btn.on('toggle', this.onPage, this);
        }
        
    }
    public async flush(...args: any[]): Promise<void> {
        this.page = -1;
        this.curPage = 1;
        this.curLogType = BillLogType.Get;
        this.dataMap[BillLogType.Get] = [];
        this.dataMap[BillLogType.Conversion] = [];
        this.logIdMap = js.createMap();
        this.updateShow();
        this.SetPage(0);
    }
    
    protected onShow(): void {
        EventMgr.on(Evt_CurrencyIncomInfoUpdate, this.updateIncomeInfoData, this)
    }

    protected onHide(...args: any[]): void {

    }
    
    async SetPage(page: number) {
        if (!this.$hasLoad) await this.initSub;
        if (!this.navBtns[page]) return;
        this.page = undefined;
        this.navBtns[page].getComponent(Toggle).isChecked = true;
        this.onPage(this.navBtns[page].getComponent(Toggle));
    }
    private onPage(t: Toggle):void{
        if (!t.isChecked) return;
        let page = this.navBtns.indexOf(t.node);
        if (page < 0 || page == this.page) return;
        this.page = page;
        switch (page) {
            case 0: //获取记录
                this.curLogType = BillLogType.Get;
                break;
            case 1: //兑换记录
                this.curLogType = BillLogType.Conversion;
                break;
        }
        this.onSend(this.curPage);
    }
    private updateIncomeInfoData(list:SQueryThing[]) {
        if(!this.node.activeInHierarchy) return;
        if (list) {
            let logData:SQueryThing;
            let datas:SQueryThing[];
            for (let index = 0; index < list.length; index++) {
                logData = list[index];
                if(!this.logIdMap[logData.record_id]){
                    if(logData.count > 0)
                    {
                        this.dataMap[BillLogType.Get].push(logData);
                    }else{
                        this.dataMap[BillLogType.Conversion].push(logData);
                    }
                    this.logIdMap[logData.record_id] = 1;
                }
                
            }
        }
        let curPagedatas:SQueryThing[] = this.dataMap[this.curLogType];
        this.curPage = Math.max(Math.floor(curPagedatas.length / this.countPage), 1);
        this.updateShow();
    }
    private updateShow():void{
        let datas:SQueryThing[] = this.dataMap[this.curLogType];
        datas.sort((a, b) => b.time - a.time);
        this.logList.UpdateDatas(datas);
        this.noneListCont.active = datas.length < 1;
    }
    private updateLogItem(item: Node, data:SQueryThing, index:number) {
        let logItem:GemBillLogItem = item.getComponent(GemBillLogItem) || item.addComponent(GemBillLogItem);
        logItem.SetData(data);
        this.checkPage(index);
    }
    private checkPage(index:number):void{
        let datas:SQueryThing[] = this.dataMap[this.curLogType];
        if(index >= datas.length){
            this.onSend(this.curPage + 1);
        }
    }
    private onSend(page:number) {
        let data = {
            type: MsgTypeSend.QueryThingRecordsRequest,
            data: { count_filter: this.curLogType, type1: ThingType.ThingTypeGem, page_size: this.countPage, page: page}
        }
        Session.Send(data);
    }
}