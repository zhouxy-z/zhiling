import { Component, Label, Node } from "cc";
import { FishTradeBalloonItem } from "./FishTradeBalloonItem";
import { CfgMgr, StdFishTradeShip } from "../../manager/CfgMgr";

export class FishTradeBalloonCont extends Component {
    private balloonItem_1:FishTradeBalloonItem;
    private balloonItem_2:FishTradeBalloonItem;
    private balloonItem_3:FishTradeBalloonItem;
    private datas:StdFishTradeShip[] = [];
    private isInit:boolean = false;
    protected onLoad(): void {
        this.balloonItem_1 = this.node.getChildByName("balloonCont_1").addComponent(FishTradeBalloonItem);
        this.balloonItem_2 = this.node.getChildByName("balloonCont_2").addComponent(FishTradeBalloonItem);
        this.balloonItem_3 = this.node.getChildByName("balloonCont_3").addComponent(FishTradeBalloonItem);
        this.isInit = false;
        this.datas = CfgMgr.GetFishTradeShipList;
        this.updateShow();
    }

    private updateShow():void{
        if(!this.isInit) return;
        let stdFishTradeShip:StdFishTradeShip;
        let balloonItem:FishTradeBalloonItem;
        for (let index = 0; index < this.datas.length; index++) {
            stdFishTradeShip = this.datas[index];
            balloonItem = this[`balloonItem_${stdFishTradeShip.ShipId}`];
            balloonItem.SetData(stdFishTradeShip);
        }
    }
}