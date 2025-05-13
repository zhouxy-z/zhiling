import { EventHandler, Node, NodeEventType, Socket, __private, game } from "cc";
import { MsgTypeRet, MsgTypeSend } from "../MsgType";
import { EventMgr, Evt_ReConnect } from "../manager/EventMgr";
import PlayerData from "../module/roleModule/PlayerData";
import { ANDROID, DEV, EDITOR, HUAWEI, IOS } from "cc/env";
import { CfgMgr } from "../manager/CfgMgr";
import { GameSet } from "../module/GameSet";
import { CopyToClip } from "../Platform";
import { Tips } from "../module/login/Tips";

const PingRet_Tick = 10000;

export class Agent {

    private closeTick = undefined;
    private socket: WebSocket;
    private heartId: number;

    constructor(url: string, sucess?: Function, error?: Function) {
        if (this.socket) {
            console.warn("请先断开已有连接");
            return;
        }
        console.log("connect------>", url);
        const ws = new WebSocket(url);
        this.socket = ws;
        let thisObj = this;
        ws.onopen = function (ev) {
            console.log("onopen", ev);
            if (ev.target != thisObj.socket) return;
            thisObj.closeTick = undefined;
            sucess && sucess();
        }
        ws.onmessage = function (ev) {
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
                Tips.Show("您的连接已断开！");
                return;
            } else if (data.type != "PingRet" && data.type != "TaskDataChangedPush") {
                if (DEV) {
                    console.log("<<<", JSON.parse(ev.data));
                } else {
                    console.log("<<<", ev.data);
                }
            }

            if (thisObj._isHeartbeat(MsgTypeRet[data.type])) {
                // console.log('心跳返回------>>>', data)
                if (data && data.data && data.data.timestamp) {
                    PlayerData.SyncServerTime(data.data.timestamp);
                }
            }
            if (data.code) {
                console.log("code############", data.code);
                thisObj.dispatcher.emit(data.type, data.data);
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
            clearInterval(thisObj.heartId);
            thisObj.socket.onmessage = undefined;
            thisObj.socket.onopen = undefined;
            thisObj.socket.onerror = undefined;
            thisObj.socket.onclose = undefined;
            thisObj.socket = undefined;
            if (thisObj.closeHandle) {
                let handle = thisObj.closeHandle;
                thisObj.closeHandle = undefined;
                handle();
            } else {
                if (GameSet.GateUrl && GameSet.Token) {
                    EventMgr.emit(Evt_ReConnect);
                } else {
                    Tips.Show("断开连接!", () => {
                        // game.restart();
                    })
                }
            }
        }
        ws.onerror = function (ev) {
            if (ev.target != thisObj.socket) return;
            console.log("onerror", ev);
            error && error();
            if (GameSet.GateUrl && GameSet.Token) {
                EventMgr.emit(Evt_ReConnect);
            } else {
                Tips.Show("断开连接!", () => {
                    // game.restart();
                })
            }
        }
    }

    get closeDuration() {
        return this.closeTick;
    }

    get hasConnected() { return this.socket != undefined && this.socket.readyState == this.socket.OPEN; }
    get connectting() { return this.socket != undefined; }

    closeHandle: Function;
    async Close(callBack?: Function) {
        if (this.socket) {
            console.log("Close", callBack);
            this.closeHandle = callBack;
            this.socket.close();
        }
    }

    private msg_queue: { [msg: string]: number } = {};

    async Send(json: Object, retMsg?: string) {
        if (!this.socket || this.socket.readyState != this.socket.OPEN) {
            console.warn("连接尚未建立");
            return;
        }

        let data = JSON.stringify(json);
        if (json['type'] != "0_Ping") console.log(">>>", data);
        this.socket.send(data);
        if (retMsg) {
            let self = this;
            return new Promise((resolve, reject) => {
                self.once(retMsg, data => {
                    resolve(data);
                }, self);
            });
        } else {
            return Promise.resolve(undefined);
        }
    }

    /** 重置心跳定时器 */
    public startHeartbeat() {
        clearInterval(this.heartId);
        this.$sendHeartbeat();
        this.heartId = setInterval(this.$sendHeartbeat.bind(this), PingRet_Tick);
    }

    /** 发送心跳包 */
    private $sendHeartbeat() {
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
    private _isHeartbeat(type: string) {
        if (type == MsgTypeRet.PingRet) {
            return true;
        }
        return false;
    }

    private dispatcher: Node = new Node();

    /** 添加监听 */
    on(type: string | NodeEventType, callback: __private._types_globals__AnyFunction, target?: unknown, useCapture?: any): void {
        this.dispatcher.on(type, callback, target, useCapture);
    }

    /** 派发监听 */
    emit(type: string, arg0?: any, arg1?: any, arg2?: any, arg3?: any, arg4?: any): void {
        this.dispatcher.emit(type, arg0, arg1, arg2, arg3, arg4);
    }

    /** 是否已存在监听 */
    hasEventListener(type: string, callback?: __private._types_globals__AnyFunction, target?: unknown): any {
        this.dispatcher.hasEventListener(type, callback, target);
    }

    /** 执行单次监听，派发后移除监听 */
    once(type: string, callback: __private._types_globals__AnyFunction, target?: unknown, useCapture?: any): void {
        this.dispatcher.once(type, callback, target, useCapture);
    }

    /** 移除监听 */
    off(type: string, callback?: __private._types_globals__AnyFunction, target?: unknown, useCapture?: any): void {
        this.dispatcher.off(type, callback, target, useCapture);
    }

    /** 根据Target移除监听 */
    removeByTarget(target: string | unknown): void {
        this.dispatcher.targetOff(target);
    }

}