import { Canvas, Event, Game, Node, NodeEventType, RenderTexture, SpriteFrame, Texture2D, game, native, profiler } from "cc";
import { ANDROID, DEBUG, DEV, HUAWEI, IOS } from "cc/env";
import { GameSet } from "./module/GameSet";
import { EventMgr, Evt_Hide_Scene, Evt_Layout_Status_Bar, Evt_ReLogin, Goto } from "./manager/EventMgr";
import { Second, copyToClip } from "./utils/Utils";
import LocalStorage from "./utils/LocalStorage";

/**游戏是否切换到后台 */
export function IsBackGround() {
    return background > 0;// && game.totalTime - background >= 5000;
}
let identifier = "";
let select_server = false;
let auto_login = false;
let debug_login = false;
let fengkong = false;
let background: number = -1;
let jsbInit = false;
let initSuccess: Function;
let initPromise: Promise<any>;
let appInfo: {
    versionCode: string,
    versionName: string,
    accountId: string,
    avatar: string,
    distinctId: string,
    inviteCode: string,
    isNew: string,
    nickname: string,
    token: string,
    unionId: string,
    deviceInfo: {
        Device_Manufacturer: string,
        Device_Model: string,
        Android_Version: string,
        API_Level: string,
        Device_Id: string
    }
};
let channelInfo: {
    accountId: string,
    avatar: string,
    distinctId: string,
    inviteCode: string,
    isNew: string,
    nickname: string,
    token: string,
    unionId: string,
}
let gemInstalled = false;

export const Api_Init: string = "init";
export const Api_StatusBarHeight: string = "StatusBarHeight";
export const Api_Pick_phone: string = "pick_phone";
export const Api_Image_base64: string = "image_base64";
export const Api_Has_image: string = "has_image";
export const Api_Exit_Game: string = "exit";
export const Api_Copy_Clip: string = "copy_clip";
export const Api_Get_Clip: string = "get_clip";
export const Api_Login_Channel: string = "login_channel";
export const Api_Token_Expired: string = "token_expired";
export const Api_Login_Init: string = "login_init";
export const Api_Inster_Image: string = "api_inster_image";
export const Api_Check_Permission: string = "api_check_permission";
export const Api_Share: string = "api_share";
export const Api_User_Profile: string = "user_profile";
export const Api_Gem_Exchange: string = "gem_exchange";
export const Api_Bind_Gem: string = "bind_gem";
export const Api_Is_Installed: string = "api_is_installed";
export const Check_Gem_Installed: string = "check_gem_installed";
export const Api_Open_Url: string = "open_url";
export const Api_Risk_Check: string = "api_risk_check";
export const Api_Liveness: string = "api_liveness";

export const GameVer: string = "v1.0.0.8452";//游戏版本号

let adcfg: {
    readonly cpId: any;
    readonly appId: any;
    readonly channel: any;
    readonly debug: any;
    readonly intertAdid: any;
    readonly splashAdId: any;
    readonly fullScreenAdId: any;
    readonly rewardAdId1: any;
    readonly rewardAdId2: any;
    readonly rewardAdId3: any;
    readonly rewardAdId4: any;
}
export function getAdcfg() {
    if (!adcfg) {
        //ios
        if (IOS) {
            adcfg = {
                cpId: '554389974204485',
                appId: '574939944251525',
                channel: 'iOS',
                debug: true,
                intertAdid: '578828359024837',
                splashAdId: '574940040655045',
                fullScreenAdId: '578828409331909',
                rewardAdId1: '582052268404933',
                rewardAdId2: '584762333716677',
                rewardAdId3: '584762387296453',
                rewardAdId4: '584762429493445'
            };
        } else {
            adcfg = {
                cpId: '554389974204485',
                appId: '574939944251525',
                channel: 'demo-xiaomi',
                debug: true,
                intertAdid: '578828359024837',
                splashAdId: '574940040655045',
                fullScreenAdId: '578828409331909',
                rewardAdId1: '574940085264581',
                rewardAdId2: '584762109395141',
                rewardAdId3: '584762176528581',
                rewardAdId4: '584762238447813'
            }
        }
    }

    return adcfg;
}

let qbCfg: {
    appId: string,
    splashAdId: string,
    intertAdid: string,
    rewardAdId1: string,
    rewardAdId2: string,
    rewardAdId3: string,
    rewardAdId4: string,
}
export function getQbAdCfg() {
    if (!qbCfg) {
        if (IOS) {
        } else {
            qbCfg = {
                appId: '1833762292118868034',
                splashAdId: '',
                intertAdid: '',
                rewardAdId1: '1833762554829099086',
                rewardAdId2: '1834062755796111426',
                rewardAdId3: '1834062958045450322',
                rewardAdId4: '1834063113226309704',
            }
        }
    }
    return qbCfg;
}



/**
 * 平台接口
 */
export class Platform {
    private static instance: Platform;

    static async Init() {
        if (this.instance) return Promise.resolve();
        if (ANDROID || HUAWEI || IOS) {
            initPromise = new Promise((resolve, reject) => {
                initSuccess = resolve;
            })
        }
        this.instance = new Platform();
        if (initPromise) {
            return initPromise;
        } else {
            return Promise.resolve();
        }
    }

    constructor() {
        game.on(Game.EVENT_HIDE, this.onHide, this);
        game.on(Game.EVENT_SHOW, this.onShow, this);

        if (ANDROID || HUAWEI || IOS) {
            if (native && native.jsbBridgeWrapper && native.jsbBridgeWrapper.addNativeEventListener) {
                // 接收app消息
                native.jsbBridgeWrapper.addNativeEventListener("call_game", (jsonStr: string) => {
                    console.log("call_game", jsonStr);
                    try {
                        let json = JSON.parse(jsonStr);
                        switch (json.api) {
                            case Api_Init:
                                if (jsbInit) return;
                                jsbInit = true;
                                appInfo = JSON.parse(json.data);
                                if (appInfo['dout'] && appInfo['dout'] != "") {
                                    EventMgr.emit("AdHelper.init");
                                    // AdHelper.init(getAdcfg().cpId, getAdcfg().appId, getAdcfg().channel, getAdcfg().debug);
                                }
                                if (appInfo['debug_login']) debug_login = true;
                                if (appInfo['auto_login']) auto_login = true;
                                if (appInfo['local']) GameSet.globalCfg = undefined;
                                if (appInfo['select_server']) select_server = true;
                                if (appInfo['identifier']) identifier = appInfo['identifier'];
                                if (appInfo['fengkong']) fengkong = true;
                                if (appInfo['dev_version']) {
                                    LocalStorage.SetString("dev_version", appInfo['dev_version']);
                                } else {
                                    LocalStorage.SetString("dev_version", "");
                                }
                                let cache = LocalStorage.GetString("login_channel", "");
                                if (cache && cache != "") {
                                    channelInfo = JSON.parse(cache);
                                }
                                initSuccess();
                                CallApp({ api: Api_Login_Init, appid: "zljq" });
                                break;
                            case Api_Login_Channel:
                                let loginInfo = JSON.parse(json.data);
                                if (IOS && channelInfo && channelInfo.token != loginInfo.token && GameSet.intoGame) {
                                    EventMgr.emit("logout_game");
                                }
                                channelInfo = loginInfo;
                                LocalStorage.SetString("login_channel", json.data);
                                break;
                            case Api_Token_Expired:
                                channelInfo = undefined;
                                window['usercode'] = undefined;
                                LocalStorage.RemoveItem("login_channel");
                                break;
                            case Api_StatusBarHeight:
                                GameSet.StatusBarHeight = json.data || 0;
                                if (IOS && GameSet.StatusBarHeight) {
                                    GameSet.StatusBarHeight = 100;
                                }
                                EventMgr.emit(Evt_Layout_Status_Bar);
                                break;
                            case Api_Pick_phone:
                                var callBack = apiCallbacks[json.api];
                                apiCallbacks[json.api] = undefined;
                                callBack && callBack(json.data);
                                break;
                            case Api_Image_base64:
                                var callBack = apiCallbacks[json.api];
                                apiCallbacks[json.api] = undefined;
                                callBack && callBack(json.data);
                                break;
                            case Api_Has_image:
                                var callBack = apiCallbacks[json.api];
                                apiCallbacks[json.api] = undefined;
                                callBack && callBack(json.data);
                                break;
                            case Api_Exit_Game:
                                var callBack = apiCallbacks[json.api];
                                apiCallbacks[json.api] = undefined;
                                callBack && callBack(json.data);
                                break;
                            case Api_Check_Permission:
                                var callBack = apiCallbacks[json.api];
                                apiCallbacks[json.api] = undefined;
                                callBack && callBack(json.data);
                                break;
                            case Api_Copy_Clip:
                                var callBack = apiCallbacks[json.api];
                                apiCallbacks[json.api] = undefined;
                                callBack && callBack(json.data);
                                break;
                            case "key_back":
                                if (!GameSet['release']) {
                                    GameSet.debug = true;
                                    profiler.showStats();
                                }
                                let operate = GameSet.ForBack();
                                CallApp({ api: "key_back", operate: operate });
                                break;
                            case "api_touch":
                                console.log("app touch", json.data);
                                if (json.data == "up") {
                                    EventMgr.emit("app_touch_up");
                                }
                                break;
                            case "sdk_logout":
                                LocalStorage.RemoveItem("login_channel");
                                channelInfo = undefined;
                                window['usercode'] = undefined;
                                EventMgr.emit("logout_game");
                                break;
                            case "change_account":
                                EventMgr.emit("logout_game");
                                channelInfo = JSON.parse(json.data);
                                LocalStorage.SetString("login_channel", json.data);
                                break;
                            case Api_Bind_Gem:
                                let userInfo: { result: number, code: number, state: number } = JSON.parse(json.data);
                                if (IOS) {
                                    if (userInfo.result == 1) {

                                    } else if (userInfo.result == 2) {

                                    } else {
                                        EventMgr.emit("bind_gem", userInfo);
                                    }
                                } else {
                                    if (userInfo.result == 2000) {
                                        EventMgr.emit("bind_gem", userInfo);
                                    } else {
                                        // MsgPanel.Show("获取宝石账号失败(" + userInfo.result + ")");
                                    }
                                }
                                var callBack = apiCallbacks[json.api];
                                apiCallbacks[json.api] = undefined;
                                callBack && callBack(json.data);
                                break;
                            case Api_Gem_Exchange:
                                let payResult: { message: string, code: number, orderNo: string } = JSON.parse(json.data);
                                EventMgr.emit("gem_exchange", payResult);
                                if (payResult.code == 51800) {
                                } else {
                                    // MsgPanel.Show("调起兑换失败(" + payResult.code + ")");
                                }
                                var callBack = apiCallbacks[json.api];
                                apiCallbacks[json.api] = undefined;
                                callBack && callBack(json.data);
                                break;
                            case Api_Is_Installed:
                                let result = json.data;
                                EventMgr.emit(Api_Is_Installed, result);
                                var callBack = apiCallbacks[json.api];
                                apiCallbacks[json.api] = undefined;
                                callBack && callBack(json.data);
                                break;
                            case Check_Gem_Installed:
                                gemInstalled = json.data == "true";
                                EventMgr.emit(Check_Gem_Installed, gemInstalled);
                                var callBack = apiCallbacks[json.api];
                                apiCallbacks[json.api] = undefined;
                                callBack && callBack(gemInstalled);
                                break;
                            case Api_Risk_Check:
                                let rc_token = json.data;
                                EventMgr.emit(Api_Risk_Check, { authorization: GetUserCode(), rc_token: rc_token });
                                var callBack = apiCallbacks[json.api];
                                apiCallbacks[json.api] = undefined;
                                callBack && callBack({ authorization: GetUserCode(), rc_token: rc_token });
                                break;
                            case Api_Liveness:
                                let msg = json.data;
                                EventMgr.emit(Api_Liveness, msg);
                                var callBack = apiCallbacks[json.api];
                                apiCallbacks[json.api] = undefined;
                                callBack && callBack(msg);
                                break;

                            default:

                        }
                    } catch (e) {

                    }
                })
                EventMgr.emit("AdHelper.startAction");
                // AdHelper.startAction();
                if (!jsbInit) {
                    CallApp({ api: Api_Init });
                }
            } else {
                console.error("native.jsbBridgeWrapper.addNativeEventListener");
            }
        }
    }

    private onHide() {
        // if (ANDROID || HUAWEI || IOS) return;
        console.log("#切换到后台");
        background = game.totalTime;
        EventMgr.emit(Game.EVENT_HIDE);
    }

    private onShow() {
        if (ANDROID || HUAWEI || IOS) {
            background = 0;
        } else {
            console.log("#返回到前台");
            if (IsBackGround()) {
                console.log("#恢复游戏#");
                if (!DEV) location.reload();
            }
            background = -1;
        }
        EventMgr.emit(Game.EVENT_SHOW);
    }
}

export function GetIdentifier() {
    return identifier;
}

export function GetUserCode() {
    if (auto_login) return "test1";
    if (channelInfo && channelInfo.token) return channelInfo.token;
    return window['usercode'];
}

export function hasSdk() {
    if (auto_login) return false;
    if (channelInfo && channelInfo.token) return true;
    return false;
}

export function isFengkong() {
    return fengkong;
}

export function debugLogin() {
    return debug_login;
}

export function CanSelectServer() {
    return select_server;
}

export function autoLogin() {
    return auto_login;
}

let riskLoop = 0;
export async function CheckRisk(callback: (data: { authorization: string, rc_token: string }) => void) {
    if (GetVersionNumber() < 25) {
        callback({ authorization: GetUserCode(), rc_token: "" });
    } else if (IOS) {
        await Second(riskLoop);
        riskLoop += 0.5;
        CallApp({ api: Api_Risk_Check, token: GetUserCode() }, (result: { authorization: string, rc_token: string }) => {
            if (!result.rc_token || result.rc_token == "") {
                if (riskLoop < 5) {
                    CheckRisk(callback);
                } else {
                    riskLoop = 0;
                    try {
                        Goto("Tips", "风控检测失败！");
                    } catch (e) { }
                }
            } else {
                riskLoop = 0;
                callback(result);
            }
        });
    } else {
        CallApp({ api: Api_Risk_Check, token: GetUserCode() }, (result: { authorization: string, rc_token: string }) => {
            if (!result.rc_token || result.rc_token == "") {
                riskLoop = 0;
                try {
                    Goto("Tips", "风控检测失败！");
                } catch (e) { }
            } else {
                callback(result);
            }
        });
    }
}

/**获取设备信息 */
export function GetDeviceInfo() {
    if (!appInfo) return undefined;
    return appInfo.deviceInfo;
}

/**获取昵称 */
export function GetNickName() {
    if (!appInfo) return undefined;
    return appInfo.nickname;
}

/**获取邀请码 */
export function GetInviteCode() {
    if (!appInfo) return undefined;
    return appInfo.inviteCode;
}

export function GetVersionCode() {
    if (!appInfo) return undefined;
    return appInfo.versionCode;
}

export function GetVersionName() {
    if (!appInfo) return "1.0.9999999999";
    return appInfo.versionName;
}

export function GetVersionNumber() {
    let versionName = GetVersionName();
    if (versionName) {
        let ls = versionName.split(".");
        if (ls.length) {
            let version = Number(ls[2]);
            return version || 0;
        }
    }
    return 0;
}

export function CheckGemInstalled() {
    return gemInstalled;
}

let apiCallbacks: { [api: string]: Function } = {};

/**
 * 发送消息给app
 * @param json 
 */
export function CallApp(json: any, callBack?: Function) {
    console.log("CallApp", JSON.stringify(json));
    try {
        if (callBack) apiCallbacks[json.api] = callBack;
        let jsonStr = JSON.stringify(json);
        native.jsbBridgeWrapper.dispatchEventToNative("call_app", jsonStr);
    } catch (e) {

    }
}

/**
 * 复制到粘贴板
 * @param desc 
 * @param callBack 
 */
export function CopyToClip(desc: string, callBack?: (desc: string) => void) {
    if (jsbInit) {
        CallApp({ api: Api_Copy_Clip, desc: desc }, callBack);
    } else {
        let result = copyToClip(desc);
        if (callBack) {
            if (result) {
                callBack(desc);
            } else {
                callBack("");
            }
        }
    }
}

declare var AndroidCaller: any;
export function PostUriMsg(url_type: any) {
    if (ANDROID || HUAWEI || IOS) return;
    console.log('myPostMsg', url_type)
    let data = {
        action: 'h5battlegame',
        message: {
            url_type
        }
    }
    if (window["platform"]) {
        var platform = window["platform"];
    } else {
        var platform = "";
    }
    if (platform == "ios") {
        window['webkit'].messageHandlers.nativeHandler.postMessage(JSON.stringify(data));
    } else if (platform == "android") {
        AndroidCaller.postMessage(JSON.stringify(data));
    } else if (window['uni']) {
        window['uni'].webView.postMessage({
            data
        })
    }
}