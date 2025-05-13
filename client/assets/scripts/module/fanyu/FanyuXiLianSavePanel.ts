import { Button, Color, Component, Event, EventTouch, Input, Label, Layout, Node, RichText, ScrollView, Sprite, SpriteFrame, Toggle, Tween, UIOpacity, UITransform, Vec3, Widget, easing, find, instantiate, js, path, sp, tween, view } from "cc";
import { Panel } from "../../GameRoot";
import { EventMgr, Evt_Hide_Scene, Evt_Show_Scene } from "../../manager/EventMgr";

export class FanyuXiLianSavePanel extends Panel {
    protected prefab: string = "prefabs/panel/FanyuXiLianSavePanel";

    private closeBtn: Node;
    private saveBtn: Button

    private callBack: Function;
    protected onLoad() {
        this.closeBtn = this.find(`closeBtn`);
        this.saveBtn = this.find("saveBtn", Button);
        this.closeBtn.on(Input.EventType.TOUCH_END, this.Hide, this);
        this.saveBtn.node.on("click", this.onSave, this)
    }

    protected onShow(): void {
        EventMgr.emit(Evt_Hide_Scene, js.getClassName(this));
    }

    public flush(callback: Function): void {
        this.callBack = callback;
    }

    private onSave() {
        if (this.callBack) {
            this.callBack();
        }
        this.Hide();
    }

    protected onHide(...args: any[]): void {
        this.callBack = undefined
        EventMgr.emit(Evt_Show_Scene, js.getClassByName(this));
    }

}