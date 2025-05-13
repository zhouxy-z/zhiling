import { Node } from "cc";
import { Panel } from "../../GameRoot";
import { AutoScroller } from "../../utils/AutoScroller";
import { BankSvbingsInfoItem } from "./BankSavingsInfoItem";
import { SBank } from "../roleModule/PlayerStruct";

export class BankSavingsInfoPanel extends Panel {
    protected prefab: string = "prefabs/panel/bank/BankSavingsInfoPanel";
    private list: AutoScroller;
    private noneListCont:Node;
    private datas:SBank[];
    protected onLoad(): void {
        this.list = this.find("list", AutoScroller);
        this.list.SetHandle(this.updateItem.bind(this));
        this.noneListCont = this.find("noneListCont");
        this.CloseBy("closeBtn");
        this.CloseBy("mask");
    }
    public flush(datas:SBank[]): void{
        this.datas = datas;
        this.updateShow();
    }
    
    protected onShow(): void {
        this.datas = [];
        
    }

    protected onHide(...args: any[]): void {
        
    }
    
   
    private updateShow():void{
        this.list.UpdateDatas(this.datas);
        this.noneListCont.active = this.datas.length < 1;
    }
    protected updateItem(item: Node, data: any) {
        let sabingsInfo = item.getComponent(BankSvbingsInfoItem)||item.addComponent(BankSvbingsInfoItem);
        sabingsInfo.SetData(data);
    }
}