import { Node, Component, Label } from "cc";
import { AwardItem } from "../common/AwardItem";
import { SThing } from "../roleModule/PlayerStruct";

export class LootVsNumBuyItem extends Component {
    private numTitleLab:Node;
    private awardItem:AwardItem;
    private numLab:Label;
    private isInit:boolean = false;
    private data:SThing;
    private curNum:number;
    private maxNum:number;
    protected onLoad(): void {
        this.awardItem = this.node.getChildByName("AwardItem").addComponent(AwardItem);
        this.numTitleLab = this.node.getChildByPath("numCont/numTitleLab");
        this.numLab = this.node.getChildByPath("numCont/numLab").getComponent(Label);
        this.isInit = true;
        this.updateShow(); 
    }
   
    SetData(data:SThing, curNum:number, maxNum:number) {
        this.data = data;
        this.curNum = curNum;
        this.maxNum = maxNum;
        this.updateShow();
    }
    
    private updateShow():void{
        if(!this.isInit || !this.data) return;
        this.awardItem.SetData({itemData:this.data});
        if(this.maxNum > 0){
            this.numTitleLab.active = true;
            this.numLab.string = `${this.curNum}/${this.maxNum}`;
        }else{
            this.numTitleLab.active = false;
            this.numLab.string = "不限兑换次数";
        }
    }
    
}