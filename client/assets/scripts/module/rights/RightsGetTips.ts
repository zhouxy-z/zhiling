import {easing, path, Sprite, SpriteFrame, Tween, tween, Vec2, Vec3, Node, Button, Label } from "cc";
import { Panel } from "../../GameRoot";
import {CfgMgr, StdEquityCard, StdEquityList} from "../../manager/CfgMgr";
import { ResMgr } from "../../manager/ResMgr";
import { AutoScroller } from "../../utils/AutoScroller";
import { RightsItem } from "./RightsItem";
import { Goto } from "../../manager/EventMgr";
import { PANEL_TYPE } from "../../manager/PANEL_TYPE";


export class RightsGetTips extends Panel {
    
    protected prefab: string = "prefabs/panel/rights/RightsGetTips";
    private icon:Sprite;
    private nameLab:Label;
    private list:AutoScroller;
    private okBtn:Button;
    private card:StdEquityCard;
    protected onLoad(): void {
        this.icon = this.find("centreCont/icon", Sprite);
        this.nameLab = this.find("bottomCont/nameLab", Label);
        this.list = this.find("bottomCont/list", AutoScroller);
        this.okBtn = this.find("bottomCont/okBtn", Button);
        
        this.list.SetHandle(this.updateListItem.bind(this));
        this.okBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        //this.CloseBy("mask");
    }
    public flush(card:StdEquityCard): void {
        this.card = card;
        this.nameLab.string = this.card.name;
        let stdEquityList:StdEquityList[] = CfgMgr.GetEquityList(this.card.Equity_CardID, true);
        this.list.UpdateDatas(stdEquityList);
        let url = path.join("sheets/rights", `${this.card.GetEquityIcon}`, "spriteFrame");
        ResMgr.LoadResAbSub(url, SpriteFrame, res => {
            this.icon.spriteFrame = res;
        });
    }
    
    protected onShow(): void {
        let time:number = 0.5;
        let value:number = 15;
        let rotate1 = tween().to(time, { position: new Vec3(0, value, 0)}, { easing: easing.backOut });
        let rotate2 = tween().to(time, { position: new Vec3(0, 0, 0)}, { easing: easing.backIn });
        let rotate3 = tween().to(time, { position: new Vec3(0, -value)}, { easing: easing.backOut });
        let rotate4 = tween().to(time, { position: new Vec3(0, 0)}, { easing: easing.backIn });
        let sequence1 = tween().sequence(rotate1, rotate2, rotate3, rotate4);
        tween(this.icon.node).then(sequence1).repeatForever().start();

    }
    protected onHide(...args: any[]): void {
        Tween.stopAllByTarget(this.icon.node);
    }

    private onBtnClick(btn:Button):void{
        Goto(PANEL_TYPE.rightsPanel, this.card.Equity_CardID);
        this.Hide();
    }
    private updateListItem(item: Node, data: StdEquityList):void {
        let lisItem = item.getComponent(RightsItem) || item.addComponent(RightsItem);
        lisItem.SetData(data);
    }
}