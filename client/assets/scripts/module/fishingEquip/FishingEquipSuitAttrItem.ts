import { Component, Label} from "cc";

export class FishingEquipSuitAttrItem extends Component {
    private lab:Label;
    private isInit:boolean = false;
    private data:string;
    protected onLoad(): void {
        this.lab = this.node.getChildByName("lab").getComponent(Label);
        this.isInit = true;
        this.updateShow();
    }
    
    SetData(data:string):void{
        this.data = data;
        this.updateShow();
    }
    private updateShow():void{
        if(!this.isInit || !this.data) return;
        this.lab.string = this.data;
    }
}