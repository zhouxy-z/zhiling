import { _decorator, Canvas, Component, EditBox, EventTouch, find, Input, JsonAsset, native, Node, RenderTexture, Sprite, TextAsset, Texture2D } from 'cc';
import { base64ToImage, BytesToBase64, randomI, Second } from '../../utils/Utils';
import { ResMgr } from '../../manager/ResMgr';
import { QrcodeMaker } from '../../utils/QrcodeMaker';
import { FilmMaker } from '../../manager/FilmMaker';
import { ConsumeItem } from '../../module/common/ConsumeItem';
import { UnitTest } from '../UnitTest';
import { MsgTypeRet, MsgTypeSend } from '../../MsgType';
import { BuildingType } from '../../module/home/HomeStruct';
import { CfgMgr, ItemSubType, ThingType } from '../../manager/CfgMgr';
import PlayerData from '../../module/roleModule/PlayerData'
 import {RoleStateType,SOrderData,SOrderType,SPlayerData,SPlayerDataRole,SThing} from '../../module/roleModule/PlayerStruct';
import { Http } from '../../net/Http';

const { ccclass, property } = _decorator;

@ccclass('tradeTest')
export class tradeTest extends Component {

    // private PlayerDate:UnitTest
    private cfg
    private playerList:UnitTest[] = []

    private serverUrl = "http://192.168.0.60:18001";
    // private serverUrl = "http://124.71.83.101:17999";
    // private serverUrl = "http://124.71.83.101:18000";
    // private serverUrl = "http://192.168.0.18:7999";
    protected async onLoad() {
        let label1 = find("Canvas/name").getComponent(EditBox);
        let label2 = find("Canvas/start").getComponent(EditBox);
        let label3 = find("Canvas/end").getComponent(EditBox);
        let self = this;
        find("Canvas/Button").on(Input.EventType.TOUCH_END, e => {
            let name = label1.string;
            let start = Number(label2.string);
            let end = Number(label3.string);
            if (isNaN(start) || isNaN(end)) return;
            for (let i = start; i <= end; i++) {
                self.createPlayer(name + i);
            }
        }, this);

        find("Canvas/Button-001").on(Input.EventType.TOUCH_END, this.onButton, this);
        find("Canvas/Button-002").on(Input.EventType.TOUCH_END, this.onButton, this);
        find("Canvas/Button-003").on(Input.EventType.TOUCH_END, this.onButton, this);
        find("Canvas/Button-004").on(Input.EventType.TOUCH_END, this.onButton, this);
        find("Canvas/Button-005").on(Input.EventType.TOUCH_END, this.onButton, this);
    }

    async createPlayer(user: string) {
        const host = "http://192.168.0.60:7882";
        // const host = "http://124.71.83.101:7880";
        // const host = "http://124.71.83.101:7881";
        // const host = "http://192.168.0.18:7880";

        // 创建单元
        let player1 = new UnitTest(user, host);
        this.playerList.push(player1)
        
        // 等待连接完毕
        await player1.loginning;
        await ResMgr.PrevLoad();
        await CfgMgr.Load();
    
        player1.on("ExchangesCreateSellOrderRet", player1.SetTradeData, player1);
        player1.on("ExchangesCreateBuyOrderRet", player1.SetTradeData, player1);
        player1.on("ExchangesQueryViewRet", player1.SetTradeOrderData, player1);
        player1.on("ExchangesTradeRet", player1.UpdateTradeOrderData, player1)
        // this.PlayerDate = player1;
    }

    private onButton(e:EventTouch){
        let name = e.currentTarget.name
        console.log(name);
        switch (name) {
            case "Button-001":
                for (let btn_1 = 0; btn_1 < 10; btn_1++) {
                    this.sendSellOrder();
                    this.sendBuyOrder();
                }
                break;
            case "Button-002":
                for (let btn_2 = 0; btn_2 < 10; btn_2++) {    
                    this.xiajia();
                }
                break;
            case "Button-003":
                for (let Index = 1; Index < 3; Index++) {             
                    this.ViewByThingSendTypeBuy(Index)
                    this.ViewByThingSendTypeSell(Index)
                }
                break; 
            case "Button-004":
                this.BuyOrSellItemSend()
                break; 
            case "Button-005":
                this.add()
                break; 
            case "Button-006":
                this.BuyOrSellItemSend()
                break; 
            default:
                break;
        }

    }

    /**添加玩家资源 */
    private async add(){
        let item_list = CfgMgr.Get("Item");;
        for (let index = 0; index <  this.playerList.length; index++) {
            const element =  this.playerList[index];
            //增加道具
            for (let index in item_list) {
                Http.Send({serverUrl: this.serverUrl, uri: "/api/player",}, 
                    { player_id: element.playerInfo.player_id, type: "AddItem", data:  {"item_id": item_list[index].Items, "count": 1000}}
                );
                // await Second(0.05)
            }
            // for (let index = 0; index < item_list.length; index++) {
            //     const item_element = item_list[index];             
            //     Http.Send({serverUrl: "http://192.168.0.60:18001", uri: "/api/player",}, 
            //         { player_id: element.playerInfo.player_id, type: "AddItem", data:  {"item_id": item_element.item.id, "count": 1000}}
            //     );
            // }
            //增加货币
            Http.Send({serverUrl: this.serverUrl, uri: "/api/player",}, 
                { player_id: element.playerInfo.player_id, type: "AddCurrency", data:  {"type": 0,"value": 1000000}}
            );
            //增加资源
            Http.Send({serverUrl: this.serverUrl, uri: "/api/player",}, 
                { player_id: element.playerInfo.player_id, type: "AddResource", data:  {"wood": 1000000,"water": 1000000,"rock": 1000000,"seed": 1000000}}
            );
            //增加角色
            for (let index = 0; index < 16; index++) {
                let id = "d9c71dea-7d3e-tttt-ttt1-a89a7af05909" + index;
                Http.Send({serverUrl: this.serverUrl, uri: "/api/player",}, 
                    {   player_id: element.playerInfo.player_id, type: "AddRole",
                        data:{ 
                            "role": {
                                "id": id,"type": 101 + index,"level": 1,"quality": 1, "experience": 0, "soldier_num": 0,
                                "active_skills": [{"skill_id": 10101,"level": 1}, {"skill_id": 10102, "level": 1 }],
                                "passive_skills": [ {"skill_id": 70101, "level": 1},{"skill_id": 60101,"level": 1}],
                                "battle_power": 11435,
                                "is_in_building": false,
                                "building_id": 0,
                                "is_assisting": false
                            }
                        }
                    }
                )
                // await Second(0.05)
            }
            await Second(0.05)
        }
    }

    /**创建卖单 */
    private sendSellOrder(): void {
        let getThing = (element:UnitTest) => {
            let type = [1, 5, 6, 4]
            let num = type[randomI(0, type.length)]
            let value
            let price
            switch (num) {
                case 1:
                    let item_list = this.GetResBySubType(0, element);
                    console.log(item_list)
                    if (!item_list || item_list.length == 0) return;
                    let item_selectData = item_list[randomI(0, item_list.length - 1)]
                    let item_tradeData = CfgMgr.GetTradeData(item_selectData, SOrderType.SELL);
                    if (!item_tradeData) return;
                    value = {
                        type: num,
                        item: { id: item_selectData.item.id, count: 1 * item_tradeData.Single }
                    }
                    price = item_tradeData.LowestPrice
                    break;
                case 5:
                    let role_list = this.GetResBySubType(1, element);
                    if (!role_list || role_list.length == 0) return;
                    let role_selectData = role_list[randomI(0, role_list.length - 1)]
                    let role_tradeData = CfgMgr.GetTradeData(role_selectData, SOrderType.SELL);
                    if (!role_tradeData) return;
                    value = {
                        type: num,
                        role: {
                            id: role_selectData.role.id,
                            type: role_selectData.role.type,
                            level: role_selectData.role.level,
                            quality: role_selectData.role.quality,
                            experience: role_selectData.role.experience,
                            soldier_num: role_selectData.role.soldier_num,
                            active_skills: role_selectData.role.active_skills ? role_selectData.role.active_skills : [],
                            passive_skills: role_selectData.role.passive_skills ? role_selectData.role.passive_skills : [],
                            is_in_building: role_selectData.role.is_in_building,
                            building_id: role_selectData.role.building_id ? role_selectData.role.building_id : 0,
                            battle_power: role_selectData.role.battle_power ? role_selectData.role.battle_power : 0,
                            skills: role_selectData.role.skills ? role_selectData.role.skills : [],
                            is_assisting: role_selectData.role.is_assisting,
                        }
                    }
                    price = role_tradeData.LowestPrice
                    break;
                case 6:
                    let res_list = this.GetResBySubType(2, element);
                    if (!res_list || res_list.length == 0) return;
                    let res_selectData = res_list[randomI(0, res_list.length - 1)]
                    let res_tradeData = CfgMgr.GetTradeData(res_selectData, SOrderType.SELL);
                    if (!res_tradeData) return;
                    if (res_selectData.resource.rock >= 0) {
                        value = {
                            type: num,
                            resource: { wood: 0, water: 0, rock: 1 * res_tradeData.Single, seed: 0 }
                        }
                    } else if (res_selectData.resource.seed >= 0) {
                        value = {
                            type: num,
                            resource: { wood: 0, water: 0, rock: 0, seed: 1 * res_tradeData.Single }
                        }
                    } else if (res_selectData.resource.water >= 0) {
                        value = {
                            type: num,
                            resource: { wood: 0, water: 1 * res_tradeData.Single, rock: 0, seed: 0 }
                        }
                    } else if (res_selectData.resource.wood >= 0) {
                        value = {
                            type: num,
                            resource: { wood: 1 * res_tradeData.Single, water: 0, rock: 0, seed: 0 }
                        }
                    }
                    price = res_tradeData.LowestPrice
                    break;
            }
            return [value, price]
        }
        for (let index = 0; index <  this.playerList.length; index++) {
            const element =  this.playerList[index];
            let thing_data = getThing(element);
            if (thing_data) {
                let orderData = {
                    type: MsgTypeSend.ExchangesCreateSellOrder,
                    data: {
                        unit_value: (thing_data[1]),//单价
                        unit_count: 1,//组数
                        sell_things: { data: [thing_data[0]] },
                    }
                }
                element.Send(orderData)
                
                // this.PlayerDate.Send(orderData)
            }
        }
    }

    /**创建买单 */
    private sendBuyOrder(): void {
        let getThing = () => {
            let type = [1, 5, 6, 4]
            let num = type[randomI(0, type.length - 1)]
            let value
            let price
            switch (num) {
                case ThingType.ThingTypeItem:
                    let item_list = CfgMgr.GetTradeAllData(1);
                    let item_selectData = item_list[randomI(0, item_list.length - 1)]
                    let item_tradeData = CfgMgr.GetTradeData(item_selectData, SOrderType.BUY);
                    if (!item_tradeData) return;
                    value = {
                        type: num,
                        item: { id: item_selectData.item.id, count: 1 * item_tradeData.Single }
                    }
                    price = item_tradeData.LowestPrice
                    break;
                case ThingType.ThingTypeRole:
                    let role_list = CfgMgr.GetTradeAllData(2);
                    let role_selectData = role_list[randomI(0, role_list.length - 1)]
                    let role_tradeData = CfgMgr.GetTradeData(role_selectData, SOrderType.BUY);
                    if (!role_tradeData) return;
                    value = {
                        type: num,
                        role: {
                            id: role_selectData.role.id,
                            type: role_selectData.role.type,
                            level: role_selectData.role.level,
                            quality: role_selectData.role.quality,
                            experience: role_selectData.role.experience,
                            soldier_num: role_selectData.role.soldier_num,
                            active_skills: role_selectData.role.active_skills ? role_selectData.role.active_skills : [],
                            passive_skills: role_selectData.role.passive_skills ? role_selectData.role.passive_skills : [],
                            is_in_building: role_selectData.role.is_in_building,
                            building_id: role_selectData.role.building_id ? role_selectData.role.building_id : 0,
                            battle_power: role_selectData.role.battle_power ? role_selectData.role.battle_power : 0,
                            skills: role_selectData.role.skills ? role_selectData.role.skills : [],
                            is_assisting: role_selectData.role.is_assisting,
                        }
                    }
                    price = role_tradeData.LowestPrice
                    break;
                case ThingType.ThingTypeResource:
                    let res_list = CfgMgr.GetTradeAllData(3);
                    let res_selectData = res_list[randomI(0, res_list.length - 1)]
                    let res_tradeData = CfgMgr.GetTradeData(res_selectData, SOrderType.BUY);
                    if (!res_tradeData) return;
                    if (res_selectData.resource.rock >= 0) {
                        value = {
                            type: num,
                            resource: { wood: 0, water: 0, rock: 1 * res_tradeData.Single, seed: 0 }
                        }
                    } else if (res_selectData.resource.seed >= 0) {
                        value = {
                            type: num,
                            resource: { wood: 0, water: 0, rock: 0, seed: 1 * res_tradeData.Single }
                        }
                    } else if (res_selectData.resource.water >= 0) {
                        value = {
                            type: num,
                            resource: { wood: 0, water: 1 * res_tradeData.Single, rock: 0, seed: 0 }
                        }
                    } else if (res_selectData.resource.wood >= 0) {
                        value = {
                            type: num,
                            resource: { wood: 1 * res_tradeData.Single, water: 0, rock: 0, seed: 0 }
                        }
                    }
                    price = res_tradeData.LowestPrice
                    break;
            }
            return [value, price]
        }
        let thing_data = getThing();
        if (thing_data) {
            let orderData = {
                type: MsgTypeSend.ExchangesCreateBuyOrder,
                data: {
                    unit_value: (thing_data[1]),//单价
                    unit_count: 1,//组数
                    request_things: { data: [thing_data[0]] },
                }
            }
            for (let index = 0; index < this.playerList.length; index++) {
                const element = this.playerList[index];
                element.Send(orderData)
            }
            // this.PlayerDate.Send(orderData)
        }
        for (let index = 0; index < this.playerList.length; index++) {
            const element = this.playerList[index];
            console.log(element.playerInfo.player_id)
        }
    }

    /**下架订单 */
    private xiajia(){
        for (let index = 0; index <  this.playerList.length; index++) {
            const element =  this.playerList[index];
            
            if(element.tradeData.my_trade.length <= 0) continue
            let count = element.tradeData.my_trade.length - 1
            let sessionData = {
                type: MsgTypeSend.ExchangesCancelOrder,
                data: {
                    order_id: element.tradeData.my_trade[randomI(0,count)].order_id
                }
            }
            element.Send(sessionData);
        }
    }

    /**请求购买订单数据 */
    public ViewByThingSendTypeBuy(PageIndex: number) {
        this.send_buy_or_sell(PageIndex, "buy")
    }

    /**请求出售订单数据 */
    public ViewByThingSendTypeSell(PageIndex: number) {
       this.send_buy_or_sell(PageIndex, "sell")
    }

    private send_buy_or_sell(PageIndex: number, order_type:string){
        let type = [1, 5, 6, 4]
        let num = type[randomI(0, type.length)]
        let data = {
            type: MsgTypeSend.ExchangesQueryView,
            data: {
                query_type: 3,
                query_args: {"thing_type":num},
                page_index: PageIndex,
                page_size: 30,
                order_type: order_type,
            }
        }
        for (let index = 0; index <  this.playerList.length; index++) {
            const element =  this.playerList[index];
            element.Send(data)
        }
    }

    


    /**购买 */
    private BuyOrSellItemSend() {
        for (let index = 0; index <  this.playerList.length; index++) {
            console.log("计数", index)
            const element =  this.playerList[index];
            let selectData:SOrderData = element.tradeData.order_list[randomI(0,element.tradeData.order_list.length-1)]
            if(!selectData) continue;
            let order_type = ["buy", "sell"]
            if (selectData.order_type == order_type[SOrderType.BUY]) {
                let currency = element.playerInfo.currency;
                let need_currency = Math.ceil(1 * selectData.unit_value * 100) / 100
                if (currency < need_currency) {
                console.log("货币不足")
                continue;
                }
            }
            let num 
            if (selectData.things.data[0].item) {
                num = ThingType.ThingTypeItem
            }else if(selectData.things.data[0].role){
                num = ThingType.ThingTypeRole
            }else if(selectData.things.data[0].resource){
                num = ThingType.ThingTypeResource
            }
            let getThing = () => {
                let value
                switch (num) {
                    case ThingType.ThingTypeItem:
                        value = {
                            type: num,
                            item: { id: selectData.things.data[0].item.id, count: selectData.unit_count }
                        }
                        break;
                    case ThingType.ThingTypeRole:   
                        let role = selectData.things.data[0].role;              
                        value = {
                            type: ThingType.ThingTypeRole,
                            role: {
                                id: role.id,
                                type: role.type,
                                level: role.level,
                                quality: role.quality,
                                experience: role.experience ? role.experience : 0,
                                soldier_num: role.soldier_num ? role.soldier_num : 0,
                                active_skills: role.active_skills ? role.active_skills : [],
                                passive_skills: role.passive_skills ? role.passive_skills : [],
                                is_in_building: role.is_in_building,
                                building_id: role.building_id ? role.building_id : 0,
                                battle_power: role.battle_power ? role.battle_power : 0,
                                skills: role.skills ? role.skills : [],
                                is_assisting: role.is_assisting,
                            }
                        }
                        break;
                    case ThingType.ThingTypeResource:
                        let res_type
                        if (selectData.things.data[0].resource.wood) {
                            res_type = 0
                        }else if(selectData.things.data[0].resource.rock){
                            res_type = 1
                        }else if(selectData.things.data[0].resource.water){
                            res_type = 2
                        }else if(selectData.things.data[0].resource.seed){
                            res_type = 3
                        }
                        switch (res_type) {
                            case 0:
                                value = {
                                    type: num,
                                    resource: { wood: selectData.unit_count, water: 0, rock: 0, seed: 0 }
                                }
                                break;
                            case 1:
                                value = {
                                    type: num,
                                    resource: { wood: 0, water: 0, rock: selectData.unit_count, seed: 0 }
                                }
                                break;
                            case 2:
                                value = {
                                    type: num,
                                    resource: { wood: 0, water: selectData.unit_count, rock: 0, seed: 0 }
                                }
                                break;
                            case 3:
                                value = {
                                    type: num,
                                    resource: { wood: 0, water: 0, rock: 0, seed: selectData.unit_count }
                                }
                                break;
                        }
                        break;

                }
                return value
            }
            let buyData = {
                type: MsgTypeSend.ExchangesTrade,
                data: {
                    order_id: selectData.order_id,
                    payment_things: {
                        data: [getThing()]
                    },
                    unit_count:randomI(0, selectData.unit_count)
                }
            }
            console.log("买卖", buyData);
            element.Send(buyData)
        }
    }

    /**交易所根据页签获取资源 */
    private GetResBySubType(subType: number, element:UnitTest) {
        let datas: SThing[] = [];
        if (subType == 0) {
            if (!element.playerInfo.items) return datas
            //道具
            for (let item of element.playerInfo.items) {
                let std = CfgMgr.Getitem(item.id);
                if (std && (std.SubType == ItemSubType.cost || std.SubType == ItemSubType.shard || std.Items == 3)) {
                    let data: SThing = {
                        type: ThingType.ThingTypeItem,
                        item: { id: item.id, count: item.count }
                    }
                    datas.push(data)
                }
            }
        } else if (subType == 1) {
            //角色
            if (!element.playerInfo.roles) return datas
            let roleData = element.playerInfo.roles;
            roleData.forEach((data) => {
                let stateList: number[] = this.GetRoleStateList(data, element)
                if (stateList.length == 0 && !data.is_assisting && !data.is_in_main_building) {
                    let role_data: SThing = {
                        type: ThingType.ThingTypeRole,
                        role: data,
                    }
                    datas.push(role_data)
                }
            })
        } else if (subType == 2) {
            //资源
            if (element.playerInfo.resources.wood) {
                let data1: SThing = {
                    type: ThingType.ThingTypeResource,
                    resource: { wood: element.playerInfo.resources.wood }
                }
                datas.push(data1)
            }

            if (element.playerInfo.resources.water) {
                let data2: SThing = {
                    type: ThingType.ThingTypeResource,
                    resource: { water: element.playerInfo.resources.water }
                }
                datas.push(data2)
            }

            if (element.playerInfo.resources.seed) {
                let data3: SThing = {
                    type: ThingType.ThingTypeResource,
                    resource: { seed: element.playerInfo.resources.seed }
                }
                datas.push(data3)
            }

            if (element.playerInfo.resources.rock) {
                let data4: SThing = {
                    type: ThingType.ThingTypeResource,
                    resource: { rock: element.playerInfo.resources.rock }
                }
                datas.push(data4)
            }

        } else if (subType == 3) {
            //装备
        }
        return datas;
    }

      /**获取角色状态列表 */
      private GetRoleStateList(role: SPlayerDataRole, element:UnitTest): number[] {
        let typeList: number[] = [1, 2, 3, 4];
        let stateList: number[] = [];
        for (let index = 0; index < typeList.length; index++) {
            let state = this.GetRoleState(role, typeList[index], element);
            if (state > RoleStateType.State_None) {
                stateList.push(state);
            }
        }
        return stateList;
    }

    private GetRoleState(roleId: SPlayerDataRole, stateType: RoleStateType, element:UnitTest): number {
        if (stateType == RoleStateType.State_Work && element.playerInfo.homelands) {
            for (let home of element.playerInfo.homelands) {
                for (let build of home.buildings) {
                    if (build.workerIdArr && build.workerIdArr.length) {
                        for (let role of build.workerIdArr) {
                            if (role.id == roleId.id) return stateType;
                        }
                    }
                }
            }
        } else if (stateType == RoleStateType.State_Attack && element.playerInfo.attack_lineup) {
            for (let role of element.playerInfo.attack_lineup) {
                if (role && roleId.id == role.role_id) return stateType;
            }
        } else if (stateType == RoleStateType.State_Defend && element.playerInfo.defense_lineup) {
            for (let role of element.playerInfo.defense_lineup) {
                if (roleId.id == role.role_id) return stateType;
            }
        } else if (stateType == RoleStateType.State_Assist) {
            if (roleId.is_assisting) return stateType;
        }
        return RoleStateType.State_None;
    }
}
