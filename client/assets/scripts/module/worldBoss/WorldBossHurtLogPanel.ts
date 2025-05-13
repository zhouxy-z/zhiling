import { Node } from "cc";
import { Panel } from "../../GameRoot";
import { AutoScroller } from "../../utils/AutoScroller";
import { WorldBossHurtLogItem } from "./WorldBossHurtLogItem";
import { EventMgr, Evt_WorldBossHurtLog } from "../../manager/EventMgr";
import { SWorldBossHurtLogData } from "../roleModule/PlayerStruct";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";

export class WorldBossHurtLogPanel extends Panel {
    protected prefab: string = "prefabs/panel/worldBoss/WorldBossHurtLogPanel";
    private logList:AutoScroller;
    private noneListCont:Node;
    private datas:SWorldBossHurtLogData[];
    protected onLoad(): void {
        this.logList = this.find("logList", AutoScroller);
        this.logList.SetHandle(this.updateLogItem.bind(this));
        this.noneListCont = this.find("noneListCont");
        this.CloseBy("backBtn");
        this.CloseBy("mask");
        
    }

    protected update(dt: number): void {
        
    }

    public flush(): void{
        this.datas = [];
        this.updateShow();
        Session.Send({ type: MsgTypeSend.GetPlayerOnceData, data: {} });
    }
    
    protected onShow(): void {
        EventMgr.on(Evt_WorldBossHurtLog, this.onLogUpdate, this);
    }

    protected onHide(...args: any[]): void {
        EventMgr.off(Evt_WorldBossHurtLog, this.onLogUpdate, this);
    }
    private onLogUpdate(datas:SWorldBossHurtLogData[]):void{
        this.datas = datas.sort((a:SWorldBossHurtLogData, b:SWorldBossHurtLogData)=>{
            return b.s - a.s;
        });
        this.updateShow();
        
    }
    private updateShow():void{
        this.noneListCont.active = this.datas.length < 1;
        this.logList.UpdateDatas(this.datas);
    }
    protected updateLogItem(item: Node, data: SWorldBossHurtLogData, index:number) {
        let rankItem = item.getComponent(WorldBossHurtLogItem) || item.addComponent(WorldBossHurtLogItem);
        rankItem.SetData(data, index, this.datas.length);
    }
}