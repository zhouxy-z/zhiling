import { Button, Component, EventTouch, Input, Node } from "cc";
import { TradeHeroPanel } from "../trade/TradeHeroPanel";
import PlayerData, { } from "../roleModule/PlayerData"
import { SPlayerDataRole } from "../roleModule/PlayerStruct";
import { AutoScroller } from "../../utils/AutoScroller";
import { CfgMgr, StdShopowner } from "../../manager/CfgMgr";
import { LinkmanItem } from "./LinkmanItem";
import LocalStorage from "../../utils/LocalStorage";
import { randomI } from "../../utils/Utils";
import { GameSet } from "../GameSet";

export class RightsChannelPage extends Component {
    private linkmanList: AutoScroller;
    private datas: StdShopowner[];
    private isInit: boolean = false;
    protected onLoad(): void {
        this.linkmanList = this.node.getChildByName("list").getComponent(AutoScroller);
        this.linkmanList.SetHandle(this.updateLinkmanItem.bind(this));
        this.isInit = true;
        this.updateShow();

    }

    onShow(): void {
        this.node.active = true;
        this.updateShow();
    }
    onHide(): void {
        this.node.active = false;

    }
    private updateShow(): void {
        if (!this.isInit) return;
        // if(!this.datas) this.datas = CfgMgr.GetShopownerList().concat();
        // let keyData:any = LocalStorage.GetPlayerData(PlayerData.playerIdKey, "LinkmanClick");
        // this.datas.sort((a:StdShopowner, b:StdShopowner)=>{
        //     let aNum:number = keyData && keyData[a.ID] || 0;
        //     let bNum:number = keyData && keyData[b.ID] || 0;
        //     return bNum - aNum;
        // })
        this.datas = [];
        let list = CfgMgr.GetShopownerList().concat();
        if (GameSet?.globalCfg?.changes) {
            list = GameSet.globalCfg.changes.concat();
        }
        while (list.length) {
            let index = randomI(0, list.length - 1);
            this.datas.push(list[index]);
            list.splice(index, 1);
        }
        this.linkmanList.UpdateDatas(this.datas);
    }
    private updateLinkmanItem(item: Node, data: StdShopowner) {
        let linkmanItem = item.getComponent(LinkmanItem);
        if (!linkmanItem) linkmanItem = item.addComponent(LinkmanItem);
        linkmanItem.SetData(data);
    }

}