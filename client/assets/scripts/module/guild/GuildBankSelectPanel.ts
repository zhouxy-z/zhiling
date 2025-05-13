import { Button, instantiate, js, Label, Layout, Node, path, RichText, Sprite, SpriteFrame, Toggle, UITransform, Vec3 } from "cc";
import { Panel } from "../../GameRoot";
import { AutoScroller } from "../../utils/AutoScroller";
import { GuildBankItem } from "./GuildBankItem";
import { CfgMgr, StdGuildBank, ThingType } from "../../manager/CfgMgr";
import PlayerData, {} from "../roleModule/PlayerData"
 import {SDeposit,SGuildDepositTotal,SThing} from "../roleModule/PlayerStruct";
import { GuildSavingsPanel } from "./GuildSavingsPanel";
import { EventMgr, Evt_GuildBankMenuShow, Evt_GuildChange } from "../../manager/EventMgr";
import { ConsumeItem } from "../common/ConsumeItem";
import { ItemUtil } from "../../utils/ItemUtils";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import { formatNumber } from "../../utils/Utils";
import { ClickTipsPanel } from "../common/ClickTipsPanel";
import { GameSet } from "../GameSet";
import { ResMgr } from "../../manager/ResMgr";

export class GuildBankSelectPanel extends Panel {
    protected prefab: string = "prefabs/panel/guild/GuildBankSelectPanel";
    private topBg:Sprite;
    private curInterestNumLab:Label;
    private helpBtn:Button;
    private totalItem:ConsumeItem;
    private list:AutoScroller;
    private noneListCont:Node;
    private haveItem:ConsumeItem;
    private okBtn:Button;
    private navBtns:Node[];
    private downBtnCont: Node;
    private btnCont:Node;
    private tempBtnNode:Node;
    
    private datas:StdGuildBank[];
    private curSelectIndex:number;
    private curSelectStd:StdGuildBank;
    private curSelectTotlaData:SGuildDepositTotal;
    private info:SDeposit;
    private total:{[key:string]:SGuildDepositTotal};
    private page: number;
    private costIndexMap:{[key:string]:number};
    protected onLoad(): void {
        this.topBg = this.find("topBg",Sprite);
        this.curInterestNumLab = this.find("curInterestNumLab", Label);
        this.totalItem = this.find("totalItem").addComponent(ConsumeItem);
        this.helpBtn = this.find("helpBtn", Button);
        this.list = this.find("list", AutoScroller);
        this.noneListCont = this.find("noneListCont");
        this.list.SetHandle(this.updateBankItem.bind(this));
        this.list.node.on('select', this.onBankSelect, this);
        this.haveItem = this.find("haveItem").addComponent(ConsumeItem);
        this.okBtn = this.find("okBtn", Button);
        this.navBtns = this.find("navBar/view/content").children.concat();
        this.downBtnCont = this.find("downBtnCont");
        this.btnCont = this.find("downBtnCont/btnCont");
        this.tempBtnNode = this.find("downBtnCont/tempBtnNode");


        this.helpBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.okBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.downBtnCont.active = false;
        this.CloseBy("closeBtn");
        this.CloseBy("mask");

        for (let btn of this.navBtns) {
            btn.on('toggle', this.onPage, this);
        }
    }
    public flush(info:SDeposit, map:{[key:string]:SGuildDepositTotal}): void{
        this.info = info;
        this.total = map;
        this.page = -1;
        this.costIndexMap = js.createMap();
        this.SetPage(0);
    }
    async SetPage(page: number) {
        if (!this.$hasLoad) await this.initSub;
        if (!this.navBtns[page]) return;
        this.page = undefined;
        this.navBtns[page].getComponent(Toggle).isChecked = true;
        this.onPage(this.navBtns[page].getComponent(Toggle));
    }
    protected onShow(): void {
        EventMgr.on(Evt_GuildChange, this.onGuildChange, this);
        EventMgr.on(Evt_GuildBankMenuShow, this.onShowMenu, this);
        let name:string = "topBg";
        if(GameSet.GetServerMark() == "hc" ){
            name = "topBg_hc";
        }else if(GameSet.GetServerMark() == "xf" ){
            name = "topBg_xf";
        }

        let url = path.join("sheets/guild/", name, "spriteFrame");
        ResMgr.LoadResAbSub(url, SpriteFrame, res => {
            this.topBg.spriteFrame = res;
        });
       
    }

    protected onHide(...args: any[]): void {
        ClickTipsPanel.Hide();
        EventMgr.off(Evt_GuildChange, this.onGuildChange, this);
        EventMgr.off(Evt_GuildBankMenuShow, this.onShowMenu, this);
    }
    private onShowMenu(item:Node, data:StdGuildBank, showPos:Vec3, clickTarget:Node):void{
        let len:number = data.CostType.length;
        let maxLen = Math.max(len, this.btnCont.children.length);
        let layout:Layout = this.btnCont.getComponent(Layout);
        let totalH:number = layout.paddingTop + layout.paddingBottom;
        let btnNode:Node; 
        let btn:Button;
        let itemNode:Node;
        let typeItemCom:ConsumeItem;
        let consumeItemList:ConsumeItem[] = [];
        let itemDataList:SThing[] = [];
        let itemData:SThing;
        for (let index = 0; index < maxLen; index++) {
            btnNode = this.btnCont.children[index];
            if(!btnNode){
                btnNode = instantiate(this.tempBtnNode);
                btnNode.parent = this.btnCont;
            }
            itemNode = btnNode.getChildByName("consumeItem");
            btn = btnNode.getComponent(Button);
            btn.node.targetOff(this);
            if(index < len){
                btnNode.position = new Vec3(0,0,0);
                typeItemCom = itemNode.getComponent(ConsumeItem) || itemNode.addComponent(ConsumeItem);
                consumeItemList.push(typeItemCom);
                itemData = ItemUtil.CreateThing(data.CostType[index],0,data.CostNum[index]);
                itemDataList.push(itemData);
                btnNode.active = true;
                btn.node.on(Button.EventType.CLICK, this.onMenuBtnClick.bind(this, item, data.DonateId, index), this);
                totalH += btnNode.getComponent(UITransform).height;
                if(index < data.CostType.length - 1) totalH += layout.spacingY;
            }else{
                btnNode.active = false;
            }
        }

        this.btnCont.getComponent(UITransform).height = totalH;
        this.downBtnCont.getComponent(UITransform).height = totalH;
        let downBg = this.downBtnCont.getChildByName("bg");
        downBg.getComponent(UITransform).height = totalH;
        showPos.x -= clickTarget.getComponent(UITransform).width / 2 + 40; 
        showPos.y -= this.downBtnCont.getComponent(UITransform).height / 2 + 40;
        this.scheduleOnce(()=>{
            let item:ConsumeItem;
            for (let index = 0; index < consumeItemList.length; index++) {
                item = consumeItemList[index];
                item.SetData(itemDataList[index]);
            }
        },0.1)
        ClickTipsPanel.Show(this.downBtnCont, this.node, clickTarget, showPos, 0);
         
    }
    private onPage(t: Toggle):void{
        if (!t.isChecked) return;
        let page = this.navBtns.indexOf(t.node);
        if (page < 0 || page == this.page) return;
        this.page = page;
        switch (page) {
            case 0: //彩虹体
                this.updateList(ThingType.ThingTypeCurrency);
                break;
            case 1: //荣耀石头
                this.updateList(ThingType.ThingTypeGemstone);
                break;
        }
    }
    private updateList(type:ThingType):void{
        let stdList:StdGuildBank[] = CfgMgr.GetGuildSavingsList(PlayerData.MyGuild.level);
        this.datas = [];
        let std:StdGuildBank;
        for (let index = 0; index < stdList.length; index++) {
            std = stdList[index];
            if(std.CostType && std.CostType.length > 0 && std.CostType[0] == type){
                this.datas.push(std);
            }
        }
        
        this.noneListCont.active = this.datas.length < 1;
        this.list.UpdateDatas(this.datas);
        this.list.SelectFirst();
        
    }
    private onGuildChange():void{
        if(!this.node.activeInHierarchy) return;
        if(!PlayerData.MyGuild){
            this.Hide();
        }
    }
    private onBtnClick(btn:Button):void{
        switch(btn){
            case this.helpBtn:
                Session.Send({ type: MsgTypeSend.GuildBankGetDonateDeposits, 
                    data: {
                        guild_id: PlayerData.MyGuild.guild_id,
                        donate_id: "",//this.curSelectStd.DonateId.toString(),
                    } 
                });
                break;
            case this.okBtn:
                Session.Send({ type: MsgTypeSend.GuildBankDeposit, 
                    data: {
                        guild_id: PlayerData.MyGuild.guild_id,
                        donate_id: this.curSelectStd.DonateId.toString(),
                        cost_idx: this.costIndexMap[this.curSelectStd.DonateId] || 0,
                    } 
                });
                break;
        }
    }
    private onMenuBtnClick(item:Node, stdId:number, index:number):void{
        ClickTipsPanel.Hide();
        this.costIndexMap[stdId] = index;
        let std:StdGuildBank = this.datas.find(stdGuildBank => stdGuildBank.DonateId === stdId)
        let children:Node[] = this.list.node.getChildByPath("view/content").children;
        for (let i = 0; i < children.length; i++) {
            let node:Node = children[i];
            if(node === item && std){
                this.updateBankItem(item, std, item["$$index"]);
                break;
            }
        }
        this.updateSelect();
    }
    private updateSelect():void{
        let costIndex:number = this.costIndexMap[this.curSelectStd.DonateId] || 0;
        let costType:number = this.curSelectStd.CostType[costIndex];
        let costNum:number = this.curSelectStd.CostNum[costIndex];
        this.curSelectTotlaData = this.total[costType];
        if(!this.curSelectTotlaData){
            this.curSelectTotlaData = {
                _id:"",
                guild_id:"",
                cost_type:costType,
                total_amount:0,
                total_record:0,
            }
        }
        this.curInterestNumLab.string = `${this.curSelectTotlaData.total_record}笔`;
        let itemData:SThing = ItemUtil.CreateThing(costType,0, this.curSelectTotlaData.total_amount);
        this.totalItem.SetData(itemData);

        itemData = ItemUtil.CreateThing(costType, 0 , costNum);
        this.haveItem.SetData(itemData);
        let currLab:RichText = this.haveItem.node.getChildByName("currLab").getComponent(RichText);
        if(ItemUtil.CheckItemIsHave(costType, costNum, 0)){
            currLab.string = `${formatNumber(costNum, 2)}/${formatNumber(ItemUtil.GetHaveThingNum(costType), 2)}`;
        }else{
            currLab.string = `<color=#BF1600>${formatNumber(costNum, 2)}</color>/${formatNumber(ItemUtil.GetHaveThingNum(costType), 2)}`;
        }
    }
    private updateBankItem(item: Node, data: StdGuildBank, index:number):void{
        let bankItem:GuildBankItem = item.getComponent(GuildBankItem) || item.addComponent(GuildBankItem);
        item.getChildByName("select").active = index == this.curSelectIndex;
        let costIndex:number = this.costIndexMap[data.DonateId] || 0;
        bankItem.SetData(this.info, data, this.total, costIndex, this.list.node);
    }
    private onBankSelect(index: number, item: Node):void{
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
        this.curSelectStd = this.datas[this.curSelectIndex];

        this.updateSelect();
    }
    private resetSelect():void{
        let children:Node[] = this.list.node.getChildByPath("view/content").children;
        for (let i = 0; i < children.length; i++) {
            let node:Node = children[i];
            node.getChildByName("select").active = false;
        }
    }
    
}