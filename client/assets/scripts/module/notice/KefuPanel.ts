import { assetManager, Button, ImageAsset, instantiate, Node, ScrollView, Sprite, SpriteFrame, Texture2D } from "cc";
import { Panel } from "../../GameRoot";
import { Api_Open_Url, CallApp } from "../../Platform";
import { createSpriteFrame } from "../../utils/Utils";
import { GameSet } from "../GameSet";
export class KefuPanel extends Panel {
    protected prefab: string = "prefabs/panel/notice/KefuPanel";

    protected onLoad() {
        this.find("bg/btn1").on("click", this.onClick1, this);
        this.find("bg/btn2").on("click", this.onClick2, this);
        this.find("bg/btn3").on("click", this.onClick3, this);
        this.CloseBy("mask");
    }

    protected onClick1() {
        if (GameSet.globalCfg) {
            CallApp({ api: Api_Open_Url, url: GameSet.globalCfg.kefu.qq.url });
        } else {
            CallApp({ api: Api_Open_Url, url: "https://qm.qq.com/q/HjG2ZstcgQ" });
        }
    }
    protected onClick2() {
        if (GameSet.globalCfg) {
            CallApp({ api: Api_Open_Url, url: GameSet.globalCfg.kefu.wx.url });
        } else {
            CallApp({ api: Api_Open_Url, url: "https://qr61.cn/oMbhOk/qETJxz3" });
        }
    }
    protected onClick3() {
        if (GameSet.globalCfg) {
            CallApp({ api: Api_Open_Url, url: GameSet.globalCfg.kefu.kf.url });
        } else {
            CallApp({ api: Api_Open_Url, url: "https://work.weixin.qq.com/kfid/kfc205eabba53d93849" });
        }
    }

    protected onShow(): void {

    }
    protected onHide(...args: any[]): void {

    }

    public async flush(isAuto: boolean = false, canClose = true): Promise<void> {
        if (GameSet.globalCfg) {
            assetManager.loadRemote<ImageAsset>(GameSet.globalCfg.kefu.kf.icon, (err, data) => {
                this.find("bg/kf", Sprite).spriteFrame = createSpriteFrame(data);
            });

            assetManager.loadRemote<ImageAsset>(GameSet.globalCfg.kefu.qq.icon, (err, data) => {
                this.find("bg/qq", Sprite).spriteFrame = createSpriteFrame(data);
            });

            assetManager.loadRemote<ImageAsset>(GameSet.globalCfg.kefu.wx.icon, (err, data) => {
                this.find("bg/wx", Sprite).spriteFrame = createSpriteFrame(data);
            });
        }
    }
}