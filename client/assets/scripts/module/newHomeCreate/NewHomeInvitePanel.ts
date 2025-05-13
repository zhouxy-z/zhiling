import { Button, Label } from "cc";
import { Panel } from "../../GameRoot";
import { TradePanel } from "../trade/TradePanel";
import {  } from "../roleModule/PlayerData"
 import {SOrderData} from "../roleModule/PlayerStruct";
import { BuyPanel } from "../trade/BuyPanel";
import { RoleMsgPanel } from "../trade/RoleMsgPanel";

export class NewHomeInvitePanel extends Panel {
    protected prefab: string = "prefabs/panel/newHomeCreate/NewHomeInvitePanel";
    private updateBtn: Button;
    
    private callBack:Function;
    protected onLoad() {
        this.CloseBy("mask");
        this.CloseBy("spriteFrame/Close");   
        this.updateBtn = this.find("spriteFrame/updateBtn", Button);     
        this.updateBtn.node.on("click", this.onUpdate, this);
    }

    protected onShow(): void {
    }

    async flush(callBack) {
        this.callBack = callBack;
    }

    private onUpdate() {
        this.callBack && this.callBack();
        this.Hide()
    }
    
    protected onHide(...args: any[]): void {
        this.callBack = undefined;
    }

}