import { Component, Label } from "cc";
import { HeadItem } from "../common/HeadItem";
import { SFlipPrizeLogData, SPlayerViewInfo } from "../roleModule/PlayerStruct";
import { DateUtils } from "../../utils/DateUtils";

export class FlipPrizeLogItem extends Component {
    private head: HeadItem;
    private nameLab: Label;
    private timeLab: Label;
    private numLab: Label;
    private isInit: boolean = false;
    private data: SFlipPrizeLogData;
    protected onLoad(): void {
        this.head = this.node.getChildByName("HeadItem").addComponent(HeadItem);
        this.nameLab = this.node.getChildByName("nameLab").getComponent(Label);
        this.timeLab = this.node.getChildByName("timeLab").getComponent(Label);
        this.numLab = this.node.getChildByName("numLab").getComponent(Label);
        this.isInit = true;
        this.updaShow();
    }
    
    
    SetData(data: SFlipPrizeLogData): void{
        this.data = data;
        this.updaShow();
    }

    private updaShow():void{
        if(!this.isInit || !this.data) return;
        let viewInfo:SPlayerViewInfo = {player_id: this.data.player_id};
        this.head.SetData(viewInfo);
        this.nameLab.string = this.data.player_name;
        let dates:string[] = DateUtils.TimestampToDate(this.data.time * 1000, true);
        this.timeLab.string = `${dates[0]}-${dates[1]}-${dates[2]}  ${dates[3]}:${dates[4]}:${dates[5]}`;
        this.numLab.string = this.data.reward.toString();
    }
}