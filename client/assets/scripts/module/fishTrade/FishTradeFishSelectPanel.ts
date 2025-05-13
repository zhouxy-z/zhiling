import { Button, instantiate, Label, Layout, Node, Size, UITransform, Vec3 } from "cc";
import { Panel } from "../../GameRoot";
import { AutoScroller } from "../../utils/AutoScroller";
import PlayerData, {  } from "../roleModule/PlayerData"
 import {SFishingItem} from "../roleModule/PlayerStruct";
import { FishTradeFishSelectItem } from "./FishTradeFishSelectItem";
import { CfgMgr, StdFishItem } from "../../manager/CfgMgr";
import { ClickTipsPanel } from "../common/ClickTipsPanel";
import { MsgPanel } from "../common/MsgPanel";
import { formatNumber } from "../../utils/Utils";
import { EventMgr, Evt_FishTradeSelect } from "../../manager/EventMgr";

export class FishTradeFishSelectPanel extends Panel {
    protected prefab: string = "prefabs/panel/fishTrade/FishTradeFishSelectPanel";
    private weightLab:Label;
    private list:AutoScroller;
    private noneListCont:Node;
    private downFishBtn:Button;
    private downFishBtnArrow:Node;
    private downFishBtnLab:Label;
    private downFishCont:Node;
    private downFishBtnCont:Node;
    private tempBtnNode:Node;
    private allSelectBtn:Button;
    private selectList:number[];
    private fishShopDatas:SFishingItem[];
    private curNumIndex:number = 0;
    private numList:number[];
    private maxWeight:number;
    private curWeight:number;
    protected onLoad(): void {

        this.numList = [0];
        this.numList = this.numList.concat(CfgMgr.GetFishTradeCommon.FishSelectWeightType).reverse();

        this.weightLab = this.find("fishWeightCont/weightLab", Label);
        this.list = this.find("list", AutoScroller);
        this.list.SetHandle(this.updateItem.bind(this));
        this.noneListCont = this.find("noneListCont");
        this.list.node.on('select', this.onSelect, this);

        this.downFishBtn = this.find("downFishBtn", Button);
        this.downFishBtnLab = this.find("downFishBtn/numLab", Label);
        this.downFishBtnArrow = this.find("downFishBtn/arrow");
        this.downFishCont = this.find("downFishCont");
        this.downFishBtnCont = this.find("downFishCont/btnCont");
        this.tempBtnNode = this.find("downFishCont/tempBtnNode");
        this.downFishCont.active = false;

        this.allSelectBtn = this.find("allSelectBtn", Button);

        this.allSelectBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.downFishBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.CloseBy("mask");
        this.CloseBy("closeBtn");


    }
    public flush(selectList:number[]): void {
        
        this.maxWeight = 0;
        let weight:number = 0;
        let fishItem:SFishingItem;
        let newItemIdList:number[] = [];
        for (let index = 0; index < selectList.length; index++) {
            fishItem = PlayerData.GetFishItem(selectList[index]);
            if(fishItem){
                newItemIdList.push(fishItem.id);
                weight = weight.add(fishItem.weight);
            }
        }
        this.selectList = newItemIdList;
        this.curWeight = weight;
        this.downFishBtnArrow.angle = -90;
        
        this.updateShow();
        this.resetNumSelect();
        this.updateWeight();
        
    }
    
    protected onShow(): void {
        
    }

    protected onHide(...args: any[]): void {
        EventMgr.emit(Evt_FishTradeSelect, this.selectList);
    }
    private updateShow():void{
        this.fishShopDatas = PlayerData.fishItems ? PlayerData.fishItems.concat() : [];
        this.fishShopDatas.sort((a:SFishingItem, b:SFishingItem)=>{
            return a.weight - b.weight;
        });
        for (let index = 0; index < this.fishShopDatas.length; index++) {
            this.maxWeight = this.maxWeight.add(this.fishShopDatas[index].weight);
        }
        this.noneListCont.active = this.fishShopDatas.length < 1;
        this.list.UpdateDatas(this.fishShopDatas);
    }
    private onShowFishMenu():void{
        this.downFishBtnArrow.angle = -90;
        let len:number = this.numList.length;
        let maxLen = Math.max(len, this.downFishBtnCont.children.length);
        let layout:Layout = this.downFishBtnCont.getComponent(Layout);
        let totalH:number = layout.paddingTop + layout.paddingBottom;
        let btnNode:Node; 
        let btn:Button;
        let btnNumLab:Label;
        let itemNum:number;
        for (let index = 0; index < maxLen; index++) {
            btnNode = this.downFishBtnCont.children[index];
            if(!btnNode){
                btnNode = instantiate(this.tempBtnNode);
                btnNode.parent = this.downFishBtnCont;
            }
            btnNumLab = btnNode.getChildByName("numLab").getComponent(Label);
            btn = btnNode.getComponent(Button);
            btn.node.targetOff(this);
            if(index < len){
                itemNum = this.numList[index];
                btnNumLab.string = `~${itemNum}`;
                btnNode.position = new Vec3(0,0,0);
                btnNode.active = true;
                btn.node.on(Button.EventType.CLICK, this.onFishMenuBtnClick.bind(this, index), this);
                totalH += btnNode.getComponent(UITransform).height;
                totalH += layout.spacingY;
    
                if(index < this.numList.length - 1) totalH += layout.spacingY;
            }else{
                btnNode.active = false;
            }
        }
        let showPos = this.downFishBtn.node.worldPosition.clone();
        this.downFishBtnCont.getComponent(UITransform).height = totalH;
        this.downFishCont.getComponent(UITransform).height = totalH;
        showPos.y += 60;
        ClickTipsPanel.Show(this.downFishCont, this.node, this.downFishBtn.node, showPos, 0,()=>{
            this.downFishBtnArrow.angle = -90;
        });
    }

    private onFishMenuBtnClick(index:number):void{
        this.curNumIndex = index;
        this.updateNumSelect(true);
        ClickTipsPanel.Hide();
    }
    private onBtnClick(btn:Button):void{
        switch(btn){
            case this.downFishBtn:
                this.onShowFishMenu();
                break;
            case this.allSelectBtn:
                if(this.selectList.length < this.fishShopDatas.length){
                    this.selectAll();
                }else{
                    this.cancelAllSelect();
                } 
                break;
        }
    }

    protected updateItem(item: Node, data: SFishingItem) {
        let com = item.getComponent(FishTradeFishSelectItem) || item.addComponent(FishTradeFishSelectItem);
        let select:Node = item.getChildByName("select");
        select.active = this.selectList.indexOf(data.id) > -1;
        com.SetData(data);
    }
    private onSelect(index: number, item: Node):void{
        let select:Node = item.getChildByName("select");
        let selectData:SFishingItem = this.fishShopDatas[index];
        let findIndex:number = this.selectList.indexOf(selectData.id);
        if(findIndex > -1){
            select.active = false;
            this.selectList.splice(findIndex, 1);
            this.curWeight = this.curWeight.sub(selectData.weight);
        }else{
            select.active = true;
            this.selectList.push(selectData.id);
            this.curWeight = this.curWeight.add(selectData.weight);
        }
        this.updateWeight();
        this.resetNumSelect();
    }
    private resetNumSelect():void{
        this.curNumIndex = this.numList.length - 1;
        this.updateNumSelect();
    }
    private updateNumSelect(isUpdate:boolean = false):void{
        let num:number = this.numList[this.curNumIndex];
        this.downFishBtnLab.string = num == 0 ? "快速选择" : `~${num}`;
        if(isUpdate){
            this.autoSelect(num);
        }
    }   

    private autoSelect(num:number):void{
        let fishData:SFishingItem;
        let curNum:number = 0;
        let curSeletId:number[] = [];
        for (let index = 0; index < this.fishShopDatas.length; index++) {
            fishData = this.fishShopDatas[index];
            if(curNum < num){
                curNum = curNum.add(fishData.weight);
                curSeletId.push(fishData.id);
            }
            if(curNum >= num){
                break;
            }
        }
        this.curWeight = curNum;

        if(curSeletId.length){
            this.selectList = curSeletId;
            
        }else{
            this.selectList = [];
            this.curNumIndex = this.numList.length - 1;
            this.updateNumSelect();
            
        }
        this.updateWeight();
        this.updateListSelect();
    }
    private selectAll():void{
        this.selectList = [];
        this.curWeight = 0;
        let fishData:SFishingItem;
        for (let index = 0; index < this.fishShopDatas.length; index++) {
            fishData = this.fishShopDatas[index];
            this.curWeight = this.curWeight.add(fishData.weight);
            this.selectList.push(fishData.id);
        }
        this.updateWeight();
        this.resetNumSelect();
        this.updateListSelect();
    }
    private cancelAllSelect():void{
        this.selectList = [];
        this.curWeight = 0;
        this.updateWeight();
        this.resetNumSelect();
        this.updateListSelect();
    }
    private updateListSelect():void{
        let children:Node[] = this.list.node.getChildByPath("view/content").children;
        for (let i = 0; i < children.length; i++) {
            let node:Node = children[i];
            let selectNode:Node;
            let com:FishTradeFishSelectItem;
            let isSelect:boolean;
            if(node){
                isSelect = false;
                selectNode = node.getChildByName("select");
                com = node.getComponent(FishTradeFishSelectItem);
                isSelect = com && com.Data && this.selectList.indexOf(com.Data.id) > -1;
                if(selectNode){
                    selectNode.active = isSelect;
                }
            }
        }
    }
    private updateWeight():void{
        this.weightLab.string = formatNumber(this.curWeight, 2) + "/" + formatNumber(this.maxWeight, 2);
    }
}