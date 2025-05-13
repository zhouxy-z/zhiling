import { CfgMgr, StdFishTradeShip } from "../../manager/CfgMgr";
import { MsgTypeSend } from "../../MsgType";
import { Session } from "../../net/Session";
import { randomI } from "../../utils/Utils";
import PlayerData, { } from "../roleModule/PlayerData"
 import {SFishingItem,SFishingTradeRoundInfo} from "../roleModule/PlayerStruct";

export class FishTradeStressTest{
    /** 购买道具间隔时间时间*/
    private readonly Buy_Item_Time:number = 10;
    /**投入鱼/鱼获箱间隔时间 */
    private readonly Put_Fish_Time:number = 10;
    /**选择飞船间隔时间 */
    private readonly Select_Ship_Time:number = 10;
    constructor(){
        setInterval(this.sendBuyItem, this.Buy_Item_Time);
        setInterval(this.sendPutFish, this.Put_Fish_Time);
        setInterval(this.sendSelectShip, this.Select_Ship_Time);
    }

    private sendBuyItem():void{
        let count:number = randomI(1,1000);
        Session.Send({type: MsgTypeSend.FishingTradeConvertItem, data:{count:count}});
    }

    private sendPutFish():void{
        let fishList:number[] = [];
        let fishItemDatas:SFishingItem[] = PlayerData.fishItems;
        if(fishItemDatas && fishItemDatas.length > 0){
            let len:number = randomI(0, fishItemDatas.length);
            let curLen:number = 0;
            let curCheck:number = 0;
            while(curLen < len){
                let index = randomI(0, fishItemDatas.length);
                let fishItemData:SFishingItem = fishItemDatas[index];
                if(fishItemData){
                    if(fishList.indexOf(fishItemData.id) < 0){
                        fishList.push(fishItemData.id);
                        curLen ++;
                    }
                }else{
                    curCheck ++;
                    if(curCheck >= len){
                        curLen = len;
                    }
                }
            }
        }

        let itemNumList:number[] = [];
        itemNumList = itemNumList.concat(CfgMgr.GetFishTradeCommon.CostSelectType);
        let itemIndex:number = randomI(0, itemNumList.length - 1);
        let num:number = itemNumList[itemIndex];
        Session.Send({type: MsgTypeSend.FishingTradeLoadFish, data:{fish_item_id_list:fishList, cost_item_count:num}});
    }

    private sendSelectShip():void{
        if(!PlayerData.fishTradeData || !PlayerData.fishTradeData.player) return;
        let shipList:StdFishTradeShip[] = CfgMgr.GetFishTradeShipList;
        let curId:number;
        for (let index = 0; index < shipList.length; index++) {
            const ship = shipList[index];
            if(ship.ShipId != PlayerData.fishTradeData.player.ship_id)
            {
                curId = ship.ShipId;
                break;
            }
        }
        Session.Send({type: MsgTypeSend.FishingTradeSelectShip, data:{ship_id: curId}});
    }

}