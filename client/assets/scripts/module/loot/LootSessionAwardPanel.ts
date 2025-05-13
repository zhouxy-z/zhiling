import { Button } from "cc";
import { Panel } from "../../GameRoot";
import { Tips3 } from "../home/panel/Tips3";

export class LootSessionAwardPanel extends Panel {
    protected prefab: string = "prefabs/panel/loot/LootSessionAwardPanel";
    private tipsBtn: Button;
    
    protected onLoad() {
        this.CloseBy("closeBtn");
        this.tipsBtn = this.find("tipsBtn", Button);
        this.tipsBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
    }

    private onBtnClick(btn:Button) {
        Tips3.Show(7);
    }

    protected onShow(): void {

    }
    public flush(...args: any[]): void {
       
    }
    protected onHide(...args: any[]): void {
       
    }
}