import { DEV, IOS } from "cc/env";
import { MsgTypeRet, MsgTypeSend } from "../../MsgType";
import { Api_Login_Channel, Api_Open_Url, CallApp, CanSelectServer, CopyToClip, GetIdentifier, GetUserCode, GetVersionName, autoLogin, debugLogin, getAdcfg, hasSdk } from "../../Platform";
import { EventMgr, Evt_Hide_Home_Ui, Evt_Hide_Scene, Evt_Map_Tile_Complete, Evt_ReConnect, Evt_ReConnect_Success, Evt_ReLogin, Evt_ResetConfig, Evt_Show_Scene } from "../../manager/EventMgr";
import { GetLoginInfo, Http, SendChaoyouToken, SendGetAllNotice, SendGetAllNoticeHc, SendGetAllNoticeJy, SendGetAllNoticeXf } from "../../net/Http";
import { Session } from "../../net/Session";
import LocalStorage from "../../utils/LocalStorage";
import Logger from "../../utils/Logger";
import { GameSet } from "../GameSet";
import { ChangeScenePanel } from "../home/ChangeScenePanel";
import { LoginPanel } from "./LoginPanel";
import { Second } from "../../utils/Utils";
import { WaitPanel } from "./WaitPanel";
import { Game, JsonAsset, assetManager, find, game } from "cc";
import { ServerPanel } from "./ServerPanel";
import { ResMgr } from "../../manager/ResMgr";
import { AudioGroup, AudioMgr } from "../../manager/AudioMgr";
import PlayerData, { } from "../roleModule/PlayerData"
import { NoticeData } from "../roleModule/PlayerStruct";
import { AssertPanel } from "./AssertPanel";
import { CfgMgr } from "../../manager/CfgMgr";
import { NoticePanel } from "../notice/NoticePanel";
import { Tips } from "./Tips";
import { WeihuPanel } from "./WeihuPanel";
import { OnLoginServer } from "../../Proxy";

export class LoginModule {
    private serverInfo: any;
    private loginning = false;
    constructor() {
        if (DEV) {
            let g = window || globalThis;
            if (g) {
                g.send = function (json) {
                    if (typeof (json) == "string") {
                        try {
                            Session.Send(JSON.parse(json));
                        } catch (e) {
                            console.warn("发送协议格式错误!");
                        }
                    } else {
                        Session.Send(json);
                    }
                }
                g.second = Second;
                g.http = Http.Send;
            }
        }
        let versionName = GetVersionName();
        if (versionName) {
            let ls = versionName.split(".");
            if (ls.length) {
                let version = Number(ls[2]);
                if (version < 25) {
                    let url = "https://loothub.cn/#/pages/share/result";
                    if (IOS) {
                        // if(GetIdentifier() == "com.xyjj.crm.fund") {
                        //     url = "https://www.pgyer.com/ios-crm-fund";
                        // }else {
                        url = "https://www.pgyer.com/ios-huajing-kkplus";
                        // }
                    } else {

                    }
                    CopyToClip(url);
                    AssertPanel.Show("此版本已停止维护，请点击复制链接，前往浏览器下载最新最新版本。", () => {
                        CallApp({ api: Api_Open_Url, url: url });
                        game.end();
                    }, null, "复制链接");
                    return;
                }
            }
        }

        Session.on(MsgTypeRet.VerifyTokenRet, this.onLogin, this);
        EventMgr.on(Evt_ReLogin, this.onRelogin, this);
        EventMgr.on(Evt_ReConnect, this.reconnect, this);
        game.on(Game.EVENT_SHOW, this.onShow, this);

        if (autoLogin()) {
            GameSet.Local_host = "http://113.45.139.51:7880";
            this.login();
        } else if (GameSet.globalCfg || (ResMgr.HasResource("config/channel_cfg") && !DEV && !debugLogin())) {
            ServerPanel.Show(this.login.bind(this));
        } else {
            LoginPanel.Show(this.login.bind(this));
        }
        EventMgr.on("logout_game", this.onBackToLogin, this);
    }

    protected onBackToLogin() {
        // console.log("onBackToLogin", !LoginPanel.Showing, !ServerPanel.Showing);
        if (!LoginPanel.Showing && !ServerPanel.Showing) {
            let panel: any = GameSet.ForBack();
            while (panel) {
                if (panel.Hide) panel.Hide();
                panel = GameSet.ForBack();
            }
        }
        if (Session.connectting) {
            Session.Close(() => {
                console.log("onBackToLogin");
                EventMgr.emit(Evt_ReLogin);
            });
        } else {
            EventMgr.emit(Evt_ReLogin);
        }
    }

    protected onShow() {
        console.log("Game.EVENT_SHOW", Session.connectting, Session.hasConnected);
        if (Session.connectting) return;
        if (GameSet.GateUrl && GameSet.Token && !Session.hasConnected) {
            this.reconnect();
        }
    }

    protected async onRelogin(data: any) {
        if (data) {
            PlayerData.fightState = 0;
            this.login();
            return;
        }
        EventMgr.emit(Evt_ResetConfig);
        find("Canvas/bg").active = true;
        AudioMgr.All(true, AudioGroup.Music);
        AudioMgr.All(true, AudioGroup.Sound);
        AudioMgr.All(true, AudioGroup.Skill);
        EventMgr.emit(Evt_Hide_Scene);
        EventMgr.emit(Evt_Hide_Home_Ui);
        GameSet.intoGame = false;
        PlayerData.fightState = 0;
        PlayerData.RunHomeId = undefined;
        if (GameSet.globalCfg || (ResMgr.HasResource("config/channel_cfg") && !DEV && !debugLogin())) {
            ServerPanel.Show(this.login.bind(this));
        } else {
            LoginPanel.Show(this.login.bind(this));
        }
    }

    async login() {
        if (this.loginning) return;

        GameSet.Reconnect = false;
        let code = GetUserCode();
        console.log("###login", hasSdk());

        const loginFunc = this.login.bind(this);
        let uri = GetLoginInfo;
        if (hasSdk()) uri = SendChaoyouToken;
        // if(DEV) {
        //     uri = SendChaoyouToken;
        //     code = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ6bGpxIiwic3ViIjoibG9naW4iLCJleHAiOjE3NDQ5NDA3MDMsIm5iZiI6MTczNDU3MjcwMywiaWF0IjoxNzM0NTcyNzAzLCJqdGkiOiIzYmExN2Y2OS0yY2UxLTQ2NGMtYTQ0ZS01NGY3MGIxMTllOTEiLCJ1c2VyUGF5bG9hZCI6eyJhcHBJZCI6InpsanEiLCJ1bmlvbklkIjoidV8ybFZEUW11TXdBSXZxVFlmSEtqckxyZnNKSFgiLCJhY2NvdW50SWQiOiJhXzJsVkRRc1RibVI5WWtzN3BoaFRBaU05Mm13NSIsImRpc3RpbmN0SWQiOiIiLCJ0b2tlbiI6IjNiYTE3ZjY5LTJjZTEtNDY0Yy1hNDRlLTU0ZjcwYjExOWU5MSIsInZlcnNpb24iOjE3MzQ1NzI3MDMwMDZ9fQ.Rr2ZO1MJj7py2BWawfXCx4m_kOM9_5YRPxJEhTvUygM";
        // }

        if (GameSet.GetServerMark() == "hc") {
            OnLoginServer();
        }

        console.log("loginSdk###", JSON.stringify(GameSet.Server_cfg));
        let thisObj = this;
        this.loginning = true;
        this.serverInfo = await Http.Send(uri, { code: code });
        console.log('loginInfo', this.serverInfo);
        this.loginning = false;
        if (this.serverInfo && this.serverInfo.code == 429) {
            // if (ResMgr.HasResource("config/channel_cfg") && !DEV && !debugLogin()) {
            //     ServerPanel.Show(loginFunc, true);
            // } else {
            //     LoginPanel.Show(this.login.bind(this));
            // }
            this.loginning = false;
            // Tips.Show(this.serverInfo.msg || "登录失败请重试");
            let self = this;
            let loop = 30;
            let msg = "登录人数过多，正在排队请稍等";
            AssertPanel.Countdown(msg, () => {
                loop--;
                if (loop > 0) {
                    return msg + loop + "秒";
                } else {
                    AssertPanel.Hide();
                    self.login();
                }
            });
            return;
        } else if (this.serverInfo && this.serverInfo.code) {
            if (this.serverInfo.code == 203) {
                Tips.Show("登录状态失效,请重新登陆", () => {
                    CallApp({ api: Api_Login_Channel });
                });
                return;
            } else {
                Tips.Show("登录失败");
            }
            this.loginning = false;
        } else if (!this.serverInfo || !this.serverInfo.gate_url || !this.serverInfo.gate_url.length) {
            // MsgPanel.Show("登录失败！");
            await this.sendNotice();

            // CallApp({ api: "logout_game" });
            if (GameSet.globalCfg || (ResMgr.HasResource("config/channel_cfg") && !DEV && !debugLogin())) {
                ServerPanel.Show(loginFunc);
            } else {
                LoginPanel.Show(this.login.bind(this));
            }
            this.loginning = false;
            return;
        }
        await this.flushCfg();
        await ChangeScenePanel.PlayEffect(Evt_Map_Tile_Complete);
        GameSet.Token = this.serverInfo.token;
        GameSet.GateUrl = this.serverInfo.gate_url;
        if (Session.hasConnected || Session.connectting) {
            await Session.Close();
            await Second(0.1);
        }
        try {
            Session.Build(this.serverInfo.gate_url, () => {
                thisObj.loginning = false;
                let data = {
                    type: "0_VerifyToken",
                    data: {
                        token: GameSet.Token,
                        version: "3"
                    }
                }
                Session.Send(data);
            }, () => { });
        } catch (e) {
            console.error(e);
        }
    }

    private connectTick = 0;
    async reconnect() {
        let self = this;
        if (game.totalTime - this.connectTick < 1000) {
            try {
                Session.Close(() => { });
            } catch (e) { }
            this.onBackToLogin();
            return;
        }
        // await Second(this.connectTick);
        // if (loop != this.loop) return;
        console.log("reconnect", Session.connectting, Session.hasConnected, Session.closeDuration, this.connectTick);
        if (Session.connectting) return;
        WaitPanel.Show();
        if (Session.hasConnected) {
            await Session.Close();
        }
        this.connectTick = game.totalTime;
        GameSet.Reconnect = true;
        try {
            Session.Build(GameSet.GateUrl, () => {
                EventMgr.emit(Evt_ReConnect_Success);
                WaitPanel.Hide();
                let data = {
                    type: "0_VerifyToken",
                    data: {
                        token: GameSet.Token,
                        version: "3"
                    }
                }
                Session.Send(data);
            }, () => { });
        } catch (e) {
            console.error(e);
            GameSet.Reconnect = false;
        }
    }

    async onLogin(obj: any) {
        if (!obj) {
            ChangeScenePanel.Hide();
            this.sendNotice();
            if (GameSet.globalCfg || (ResMgr.HasResource("config/channel_cfg") && !DEV && !debugLogin())) {
                const loginFunc = this.login.bind(this);
                ServerPanel.Show(loginFunc);
            } else {
                LoginPanel.Show(this.login.bind(this));
            }
            this.loginning = false;
            return;
        } else if (obj?.code == 429) {
            let self = this;
            let loop = 15;
            let msg = "当前在线人数过多，正在重试";
            AssertPanel.Countdown(msg, () => {
                loop--;
                if (loop) {
                    return msg + loop + "秒";
                } else {
                    AssertPanel.Hide();
                    Session.Build(self.serverInfo.gate_url, () => {
                        self.loginning = false;
                        let data = {
                            type: "0_VerifyToken",
                            data: {
                                token: GameSet.Token,
                                version: "3"
                            }
                        }
                        Session.Send(data);
                    }, () => { });
                }
            });
            return;
        }
        Session.kickOff = false;
        if (Session.connectHandle) Session.connectHandle();
        obj = obj.data;
        console.log("登录成功!");

        Session.once(MsgTypeRet.WhitePanelRet, this.onWhithe, this);
        let data = {
            type: MsgTypeSend.WhitePanel,
            data: {}
        }
        Session.Send(data);
    }
    protected onWhithe(obj: any) {
        CfgMgr.ResetWhiet(obj);
        let data = {
            type: MsgTypeSend.GetPlayerData,
            data: {}
        }
        Session.Send(data);
        Session.startHeartbeat();

    }
    protected async flushCfg() {
        if (!GameSet.globalCfg || GameSet.globalCfg.cfg_version <= CfgMgr.version) return;
        let host = "https://static.kp-meta.com/kpmeta/game/gamefi001/remote/";
        if (CanSelectServer()) host = "https://static.kp-meta.com/kpmeta/game/gamefi001/testremote/";
        if (GameSet.GetServerMark() == "hc") {
            let url = host + "config_hc/cfg.json?" + new Date().getTime();
            let cfgAsset = await new Promise((resolve, reject) => {
                assetManager.loadRemote<JsonAsset>(url, { maxRetryCount: 1 }, function (err, jsonAsset) {
                    if (jsonAsset) resolve(jsonAsset);
                });
            });
            CfgMgr.ResetHc(cfgAsset['json']);
        } else if (GameSet.GetServerMark() == "xf") {
            let url = host + "config_xf/cfg.json?" + new Date().getTime();
            let cfgAsset = await new Promise((resolve, reject) => {
                assetManager.loadRemote<JsonAsset>(url, { maxRetryCount: 1 }, function (err, jsonAsset) {
                    if (jsonAsset) resolve(jsonAsset);
                });
            });
            CfgMgr.ResetXf(cfgAsset['json']);
        } else {
            let url = host + "config/cfg.json?" + new Date().getTime();
            let cfgAsset = await new Promise((resolve, reject) => {
                assetManager.loadRemote<JsonAsset>(url, { maxRetryCount: 1 }, function (err, jsonAsset) {
                    if (jsonAsset) resolve(jsonAsset);
                });
            });
            CfgMgr.Reset(cfgAsset['json']);
        }
    }
    /**
     * 请求公告数据
     */
    private async sendNotice(): Promise<void> {
        let handle: Function;
        let p = new Promise((resolve, reject) => { handle = resolve });
        WeihuPanel.Show("维护中", handle);
        let getAllNotice: any;
        if (GameSet.GetServerMark() == "jy") {
            getAllNotice = SendGetAllNoticeJy;
        } else if (GameSet.GetServerMark() == "hc") {
            getAllNotice = SendGetAllNoticeHc;
        } else if (GameSet.GetServerMark() == "xf") {
            getAllNotice = SendGetAllNoticeXf;
        } else {
            getAllNotice = SendGetAllNotice;
        }
        if (GameSet.globalCfg && GameSet.globalCfg['notice']) {
            getAllNotice.serverUrl = GameSet.globalCfg['notice'];
        }
        let noticeDatas = await Http.Send(getAllNotice, {});
        await p;
        if (!noticeDatas) return;
        let list: NoticeData[] = noticeDatas["data"] || [];
        let has = false;
        // "categoryId":"systemMaintenanceAnnouncement"
        for (let i = 0; i < list.length;) {
            if (list[i].categoryId == "systemMaintenanceAnnouncement") {
                if (!GameSet.globalCfg || !GameSet.globalCfg['whitelist'] || !GameSet.globalCfg['whitelist'][PlayerData.roleInfo.player_id]) {
                    has = true;
                    CfgMgr.InitSystemOpenCfg(list[i].content);
                }
                list.splice(i, 1);
            } else {
                i++;
            }
        }

        if (!has && GameSet.globalCfg && GameSet.globalCfg['system_door']) {
        }

        PlayerData.SetNoticeDatas(list, true)

        let h: Function;
        let promise = new Promise((resolve, reject) => {
            h = resolve;
        });
        NoticePanel.Show(true, h);
        await promise;
    }
}
