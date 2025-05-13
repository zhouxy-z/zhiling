import { Node } from "cc";
import { Panel } from "../../GameRoot";
import { AutoScroller } from "../../utils/AutoScroller";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import { EventMgr, Evt_FlipGrandPrizeLog } from "../../manager/EventMgr";
import { SFlipPrizeLogData } from "../roleModule/PlayerStruct";
import { FlipPrizeLogItem } from "./FlipPrizeLogItem";


export class FlipPrizeLogPanel extends Panel {
    protected prefab: string = "prefabs/panel/flip/FlipPrizeLogPanel";
    private list: AutoScroller;
    private noneListCont: Node;
    protected onLoad(): void {
        this.list = this.find("list", AutoScroller);
        this.noneListCont = this.find("noneListCont");
        this.list.SetHandle(this.updateItem);
        this.CloseBy("closeBtn");
        this.CloseBy("mask");
    }
    public flush(id: number): void {
        this.list.UpdateDatas([]);
        Session.Send({type: MsgTypeSend.FlipGetGrandRewardRecord, data:{grand_prize_id:id, count: 50}});
    }

    protected onShow(): void {
        EventMgr.on(Evt_FlipGrandPrizeLog, this.onUpdateLog, this);
    }

    protected onHide(...args: any[]): void {
        EventMgr.on(Evt_FlipGrandPrizeLog, this.onUpdateLog, this);
    }   
    private onUpdateLog(list:SFlipPrizeLogData[]):void{
        this.list.UpdateDatas(list);
        this.noneListCont.active = list.length < 1;
    }
    private updateItem(item: Node, data: SFlipPrizeLogData):void{
        let com: FlipPrizeLogItem = item.getComponent(FlipPrizeLogItem) || item.addComponent(FlipPrizeLogItem);
        com.SetData(data);
    }
}