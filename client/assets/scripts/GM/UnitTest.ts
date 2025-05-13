import { random, js } from "cc";
import { MsgTypeRet, MsgTypeSend } from "../MsgType";
import { BuildingView } from "../battle/BattleLogic/view/BuildingView";
import { CfgMgr } from "../manager/CfgMgr";
import { Tips } from "../module/login/Tips";
 import {BuildingState,SBattleRole,SOrderData,SBenefit,SPlayerData,SPlayerDataBuilding,SPlayerDataRole} from "../module/roleModule/PlayerStruct";
import { GetLoginInfo, Http } from "../net/Http";
import { Second, getDefinitionByName, randomI } from "../utils/Utils";
import { Agent } from "../editor/Agent";
import { EventMgr } from "../manager/EventMgr";
import { DEV } from "cc/env";

export class UnitTest {
    private userCode: string;
    private agent: Agent;
    private loginInfo: any;
    private initSub: Promise<any>;
    private hasLogin = false;
    playerInfo: SPlayerData;
    tradeData: {my_trade:any[], order_list:any[]} = {my_trade:[], order_list:[]}//交易所数据
    private steps: { [step: number]: { p: Promise<any>, h: Function } } = {};

    /**权益卡数据 */
    rightsData: SBenefit = null;
    constructor(user: string, url: string) {
        let self = this;
        this.userCode = user;
        this.initSub = new Promise((resolve, reject) => {
            (async function () {
                let uri: any = GetLoginInfo;
                uri.serverUrl = url;
                let loginInfo = await Http.Send(uri, { code: user });
                if (!loginInfo || !loginInfo.gate_url || !loginInfo.gate_url.length) {
                    console.error("登录失败" + user);
                    resolve(undefined);
                }
                self.loginInfo = loginInfo;
                self.agent = new Agent(loginInfo.gate_url, async function () {
                    await self.onconnect();
                    resolve(self.playerInfo.player_id);
                });
            })();
        })
    }
    private async onconnect() {
        let data = {
            type: "0_VerifyToken",
            data: {
                token: this.loginInfo.token,
                version: "3"
            }
        }
        await this.agent.Send(data, MsgTypeRet.VerifyTokenRet);
        this.agent.on(MsgTypeRet.BenefitPush, this.onBenefitPush, this);
        this.playerInfo = await this.agent.Send({ type: MsgTypeSend.GetPlayerData, data: {} }, MsgTypeRet.GetPlayerDataRet);
        await this.All(MsgTypeRet.BenefitPush);
        this.agent.startHeartbeat();
        this.hasLogin = true;
    }

    get loginning() { return this.initSub; }

    get user() { return this.userCode; }

    private onBenefitPush(data: SBenefit) {
        // console.log("权益" ,  data)
        this.rightsData = data;
    }
    async UpdatePlayerInfo() {
        this.playerInfo = await this.agent.Send({ type: MsgTypeSend.GetPlayerData, data: {} }, MsgTypeRet.GetPlayerDataRet);
        return Promise.resolve(this.playerInfo);
    }

    /**
     * 获取指定建筑
     * @param id 
     * @param level 
     * @returns 
     */
    GetBuilding(id: number, level?: number) {
        let buildings = this.playerInfo.homelands[0].buildings;
        for (let building of buildings) {
            if (building.id == id) {
                if (level) building.level = level;
                return building;
            }
        }
        let obj: SPlayerDataBuilding = {
            id: id,
            level: level || 0,
            is_upgrading: true,
            upgrade_time: 0,
            state: BuildingState.Building
        };
        buildings.push(obj);
        return obj;
    }
    /**
     * 获取道具
     * @param ids 
     * @returns 
     */
    GetItem(...ids: any[]) {
        let items = this.playerInfo.items || [];
        for (let id of ids) {
            for (let item of items) {
                if (item.id == id && item.count > 0) {
                    return item;
                }
            }
        }
        return undefined;
    }

    GetIsActivateRights() {
        return Object.keys(this.rightsData.all_equities).length > 0;
    }
    /**
     * 设置道具
     * @param data 
     * @returns 
     */
    SetItem(data: { id: any, count: number }) {
        this.playerInfo.items = this.playerInfo.items || [];
        for (let i = 0; i < this.playerInfo.items.length; i++) {
            let item = this.playerInfo.items[i];
            if (item.id == data.id) {
                let old = item.count;
                if (data.count <= 0) {
                    this.playerInfo.items.splice(i, 1);
                } else {
                    item.count = data.count;
                }
                return;
            }
        }
        this.playerInfo.items.push({ id: data.id, count: data.count, isNew: true });
    }

    /**
     * 发送消息
     * @param json 
     * @param retMsg 
     * @returns 
     */
    async Send(json: Object, retMsg?: string) {
        if (!this.hasLogin) await this.initSub;
        return this.agent.Send(json, retMsg);
    }

    /**
     * 自动发送消息直至服务器返回成功
     * @param json 
     * @param retMsg 
     * @param limitTimes 设置次数上限，超过此次数则自动判定失败并返回
     */
    async AutoSend(json: Object, retMsg: string, limitTimes: number = 10000) {
        if (!this.hasLogin) await this.initSub;
        let loop = 0, result: any;
        while (++loop < limitTimes) {
            result = await this.agent.Send(json, retMsg);
            if (!result.errorCode) break;
        }
        return Promise.resolve(result);
    }

    /**
     * 对指定协议组监听一次
     * @param ls 
     */
    async All(...ls: string[]) {
        let p = new Promise((resolve, reject) => {
            let loop = ls.length;
            for (let p of ls) {
                this.agent.once(p, data => {
                    if (!data.code) {
                        if (loop > 0) resolve(undefined);
                        loop = 0;
                    } else {
                        loop--;
                        if (loop <= 0) {
                            resolve(data.code);
                        }
                    }
                }, this);
            }
        });
        return p;
    }

    /**
     * 对指定协议组监听一次是否全部成功
     * @param ls 
     * @returns 
     */
    async AllSuccess(...ls: string[]) {
        let p = new Promise((resolve, reject) => {
            let loop = ls.length;
            let fail = ls.length;
            for (let p of ls) {
                this.agent.once(p, data => {
                    loop--;
                    if (data.code) {
                        if (loop <= 0) {
                            if (fail > 0) {
                                resolve(false);
                            } else {
                                resolve(true);
                            }
                        }
                    } else {
                        fail--;
                    }
                }, this);
            }
        });
        return p;
    }

    on(type: string, cb: Function, thisObj?: any) {
        this.agent.on(type, cb, thisObj);
    }
    once(type: string, cb: Function, thisObj?: any) {
        this.agent.once(type, cb, thisObj);
    }
    off(type: string, cb?: Function, thisObj?: any) {
        this.agent.off(type, cb, thisObj);
    }

    /**
     * 标记可插入步骤id
     * @param step 
     * @returns 
     */
    Step(step: number) {
        return this.steps[step].p;
    }

    /**
     * 暂停指定步骤先执行下文内容，一般和ResumeStep配合上下文执行
     * @param args 
     */
    PauseStep(...args: number[]) {
        for (let step of args) {
            if (!this.steps[step]) {
                let h: Function;
                let p = new Promise((resolve, reject) => {
                    h = resolve;
                });
                this.steps[step] = { p: p, h: h };
            }
        }
    }

    /**
     * 恢复上文步骤，一般和PauseStep配合上下文执行
     * @param args 
     */
    ResumeStep(...args: number[]) {
        for (let step of args) {
            if (this.steps[step]) {
                this.steps[step].h();
                this.steps[step] = undefined;
            }
        }
    }

    destory() {
        this.agent.Close();
        this.agent = undefined;
    }

      /**自己上架订单数据 */
      SetTradeData(data){
        console.log("上架订单返回",data)
        if(!data.order)return;
        this.tradeData.my_trade.push(data.order);
    }

    /**交易订单列表 */
    SetTradeOrderData(data){
        console.log("交易订单列表返回",data)
        if(!data.order_list)return;
        for (let index = 0; index < data.order_list.length; index++) {
            const element = data.order_list[index];
            if(!element.things.data.role) {
                this.tradeData.order_list.push(element);
            }
        }
    }

    /**交易成功刷新交易订单列表 */
    UpdateTradeOrderData(reward_data: { code: number, order: SOrderData}){     
        if (reward_data.code == 0) {
            if (reward_data.order.order_type == "sell") {            
                console.log("兑换成功，请到邮件领取商品")
            } else {     
                console.log("出售成功，请到邮件领取彩")
            }
            
            // let list:SOrderData[] = this.tradeData.order_list;
            // let count =  list.length - 1
            for (let index = this.tradeData.order_list.length - 1; index > 0; index--) {
                let element = this.tradeData.order_list[index];
                if(element.view_id == reward_data.order.view_id){
                    if(element.order_id != reward_data.order.order_id){
                        element.close_time = reward_data.order.close_time;
                        element.from_order_id = reward_data.order.from_order_id;
                        element.nonce = reward_data.order.nonce;
                        element.open_time = reward_data.order.open_time;
                        element.order_id = reward_data.order.order_id;
                        element.order_type = reward_data.order.order_type;
                        element.player_id = reward_data.order.player_id;
                        element.player_name = reward_data.order.player_name;
                        element.things = reward_data.order.things;
                        element.unit_count = reward_data.order.unit_count;
                        element.unit_step = reward_data.order.unit_step;
                        element.unit_value = reward_data.order.unit_value;
                        element.view_id = reward_data.order.view_id;
                    }else{
                        element.unit_count = 0;
                        this.tradeData.order_list.splice(index,1);
                    }  
                }
            } 
            
        } else if(reward_data.code == 101){ 
            console.log("出售失败");
        }     
    }
}
