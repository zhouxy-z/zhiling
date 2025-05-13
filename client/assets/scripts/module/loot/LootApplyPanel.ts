import { Button } from "cc";
import { Panel } from "../../GameRoot";
import { MsgTypeSend } from "../../MsgType";
import { Session } from "../../net/Session";

export class LootApplyPanel extends Panel {
    protected prefab: string = "prefabs/panel/loot/LootApplyPanel";
    private applyBtn: Button;
    
    protected onLoad() {
        this.applyBtn = this.find("applyBtn", Button);
        this.CloseBy("closeBtn");
        this.CloseBy("mask");
        this.applyBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
    }
    public flush(...args: any[]): void {
        
    }
    protected onShow(): void {
       
    }
    protected onHide(...args: any[]): void {
        
    }
    
    private onBtnClick(btn:Button) {
        switch(btn){
            case this.applyBtn:
                let data = {
                    type:MsgTypeSend.PlunderOpen,
                    data:{open:true}
                }
                Session.Send(data);
                this.Hide();
            break;
        }
    }
    
}