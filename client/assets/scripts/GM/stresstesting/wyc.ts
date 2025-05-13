import { _decorator, Canvas, Component, EditBox, find, Input, js, JsonAsset, Label, native, Node, RenderTexture, RigidBody2D, Scene, Sprite, TextAsset, Texture2D } from 'cc';
import { base64ToImage, BytesToBase64, randomI, Second } from '../../utils/Utils';
import { ResMgr } from '../../manager/ResMgr';
import { QrcodeMaker } from '../../utils/QrcodeMaker';
import { FilmMaker } from '../../manager/FilmMaker';
import { ConsumeItem } from '../../module/common/ConsumeItem';
import { UnitTest } from '../UnitTest';
import { MsgTypeRet, MsgTypeSend } from '../../MsgType';
import { BuildingType } from '../../module/home/HomeStruct';
import { Test1 } from './Test1';
import LocalStorage from '../../utils/LocalStorage';
import { GameRoot } from '../../GameRoot';
import { DebugTips } from '../../module/login/DebugTips';
import { EventMgr } from '../../manager/EventMgr';
import { CfgMgr } from '../../manager/CfgMgr';
import { GmTest } from '../GmTest';

const { ccclass, property } = _decorator;

@ccclass('wyc')
export class wyc extends Component {
    server: EditBox;
    label1: EditBox;
    label2: EditBox;
    label3: EditBox;

    host = "http://124.71.83.101:7881";
    protected async onLoad() {
        await ResMgr.PrevLoad();
        await CfgMgr.Load();
        new GameRoot(find("Canvas"));

        this.server = find("Canvas/server").getComponent(EditBox);
        this.label1 = find("Canvas/name").getComponent(EditBox);
        this.label2 = find("Canvas/start").getComponent(EditBox);
        this.label3 = find("Canvas/end").getComponent(EditBox);
        this.server.string = LocalStorage.GetString("wyc_server", "127.0.0.1:7880");
        this.label1.string = LocalStorage.GetString("wyc_label1", "fanyu");
        this.label2.string = LocalStorage.GetString("wyc_label2", "10");
        this.label3.string = LocalStorage.GetString("wyc_label3", "100");
        find("Canvas/Button").on(Input.EventType.TOUCH_END, this.testBuilding, this);
    }

    async testBuilding() {
        this.host = this.server.string;
        let name = this.label1.string || "fanyu";
        let start = Number(this.label2.string);
        let end = Number(this.label3.string);
        if (isNaN(start) || isNaN(end)) return;
        LocalStorage.SetString("wyc_server", this.host);
        LocalStorage.SetString("wyc_label1", name);
        LocalStorage.SetString("wyc_label2", start + "");
        LocalStorage.SetString("wyc_label3", end + "");

        let loop = 0, total = end - start + 1;
        let progress = find("Canvas/Label").getComponent(Label);

        for (let i = start; i <= end; i++) {
            let test = new Test1();
            let p = test.run(name + i, this.host);
            if (i % 100 == 0) {
                await p;
                progress.string = String(++loop) + "/" + total;
            } else {
                p.then(e => progress.string = String(++loop) + "/" + total);
            }

            await Second(0.01);
        }
    }
}
