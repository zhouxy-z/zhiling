import { Label, Node, Sprite } from "cc";
import { Panel } from "../../GameRoot";
import { AutoScroller } from "../../utils/AutoScroller";
import { formatK, formatNumber } from "../../utils/Utils";
import { EventMgr, Evt_FishTradeRankUpdate } from "../../manager/EventMgr";
import { SFishingTradeRankPlayerInfoData } from "../roleModule/PlayerStruct";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";

export class FishTradeCastRankPanel extends Panel {
    protected prefab: string = "prefabs/panel/fishTrade/FishTradeCastRankPanel";
    private list: AutoScroller;
    private noneListCont: Node;
    protected onLoad(): void {
        this.list = this.find("list", AutoScroller);
        this.list.SetHandle(this.updateItem.bind(this));
        this.noneListCont = this.find("noneListCont");
        this.CloseBy("mask");
        this.CloseBy("closeBtn");


    }
    public flush(): void {

    }
    
    protected onShow(): void {
        this.noneListCont.active = true;
        this.list.UpdateDatas([]);
        EventMgr.on(Evt_FishTradeRankUpdate, this.onRankUpdate, this);
        Session.Send({type: MsgTypeSend.FishingTradeRankQuery, data:{}});
    }

    protected onHide(...args: any[]): void {
        EventMgr.off(Evt_FishTradeRankUpdate, this.onRankUpdate, this);
    }

    private onRankUpdate(rankList: SFishingTradeRankPlayerInfoData[]): void {
        if (rankList.length) {
            this.noneListCont.active = false;
            this.list.UpdateDatas(rankList);
        }else{
            this.noneListCont.active = true;
            this.list.UpdateDatas([]);
        }
    }

    protected updateItem(item: Node, data: SFishingTradeRankPlayerInfoData, index: number): void {
        let rankLab: Label = item.getChildByName("rankLab").getComponent(Label);
        let nameLab: Label = item.getChildByName("nameLab").getComponent(Label);
        let numLab: Label = item.getChildByPath("itemCont/numLab").getComponent(Label);
        rankLab.string = (index + 1).toString();
        nameLab.string = data.name;
        numLab.string = formatNumber(data.score, 2);
    }
    
}