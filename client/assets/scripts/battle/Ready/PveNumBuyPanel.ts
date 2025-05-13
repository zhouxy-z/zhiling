import { Button, Label, Node, Slider, UITransform } from "cc";
import { Panel } from "../../GameRoot";
import { ConsumeItem, ConsumeNumFormatType } from "../../module/common/ConsumeItem";
import { CfgMgr, StdCommonType, ThingItemId, ThingType } from "../../manager/CfgMgr";
import { ItemUtil } from "../../utils/ItemUtils";
import PlayerData, { } from "../../module/roleModule/PlayerData"
 import {SPlayerDataPve,SThing} from "../../module/roleModule/PlayerStruct";
import { AutoScroller } from "../../utils/AutoScroller";
import { PveNumBuyItem } from "./PveNumBuyItem";
import { formatNumber } from "../../utils/Utils";
import { Session } from "../../net/Session";
import { MsgTypeRet, MsgTypeSend } from "../../MsgType";
import { MsgPanel } from "../../module/common/MsgPanel";
import { EventMgr, Evt_Item_Change } from "../../manager/EventMgr";

export class PveNumBuyPanel extends Panel {
    protected prefab: string = "prefabs/pve/PveNumBuyPanel";
    private list:AutoScroller;
    private residueNumLab:Label;
    private numLab:Label;
    private leftBtn:Button;
    private slider:Slider;
    private sliderBar:Node;
    private rightBtn:Button;
    private maxBtn:Button;
    private consumeItem:ConsumeItem;
    private btn:Button;
    private stdPve;
    private pveData:SPlayerDataPve;
    private curNum:number = 1;
    private maxNum:number = 1;
    private datas:SThing[] = [];
    private curSelectIndex:number;
    private curSelectData:SThing;
    protected onLoad(): void {
        this.stdPve = CfgMgr.GetCommon(StdCommonType.PVE);
        let itemData:SThing = ItemUtil.CreateThing(ThingType.ThingTypeCurrency, 0, this.stdPve.Money);
        this.datas.push(itemData);
        itemData = ItemUtil.CreateThing(ThingType.ThingTypeItem, this.stdPve.ConsumeItem, this.stdPve.ConsumeNumber);
        this.datas.push(itemData);
        this.list = this.find("list", AutoScroller);
        this.list.SetHandle(this.updateItem.bind(this));
        this.list.node.on('select', this.onSelect, this);
        this.numLab = this.find("numLab", Label);
        this.leftBtn = this.find("sliderCont/leftBtn", Button);
        this.slider = this.find("sliderCont/slider", Slider);
        this.sliderBar = this.find("sliderCont/slider/sliderBar");
        this.slider.node.on('slide', this.onSlide, this);
        this.rightBtn = this.find("sliderCont/rightBtn", Button);
        this.maxBtn = this.find("sliderCont/maxBtn", Button);
        this.consumeItem = this.find("consumeItem").addComponent(ConsumeItem);
        this.btn = this.find("btn",Button);
        this.residueNumLab = this.find("numCont/residueNumLab", Label);
        this.btn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.leftBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.rightBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.maxBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.CloseBy("mask");
        this.CloseBy("closeBtn");
        Session.on(MsgTypeRet.BuyPvETimesRet, this.onBuyPvETimesRet, this);
    }
    public flush(selectIndex:number = -1): void{
        this.pveData = PlayerData.pveData;
        this.residueNumLab.string = `${this.pveData.times}次`;
        this.curSelectIndex = selectIndex < 0 ? 0 : selectIndex;
        this.curSelectData = this.datas[this.curSelectIndex];
        this.list.UpdateDatas(this.datas);
        this.updateShow();
        
    }
    
    protected onShow(): void {
        EventMgr.on(Evt_Item_Change, this.onItemUpdate, this);
    }

    protected onHide(...args: any[]): void {
        EventMgr.off(Evt_Item_Change, this.onItemUpdate, this);
    }
    private onItemUpdate():void{
        this.updateConsume();
    }
    private onBuyPvETimesRet(data:any):void{
        if (data && data.pve_data){
            let addNum:number = data.pve_data.times - this.pveData.times;
            MsgPanel.Show("探险次数+" + addNum);
            PlayerData.updataPveData(data.pve_data);
            this.flush(this.curSelectIndex);
        }
    }

    private onSlide(event: Slider) {
        let tempNum:number = Math.ceil(event.progress * this.maxNum);
        if(tempNum > this.maxNum) tempNum = this.maxNum;
        this.curNum = Math.max(tempNum, this.maxNum > 0 ? 1 : 0);
        this.changeSlidePro(3);
    }
    private changeSlidePro(type:number):void{
        if(type == 0){
            if(this.curNum > 1){
                this.curNum --;
            }
        }else if(type == 1){
            if(this.curNum < this.maxNum){
                this.curNum ++;
            }
        }else if(type == 2){
            if(this.curNum != this.maxNum){
                this.curNum = this.maxNum;
            }
        }
        if(this.maxNum < 1){
            this.slider.progress = 0;
            this.curNum = 1;
        }else{
            this.slider.progress = this.curNum / this.maxNum;
        }
        
        let barTrans = this.sliderBar.getComponent(UITransform);
        let sliderTrans = this.slider.getComponent(UITransform);
        barTrans.setContentSize(this.slider.progress * sliderTrans.width, barTrans.height);
        this.numLab.string = this.curNum.toString();

        this.updateConsume();
    }

    private updateItem(item: Node, data: SThing, index:number):void{
        let bankItem:PveNumBuyItem = item.getComponent(PveNumBuyItem) || item.addComponent(PveNumBuyItem);
        item.getChildByName("select").active = index == this.curSelectIndex;

        bankItem.SetData(this.datas[index], this.pveData.paid_refresh_times, index == 0 ? this.stdPve.AddCountMax : 0);
    }

    private onSelect(index: number, item: Node):void{
        this.resetSelect();
        if(item){
            let select:Node = item.getChildByName("select");
            if(select){
                select.active = true;
            }else{
                return;
            } 
        }
        this.curSelectIndex = index;
        this.curSelectData = this.datas[this.curSelectIndex];
        this.updateShow();
    }
    private resetSelect():void{
        let children:Node[] = this.list.node.getChildByPath("view/content").children;
        for (let i = 0; i < children.length; i++) {
            let node:Node = children[i];
            node.getChildByName("select").active = false;
        }
    }
    private onBtnClick(btn:Button):void{
        switch(btn){
            case this.btn:
                if(this.curSelectIndex == 0){
                    if(this.pveData.paid_refresh_times < 1){
                        MsgPanel.Show("可兑换次数不足");
                        return;
                    }
                    if (!ItemUtil.CheckThingConsumes([this.curSelectData.type], [this.curSelectData.item.id], [this.curSelectData.item.count.mul(this.curNum)], true)) {
                        return;
                    }
                    Session.Send({ type: MsgTypeSend.BuyPvETimes, data: {times:this.curNum}});
                }else{
                    if (!ItemUtil.CheckThingConsumes([this.curSelectData.type], [this.curSelectData.item.id], [this.curSelectData.item.count.mul(this.curNum)], true)) {
                        return;
                    }
                    Session.Send({
                        type: MsgTypeSend.UseItems,
                        data: {
                            item_id: this.curSelectData.item.id,
                            item_num:this.curNum
                        }
                    });
                }
                break;
            case this.leftBtn:
                this.changeSlidePro(0);
                break;
            case this.rightBtn:
                this.changeSlidePro(1);
                break;
            case this.maxBtn:
                this.changeSlidePro(2);
                break;
        }
    }
    private updateShow():void{
        if(this.curSelectIndex == 0){
            this.maxNum = this.pveData.paid_refresh_times;
        }else{
            this.maxNum = ItemUtil.GetHaveThingNum(this.curSelectData.type, this.curSelectData.item.id);
        }
        
        this.curNum = 1;
        this.changeSlidePro(3);
    }
    private updateConsume():void{
        let haveNum:number = ItemUtil.GetHaveThingNum(this.curSelectData.type, this.curSelectData.item.id);
        let value:number = this.curSelectData.item.count.mul(this.curNum);
        this.consumeItem.FormatCountCb((num:number)=>{
            if(ThingItemId[this.curSelectData.item.id]){
                return`${formatNumber(value, 2)}/${formatNumber(haveNum, 2)}`;
            }else{
                return`${value}/${haveNum}`;
            }
        });
        this.consumeItem.SetData(this.curSelectData);
        
    }
}