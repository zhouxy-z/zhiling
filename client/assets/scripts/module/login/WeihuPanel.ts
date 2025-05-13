import { Input, Label, Node } from "cc";
import { Panel } from "../../GameRoot";
import { Second } from "../../utils/Utils";

export class WeihuPanel extends Panel {
    protected prefab: string = "prefabs/ui/Tips";
    private label: Label;
    private btn1: Node;
    private btn2: Node;
    private okCallback: Function;
    private noCallback: Function;
    private closeLoop = 0;
    protected onLoad(): void {
        this.label = this.find("Label", Label);
        this.btn1 = this.find("btn1");
        this.btn2 = this.find("btn2");
        this.btn1.on(Input.EventType.TOUCH_END, this.onOk, this);
        this.btn2.on(Input.EventType.TOUCH_END, this.onNo, this);
        this.CloseBy("mask");
    }

    protected onShow(): void {

    }
    async flush(msg: string, okCallBack: Function) {
        this.label.string = msg;
        this.okCallback = okCallBack;
        this.btn1.getChildByName("Label").getComponent(Label).string = "查看公告";
        this.btn1.active = true;
        this.btn2.active = true;
        this.closeLoop++;
        let loop = this.closeLoop;
        await Second(2);
        if (loop != this.closeLoop) return;
        this.okCallback && this.okCallback();
        this.Hide();
    }
    protected onHide(...args: any[]): void {
        this.okCallback = undefined;
        this.noCallback = undefined;
        this.closeLoop++;
    }
    private onOk() {
        this.okCallback && this.okCallback();
        this.Hide();
    }
    private onNo() {
        this.noCallback && this.noCallback();
        this.Hide();
    }
}