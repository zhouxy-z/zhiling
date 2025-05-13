import { Button, Component, EditBox, EventTouch, Input, Label, Node, ScrollView, Sprite, SpriteFrame, Toggle, find, path, sp, tween } from "cc";
import { Panel } from "../../GameRoot";
import PlayerData, {} from "../roleModule/PlayerData"
import LocalStorage from "../../utils/LocalStorage";
import { AudioMgr, Audio_CommonDelete } from "../../manager/AudioMgr";

export class MailDeletePanel extends Panel {
    protected prefab: string = "prefabs/mail/MailDeletePanel";
    private callBack;
    private deleteBtn: Node;
    private toggle: Toggle;
    protected onLoad() {
        this.CloseBy("mask");
        this.CloseBy("spriteFrame/Close");
        this.deleteBtn = this.find(`spriteFrame/deleteBtn`);
        this.toggle = this.find(`spriteFrame/Node/toggle`, Toggle);
        this.onBntEvent()
    }

    private onBntEvent() {
        this.deleteBtn.on(Button.EventType.CLICK, this.onClickDelete, this);
    }

    protected onShow(): void {

    }

    public flush(...args: any[]): void {
        this.callBack = args[0];
        this.toggle.isChecked = false;
    }

    protected onHide(...args: any[]): void {

    }

    private onClickDelete() {
        AudioMgr.PlayOnce(Audio_CommonDelete);
        let time = Date.now();
        if (this.toggle.isChecked) {
            LocalStorage.SetNumber("MailDeletePanel" + PlayerData.roleInfo.player_id, time)
        } else {
            LocalStorage.RemoveItem("MailDeletePanel" + PlayerData.roleInfo.player_id)
        }
        if (this.callBack) {
            this.callBack();
        }
        this.Hide();
    }

}
