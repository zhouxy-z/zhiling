import { Component, Label, Node } from "cc";
import { StdEquityCardTab } from "../../manager/CfgMgr";
import PlayerData from "../roleModule/PlayerData";
import { EventMgr, Evt_RightsGetReward } from "../../manager/EventMgr";

export class RightsTabItem extends Component {
    private def:Node;
    private defLab:Label;
    private select:Node;
    private selectLab:Label;
    private redPoint:Node;
    private isInit:boolean = false;
    private std:StdEquityCardTab;
    protected onLoad(): void {
        this.defLab = this.node.getChildByPath("def/lab").getComponent(Label);
        this.selectLab = this.node.getChildByPath("select/lab").getComponent(Label);
        this.redPoint = this.node.getChildByName("redpoint");
        this.isInit = true;
        this.updateShow();
        EventMgr.on(Evt_RightsGetReward, this.onUpdateData, this);
    }
    private onUpdateData():void{
        if(!this.node.activeInHierarchy) return;
        this.updateRedPoint();
    }
    SetData(data:StdEquityCardTab) {
        this.std = data;
        this.updateShow();
        
    }
    
    private updateShow():void {
        if(!this.isInit || !this.std) return;
        this.defLab.string = this.std.Name;
        this.selectLab.string = this.std.Name;
        this.updateRedPoint();
    }
    private updateRedPoint():void{
        this.redPoint.active = PlayerData.CheckEquityMaxTabRead(this.std.ID);
    }
}