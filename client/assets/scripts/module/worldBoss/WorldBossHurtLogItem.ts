import { Component, Label, Node } from "cc";
import { HeadItem } from "../common/HeadItem";
import { SWorldBossHurtLogData } from "../roleModule/PlayerStruct";
import { DateUtils } from "../../utils/DateUtils";

export class WorldBossHurtLogItem extends Component {
    private timeLab: Label;
    private hurtLab: Label;
    private line: Node;
    private index:number;
    private len:number;
    private logData:SWorldBossHurtLogData;
    private isInit:boolean = false;
    protected onLoad(): void {
        this.timeLab = this.node.getChildByName("timeLab").getComponent(Label);
        this.hurtLab = this.node.getChildByName("hurtLab").getComponent(Label);
        this.line = this.node.getChildByName("line");
        this.isInit = true;
        this.updateShow();
    }

    SetData(logData:SWorldBossHurtLogData, index:number, len:number) {
        this.logData = logData;
        this.index = index;
        this.updateShow();
    }
    
    private updateShow():void{
        if(!this.isInit || !this.logData) return;
        let dates:string[] = DateUtils.TimestampToDate(this.logData.s, true);
        this.timeLab.string = `${dates[0]}-${dates[1]}-${dates[2]}  ${dates[3]}:${dates[4]}:${dates[5]}`;
        this.hurtLab.string = this.logData.h.toString();
        if(this.len > 0 && this.index < this.len){
            this.line.active = true;
        }else{
            this.line.active = false;
        }
        
    }
}