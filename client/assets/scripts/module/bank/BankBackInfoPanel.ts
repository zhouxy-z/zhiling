import { Node } from "cc";
import { Panel } from "../../GameRoot";
import { AutoScroller } from "../../utils/AutoScroller";
import { CfgMgr, StdBank } from "../../manager/CfgMgr";
import { BankBackInfoItem } from "./BankBackInfoItem";
import { SBank, SThing } from "../roleModule/PlayerStruct";
import { ConsumeItem } from "../common/ConsumeItem";
import { ItemUtil } from "../../utils/ItemUtils";

export class BankBackInfoPanel extends Panel {
    protected prefab: string = "prefabs/panel/bank/BankBackInfoPanel";
    private savingsItem:ConsumeItem;
    private backGetItem:ConsumeItem;
    private list: AutoScroller;
    private std:StdBank;
    private data:SBank;
    protected onLoad(): void {
        this.savingsItem = this.find("savingsItem").addComponent(ConsumeItem);
        this.backGetItem = this.find("backGetItem").addComponent(ConsumeItem);
        this.list = this.find("list", AutoScroller);
        this.list.SetHandle(this.updateItem.bind(this));
        this.CloseBy("closeBtn");
        this.CloseBy("mask");
    }
    public flush(std:StdBank, data:SBank = null): void{
        this.std = std;
        this.data = data;
        this.updateShow();
    }
    
    protected onShow(): void {
        
        
    }

    protected onHide(...args: any[]): void {
        
    }
    
   
    private updateShow():void{
        let itemData:SThing;
        itemData = ItemUtil.CreateThing(this.std.CostType,this.std.CostId, this.std.CostNum);
        this.savingsItem.SetData(itemData);

        itemData = ItemUtil.CreateThing(this.std.CostType, this.std.CostId, CfgMgr.GetBankBackNum(this.std));
        this.backGetItem.SetData(itemData);
        
        this.list.UpdateDatas(this.std.day);
    }
    protected updateItem(item: Node, data: number, index:number) {
        let backInfoItem = item.getComponent(BankBackInfoItem)||item.addComponent(BankBackInfoItem);
        let isGet:boolean = false;
        if(this.data){
            isGet = index < this.data.settle_days;
        }
        backInfoItem.SetData(this.std, index, isGet);
    }
}