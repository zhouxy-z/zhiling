import { Button } from "cc";
import { Panel } from "../../GameRoot";
import { FishTradeRunCont } from "./FishTradeRunCont";
import { randomI } from "../../utils/Utils";
import { CfgMgr, StdFishTradeShip } from "../../manager/CfgMgr";

export class FishTradeTestPanel extends Panel {
    protected prefab: string = "prefabs/panel/fishTrade/FishTradeTestPanel";
    private btn:Button;
    private runCont:FishTradeRunCont;

    protected onLoad(): void {
        this.btn = this.find("btn", Button);
        
        this.runCont = this.find("runCont").addComponent(FishTradeRunCont);
        this.btn.node.on(Button.EventType.CLICK, ()=>{
            let shipList:StdFishTradeShip[] = CfgMgr.GetFishTradeShipList;
            let shipData:StdFishTradeShip;
            let killIdMap:{[key:string]:{id:number, isShowCloud:boolean, isKill:boolean}} = {};
            let isShowCloud:boolean;
            for (let index = 0; index < 3; index++) {
                shipData = shipList[index];
                isShowCloud = true;
                killIdMap[shipData.ShipId] = {id:shipData.ShipId, isShowCloud:isShowCloud , isKill:Boolean(randomI(0, 1))};
            }
            this.runCont.SetData(killIdMap);
        }, this)
    }
    
    protected update(dt: number): void {
        
    }
    
    public flush(...args: any[]): void {
       
    }
    
    protected onShow(): void {
       
    }

    protected onHide(...args: any[]): void {
       
    }
}