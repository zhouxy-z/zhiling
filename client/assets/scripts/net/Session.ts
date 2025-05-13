import { EventHandler, Node, NodeEventType, Socket, __private, game } from "cc";
import { MsgTypeRet, MsgTypeSend } from "../MsgType";
import { EventMgr, Evt_Fengkong, Evt_ReConnect } from "../manager/EventMgr";
import { Tips } from "../module/login/Tips";
import PlayerData from "../module/roleModule/PlayerData";
import { DEV, EDITOR, IOS } from "cc/env";
import { AssertPanel } from "../module/login/AssertPanel";
import { CfgMgr } from "../manager/CfgMgr";
import { GameSet } from "../module/GameSet";
import { CanSelectServer, CopyToClip, debugLogin } from "../Platform";
import { WaitPanel } from "../module/login/WaitPanel";
import JSEncrypt from "jsencrypt";
import { Base64_Encode } from "../utils/Utils";

const PingRet_Tick = 10000;

export class Session {
    private static closeTick = undefined;
    private static socket: WebSocket;
    private static heartId: number;
    private static testPublicKey = `-----BEGIN PUBLIC KEY-----
    MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyDoz6MIq0ppx5I8qGNGi
    E0ZOduVibJTFXQSKZJssBi8g8PhwHlu3IskJGLmCYDrQ6JVZjvBVpdAb6eWg5R69
    Ti7y96kQCHI/v+FR1/Uyd14kpzk5n84YjL5RzCHzDWVQcldJRxyuggohLjGcO11R
    M5Hqax0usRMtJkG+bCRcNjh+V67d37ueTv496PZcMACBMdwcCfBVjlXbXhXCCQfx
    7j5077p//n1VkwEN1PBzd9RYqmbLcBiVaARvpeEJr+nMioY6kDTit0ISeiB8DPEZ
    yJddNSdcZ98CkRbWSk7dFgaEwXj5RROuqbZ3fjGMHG81y5/+QazNgXYap65c8yzY
    KwIDAQAB
    -----END PUBLIC KEY-----
    `;
    private static productKey = `-----BEGIN PUBLIC KEY-----
    MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyyOuBpUL8E4O2mdmt9ZW
    vi3TUEqMX4guYtAU1AUKXXqVQyEin87aT8cXRXN91wFnpZqFG36y4mPAtiMDMwL+
    QyIaxq0KkATGgnFKFQdxp2IbWx+u6FBYY0VRvxCDDqgr6rKZMmasUCEe5ZpKBStL
    DgPBdl8aKl4V9BIdDT0AgU7PPPVOGxMWt1kRJT3ZdcG+ruqHBC1sjru2L8YoNDs9
    OImmhP99BxyU72f6+z4qEZBdD/pjp0XG5bNfZ3oKgUoQf3LU5+SC4kYVOTq8oPGW
    yUnyWvOKeq4aWOjQJX0VEeGFv4PAvD8sbBpMa8aQJ1UzL5kyAjdrtygkyZ8rOeHU
    PQIDAQAB
    -----END PUBLIC KEY-----
    `;

    private static get publicKey() {
        if (DEV || CanSelectServer()) {
            return this.testPublicKey;
        } else {
            return this.productKey;
        }
    }

    static kickOff = false;
    static Build(url: string, sucess?: Function, error?: Function) {
        if (this.socket) {
            console.warn("请先断开已有连接");
            return;
        }
        console.log("connect------>", url);
        const ws = new WebSocket(url);
        this.socket = ws;
        let thisObj = this;
        ws.onopen = function (ev) {
            WaitPanel.Hide();
            console.log("onopen", ev);
            if (ev.target != thisObj.socket) return;
            thisObj.closeTick = undefined;
            sucess && sucess();
        }
        ws.onmessage = function (ev) {
            WaitPanel.Hide();
            // console.log("onmessage", ev);
            if (ev.target != thisObj.socket) return;
            let data: any;
            try {
                data = JSON.parse(ev.data);
            } catch (e) {
                console.error(e);
                return;
            }

            delete thisObj.msg_queue[data.type];

            EventMgr.emit("update_guide");
            if (data.type == "KickoutPush") {
                AssertPanel.Show("您的连接已断开！", () => {
                    game.end();
                });
                return;
            } else if (data.type != "PingRet" && data.type != "GetDefeatStatusRet") {
                if (DEV) {
                    console.log("@msg<<<", JSON.parse(ev.data));
                } else {
                    console.log("@msg<<<", ev.data);
                }
            }

            if (Session._isHeartbeat(MsgTypeRet[data.type])) {
                // console.log('心跳返回------>>>', data)
                if (data && data.data && data.data.timestamp) {
                    PlayerData.SyncServerTime(data.data.timestamp);
                }
            }
            if (data.code) {
                console.warn("code#####", data.code);
                if (data.code == 749) {
                    data.callback = () => {
                        if (MsgTypeRet[data.type]) {
                            thisObj.dispatcher.emit(data.type, data.data);
                        } else {
                            console.warn('###消息暂未监听', data.type);
                        }
                    }
                    EventMgr.emit(Evt_Fengkong, data);
                } else if (data.type == MsgTypeRet.ResourceExchangeRet && data.code) {
                    thisObj.dispatcher.emit(data.type, data.data);
                    const text = CfgMgr.GetText("server_" + data.code.toString());
                    if (text != '') Tips.Show(text);
                } else if (data.type == MsgTypeRet.VerifyTokenRet && data.code == 429) {
                    thisObj.dispatcher.emit(data.type, data);
                } else if (data.type == MsgTypeRet.MatchmakingRet && data.code == 16) {
                    const text = CfgMgr.GetText("server_" + data.code.toString());
                    if (text != '') Tips.Show(text);
                    thisObj.dispatcher.emit(data.type, undefined);
                } else if (data.type == MsgTypeRet.VerifyTokenRet && data.code == 3) {
                    // AssertPanel.Show("维护中...", () => {
                    //     game.end();
                    // });
                    thisObj.kickOff = true;
                    thisObj.dispatcher.emit(MsgTypeRet.VerifyTokenRet, undefined);
                } else if (data.type == MsgTypeRet.VerifyTokenRet && data.code == 4) {
                    AssertPanel.Show("此账号停用！", () => {
                        game.end();
                    });
                } else if (data.type == MsgTypeRet.VerifyTokenRet && data.code == 5) {
                    let url = "https://loothub.cn/#/pages/share/result";
                    if (IOS) {
                        url = "https://www.pgyer.com/ios-huajing-kkplus";
                    }
                    CopyToClip(url);
                    AssertPanel.Show("此版本已停止维护，请点击复制链接，前往浏览器下载最新最新版本。", () => {
                        game.end();
                    }, null, "复制链接");
                } else if (data.code == 555) {
                    thisObj.kickOff = true;
                    AssertPanel.Show("您的账号已在其他地方登录", () => {
                        if (EDITOR) {
                            EventMgr.emit("logout_game");
                        } else {
                            game.end();
                        }
                    });
                } else {
                    const text = CfgMgr.GetText("server_" + data.code.toString());
                    if (text != '') Tips.Show(text);
                }
            } else if (MsgTypeRet[data.type]) {
                thisObj.dispatcher.emit(data.type, data.data);
            } else {
                console.warn('###消息暂未监听', data.type);
            }
        }

        ws.onclose = function (ev) {
            if (ev.target != thisObj.socket) return;
            console.log("onclose", ev, thisObj.closeHandle, GameSet.GateUrl && GameSet.Token);
            thisObj.closeTick = game.totalTime;
            clearInterval(Session.heartId);
            thisObj.socket.onmessage = undefined;
            thisObj.socket.onopen = undefined;
            thisObj.socket.onerror = undefined;
            thisObj.socket.onclose = undefined;
            thisObj.socket = undefined;
            if (thisObj.kickOff) {

            } else if (thisObj.closeHandle) {
                let handle = thisObj.closeHandle;
                thisObj.closeHandle = undefined;
                handle();
            } else if (AssertPanel.Showing) {

            } else {
                if (GameSet.GateUrl && GameSet.Token) {
                    EventMgr.emit(Evt_ReConnect);
                } else {
                    AssertPanel.Show("断开连接!", () => {
                        game.restart();
                    })
                }
            }
        }
        ws.onerror = function (ev) {
            if (ev.target != thisObj.socket) return;
            console.log("onerror", ev);
            error && error();
            if (thisObj.kickOff) {

            } else if (GameSet.GateUrl && GameSet.Token) {
                EventMgr.emit(Evt_ReConnect);
            } else {
                AssertPanel.Show("断开连接!", () => {
                    game.restart();
                })
            }
        }
    }

    static get closeDuration() {
        return this.closeTick;
    }

    static get hasConnected() { return this.socket != undefined && this.socket.readyState == this.socket.OPEN; }
    static get connectting() { return this.socket != undefined; }

    static closeHandle: Function;
    static async Close(callBack?: Function) {
        if (this.socket) {
            console.log("Close", callBack);
            this.closeHandle = callBack;
            this.socket.close();
        }
    }

    private static msg_queue: { [msg: string]: number } = {};

    static connectHandle: Function;
    private static promise: Promise<any>;

    static async Send(json: any, retMsg?: string, retTick?: number, rsa = false) {
        let self = this;
        if (!this.socket || this.socket.readyState != this.socket.OPEN) {
            console.warn("连接尚未建立");
            EventMgr.emit(Evt_ReConnect);
            if (!this.promise) {
                this.promise = new Promise((resolve, reject) => {
                    self.connectHandle = resolve;
                });
            }
            await this.promise;
        }

        let tick = this.msg_queue[retMsg];
        let pingRetTick = retTick ? retTick : PingRet_Tick;
        if (tick && game.totalTime - tick < pingRetTick) return false;
        if (retMsg) this.msg_queue[retMsg] = game.totalTime;

        if (rsa) {
            let encrypt = new JSEncrypt();
            encrypt.setPublicKey(this.publicKey);
            // json.data = encrypt.encrypt(JSON.stringify(json.data));
            json.data = encrypt['encryptLong2'](JSON.stringify(json.data));
        }
        let data = JSON.stringify(json);
        // if (this.socket.bufferedAmount != 0) {
        //     console.log("msg await");
        //     await Second(0.01);
        // }
        if (json['type'] != "0_Ping" && json['type'] != "16_GetDefeatStatus") console.log("@msg>>>", data);
        this.socket.send(data);
        return true;
    }

    /** 重置心跳定时器 */
    public static startHeartbeat() {
        clearInterval(this.heartId);
        this.$sendHeartbeat();
        this.heartId = setInterval(this.$sendHeartbeat.bind(this), PingRet_Tick);
    }

    /** 发送心跳包 */
    private static $sendHeartbeat() {
        if (this.hasConnected) {
            let data = {
                type: MsgTypeSend.Ping,
                data: {

                },
            }
            this.Send(data);
        } else {
            // AssertPanel.Show("断开连接!", () => {
            //     game.restart();
            // });
        }
    }
    /** 判断是否为心跳包 */
    private static _isHeartbeat(type: string) {
        if (type == MsgTypeRet.PingRet) {
            return true;
        }
        return false;
    }

    private static dispatcher: Node = new Node();

    /** 添加监听 */
    static on(type: string | NodeEventType, callback: __private._types_globals__AnyFunction, target?: unknown, useCapture?: any): void {
        this.dispatcher.on(type, callback, target, useCapture);
    }

    /** 派发监听 */
    static emit(type: string, arg0?: any, arg1?: any, arg2?: any, arg3?: any, arg4?: any): void {
        this.dispatcher.emit(type, arg0, arg1, arg2, arg3, arg4);
    }

    /** 是否已存在监听 */
    static hasEventListener(type: string, callback?: __private._types_globals__AnyFunction, target?: unknown): any {
        this.dispatcher.hasEventListener(type, callback, target);
    }

    /** 执行单次监听，派发后移除监听 */
    static once(type: string, callback: __private._types_globals__AnyFunction, target?: unknown, useCapture?: any): void {
        this.dispatcher.once(type, callback, target, useCapture);
    }

    /** 移除监听 */
    static off(type: string, callback?: __private._types_globals__AnyFunction, target?: unknown, useCapture?: any): void {
        this.dispatcher.off(type, callback, target, useCapture);
    }

    /** 根据Target移除监听 */
    static removeByTarget(target: string | unknown): void {
        this.dispatcher.targetOff(target);
    }
}