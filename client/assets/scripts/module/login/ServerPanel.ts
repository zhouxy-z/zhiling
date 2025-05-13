import { Button, JsonAsset, Input, profiler, game, Node, Toggle, Widget, Label, EditBox } from "cc";
import { Panel } from "../../GameRoot";
import LocalStorage from "../../utils/LocalStorage";
import { GameSet, ServerCfg } from "../GameSet";
import { Api_Login_Channel, CallApp, CanSelectServer, GetUserCode } from "../../Platform";
import { AudioMgr, LoginSundBGM } from "../../manager/AudioMgr";
import { ResMgr } from "../../manager/ResMgr";
import { SafeProtPanel } from "../safeProt/SafeProtPanel";
import { CfgMgr } from "../../manager/CfgMgr";
import { Selector } from "../../editor/skill/Selector";
import { IOS } from "cc/env";
import { SetNodeGray } from "../common/BaseUI";
import { WaitPanel } from "./WaitPanel";
import { Tips } from "./Tips";

export class ServerPanel extends Panel {
    protected prefab: string = "prefabs/ui/ServerPanel";

    private privacyBtn: Button;
    private userBtn: Button;
    protected pause = false;
    protected serverList: ServerCfg[];
    protected items: Node[];
    private callback: Function;
    protected async onLoad() {
        this.SetLink(undefined);
        this.find("middle/enter").on(Input.EventType.TOUCH_END, this.onLogin, this);
        this.privacyBtn = this.find("middle/label2", Button);
        this.userBtn = this.find("middle/label4", Button);
        let host = LocalStorage.GetString("LocalServer", "http://192.168.0.118:7880");
        this.serverList = [];
        if (GameSet.globalCfg) {
            this.serverList = GameSet.globalCfg.server_list;
        } else if (ResMgr.HasResource("config/channel_cfg")) {
            let jsonAsset = await ResMgr.LoadResAbSub("config/channel_cfg", JsonAsset);
            this.serverList = jsonAsset.json.server_list;
        }

        GameSet.Local_host = host;
        console.log("server>>>>", JSON.stringify(this.serverList));

        let selectServer = 2;
        this.items = [this.find("middle/cy"), this.find("middle/jy"), this.find("middle/item1"), this.find("middle/item2")];
        let lasts = [this.find("middle/item0/last"), this.find("middle/item0/last"), this.find("middle/item1/last"), this.find("middle/item2/last")];
        if (IOS) {
            this.items[0].getComponent(Toggle).enabled = false;
            SetNodeGray(this.items[0]);
            if (this.serverList.length > 1) this.serverList.shift();
            this.items.shift();
            // lasts[0].active = false;
            lasts.shift();
            // GameSet.Server_cfg = this.serverList[0];
            // GameSet.Local_host = this.serverList[0].Host;
            selectServer = LocalStorage.GetNumber("prev_select_server", 1);//默认幻彩服
            selectServer = 2;
        } else {
            selectServer = LocalStorage.GetNumber("prev_select_server", 2);//默认幻彩服
            selectServer = 3;
        }
        for (let i = 0; i < this.items.length; i++) {
            let item = this.items[i];
            item.on('toggle', this.onSelectServer, this);
            if (i == selectServer) {
                lasts[i].active = true;
                if (this.serverList[i].Host) {
                    GameSet.Server_cfg = this.serverList[i];
                    GameSet.Local_host = this.serverList[i].Host;
                    item.getComponent(Toggle).isChecked = true;
                }
            } else {
                lasts[i].active = false;
            }
        }

        this.find("relogin").on(Button.EventType.CLICK, this.onRelogin, this);
        this.privacyBtn.node.on(Button.EventType.CLICK, this.onBtnClck, this);
        this.userBtn.node.on(Button.EventType.CLICK, this.onBtnClck, this);
        this.find("relogin").active = false;
    }
    protected start(): void {
        let selector = this.find("Selector", Selector);
        if (CanSelectServer()) {
            selector.getComponent(Widget).top = 460;
            selector.node.active = true;
            selector.string = GameSet.Local_host;
            let serverlist = CfgMgr.GetServerList();;
            let list = [];
            for (let server of serverlist) {
                list.push(server)
            }
            selector.Init(list, (item: Node, data: any) => {
                let desc = data.Host;
                if (data.Desc) desc = "(" + data.Desc + ")" + data.Host;
                let label = item.getComponent(Label);
                if (!label) {
                    item.getComponent(EditBox).string = desc;
                } else {
                    label.string = desc;
                }
            });
            selector.node.on('select', this.onSelect, this);
        } else {
            selector.node.active = false;
        }
    }
    protected onSelect(data: any) {
        let children = this.find("middle").children;
        for (let child of children) {
            if (child.name != "enter") child.active = false;
        }
        GameSet.Local_host = data.replace(/\(.*\)/, "");
        let serverlist = CfgMgr.GetServerList();
        for (let server of serverlist) {
            if (server.Host == GameSet.Local_host) {
                GameSet.Server_cfg = server;
            }
        }
        console.log("onSelect", GameSet.Local_host);
        LocalStorage.SetString("LocalServer", GameSet.Local_host);
    }

    protected onSelectServer(t: Toggle) {
        if (t.isChecked) {
            this.find("Selector").active = false;
            let index = this.items.indexOf(t.node);
            if (index == -1) return;
            if (index != 2) return;
            LocalStorage.SetNumber("prev_select_server", index);
            GameSet.Local_host = this.serverList[index].Host;
            GameSet.Server_cfg = this.serverList[index];
            console.log("onSelectServer", index, JSON.stringify(GameSet.Server_cfg));
        }
    }

    protected onShow(): void {
        WaitPanel.Hide();
        AudioMgr.PlayCycle(LoginSundBGM);
    }
    public flush(callBack: Function, reload?: boolean, changeAccount?: boolean): void {
        if (changeAccount) {

        } else if (reload) {
            CallApp({ api: Api_Login_Channel });
        } else if (!GetUserCode() && !this.pause) CallApp({ api: Api_Login_Channel });
        this.callback = callBack;
    }
    protected onHide(...args: any[]): void {
        AudioMgr.Stop(LoginSundBGM);
    }
    private onBtnClck(btn: Button): void {
        switch (btn) {
            case this.privacyBtn:
                SafeProtPanel.Show(2);
                break;
            case this.userBtn:
                SafeProtPanel.Show(1);
                break;
        }
    }
    onLogin() {
        GameSet.usecode = GetUserCode();
        if (!GameSet.usecode && !this.pause) {
            CallApp({ api: Api_Login_Channel });
        } else {
            profiler.hideStats();
            LocalStorage.SetString("userCode", GameSet.usecode);
            window['usercode'] = GameSet.usecode;
            if (!GameSet.Server_cfg) return;

            // if (GameSet.Server_cfg.Mark == "_Rlite") {
            //     let index = this.serverList.indexOf(GameSet.Server_cfg);
            //     if (index > -1) LocalStorage.SetNumber("prev_select_server", index);
            //     this.Hide();
            //     let self = this;
            //     SelectHomePanel.Show(() => { self.callback(GameSet.usecode); });
            // } else {
            CfgMgr.InitServerCfg(GameSet.Server_cfg.Mark);
            let index = this.serverList.indexOf(GameSet.Server_cfg);
            if (index > -1) LocalStorage.SetNumber("prev_select_server", index);
            console.log("onLogin", JSON.stringify(GameSet.Server_cfg));
            this.callback(GameSet.usecode);
            // }
        }
    }

    onRelogin() {
        if (!this.pause) CallApp({ api: Api_Login_Channel });
    }
}