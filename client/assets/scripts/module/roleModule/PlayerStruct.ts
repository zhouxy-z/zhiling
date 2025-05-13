import { ThingType } from "../../manager/CfgMgr";
import { SLootRankInfo, SPlayerDataFusionStone, SPlayerDataPlunder } from "../home/HomeStruct";

/**配置数据枚举 */
export enum PlayerDataMap {
    PrevHomeId = 1,//上一次登录的家园id
    BattleSpeed,//战斗速度
    BattleAuto,//自动战斗
    Guide,//指引
    PveChapter,//Pve章节
}

/**角色状态类型 */
export enum RoleStateType {
    State_None = 0,
    /**工作中 */
    State_Work = 1,
    /**上阵中 */
    State_Attack = 2,
    /**防守中*/
    State_Defend = 3,
    /**助战中 */
    State_Assist = 4,
    /**NFT */
    State_NFT = 5,
}

/////////////////////////////////////////////////////////////////////////////
// 数据结构
/////////////////////////////////////////////////////////////////////////////

/**战斗状态 */
export enum FightState {
    None,
    Home,
    PvP,
    PvE,
    Replay,
    WorldBoss,
}

/**建筑状态 */
export enum BuildingState {
    Lock,      // 未解锁
    CanUnLock, // 可以解锁
    Building,  // 建造中
    Complete   // 正常状态
}

/**资源 */
export type SPlayerDataResources = {
    wood: number;
    water: number;
    seed: number;
    rock: number;
}

/**道具 */
export type SPlayerDataItem = {
    id: number;
    count: number;
    isNew?: boolean;
    sort?: number;
}

/**角色数据 */
export type SPlayerDataRole = {
    id: string;
    type: number;
    level: number;
    experience: number;
    soldier_num: number;
    active_skills: SPlayerDataSkill[];
    passive_skills: SPlayerDataSkill[];
    is_in_building: boolean;
    building_id: number;
    battle_power: number;
    quality: number;
    skills: number[];
    is_assisting: boolean;
    is_in_attack_lineup: boolean;
    is_in_defense_lineup: boolean;
    trade_cd: number;
    is_in_main_building?: boolean;
    main_building_id?: number;
    nft_lock_expires?: number;
    ownership_type?: number//绑定标识
    sort?: number;
}


/**技能定义 */
export type SPlayerDataSkill = {
    skill_id: number;
    level: number;
}

/**建筑数据 */
export type SPlayerDataBuilding = {
    id: number;
    level: number;
    is_upgrading: boolean;
    upgrade_time: number;

    workerIdArr?: SPlayerDataRole[];
    state?: BuildingState;
}

/**家园数据 */
export type SPlayerDataHomeland = {
    id: number;
    level: number;
    buildings: SPlayerDataBuilding[];
    total_wood_collect_duration: number;
    total_water_collect_duration: number;
    total_rock_collect_duration: number;
    total_seed_collect_duration: number;
}

/**角色简单数据 */
export type SSimpleData = {
    player_id: string;//玩家id
    name: string;//玩家名字
    weChatNum?: string;//玩家微信
    qqNum?: number;//玩家QQ
    headId?: number;//玩家头像id
    headFarmerId?: number;//玩家头像框id
}

/**角色数据 */
export type SPlayerData = {
    resource_exchange_uses: number;
    player_id: string;
    wechat_id: string;
    name: string;
    contact_wechat: string;//微信号
    contact_qq: string;//QQ号
    name_changed_times;//改名次数
    is_password: boolean;
    currency: number;//彩虹体/幻彩石 服不同代表货币不同
    currency2: number;
    currency3: number;
    currency_74: number;//勋章
    currency_77: number;//宝石积分
    icon_url: string;
    avatar_url: string;
    resources: SPlayerDataResources;
    tasks: { [key: string]: SPlayerDataTask };
    daily_tasks: null;
    items: SPlayerDataItem[];
    item_productions: SPlayerDataItemProduction[];//生产工坊
    soldiers: SPlayerDataSoldier[];//兵种库存
    soldier_productions: SPlayerDataSoldierProduction[];//兵种生产列表
    pve_data: SPlayerDataPve;
    roles: SPlayerDataRole[];
    homelands: SPlayerDataHomeland[];
    attack_lineup: SBattleRole[];
    battle_power: number;
    defense_lineup: SBattleRole[];
    boss_lineup: SBattleRole[];
    config_data: { [key: number]: number };
    fusion_stone_data: SPlayerDataFusionStone;//熔铸石采集数据
    plunderData: SPlayerDataPlunder; //勋章采集数据
    role_type_max_sum_battle_power: number;
    boss_data: SPlayerBossData;//世界boss挑战数据
    panel: string[];//要屏蔽的界面
}

/**生产道具 */
export type SPlayerDataItemProduction = {
    id: number;          //道具id
    item_id: number;     //道具id
    finish_time: number; //完成时间
    count: number;       //数量
}

/**兵种库存 */
export type SPlayerDataSoldier = {
    id: number;
    count: number;
    building_id: number;
    add?: number;
}

/**生产中的兵种 */
export type SPlayerDataSoldierProduction = {
    id: number;
    count: number;
    building_id: number;
    start_time: number;
    soldier_id: number;//招募兵种id
}

export type SBattleRole = {
    role_id: string;
    soldiers: SBattleSoldier[]
}

export type SBattleSoldier = {
    id: number;
    count: number;
}

export type SPlayerDataPve = {
    progress: number;
    times: number;//剩余次数
    paid_refresh_times: number; //剩余购买次数
    sweep_times: number;//已扫荡次数
}
/**通用加速*/
export enum BoostType {
    BoostTypeUnknown = 0,//无
    BoostTypeBuildingUpgrade,//建筑升级加速
    BoostTypeSoldierProduce,//兵营生产加速
    BoostTypeItemProduction,//生产工坊
}
/**
 * 通用加速返回数据
 */
export type SBoostStruct = {
    boost_type: BoostType;//加速类型
    id: number;//对应类型id BoostTypeBuildingUpgrade返回建筑id BoostTypeSoldierProduce生产id BoostTypeItemProduction 生产id
    changed_time: number;//改变时间单位秒
}
/**
 * 通用加速返回数据
 */
export enum SortType {
    /**消耗从高到低*/
    priceUp,
    /**消耗从低到高 */
    priceDown,
    /**总价从高到低 */
    totalUp,
    /**总价从低到高 */
    totalDown,
    /**数量从高到低 */
    countUp,
    /**数量从低到高 */
    countDown
}

//交易所相关数据
/**请求交易所列表返回数据 */
export type SOonViewData = {
    code: number,
    query_type: number,
    query_args: SQueryArgs,
    page_index: number,
    page_size: number,
    page_last_index: number,
    order_list: [],
    order_state_list: [],
    total_count: number,
}
/**单个订单数据 */
export type SOrderData = {
    /**订单号 */
    order_id: string,
    view_id: string,
    from_order_id: string,
    /**买单或者卖单 */
    order_type: string,
    /**消耗 */
    unit_value: number,
    /**数量 */
    unit_count: number,
    nonce: number,
    /**单主ID */
    player_id: string,
    /**单主昵称 */
    player_name: string,
    /**开单时间 */
    open_time: number,
    /**结束时间 */
    close_time: number,
    /**道具 */
    things: SOrderThings,
    unit_step?: number,
}

/**世界交易所单个订单数据 */
export type SCrossOrderData = {
    /**订单号 */
    order_id: string,
    view_id: string,
    from_order_id: string,
    /**买单或者卖单 */
    order_type: string,
    /**消耗 */
    group_value: number,
    /**数量 */
    group_count: number,
    /**单主ID */
    player_id: string,
    /**单主昵称 */
    player_name: string,
    /**开单时间 */
    open_time: number,
    /**结束时间 */
    close_time: number,
    /**道具 */
    items: { type: number, id: number, count: number },
    group_step: number,
    union_id: string,
    from_server: string,
    view_server: string,
    bourse_id: number,
    is_lock: boolean,

}


export type SOrderThings = {
    data: SOrderThing[];
}
/**订单物品信息 */
export type SOrderThing = {
    item?: SPlayerDataItem,
    role?: SPlayerDataRole,
    resource?: SPlayerDataResources,
    type: number
}
/**查询返回数据类型 */
export type SSerchData = {
    code: number,
    order_list: [],
    order_state_list: []
}
/**查询返回数据类型 */
export type SQueryArgs = {
    player_id?: String,
    thing_type?: number,
    sort_type?: number,
    item_selection?: number[],
    role_selection?: number[],
    thing_res?: string,
    selection_time_lock?: number,
    reverse?: boolean,
    init?: number,
    payment_selection?: { type: number, id: number },
    search_group_id?: number
}
/**订单类型 */
export enum SOrderType {
    SELL, //出售商品订单
    BUY, //购买商品订单
}
/**检索订单类型 */
export enum SQueryType {
    /**全部类型 */
    Global = 0,
    /**玩家ID */
    PlayerID = 1,
    /**道具 */
    ItemType = 2,
    /**订单类型, 在世界交易所中该类型代表以支付货币类型查询 */
    ThingType = 3, //在世界交易所中该类型代表以支付货币类型查询
    /**角色, 在世界交易所中代表挂单的货币类型 */
    RoleType = 4,  //在世界交易所中代表挂单的货币类型
}
/**订单排序枚举 */
export enum SQuerySortType {
    /**创建时间 */
    OpenTime = 0,
    /**消耗 */
    UnitPrice = 1,
    /**总价 */
    TotalPrice = 2,
    /**数量 */
    UnitCount = 3,
}

/**原石数量 */
export type SThingGemstone = {
    value: number;
}

/**彩虹体数量 */
export type SThingCurrency = {
    value: number;
    type: number;
}

/**金币数量 */
export type SThingGold = {
    value: number;
}

/**资源数据 */
export type SThingResource = {
    wood?: number;
    water?: number;
    rock?: number;
    seed?: number;
}

/**道具数据 */
export type SThingItem = {
    id: number;
    count: number;
}

/**事物定义 */
export type SThing = {
    type?: ThingType;
    currency?: SThingCurrency;
    gold?: SThingGold;
    resource?: SThingResource;
    item?: SThingItem;
    role?: SPlayerDataRole;
    resData?: SThingRes;
    gemstone?: SThingGemstone;
    sort?: number;//只用来排序
}
/**事物定义资源类 */
export type SThingRes = {
    name: string;//事物资源名称
    count: number;//事物资源数量
    iconUrl: string;//事物资源icon路径
    iconBgUrl: string;//事物资源icon背景||品质路径
    roleMaskBg?: string;//角色碎片背景
    roleMask?: string;//角色碎片背景
    qual?: number,//品质
}
/**事物列表 */
export type SThings = {
    data: SThing[];
}

/**邮件数据 */
export type SPlayerMailData = {
    _id: string;                    // MongoDB ObjectID for the mail document.
    player_id: string;              // The ID of the player to whom this mail belongs.
    sender_player_id: string;
    sender_player_name: string;
    time: number;                   // Timestamp when the mail was sent or received.
    is_read: boolean;               // Whether the mail has been read.
    is_deleted: boolean;            // Whether the mail has been marked as deleted.
    is_attachment_claimed: boolean; // Whether the mail has attachments that can be obtained.
    title: string;                  // The title of the mail.
    content: string;                // The content of the mail.
    attachments: SThings;           // List of attachments included with the mail.

    lock_time?: number;//是否有倒计时
    is_last?: boolean;//是否最后一个
}
/**邮件数据 */
export type SMailPlayerData = {
    name: string,
    icon_url: string,
    avatar_url: string,
    homeland_id: number,
    player_id: string,
    guild_info: { appointed_by: string, type: number, name: string, role_type: number },
}
//--------------------------好友----------------------
/**好友数据 */
export type SGetAgentInfo = {
    upline_id: string,
    total_income: number,
    daily_income: number,
    assist_roles_slots: number,
    total_assist_income: number,
    assist_roles: SRoleAssistData[],
    role_data_list: SPlayerDataRole[],
}

export type SRoleAssistData = {
    role_id: string,
    player_id: string,
    slot: number,
    usage_fee: number,
    battle_power: number,
    daily_assist_count: number,
    daily_income: number,
}

/**收益数据 */
export type SIncomesInfo = {
    player_id: string,
    name: string,
    icon_url: string,
    amount: number,
}

/**好友收益 */
export type SGetIncomes = {
    total_downlines: number,
    total_unclaimed: number,
    incomes: SIncomesInfo[],
}

/**上线好友数据 */
export type SUplineInfo = {
    player_id: string,
    name: string,
    icon_url: string,
    level: number,
    battle_power: number,
    last_offline_time: number,
    is_online: boolean,
}

/**上线好友 */
export type SGetUplineInfo = {
    has_upline: boolean,
    upline: SUplineInfo,
}

/**下线好友数据 */
export type SDownlineInfo = {
    player_id: string,
    name: string,
    icon_url: string,
    avatar_url: string,
    level: number,
    total_output: number,
    daily_output: number,
    role?: SPlayerDataRole,
    is_upline: boolean,
    daily_activity: number,
    cards: number[];
}

/**下线好友 */
export type SGetDownlines = {
    total_count: number,
    downlines: SDownlineInfo[],
    page: number,
    page_size: number,
    sort_type: number,
    search_player_id: string,
    include_role: boolean,
}

/**好友列表排序枚举 */
export enum SFriendSortType {
    /**本日收益从高到低*/
    SortDailyOutputDesc = 1,
    /**本日收益从低到高 */
    SortDailyOutputAsc,
    /**累计收益从高到低 */
    SortTotalOutputDesc,
    /**累计本日收益从低到高 */
    SortTotalOutputAsc,
    /**绑定时间从早到晚 */
    SortBindTimeDesc,
    /**绑定时间从晚到早 */
    SortBindTimeAsc,
    /**活跃度 */
    SortDailyActivityDesc
}

/**好友联系方式数据 */
export type SGetContactInfo = {
    player_id: string,
    name: string,
    wechat_id: string,
    qq_id: string,
}

/**好友收益记录信息 */
export type SIncomeRecordInfo = {
    player_id: string,
    name: string,
    amount: number,
    timestamp: number,
}

/** 收益记录返回数据*/
export type SIncomeRecords = {
    income_records: SIncomeRecordInfo[],
    total: number;
}

/** 角色助战返回数据*/
export type SAssistRoleInfo = {
    player_id: string,
    player_name: string,
    usage_fee: number,
    role_id: string,
    type: number,
    level: number,
    quality: number,
    battle_power: number,
    daily_assist_count: number,
}




/**任务数据类型 */
export type SPlayerDataTask = {
    id: number,
    /**数值 */
    v: number,
    /**状态 */
    s: number,
    /**最后刷新时间 */
    lrt: number,
}

/**任务状态 */
export enum STaskState {
    unFinsh = 1,
    Finsh,
}

/**任务类型 */
export enum STaskShowType {
    /**每日 */
    dayliy = 1,
    /**每周 */
    week,
    /**成就 */
    archive,
    /**好友 */
    friend,
    /**每日登录 */
    dayliyLogin
}

/**好友的任务类型 */
export enum STaskType {
    /**每日任务 */
    dayTask = 1,
    /**每周任务 */
    weekTask,
    /**成就任务 */
    achieveTask,
    /**每日登录 */
    dayliyLogin,
    /**邀请任务 */
    invite,
    /**每日活跃*/
    dayActive,
    /**每周活跃 */
    weekActive,
    /**好友助战协助 */
    assistHelp = 8,
    /**好友繁育协助 */
    fanyuHelp = 9,

}
//钓鱼场次数据
export type SFishingSessionInfo = {
    start_time: number,//开始时间
    end_time: number,//结束时间
    is_open: boolean,//是否开启
    kill_type: number,//击杀范围开始
    kill_type_end: number,//击杀范围结束
}
//钓鱼湖泊数据
export type SFishingLakeData = {
    lake_id: number,//湖泊id
    cost: number,//已投饲料
    is_frozen: number,// 是否冰冻
    player_count: number//当前湖泊玩家数
}
// 玩家钓鱼数据
export type SFishingPlayerStateData = {
    fatigue: number,// 疲劳
    fatigue_max: number// 疲劳上限
    lake_id: number,// 当前已投入的湖泊
    is_hit: number,// 有没有提杆
    is_miss: boolean,//是否空杆
    round_cost: number,// 当前回合已投入湖泊价值
    daily_cost: number,// 今日投入湖泊价值
}
// 最近的回合信息(包括当前回合和下一回合)
export type SFishingRoundInfo = {
    start_time: number,//开始时间
    frozen_time: number,//冰封时间
    rod_time: number, //提干时间
    settlement_time: number,//结算时间
    end_time: number,//结束时间
    is_open: boolean,//是否开启
    is_frozen: boolean,//是冰封
    is_settlement: boolean,//是否已结算
    round: number,//当前回合数
    kill_type: number,//击杀模式
    kill_type_end: number,//击杀范围结束
}
/**钓鱼状态 */
export type SFishingStateData = {
    round: number,//当前回合数
    player: SFishingPlayerStateData//玩家数据
    lakes: SFishingLakeData[],//湖泊数据列表
    session_info: SFishingSessionInfo,//当前场次信息
    round_info: SFishingRoundInfo,//当前回合信息
    settlement: SFishingSettlementData;//结算数据
    rank_reward_pool: number;//排行榜奖励池
}

/**钓到的鱼*/
export type SFishingItem = {
    id: number,// 商品ID
    fish_id: number,//鱼id
    weight: number,// 重量
}

// 钓鱼结果奖励信息
export type SFishingSettlementData = {
    cost_get: number,//归还鱼料
    cost_lose: number,//损失鱼料
    fatigue_get: number,//归还体力
    fatigue_lose: number,//体力损失
    fish_items: SFishingItem[],//钓到的鱼
    is_miss: boolean,//是否空杆了
    fish_score_get: number,//获得鱼票数
    round: number,//回合数
}
// 玩家回合记录
export type SFishingLogItemData = {
    _id: number,//记录id
    round: number,// 回合
    player_id: number,//玩家id
    start_time: number,//开始时间
    end_time: number,//结束时间
    cost: number,//钓鱼总投入
    cost_get: number,// 投入回收
    cost_lose: number,// 此回合的损失
    fatigue_cost: number,// 疲劳花费
    fatigue_get: number,// 疲劳回复
    lake_id: number,// 湖泊
    frozen_lake_id: number,//冰冻的湖泊
    frozen_lake_ids: number[],//冰冻的湖泊列表
    fish_item: SFishingItem[],// 获得的鱼
    fish_score_get: number,// 获得的积分
}
/**钓鱼冰封日志数据 */
export type SFishingFrozenLogData = {
    round: number;//回合数
    lake_id: number;//冰封湖泊id
    lake_ids: number[];//冰冻湖泊id
}
/**钓鱼回合湖泊记录 */
export type SFishingRoundLakeRecordData = {
    lake_id: number,                     // 湖泊ID
    is_frozen: boolean,                 // 是否冰冻
    cost: number,                           // 总投入
    players: number[]// 玩家记录
}
export type SFishingRoundSettlementRecordData = {
    pool: number,                     // 结算池
    pool_fee: number,                 // 结算池费用
    rank_pool: number,                // 排行榜奖励部分
    frozen_win_pool: number,          // 冰冻胜利奖励
    not_frozen_win_pool: number,      // 非冰冻胜利奖励
    total_cost: number,               // 总投入
    total_player: number,             // 总玩家
    non_frozen_win_player: number,    // 非冰冻胜利玩家
    non_frozen_fail_player: number,   // 非冰冻失败玩家
    frozen_win_player: number,        // 冰冻胜利玩家
    frozen_fail_player: number,       // 冰冻失败玩家
}
/**钓鱼回合记录 */
export type SFishingRoundRecordData = {
    _id: number,
    round: number,// 回合
    start_time: number,
    end_time: number,
    lake: SFishingRoundLakeRecordData[]// 湖泊
    lake_with_players: SFishingRoundLakeRecordData[] // 湖泊
    settlement: SFishingRoundSettlementRecordData[]               // 结算
}
/**历史排行榜数据 */
export type FishingSubRankSettlementRecordInfo = {
    pool: number, // 当前奖池总奖励
    player_count: number,// 玩家总数
    reward_player_count: number,// 获奖玩家数
    top_player_name: string, // 榜首玩家名
    top_player_id: string,// 榜首玩家ID
    top_player_reward: number,//榜首奖励
    self_rank: number,// 自己的排名
    self_score: number,// 自己的分数
    self_reward: number,// 自己的奖励
}
/**钓鱼赛季榜单记录 */
export type FishingRankSettlementRecordInfo = {
    rank_round: number, // 排行榜期数
    pool: number,                         // 结算池
    cost_rank: FishingSubRankSettlementRecordInfo,// 高手榜
    lose_cost_rank: FishingSubRankSettlementRecordInfo,// 空杆榜
    round_count_rank: FishingSubRankSettlementRecordInfo,//幸运榜
}
//钓鱼日志数据
export type SFishingLogData = {
    code: number,
    query_type: number,
    page_index: number,
    page_size: number,//一页长度
    page_last_index: number,//最后页的下标
    total_count: number,//日志总数
    player_records: SFishingLogItemData[];//日志列表
    round_records: SFishingRoundRecordData[];//回合记录列表
    frozen_lake_record: SFishingFrozenLogData[];//冰封日志列表
    rank_settlement_record: FishingRankSettlementRecordInfo[];//幸运奖池记录
}
/**商品数据 */
export type SFishingShopItem = {
    id: number,               // 商品ID
    available_amount: number, // 商品可用数量
    fish_score_price: number, // 钓鱼积分价格
    currency_price: number, // 彩虹币价格
    item: SPlayerDataItem,// 商品
}
/**钓鱼商品数据返回 */
export type SFishingShopGetContentRet = {
    code: number,
    refresh_time: number, // 下次刷新时间
    fish_score: number,   // 购买后的钓鱼积分
    new_item: SPlayerDataItem;//获得商品
    shop_items: SFishingShopItem[],//商品信息

}
// 出售鱼类商品
export type SFishingSellFishItem = {
    item_id_list: number[], // 出售的鱼类商品ID
}
/**出售鱼类商品返回 */
export type SFishingSellFishItemRet = {
    code: number,
}
export type SFishingRankPlayerInfoData = {
    player_id: string,
    name: string,
    score: number,
    rank?: number,
}
/**钓鱼排行榜数据 */
export type SFishingRankInfoData = {
    reward_pool: number,       // 奖励池
    rank_size: number,         // 排行榜总人数
    estimated_rewards: number, //  预估奖励
    self_ranking: number,      // 个人排名
    top_rank_players: SFishingRankPlayerInfoData[],//排行榜前几名
}

/**钓鱼排行榜数据 */
export type SFishingRankQueryRet = {
    code: number,
    rank_round: number,// 排行榜期数
    rank_reward_pool: number, // 排行榜奖励池
    refresh_time: number,//排行榜结算时间
    cost_rank: SFishingRankInfoData,      // 投入排行榜
    lose_cost_rank: SFishingRankInfoData, // 输掉投入排行榜
    round_count_rank: SFishingRankInfoData,    // 回合次数排行榜
    match_rank: SFishingRankInfoData,    //赛季排行榜
}
/**钓鱼赛季排行榜*/
export type SFishingMatchInfoRet = {
    code: number,
    current_match: SFishingMatchInfoData;
    next_match: SFishingMatchInfoData;
}

/**钓鱼赛季排行榜数据 */
export type SFishingMatchInfoData = {
    MatchID: number,//赛季id
    StartTime: number,//开始时间
    CloseTime: number,//关闭时间
    EddTime: number,//结算时间
}
/**钓鱼角色数据 */
export type SFishingHeroData = {
    id: number,//角色id
    parts: SFishingHeroPartData[],//装备列表
    effective_skills: { [key: string]: SFishingHeroSkillEffect },// 生效技能
    activate_end_time: number,//激活结束时间
}
/**钓鱼角色装备数据 */
export type SFishingHeroPartData = {
    slot_id: number,//装备槽id
    part_id: number,//装备id
    level: number,//装备等级 0 为未解锁
    upgrade: number, //升级进度
}
/**钓鱼装备技能 */
export type SFishingHeroSkillEffect = {
    skill_type: number,//装备技能类型
    value: number,//装备技能值
}
/**运鱼状态 */
export type SFishingTradeStateData = {
    round: number, //当前回合数
    player: SFishingTradePlayerStateData,//运鱼数据
    session_info: SFishingTradeSessionInfo,//当前场次信息
    ship: SFishingTradeShipData[],//船只信息
    round_info: SFishingTradeRoundInfo,//最近的回合信息
    settlement: FishingTradePlayerSettlementData,// 结算信息
}
//运鱼数据
export type SFishingTradePlayerStateData = {
    fatigue: number,     // 疲劳
    fatigue_max: number, // 疲劳上限
    ship_id: number,     // 船只ID
    is_hit: boolean,      // 是否击中
    round_cost: number,  // 本回合已投入
    daily_cost: number,  // 今日已投入
}
/**运鱼场次 */
export type SFishingTradeSessionInfo = {
    start_time: number,//开始时间
    end_time: number,//结束时间
    is_open: number,//是否开启
    kill_type: number,//击杀类型
}
/**运鱼最新回合数据 */
export type SFishingTradeRoundInfo = {
    round: number, //场次
    start_time: number,//开始时间
    departure_time: number,//出发时间
    settlement_time: number,//结算时间
    end_time: number,//结束时间
    is_open: boolean,// 已开启
    is_departure: boolean,  // 已出发
    is_settlement: boolean, // 已结算
    kill_type: number,//击杀类型
}
// 运鱼奖励信息
export type FishingTradePlayerSettlementData = {
    round: number,
    cost: number,// 回合投入
    fatigue_get: number,// 疲劳回复
    fatigue_lose: number,// 疲劳损失
    cost_get: number,// 投入回收
    cost_lose: number,// 此回合的损失
    fish_items: SFishingItem[],// 获得的鱼
    fish_score_get: number,//钓鱼积分/鱼票
    time: number,// 结算时间
    is_win: boolean,// 是否胜利
}
/**运鱼渔船数据 */
export type SFishingTradeShipData = {
    ship_id,//渔船id
    is_kill: boolean,//是否被击杀
    cost: number,// 已装船重量
    player_count: number,// 当前船只玩家数
}
// 运鱼回合结算记录 (全局状态)
export type SFishingTradeRoundSettlementRecordData = {
    _id: string,
    round: number,         // 回合
    kill_ship_list: number[],// 击杀的船只
    ship_cost: object, // 船只投入
    start_time: number,
    end_time: number,
}
// 运鱼玩家结算记录
export type SFishingTradePlayerSettlementRecordData = {
    _id: string,
    round: number,// 回合
    player_id: string,
    start_time: number,
    end_time: number,
    cost: number,// 投入
    cost_get: number,// 投入回收
    cost_lose: number,// 此回合的损失
    fatigue_cost: number,// 疲劳花费
    fatigue_get: number,// 疲劳回复
    ship_id: number,// 船只ID
    fish_item: SFishingItem[],// 获得的鱼
    fish_score_get: number, // 获得的积分
    kill_ship_list: number[],//被击杀船只
}
// 运鱼当天投入排行榜
export type SFishingTradeRankPlayerInfoData = {
    player_id: string,
    name: string,
    score: number,
    time: number,
}
// 掠夺玩家信息
export type SMatchPlayerData = {
    player_id: string,//玩家ID
    match_count: number,//匹配次数
    paid_refresh_count: number,//刷新次数
    remaining_defense_count: number,//防守次数
    match_duration: SFishingItem[],//匹配次数
    match_cd_end_time: number,//匹配cd剩余时间
    has_shield: boolean,//是否有盾
    shield_end_time: number,//盾结束时间
    score: number,//分数
    defense_end_time: number,//分数
    is_use_item,//是否使用道具
}
// 掠夺玩家信息
export type SCurrentSeasonInfo = {
    season_id: number,//玩家ID
    status: string,//赛季状态
    is_settled: boolean,//
    currency: number,//当前
    currency_74: number,
    wood: number,//木头
    water: number,//水
    rock: number,//石头
    seed: number,//种子
    start_time: number,//开始时间
    end_time: number,//结束时间
    score: number,//分数
    rank: number,//排行
    all_player?: number,//总人数
    rank_list?: SLootRankInfo[]
}
// 掠夺记录玩家信息
export type SOpponentInfo = {
    player_id: number,//玩家ID
    name: string,//名字
    icon_url: string,//头像
    battle_power: number,//战力
}
// 掠夺记录战斗信息
export type SPlunderRecord = {
    plunder_data: SBattlePlunderData,//战斗数据
    score: number,//分数
    has_revenged: boolean,//是否复仇
}
// 掠夺记录战斗信息
export type SBattlePlunderData = {
    battle_id: string,//战斗ID
    attacker_player_id: string,//攻击方ID
    defender_player_id: string,//防守方ID
    attacker_battle_data: SBattleData,//攻击方战斗数据
    defender_battle_data: SBattleData,
    process: any,//战斗过程
    result: any,//战斗结果
    create_time: number,//创建时间
    start_time: number,//开始时间
    status: string,
    revenge_battle_id: string,
    is_revenge: boolean,
    version: string,
}
export type SBattleData = {
    attack_lineup: SBattleRole[],
    buildings: SPlayerDataBuilding[],
    currency: number,
    defense_lineup: SPlayerDataBuilding[],
    homeland_id: number,
    homeland_level: number,
    player_icon_url: string,
    player_id: string,
    player_name: string,
    rock: number,
    roles: SPlayerDataRole[];
    seed: number,
    water: number,
    wood: number,
}
export type SPlunderRecordData = {
    has_revenged: boolean,
    plunder_data: SBattlePlunderData,
    score: number,
    defender_score: number,
}
//掠夺记录信息
export type SQueryPlunderRecordData = {
    opponent_info_list: SOpponentInfo[],
    plunder_record_data: SPlunderRecordData[],
    total_count: number,
}
//商品数结构
export type SShopItem = {
    id: number,// 商品ID
    sell_things: SThings,// 商品
    price_things: SThings,// 价格
    original_things: SThings,// 原价
    count: number,// 可购买次数
    count_max: number,// 最大购买次数
    order: number,// 显示排序
    expiration_time: number,// 过期时间
    rand_index: number,//商品原始下标
    whole_amount: number, //全局限购次数
    whole_amount_max: number, //全局限购最大次数
    isAdItem?: boolean;//是否广告商品
    start_buy_time: number;//开始购买时间
    end_buy_time: number;//结束购买时间
}
//抽奖商店数据结构
export type SLuckyContent = {
    lucky_id: number,// 抽奖ID
    name: string,// 奖池名称
    freex1_count: number,// 单抽免费次数
    freex1_refresh_update: number,// 单抽免费刷新时间
    freex10_count: number,//十抽免费次数
    freex10_refresh_update: number,// 十抽免费刷新时间
    frequency: number, //剩余抽奖次数
    frequency_max: number,//最大抽奖次数
    frequency_next_update: number,//抽奖次数刷新时间
    ad_count: number,// 广告次数
    ad_count_max: number,//最大广告次数
    ad_refresh_update: number,//广告次数刷新时间
    pricex1_things: SThings,// 单抽价格
    pricex10_things: SThings,// 十抽价格
    convert_price_things: SThings,//兑换物品价格
    banner: string,// 抽奖banner (客户端显示)
    lucky_items: SThings,// 奖励预览
    get_number: number,//必中剩余次数
    do_count: number,//当天抽取次数
}
//抽奖商店数据结构
export type SShopContent = {
    shop_id: number,// 商店ID
    name: string,// 商店名称
    refresh_time: number,// 下次刷新时间
    open_time: number,// 开启时间
    expiration_time: number,// 过期时间
    manual_price: SThings,// 手动刷新价格
    manual_count: number,// 手动刷新剩余次数
    shop_items: SShopItem[],// 商品列表
    ad_shop_items: SShopItem[],//广告商品信息
}
//商店数据
export type SShopIndexContent = {
    shop_index_id: number,//商店索引ID
    type_id: number,//商店类型ID
    shop?: SShopContent,// 普通商店
    lucky?: SLuckyContent,// 抽奖商店
}
//商店数据
export type TipsType = {
    type: string,
    content: string,
    icon: string,
    speed: number
}
/**
 * 公告数据
 */
export type NoticeData = {
    appId: string,//应用id
    categoryId: string, //公告分类
    content: string, //内容（富文本）
    coverImage: string,// 封面图
    displayDuration: number,// 显示时长，单位：小时
    id: number,
    isPinned: boolean,//是否置顶 
    pushDelay: number,// 
    pushFrequency: number,//推送频率，单选
    pushTimeType: number,//推送时间类型，单选
    scheduledTime: string,//定时推送时间，精确到分钟
    state: number,//上下架状态，1上架
    summary: string, //简介
    title: string,//标题
    updatedAt: string,//最近修改时间
    updateAtUnix: number,//公告创建时间
}
/**
 * 玩家本地数据
 */
export type PlayerLocalData = {
    NoticeCheckCode?: string,//公告校验码
}
/**
 * 系统频道数据
 */
export type SChannelMsgData = {
    title: string,//消息标题
    cont: string,//消息内容
}

/**玩法说明对应枚举 */
export enum Tips2ID {
    /** 家园抢夺*/
    HomeLooting = 1,
    /**好友系统 */
    Friend,
    /**探险 */
    Pve,
    /**家园建筑-主基地 */
    HomeJiDi,
    /**家园建筑-兵营 */
    HomeBingYing,
    /**交易所 */
    Trade,
    /**繁育巢 */
    Fanyu,
    /**采集 */
    Collect,
    /**角色 */
    Role,
    /**公会*/
    Guild = 19,
    /**植灵殿堂 */
    Palace = 28,
    /**进化 */
    Jinhua = 29,
    /**洗练 */
    XiLian = 30,
    /**世界boss*/
    WorldBoss = 31,
    /**新春活动说明 */
    newYear = 32,

}
/**
 * 设置数据
 */
export type SSettingData = {
    bgmIsOpen: boolean,//背景音乐是否开启
    soundIsOpen: boolean,//生效是否开启
}

export type SAdvister = {
    id: number,//广告id
    count: number,//剩余可看广告次数
    cdEndTime: number,//冷却时间

}
/**一次性记录条件数据 */
export type SOneOffRedPoint = {
    id: number,//检测功能id
    isCheck: boolean,//是否检查过数据
    redPointVal: boolean,//是否有红点
}

/**权益卡数据 */
export type SBenefit = {
    benefit_card: SPlayerBenefitCard,
    benefit_card_can_claim: { [key: number]: boolean },
    all_equities: { [key: number]: boolean },

}

/**权益卡 */
export type SPlayerBenefitCard = {
    cards: { [key: number]: number },
    claimed_today: boolean,
}
/**玩法说明对应枚举 */
export enum SRankType {
    /**战力排行榜*/
    Fight = 1,
    /**等级排行榜*/
    Level,
    /**关卡排行榜*/
    CustomsPass,
    /**角色排行榜 */
    Role,
    /**货币排行榜 */
    Currency,
}
/**
 * 排行数据
 */
export type SRankData = {
    player_id: string,//玩家id
    name: string, //名字
    icon_url: string, //头像
    battle_power: number,// 战力
    progress: number, //关卡
    level: number,//等级
    platform_id?: string,// 平台id
    rank?: number,
    role_type?: number,
    quality?: number,
    passive_skills?: SPlayerDataSkill[],
    currency?: number
}
/**公会成员信息 */
export type SGuildMember = {
    player_id: string,//成员id
    name: string,//成员名称
    level: number,//等级
    battle_power: number,//战力
    role: number,// 成员类型, 见配置表
    message: string,//留言
    join_time: number,//加入事件
    appointed_by: string,
}
/**公会公告 */
export type SGuildAnnouncement = {
    content: string,//公告内容
}
// 公会申请审批条件
export type SGuildJoinCriteria = {
    need_applications: number,//是否需要审核
    min_home_level: number,// 最低家园等级
}
/**公会数据 */
export type SGuild = {
    guild_id: string//公会id
    type: number, //公会类型
    name: string,// 公会名称
    level: number,//等级等级
    exp: number, //公会经验
    logo: string, //logoId
    announcement: SGuildAnnouncement,// 公会公告
    join_criteria: SGuildJoinCriteria, //加入公会条件
    leader_info: SGuildMember,//会长信息
    member_count: number,//成员数量
    name_changed: number,//已改名次数
    members: { [key: string]: SGuildMember },//成员列表
}
/**公会事件数据 */
export type SGuildEvent = {
    guild_id: string,    // 公会ID
    player_id: string,   // 事件发起者
    event_type: number,//事件类型
    event_args: string[],// 事件参数
    time: number,// 事件发生时间
}
export enum ApplicationStatus {
    pending = "pending",  // 待审核
    approved = "approved", // 已通过
    rejected = "rejected", // 已拒绝
}
/**公会事件类型定义 */
export enum GuildEventType {
    EventType_1 = 1,//创建公会
    EventType_2,//成员加入公会
    EventType_3,//成员离开公会
    EventType_4,//职位变更
    EventType_5,//公会升级
    EventType_6,//捐献记录
    EventType_7,//	踢出公会
}
/**公会申请数据 */
export type SGuildApplication = {
    _id: string,//
    guild_id: string,//公会id
    player_id: string,//申请者id
    name: string,//申请者名称
    level: number,//申请者等级
    battle_power: number,//申请者战力
    time: number,//申请时间
    message: string,//申请者心情留言
}

/**公会银行储蓄数据 */
export type SDeposit = {
    id: string,//储蓄id
    guild_id: string,    // 公会ID
    user_id: string,   //玩家id
    donate_id: string,//储蓄配置id
    cost_type: number,//储蓄货币类型
    amount: number,//储蓄货币数量
    duration_days: number,//储蓄天数
    interest_total: number,//当前利息
    status: string,//储蓄状态 active 激活 withdrawn已提取
    expiration_time: number,//储蓄到期时间
    deposit_time: number,//储蓄开始时间
    withdraw_time: number,//取款时间
    guild_name: number,//公会名称
    user_name,//用户名称
}

/**公会银行数据 */
export type SGuildDepositTotal = {
    _id: string,//储蓄id
    guild_id: string,    // 公会Id
    cost_type: number,//储蓄货币类型
    total_amount: number,//储蓄货币总额
    total_record: number,//储蓄此类货币人数
}

/**查看玩家数据 */
export type SPlayerViewInfo = {
    player_id: string,//玩家id
    name?: string,//玩家名称
    icon_url?: string,//玩家头像
    avatar_url?: string,//玩家头像框
    level?: number,//玩家等级
    battle_power?: number,//玩家战力
    is_online?: number,//是否在线 0不在 1 在
    guild_message?: string,//公会心情留言
    contact_wechat?: string,//微信号
    contact_qq?: string,//QQ号
}
/**掠夺赛季报名状态*/
export enum LootSeasonApplyState {
    /**无 */
    Type_0 = 0,
    /**未报名赛季进行中 */
    Type_1,
    /**未报名赛季未开始*/
    Type_2,
    /**已报名赛季进行中*/
    Type_3,
    /**已报名赛季未开始*/
    Type_4,
}
/**掠夺赛季申请信息 */
export type SLootSeasonApplyInfo = {
    currentSeasonId: number,//当前赛季id
    enrolledSeasonId: number,//报名赛季id
    open: boolean,//是否已报名
}
/**pvp商品数据返回 */
export type SPvpShopGetContentRet = {
    code?: number,
    refresh_time: number, // 下次刷新时间
    score: number,   // 购买后的积分
    new_item: SPlayerDataItem;//获得商品
    shop_items: SPvpShopItem[],//商品信息

}
/**pvp商品数据 */
export type SPvpShopItem = {
    id: number,               // 商品ID
    available_amount: number, // 商品可用数量
    score_price: number, // 钓鱼积分价格
    currency_price: number, // 彩虹币价格
    item: SPlayerDataItem,// 商品
}
/**流水数据 */
export type SQueryThing = {
    record_id: string;//流水唯一id
    player_id: string,//玩家id
    count: number,//数量
    data: string,//
    source: number,//流水来源id
    time: number,//流水产生时间
    type1: number,//货币事物类型1
    type2: number,//货币事物类型2
}
/**个人银行数据 */
export type SBank = {
    id: string,//储蓄id
    user_id: string,//用户id
    donate_id: string,//储蓄方案id
    cost_type: number,//储蓄货币类型
    amount: number,//储蓄货币数量
    duration_days: number,//储蓄天数
    settle_days: number,//已返还天数
    settle_total: number,//已经返还数量
    status: string,//存款状态
    expiration_time: number,//到期时间
    deposit_time: number,//存款时间
    last_settle_time: number,//最近一笔返还时间
    user_name: string,//用户名称
}
/**个人银行数据 */
export type SBankTotal = {
    id: string,//储蓄id
    donate_id: number,//储蓄方案id
    total_amount: number,//储蓄货币总数量
    total_record: number,//储蓄总笔数
}
/**今日不在提示id定义 */
export enum TodayNoTipsId {
    BattleUnder = 1,  //战斗上阵人数不足
    ZidongShangbing,  //自动带兵
}
// 玩家炸鱼数据
export type SFishingBombPlayerStateData = {
    fatigue: number,// 疲劳
    fatigue_max: number// 疲劳上限
    fish_pool_id: { [key: number]: number },//选择的池塘id map
    round_cost: { [key: number]: number },// 回合已投入map
    daily_cost: number,// 今日总投入
    is_alive: boolean,//是否存活
    odds_index: number,// 倍率索引
}
//炸鱼场次数据
export type SFishingBombSessionInfo = {
    start_time: number,//开始时间
    end_time: number,//结束时间
    is_open: boolean,//是否开启
    stage_type: number,
}
//炸鱼池塘数据
export type SFishingBombFishPoolData = {
    fish_pool_id: number,//池塘id
    is_kill: boolean,   // 是否被击杀
    cost: number,         // 投入
    player_count: number, // 当前池塘玩家数
}
//炸鱼小回合信息
export type SFishingBombStageInfo = {
    stage_id: number, //小回合ID
    start_time: number,//小回合开始时间
    ignite_time: number,//点燃时间
    settlement_time: number,//结算时间
    fish_pool: { [key: number]: SFishingBombFishPoolData }// 池塘信息map
}

//炸鱼当前回合信息
export type SFishingBombRoundInfo = {
    round: number,            // 场次
    start_time: number,       // 场次开始
    end_time: number,         // 场次结束
    is_open: boolean,         // 已开启
    stage_type: number,       // 回合模式
    stage_index: number,      // 当前小回合
    stages: { [key: number]: SFishingBombStageInfo }// 所有子回合信息map
    settle_pool: number,//结算池
}
//炸鱼决算信息
export type SFishingBombSettlementData = {
    round: number,
    cost: number,                     // 回合投入
    fatigue_get: number,       // 疲劳回复
    fatigue_lose: number,     // 疲劳损失
    fish_score_get: number, // 积分
    cost_get: number,             // 投入回收
    cost_lose: number,           // 此回合的损失
    fish_items: SFishingItem[]         // 获得的鱼
    time: number,                     // 结算时间
    is_win: boolean,                 // 是否胜利
    pool_id: number,               // 池塘ID
    odds_index: number,// 倍率索引
    odds: number,// 生效倍率 (赢了才有值)
    next_game_open: boolean,//是否还有下局
}
/**炸鱼状态 */
export type SFishingBombStateData = {
    round: number,//当前回合数
    player: SFishingBombPlayerStateData//玩家数据
    session_info: SFishingBombSessionInfo,//当前场次信息
    round_info: SFishingBombRoundInfo,//当前回合信息
    settlement: SFishingBombSettlementData;//结算数据
}
//炸鱼玩家日志
export type SFishBombLogItemData = {
    _id: string;
    round: number,// 回合
    player_id: string,
    start_time: number,
    end_time: number,
    cost: number,// 投入
    cost_get: number,// 投入回收
    cost_lose: number,// 此回合的损失
    fatigue_cost: number,// 疲劳花费
    fatigue_get: number,// 疲劳回复
    fish_pool_id: { [key: number]: number },// 选择的池塘
    fish_pool_cost: { [key: number]: number },//池塘投入
    fish_item: SFishingItem[],// 获得的鱼
    fish_score_get: number,// 获得的积分
    kill_pools: { [key: number]: number[] },// 击杀的池子
    is_win: boolean,// 是否胜利
    odds_index: number,// 倍率索引
    odds: number,// 生效倍率 (赢了才有值)
    is_send_reward: boolean,//是否已发奖励
}
//炸鱼子回个日志
export type SFishBombStageLogData = {
    cost: number,
    kill_pool_list: number[],
}
//炸鱼结算记录 (全局状态)
export type SFishBombRoundLogData = {
    _id: string,
    round: number, // 回合
    start_time: number,
    end_time: number,
    stages: { [key: number]: SFishBombStageLogData } // 所有子回合信息
}
//炸鱼日志数据
export type SFishBombLogDataRet = {
    code: number,
    query_type: number,
    player_records: SFishBombLogItemData[];//日志列表
    round_records: SFishBombRoundLogData[];//回合记录列表
}
/**世界boss伤害玩家数据 */
export type SPlayerBossData = {
    free: number,//已使用挑战次数
    times: number,//剩余挑战次数
    paid_times: number,//已购买挑战次数
}
/**世界boss伤害前三玩家数据 */
export type SWorldBossTop3Hurt = {
    player_id: string,
    player_name: string,
    harm: number,//伤害值
}
//世界Boss基础数据
export type SWorldBossUpdateData = {
    BossType: number,//boss类型
    BattlePower: number,//boss战力
    HP: number,//booss剩余血量
    Terminator: string,//终结者
}
export type SWorldBossBaseData = {
    terminator: string,//击杀者名称
    settle: number,//击杀时间
    start: number,//boss开始时间
    end: number,//boss结束时间
    boss_type: number,//boss类型
    boss_lv: number,//boss等级
    HP: number,//boss当前血条
    max_HP: number,//boss最大血量
    r: number,//boss回合数
}
export type SWorldBossStateData = {
    code: number,
    base: SWorldBossBaseData,
    reward_status: number,//0-未领取 1-已领取 需要根据terminator判断
}
//世界boss数据
export type SWorldBossData = {
    terminator: string,//终结者名称
    settle: number,//击杀时间
    start: number,//boss开始时间
    end: number,//bosse结束时间
    reward_status: number,//boss击杀奖励领取状态 0-未领取 1-已领取 需要根据terminator判断
    boss_type: number,
    name: string,//boss名字
    icon: string,//bossicon
    model: string,//boss展示模型
    HP: number,//boss当前血量
    max_Hp: number,//boss最大血条
    boss_lv: number,//boss等级
    skillList: number[],//技能列表
    attrTypeList: number[],//持有属性类型
    attrValueList: number[],//持有属性值
    roundId: number,//回合id
    desc: string,//boss说明
}
//世界Boss排行item榜数据
export type SWorldBossRankItemData = {
    id: string,//玩家id
    name: string,//玩家名字
    harm: number,//玩家累计伤害值
    icon?: string,//
}
//世界Boss排行榜数据
export type SWorldBossRankData = {
    code: number,
    harm: number,//个人累计伤害值
    boss_harm: number,//全服累计伤害值
    rank: number,//我的伤害排名
    t: number,//排行榜获取时间戳
    rank_data_list: SWorldBossRankItemData[],
}
/**世界boss挑战结束 */
export type SWorldBossBattleResult = {
    harm: number,//本场战斗总伤害
    RewardType: number[],//伤害奖励大类
    RewardItemID: number[],//伤害奖励id
    RewardNumber: number[],//伤害奖励数量
}
/**世界boss个人伤害记录*/
export type SWorldBossHurtLogData = {
    b: string,
    s: number,//伤害时间
    h: number,//伤害值
}

/**翻牌数据*/
export type SFlipData = {
    fatigue: number,//当前体力
    fatigue_max: number,//最大体力
    daily_cost: number,//当天投入总数
    grand_pool: { [key: string]: number };//池子数据
}

/**翻牌抽奖数据 */
export type SFlipGrandPrizeData = {
    reward_count: number,//奖励数量
    is_take_reward: boolean,//是否直接拿走奖励
    prize_type: number,//抽奖类型1普通奖励，2特大奖励
    grand_prize_id: number;//抽奖的id
}

/**翻牌大奖记录 */
export type SFlipPrizeLogData = {
    player_id: string,
    player_name: string,
    time: number,
    reward: number,
}

/**翻牌抽奖获取 */
export type SFlipGetPrizeData = {
    reward_count: number,//奖励数量
    grand_prize_id: number;//抽奖的id
}
// 翻牌当天投入排行榜
export type SFlipRankPlayerInfoData = {
    player_id: string,
    name: string,
    score: number,
    time: number,
}
