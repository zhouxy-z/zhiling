import { Button, Input, Label, Node, game, js } from "cc";
import { Panel } from "../../GameRoot";
import { EDITOR, HTML5 } from "cc/env";
import { EventMgr, Evt_Hide_Scene, Evt_ReLogin } from "../../manager/EventMgr";

export class AssertPanel extends Panel {
    protected prefab: string = "prefabs/ui/AssertPanel";
    private label: Label;
    private btn1: Node;
    private btn2: Node;
    private okCallback: Function;
    private noCallback: Function;
    private running = false;
    protected onLoad(): void {
        this.SetLink(undefined);
        this.label = this.find("Label", Label);
        this.btn1 = this.find("layout/btn1");
        this.btn2 = this.find("layout/btn2");
        this.btn1.on(Button.EventType.CLICK, this.onOk, this);
        this.btn2.on(Button.EventType.CLICK, this.onNo, this);
        // this.CloseBy("mask");
    }

    private static countDownHandle: () => string;
    static Countdown(msg: string, handle: () => string) {
        this.countDownHandle = handle;
        return this.Show(msg);
    }
    onSecond() {
        let h = AssertPanel.countDownHandle;
        if (h) {
            let str = h();
            this.label.string = str;
        }
    }

    static Show(...args: any[]): Promise<any> {
        return super.ShowTop(...args);
    }

    static ShowUI(...args: any[]): Promise<any> {
        return super.ShowTop(...args);
    }

    protected onShow(): void {

    }
    public flush(msg: string, okCallBack?: Function, noCallBack?: Function, btn1Label?: string, btn2Label?: string): void {
        if (this.running) return;
        this.running = true;
        this.label.string = msg;
        this.okCallback = okCallBack;
        this.noCallback = noCallBack;
        if (okCallBack) {
            this.btn1.active = true;
        } else {
            this.btn1.active = false;
        }
        if (noCallBack) {
            this.btn2.active = true;
        } else {
            this.btn2.active = false;
        }
        if (btn1Label) {
            this.btn1.getChildByName("Label").getComponent(Label).string = btn1Label;
        }
        if (btn2Label) {
            this.btn2.getChildByName("Label").getComponent(Label).string = btn2Label;
        }
    }
    protected onHide(...args: any[]): void {
        this.running = false;
        this.okCallback = undefined;
        this.noCallback = undefined;
    }
    private onOk() {
        if (this.okCallback) {
            let handle = this.okCallback;
            this.okCallback = undefined;
            handle();
        } else if (!EDITOR && !HTML5) {
            game.restart();
        } else {
            EventMgr.emit(Evt_Hide_Scene, js.getClassName(this));
            EventMgr.emit(Evt_ReLogin);
        }
        this.Hide();
    }
    private onNo() {
        if (this.noCallback) {
            let handle = this.noCallback;
            this.noCallback = undefined;
            handle();
        } else if (!EDITOR && !HTML5) {
            game.restart();
        } else {
            EventMgr.emit(Evt_Hide_Scene, js.getClassName(this));
            EventMgr.emit(Evt_ReLogin);
        }
        this.Hide();
    }
}