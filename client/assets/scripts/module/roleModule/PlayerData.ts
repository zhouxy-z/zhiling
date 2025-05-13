import { Attr, AttrFight, CfgMgr, ConditionType, FishBombRoundState, FishRoundState, FishTradeRoundState, GuildPostType, ItemSubType, ItemType, MessagId, OneOffRedPointId, ResourceType, ShopGroupId, ShopType, StdActiveSkill, StdAdvister, StdAttr, StdCommonType, StdEquityCard, StdEquityCardTab, StdEquityId, StdEquityList, StdEquityListType, StdFishCommon, StdFishEquipSoltType, StdFishHero, StdFishRod, StdFishShop, StdFishTradeCommon, StdFlipCommon, StdGuildBank, StdGuildEquity, StdGuildEvent, StdGuildRole, StdGuildType, StdItem, StdLootRank, StdMerge, StdMessag, StdPassiveLevel, StdProduction, StdRole, StdRoleLevel, StdRoleQualityUp, StdShopGroup, StdShopowner, StdSysId, StdSystemOpen, StdTask, StdWorldBossComm, StdWorldBossLv, ThingItemId, ThingType } from "../../manager/CfgMgr";
import { maxx, ReplaceStr } from "../../utils/Utils";
import { AttrSub, ConditionSub } from "../common/AttrSub";
import { BuildingType, SLastSeasonInfo, SPlayerDataFusionStone } from "../home/HomeStruct";
import { DateUtils } from "../../utils/DateUtils";
import { EventMgr, Evt_AdvisterUpdate, Evt_ChannelMsgUpdate, Evt_FishHeroUpdate, Evt_Item_Change, Evt_LoginRedPointUpdate, Evt_Role_Del } from "../../manager/EventMgr";
import { BeforeGameUtils } from "../../utils/BeforeGameUtils";
import { game, js } from "cc";
import LocalStorage from "../../utils/LocalStorage";
import { GameSet } from "../GameSet";
import { DEV } from "cc/env";
import { DL } from "../../DL";
import { BuildingState, FightState, GuildEventType, NoticeData, RoleStateType, SAdvister, SBattleRole, SBenefit, SChannelMsgData, SCrossOrderData, SCurrentSeasonInfo, SFishingBombFishPoolData, SFishingBombStageInfo, SFishingBombStateData, SFishingHeroData, SFishingHeroPartData, SFishingHeroSkillEffect, SFishingItem, SFishingLakeData, SFishingMatchInfoRet, SFishingRoundInfo, SFishingShopGetContentRet, SFishingShopItem, SFishingStateData, SFishingTradeRoundInfo, SFishingTradeShipData, SFishingTradeStateData, SGuild, SGuildApplication, SGuildEvent, SGuildMember, SLootSeasonApplyInfo, SLuckyContent, SMatchPlayerData, SOneOffRedPoint, SOonViewData, SOrderData, SPlayerData, SPlayerDataBuilding, SPlayerDataItem, SPlayerDataItemProduction, SPlayerDataRole, SPlayerDataSkill, SPlayerDataSoldierProduction, SPlayerMailData, SPvpShopGetContentRet, SShopContent, SShopIndexContent, STaskState, SThing, SWorldBossData, SWorldBossRankData, SWorldBossRankItemData, SWorldBossStateData, TipsType, TodayNoTipsId } from "./PlayerStruct";

class PlayerData {
    constructor() {
        this.init();
    }

    init() {

    }
    public static isHideUI: boolean = false;//是否隐藏ui中
    public static serverTime: number = 0;
    private static server_offset: number = 0;
    private static _serverDate: Date = new Date();

    static RunHomeId: number;

    /**
     * 循环刷新的map
     */
    static CycleTimeMap: { [duration: number]: number } = {};

    public static SyncServerTime(time: number) {
        if (!this.serverTime) {
            // 暂时以天为循环
            PlayerData.CycleTimeMap[24 * 3600] = DateUtils.GetTodaySecond();
        }

        this.serverTime = time;
        const localTimestamp = Date.now() / 1000;
        this.server_offset = this.serverTime - localTimestamp;
        // LocalStorage.SetNumber('timeDifference', this.server_offset);
    }

    /**
     * 获取服务器时间
     * @returns 
     */
    public static GetServerTime() {
        // 获取保存的时间偏差
        // const timeDifference = LocalStorage.GetNumber('timeDifference') || 0;
        // 计算当前服务器时间
        const serverTime = Date.now() / 1000 + this.server_offset;
        return serverTime;
    }
    public static GetServerDate(): Date {
        this._serverDate.setTime(this.GetServerTime() * 1000);
        return this._serverDate;
    }

    /**
     * 倒计时 同步服务器时间
     * @param timestamp 秒时间戳
     */
    static countDown(timestamp: number): string {
        // 计算剩余时间
        let leftTime = timestamp - PlayerData.GetServerTime();
        if (leftTime <= 0) return "00:00:00";
        // 计算剩余时间的各个单位
        let leftH = Math.floor(leftTime / 60 / 60);
        let leftM = Math.floor((leftTime / 60) % 60);
        let leftS = Math.floor((leftTime) % 60);
        // 将剩余时间拼接成字符串，如'12:34:56'，并返回
        return `${leftH.toString()['padStart'](2, '0')}:${leftM.toString()['padStart'](2, '0')}:${leftS.toString()['padStart'](2, '0')}`;
    }

    /**获取当前时间到未来某一时间的倒计时 */
    static countDown2(timestamp: number): { d: number, h: number, m: number, s: number } {

        let leftTime = timestamp - PlayerData.GetServerTime();
        // 计算剩余时间的各个单位
        let leftD = Math.floor((leftTime) / 60 / 60 / 24);
        let leftH = Math.floor((leftTime / 60 / 60) % 24);
        let leftM = Math.floor((leftTime / 60) % 60);
        let leftS = Math.floor((leftTime) % 60);
        return { d: leftD, h: leftH, m: leftM, s: leftS }
    }

    /**
     * 获取当天凌晨时间戳(单位秒)
     * @param timeZone 时区 默认北京时间
     * @returns 
     */
    public static WeeHoursTime(timeZone: number = 8): number {
        let serverTime: number = PlayerData.GetServerTime();
        let offsetTime: number = serverTime % 86400 + (timeZone * 3600);
        let curTime: number = serverTime - offsetTime;
        //let dates:string[] = DateUtils.TimestampToDate(curTime * 1000, true);
        //console.log(`凌晨时间戳----------------->${dates[0]}-${dates[1]}-${dates[2]}  ${dates[3]}:${dates[4]}:${dates[5]}`);
        return curTime;
    }

    /**
     * 初始玩家数据
     * @param playerInfo 
     */
    public static SetPlayerInfo(playerInfo: SPlayerData) {
        playerInfo.item_productions = playerInfo.item_productions || [];
        playerInfo.soldiers = playerInfo.soldiers || [];
        playerInfo.soldier_productions = playerInfo.soldier_productions || [];
        playerInfo.roles = playerInfo.roles || [];
        playerInfo.defense_lineup = playerInfo.defense_lineup || [];
        playerInfo.attack_lineup = playerInfo.attack_lineup || [];
        playerInfo.boss_lineup = playerInfo.boss_lineup || [];
        playerInfo.config_data = playerInfo.config_data || {};
        playerInfo.tasks = playerInfo.tasks || {};
        playerInfo.items = playerInfo.items || [];
        playerInfo.contact_wechat = playerInfo.contact_wechat || "";
        playerInfo.contact_qq = playerInfo.contact_qq || "";
        playerInfo.name_changed_times = playerInfo.name_changed_times || 0;
        /*  if (!this.playerInfo) {
             this.playerInfo = playerInfo;
         }  */
        this.playerInfo = playerInfo;

        if (!this.GetItem(ThingItemId.ItemId_1)) playerInfo.items.push({ id: ThingItemId.ItemId_1, count: 0 });
        if (!this.GetItem(ThingItemId.ItemId_2)) playerInfo.items.push({ id: ThingItemId.ItemId_2, count: 0 });
        if (!this.GetItem(ThingItemId.ItemId_3)) playerInfo.items.push({ id: ThingItemId.ItemId_3, count: 0 });
        if (!this.GetItem(ThingItemId.ItemId_6)) playerInfo.items.push({ id: ThingItemId.ItemId_6, count: 0 });
        if (!this.GetItem(ThingItemId.ItemId_7)) playerInfo.items.push({ id: ThingItemId.ItemId_7, count: 0 });
        if (!this.GetItem(ThingItemId.ItemId_8)) playerInfo.items.push({ id: ThingItemId.ItemId_8, count: 0 });
        if (!this.GetItem(ThingItemId.ItemId_9)) playerInfo.items.push({ id: ThingItemId.ItemId_9, count: 0 });
        if (!this.GetItem(ThingItemId.ItemId_74)) playerInfo.items.push({ id: ThingItemId.ItemId_74, count: 0 });
        if (!this.GetItem(ThingItemId.ItemId_202)) playerInfo.items.push({ id: ThingItemId.ItemId_202, count: 0 });

        for (let role of playerInfo.roles) {
            role.battle_power = CountPower(role.type, role.level, role);
        }
        this.UpdateSpecialItems();
    }

    /**
     * 更新特殊道具
     */
    static UpdateSpecialItems(eimt: boolean = true) {
        let items = PlayerData.items;
        let info = this.playerInfo;
        for (let i = 0; i < PlayerData.items.length; i++) {
            let item = PlayerData.items[i];
            switch (item.id) {
                case ThingItemId.ItemId_1:
                    if (item.count != info.currency) {
                        item.count = Math.max(0, info.currency);
                        if (eimt) EventMgr.emit(Evt_Item_Change);
                    }
                    break;
                case ThingItemId.ItemId_2:
                    if (item.count != info.currency2) {
                        item.count = Math.max(0, info.currency2);
                        if (eimt) EventMgr.emit(Evt_Item_Change);
                    }
                    break;
                case ThingItemId.ItemId_3:
                    if (item.count != info.currency3) {
                        item.count = Math.max(0, info.currency3);
                        if (eimt) EventMgr.emit(Evt_Item_Change);
                    }
                    break;

                case ThingItemId.ItemId_6:
                    if (item.count != info.resources.wood) {
                        item.count = Math.max(0, info.resources.wood);
                        if (eimt) EventMgr.emit(Evt_Item_Change);
                    }
                    break;
                case ThingItemId.ItemId_7:
                    if (item.count != info.resources.rock) {
                        item.count = Math.max(0, info.resources.rock);
                        if (eimt) EventMgr.emit(Evt_Item_Change);
                    }
                    break;
                case ThingItemId.ItemId_8:
                    if (item.count != info.resources.water) {
                        item.count = Math.max(0, info.resources.water);
                        if (eimt) EventMgr.emit(Evt_Item_Change);
                    }
                    break;
                case ThingItemId.ItemId_9:
                    if (item.count != info.resources.seed) {
                        item.count = Math.max(0, info.resources.seed);
                        if (eimt) EventMgr.emit(Evt_Item_Change);
                    }
                    break;
                case ThingItemId.ItemId_74:
                    if (item.count != info.currency_74) {
                        item.count = Math.max(0, info.currency_74);
                        if (eimt) EventMgr.emit(Evt_Item_Change);
                    }
                    break;
                case ThingItemId.ItemId_202:
                    if (item.count != info.currency_77) {
                        item.count = Math.max(0, info.currency_77);
                        if (eimt) EventMgr.emit(Evt_Item_Change);
                    }
                    break;
            }
        }
    }

    // 角色信息
    private static playerInfo: SPlayerData;
    public static get roleInfo() { return this.playerInfo; }
    // 资源数据
    public static get resources() { return this.playerInfo.resources; }
    // 道具列表
    public static get items() { return this.playerInfo.items; }

    public static get pveData() { return this.playerInfo.pve_data; }
    /**playerIdKey */
    public static get playerIdKey() { return `PlayerId_${this.roleInfo.player_id}`; }
    /**
     * 根据道具类型获取道具列表
     * @param itemType 
     * @returns 
     */
    static GetitemByType(itemType: number) {
        let items = [];
        for (let item of this.playerInfo.items) {
            let std = CfgMgr.Getitem(item.id);
            if (std && std.Itemtpye == itemType) {
                items.push(item);
            }
        }
        return items;
    }
    /**
     * 根据页签获取道具列表
     * @param subType 
     * @returns 
     */
    static GetitemBySubType(subType: number) {
        let items: SPlayerDataItem[] = [];
        for (let item of this.playerInfo.items) {
            if (item.count > 0) {
                let std = CfgMgr.Getitem(item.id);
                if (std && std.SubType == subType) {
                    items.push(item);
                }
            }
        }
        return items;
    }

    /**获取展示任务 */
    static getActiveTask() {
        let stdTasks: StdTask[] = CfgMgr.GetTaskType(3);
        for (let task of stdTasks) {//已经完成的主线
            if (task.ShowTask == 1) {
                if (PlayerData.roleInfo.tasks[task.TaskId] && PlayerData.roleInfo.tasks[task.TaskId].s == STaskState.unFinsh) {
                    if (task.CompletionNum <= PlayerData.roleInfo.tasks[task.TaskId].v) return task;
                }
            }
        }
        let stdAllTasks: StdTask[] = CfgMgr.GetTask();
        for (let task of stdAllTasks) {//已经完成的任务

            if (task.Show != 4 && task.Show != 5) {
                if (PlayerData.roleInfo.tasks[task.TaskId] && PlayerData.roleInfo.tasks[task.TaskId].s == STaskState.unFinsh) {
                    if (task.CompletionNum <= PlayerData.roleInfo.tasks[task.TaskId].v) return task;
                }
            }
        }
        for (let task of stdTasks) {//未完成主线
            if (task.ShowTask == 1) {
                if (PlayerData.roleInfo.tasks[task.TaskId] && PlayerData.roleInfo.tasks[task.TaskId].s == STaskState.unFinsh) {
                    return task;
                }
            }
        }
        for (let task of stdAllTasks) {//未完成任务
            if (task.Show != 4 && task.Show != 5) {
                if (PlayerData.roleInfo.tasks[task.TaskId] && PlayerData.roleInfo.tasks[task.TaskId].s == STaskState.unFinsh) {
                    return task;
                }
            }
        }
        return stdTasks[0];
    }

    static tradeViewData: SOonViewData = {
        code: 0,
        query_type: 0,
        query_args: {},
        page_index: 0,
        page_size: 0,
        page_last_index: 0,
        order_list: [],
        order_state_list: [],
        total_count: 0
    };

    static tradeAllBalances = {
        jy: 0,
        hc: 0,
        score: 0,
        serverid: "",
        unionid: "",
    }

    /**交易所根据页签获取资源 */
    static GetResBySubType(subType: number) {
        let datas: SThing[] = [];
        if (subType == 0) {
            //道具
            for (let item of this.playerInfo.items) {
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
            let roleData = this.roleInfo.roles;
            roleData.forEach((data) => {
                let stateList: number[] = PlayerData.GetRoleStateList(data)
                if (stateList.length == 0 && !data.is_assisting && !data.is_in_main_building && data.level == 1 && data.ownership_type != 1) {
                    let role_data: SThing = {
                        type: ThingType.ThingTypeRole,
                        role: data,
                    }
                    datas.push(role_data)
                }
            })
        } else if (subType == 2) {
            //资源
            let data1: SThing = {
                type: ThingType.ThingTypeResource,
                resource: { wood: this.roleInfo.resources.wood }
            }
            datas.push(data1)

            let data2: SThing = {
                type: ThingType.ThingTypeResource,
                resource: { water: this.roleInfo.resources.water }
            }
            datas.push(data2)

            let data3: SThing = {
                type: ThingType.ThingTypeResource,
                resource: { seed: this.roleInfo.resources.seed }
            }
            datas.push(data3)

            let data4: SThing = {
                type: ThingType.ThingTypeResource,
                resource: { rock: this.roleInfo.resources.rock }
            }
            datas.push(data4)

        } else if (subType == 3) {
            //装备
        }
        return datas;
    }

    /**交易所订单数据排除空数据 */
    static getOrderListData(data: SOrderData[]) {
        let datas: SOrderData[] = []
        if (data) {
            for (let index = 0; index < data.length; index++) {
                const element = data[index];
                if (element && element.player_id && element.things) {
                    datas.push(element)
                }
            }
        }
        return datas;
    }

    /**世界交易所订单数据排除空数据 */
    static getCrossOrderListData(data: SCrossOrderData[]) {
        let datas: SCrossOrderData[] = []
        if (data) {
            for (let index = 0; index < data.length; index++) {
                const element = data[index];
                if (element && element.player_id && element.bourse_id) {
                    datas.push(element)
                }
            }
        }
        return datas;
    }

    /**世界交易所订单通过viewid判断是否锁定 true 锁定 false未锁定 */
    static getOrderIsLockByViewId(view_id: string) {
        for (let index = 0; index < this.tradeViewData.order_list.length; index++) {
            const element: SCrossOrderData = this.tradeViewData.order_list[index];
            if (element.view_id == view_id && this.tradeViewData.order_state_list[index] != "open") {
                return true
            }
        }
        return false;
    }

    // 角色列表
    public static GetRoles() {
        return this.playerInfo.roles.concat();
    }
    public static GetRoleNum() {
        return this.playerInfo.roles.length;
    }

    /**
     * 获取角色
     * @param type
     * @returns 
     */
    public static GetPlayerByType(type: number) {
        let result = [];
        for (let role of this.playerInfo.roles) {
            if (role.type == type) result.push(role);
        }
        return result;
    }

    /**
     * 获取玩家总战力
     * @returns 
     */
    public static GetPlayerPower(): number {
        let totalPower: number = 0;
        for (let role of this.playerInfo.roles) {
            if (!role.battle_power) {
                role.battle_power = CountPower(role.type, role.level, role);
            }
            totalPower += role.battle_power;
        }
        return totalPower;
    }
    /**
     * 增加角色
     * @param data 
     * @returns 
     */
    static AddRole(data: SPlayerDataRole) {
        data.battle_power = CountPower(data.type, data.level, data);
        for (let i = 0; i < this.playerInfo.roles.length; i++) {
            let role = this.playerInfo.roles[i];
            if (role.id == data.id) {
                this.playerInfo.roles[i] = data;
                return;
            }
        }
        this.playerInfo.roles.push(data);
    }
    /**
     * 删除角色
     * @param id 
     * @returns 
     */
    static DelRole(id: string) {
        for (let i = 0; i < this.playerInfo.roles.length; i++) {
            let role = this.playerInfo.roles[i];
            if (role.id == id) {
                this.playerInfo.roles.splice(i, 1);
                EventMgr.emit(Evt_Role_Del, role, i);
                return;
            }
        }
    }
    // 出战英雄列表
    public static get attackRoles() { return this.roleInfo.attack_lineup || []; }
    // 世界boss出战英雄列表
    public static get worldBossAttackRoles() { return this.roleInfo.boss_lineup || []; }
    //主建筑配置
    public static get homelands() { return this.roleInfo.homelands; }
    public static get nowhomeLand() { return this.GetHomeLand(this.RunHomeId); }
    /**获取指定家园 */
    public static GetHomeLand(homeId: number) {
        if (!this.roleInfo) return undefined;
        for (let homeland of this.roleInfo.homelands) {
            if (homeland.id == homeId) return homeland;
        }
        return undefined;
    }

    /**
     * 获取道具id
     * @param id 
     * @returns 
     */
    static GetItem(id: number) {
        let items = this.roleInfo.items;
        for (let item of items) {
            if (item.id == id) {
                return item;
            }
        }
    }
    /**
     * 获取道具数量
     * @param id 
     * @returns 
     */
    static GetItemCount(id: number) {
        let item = this.GetItem(id);
        if (!item) return 0;
        return item.count;
    }
    /**
     * 根据物品类型获取物品列表数据
     * @param type 
     * @returns 
     */
    static GetItemTypeDatas(type: ItemType): SPlayerDataItem[] {
        let stdItem: StdItem;
        let items = this.roleInfo.items;
        let newItems: SPlayerDataItem[] = [];
        for (let item of items) {
            stdItem = CfgMgr.Getitem(item.id);
            if (stdItem && stdItem.Type == ThingType.ThingTypeItem && stdItem.Itemtpye == type) {
                newItems.push(item);
            }
        }
        return newItems;
    }

    /**获取建筑状态 */
    static GetBuilding(buildingId: number, homeId?: number) {
        if (homeId != undefined) {
            let homeLand = this.GetHomeLand(homeId);
            if (!homeLand) return undefined;
            for (let building of homeLand.buildings) {
                if (building.id == buildingId) {
                    this.flushWorkers(building.id, building);
                    building.state = this.GetBuildingState(building.id);
                    return building;
                }
            }
        } else if (this.roleInfo) {
            for (let homeland of this.roleInfo.homelands) {
                for (let building of homeland.buildings) {
                    if (building.id == buildingId) {
                        this.flushWorkers(building.id, building);
                        building.state = this.GetBuildingState(building.id);
                        return building;
                    }
                }
            }
        }
        return undefined;
    }
    static GetBuildings(homeId?: number) {
        if (homeId == undefined) homeId = this.RunHomeId;
        let homeLand = this.GetHomeLand(homeId);
        if (!homeLand) return undefined;
        let bulidings: { [id: number]: SPlayerDataBuilding } = {};
        for (let building of homeLand.buildings) {
            this.flushWorkers(building.id, building);
            building.state = this.GetBuildingState(building.id);
            bulidings[building.id] = building;
        }
        return bulidings;
    }
    static GetBuildingByType(buildType: number, homeId: number) {
        let buildings: SPlayerDataBuilding[] = [];
        let homeLand = this.GetHomeLand(homeId);
        if (!homeLand) return undefined;
        for (let building of homeLand.buildings) {
            if (CfgMgr.GetBuildingUnLock(building.id).BuildingType == buildType) {
                this.flushWorkers(building.id, building);
                building.state = this.GetBuildingState(building.id);
                buildings.push(building);
            }
        }
        return buildings;
    }

    /**
     * 获取指定建筑的工人列表
     * @param buildingId 
     * @returns 
     */
    private static flushWorkers(buildingId: number, building: SPlayerDataBuilding) {
        if (!this.roleInfo) return [];
        if (!building.workerIdArr) building.workerIdArr = [];
        building.workerIdArr.length = 0;
        let works: SPlayerDataRole[] = building.workerIdArr;
        let roles = this.roleInfo.roles;
        if (buildingId && CfgMgr.GetBuildingUnLock(buildingId).BuildingType == BuildingType.cheng_qiang) {
            // let ls = this.roleInfo.defense_lineup || [];
            // for (let defense of ls) {
            //     if (defense) {
            //         for (let role of roles) {
            //             if (role.id == defense.role_id) {
            //城墙走防御列表
            //works.push(role);
            //             }
            //         }
            //     }
            // }
        } else if (buildingId) {
            for (let role of roles) {
                if (role.building_id == buildingId || (role.is_in_main_building && role.main_building_id == buildingId)) {
                    works.push(role);
                }
            }
        }
        return works;
    }

    static GetWorkerNum(buildingId: number) {
        if (!this.roleInfo || !buildingId) return 0;
        let num = 0;
        let roles = this.playerInfo.roles;
        for (let role of roles) {
            if (role.building_id == buildingId) {
                num++;
            }
        }
        return num;
    }

    /**
     * 检测角色是否空闲
     * @param role 
     * @returns 
     */
    static CheckRoleFree(role: SPlayerDataRole) {
        if (role.building_id) return false;
        for (let battle of this.roleInfo.defense_lineup) {
            if (battle && battle.role_id == role.id) return false;
        }
        for (let battle of this.roleInfo.attack_lineup) {
            if (battle && battle.role_id == role.id) return false;
        }
    }
    /**获取角色状态列表 */
    static GetRoleStateList(role: SPlayerDataRole): number[] {
        let typeList: number[] = [RoleStateType.State_Work, RoleStateType.State_Attack, RoleStateType.State_Defend, RoleStateType.State_Assist, RoleStateType.State_NFT];
        let stateList: number[] = [];
        for (let index = 0; index < typeList.length; index++) {
            let state = this.GetRoleState(role, typeList[index]);
            if (state > RoleStateType.State_None) {
                stateList.push(state);
            }
        }
        return stateList;
    }
    static GetRoleState(roleId: SPlayerDataRole, stateType: RoleStateType): number {
        if (stateType == RoleStateType.State_Work) {
            for (let home of this.roleInfo.homelands) {
                for (let build of home.buildings) {
                    if (build.workerIdArr && build.workerIdArr.length) {
                        for (let role of build.workerIdArr) {
                            if (role.id == roleId.id) return stateType;
                        }
                    }
                }
            }
        } else if (stateType == RoleStateType.State_Attack) {
            for (let role of this.attackRoles) {
                if (role && roleId.id == role.role_id) return stateType;
            }
        } else if (stateType == RoleStateType.State_Defend) {
            for (let role of this.roleInfo.defense_lineup) {
                if (roleId.id == role.role_id) return stateType;
            }
        } else if (stateType == RoleStateType.State_Assist) {
            if (roleId.is_assisting) return stateType;
        } else if (stateType == RoleStateType.State_NFT) {
            if (roleId.nft_lock_expires != 0) {
                console.log(roleId.nft_lock_expires, PlayerData.GetServerTime())
            }
            if (roleId.nft_lock_expires != 0 && roleId.nft_lock_expires - PlayerData.GetServerTime() > 0) return stateType;
        }
        return RoleStateType.State_None;
    }
    /**是否拥有该建筑 */
    public static checkBuilding(buildingId: number) {
        let buildDefaine = CfgMgr.GetBuildingUnLock(buildingId);
        let homeLand = this.GetHomeLand(buildDefaine.HomeId);
        for (let building of homeLand.buildings) {
            if (building.id == buildingId) return true;
        }
        return false;
    }
    /**
     * 获取建筑状态
     * @param building 
     */
    private static GetBuildingState(buildingId: number) {
        let buildDefaine = CfgMgr.GetBuildingUnLock(buildingId);
        let homeLand = this.GetHomeLand(buildDefaine.HomeId);
        for (let building of homeLand.buildings) {
            if (building.id == buildingId) {
                if (building.is_upgrading) {
                    return BuildingState.Building;
                } else if (building.upgrade_time > (new Date()).getTime() / 1000 || building.level == 0) {
                    return BuildingState.CanUnLock;
                } else {
                    return BuildingState.Complete;
                }
            }
        }
        return BuildingState.Lock;
    }

    /**解锁建筑 */
    public static UnLockBuilding(buildingId: number, upgrade_time: number) {
        let buildDefaine = CfgMgr.GetBuildingUnLock(buildingId);
        let homeLand = this.GetHomeLand(buildDefaine.HomeId);
        for (let building of homeLand.buildings) {
            if (building.id == buildingId) {
                building.is_upgrading = true;
                building.level = 0;
                building.upgrade_time = upgrade_time;
                this.flushWorkers(building.id, building);
                building.state = BuildingState.Building;
                return building;
            }
        }
        let buliding: SPlayerDataBuilding = {
            id: buildingId,
            level: 0,
            is_upgrading: true,
            upgrade_time: upgrade_time,
            state: BuildingState.Building
        };
        homeLand.buildings.push(buliding);
        return buliding;
    }

    public static OpenBuilding(buildingId: number) {
        let buildDefaine = CfgMgr.GetBuildingUnLock(buildingId);
        if (!buildDefaine) return;
        let homeLand = this.GetHomeLand(buildDefaine.HomeId);
        for (let building of homeLand.buildings) {
            if (building.id == buildingId) {
                building.is_upgrading = false;
                building.level = 1;
                building.upgrade_time = 0;
                return building;
            }
        }
        let buliding: SPlayerDataBuilding = {
            id: buildingId,
            level: 1,
            is_upgrading: false,
            upgrade_time: 0
        };
        homeLand.buildings.push(buliding);
        return buliding;
    }

    /**建筑升级 */
    public static UpGradeBuilding(buildingId: number, UpgradeCompleteTime: number, level?: number) {
        let buildDefaine = CfgMgr.GetBuildingUnLock(buildingId);
        let homeLand = this.GetHomeLand(buildDefaine.HomeId);
        for (let building of homeLand.buildings) {
            if (building.id == buildingId) {
                if (level != undefined) building.level = level;
                building.is_upgrading = UpgradeCompleteTime > PlayerData.GetServerTime();
                building.upgrade_time = UpgradeCompleteTime;
                if (CfgMgr.GetBuildingUnLock(buildingId).BuildingSubType == 1 && level != undefined) {
                    homeLand.level = level;
                }
                if (level != undefined) building.level = level;
                building.state = this.GetBuildingState(buildingId);
                // Logger.log('建筑信息更新-------', building);
                return building;
            }
        }
    }

    /**
     * 获取建筑等级
     * @param buildingId 
     * @returns 
     */
    public static GetBuildingLevel(buildingId: number) {
        let buildDefaine = CfgMgr.GetBuildingUnLock(buildingId);
        let homeLand = this.GetHomeLand(buildDefaine.HomeId);
        for (let building of homeLand.buildings) {
            if (building.id == buildingId) return building.level;
        }
        return 0;
    }

    /**
     * 获取建筑等级
     * @param homeId 
     * @param type 
     * @returns 
     */
    public static GetBuildingLv(homeId: number, type: number, index: number = 0) {
        let stdDef = CfgMgr.GetBuildingDefine(homeId, type)[index];
        let homeLand = this.GetHomeLand(homeId);
        for (let building of homeLand.buildings) {
            if (building.id == stdDef.BuildingId) return building.level;
        }
        return 0;
    }

    /**
     * 添加建筑角色
     * @param info 
     * @returns 
     */
    public static AddBuildRoles(info: any) {
        for (let index = 0; index < this.roleInfo.roles.length; index++) {
            let role = this.roleInfo.roles[index];
            if (role.id == info.role_id) {
                //主建筑的特殊处理
                if (info.building_id != 1) {
                    role.building_id = info.building_id;
                    role.is_in_building = true;
                    role.battle_power = CountPower(role.type, role.level, role);
                    return role.building_id;
                } else {
                    role.main_building_id = 1;
                    role.is_in_main_building = true;
                    return role.main_building_id;
                }
            }
        }
    }

    /**
     * 移除建筑角色
     * @param info 
     * @returns 
     */
    public static RemoveBuildRoles(info) {
        for (let index = 0; index < this.roleInfo.roles.length; index++) {
            let role = this.roleInfo.roles[index];
            if (role.id == info.role_id) {
                if (info.building_id == 1) {
                    role.main_building_id = 0;
                    role.is_in_main_building = false
                    return role.main_building_id;
                } else {
                    role.building_id = 0;
                    role.is_in_building = false;
                    return role.building_id;
                }
            }
        }
    }

    /**更新当前合成次数 */
    public static updateCompoundCount(count: number) {
        this.roleInfo.resource_exchange_uses = count;
    }

    public static GetRoleByPid(roleId: string): SPlayerDataRole {
        for (let index = 0; index < this.roleInfo.roles.length; index++) {
            let role = this.roleInfo.roles[index];
            if (role.id == roleId) {
                if (!role.battle_power) role.battle_power = CountPower(role.type, role.level);
                return role;
            }
        }
        return null;
    }

    /**
     * 获取指定角色
     * @param id 
     * @returns 
     */
    static GetRoleById(id: string) {
        for (let role of this.roleInfo.roles) {
            if (role.id == id) {
                if (!role.battle_power) role.battle_power = CountPower(role.type, role.level);
                return role;
            }
        }
    }

    /**通过type lv quality 获取角色*/
    static GetRoleByTypeAndLvAndQuality(type: number, lv: number, quality: number) {
        for (let role of this.roleInfo.roles) {
            if (role.type == type && role.level == lv && role.quality == quality) {
                return role;
            }
        }
        return null;
    }

    /**通过type获取该角色最高品质*/
    static getMaxQualityByType(type: number) {
        let max_quality = 0;
        let quality_role: SPlayerDataRole
        for (let role of this.roleInfo.roles) {
            if (role.type == type && role.quality > max_quality) {
                max_quality = role.quality;
                quality_role = role
            }
        }
        return quality_role;
    }

    /**通过type获取该角色最高战力*/
    static getMaxFightingByType(type: number) {
        let max_battle_power = 0;
        let quality_role: SPlayerDataRole
        for (let role of this.roleInfo.roles) {
            if (role.type == type && role.battle_power > max_battle_power) {
                max_battle_power = role.quality;
                quality_role = role
            }
        }
        return quality_role;
    }

    /**
     * 判断生产条件是否符合
     * @param homeId 
     * @param conditionId 
     * @param conditionValue 
     * @returns 
     */
    static CheckCondition(homeId: number, conditionId: number[], conditionValue: number[]) {
        for (let i = 0; i < conditionId.length; i++) {
            let id = conditionId[i];
            switch (id) {
                case 1:
                    let objs = this.GetBuildingByType(BuildingType.ji_di, homeId);
                    for (let obj of objs) {
                        if (obj.level < conditionValue[i]) return false;
                    }
            }
        }
        return true;
    }

    /**
     * 更新生产
     * @param data 
     * @returns 
     */
    static UpdateItemProduction(data: SPlayerDataItemProduction) {
        let ls = this.roleInfo.item_productions;
        let isCheck: boolean = false;
        for (let i = 0; i < ls.length; i++) {
            let obj = ls[i];
            if (obj.id == data.id) {
                ls[i] = data;
                isCheck = true;
                break;
            }
        }
        if (!isCheck) ls.push(data);


    }

    /**
     * 获取指定id的生产状态
     * @param id 
     * @returns 
     */
    static GetProductionState(id: number) {
        let ls = this.roleInfo.item_productions;
        for (let obj of ls) {
            if (obj.id == id) return obj;
        }
    }
    /**获取指定建筑的生产列表 */
    static GetProductionIds(buildingId?: number, finsish: boolean = true) {
        let ids: number[] = [];
        let ls = this.roleInfo.item_productions;
        for (let obj of ls) {
            if (buildingId == undefined || buildingId == CfgMgr.GetProduction(obj.id).BuildingId) {
                if (!finsish || this.GetServerTime() >= obj.finish_time) ids.push(obj.id);
            }
        }
        return ids;
    }
    /**
     * 生产完成
     * @param index 
     * @returns 
     */
    static FinishItemProduction(id: number[]) {
        for (let index = 0; index < id.length; index++) {
            const element = id[index];
            for (let i = 0; i < this.roleInfo.item_productions.length; i++) {
                if (this.roleInfo.item_productions[i].id == element) {
                    this.roleInfo.item_productions.splice(i, 1);
                    break;
                }
            }
        }
    }
    static IndexOfProduction(id: number) {
        let ls = this.roleInfo.item_productions;
        for (let i = 0; i < ls.length; i++) {
            if (ls[i].id == id) return i;
        }
        return -1;
    }

    /**当前的战斗状态 */
    static fightState: FightState = 0;

    /**
     * 获取兵种库存
     * @param soliderId 
     * @returns 
     */
    static GetSoldier(soliderId: number) {
        for (let obj of this.roleInfo.soldiers) {
            if (obj.id == soliderId) {
                return obj;
            }
        }
    }

    /**
     * 获取招募
     * @param soliderId 
     * @param buildingId 
     * @returns 
     */
    static GetSoldierProduction(soliderId: number, buildingId: number) {
        for (let obj of this.roleInfo.soldier_productions) {
            if (obj.building_id == buildingId && obj.id == soliderId) {
                return obj;
            }
        }
    }

    /**
     * 新增招募
     * @param data 
     */
    static AddSoldierProduction(data: SPlayerDataSoldierProduction) {
        let isCheck: boolean = false;
        for (let obj of this.roleInfo.soldier_productions) {
            if (obj.building_id == data.building_id && obj.id == data.id) {
                obj.count = data.count;
                obj.start_time = data.start_time;
                isCheck = true;
                break;
            }
        }
        if (!isCheck) this.roleInfo.soldier_productions.push(data);


    }

    /**
     * 更新兵营招募进度
     * @param data 
     */
    static UpdateSoldier(data: PushStruct) {
        for (let i = 0; i < this.roleInfo.soldier_productions.length; i++) {
            let production = this.roleInfo.soldier_productions[i];
            if (production.id == data.soldier_id && production.building_id == data.building_id) {
                let add = maxx(0, data.count);
                production.count -= data.count;
                let lv = this.GetBuildingLevel(data.building_id);
                let [num, time, cost] = CfgMgr.GetSoldierProductionByType(data.building_id, lv, data.soldier_id);
                // Logger.log("UpdateSoldier", production.start_time, time * add, production.start_time + (num * add));
                production.start_time += (time * add);
                if (production.count <= 0) this.roleInfo.soldier_productions.splice(i, 1);
                break;
            }
        }
        for (let soldier of this.roleInfo.soldiers) {
            if (soldier.id == data.soldier_id) {
                soldier.add = data.total_count - soldier.count;
                soldier.count = data.total_count;
                return;
            }
        }
        this.roleInfo.soldiers.push({
            id: data.soldier_id,
            count: data.total_count,
            building_id: data.building_id,
            add: data.total_count
        })
    }
    /**
     * 更新兵营招募时间
     * @param data 
     */
    static UpdateSoldierProdTime(id: number, time: number) {
        for (let i = 0; i < this.roleInfo.soldier_productions.length; i++) {
            let production = this.roleInfo.soldier_productions[i];
            if (production.id == id) {
                production.start_time = time;
                break;
            }
        }
    }

    static AllocateSolider(data) {
        for (let i = 0; i < data.length; i++) {
            let role = this.GetRoleByPid(data[i].role_id);
            let ship = CfgMgr.GetRoleAttr(role.type, role.level, Attr.LeaderShip);

        }
    }

    static updataPveData(pve_data) {
        if (pve_data.progress || pve_data.progress == 0)
            this.playerInfo.pve_data = pve_data;
    }

    static updateSoldiers(data) {
        if (data)
            this.playerInfo.soldiers = data;
    }


    /**当前页邮件列表 */
    static mails: SPlayerMailData[] = [];
    static mailmap: { [id: string]: SPlayerMailData } = {};
    static mails_log: SPlayerMailData[] = [];

    static resetMail() {
        this.mails = []
        this.mailmap = {}
    }

    static getMailReward(data: SThing[]): SThing[] {
        let datas: SThing[] = []
        for (let index = 0; index < data.length; index++) {
            const element = data[index];
            if (element.resource) {
                let thing: SThing = { type: ThingType.ThingTypeResource, resource: {} }
                if (element.resource.rock) {
                    thing = { type: ThingType.ThingTypeResource, resource: {} }
                    thing.resource.rock = element.resource.rock;
                    datas.push(thing)
                }
                if (element.resource.wood) {
                    thing = { type: ThingType.ThingTypeResource, resource: {} }
                    thing.resource.wood = element.resource.wood;
                    datas.push(thing)
                }
                if (element.resource.water) {
                    thing = { type: ThingType.ThingTypeResource, resource: {} }
                    thing.resource.water = element.resource.water;
                    datas.push(thing)
                }
                if (element.resource.seed) {
                    thing = { type: ThingType.ThingTypeResource, resource: {} }
                    thing.resource.seed = element.resource.seed;
                    datas.push(thing)
                }
            }
            if (!element.resource) {
                datas.push(element);
            }

        }

        return datas;
    }

    /**钓鱼数据 */
    static fishData: SFishingStateData;
    static fishItems: SFishingItem[];
    static fishHeros: SFishingHeroData[] = [];
    static fishShop: SFishingShopGetContentRet;
    static fishingMatch: SFishingMatchInfoRet;
    static _fishHeroId: number = 0;
    static fishConvertNum: number = 0;//兑换次数
    /**设置钓鱼角色id */
    static SetFishingHeroId(id: number): void {
        this._fishHeroId = id;
        EventMgr.emit(Evt_FishHeroUpdate);
    }
    /**获取钓鱼角色id */
    static GetFishingHeroId(): number {
        return this._fishHeroId;
    }
    /**
     * 获取是否热门湖泊
     * @param id 
     * @returns 
     */
    static GetHotLake(id: number): boolean {
        let feedNum: number = 0;
        let maxId: number = 0;
        if (this.fishData && this.fishData.lakes && this.fishData.lakes.length) {
            for (let lakeData of this.fishData.lakes) {
                if (feedNum == 0) {
                    if (lakeData.cost > 0) {
                        feedNum = lakeData.cost;
                        maxId = lakeData.lake_id;
                    }
                } else {
                    if (lakeData.cost > feedNum) {
                        feedNum = lakeData.cost;
                        maxId = lakeData.lake_id;
                    }
                }
            }
        }
        return maxId == id;
    }
    /**
     * 获取湖泊数据
     * @param id 
     * @returns 
     */
    static GetLakeData(id: number): SFishingLakeData {
        if (this.fishData && this.fishData.lakes && this.fishData.lakes.length) {
            for (const lakeData of this.fishData.lakes) {
                if (id == lakeData.lake_id) return lakeData;
            }
        }
        return null;
    }
    /**获取钓鱼当前最新回合数 */
    static get CurFishRoundInfo(): SFishingRoundInfo {
        if (this.fishData && this.fishData.round_info) {
            return this.fishData.round_info;
        }
        return null;
    }
    /**获取当前钓鱼场次是否地狱模式 */
    static get FishSessionIsHell(): boolean {
        if (!this.fishData.session_info) return false;
        if (this.fishData.session_info.kill_type != 1 && this.fishData.session_info.kill_type_end != 1) return true;
        return false;
    }
    /**获取当前回合状态 */
    static get GetFishRoundState(): number {
        if (!this.CurFishRoundInfo) return FishRoundState.No;//没有回合
        if (this.CurFishRoundInfo.end_time < this.GetServerTime()) return FishRoundState.No;//回合超时
        if (!this.CurFishRoundInfo.is_open) return FishRoundState.NoStart;//回合未开始
        //已结算
        if (this.CurFishRoundInfo.is_settlement) {
            //已经选择湖并且已投入鱼饵
            if (this.fishData.settlement && this.fishData.player.lake_id > 0 && this.fishData.player.round_cost > 0) {
                return FishRoundState.Settle;//结算时刻 
            }
            return FishRoundState.NoFishing;//本回合未参与垂钓
        }
        //垂钓时刻
        if (this.CurFishRoundInfo.is_frozen) {
            //已经选择湖并且已投入鱼饵
            if (this.fishData.player.lake_id > 0 && this.fishData.player.round_cost > 0) {
                return FishRoundState.LiftRod;//提杆时刻
            }
            return FishRoundState.NoFishing;//本回合未参与垂钓
        }
        if (this.fishData.player.lake_id > 0) {
            return FishRoundState.Select;//已选湖泊
        } else {
            return FishRoundState.NoSelect;//未选湖泊
        }
    }
    /**自己选的湖泊是否被冰封了 */
    static get FishMyLakeIsIced(): boolean {
        if (this.CurFishRoundInfo) {
            if (this.fishData.player.lake_id > 0) {
                let lakeData = this.GetLakeData(this.fishData.player.lake_id);
                if (lakeData && lakeData.is_frozen) return true;
            }
        }
        return false;
    }
    /**冰封湖泊id */
    static get FishIcedLakeIds(): number[] {
        let newList: number[] = [];
        if (this.CurFishRoundInfo) {
            if (this.fishData && this.fishData.lakes && this.fishData.lakes.length) {
                for (const lakeData of this.fishData.lakes) {
                    if (lakeData.is_frozen) {
                        newList.push(lakeData.lake_id);
                    }
                }
            }
        }
        return newList;
    }

    /**获取当前鱼竿类型*/
    static get FishRodType(): number {
        if (this.fishData) {
            let num: number = this.fishData.player.round_cost;
            let typeList: number[] = CfgMgr.GetFishCommon.CostSelectType;
            for (let index = typeList.length - 1; index > -1; index--) {
                let value = typeList[index];
                if (num > value) return index;
            }
        }

        return 0;
    }
    static FishItemAdd(list: SFishingItem[]): void {
        if (this.fishItems) {
            this.fishItems = this.fishItems.concat(list);
        }
    }
    static FishItemRemove(list: SFishingItem[]): void {
        if (this.fishItems) {
            let fishItem: SFishingItem;
            for (let index = 0; index < list.length; index++) {
                fishItem = list[index];
                let findIndex: number = this.fishItems.findIndex(item => item.id == fishItem.id);
                if (findIndex > -1) {
                    this.fishItems.splice(findIndex, 1);
                }
            }
        }
    }
    static GetFishItem(id: number): SFishingItem {
        if (!this.fishItems) return null;
        let fishItem: SFishingItem;
        for (let index = 0; index < this.fishItems.length; index++) {
            fishItem = this.fishItems[index];
            if (fishItem.id == id) return fishItem;
        }
        return null
    }
    /**获取钓鱼赛季是否开启 */
    static GetFishRaceIsOpen(): boolean {
        //非幻彩英服不开放入口
        if (GameSet.GetServerMark() != "hc") return false;
        let openLv: number = CfgMgr.GetFishCommon.OpenLevel;
        let buildings = this.GetBuildingByType(BuildingType.ji_di, 101);
        if (buildings && buildings.length > 0 && buildings[0].level >= openLv) {
            if (this.fishingMatch && (this.fishingMatch.current_match || this.fishingMatch.next_match)) {
                if (this.fishingMatch.current_match && this.GetServerTime() > this.fishingMatch.current_match.StartTime && this.GetServerTime() < this.fishingMatch.current_match.CloseTime) {
                    return true;
                } else if (this.fishingMatch.next_match && this.GetServerTime() > this.fishingMatch.next_match.StartTime && this.GetServerTime() < this.fishingMatch.next_match.CloseTime) {
                    return true;
                }
            }
        }
        return false;
    }
    /**获取钓鱼角色数据 */
    static GetFishingEquipHero(id: number): SFishingHeroData {
        if (!this.fishHeros) return null;
        let fishHero: SFishingHeroData;
        for (let index = 0; index < this.fishHeros.length; index++) {
            fishHero = this.fishHeros[index];
            if (fishHero.id == id) return fishHero;
        }
        return null;
    }
    /**获取钓鱼角色装备数据 */
    static GetFishingEquipData(id: number, slotId: StdFishEquipSoltType): SFishingHeroPartData {
        let fishHero: SFishingHeroData = this.GetFishingEquipHero(id);
        if (!fishHero || !fishHero.parts) return null;
        let equipData: SFishingHeroPartData;
        for (let index = 0; index < fishHero.parts.length; index++) {
            equipData = fishHero.parts[index];
            if (equipData.slot_id == slotId) return equipData;
        }
        return null;
    }
    /**获取钓鱼角色装备数据 */
    static GetFishingEquipSkill(id: number, slotId: number): SFishingHeroSkillEffect {
        let fishHero: SFishingHeroData = this.GetFishingEquipHero(id);
        if (!fishHero || !fishHero.effective_skills) return null;
        return fishHero.effective_skills[slotId];
    }
    static fishTradeData: SFishingTradeStateData;
    /**获取运鱼当前最新回合数 */
    static get CurFishTradeRoundInfo(): SFishingTradeRoundInfo {
        if (this.fishTradeData && this.fishTradeData.round_info) {
            return this.fishTradeData.round_info;
        }
        return null;
    }
    /**
     * 获取是否热门渔船
     * @param id 
     * @returns 
     */
    static GetHotShip(id: number): boolean {
        let weightNum: number = 0;
        let maxId: number = 0;
        if (this.fishTradeData && this.fishTradeData.ship && this.fishTradeData.ship.length) {
            for (let shipData of this.fishTradeData.ship) {
                if (weightNum == 0) {
                    if (shipData.cost > 0) {
                        weightNum = shipData.cost;
                        maxId = shipData.ship_id;
                    }
                } else {
                    if (shipData.cost > weightNum) {
                        weightNum = shipData.cost;
                        maxId = shipData.ship_id;
                    }
                }
            }
        }
        return maxId == id;
    }
    static GetFishTradShipState(shipId: number): number {
        if (this.fishTradeData && this.fishTradeData.ship && this.fishTradeData.ship.length) {
            let tempList: SFishingTradeShipData[] = this.fishTradeData.ship.concat();
            tempList.sort((a: SFishingTradeShipData, b: SFishingTradeShipData) => {
                return a.cost - b.cost;
            });
            let shipData: SFishingTradeShipData;
            for (let index = 0; index < tempList.length; index++) {
                shipData = tempList[index];
                if (shipData.ship_id == shipId) {
                    if (shipData.cost < 1) return 0;
                    return index + 1;
                }
            }
        }
        return 0;
    }
    /**
     * 获取运鱼船只数据
     * @param id 
     * @returns 
     */
    static GetShipData(id: number): SFishingTradeShipData {
        if (this.fishTradeData && this.fishTradeData.ship && this.fishTradeData.ship.length) {
            for (const shipData of this.fishTradeData.ship) {
                if (id == shipData.ship_id) return shipData;
            }
        }
        return null;
    }
    /**获取当前回合状态 */
    static get GetFishTradeRoundState(): number {
        if (!this.CurFishTradeRoundInfo) return FishTradeRoundState.No;//没有回合
        if (!this.CurFishTradeRoundInfo.is_open) return FishTradeRoundState.No;//回合未开始
        if (this.CurFishTradeRoundInfo.end_time < this.GetServerTime()) return FishTradeRoundState.No;//回合超时
        //已结算
        if (this.CurFishTradeRoundInfo.is_settlement) {
            //已经选择气球并且已装鱼
            if (this.fishTradeData.settlement && this.fishTradeData.player.ship_id > 0 && this.fishTradeData.player.round_cost > 0) {
                return FishTradeRoundState.Settle;//结算时刻 
            }
            return FishTradeRoundState.NoFishTrade;//本回合未参与运鱼
        }
        //气球飞阶段
        if (this.CurFishTradeRoundInfo.is_departure) {
            //已经选气球并且已投入鱼饵
            if (this.fishTradeData.player.ship_id > 0 && this.fishTradeData.player.round_cost > 0) {
                return FishTradeRoundState.Departure;//提杆时刻
            }
            return FishTradeRoundState.NoFishTrade;//本回合未参与垂钓
        }
        if (this.fishTradeData.player.ship_id > 0) {
            return FishTradeRoundState.Select;//已选湖泊
        } else {
            return FishTradeRoundState.NoSelect;//未选湖泊
        }
    }
    /**当前赛季掠夺信息 */
    static LootSeasonInfo: SCurrentSeasonInfo = {
        season_id: 0,//玩家ID
        status: ``,//赛季状态
        is_settled: false,//
        currency: 0,//当前
        currency_74: 0,
        wood: 0,//木头
        water: 0,//水
        rock: 0,//石头
        seed: 0,//种子
        start_time: 0,//开始时间
        end_time: 0,//结束时间
        score: 0,//分数
        rank: 0,//排行
        all_player: 0,//总人数
        rank_list: [],//赛季排行信息
    };
    static LootSeasonApplyInfo: SLootSeasonApplyInfo = null;
    /**上一赛季家园掠夺信息 */
    static LootLastSeasonInfo: SLastSeasonInfo = {
        seasonId: 0,//玩家ID
        currency: 0,//当前
        currency_74: 0,
        wood: 0,//木头
        water: 0,//水
        rock: 0,//石头
        seed: 0,//种子
        rank: 0,//排行
        all_player: 0,//总人数
        rank_list: [],//赛季排行信息
    };
    static LootPlayerData: SMatchPlayerData = {
        player_id: ``,//玩家ID
        match_count: 0,//匹配次数
        paid_refresh_count: 0,//刷新次数
        remaining_defense_count: 0,//防守次数
        match_duration: [],//匹配次数
        match_cd_end_time: 0,//匹配cd剩余时间
        has_shield: false,//是否有盾
        shield_end_time: 0,//盾结束时间
        score: 0,//分数
        defense_end_time: 0,//分数
        is_use_item: false,//是否使用道具
    };
    static PvpShopData: SPvpShopGetContentRet = null;
    static LootMatchList = []

    static TipsList: TipsType[] = []

    /**获取任务奖励 */
    static GetLootBaseAwardThing(data): SThing {
        let thing: SThing = {
            type: data.RewardType
        };
        switch (thing.type) {
            case ThingType.ThingTypeItem:
                thing.item = { id: data.RewardID, count: data.RewardNumber };
                break;
            case ThingType.ThingTypeCurrency:
                thing.currency = { type: 0, value: data.RewardNumber };
                break;
            case ThingType.ThingTypeGold:
                thing.gold = { value: data.RewardNumber };
                break;
            case ThingType.ThingTypeEquipment:
                break;
            case ThingType.ThingTypeRole:
                thing.role = {
                    id: null, type: data.RewardNumber, quality: 1, level: null,
                    experience: null, soldier_num: null, active_skills: null, passive_skills: null,
                    is_in_building: null, building_id: null, battle_power: null, skills: null, is_assisting: false,
                    is_in_attack_lineup: false, is_in_defense_lineup: false, trade_cd: 0
                };
                break;
            case ThingType.ThingTypeResource:
                switch (data.RewardID) {
                    case ResourceType.rock:
                        thing.resource = { rock: data.RewardNumber };
                        break;
                    case ResourceType.seed:
                        thing.resource = { seed: data.RewardNumber };
                        break;
                    case ResourceType.water:
                        thing.resource = { water: data.RewardNumber };
                        break;
                    case ResourceType.wood:
                        thing.resource = { wood: data.RewardNumber };
                        break;
                }
                break;
        }
        return thing
    }

    /**获取玩家赛季排行配置 */
    static GetLootRankCfg(seasonData: any, season_id: number) {
        if (!seasonData.rank) return;
        let list_data = CfgMgr.getPVPById(season_id);

        if (!list_data) return;
        let list_id = list_data.JackpotType;
        let stdRank: StdLootRank[] = CfgMgr.Get(`RankList`);
        let top_rank = 0
        stdRank.forEach((curData) => {
            if (curData.ListModeID == list_id && curData.ListType == 1) {
                if (curData.Ranking[0] == 1) {
                    top_rank++;
                }
            }
        })
        let data: StdLootRank
        stdRank.forEach((curData) => {
            if (curData.ListModeID == list_id && curData.ListType == 1) {
                if (seasonData.rank == -1) {
                    return;
                }
                if (seasonData.rank <= top_rank) {
                    if (seasonData.rank == curData.Ranking[1]) {
                        data = curData;
                    }
                } else {
                    if (curData.Ranking[0] != 1 && seasonData.rank <= curData.Ranking[1] * seasonData.all_player) {
                        data = curData;
                    }
                }
            }
        })
        return data;
    }

    //商城组信息（包含商城页签）
    public static ShopGroupInfo: { [key: string]: StdShopGroup[] } = BeforeGameUtils.toHashMapObj(

        //基础商店
        ShopGroupId.BaseShop, [
        { ShopGroupId: ShopGroupId.BaseShop, ShopType: ShopType.LuckyShop, TabSort: 0, ShopName: "抽奖商城" },
        { ShopGroupId: ShopGroupId.BaseShop, ShopType: ShopType.DayShop, TabSort: 0, ShopName: "每日商城" },
        { ShopGroupId: ShopGroupId.BaseShop, ShopType: ShopType.WeekShop, TabSort: 0, ShopName: "特殊商城" },
        { ShopGroupId: ShopGroupId.BaseShop, ShopType: ShopType.TempShop, TabSort: 0, ShopName: "月卡商城" },
    ],
        //pvp商店
        ShopGroupId.GemShop, [
        { ShopGroupId: ShopGroupId.GemShop, ShopType: ShopType.GemConversion, TabSort: 0, ShopName: "宝石积分提取" },
        { ShopGroupId: ShopGroupId.GemShop, ShopType: ShopType.GemShop, TabSort: 0, ShopName: "宝石商城" },
    ],
        //pvp商店
        ShopGroupId.PvpShop, [
        { ShopGroupId: ShopGroupId.PvpShop, ShopType: ShopType.PvpShop, TabSort: 0, ShopName: "勋章商城" },
    ],
        //世界boss商店
        ShopGroupId.WorldBossShop, [
        { ShopGroupId: ShopGroupId.WorldBossShop, ShopType: ShopType.WorldBossShop, TabSort: 0, ShopName: "Boss商城" },
    ],
    );
    private static shopMap: { [key: string]: SShopIndexContent };
    /**
     * 设置商店数据
     * @param datas 
     */
    static SetShopData(datas: SShopIndexContent[]): void {
        if (!this.shopMap) this.shopMap = js.createMap();
        for (const shopData of datas) {
            this.shopMap[shopData.shop_index_id] = shopData;
        }

    }
    /**
     * 获取商店数据
     * @param shopId 商店id
     * @returns 
     */
    static GetShopData(shopId: number): SShopIndexContent {
        return this.shopMap ? this.shopMap[shopId] : null;
    }
    /**
     * 获取通用商品数据
     * @param shopId 
     * @param shopItemId 
     * @returns 
     */
    static GetCommShopData(shopId: number): SShopContent {
        let shopData = this.GetShopData(shopId);
        return shopData ? shopData.shop : null;
    }
    /**
     * 获取抽奖商店数据
     * @param shopId 商店id
     * @returns 
     */
    static GetShopLuckyData(shopId: number): SLuckyContent {
        let shopData = this.GetShopData(shopId);
        return shopData?.lucky;
    }
    static noticeDatas: NoticeData[] = [];
    /**
     * 设置公告数据
     * @param list 
     * @returns 返回是否有更新
     */
    static SetNoticeDatas(list: NoticeData[], unLogin = false): boolean {
        this.noticeDatas = [];
        let newData: NoticeData;
        let newKeyVal: string = "";

        let oldKeyVal: string = unLogin ? "undefined" : LocalStorage.GetPlayerData(PlayerData.playerIdKey, "NoticeCheckCode");
        for (let index = 0; index < list.length; index++) {
            newData = list[index];
            newKeyVal += newData.id.toString();
            if (index < list.length - 1) {
                newKeyVal += "_";
            }
            this.noticeDatas[index] = newData;
        }
        if (unLogin) return true;
        if (newKeyVal != "" && oldKeyVal != newKeyVal) {
            LocalStorage.SetPlayerData(PlayerData.playerIdKey, "NoticeCheckCode", newKeyVal);
            return true;
        }
        return false;
    }
    /**
     * 获取公告数据
     * @returns 
     */
    static GetNoticeDatas(): NoticeData[] {
        return this.noticeDatas;
    }
    /**运鱼入口红点 */
    static CheckFishTradeEnterRead(): boolean {
        if (this.CheckFishTradeIsOpen()) return true;
        return false;
    }
    private static fishOpenTimeCfg: { startHour: number, startMinute: number, endHour: number, endMinute: number }[];
    private static fishTempDate: Date = new Date();
    /**
     * 检测钓鱼活动是否开启
     */
    static CheckFishIsOpen(): boolean {
        let data: SOneOffRedPoint = this.GetOneOffRedPoint(OneOffRedPointId.OffRedPoint_FishOpen);
        if (data.isCheck) return data.redPointVal;
        if (!this.fishOpenTimeCfg) {
            this.fishOpenTimeCfg = [];
            let std: StdFishCommon = CfgMgr.GetFishCommon;
            for (let index = 0; index < std.Opentime.length; index++) {
                let openTiem: string = std.Opentime[index];
                let timearr = openTiem.replace(" ", ":").replace(/\:/g, "-").split("-");
                this.fishOpenTimeCfg[index] = {
                    startHour: Number(timearr[0]),
                    startMinute: Number(timearr[1]),
                    endHour: Number(timearr[2]),
                    endMinute: Number(timearr[3]),
                };
                console.log(timearr);
            }
        }
        let isRedPoint = false;
        for (let index = 0; index < this.fishOpenTimeCfg.length; index++) {
            let timeData: { startHour: number, startMinute: number, endHour: number, endMinute: number } = this.fishOpenTimeCfg[index];
            let startS: number = this.WeeHoursTime() + (timeData.startHour * 60 + timeData.startMinute) * 60;
            let endS: number = this.WeeHoursTime() + (timeData.endHour * 60 + timeData.endMinute) * 60;
            let serverTime: number = this.GetServerTime();
            if (serverTime >= startS && serverTime < endS) {
                isRedPoint = true;
                break;
            }
        }

        data.isCheck = true;
        data.redPointVal = isRedPoint;
        return isRedPoint;
    }
    /**
     * 检测鱼商店是否可出售鱼
     */
    static CheckFishShopIsSell(): boolean {
        if (!this.fishItems) return false;
        let data: SOneOffRedPoint = this.GetOneOffRedPoint(OneOffRedPointId.OffRedPoint_FishSell);
        if (data.isCheck) return data.redPointVal;
        data.redPointVal = PlayerData.fishItems && PlayerData.fishItems.length > 0;
        data.isCheck = true;
        return data.redPointVal;
    }
    private static fishTradeOpenTimeCfg: { startHour: number, startMinute: number, endHour: number, endMinute: number }[];
    /**
     * 检测运鱼活动是否开启
     */
    static CheckFishTradeIsOpen(): boolean {
        let data: SOneOffRedPoint = this.GetOneOffRedPoint(OneOffRedPointId.OffRedPoint_FishTradeOpen);
        if (data.isCheck) return data.redPointVal;
        if (!this.fishTradeOpenTimeCfg) {
            this.fishTradeOpenTimeCfg = [];
            let std: StdFishTradeCommon = CfgMgr.GetFishTradeCommon;
            for (let index = 0; index < std.Opentime.length; index++) {
                let openTiem: string = std.Opentime[index];
                let timearr = openTiem.replace(" ", ":").replace(/\:/g, "-").split("-");
                this.fishTradeOpenTimeCfg[index] = {
                    startHour: Number(timearr[0]),
                    startMinute: Number(timearr[1]),
                    endHour: Number(timearr[2]),
                    endMinute: Number(timearr[3]),
                };
                console.log(timearr);
            }
        }
        let isRedPoint = false;
        for (let index = 0; index < this.fishTradeOpenTimeCfg.length; index++) {
            let timeData: { startHour: number, startMinute: number, endHour: number, endMinute: number } = this.fishTradeOpenTimeCfg[index];
            let startS: number = this.WeeHoursTime() + (timeData.startHour * 60 + timeData.startMinute) * 60;
            let endS: number = this.WeeHoursTime() + (timeData.endHour * 60 + timeData.endMinute) * 60;
            let serverTime: number = this.GetServerTime();
            if (serverTime >= startS && serverTime < endS) {
                isRedPoint = true;
                break;
            }
        }

        data.isCheck = true;
        data.redPointVal = isRedPoint;
        return isRedPoint;
    }
    /**
     * 检测是否有角色可升级 roleId不为空时检测指定角色 否则检测全部
     */
    static CheckRoleIsCanUp(roleId?: string): boolean {
        let maxLv: number;
        let curLv: number;
        let nextLv: StdRoleLevel;
        let items: SPlayerDataItem[] = PlayerData.GetItemTypeDatas(ItemType.exp);
        let totlaExp: number = items.reduce((count, item) => {
            let stdItem: StdItem = CfgMgr.Getitem(item.id);
            return count + stdItem.ItemEffect1 * item.count;
        }, 0);

        let checkRole = (role: SPlayerDataRole) => {
            if (!role) return false;
            maxLv = CfgMgr.GetRoleMaxLevel(role.type);
            curLv = role.level;
            if (curLv >= maxLv) return false;
            nextLv = CfgMgr.GetRoleExpMaxLevel(role.type, curLv, role.experience + totlaExp);
            if (nextLv) {

                if (nextLv.Level > curLv) return true;
                if (nextLv.ConditionId && nextLv.ConditionId) {
                    let condData: ConditionSub = DL.FormatCondition(nextLv.ConditionId[0], nextLv.ConditionLv[0]);
                    if (condData.fail) {
                        return false;
                    }
                }
                //突破
                if (nextLv.BreakItem && nextLv.BreakItem.length > 0) {
                    let myMoney = PlayerData.roleInfo.currency;
                    if (myMoney < nextLv.Cost) {
                        return false;
                    }
                    for (let index = 0; index < nextLv.BreakItem.length; index++) {
                        let itemId = nextLv.BreakItem[index];
                        let itemNum = nextLv.BreakCost[index];
                        let have: number = PlayerData.GetItemCount(itemId);
                        if (have < itemNum) return false;
                    }
                    return true;
                }
            }
            return false;
        }
        if (roleId != undefined) {
            return checkRole(this.GetRoleById(roleId));
        } else {
            for (let index = 0; index < this.roleInfo.roles.length; index++) {
                if (checkRole(this.roleInfo.roles[index])) {
                    return true;
                }
            }
        }
        return false;
    }

    /**生产工坊是否可生产,有id时检测单个，没有id时检测所有 */
    static CheckProductionRed(item_id?: number): boolean {
        //可生产的道具

        let building_id;
        let homeLand = this.GetHomeLand(this.RunHomeId);
        if (!homeLand) return undefined;
        for (let building of homeLand.buildings) {
            if (CfgMgr.GetBuildingUnLock(building.id).BuildingType == BuildingType.sheng_chan) {
                building_id = building.id;
                break;
            }
        }

        if (!building_id) return;
        let max_count = Number.MAX_SAFE_INTEGER;
        let stdlst: StdProduction[] = [];
        let cfg = CfgMgr.GetProductions(building_id);
        for (let std of cfg) {
            let homeId = CfgMgr.Get("homeland_building")[std.BuildingId].HomeId;
            if (PlayerData.CheckCondition(homeId, std.ConditionID, std.ConditionValue)) {
                if (item_id) {
                    if (std.ItemID == item_id) {
                        stdlst.push(std);
                        break;
                    }
                } else {
                    stdlst.push(std);
                }
            }
        }

        if (stdlst) {
            for (let index = 0; index < stdlst.length; index++) {
                const element = stdlst[index];
                let ids = element.CostItemID;
                let num = element.Num;
                let costList
                let nums
                if (typeof ids == "number") {
                    costList = [ids];
                    nums = [num]
                } else {
                    costList = ids;
                    nums = num
                }
                for (let i = 0; i < costList.length; i++) {
                    if (costList[i]) {
                        let has = PlayerData.GetItemCount(costList[i]);
                        let count = Math.floor(has / nums[i])
                        //能合成的最大数量
                        max_count = (count > max_count) ? max_count : count
                    }
                }
            }
        }
        return max_count > 0;
    }
    /**
     * 检测角色合成碎片
     * @returns 
     */
    static CheckRoleChip(): boolean {
        let datas = PlayerData.GetitemBySubType(ItemSubType.shard);
        for (let item of datas) {
            let std = CfgMgr.Getitem(item.id);
            if (std.Type == ThingType.ThingTypeItem && std.Itemtpye == ItemType.shard) {
                if (item.count >= std.ItemEffect3) return true;
            }
        }
        return false;
    }
    /**
     * 检测角色合成碎片
     * @param itemId 
     * @returns 
     */
    static CheckBagBox(): boolean {
        let datas = PlayerData.GetitemBySubType(ItemSubType.cost);
        for (let item of datas) {
            let std = CfgMgr.Getitem(item.id);
            if (std.Type == ThingType.ThingTypeItem && std.Itemtpye == ItemType.box) {
                return true;
            }
        }
        return false;
    }

    /**
     * 检测掠夺红点
     * @returns 
     */
    static CheckLoop(): boolean {
        if (!this.GetSysIsOpen(StdSysId.Sys_7)) return false;
        if (!this.LootPlayerData) return false;
        if (this.LootPlayerData.match_count > 0) return true;
        if (this.LootPlayerData.paid_refresh_count > 0) {
            if (this.LootSeasonInfo) {
                let seasonData = CfgMgr.getPVPById(this.LootSeasonInfo.season_id);
                let haveNum = PlayerData.GetItemCount(seasonData.ConsumeItem);
                if (haveNum > seasonData.ConsumeNumber) return true;
            }

        }
        return false;
    }
    /**频道消息列表 */
    private static channelMsg: SChannelMsgData[] = [];
    /**重置频道消息 */
    static ResetChannelMsg(): void {
        this.channelMsg = [];
        EventMgr.emit(Evt_ChannelMsgUpdate);
    }
    private static advisterCount: { [key: number]: SAdvister } = js.createMap();
    /**设置广告数据*/
    static SetAdvisterData(data: { [key: number]: number }): void {
        this.advisterCount = js.createMap();
        for (let key in data) {
            let id: number = Number(key);
            let val: number = Number(data[key]);
            let std: StdAdvister = CfgMgr.GetAdvister(id);
            this.advisterCount[id] = { id: id, count: Math.max(std.Max_numb - val, 0), cdEndTime: 0 };
        }
    }
    /**更新广告次数 */
    static UpdateAdvisterData(id: number, newCount: number): void {
        let advisterData: SAdvister = this.advisterCount[id];
        let std: StdAdvister = CfgMgr.GetAdvister(id);
        if (std) {
            let count: number = 0;
            if (!advisterData) {
                advisterData = { id: id, count: std.Max_numb, cdEndTime: 0 };
            } else {
                advisterData.count = Math.max(std.Max_numb - newCount, 0);
            }
            this.advisterCount[id] = advisterData;
        }
    }
    /**
     * 获取广告数据
     * @param id 
     * @returns 
     */
    static GetAdvisterData(id: number): SAdvister {
        let std: StdAdvister = CfgMgr.GetAdvister(id);
        if (!std) return;
        let advisterData: SAdvister = this.advisterCount[id];
        if (!advisterData) {
            advisterData = { id: std.Ad_ID, count: std.Max_numb, cdEndTime: 0 };
            this.advisterCount[id] = advisterData;
        }
        return advisterData;
    }
    /**设置广告cd */
    static SetAdvisterCd(id: number): void {
        let adData: SAdvister = this.GetAdvisterData(id);
        let std: StdAdvister = CfgMgr.GetAdvister(id);
        adData.cdEndTime = game.totalTime + std.Ad_CD * 1000;
    }
    /**增加频道消息 */
    static AddChannelMsg(id: number, ...arg: any[]): void {
        let msg: StdMessag = CfgMgr.GetMessag(id);
        if (msg) {
            let formatCont = ReplaceStr(msg.Content, ...arg);
            let msdData: SChannelMsgData = {
                title: "系统",
                cont: formatCont,
            }
            this.channelMsg.unshift(msdData);
            EventMgr.emit(Evt_ChannelMsgUpdate);
        }

    }
    /**增加频道消息 */
    static AddServerChannelMsg(data: { type: number, content: string }): void {
        let msdData: SChannelMsgData = {
            title: "系统",
            cont: data.content,
        }
        this.channelMsg.unshift(msdData);
        EventMgr.emit(Evt_ChannelMsgUpdate);

    }
    /**获取频道消息列表 */
    static GetChannelMsgList(): SChannelMsgData[] {
        return this.channelMsg;
    }
    /**检测是否有加速道具 */
    static CheckAddTimeItem(): boolean {
        let itemDatas = this.GetItemTypeDatas(ItemType.speed);
        return itemDatas && itemDatas.length > 0;
    }
    /**
     * 检测系统是否开启
     * @param id 
     * @returns 
     */
    static GetSysIsOpen(id: number): boolean {
        let stdSysOpen: StdSystemOpen = CfgMgr.GetSysOpenCfg(id);
        if (stdSysOpen) {
            for (let n = 1; ; n++) {
                let types = stdSysOpen['ConditionId' + n];
                let values = stdSysOpen['ConditionValue' + n];
                if (types == undefined || values == undefined) break;
                for (let i = 0; i < types.length; i++) {
                    let type = types[i];
                    let value = values[i];
                    if (DL.Check(type, value)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    //一次性检测的红点id
    private static oneOffRedPointCondIds: number[] = [
        OneOffRedPointId.OffRedPoint_FishOpen,
        OneOffRedPointId.OffRedPoint_FishShopBuy,
        OneOffRedPointId.OffRedPoint_FishSell,
        OneOffRedPointId.OffRedPoint_RolePassiveSkill,
        OneOffRedPointId.OffRedPoint_FishTradeOpen,
        OneOffRedPointId.OffRedPoint_FlipOpen,
    ];
    //一次性红点记录
    private static oneOffRedPoint: { [key: string]: SOneOffRedPoint } = js.createMap();
    /**
     * 重置一次性红点
     */
    public static ResetOneOffRedPoint(): void {
        if (!this.oneOffRedPoint) {
            this.oneOffRedPoint = js.createMap();
        }
        let id: number;
        let data: SOneOffRedPoint;
        for (let index = 0; index < this.oneOffRedPointCondIds.length; index++) {
            id = this.oneOffRedPointCondIds[index];
            data = this.oneOffRedPoint[id];
            if (!data) {
                data = { id: id, isCheck: false, redPointVal: false };
            } else {
                data.isCheck = false;
                data.redPointVal = false;
            }
            this.oneOffRedPoint[id] = data;
        }
    }
    //设置一次性点击红点点击
    public static SetOneOffRedPoint(id: number, redPointValue: boolean = false): void {
        let data: SOneOffRedPoint = this.oneOffRedPoint[id];
        if (data && data.isCheck) {
            data.redPointVal = redPointValue;
            EventMgr.emit(Evt_LoginRedPointUpdate, id);
        }
    }
    /**获取一次性红点数据 */
    public static GetOneOffRedPoint(id: number): SOneOffRedPoint {
        return this.oneOffRedPoint[id];
    }

    static MyGuild: SGuild = null;//我的公会数据
    static ResetMyGuildData(): void {
        this.MyGuild = null;

    }
    //获取我的公会权限
    static GetMyGuildLimit(): StdGuildRole {
        if (!this.MyGuild) return null;
        let memberData: SGuildMember = this.MyGuild.members[this.roleInfo.player_id];
        if (!memberData) return null;
        return CfgMgr.GetGuildRole(memberData.role);
    }
    /**获取我是否有审核权限 */
    static GetMyGuildApply(): boolean {
        let stdRole: StdGuildRole = this.GetMyGuildLimit();
        if (!stdRole) return false;
        return stdRole && stdRole.PermissionApplication > 0;
    }
    /**获取我是否有修改行会信息权限 */
    static GetMyGuildChange(): boolean {
        let stdRole: StdGuildRole = this.GetMyGuildLimit();
        if (!stdRole) return false;
        if (stdRole.PermissioneName > 0) return true;
        if (stdRole.PermissionLogo > 0) return true;
        if (stdRole.PermissionJoin > 0) return true;
        if (stdRole.PermissionEditAnnouncement > 0) return true;

        return false;

    }
    /**获取公会成员是否满足莫一项公会职位*/
    static GetGuildMeetPost(playerId: string, postId: number): boolean {
        if (!this.MyGuild) return false;
        let memberData: SGuildMember = this.MyGuild.members[playerId];
        if (!memberData) return false;
        return memberData.role == postId;
    }
    /**获取公会职位人数 */
    static GetGuildPostNum(id: number): number {
        if (!this.MyGuild) return 0;
        let num: number = 0;
        let memberData: SGuildMember;
        for (let key in this.MyGuild.members) {
            memberData = this.MyGuild.members[key];
            if (memberData.role == id) {
                num++;
            }
        }
        return num;
    }

    /**获取公会是否已申请过*/
    static GetGuildIsHaveApply(guildId: string, list: SGuildApplication[]): boolean {
        let applyData: SGuildApplication;
        let applyTime: number = CfgMgr.GetGuildComm().ApplicationsExpirationTime;
        for (let index = 0; index < list.length; index++) {
            applyData = list[index];
            if (applyData.guild_id == guildId && this.GetServerTime() < applyData.time + applyTime) return true;
        }
        return false;
    }
    /**获取公会事件内容*/
    static GetGuildEventCont(guildEventData: SGuildEvent): string {
        let stdGuildEvent: StdGuildEvent = CfgMgr.GetGuildEvent(guildEventData.event_type);
        let result = stdGuildEvent.Content;
        if (stdGuildEvent) {

            if (guildEventData.event_args) {
                for (let index = 0; index < guildEventData.event_args.length; index++) {
                    result = this.GetGuildEventStr(result, stdGuildEvent.ID, index, guildEventData.event_args[index]);
                }
            }

        }
        return result;
    }
    private static GetGuildEventStr(cont: string, eventId: number, index: number, val: any): string {
        let key: string = `{${index}}`;
        let newVal: any;
        switch (eventId) {
            case GuildEventType.EventType_4:
                if (index == 1) {
                    let stdGuildRole: StdGuildRole = CfgMgr.GetGuildRole(Number(val));
                    if (stdGuildRole) {
                        newVal = stdGuildRole.Name;
                    }
                }
                break;
        }
        return cont.replace(key, newVal || val);
    }
    /**根据公会类型获取公会权益列表 */
    static GetGuildPostPrivilegeList(guildType: number, guildPost: GuildPostType): StdGuildEquity[] {
        let list: StdGuildEquity[] = [];
        let stdGuildType: StdGuildType = CfgMgr.GetGuildType(guildType);
        let idList = stdGuildType[`Equity_list${guildPost}`];
        if (!idList) return list;
        let stdEquity: StdGuildEquity;
        for (let i = 0; i < idList.length; i++) {
            stdEquity = CfgMgr.GetGuildEquity(idList[i]);
            if (stdEquity) {
                list.push(stdEquity);
            }
        }
        return list;
    }

    /**获取我的公会权益列表 */
    static GetMyGuildPrivilegeList(): StdGuildEquity[] {
        if (!this.MyGuild) return [];
        let myPost: StdGuildRole = this.GetMyGuildLimit();
        if (!myPost) return [];
        return this.GetGuildPostPrivilegeList(this.MyGuild.type, myPost.ID);
    }

    /**根据传入id获取我的公会权益 没有此权益则返回null */
    static GetMyGuildPrivilegeById(id: number): StdGuildEquity {
        let list: StdGuildEquity[] = this.GetMyGuildPrivilegeList();
        for (let std of list) {
            if (std.ID == id) return std;
        }
        return null;
    }

    /**根据传入id获取我的公会权益值 没有则返回0*/
    static GetMyGuildPrivilegeByIdToValue(id: number): number {
        let myStd: StdGuildRole = PlayerData.GetMyGuildLimit();
        if (!myStd) return 0;
        let std: StdGuildEquity = this.GetMyGuildPrivilegeById(id);
        if (!std) return 0;
        for (let index = 0; index < std.GuildRole.length; index++) {
            if (myStd.ID == std.GuildRole[index]) {
                return std.RewardType[index];
            }

        }
        return 0;
    }
    /**获取我在公会是否有管理权限 */
    static GetMyGuildAuthority(myData: SGuildMember, targetData: SGuildMember): boolean {
        if (targetData.player_id == PlayerData.roleInfo.player_id) return;
        let myStd: StdGuildRole = CfgMgr.GetGuildRole(myData.role);
        let targetStd: StdGuildRole = CfgMgr.GetGuildRole(targetData.role);
        //return myStd.PermissionRoleAppointment > targetStd.PermissionRoleAppointment || myStd.PermissionKickPlayer > targetStd.PermissionKickPlayer;
        switch (myStd.ID) {
            case GuildPostType.President:
                if (targetStd.ID == GuildPostType.VicePresident || targetStd.ID == GuildPostType.Member) {
                    return true;
                }
                break;
            case GuildPostType.VicePresident:
                if (targetStd.ID == GuildPostType.Officer || targetStd.ID == GuildPostType.Member) {
                    return true;
                }
                break;
            case GuildPostType.Officer:
                if (targetStd.ID == GuildPostType.Member) {
                    return true;
                }
                break;
        }
        return false;
    }
    /**搜素公会成员 */
    static SearchGuildMember(queryStr: string, datas: { [key: string]: SGuildMember }): { [key: string]: SGuildMember } {
        let regex = new RegExp(queryStr.split('').join('.*?'), 'i');
        let list: { [key: string]: SGuildMember } = js.createMap();
        let sGuildMember: SGuildMember;
        for (let key in datas) {
            sGuildMember = datas[key];
            if (regex.test(sGuildMember.name) || regex.test(sGuildMember.player_id)) {
                list[key] = sGuildMember;
            }
        }

        return list;
    }
    /**权益卡数据 */
    static rightsData: SBenefit = null;


    /**是否激活权益 */
    static GetIsActivateRights(equityId: StdEquityId): boolean {
        if (!PlayerData.rightsData || !PlayerData.rightsData.all_equities) return false;
        let val: boolean = PlayerData.rightsData.all_equities[equityId] || false;
        return val;
    }

    /**获取可繁育主卡数据 */
    static getFanyuMainRole() {
        let stds: StdMerge[] = CfgMgr.Get("role_quality");
        let roles = [];
        for (let std of stds) {
            for (let role of this.playerInfo.roles) {
                let isdefense = false;
                if (this.playerInfo.defense_lineup) {
                    for (let defense of this.playerInfo.defense_lineup) {
                        if (defense.role_id == role.id) {
                            isdefense = true;
                            break;
                        }
                    }
                }
                let isattack = false;
                if (this.playerInfo.attack_lineup) {
                    for (let defense of this.playerInfo.attack_lineup) {
                        if (defense && defense.role_id == role.id) {
                            isattack = true;
                            break;
                        }
                    }
                }
                if (!isattack && !isdefense && role.type == std.Roleid && role.quality + 1 === std.RoleQuailty && role.building_id == 0 && !role.is_assisting && role.passive_skills && !role.is_in_main_building) {
                    // console.log("mainCard**********",role.id,role.building_id);
                    roles.push(role);
                }
            }
        }
        let curRoles = [];
        curRoles = roles.filter((item, index) => roles.indexOf(item) === index);
        curRoles.sort((a: SPlayerDataRole, b: SPlayerDataRole) => {
            if (a.passive_skills.length == b.passive_skills.length) {
                return b.battle_power - a.battle_power;
            } else {
                return b.passive_skills.length - a.passive_skills.length;
            }
        })
        return curRoles;
    }
    /**获取可繁育副卡数据 */
    static getFanyuOrtherRole(mainRole, std) {
        let roles = [];
        for (let role of this.playerInfo.roles) {
            let isdefense = false;
            if (this.playerInfo.defense_lineup) {
                for (let defense of this.playerInfo.defense_lineup) {
                    if (defense.role_id == role.id) {
                        isdefense = true;
                        break;
                    }
                }
            }
            let isattack = false;
            if (this.playerInfo.attack_lineup) {
                for (let defense of this.playerInfo.attack_lineup) {
                    if (defense && defense.role_id == role.id) {
                        isattack = true;
                        break;
                    }
                }
            }
            let need_1 = !isattack && !isdefense && std.OtherRoleid.indexOf(role.type) != -1 && mainRole.quality === role.quality;
            let need_2 = role.building_id == 0 && !role.is_assisting && role.passive_skills && !role.is_in_main_building;
            if (need_1 && need_2 && role.ownership_type == mainRole.ownership_type) {
                roles.push(role);
            }
        }
        let curRoles = [];
        curRoles = roles.filter((item, index) => roles.indexOf(item) === index);
        curRoles.sort((a: SPlayerDataRole, b: SPlayerDataRole) => {
            if (a.passive_skills.length == b.passive_skills.length) {
                return b.battle_power - a.battle_power;
            } else {
                return b.passive_skills.length - a.passive_skills.length;
            }
        })
        return curRoles;
    }
    /**获取可进化的角色 */
    static getJinHuaRole(type: number) {
        let stds: StdMerge[] = CfgMgr.Get("role_quality");
        let roles: SPlayerDataRole[] = [];
        for (let std of stds) {
            for (let role of this.playerInfo.roles) {
                let isdefense = false;
                if (this.playerInfo.defense_lineup) {
                    for (let defense of this.playerInfo.defense_lineup) {
                        if (defense.role_id == role.id) {
                            isdefense = true;
                            break;
                        }
                    }
                }
                let isattack = false;
                if (this.playerInfo.attack_lineup) {
                    for (let defense of this.playerInfo.attack_lineup) {
                        if (defense && defense.role_id == role.id) {
                            isattack = true;
                            break;
                        }
                    }
                }
                let is_work = !isattack && !isdefense && role.building_id == 0 && !role.is_in_main_building;
                let is_can = role.type == std.Roleid && !role.is_assisting && role.passive_skills && role.level == 1;

                //进化特殊处理(稀有的卡只有4，5可进化)
                let special = true;
                if (role.type >= 114 && role.quality <= 3) {
                    special = false;
                }

                if (is_work && is_can && std.RoleTypeQual != 2 && special) {
                    // console.log("mainCard**********",role.id,role.building_id);
                    let type_list: StdRoleQualityUp[] = CfgMgr.Get("role_qualityUp");
                    for (let item of type_list) {
                        if (item.Roleid == role.type && item.RoleQuailty == role.quality && item.OperateType == type) {
                            roles.push(role);
                        }
                    }
                }
            }
        }

        let curRoles = [];
        curRoles = roles.filter((item, index) => roles.indexOf(item) === index);
        curRoles.sort((a: SPlayerDataRole, b: SPlayerDataRole) => {
            if (a.passive_skills.length == b.passive_skills.length) {
                return b.battle_power - a.battle_power;
            } else {
                return b.passive_skills.length - a.passive_skills.length;
            }
        })
        return curRoles;
    }
    /**获取可洗练的角色 */
    static getXiLianRole() {
        let roles = [];
        for (let role of this.playerInfo.roles) {
            let isdefense = false;
            if (this.playerInfo.defense_lineup) {
                for (let defense of this.playerInfo.defense_lineup) {
                    if (defense.role_id == role.id) {
                        isdefense = true;
                        break;
                    }
                }
            }
            let isattack = false;
            if (this.playerInfo.attack_lineup) {
                for (let defense of this.playerInfo.attack_lineup) {
                    if (defense && defense.role_id == role.id) {
                        isattack = true;
                        break;
                    }
                }
            }
            let is_has = CfgMgr.GetRoleSkillClearCfg(role.type, role.quality);
            let is_work = !isattack && !isdefense && role.building_id == 0 && !role.is_in_main_building;
            let is_can = role.quality != 1 && !role.is_assisting && role.passive_skills && is_has;

            if (is_work && is_can) {
                // console.log("mainCard**********",role.id,role.building_id);
                roles.push(role);
            }
        }

        let curRoles = [];
        curRoles = roles.filter((item, index) => roles.indexOf(item) === index);
        curRoles.sort((a: SPlayerDataRole, b: SPlayerDataRole) => {
            if (a.passive_skills.length == b.passive_skills.length) {
                return b.battle_power - a.battle_power;
            } else {
                return b.passive_skills.length - a.passive_skills.length;
            }
        })
        return curRoles;
    }
    /**获取上阵角色战力 */
    static GetShangZhenBattlePower(): number {
        let val: number = 0;
        let szRoleData: SBattleRole;
        let list: SBattleRole[] = this.attackRoles;
        let roleData: SPlayerDataRole;
        for (let index = 0; index < list.length; index++) {
            szRoleData = list[index];
            if (!szRoleData) continue;
            roleData = this.GetRoleById(szRoleData.role_id);
            if (roleData) {
                val = val.add(roleData.battle_power);
            }
        }
        return val;
    }
    /**修正权益卡时间为凌晨00点 */
    static CorrectionRightsCardTime(data: SBenefit): SBenefit {
        if (data && data.benefit_card && data.benefit_card.cards) {
            for (let key in data.benefit_card.cards) {
                let time: number = data.benefit_card.cards[key];
                let newTime: number = DateUtils.weeHoursTime(time);
                console.log("权益卡时间修正---->offset " + (time - newTime));
                data.benefit_card.cards[key] = newTime;
            }
        }
        return data;
    }
    /**获取权益卡激活剩余时间 */
    static GetEquityCardResidueTime(cardId: number): number {
        if (!this.rightsData || !this.rightsData.benefit_card || !this.rightsData.benefit_card.cards) return 0;
        let endTime: number = this.rightsData.benefit_card.cards[cardId];
        if (!endTime) return 0;
        return endTime - this.GetServerTime();
    }
    /**获取权益卡是否可领奖*/
    static GetEquityCardIsCanGetAward(cardId: number): boolean {
        if (this.GetEquityCardResidueTime(cardId) < 1) return false;
        if (!this.rightsData.benefit_card_can_claim || !this.rightsData.benefit_card_can_claim[cardId]) return false;
        return true;
    }

    /**通过权益类型获取权益卡列表 */
    static GetEquityByTypeGetCardList(type: StdEquityListType, isActivate: boolean = false): StdEquityCard[] {
        let cardList: StdEquityCard[] = CfgMgr.GetEquityCardList();
        let stdCard: StdEquityCard;
        let stdEquity: StdEquityList;
        let typeCardList: StdEquityCard[] = [];
        for (let index = 0; index < cardList.length; index++) {
            stdCard = cardList[index];
            for (let i = 0; i < stdCard.Equity_list.length; i++) {
                stdEquity = CfgMgr.getEquityListById(stdCard.Equity_list[i]);
                if (!stdEquity) continue;
                if (stdEquity.Equity_Type == type) {
                    if (isActivate && this.GetEquityCardResidueTime(stdCard.Equity_CardID) < 1) continue;
                    typeCardList.push(stdCard);

                }
            }
        }
        return typeCardList;
    }
    /**
     * 通过权益类型获取权益总值
     * @param type 权益类型
     * @param isActivate 是否只计算激活的
     * @returns 
     */
    static GetEquityByTypeTotalValue(type: StdEquityListType, isActivate: boolean = true): number {
        let cardList: StdEquityCard[] = this.GetEquityByTypeGetCardList(type, isActivate);
        let stdEquity: StdEquityList;
        let stdEquityCard: StdEquityCard;
        let value: number = 0;
        for (let index = 0; index < cardList.length; index++) {
            stdEquityCard = cardList[index];
            //过期未激活不计算
            if (isActivate && this.GetEquityCardResidueTime(stdEquityCard.Equity_CardID) < 1) continue;
            for (let j = 0; j < stdEquityCard.Equity_list.length; j++) {
                stdEquity = CfgMgr.getEquityListById(stdEquityCard.Equity_list[j]);
                if (stdEquity && stdEquity.Equity_Type == type) {
                    value = value.add(stdEquity.Value);
                }
            }
        }
        return value;
    }
    /**根据权益卡获取权益值 */
    static GetEquityCardByTypeValue(cardId: number, type: StdEquityListType, isActivate: boolean = true): number {
        let stdEquityCard: StdEquityCard = CfgMgr.getEquityCardById(cardId);
        let stdEquity: StdEquityList;
        let value: number = 0;
        if (stdEquityCard) {
            //过期未激活不计算
            if (isActivate && this.GetEquityCardResidueTime(stdEquityCard.Equity_CardID) > 0) {
                for (let i = 0; i < stdEquityCard.Equity_list.length; i++) {
                    stdEquity = CfgMgr.getEquityListById(stdEquityCard.Equity_list[i]);
                    if (stdEquity && stdEquity.Equity_Type == type) {
                        value = stdEquity.Value;
                        break;
                    }
                }
            }

        }
        return value;
    }

    /**根据主基地劳动工人获取所有产出勋章 */
    static GetAllWorkMedal(): number {
        let workerRate_medal = 0
        let info = PlayerData.GetBuilding(BuildingType.ji_di);
        if (!info) {
            return workerRate_medal;
        }
        for (let index = 0; index < info.workerIdArr.length; index++) {
            let roleData: SPlayerDataRole = info.workerIdArr[index];
            let cfg_medal = CfgMgr.GetProduceMedal(roleData.type, roleData.quality)
            workerRate_medal = workerRate_medal + cfg_medal.produce_medal;
        }
        return workerRate_medal;
    }

    /**权益卡入口红点 */
    static CheckEquityRead(): boolean {
        let cardList: StdEquityCardTab[] = CfgMgr.GetEquityCardTabList();
        let stdCardTab: StdEquityCardTab;
        for (let index = 0; index < cardList.length; index++) {
            stdCardTab = cardList[index];
            for (let j = 0; j < stdCardTab.EquityCardIds.length; j++) {
                if (this.CheckEquityMiniTabRead(stdCardTab.EquityCardIds[j])) {
                    return true;
                }

            }

        }
        return false;
    }
    static CheckEquityMaxTabRead(tabId: number): boolean {
        let stdTab: StdEquityCardTab = CfgMgr.GetEquityCardTab(tabId);
        for (let j = 0; j < stdTab.EquityCardIds.length; j++) {
            if (this.CheckEquityMiniTabRead(stdTab.EquityCardIds[j])) {
                return true;
            }
        }
        return false;
    }
    static CheckEquityMiniTabRead(cardId: number): boolean {
        if (!PlayerData.GetEquityCardIsCanGetAward(cardId)) {
            return false;
        }
        return true;
    }
    //设置今日不再提示时间
    static SetTodayTips(tipsId: TodayNoTipsId): void {
        let time: number = DateUtils.nextDayHoursTime(this.GetServerTime());
        LocalStorage.SetNumber(`${this.roleInfo.player_id}_TodayNoTips_${tipsId}`, time);
    }
    //是否显示今日不再提示
    static GetIsShowTodayTips(tipsId: TodayNoTipsId): boolean {
        let oleTime: number = LocalStorage.GetNumber(`${this.roleInfo.player_id}_TodayNoTips_${tipsId}`) || 0;
        if (oleTime > 0) {
            return this.GetServerTime() > oleTime;
        }
        return true;
    }
    /**炸鱼数据 */
    static fishBombData: SFishingBombStateData;
    /**获取炸鱼当前最新回合数 */
    static get CurFishBombSatgeInfo(): SFishingBombStageInfo {
        if (this.fishBombData && this.fishBombData.round_info) {
            return this.fishBombData.round_info.stages[this.fishBombData.round_info.stage_index];
        }
        return null;
    }
    //获取炸鱼当前回合状态
    static GetFishBombRoundState(): FishBombRoundState {
        if (!this.fishBombData || !this.fishBombData.session_info) return FishBombRoundState.NoOpen;//活动未开启
        if (!this.fishBombData.session_info.is_open || this.GetServerTime() >= this.fishBombData.session_info.end_time) return FishBombRoundState.NoOpen;//活动未开启
        if (!this.CurFishBombSatgeInfo) return FishBombRoundState.NoRound;//没有回合进行中
        //已结算
        if (this.fishBombData.round_info.stage_index == this.fishBombData.round_info.stage_type) {
            if (this.fishBombData.settlement) {
                return FishBombRoundState.RoundSettle;//大回合结算
            } else if (this.GetServerTime() >= this.CurFishBombSatgeInfo.ignite_time + 3) {
                return FishBombRoundState.StageSettle;//小回合结算
            }
        } else {
            if (this.GetServerTime() >= this.CurFishBombSatgeInfo.settlement_time) {
                return FishBombRoundState.StageSettle;//小回合结算
            }
        }

        if (this.GetServerTime() >= this.CurFishBombSatgeInfo.ignite_time) {
            return FishBombRoundState.BombBlasts;//炸弹爆炸
        }
        return FishBombRoundState.CanCastBomb;
    }
    //获取自己炸鱼当前回合总投入
    static GetFishBombSelfCurRoundCost(): number {
        let val: number = 0;
        if (this.fishBombData && this.fishBombData.player) {
            for (let key in this.fishBombData.player.round_cost) {
                let cost: number = this.fishBombData.player.round_cost[key];
                val = val.add(cost);
            }
        }
        return val;
    }

    //获取炸鱼当前选择池塘id
    static GetFishBombCurPondId(): number {
        let pondId: number = 0;
        if (this.fishBombData && this.fishBombData.player && this.fishBombData.round_info) {
            if (this.fishBombData.round_info.stage_index > 0) {
                pondId = this.fishBombData.player.fish_pool_id[this.fishBombData.round_info.stage_index];
            }
        }
        return pondId;
    }

    /**获取炸鱼是否参与炸鱼了 */
    static GetFishBombJoin(): boolean {
        if (!this.CurFishRoundInfo) return false;
        //第一个回合未投入视为未参加
        let selectId = this.fishBombData.player.fish_pool_id[1];
        let costNum = this.fishBombData.player.round_cost[1];
        if (selectId > 0 && costNum > 0) {
            return true;
        }
        return false;
    }

    /**获取当前炸鱼炸弹类型*/
    static FishBombType(cost: number): number {
        let stdRodList: StdFishRod[] = CfgMgr.GetFishRodTypeList(2);
        let std: StdFishRod;
        for (let index = stdRodList.length - 1; index > -1; index--) {
            std = stdRodList[index];
            if (cost >= std.MinValue && cost <= std.MaxValue) {
                return std.TypeId;
            }
        }
        return 1;
    }
    /**获取炸鱼死的回合数 */
    static GetFishBombDieRoundNum(): number {
        let dieRound: number = 0;
        let pondId: number;
        if (this.fishBombData.round_info && this.fishBombData.player && this.fishBombData.player.fish_pool_id) {
            for (let key in this.fishBombData.player.fish_pool_id) {
                pondId = this.fishBombData.player.fish_pool_id[key];
                if (pondId > 0) {
                    let stageInfo: SFishingBombStageInfo = this.fishBombData.round_info.stages[key];
                    if (stageInfo && stageInfo.fish_pool[pondId].is_kill) {
                        dieRound = Number(key);
                        break;
                    }
                }
            }
        }
        return dieRound;
    }
    /**
     * 获取是否热门池塘
     * @param id 
     * @returns 
     */
    static GetHotPond(id: number): boolean {
        let costNum: number = 0;
        let maxId: number = 0;
        if (this.CurFishBombSatgeInfo && this.CurFishBombSatgeInfo.fish_pool) {
            let pondData: SFishingBombFishPoolData;
            for (let key in this.CurFishBombSatgeInfo.fish_pool) {
                pondData = this.CurFishBombSatgeInfo.fish_pool[key];
                if (costNum == 0) {
                    if (pondData.cost > 0) {
                        costNum = pondData.cost;
                        maxId = pondData.fish_pool_id;
                    }
                } else {
                    if (pondData.cost > costNum) {
                        costNum = pondData.cost;
                        maxId = pondData.fish_pool_id;
                    }
                }
            }
        }
        return maxId == id;
    }

    //世界boss数据
    static worldBossData: SWorldBossData = null;
    static worldBossRankData: SWorldBossRankData = null;
    static SetWorldBossDataData(data: SWorldBossStateData): void {
        if (data == null || !data.base || data.base.boss_type < 1) {
            this.worldBossData = null;
            return;
        }
        let bossIndex: number = CfgMgr.GetWorldBossComm.BossType.indexOf(data.base.boss_type);
        if (bossIndex > -1) {
            let endNum: number = data.base.boss_type % 2000 * 1000;
            let stdLvId: number = 2000000 + endNum + data.base.boss_lv;
            let stdRoleType: StdRole = CfgMgr.GetRole()[data.base.boss_type];
            let skillList: number[] = [];
            let attrList: number[] = [];
            let attrValueList: number[] = [];
            let maxHp: number = 0;
            if (stdRoleType) {
                for (let id = 1; ; id++) {
                    let skillId = stdRoleType["Skill" + id];
                    if (skillId == undefined) break;
                    skillList.push(skillId);
                }

                let stdAttrTypeList: number[] = stdRoleType.AttrFight.concat();
                let stdAttrValueList: number[] = stdRoleType.AttrFightValue.concat();
                let bossLvList: StdWorldBossLv[] = CfgMgr.GetWorldBossLvList();
                let bossLvInfo: StdWorldBossLv;
                let curBossLv: StdWorldBossLv;
                for (let index = 0; index < bossLvList.length; index++) {
                    bossLvInfo = bossLvList[index];
                    if (stdLvId == bossLvInfo.ID) {
                        curBossLv = bossLvInfo;
                        break;
                    }
                }
                let attrType: number;
                let attrVal: number;
                let attrTypeName: string;
                let newAttrValue: number;

                for (let attrIndex = 0; attrIndex < stdAttrTypeList.length; attrIndex++) {
                    attrType = stdAttrTypeList[attrIndex];
                    attrVal = stdAttrValueList[attrIndex];
                    newAttrValue = attrVal;
                    if (curBossLv) {
                        attrTypeName = AttrFight[attrType];
                        if (attrTypeName) {
                            newAttrValue = newAttrValue.add(curBossLv[attrTypeName]);
                        }
                    }
                    if (AttrFight.HPMax == attrType) {
                        maxHp = maxHp.add(newAttrValue);
                    }
                    attrList.push(attrType);
                    attrValueList.push(newAttrValue);
                }
            }
            this.worldBossData = {
                terminator: data.base.terminator,
                settle: data.base.settle,
                start: data.base.start,
                end: data.base.end,
                boss_type: data.base.boss_type,
                boss_lv: data.base.boss_lv,
                HP: data.base.HP,
                max_Hp: data.base.max_HP,
                reward_status: data.reward_status,
                roundId: data.base.r,
                name: stdRoleType.Name,
                icon: stdRoleType.Icon,
                model: stdRoleType.Prefab,

                skillList: skillList,
                attrTypeList: attrList,
                attrValueList: attrValueList,
                desc: stdRoleType.Synopsis,
            }
        }
    }
    static SetWorldBossRankData(data: SWorldBossRankData): void {
        if (!data) {
            this.worldBossRankData = null;
            return;
        }
        let tempRankList: SWorldBossRankItemData[] = this.worldBossRankData ? this.worldBossRankData.rank_data_list.concat() : [];
        let newRankList: SWorldBossRankItemData[] = data.rank_data_list ? data.rank_data_list : [];
        let rankData: SWorldBossRankItemData;
        let changeIdList: string[] = [];
        for (let index = 0; index < newRankList.length; index++) {
            rankData = newRankList[index];
            changeIdList[index] = rankData.id;
            tempRankList[index] = rankData;
        }
        let endLen: number = changeIdList.length;
        let changeId: string;
        //根据改变的id去重
        for (let j = 0; j < endLen; j++) {
            changeId = changeIdList[j];
            for (let i = endLen; i < tempRankList.length; i++) {
                rankData = tempRankList[i];
                if (rankData.id == changeId) {
                    tempRankList.splice(i, 1);
                    break;
                }
            }

        }

        data.rank_data_list = tempRankList;
        this.worldBossRankData = data;
    }
    /**获取世界boss是否可挑战 */
    static GetWorldIsCanChallenge(): boolean {
        if (!this.worldBossData) return false;
        if (this.worldBossData.terminator != "") return false;
        if (this.GetServerTime() >= this.worldBossData.end) return false;
        if (this.worldBossData.HP < 1) return false;
        return true;
    }
    private static worldBossOpenTimeList: { startHour: number, startMinute: number, endHour: number, endMinute: number }[];
    /**检测世界boss是否临近开启 */
    static CheckWorldBossNearOpneTime(): boolean {
        if (!this.worldBossOpenTimeList) {
            this.InitWorldBossOpenTime();
        }
        let isNear: boolean = false;
        let serverTime: number = this.GetServerTime();
        for (let index = 0; index < this.worldBossOpenTimeList.length; index++) {
            let timeData: { startHour: number, startMinute: number, endHour: number, endMinute: number } = this.worldBossOpenTimeList[index];
            let time: number = DateUtils.weeHoursTime(serverTime) + (timeData.startHour * 60 + timeData.startMinute) * 60;
            let startS: number = time - 6000;//世界boss开始前十分钟
            let endS: number = time + 1000;//世界boss开始后1分钟
            if (serverTime >= startS && serverTime <= endS) {
                isNear = true;
                break;
            }
        }
        return isNear;
    }
    static GetWorldOpenTimeList(): { startHour: number, startMinute: number, endHour: number, endMinute: number }[] {
        if (!this.worldBossOpenTimeList) {
            this.InitWorldBossOpenTime();
        }
        return this.worldBossOpenTimeList;
    }
    private static InitWorldBossOpenTime(): void {
        this.worldBossOpenTimeList = [];
        let std: StdWorldBossComm = CfgMgr.GetWorldBossComm;
        for (let index = 0; index < std.Opentime.length; index++) {
            let openTiem: string = std.Opentime[index];
            let timearr = openTiem.replace(" ", ":").replace(/\:/g, "-").split("-");
            this.worldBossOpenTimeList[index] = {
                startHour: Number(timearr[0]),
                startMinute: Number(timearr[1]),
                endHour: Number(timearr[2]),
                endMinute: Number(timearr[3]),
            };
        }
    }

    /**获取角色主技能是否升级 */
    static GetActiveSkillIsUp(role_id): boolean {
        // let isdefense = false;
        // if (this.playerInfo.defense_lineup) {
        //     for (let defense of this.playerInfo.defense_lineup) {
        //         if (defense.role_id == role_id) {
        //             isdefense = true;
        //             break;
        //         }
        //     }
        // }

        // let isattack = false;
        // if (this.playerInfo.attack_lineup) {
        //     for (let defense of this.playerInfo.attack_lineup) {
        //         if (defense && defense.role_id == role_id) {
        //             isattack = true;
        //             break;
        //         }
        //     }
        // }

        let role = this.GetRoleById(role_id)
        // let is_work = !isattack && !isdefense && role.building_id == 0 && !role.is_in_main_building;
        // let is_can =  !role.is_assisting && role.ownership_type != 1;

        return role.ownership_type != 1;

    }

    private static flipOpenTimeCfg: { startHour: number, startMinute: number, endHour: number, endMinute: number }[];
    /**
     * 检测钓鱼活动是否开启
     */
    static CheckFlipIsOpen(): boolean {
        let data: SOneOffRedPoint = this.GetOneOffRedPoint(OneOffRedPointId.OffRedPoint_FlipOpen);
        if (data.isCheck) return data.redPointVal;
        if (!this.flipOpenTimeCfg) {
            this.flipOpenTimeCfg = [];
            let std: StdFlipCommon = CfgMgr.GetFlipCommon;
            for (let index = 0; index < std.Opentime.length; index++) {
                let openTiem: string = std.Opentime[index];
                let timearr = openTiem.replace(" ", ":").replace(/\:/g, "-").split("-");
                this.flipOpenTimeCfg[index] = {
                    startHour: Number(timearr[0]),
                    startMinute: Number(timearr[1]),
                    endHour: Number(timearr[2]),
                    endMinute: Number(timearr[3]),
                };
                console.log(timearr);
            }
        }
        let isRedPoint = false;
        for (let index = 0; index < this.flipOpenTimeCfg.length; index++) {
            let timeData: { startHour: number, startMinute: number, endHour: number, endMinute: number } = this.flipOpenTimeCfg[index];
            let startS: number = this.WeeHoursTime() + (timeData.startHour * 60 + timeData.startMinute) * 60;
            let endS: number = this.WeeHoursTime() + (timeData.endHour * 60 + timeData.endMinute) * 60;
            let serverTime: number = this.GetServerTime();
            if (serverTime >= startS && serverTime < endS) {
                isRedPoint = true;
                break;
            }
        }

        data.isCheck = true;
        data.redPointVal = isRedPoint;
        return isRedPoint;
    }
}
export default PlayerData;

/**
 * 计算战力
 * @param roleType 
 * @param level 
 * @returns 
 */
export function CountPower(roleType: number, level: number, role?: SPlayerDataRole) {
    // console.log("CountPower*******************************", roleType, level);
    if (role && role.battle_power) return role.battle_power
    let power = 0;
    let std = CfgMgr.GetRole()[roleType];
    for (let type of std.Attr) {
        power = power + CfgMgr.GetAttr()[type].Power * DL.GetAttrValue(type, std);
    }
    for (let type of std.AttrFight) {
        power = power + CfgMgr.GetFightAttr()[type].Power * DL.GetFightAttrValue(type, std);
    }
    let stdlv = CfgMgr.GetRoleLevel(roleType, level);
    if (stdlv) {
        for (let type of stdlv.Attr) {
            power = power + CfgMgr.GetAttr()[type].Power * DL.GetAttrValue(type, stdlv);
        }
        for (let type of stdlv.AttrFight) {
            power = power + CfgMgr.GetFightAttr()[type].Power * DL.GetFightAttrValue(type, stdlv);
        }
    }
    return Math.floor(power);
}
/**
 * 角色计算战力（纯卡计算/计算角色本身）
 * @param roleType 角色类型 
 * @param roleQual 角色品质
 * @param roleLv 角色等级
 * @param role 角色数据
 * @returns 
 */
export function RoleCardPower(roleType: number, roleQual: number = 1, roleLv: number = 1, role: SPlayerDataRole = null) {
    let val: number = 0;
    let countPower = (attrList: number[], valList: number[], attrGroup: { [key: string]: StdAttr }) => {
        let count: number = 0;
        let attrType: number;
        let attrVal: number;
        for (let i = 0; i < attrList.length; i++) {
            attrType = attrList[i];
            attrVal = valList && i < valList.length ? valList[i] : 0;
            count += attrGroup[attrType].Power * attrVal;
        }
        return count;
    }
    let attrGroup: { [key: string]: StdAttr } = CfgMgr.GetAttr();
    let fightAttrGroup: { [key: string]: StdAttr } = CfgMgr.GetFightAttr();
    //角色等级属性
    let stdlv = CfgMgr.GetRoleLevel(roleType, roleLv);
    if (stdlv) {
        if (stdlv.Attr && stdlv.Attr.length) {
            val += countPower(stdlv.Attr, stdlv.AttrValue, attrGroup);
        }
        if (stdlv.AttrFight && stdlv.AttrFight.length) {
            val += countPower(stdlv.AttrFight, stdlv.AttrFightValue, fightAttrGroup);
        }
    }
    //计算主动技能
    let countMainSkill = (skillId: number, skillLv: number) => {
        //主动技能属性计算
        let stdMainSkill = CfgMgr.GetActiveSkill(skillId, skillLv);
        if (stdMainSkill) {
            if (stdMainSkill.Attr && stdMainSkill.Attr.length) {
                val += countPower(stdMainSkill.Attr, stdMainSkill.AttrValue, attrGroup);
            }
            if (stdMainSkill.AttrFight && stdMainSkill.AttrFight.length) {
                val += countPower(stdMainSkill.AttrFight, stdMainSkill.AttrFightValue, fightAttrGroup);
            }

        }
    }
    //计算被动技能
    let countPassiveSkill = (skillId: number, skillLv: number) => {
        let passiveSkill = CfgMgr.GetPassiveSkill(skillId, skillLv);
        if (passiveSkill) {
            if (passiveSkill.Attr && passiveSkill.Attr.length) {
                val += countPower(passiveSkill.Attr, passiveSkill.AttrValue, attrGroup);
            }
            if (passiveSkill.AttrFight && passiveSkill.AttrFight.length) {
                val += countPower(passiveSkill.AttrFight, passiveSkill.AttrFightValue, fightAttrGroup);
            }
        }
    }
    //角色类型属性
    let stdRole = CfgMgr.GetRole()[roleType];
    if (stdRole) {
        if (stdRole.Attr && stdRole.Attr.length) {
            val += countPower(stdRole.Attr, stdRole.AttrValue, attrGroup);
        }
        if (stdRole.AttrFight && stdRole.AttrFight.length) {
            val += countPower(stdRole.AttrFight, stdRole.AttrFightValue, fightAttrGroup);
        }

        if (role) {
            let skillLvIndex: number;
            let skillData: SPlayerDataSkill;
            for (skillLvIndex = 0; skillLvIndex < role.active_skills.length; skillLvIndex++) {
                skillData = role.active_skills[skillLvIndex];
                countMainSkill(skillData.skill_id, skillData.level);
            }
            for (skillLvIndex = 0; skillLvIndex < role.passive_skills.length; skillLvIndex++) {
                skillData = role.passive_skills[skillLvIndex];
                countPassiveSkill(skillData.skill_id, skillData.level);
            }
        } else {
            let skillId: number;
            for (let n = 1; ; n++) {
                skillId = stdRole["Skill" + n];
                if (skillId == undefined) break;
                countMainSkill(skillId, 1);
            }
            let passiveSkillIds: number[] = [];
            //被动技能初始天赋1
            if (stdRole.PassiveGife) {
                passiveSkillIds.push(stdRole.PassiveGife);
            }
            //被动技能职业天赋1
            if (stdRole.PassiveJob) {
                passiveSkillIds.push(stdRole.PassiveJob);
            }
            for (let passiveSkillId of passiveSkillIds) {
                countPassiveSkill(passiveSkillId, 1);
            }
        }
    }
    //角色品质属性
    let stdQuality = CfgMgr.GetRoleQuality(roleType, roleQual);
    if (stdQuality) {
        if (stdQuality.Attr && stdQuality.Attr.length) {
            val += countPower(stdQuality.Attr, stdQuality.AttrValue, attrGroup);
        }
        if (stdQuality.AttrFight && stdQuality.AttrFight.length) {
            val += countPower(stdQuality.AttrFight, stdQuality.AttrFightValue, fightAttrGroup);
        }
    }

    return Math.floor(val);
}
/**
 * 计算战力
 * @param BuildingId 
 * @param level 
 * @returns 
 */
export function CountBuildPower(BuildingId: number, level: number) {
    let power = 0;
    let std = CfgMgr.GetBuildingLv(BuildingId, level);
    for (let type of std.Attr) {
        power = power + CfgMgr.GetAttr()[type].Power * DL.GetAttrValue(type, std);
    }
    for (let type of std.AttrFight) {
        power = power + CfgMgr.GetFightAttr()[type].Power * DL.GetFightAttrValue(type, std);
    }
    return power;
}

/**兵种生产推送 */
type PushStruct = {
    building_id: number;
    soldier_id: number;
    count: number;       //当前批次正在生产的数量
    total_count: number; //当前兵种总库存量
    start_time: number;
}
