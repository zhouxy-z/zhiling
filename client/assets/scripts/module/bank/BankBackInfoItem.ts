import { Node, Component, Label} from "cc";
import { ConsumeItem } from "../common/ConsumeItem";
import {SThing} from "../roleModule/PlayerStruct";
import {StdBank} from "../../manager/CfgMgr";
import { ItemUtil } from "../../utils/ItemUtils";
export class BankBackInfoItem extends Component {
    private dayLab:Label;
    private backGetItem:ConsumeItem;
    private line:Node;
    private getLab:Node;
    private endTimeLab:Label;
    private isInit:boolean = false;
    private std:StdBank;
    private index:number;
    private isGet:boolean;
    protected onLoad(): void {
        this.dayLab = this.node.getChildByName("dayLab").getComponent(Label);
        this.backGetItem = this.node.getChildByName("backGetItem").addComponent(ConsumeItem);
        this.line = this.node.getChildByName("line");
        this.getLab = this.node.getChildByName("getLab");
        this.isInit = true;
        this.updateShow();
    }
    
    SetData(std:StdBank, index:number, isGet:boolean):void {
        this.std = std;
        this.index = index;
        this.isGet = isGet;
        this.updateShow();
    }
    
    
    private updateShow():void{
        if(!this.isInit || !this.std) return;
        this.dayLab.string = `第${this.index + 1}天`;
        let itemData:SThing;
        itemData = ItemUtil.CreateThing(this.std.CostType,this.std.CostId, this.std.day[this.index]);
        this.backGetItem.SetData(itemData);

        this.getLab.active = this.isGet;
        this.line.active = this.index < this.std.day.length - 1;
    }
}