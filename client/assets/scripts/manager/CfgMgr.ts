import { JsonAsset, Vec3, assetManager, js, path, primitives } from "cc";
import { ResMgr, quality_color } from "./ResMgr";
import { IsArray } from "../utils/Utils";
import { AttrSub, ConditionSub } from "../module/common/AttrSub";
import { BoostType, SOrderType, SPlayerDataRole, STaskState, SThing, SThingResource } from "../module/roleModule/PlayerStruct";
import { BuildingType } from "../module/home/HomeStruct";
import { GameSet } from "../module/GameSet";
import { DL } from "../DL";
import Logger from "../utils/Logger";

export class CfgMgr {
    private static data: Object = {};
    private static homeMap: Object = {};
    private static skillJson: object;
    private static skillAction: object;
    private static skillBox: object;
    private static skillEffect: object;
    private static skillBullet: object;
    private static skillSound: object;
    private static skillShake: object;
    private static skillAffect: object;
    private static battleData: object;

    private static skillSet: any;

    private static skillSet_hc: any;
    private static data_hc: Object = {};
    private static homeMap_hc: Object = {};
    private static skillJson_hc: object;
    private static skillAction_hc: object;
    private static skillBox_hc: object;
    private static skillEffect_hc: object;
    private static skillBullet_hc: object;
    private static skillSound_hc: object;
    private static skillShake_hc: object;
    private static skillAffect_hc: object;
    private static battleData_hc: object;

    private static skillSet_xf: any;
    private static data_xf: Object = {};
    private static homeMap_xf: Object = {};
    private static skillJson_xf: object;
    private static skillAction_xf: object;
    private static skillBox_xf: object;
    private static skillEffect_xf: object;
    private static skillBullet_xf: object;
    private static skillSound_xf: object;
    private static skillShake_xf: object;
    private static skillAffect_xf: object;
    private static battleData_xf: object;

    static async Load() {
        let resAb = assetManager.getBundle("res");

        // 一家园
        let asset = await ResMgr.LoadResAbSub("config/cfg", JsonAsset);
        let skillAsset = await ResMgr.LoadResAbSub("config/skill/skill", JsonAsset);

        this.skillSet = skillAsset;
        this.skillJson = skillAsset ? skillAsset.json.skill : {};
        this.skillAction = skillAsset ? skillAsset.json.action : {};
        this.skillBox = skillAsset ? skillAsset.json.box : {};
        this.skillBullet = skillAsset ? skillAsset.json.bullet : {};
        this.skillEffect = skillAsset ? skillAsset.json.effect : {};
        this.skillShake = skillAsset ? skillAsset.json.shake : {};
        this.skillSound = skillAsset ? skillAsset.json.sound : {};
        this.skillAffect = skillAsset ? skillAsset.json.affect : {};
        this.data = asset.json;

        let files = resAb.getDirWithPath("config/home");
        for (let file of files) {
            let skillAsset = await ResMgr.LoadResAbSub(file.path, JsonAsset);
            let skillName = path.basename(file.path);
            this.homeMap[skillName] = skillAsset.json;
        }
        this.battleData = {};
        files = resAb.getDirWithPath("battle/config");
        for (let file of files) {
            let config = await ResMgr.LoadResAbSub(file.path, JsonAsset);
            let mapName = path.basename(file.path);
            this.battleData[mapName] = config.json;
        }

        // 二家园
        let asset_hc = await ResMgr.LoadResAbSub("config_hc/cfg", JsonAsset);
        let skillAsset_hc = await ResMgr.LoadResAbSub("config_hc/skill/skill", JsonAsset);

        this.skillSet_hc = skillAsset_hc;
        this.skillJson_hc = skillAsset_hc ? skillAsset_hc.json.skill : {};
        this.skillAction_hc = skillAsset_hc ? skillAsset_hc.json.action : {};
        this.skillBox_hc = skillAsset_hc ? skillAsset_hc.json.box : {};
        this.skillBullet_hc = skillAsset_hc ? skillAsset_hc.json.bullet : {};
        this.skillEffect_hc = skillAsset_hc ? skillAsset_hc.json.effect : {};
        this.skillShake_hc = skillAsset_hc ? skillAsset_hc.json.shake : {};
        this.skillSound_hc = skillAsset_hc ? skillAsset_hc.json.sound : {};
        this.skillAffect_hc = skillAsset_hc ? skillAsset_hc.json.affect : {};
        this.data_hc = asset_hc.json;

        let files_hc = resAb.getDirWithPath("config_hc/home");
        for (let file of files_hc) {
            let skillAsset = await ResMgr.LoadResAbSub(file.path, JsonAsset);
            let skillName = path.basename(file.path);
            this.homeMap_hc[skillName] = skillAsset.json;
        }
        this.battleData_hc = {};
        files_hc = resAb.getDirWithPath("battle_hc/config");
        for (let file of files_hc) {
            let config = await ResMgr.LoadResAbSub(file.path, JsonAsset);
            let mapName = path.basename(file.path);
            this.battleData_hc[mapName] = config.json;
        }

        // 先锋服
        let asset_xf = await ResMgr.LoadResAbSub("config_xf/cfg", JsonAsset);
        let skillAsset_xf = await ResMgr.LoadResAbSub("config_xf/skill/skill", JsonAsset);

        this.skillSet_xf = skillAsset_xf;
        this.skillJson_xf = skillAsset_xf ? skillAsset_xf.json.skill : {};
        this.skillAction_xf = skillAsset_xf ? skillAsset_xf.json.action : {};
        this.skillBox_xf = skillAsset_xf ? skillAsset_xf.json.box : {};
        this.skillBullet_xf = skillAsset_xf ? skillAsset_xf.json.bullet : {};
        this.skillEffect_xf = skillAsset_xf ? skillAsset_xf.json.effect : {};
        this.skillShake_xf = skillAsset_xf ? skillAsset_xf.json.shake : {};
        this.skillSound_xf = skillAsset_xf ? skillAsset_xf.json.sound : {};
        this.skillAffect_xf = skillAsset_xf ? skillAsset_xf.json.affect : {};
        this.data_xf = asset_xf.json;

        let files_xf = resAb.getDirWithPath("config_xf/home");
        for (let file of files_xf) {
            let skillAsset = await ResMgr.LoadResAbSub(file.path, JsonAsset);
            let skillName = path.basename(file.path);
            this.homeMap_xf[skillName] = skillAsset.json;
        }
        this.battleData_xf = {};
        files_xf = resAb.getDirWithPath("battle_xf/config");
        for (let file of files_xf) {
            let config = await ResMgr.LoadResAbSub(file.path, JsonAsset);
            let mapName = path.basename(file.path);
            this.battleData_xf[mapName] = config.json;
        }

        this.changeAryToMap();
    }
    protected static changeAryToMap(type = 0) {
        this.aryToMap("homeland_building", "BuildingId", type);
        this.aryToMap("role_type", "RoleType", type);
        this.aryToMap("compound_building", "CompoundTimes", type);
        this.aryToMap("skillAffect", "Id", type);
        this.aryToMap("skillEffect", "Id", type);
        this.aryToMap('AttrFight', "ID", type);
        this.aryToMap('Attr', "ID", type);
        this.aryToMap('Level', 'ID', type);
        this.aryToMap('Monster', 'ID', type);
        this.aryToMap('skillAttr', 'Id', type);
        this.aryToMap('fish_item', 'FishsId', type);
        this.aryToMap('text', "Id", type);
        this.aryToMap('step', "Step", type);
        this.aryToMap('guide', "ID", type);
        this.aryToMap('red_point', "ID", type);
        this.aryToMap('system_open', "ID", type);
        this.aryToMap("fish_shop", "ShopItemID", type);
        this.aryToMap("ShopCommodity", "Id", type);
        this.aryToMap("ShopLuckyPool", "RewardPools", type);
        this.aryToMap("Advister_list", "Ad_ID", type);
    }

    static Reset(json) {
        this.data = json;
        this.changeAryToMap(1);
    }
    static ResetHc(json) {
        this.data_hc = json;
        this.changeAryToMap(2);
    }
    static ResetXf(json) {
        this.data_xf = json;
        this.changeAryToMap(3);
    }

    static InitServerCfg(mark: string) {
        console.log("InitServerCfg", mark);
        if (mark == "_Rlite") {
            let rliteList = CfgMgr.Get("Common_Rlite");
            let commList = CfgMgr.Get("Common");
            commList.length = 0;
            commList.push(...rliteList);
            console.log("InitServerCfg", JSON.stringify(CfgMgr.Get("Common")));

            let Advister_list_Rlite = this.Get("Advister_list_Rlite");
            if (Advister_list_Rlite) this.data["Advister_list"] = Advister_list_Rlite;
            console.log("InitServerCfg", JSON.stringify(this.Get("Advister_list")));
            this.aryToMap("Advister_list", "Ad_ID");

            // AdType_list
            let AdType_list_Rlite = this.Get("AdType_list_Rlite");
            if (AdType_list_Rlite) this.data["AdType_list"] = AdType_list_Rlite;
            console.log("InitServerCfg", JSON.stringify(this.Get("AdType_list")));
        }
    }
    static get version() {
        if (!this.data["Version"] || !this.data["Version"][0]) return 0;
        return this.data["Version"][0].version || 0;
    }

    static InitSystemOpenCfg(content: any) {
        if (!content) return;
        console.log("InitSystemOpenCfg", content);
        content = content.replace(/\'/g, '"');
        let list: StdSystemOpen[];
        try {
            list = JSON.parse(content);
        } catch (e) {
            return;
        }
        if (!list || !list.length) return;
        for (let Std of list) {
            let lockTypes: number[], lockValues: number[];
            for (let n = 1; ; n++) {
                let types = Std['ConditionId' + n];
                let values = Std['ConditionValue' + n];
                if (types && values) {
                    for (let i = 0; i < types.length; i++) {
                        if (types[i] == 0) {
                            lockTypes = [types[i]];
                            lockValues = [values[i]];
                            break;
                        }
                    }
                } else {
                    break;
                }
                if (lockTypes) break;
            }
            if (lockTypes) {
                for (let n = 1; ; n++) {
                    if (Std['ConditionId' + n]) {
                        Std['ConditionId' + n] = lockTypes;
                        Std['ConditionValue' + n] = lockValues;
                    } else {
                        break;
                    }
                }
            }
        }
        this.data["system_open"] = list;
        this.aryToMap('system_open', "ID");
        // console.log("systemopen###", this.Get("system_open"));
    }

    static GetBattleData(battle_type) {
        if (GameSet.Server_cfg?.Mark == "_hc") {
            return this.battleData_hc;
        } else if (GameSet.Server_cfg?.Mark == "_xf") {
            return this.battleData_xf;
        }
        return this.battleData;
    }

    /**
     * 获取技能配置
     * @returns 
     */
    static GetSkills() {
        if (GameSet.Server_cfg?.Mark) {
            let cfg = this["skillJson" + GameSet.Server_cfg?.Mark];
            if (cfg) return cfg;
        }
        return this.skillJson;
    }
    static GetSkillAction() {
        if (GameSet.Server_cfg?.Mark) {
            let cfg = this["skillAction" + GameSet.Server_cfg?.Mark];
            if (cfg) return cfg;
        }
        return this.skillAction;
    }

    static GetSkillBullet() {
        if (GameSet.Server_cfg?.Mark) {
            let cfg = this["skillBullet" + GameSet.Server_cfg?.Mark];
            if (cfg) return cfg;
        }
        return this.skillBullet;
    }
    static GetSkillEffect() {
        if (GameSet.Server_cfg?.Mark) {
            let cfg = this["skillEffect" + GameSet.Server_cfg?.Mark];
            if (cfg) return cfg;
        }
        return this.skillEffect;
    }
    static GetSkillShake() {
        if (GameSet.Server_cfg?.Mark) {
            let cfg = this["skillShake" + GameSet.Server_cfg?.Mark];
            if (cfg) return cfg;
        }
        return this.skillShake;
    }
    static GetSkillSound() {
        if (GameSet.Server_cfg?.Mark) {
            let cfg = this["skillSound" + GameSet.Server_cfg?.Mark];
            if (cfg) return cfg;
        }
        return this.skillSound;
    }
    static GetSkillBox() {
        if (GameSet.Server_cfg?.Mark) {
            let cfg = this["skillBox" + GameSet.Server_cfg?.Mark];
            if (cfg) return cfg;
        }
        return this.skillBox;
    }
    static GetSkillAffect() {
        if (GameSet.Server_cfg?.Mark) {
            let cfg = this["skillAffect" + GameSet.Server_cfg?.Mark];
            if (cfg) return cfg;
        }
        return this.skillAffect;
    }

    static GetSkillAttr() {
        return this.Get("skillAttr");
    }

    static GetSkillPassiveAttr() {
        return this.Get("skillPassive");
    }


    // 带参数的文本组合方法
    static GetText(id, params = {}) {
        const table = this.Get("text");
        if (table.hasOwnProperty(id)) {
            let textTemplate = table[id].Text;
            // 如果提供了参数，则替换模板中的占位符
            if (Object.keys(params).length > 0) {
                for (const key in params) {
                    if (params.hasOwnProperty(key)) {
                        textTemplate = textTemplate.replace(new RegExp(`{${key}}`, 'g'), params[key]);
                    }
                }
            }
            return textTemplate;
        }
        return "";
    }

    /**
     * 获取主动技能配置列表
     * @returns 
     */
    static GetActiveSkillList(): StdActiveSkill[] {
        return this.Get("skill");
    }
    /**
     * 获取主动技能配置
     * @param skillId 主动技能id
     * @param skillLv 主动技能等级
     * @returns 
     */
    static GetActiveSkill(skillId: number, skillLv: number): StdActiveSkill {
        let skillList: StdActiveSkill[] = this.GetActiveSkillList();
        let stdSkill: StdActiveSkill;
        for (let index = 0; index < skillList.length; index++) {
            stdSkill = skillList[index];
            if (stdSkill.SkillId == skillId && stdSkill.SkillType == skillLv) {
                return stdSkill;
            }
        }
        return null;
    }

    /**
 * 获取特效配置
 * @returns 
 */
    static GetEffects() {
        return this.Get("skillEffect");
    }

    /**
    * 获取BUff配置
    * @returns 
    */
    static GetAffects() {
        return this.Get("skillAffect");
    }

    static GetSkillSet(mark?: string) {
        if (mark == "hc") {
            return this.skillSet_hc.json;
        } else if (mark == "xf") return this.skillSet_xf.json;
        return this.skillSet.json;
    }

    /**
     * 获取家园地图
     * @returns 
     */
    static GetHomeMap() {
        if (GameSet.Server_cfg?.Mark) {
            let cfg = this["homeMap" + GameSet.Server_cfg?.Mark];
            if (cfg) return cfg;
        }
        return this.homeMap;
    }
    /**获取建筑配置 */
    static GetHomeLandBuilding(homeId?: number, buildingType?: number) {
        let ls: { [id: number]: StdDefineBuilding } = this.Get("homeland_building");
        let result: StdDefineBuilding[] = [];
        if (homeId == undefined) {
            for (let key in ls) {
                result.push(ls[key]);
            }
        } else {
            for (let key in ls) {
                let building = ls[key];
                if (buildingType == undefined || building.BuildingType == buildingType) {
                    result.push(building);
                }
            }
        }
        return result;
    }

    /**转map */
    private static aryToMap(name: string, key: string, serverType = 0) {
        let cfg = this.data[name];
        if (!serverType || serverType == 1) {
            if (!IsArray(cfg)) {
                console.warn("目标配置已经是map => " + name);
            } else {
                let obj = {};
                for (let i = 0; i < cfg.length; i++) {
                    let child = cfg[i];
                    let k = child[key];
                    if (k == undefined) throw "找不到指定键值 " + name + "->" + key;
                    if (obj[k]) console.warn("检测到重复键值 " + name + "->" + k);
                    obj[k] = child;
                }
                this.data[name] = obj;
            }
        }

        if (!serverType || serverType == 2) {
            cfg = this.data_hc[name];
            if (!IsArray(cfg)) {
                console.warn("目标配置已经是map => " + name);
            } else {
                let obj = {};
                for (let i = 0; i < cfg.length; i++) {
                    let child = cfg[i];
                    let k = child[key];
                    if (k == undefined) throw "找不到指定键值 " + name + "->" + key;
                    if (obj[k]) console.warn("检测到重复键值 " + name + "->" + k);
                    obj[k] = child;
                }
                this.data_hc[name] = obj;
            }
        }

        if (!serverType || serverType == 3) {
            cfg = this.data_xf[name];
            if (!IsArray(cfg)) {
                console.warn("目标配置已经是map => " + name);
            } else {
                let obj = {};
                for (let i = 0; i < cfg.length; i++) {
                    let child = cfg[i];
                    let k = child[key];
                    if (k == undefined) throw "找不到指定键值 " + name + "->" + key;
                    if (obj[k]) console.warn("检测到重复键值 " + name + "->" + k);
                    obj[k] = child;
                }
                this.data_xf[name] = obj;
            }
        }
    }

    /**获取指定配置 */
    static Get(name: string): any {
        if (GameSet.Server_cfg?.Mark == "_hc") {
            return this.data_hc[name];
        } else if (GameSet.Server_cfg?.Mark == "_xf") {
            return this.data_xf[name];
        } else {
            return this.data[name];
        }
    }
    static GetServerList() {
        return this.data['server_list']
    }

    /**获取家园定义表 */
    static GetHomeLandInit(homeId: number): StdHomeLand {
        let stds: StdHomeLand[] = this.Get("homeland_init");
        for (let std of stds) {
            if (std.HomeId == homeId) return std;
        }
    }
    /**
     * 获取家园建筑解锁表
     * @param buildingId 
     * @param level 
     */
    static GetBuildingUnLock(buildingId: number): StdDefineBuilding {
        return this.Get("homeland_building")[buildingId];
    }

    /**
     * 获取指定类型建筑列表
     * @param homeId 
     * @param type 
     * @returns 
     */
    static GetBuildingDefine(homeId: number, type: number): StdDefineBuilding[] {
        if (this.defBuildings[homeId + "_" + type]) return this.defBuildings[homeId + "_" + type];
        let stds: { [id: number]: StdDefineBuilding } = this.Get("homeland_building");
        let results = [];
        for (let k in stds) {
            let std = stds[k];
            if (std.HomeId == homeId && std.BuildingType == type) results.push(std);
        }
        this.defBuildings[homeId + "_" + type] = results;
        return results;
    }
    private static defBuildings: { [k: string]: StdDefineBuilding[] } = {};

    private static buildinglvMap: { [id: number]: { [level: number]: StdBuilding } } = {};
    /**
     * 获取指定类型建筑列表
     * @param buildingId 
     * @param homeId 
     * @returns 
     */
    public static GetBuildingsById(buildingId: number): { [level: number]: StdBuilding } {
        if (this.buildinglvMap[buildingId]) return this.buildinglvMap[buildingId];
        let lvs: StdBuilding[] = this.Get("BuildingUpgrade");
        for (let obj of lvs) {
            let stds = this.buildinglvMap[obj.BuildingID];
            if (!stds) {
                stds = {};
                this.buildinglvMap[obj.BuildingID] = stds;
            }
            stds[obj.Level] = obj;
        }
        return this.buildinglvMap[buildingId];
    }
    /**获取家园最大等级 */
    public static GetHomeMaxLv(): number {
        let lvMap = this.GetBuildingsById(BuildingType.ji_di);
        let lv: number = 0;
        let std: StdBuilding;
        for (let key in lvMap) {
            std = lvMap[key];
            if (std.Level > lv) lv = std.Level;
        }

        return lv;
    }
    private static maxWorkerNums: { [buildingId: number]: number[] } = {};
    /**
     * 获取建筑最大驻扎数量
     * @param buildingId 
     * @returns 
     */
    static GetMaxWorkerNum(buildingId: number) {
        if (this.maxWorkerNums[buildingId]) return this.maxWorkerNums[buildingId];
        let lvs = this.GetBuildingsById(buildingId);
        let max = [];
        for (let i = 1; ; i++) {
            let lv = lvs[i];
            if (!lv) break;
            let num = lv.WorkingRolesNum;
            while (max.length < num) {
                max.push(i);
            }
        }
        this.maxWorkerNums[buildingId] = max;
        return max;
    }
    private static maxDefenseNums: { [buildingId: number]: number[] } = {};
    /**
     * 获取最大防守数量
     * @param buildingId 
     * @returns 
     */
    static GetMaxDefenseNum(buildingId: number) {
        if (this.maxDefenseNums[buildingId]) return this.maxDefenseNums[buildingId];
        let lvs = this.GetBuildingsById(buildingId);
        let max = [];
        for (let i = 1; ; i++) {
            let lv = lvs[i];
            if (!lv) break;
            let num = lv.DefenseRolesNum;
            while (max.length < num) {
                max.push(i);
            }
        }
        this.maxDefenseNums[buildingId] = max;
        return max;
    }

    /**
     * 根据建筑id获取对应等级的配置
     * @param buildingId 
     * @param lv 
     * @returns 
     */
    static GetBuildingLv(buildingId: number, lv: number) {
        let std = this.GetBuildingUnLock(buildingId);
        if (!std || std.LevelMax < lv) return undefined;
        let lvs = this.GetBuildingsById(buildingId);
        if (lvs) return lvs[lv];
    }

    /**获取角色配置表 */
    static GetRole(): { [id: number]: StdRole } {
        return this.Get("role_type");
    }
    /**
     * 获取角色配置
     * @param type 
     * @returns 
     */
    static GetRoleLevel(type: number, level: number) {
        let stds: StdRoleLevel[] = this.Get("role_level");
        for (let std of stds) {
            if (std.RoleType == type && std.Level == level) return std;
        }
    }
    private static roleMaxLv: Map<number, number> = new Map();
    /**
     * 获取角色最大等级
     * @param type 
     * @returns 
     */
    static GetRoleMaxLevel(type: number): number {
        let maxLv: number = this.roleMaxLv.get(type);
        if (maxLv > 0) return maxLv;
        let stds: StdRoleLevel[] = this.Get("role_level");
        for (let std of stds) {
            this.roleMaxLv.set(std.RoleType, std.Level);
        }
        return this.roleMaxLv.get(type);
    }
    /**
     * 传入经验获取人物等级
     * @param type 
     * @returns 
     */
    static GetRoleExpMaxLevel(type: number, level: number, expNum: number) {
        let stds: StdRoleLevel[] = this.Get("role_level");
        let needExp: number = 0;
        let endLv: StdRoleLevel;
        for (let std of stds) {
            if (std.RoleType == type) {
                if (std.Level >= level) {
                    if (std.ConditionId && std.ConditionId) {
                        let condData: ConditionSub = DL.FormatCondition(std.ConditionId[0], std.ConditionLv[0]);
                        if (condData.fail) {
                            return std;
                        }
                    }
                    if (std.BreakItem && std.BreakItem.length > 0) {
                        return std;
                    } else {
                        needExp += std.Exp | 0;
                        if (needExp > expNum) {
                            return std;
                        }
                    }
                }
                endLv = std;
            }
        }
        return endLv;
    }
    /**
     * 获取角色到目标等级所需经验
     * @param type 
     * @returns 
     */
    static GetRoleTargetLevelMaxExp(type: number, level: number, targetLv: number) {
        let stds: StdRoleLevel[] = this.Get("role_level");
        let needExp: number = 0;
        for (let std of stds) {
            if (std.RoleType == type && std.Level >= level && std.Level < targetLv) {
                needExp += std.Exp | 0;
            }
        }
        return needExp;
    }

    static set setText(val: string) {

    }
    /**
     * 获取角色基础属性
     * @param type 
     * @param level 
     * @param attrId 
     * @returns 
     */
    static GetRoleAttr(type: number, level: number, attrId: number) {
        let std = this.GetRoleLevel(type, level);
        let index = std.Attr.indexOf(attrId);
        if (index != -1) return std.AttrValue[index];
        return 0;
    }

    /**
     * 获取角色战斗属性
     * @param type 
     * @param level 
     * @param attrId 
     * @returns 
     */
    static GetRoleFightAttr(type: number, level: number, attrId: number) {
        let std = this.GetRoleLevel(type, level);
        let index = std.AttrFight.indexOf(attrId);
        if (index != -1) return std.AttrFightValue[index];
        return 0;
    }

    /**获取战斗属性 */
    static GetFightAttr(): { [id: number]: StdAttr } {
        return this.Get("AttrFight");
    }
    /**获取基础属性 */
    static GetAttr(): { [id: number]: StdAttr } {
        return this.Get("Attr");
    }

    static GetCompound() {
        return this.Get("compound_building");
    }

    /**
     * 获取道具配置
     * @param id 
     * @returns 
     */
    static Getitem(id: number): StdItem {
        let cfg = this.Get("Item");
        let item = null;
        for (let index in cfg) {
            if (cfg[index].Items == id) {
                item = cfg[index];
                break;
            }
        }
        return item;
    }

    /**
     * 获取可赠送道具配置
     * @param id 
     * @returns 
     */
    static GetCanSenditem(): StdItem[] {
        let cfg = this.Get("Item");
        let item = [];
        for (let index in cfg) {
            if (cfg[index].Givetype == 1) {
                item.push(cfg[index]);
            }
        }
        return item;
    }

    /**
     * 获取关卡配置信息
     * @param id 
     * @returns 
     */
    static GetLevel(id: number): StdLevel {
        let cfg = this.Get("Level");
        if (!cfg.hasOwnProperty(id)) return;
        let leveltable: StdLevel = cfg[id];
        let info: StdLevel = {
            ID: leveltable.ID,
            Name: leveltable.Name,
            ConditionId: leveltable.ConditionId,
            ConditionValue: leveltable.ConditionValue,
            Chapter: leveltable.Chapter,
            ChapterName: leveltable.ChapterName,
            LevelID: leveltable.LevelID,
            RewardType: leveltable.RewardType,
            Map: leveltable.Map,
            RewardID: leveltable.RewardID,
            RewardNumber: leveltable.RewardNumber,
            SweepPower: leveltable.SweepPower,
            sweepType: leveltable.sweepType,
            sweepID: leveltable.sweepID,
            sweepNumber: leveltable.sweepNumber,
            ItemAttrSub: DL.FormatRewards(leveltable),
            Monsters: [],
            LevelType: leveltable.LevelType,
            Power: leveltable.Power,
        }

        info.Monsters.push(leveltable.Position1);
        info.Monsters.push(leveltable.Position2);
        info.Monsters.push(leveltable.Position3);
        info.Monsters.push(leveltable.Position4);
        info.Monsters.push(leveltable.Position5);

        return info;
    }
    /**根据战力帅选已通关可扫荡关卡 */
    static GetSaoDangLevel(id: number, curPower: number): StdLevel {
        let cfg = this.Get("Level");
        let curId: number = id;
        let curSdt: StdLevel = null;
        for (curId; curId >= 1; curId--) {
            curSdt = cfg[curId];
            if (curPower >= curSdt.SweepPower) {
                return curSdt;
            }
        }
        return null;
    }

    /**根据战力选最高可扫荡关卡或最高可探险关卡 type： 1最高探险，2 最高扫荡 */
    static GetSaoDangMaxLevel(curPower: number, type: number): string {
        let cfg = this.Get("Level");
        for (const id in cfg) {
            let curId = parseInt(id)
            if (type == 1) {
                if (cfg[id].ConditionValue[1] > curPower) {
                    let backId = curId - 1;
                    return backId.toString();
                }
            } else {
                if (cfg[id].SweepPower > curPower) {
                    let backId = curId - 1;
                    return backId.toString();
                }
            }
        }
        return null;
    }

    static GetLevelCountByChapter(chapter: number) {
        let cfg = this.Get("Level");
        let count = 0;
        for (let id in cfg) {
            if (cfg[id].Chapter == chapter) count++;
        }
        return count;
    }

    static GetChapterInfo() {
        let config = {};
        config["chaptersName"] = {};
        config["levels"] = []
        let chapter = 1;
        let cfg = this.Get("Level");
        for (let id in cfg) {
            config["levels"].push(id);
            if (cfg[id].Chapter == chapter) {
                config["chaptersName"][cfg[id].Chapter] = { name: cfg[id].ChapterName, level: cfg[id].ID };
                chapter++;
            }
        }
        return config;
    }

    static GetLevels() {
        return this.Get("Level");
    }

    static GetMonsters() {
        return this.Get("Monster");
    }

    /**
     * 获取生产工坊
     * @returns 
     */
    static GetProductions(buildingId: number): StdProduction[] {
        let ls: StdProduction[] = this.Get("workshop_building");
        let result = [];
        for (let obj of ls) {
            if (obj.BuildingId == buildingId) {
                result.push(obj);
            }
        }
        result.sort((a, b) => { return a.Show - b.Show; });
        return result
    }
    static GetProduction(id: number): StdProduction {
        let ls: StdProduction[] = this.Get("workshop_building");
        for (let std of ls) {
            if (std.ID == id) return std;
        }
    }

    /**
     * 兵营
     */
    static GetSoldierProduction(buildingId: number) {
        let stdls: { [level: number]: StdSoldierProduction } = {};
        let cfg: StdSoldierProduction[] = CfgMgr.Get("barracks_building");
        for (let std of cfg) {
            if (std.BuildingId == buildingId) {
                stdls[std.Level] = std;
            }
        }
        return stdls;
    }

    /**
     * 获取具体的招募配置
     * @param buildingId 
     * @param lv 
     * @param soldierId 
     * @returns 
     */
    static GetSoldierProductionByType(buildingId: number, lv: number, soldierId: number) {
        let cfg: StdSoldierProduction[] = CfgMgr.Get("barracks_building");
        for (let std of cfg) {
            if (std.BuildingId == buildingId && std.Level == lv) {
                let index = std.SoldiersType.indexOf(soldierId);
                if (index != -1) {
                    return [std.SingleNum[index], std.SoldiersTime[index], std.SoldiersCost[index]];
                }
            }
        }
        return [0, 0, 0];
    }

    /**
     * 获取
     * @param roleType 
     * @param quality 
     * @returns 
     */
    static GetRoleQuality(roleType: number, quality: number) {
        if (quality <= 0) quality = 1;
        let stds: StdRoleQuality[] = this.Get("role_qualityuo");
        for (let std of stds) {
            if (std.Roleid == roleType && std.QualityType == quality) return std;
        }
    }

    /**获取更多获得数据 */
    static GetFetchData(id: number) {
        let cfg: Fetch[] = CfgMgr.Get("fetch");
        for (let std of cfg) {
            if (std.Shortcut == id) {
                return std;
            }
        }
    }

    /**获取宝箱数据 */
    static GetBoxData(id: number) {
        let cfg: RewardBox[] = CfgMgr.Get("RewardBox");
        for (let std of cfg) {
            if (std.ItemID == id) {
                return std;
            }
        }
    }

    /**获取交易商品配置
     * buyOrSell ture代表
     */
    static GetTradeData(data: SThing, buyOrSell: SOrderType) {
        let cfg: Bourse[] = CfgMgr.Get("bourse")
        for (const iterator of cfg) {
            if (data.item && iterator.ShowType == 1 && iterator.ItemId == data.item.id) {
                return iterator;
            } else if (data.role && iterator.Roletype == data.role.type && iterator.Rolequality == data.role.quality) {
                return iterator;
            } else if (data.resource) {
                if (iterator.WaresType == ThingType.ThingTypeResource) {
                    if (buyOrSell == SOrderType.SELL) {
                        if (data.resource.rock && iterator.ItemId == ResourceType.rock) {
                            return iterator;
                        } else if (data.resource.seed && iterator.ItemId == ResourceType.seed) {
                            return iterator;
                        } else if (data.resource.water && iterator.ItemId == ResourceType.water) {
                            return iterator;
                        } else if (data.resource.wood && iterator.ItemId == ResourceType.wood) {
                            return iterator;
                        }
                    } else {
                        if (data.resource.rock != 0 && iterator.ItemId == ResourceType.rock) {
                            return iterator;
                        } else if (data.resource.seed != 0 && iterator.ItemId == ResourceType.seed) {
                            return iterator;
                        } else if (data.resource.water != 0 && iterator.ItemId == ResourceType.water) {
                            return iterator;
                        } else if (data.resource.wood != 0 && iterator.ItemId == ResourceType.wood) {
                            return iterator;
                        }
                    }
                }
            }
        }
    }

    /**获取所有交易商品类型 */
    static GetTradeAllData(type: number) {
        let cfg: Bourse[] = CfgMgr.Get("bourse")
        let datas: SThing[] = [];
        for (const iterator of cfg) {
            if (iterator.ShowType == type && type == 1) {
                //道具
                let data: SThing = {
                    type: ThingType.ThingTypeItem,
                    item: { id: iterator.ItemId, count: 0 }
                }
                datas.push(data)
            } else if (iterator.ShowType == type && type == 2) {
                //角色 
                let role_data: SThing = {
                    type: ThingType.ThingTypeRole,
                    role: {
                        id: "",
                        type: iterator.Roletype,
                        level: 1,
                        experience: 0,
                        soldier_num: 0,
                        active_skills: [],
                        passive_skills: [],
                        is_in_building: false,
                        building_id: 0,
                        battle_power: 0,
                        quality: iterator.Rolequality,
                        skills: [],
                        is_assisting: false,
                        is_in_attack_lineup: false,
                        is_in_defense_lineup: false,
                        trade_cd: 0,
                        sort: 0,
                    },
                }
                datas.push(role_data)
            } else if (iterator.ShowType == type && type == 3 && iterator.WaresType == ThingType.ThingTypeResource) {
                //资源
                if (iterator.ItemId == ResourceType.wood) {
                    let data1: SThing = {
                        type: ThingType.ThingTypeResource,
                        resource: { wood: 1 }
                    }
                    datas.push(data1)
                } else if (iterator.ItemId == ResourceType.water) {
                    let data2: SThing = {
                        type: ThingType.ThingTypeResource,
                        resource: { water: 1 }
                    }
                    datas.push(data2)
                } else if (iterator.ItemId == ResourceType.rock) {
                    let data3: SThing = {
                        type: ThingType.ThingTypeResource,
                        resource: { seed: 1 }
                    }
                    datas.push(data3)
                } else if (iterator.ItemId == ResourceType.seed) {
                    let data4: SThing = {
                        type: ThingType.ThingTypeResource,
                        resource: { rock: 1 }
                    }
                    datas.push(data4)
                }
            } else if (iterator.ShowType == type) {
                //装备
            }
        }
        return datas;
    }

    /**获取交易所商品配置 */
    static GetTradeAllCfgData(type: number) {
        let cfg: Bourse[] = CfgMgr.Get("bourse")
        let datas: Bourse[] = [];
        for (const iterator of cfg) {
            if (iterator.ShowType == type && type == 1) {
                //道具
                datas.push(iterator)
            } else if (iterator.ShowType == type && type == 2) {
                //角色 
                datas.push(iterator)
            } else if (iterator.ShowType == type && type == 3 && iterator.WaresType == ThingType.ThingTypeResource) {
                //资源
                if (iterator.ItemId == ResourceType.wood) {
                    datas.push(iterator)
                } else if (iterator.ItemId == ResourceType.water) {
                    datas.push(iterator)
                } else if (iterator.ItemId == ResourceType.rock) {
                    datas.push(iterator)
                } else if (iterator.ItemId == ResourceType.seed) {
                    datas.push(iterator)
                }
            } else if (iterator.ShowType == type) {
                //装备
            }
        }
        return datas;
    }

    /**根据角色类型和组获取筛选配置 */
    static GetSelectionDataByRoleType(value: number, group: number) {
        let selections: Selection[] = CfgMgr.Get("Selection");
        for (const iterator of selections) {
            if (iterator.Value[0] == value && iterator.Group == group) {
                return iterator;
            }
        }
        return null;
    }

    /**根据不同服获取世界交易所可上架的物品 */
    static GetCrossBoursCanTrade() {
        let cfg: StdCrossBours[] = CfgMgr.Get("cross_bourse");
        let change_list: StdCrossBours[] = [];
        let cur_sever = GameSet.GetServerMark();
        for (const iterator of cfg) {
            if (iterator.AllowSellerServer == cur_sever) {
                let is_add = true
                for (let index = 0; index < change_list.length; index++) {
                    const element = change_list[index];
                    if (element.SellItemID == iterator.SellItemID) {
                        is_add = false;
                        break;
                    }
                }
                if (is_add) {
                    change_list.push(iterator);
                }
            }
        }
        return change_list;
    }

    /**通过物品id来获取世界交易所可支付的货币配置 */
    static GetCrossBoursPayDataById(id: number) {
        let cfg: StdCrossBours[] = CfgMgr.Get("cross_bourse");
        let _list: StdCrossBours[] = [];
        for (const iterator of cfg) {
            if (iterator.SellItemID == id) {
                _list.push(iterator);
            }
        }
        return _list;
    }

    /**获取世界交易配置 */
    static GetCrossBours() {
        let cfg: StdCrossBours[] = CfgMgr.Get("cross_bourse");
        let change_list: StdCrossBours[] = [];
        let cur_sever = GameSet.GetServerMark();
        for (const iterator of cfg) {
            if (iterator.AllowSellerServer == cur_sever) {
                change_list.push(iterator);
            }
        }
        return change_list;
    }

    /**获取世界交易货币配置 */
    static GetCrossBoursCurrency() {
        let cfg: StdCrossBours[] = CfgMgr.Get("cross_bourse");
        let change_list: StdCrossBours[] = [];
        for (const iterator of cfg) {
            if (change_list.length > 0) {
                let is_has = false;
                for (let index = 0; index < change_list.length; index++) {
                    const element = change_list[index];
                    if (iterator.PayItemID == element.PayItemID) {
                        is_has = true;
                        break;
                    }
                }
                if (!is_has) {
                    change_list.push(iterator);
                }
            } else {
                change_list.push(iterator);
            }
        }
        return change_list;
    }

    /**通过id来获取世界交易配置 */
    static GetCrossBoursCurrencyByServer(id: number) {
        let cfg: StdCrossBours[] = CfgMgr.Get("cross_bourse");
        for (const iterator of cfg) {
            if (iterator.Id == id) {
                return iterator;
            }
        }
    }



    /**
     * 通过id获取通用配置
     */
    static GetCommon(id: number) {
        let stdList: StdCommon[] = CfgMgr.Get("Common");
        for (const iterator of stdList) {
            if (iterator.ModuleId == id && iterator.ConfigValues) {
                return iterator.ConfigValues
            }
        }
        return null;
    }
    private static _collectAttrList: number[];
    /**
     * 获取采集属性列表
     */
    static get GetCollectAttrs(): number[] {
        if (!this._collectAttrList) {
            this._collectAttrList = [
                Attr.RockCollectEfficiency, Attr.SeedCollectEfficiency,
                Attr.WaterCollectEfficiency, Attr.WoodCollectEfficiency
            ];
        }
        return this._collectAttrList;
    }
    /**
     * 获取是否采集属性
     */
    static GetIsCollectAttr(id: number): boolean {
        let attrs: number[] = this.GetCollectAttrs;
        for (let index = 0; index < attrs.length; index++) {
            if (attrs[index] == id) {
                return true;
            }
        }
        return false;
    }
    /**
     * 获取加速类型消耗彩虹币比例
     * @param type 
     */
    static GetBoostConsumeCost(type: BoostType): number {
        let num: number = 0;
        switch (type) {
            case BoostType.BoostTypeBuildingUpgrade:
                num = this.GetCommon(StdCommonType.Seed).BuildingCost;
                break;
            case BoostType.BoostTypeSoldierProduce:
                num = this.GetCommon(StdCommonType.Seed).BarracksCost;
                break;
            case BoostType.BoostTypeItemProduction:
                num = this.GetCommon(StdCommonType.Seed).WorkShopCost;
                break;
        }
        return num;
    }

    /**通过id和lv获取被动技能配置 */
    static GetPassiveSkill(id: number, lv: number): StdPassiveLevel {
        let skill: StdPassiveLevel[] = CfgMgr.Get("PassiveLevel");
        for (const iterator of skill) {
            if (iterator.ID == id && iterator.Level == lv) {
                return iterator;
            }
        }
        //console.error(`PassiveLevel --->找不到被动技能id${id} 技能等级 ${lv}`);
        return null;
    }

    static GetLanguageById(id: number): string {
        let language: StdInstructions[] = CfgMgr.Get("instructions");
        for (const iterator of language) {
            if (iterator.ID == id) {
                return iterator.Desc;
            }
        }
        return "";
    }
    /**
     * 获取钓鱼湖泊列表
     * @returns 
     */
    static GetLakeList(): StdLake[] {
        return this.Get("fish_lakes");
    }
    /**
     * 获取钓鱼湖泊配置
     * @returns 
     */
    static GetStdLake(id: number): StdLake {
        let list: StdLake[] = this.Get("fish_lakes");
        for (let std of list) {
            if (std.LakesId == id) return std;
        }
        return null;
    }
    static GetFishRodList(): StdFishRod[] {
        return this.Get("fish_rod");
    }
    static GetFishRodTypeList(type: number): StdFishRod[] {
        let list: StdFishRod[] = this.GetFishRodList();
        let typeList: StdFishRod[] = [];
        for (let index = 0; index < list.length; index++) {
            if (list[index].Type == type) {
                typeList.push(list[index]);
            }
        }
        return typeList;
    }
    /**
     * 获取鱼种配置
     * @returns 
     */
    static GetFishItem(id: number): StdFishItem {
        let cfg: { [key: string]: StdFishItem } = this.Get("fish_item");

        return cfg[id];
    }
    /**
     * 获取钓鱼商店配置
     * @returns 
     */
    static GetFishShopItem(id: number): StdFishShop {
        let cfg: { [key: string]: StdFishShop } = this.Get("fish_shop");
        if (!cfg[id]) {
            console.log("----->" + id);
        }
        return cfg[id];
    }
    /**
     * 获取钓鱼通用配置
     * @returns 
     */
    static get GetFishCommon(): StdFishCommon {
        return this.Get("fish_common")[0];
    }
    /**
     * 获取道具获得数
     */
    static GetFishConvertNum(id: number): number {
        for (let index = 0; index < this.GetFishCommon.ConvertItem.length; index++) {
            let itemId: number = this.GetFishCommon.ConvertItem[index];
            if (itemId == id) {
                return CfgMgr.GetFishCommon.ConvertItemCount[index];
            }
        }
        return 0;
    }
    /**
     * 获取钓鱼鱼饲料转彩虹币数量
     */
    static GetFishConvertValue(id: number, num: number): number {
        let convertNum: number = this.GetFishConvertNum(id);
        if (!num || num < 1) return 0;
        return num / convertNum;
    }
    static GetTask() {
        return this.Get("task");
    }
    static GetTaskById(id: number): StdTask {
        let stdTask: StdTask[] = this.Get(`task`);
        for (let task of stdTask) {
            if (task.TaskId == id) {
                return task;
            }
        }
        console.error("无此任务------->" + id)
        return null;
    }
    static GetTaskType(taskType: number) {
        let stdTasks: StdTask[] = this.GetTask();
        let tasks = []
        for (let task of stdTasks) {
            if (task.TaskType == taskType) {
                tasks.push(task)
            }
        }
        return tasks;
    }
    /**获取任务奖励 */
    static getTaskRewardThings(id: number): SThing[] {
        let stdTask = this.GetTaskById(id);
        let things: SThing[] = [];
        if (stdTask) {
            stdTask.RewardType.forEach((reward, index) => {
                let thing: SThing = {
                    type: reward
                };
                thing.type = reward;
                switch (thing.type) {
                    case ThingType.ThingTypeItem:
                        thing.item = { id: stdTask.RewardID[index], count: stdTask.RewardNumber[index] };
                        break;
                    case ThingType.ThingTypeCurrency:
                        thing.currency = { type: 0, value: stdTask.RewardNumber[index] };
                        break;
                    case ThingType.ThingTypeGold:
                        thing.currency = { type: 2, value: stdTask.RewardNumber[index] };
                        break;
                    case ThingType.ThingTypeEquipment:
                        break;
                    case ThingType.ThingTypeRole:
                        thing.role = {
                            id: null, type: stdTask.RewardNumber[index], quality: 1, level: null,
                            experience: null, soldier_num: null, active_skills: null, passive_skills: null,
                            is_in_building: null, building_id: null, battle_power: null, skills: null, is_assisting: false,
                            is_in_attack_lineup: false,
                            is_in_defense_lineup: false,
                            trade_cd: 0,
                        };
                        break;
                    case ThingType.ThingTypeResource:
                        switch (stdTask.RewardID[index]) {
                            case ResourceType.rock:
                                thing.resource = { rock: stdTask.RewardNumber[index] };
                                break;
                            case ResourceType.seed:
                                thing.resource = { seed: stdTask.RewardNumber[index] };
                                break;
                            case ResourceType.water:
                                thing.resource = { water: stdTask.RewardNumber[index] };
                                break;
                            case ResourceType.wood:
                                thing.resource = { wood: stdTask.RewardNumber[index] };
                                break;
                        }
                        break;
                    case ThingType.ThingTypeGemstone:
                        thing.currency = { type: ThingItemId.ItemId_3, value: stdTask.RewardNumber[index] };
                        break;
                }
                things.push(thing);
            })
        }
        return things
    }
    /**获取PVP指定赛季内同 */
    static getPVPById(id: number): StdPVPSnatch {
        let stdPVP: StdPVPSnatch[] = this.Get(`PVPSnatch`);
        let stdPVPData: StdPVPSnatch;
        stdPVP.forEach((pvpData) => {
            if (pvpData.MatchID == id) {
                stdPVPData = pvpData;
            }
        })
        return stdPVPData;
    }
    static GetShop(id: number): StdShop {
        for (let std of this.GetShopList()) {
            if (std.ID == id) return std;
        }
        return null;
    }
    static GetShopList(): StdShop[] {
        return this.Get("Shop");
    }
    /**
     * 获取通用商品配置
     * @param id 
     * @returns 
     */
    static GetCommShopItem(id: number): StdShopCommodity {
        return this.Get(`ShopCommodity`)[id];
    }
    /**
     * 获取抽奖商店池子配置列表
     * @param shopGroupId
     * @param shopType
     * @returns 
     */
    static GetLuckyDatas(shopGroupId: number, shopType: number): StdLuckyShop[] {
        let indexList: StdShopIndex[] = this.getShopIndexList();
        let list: StdShopLucky[] = this.getShopLuckuyList();
        let newList: StdLuckyShop[] = [];
        for (let stdShopIndex of indexList) {
            if (stdShopIndex.SystemOpen > 0 && stdShopIndex.ShopGroupId == shopGroupId && stdShopIndex.ShopType == shopType) {
                for (let stdShopLucky of list) {
                    if (stdShopLucky.RewardPools == stdShopIndex.LuckyID) {
                        newList.push({ shopId: stdShopIndex.ID, shopStd: stdShopLucky });
                    }
                }
            }
        }
        return newList;
    }
    /**
     * 获取商城页签配置
     * @param shopGroupId
     * @param shopType
     * @returns 
     */
    static GetShopIndex(shopGroupId: number, shopType: number): StdShopIndex {
        let indexList: StdShopIndex[] = this.getShopIndexList();
        for (let stdShopIndex of indexList) {
            if (stdShopIndex.ShopGroupId == shopGroupId && stdShopIndex.ShopType == shopType) {
                return stdShopIndex;
            }
        }
    }
    /**
     * 获取商城抽奖配置
     * @param id 
     * @returns 
     */
    static GetShopLucky(id: number): StdShopLucky {
        let list: StdShopLucky[] = this.getShopLuckuyList();
        for (const std of list) {
            if (std.CardpoolId == id) return std;
        }
    }
    /**
     * 获取商城配置列表
     * @returns 
     */
    private static getShopLuckuyList(): StdShopLucky[] {
        return this.Get(`ShopLucky`);
    }
    /**
     * 获取商城配置列表
     * @returns 
     */
    private static getShopIndexList(): StdShopIndex[] {
        return this.Get(`ShopIndex`);
    }
    /**获取消息配置 */
    public static GetMessag(id: number): StdMessag {
        let list: StdMessag[] = this.Get(`Message`);
        for (const msg of list) {
            if (msg.Serialnumber == id) return msg;
        }
        return null;
    }
    /**
     * 获取抽奖商城池子
     * @param id 
     */
    public static GetShopLuckyPool(id: number): StdShopLuckyPool {
        return this.Get(`ShopLuckyPool`)[id];
    }

    /**通过id获取角色宝箱数据角色 */
    public static GetRewardRoleById(id: number): StdRewardRole {
        let cfg: StdRewardRole[] = CfgMgr.Get("RewardRole");
        for (let index = 0; index < cfg.length; index++) {
            const element = cfg[index];
            if (id == element.RewardID) {
                return element;
            }
        }
        return null;
    }
    /**通过id获取广告配置*/
    public static GetAdvister(id: number): StdAdvister {
        return this.GetAdvisterMap()[id];
    }
    public static GetAdvisterMap(): { [key: number]: StdAdvister } {
        return this.Get("Advister_list");
    }
    /**
     * 获取系统开启配置
     * @param id 
     */
    public static GetSysOpenCfg(id: number): StdSystemOpen {
        return this.GetSysOpenMap()[id];
    }

    protected static systemOpen:any;
    public static GetSysOpenMap(): { [key: string]: StdSystemOpen } {
        return this.systemOpen;
        // return this.Get("system_open");
    }
    static ResetWhiet(data){
        let cfg = JSON.parse(JSON.stringify(CfgMgr.Get("system_open")));
        if (data.panel && data.panel.length) {
            let steps = CfgMgr.Get("step");
            let step = 0;
            for (let k of data.panel) {
                step--;
                let panel = k, ui: string;
                if (js.getClassByName(k) == undefined) {
                    ui = k;
                    steps[step] = { UI: ui, Desc: "" };
                }
                let std: any;
                for (let key in cfg) {
                    std = cfg[key];
                    if (std.Panel.indexOf(panel) != -1) {
                        std.ConditionId1.push(0);
                        std.ConditionValue1.push("功能无法使用！");
                        std.Tips = "功能无法使用！";
                        continue;
                    }
                }
                let cloner = JSON.parse(JSON.stringify(std));
                cloner.ConditionId1 = [0]
                cloner.ConditionValue1 = ["功能无法使用！"];
                cloner.Tips = "功能无法使用！";
                cloner.Panel = panel ? [panel] : [];
                cloner.Step = ui ? [step] : [];
                cfg["White_equity" + panel] = cloner;
            }
        }
        this.systemOpen = cfg;
    }

    public static GetTransactionInfo(id: number) {
        let cfg: StdTransactionInfo[] = CfgMgr.Get("TransactionInfo");
        for (let index = 0; index < cfg.length; index++) {
            const element = cfg[index];
            if (id == element.ConditionId) {
                return element.Text;
            }
        }
    }

    static GetHeadList(type: StdHeadType): StdHead[] {
        let cfg: StdHead[] = CfgMgr.Get("Head");
        let list: StdHead[] = [];
        for (let std of cfg) {
            if (std.HeadType == type) {
                list.push(std);
            }
        }
        return list;
    }
    /**获取头像配置 */
    static GetHead(id: number): StdHead {
        let cfg: StdHead[] = CfgMgr.Get("Head");
        for (let std of cfg) {
            if (std.ID == id) return std;
        }
        return;
    }

    /**获取公会通用配置 */
    static GetGuildComm(): StdGuildComm {
        return this.Get("guild_common")[0];
    }
    /**获取公会权限配置 */
    static GetGuildRoleList(): StdGuildRole[] {
        let roleList: StdGuildRole[] = this.Get("guild_role");
        return roleList;
    }
    /**获取公会权限配置 */
    static GetGuildRole(id: number): StdGuildRole {
        let roleList: StdGuildRole[] = this.GetGuildRoleList();
        for (let std of roleList) {
            if (std.ID == id) return std;
        }
        return null;
    }
    /**获取公会等级配置 */
    static GetGuildLevel(id: number): StdGuildLevel {
        for (let std of this.GetGuildLevelList()) {
            if (std.ID == id) return std;
        }
        return this.GetGuildLevelList()[this.GetGuildLevelList().length - 1];
    }
    /** 获取公会等级列表配置*/
    static GetGuildLevelList(): StdGuildLevel[] {
        return this.Get("guild_level");
    }
    /**获取公会Logo列表配置 */
    static GetGuildLogoList(): StdGuildLogo[] {
        return this.Get("guild_logo");
    }
    static GetGuildLogo(id: number): StdGuildLogo {
        for (let std of this.GetGuildLogoList()) {
            if (std.ID == id) return std;
        }
        return null;
    }
    /**获取公会Logo列表配置 */
    static GetGuildEvent(id: number): StdGuildEvent {
        let roleList: StdGuildEvent[] = this.Get("guild_event");
        for (let std of roleList) {
            if (std.ID == id) return std;
        }
    }
    /**获取公会改名消耗配置 */
    static GetGuildChangeName(count: number): StdGuildChangeName {
        let roleList: StdGuildChangeName[] = this.Get("guild_change_name");
        for (let std of roleList) {
            if (std.Count == count) return std;
        }
        return roleList[roleList.length - 1];
    }

    /**获取公会类型列表 */
    static GetGuildTypeList(): StdGuildType[] {
        return this.Get("guild_type");
    }

    /**获取公会类型 */
    static GetGuildType(id: number): StdGuildType {
        let list: StdGuildType[] = this.GetGuildTypeList();
        let std: StdGuildType;
        for (let index = 0; index < list.length; index++) {
            std = list[index];
            if (std.ID == id) return std;
        }
        return null;
    }
    /**获取公会银行储蓄类型列表 */
    static GetGuildSavingsList(guildLv: number): StdGuildBank[] {
        let list: StdGuildBank[] = this.Get("GuildBank");
        let newList: StdGuildBank[] = [];
        let std: StdGuildBank;
        let oldVal: number = 0;
        for (let i = 0; i < list.length; i++) {
            std = list[i];
            if (std.Guild_Level > guildLv) {
                return newList;
            }
            if (std.Guild_Level > oldVal) {
                newList.length = 0;
            }
            newList[newList.length] = std;
            oldVal = std.Guild_Level;
        }
        return newList;
    }
    /**获取公会银行储蓄类型 */
    static GetGuildSavings(id: number): StdGuildBank {
        let list: StdGuildBank[] = this.Get("GuildBank");
        let std: StdGuildBank;
        for (let i = 0; i < list.length; i++) {
            std = list[i];
            if (std.DonateId == id) {
                return std;
            }
        }
        return null;
    }
    /**获取公会银行储蓄颜色值 */
    static GetGuildSavingsTypeColor(type: number): string[] {
        if (type == GuildSavingsType.General) {
            return ["#217935", "#FFFD73", "#812F06"];
        } else if (type == GuildSavingsType.High) {
            return ["#8D287B", "#AEFFFC", "#3C6160"];
        } else {
            return ["#a73029", "#FFFD73", "#812F06"];
        }
    }
    /**获取公会银行储蓄利率*/
    static GetGuildSavingsRate(id: number, type: number, postId: number): number {
        let stdGuildBank: StdGuildBank = this.GetGuildSavings(id);
        if (!stdGuildBank) return 0;

        let rate: number = stdGuildBank.MemberRebate;
        for (let index = 0; index < stdGuildBank.guild_role.length; index++) {
            let post = stdGuildBank.guild_role[index];
            if (post == postId && stdGuildBank.TotalRebateRole.indexOf(postId) > -1) {
                rate += stdGuildBank.AddRebate[index];
                break;
            }
        }
        for (let index = 0; index < stdGuildBank.guild_type.length; index++) {
            let guildType = stdGuildBank.guild_type[index];
            if (guildType == type) {
                rate += stdGuildBank.Guild_Rebate[index];
                break;
            }
        }
        return rate / 10000 * 100;
    }
    /**获取公会银行储蓄人数总利率*/
    static GetGuildSavingsTotalRate(id: number, curNum: number, roleId: GuildPostType, isNext: boolean = false): number[] {
        let stdGuildBank: StdGuildBank = this.GetGuildSavings(id);
        if (!stdGuildBank) return null;
        if (stdGuildBank.TotalRebateRole.indexOf(roleId) < 0) return null;
        let rate: number = 0;
        let num: number = 0;
        let len: number = stdGuildBank.TotalRebateType.length;
        for (let index = 0; index < len; index++) {
            num = stdGuildBank.TotalRebateType[index];
            if (isNext && curNum >= stdGuildBank.TotalRebateType[len - 1]) {
                return null;
            }
            if (num > curNum) {
                if (isNext) {
                    rate = stdGuildBank.TotalRebate[index];
                }
                break;
            }
            rate = stdGuildBank.TotalRebate[index];
        }

        return [num, rate / 10000 * 100];
    }
    /**
     * 获取公会银行储蓄货币类型列表
     * @returns 
     */
    static GetGuildBankTypeList(): StdGuildBankType[] {
        let stdList: StdGuildBankType[] = this.Get("GuildBank_type");
        return stdList;
    }

    /**获取公会银行收益利息配置 */
    static GetGuildBankType(type: number): StdGuildBankType {
        let stdList: StdGuildBankType[] = this.GetGuildBankTypeList();
        let std: StdGuildBankType;
        for (let index = 0; index < stdList.length; index++) {
            std = stdList[index];
            if (std.CostType == type) return std;
        }
    }
    /**获取公会权益列表*/
    static GetGuildEquityList(): StdGuildEquity[] {
        return this.Get("guild_equity");
    }
    /**获取公会权益*/
    static GetGuildEquity(id: number): StdGuildEquity {
        let list: StdGuildEquity[] = this.GetGuildEquityList();
        for (let std of list) {
            if (std.ID == id) return std;
        }
        return null;
    }

    /**获取权益卡种类列表 */
    static GetEquityCardTabList(): StdEquityCardTab[] {
        return this.Get("Equity_card_tab");
    }
    /**获取权益卡种类列表 */
    static GetEquityCardTab(tabId: number): StdEquityCardTab {
        let tabList: StdEquityCardTab[] = this.GetEquityCardTabList();
        for (let index = 0; index < tabList.length; index++) {
            if (tabList[index].ID == tabId) return tabList[index];

        }
        return null;
    }
    /**获取权益卡列表 */
    static GetEquityCardList(): StdEquityCard[] {
        return this.Get("Equity_card");
    }
    /**获取权益列表 */
    static GetEquityList(cardId: number, isFilterShow: boolean = false): StdEquityList[] {
        let stdCard: StdEquityCard = this.getEquityCardById(cardId);
        if (!stdCard) return [];
        let stdEquityList: StdEquityList[] = [];
        let stdEquity: StdEquityList;
        for (let index = 0; index < stdCard.Equity_list.length; index++) {
            stdEquity = this.getEquityListById(stdCard.Equity_list[index]);
            if (stdEquity) {
                if (isFilterShow) {
                    if (stdEquity.isHeroGallery == undefined || stdEquity.isHeroGallery > 0) {
                        stdEquityList.push(stdEquity);
                    }
                } else {
                    stdEquityList.push(stdEquity);
                }
            }
        }
        return stdEquityList;
    }

    /**获取权益配置 */
    static getEquityCardById(id: number) {
        let equity_card: StdEquityCard[] = this.GetEquityCardList();
        for (let std of equity_card) {
            if (std.Equity_CardID == id) return std;
        }
    }
    static GetEquityCfgList(): StdEquityList[] {
        return this.Get("Equity_list");
    }
    /**获取权益卡权益配置 */
    static getEquityListById(id: number) {
        let equity_list: StdEquityList[] = this.Get("Equity_list");
        for (let std of equity_list) {
            if (std.Equity_ID == id) return std;
        }
    }

    /**
     * 筛选出包含指定权益的权益卡
     * @param equityId 
     */
    static GetHasEquityIdCards(...equityIds: number[]) {
        let result: number[] = [];
        let equity_card: StdEquityCard[] = this.Get("Equity_card");
        for (let equityId of equityIds) {
            for (let card of equity_card) {
                if (card.Equity_list.indexOf(equityId) != -1) {
                    if (result.indexOf(card.Equity_CardID) == -1) result.push(card.Equity_CardID);
                }
            }
        }
        return result;
    }
    /**通过权益id获取权益卡配置 */
    static GetEquityByIdGetCardList(id: number): StdEquityCard {
        let cardList: StdEquityCard[] = this.GetEquityCardList();
        for (let stdCard of cardList) {
            if (stdCard.Equity_list.indexOf(id) > -1) return stdCard;
        }
        return null;
    }
    /**获取联系渠道列表 */
    static GetShopownerList(): StdShopowner[] {
        let list: StdShopowner[] = CfgMgr.Get("Shopowner");
        return list;
    }

    /**获取主基地工作熔铸石配置 */
    static GetProduceCasting(type: number, quality: number) {
        let produce_casting_list: StdProduceCasting[] = this.Get("produce_casting");
        for (let std of produce_casting_list) {
            if (std.Roleid == type && std.RoleQuailty == quality) return std;
        }
    }

    /**获取主基地工作勋章配置 */
    static GetProduceMedal(type: number, quality: number) {
        let produce_casting_list: StdProduceMedal[] = this.Get("produce_medal");
        for (let std of produce_casting_list) {
            if (std.Roleid == type && std.RoleQuailty == quality) return std;
        }
    }

    /**获取所有的角色采集熔铸石配置 */
    static GetAllProduceCasting(type: number) {
        let produce_casting_list: StdProduceCasting[] = this.Get("produce_casting");
        let list: StdProduceCasting[] = [];
        for (let std of produce_casting_list) {
            if (std.Roleid == type) {
                list.push(std)
            }
        }
        return list;
    }

    /**获取所有的角色采集勋章配置 */
    static GetAllProduceMedal(type: number) {
        let produce_casting_list: StdProduceMedal[] = this.Get("produce_medal");
        let list: StdProduceMedal[] = [];
        for (let std of produce_casting_list) {
            if (std.Roleid == type) {
                list.push(std)
            }
        }
        return list;
    }

    /**获取玩家改名消耗配置 */
    static GetPlayerChangeName(count: number): StdPlayerChangeName {
        let roleList: StdPlayerChangeName[] = this.Get("change_name");
        for (let std of roleList) {
            if (std.Count == count) return std;
        }
        return roleList[roleList.length - 1];
    }

    /**
     * 获取卖鱼通用配置
     * @returns 
     */
    static get GetFishTradeCommon(): StdFishTradeCommon {
        return this.Get("fish_trade_common")[0];
    }
    /**
     * 获取道具获得数
     */
    static GetFishTradeConvertNum(id: number): number {
        for (let index = 0; index < this.GetFishTradeCommon.ConvertItem.length; index++) {
            let itemId: number = this.GetFishTradeCommon.ConvertItem[index];
            if (itemId == id) {
                return CfgMgr.GetFishTradeCommon.ConvertItemCount[index];
            }
        }
        return 0;
    }
    /**获取运鱼船列表 */
    static get GetFishTradeShipList(): StdFishTradeShip[] {
        return this.Get("fish_trade_ship");
    }

    /**获取鱼船配置*/
    static GetFishTradeShip(id: number): StdFishTradeShip {
        let shipList: StdFishTradeShip[] = this.GetFishTradeShipList;
        let std: StdFishTradeShip;
        for (let index = 0; index < shipList.length; index++) {
            std = shipList[index];
            if (std.ShipId == id) return std;
        }
        return null;
    }

    static GetFishTradeShipIndex(id: number): number {
        let stdList: StdFishTradeShip[] = this.GetFishTradeShipList;
        for (let index = 0; index < stdList.length; index++) {
            if (stdList[index].ShipId == id) return index;
        }
        return -1;
    }
    /**获取钓鱼英雄列表 */
    static GetFishHeroList(): StdFishHero[] {
        return this.Get("fish_hero");
    }
    static GetFishHeroIndex(id: number): number {
        let list: StdFishHero[] = this.GetFishHeroList();
        let std: StdFishHero;
        for (let index = 0; index < list.length; index++) {
            std = list[index];
            if (std.ID == id) {
                return index;
            }
        }
        return 0;
    }
    /**获取钓鱼英雄配置 */
    static GetFishHero(id: number): StdFishHero {
        let list: StdFishHero[] = this.GetFishHeroList();
        let std: StdFishHero;
        for (let index = 0; index < list.length; index++) {
            std = list[index];
            if (std.ID == id) {
                return std;
            }
        }
        return null;
    }
    /**获取钓鱼英雄组件列表 */
    static GetFishHeroPartList(): StdFishHeroPart[] {
        return this.Get("fish_hero_part");
    }
    /**获取钓鱼英雄组件 */
    static GetFishHeroPartLv(id: number, lv: number): StdFishHeroPart {
        let list: StdFishHeroPart[] = this.GetFishHeroPartList();
        let std: StdFishHeroPart;
        for (let index = 0; index < list.length; index++) {
            std = list[index];
            if (std.ID == id && std.Level == lv) {
                return std;
            }
        }
        return null;
    }
    /**获取钓鱼英雄组件技能列表 */
    static GetFishHeroSkillList(): StdFishHeroSkill[] {
        return this.Get("fish_hero_skilltype");
    }
    /**获取钓鱼英雄组件技能 */
    static GetFishHeroSkill(id: number): StdFishHeroSkill {
        let list: StdFishHeroSkill[] = this.GetFishHeroSkillList();
        let std: StdFishHeroSkill;
        for (let index = 0; index < list.length; index++) {
            std = list[index];
            if (std.ID == id) {
                return std;
            }
        }
        return null;
    }
    static GetFishRankList(): StdFishRankAward[] {
        return this.Get("fish_ranklist");
    }
    /**钓鱼排行榜奖励列表 */
    static GetFishRankAwardList(id: number, type: StdFishRankType): StdFishRankAward[] {
        let list: StdFishRankAward[] = this.GetFishRankList();
        let std: StdFishRankAward;
        let newList: StdFishRankAward[] = [];
        for (let index = 0; index < list.length; index++) {
            std = list[index];
            if (std.ListModeID == id) {
                if (std.ListType == type) {
                    newList.push(std);
                }
            }
        }
        return newList;
    }
    /**获取pvp商店列表 */
    static GetPvpShopList(): StdPvpShop[] {
        return this.Get("pvp_shop");
    }
    /**获取pvp商品数据 */
    static GetPvpShopItem(id: number): StdPvpShop {
        let list: StdPvpShop[] = this.GetPvpShopList();
        let std: StdPvpShop;
        for (let index = 0; index < list.length; index++) {
            std = list[index];
            if (std.ShopItemID == id) return std;
        }
        return null;
    }
    /**获取个人银行储蓄列表 */
    static GetBankList(): StdBank[] {
        let list: StdBank[] = this.Get("FinancialBank");
        return list;
    }
    /**获取个人银行储蓄类型 */
    static GetBank(id: number): StdBank {
        let list: StdBank[] = this.GetBankList();
        let std: StdBank;
        for (let i = 0; i < list.length; i++) {
            std = list[i];
            if (std.DonateId == id) {
                return std;
            }
        }
        return null;
    }
    /**个人银行返还总数 */
    static GetBankBackNum(std: StdBank): number {
        let val: number = 0;
        if (std && std.day && std.day.length) {
            for (let index = 0; index < std.day.length; index++) {
                val = val.add(std.day[index]);
            }
        }
        return val;
    }
    /**个人银行XX天返还数*/
    static GetBankDayBackNum(std: StdBank, day: number): number {
        let val: number = 0;
        if (std && std.day && std.day.length) {
            val = day < std.day.length ? std.day[day] : std.day[std.day.length];
        }
        return val;
    }
    /**获取银行储蓄颜色值 */
    static GetSavingsTypeColor(type: number): string[] {
        if (type == SavingsType.General) {
            return ["#264902", "#264902"];
        } else if (type == SavingsType.High) {
            return ["#8A3A68", "#81146D"];
        } else {
            return ["#a73029", "#FFFFFF"];
        }
    }
    private static bankMaxSavingsCount: number = -1;//个人银行最大储蓄次数
    /**获取银行储蓄颜色值 */
    static GetBankMaxSavingsCount(): number {
        if (this.bankMaxSavingsCount < 0) {
            let list: StdBank[] = this.Get("FinancialBank");
            let std: StdBank;
            let val: number = 0;
            for (let index = 0; index < list.length; index++) {
                std = list[index];
                val = val.add(std.CostTimes);
            }
            this.bankMaxSavingsCount = val;
        }
        return this.bankMaxSavingsCount;
    }
    /**获取炸鱼通用配置 */
    static get GetFishBombComm(): StdFishBombComm {
        return this.Get("fish_bomb_common")[0];
    }

    /**获取炸鱼鱼塘配置列表 */
    static GetFishBombPondList(): StdFishBombPond[] {
        return this.Get("fish_bomb_pools");
    }
    /**获取炸鱼鱼塘配置*/
    static GetFishBombPond(id: number): StdFishBombPond {
        let list: StdFishBombPond[] = this.GetFishBombPondList();
        for (let index = 0; index < list.length; index++) {
            if (list[index].Id == id) return list[index];

        }
        return null;
    }
    /**获取炸鱼鱼塘配置下标*/
    static GetFishBombPondIndex(id: number): number {
        let list: StdFishBombPond[] = this.GetFishBombPondList();
        for (let index = 0; index < list.length; index++) {
            if (list[index].Id == id) return index;

        }
        return 0;
    }
    /** 获取炸鱼回合配置列表*/
    static GetFishBombStageList(): StdFishBombSatge[] {
        return this.Get("fish_bomb_stage");
    }
    /** 获取炸鱼回合配置*/
    static GetFishBombStage(id: number): StdFishBombSatge {
        let list: StdFishBombSatge[] = this.GetFishBombStageList();
        for (let index = 0; index < list.length; index++) {
            if (list[index].Id == id) return list[index];
        }
        return null;
    }
    /**
     * 获取道具获得数
     */
    static GetFishBombConvertNum(id: number): number {
        for (let index = 0; index < this.GetFishBombComm.ConvertItem.length; index++) {
            let itemId: number = this.GetFishBombComm.ConvertItem[index];
            if (itemId == id) {
                return CfgMgr.GetFishBombComm.ConvertItemCount[index];
            }
        }
        return 1;
    }
    static get GetWorldBossComm(): StdWorldBossComm {
        return this.Get("WorldBoss_common")[0];
    }
    static GetWorldBossHurtAwardList(): StdWorldBossHurtAward[] {
        return this.Get("WorldBoss_reward");
    }
    /**
     * 获取世界boss伤害奖励
     * @param hurtVal 伤害值
     * @param type 201 单局伤害奖励 202累计伤害奖励
     * @returns 
     */
    static GetWorldBossHurtAward(hurtVal: number, type: number): StdWorldBossHurtAward {
        let list: StdWorldBossHurtAward[] = this.GetWorldBossHurtAwardList();
        let std: StdWorldBossHurtAward;
        let curStd: StdWorldBossHurtAward;
        for (let index = 0; index < list.length; index++) {
            std = list[index];
            if (std.PoolID == type) {
                curStd = std;
                if (std.MinDamage > hurtVal) {
                    break;
                }
            }
        }
        return curStd;
    }

    static GetWorldBossLvList(): StdWorldBossLv[] {
        return this.Get("WorldBoss_level");
    }
    static GetWorldBossRankAwardList(): StdWorldBossRankAward[] {
        return this.Get("WorldBoss_rank");
    }
    static GetWorldBossRankTypeAwardList(type: number): StdWorldBossRankAward[] {
        let list: StdWorldBossRankAward[] = [];
        let cfgList: StdWorldBossRankAward[] = this.GetWorldBossRankAwardList();
        let std: StdWorldBossRankAward;
        for (let index = 0; index < cfgList.length; index++) {
            std = cfgList[index];
            if (std.ListType == type) {
                list.push(std);
            }
        }
        return list;
    }
    /**
     * 获取角色进化配置
     * @param roleType 
     * @param quality 
     * @param type 1是进化 2是重随
     * @returns 
     */
    static GetRoleQualityUpCfg(roleType: number, quality: number, type: number) {
        if (quality <= 0) quality = 1;
        let stds: StdRoleQualityUp[] = this.Get("role_qualityUp");
        for (let std of stds) {
            if (std.Roleid == roleType && std.RoleQuailty == quality && std.OperateType == type) return std;
        }
    }

    /**
     * 获取角色洗练配置
     * @param roleType 
     * @param quality 
     * @returns 
     */
    static GetRoleSkillClearCfg(roleType: number, quality: number) {
        if (quality <= 0) quality = 1;
        let stds: StdRoleSkillClear[] = this.Get("role_skillclear");
        for (let std of stds) {
            if (std.Roleid == roleType && std.QualityType == quality) return std;
        }
    }

    /**获取合成道具配置 */
    static GetItemSynthesSizeCfg() {
        let stds: StdItemSyntheSize[] = this.Get("ItemSynthesize");
        return stds
    }

    /**
     * 获取主动技能升级配置
     * @param skillId 主动技能id
     * @param skillLv 主动技能等级
     * @returns 
     */
    static GetActiveSkillUp(skillId: number, skillLv: number): StdActiveSkillUp {
        let skillUpList: StdActiveSkillUp[] = this.Get("skillUp");;
        let stdSkill: StdActiveSkillUp;
        for (let index = 0; index < skillUpList.length; index++) {
            stdSkill = skillUpList[index];
            if (stdSkill.SkillId == skillId && stdSkill.SkillType == skillLv) {
                return stdSkill;
            }
        }
        return null;
    }

    static GetFilpAnswerTypeList(type: number): StdFilpAnswer[] {
        let list: StdFilpAnswer[] = [];
        let totalList: StdFilpAnswer[] = this.Get("flip_answer");
        for (let std of totalList) {
            if (type == std.PrizeType) {
                list.push(std);
            }
        }
        return list
    }

    static GetFilpGrandPrizeList(): StdFilpGrandPrize[] {
        let list: StdFilpGrandPrize[] = this.Get("flip_GrandPrize");
        return list;
    }
    /**
     * 获取卖鱼通用配置
     * @returns 
     */
    static get GetFlipCommon(): StdFlipCommon {
        return this.Get("flip_common")[0];
    }
    /**
     * 获取道具获得数
     */
    static GetFlipConvertNum(id: number): number {
        for (let index = 0; index < this.GetFlipCommon.ConvertItem.length; index++) {
            let itemId: number = this.GetFlipCommon.ConvertItem[index];
            if (itemId == id) {
                return this.GetFlipCommon.ConvertItemCount[index];
            }
        }
        return 0;
    }
}


export type StdMerge = {
    readonly Roleid: number;
    readonly RoleQuailty: number;
    readonly MainRoleid: number;
    readonly OtherRoleid: number[];
    readonly RoleTypeQual: number;
}

/**角色品质配置 */
export type StdRoleQuality = {
    readonly Roleid: number;             // 角色id
    readonly QualityType: number;        // 角色品质
    readonly PieceItem: number;          // 合成碎片id
    readonly PieceItemNum: number;       // 合成碎片数量
    readonly BaseRate: number;           // 基础成功率
    readonly UpItemID: number[];           // 可提升的道具id
    readonly UpItemNumMax: number[];       // 可用最大数量
    readonly UpItemRate: number[];         // 单个道具成功率
    readonly UpItemRateMax: number;      // 道具最大成功率
    readonly FriendsNum: number;         // 可选好友最大数量
    readonly FriendsRate: number;        // 单个好友成功率
    readonly FriendsRateMax: number;     // 好友最大成功率
    readonly PassiveSkillNumAdd: number[]; // 增加被动数量
    readonly PassiveNumWeight: number[];  //生成词条数量权值
    readonly SkillBaseId: number[];        // 随机技能库
    readonly PassiveSkillUpRate: number; // 被动技能升级概率
    readonly ActiveSkillUp: number[];      // 增加主动技能等级
    readonly ItemCost: number[];           // 消耗道具
    readonly ItemCostNum: number[];        // 消耗道具数量
    readonly CoinCostNum: number;        // 消耗货币数量
    readonly SoldierNum: number[];         // 带兵数量加值
    readonly AttackRange: number;        // 攻击范围加值
    readonly AttrFight: number[];        // 战斗属性
    readonly AttrFightValue: number[];   // 战斗属性值
    readonly Attr: number[];             // 采集属性
    readonly AttrValue: number[];        // 采集属性值
    readonly ActivityValue: number;       // 好友活跃值门槛
    readonly RewardID: number;              //奖励id  
    readonly Power: number;               //战力预览
    readonly ExItemID: number[];           // 专属提升道具
    readonly ExItemMAx: number[];       // 专属提升可用最大数量
    readonly ExItemRate: number[];         // 专属提升道具成功率
    readonly ExRateMax: number;      // 专属提升道具最大成功率
    readonly UpItemRate_display: number[];      // 前端显示提升道具成功率
    readonly UpItemRateMax_display: number;      //  前端显示提升道具最大成功率
    readonly RewardType: number[];
    readonly RewardItemType: number[];
    readonly RewardNumber: number[];
}


/**实体属性 */
export type EntityAttrLike = {
    readonly AttrFight: number[];
    readonly AttrFightValue: number[];
    readonly Attr: number[];
    readonly AttrValue: number[];
}

/**卡牌枚举 */
export enum CardQuality {
    N = 1,
    R,
    sR,
    ssR,
    UR
}

export enum Job {
    dun = 1, // 1盾兵
    jian,    // 2剑士
    gong,    // 3弓兵
    fuzhu,   // 4辅助
}
export const JobName: { [job: number]: string } = {
    [1]: "肉盾",
    [2]: "战士",
    [3]: "射手",
    [4]: "辅助",
}

/**兵营等级 */
export type StdSoldierProduction = {
    readonly BuildingId: number;  //建筑id
    readonly Level: number;        //建筑等级
    readonly ShowType: number;        //兵种类型展示
    readonly SoldiersType: number[]; //可征用兵种
    readonly SoldiersNum: number[];  //各兵种总上限
    readonly SingleNum: number[];    //单次征用上限
    readonly SoldiersTime: number[]; //单个兵种征用时间
    readonly SoldiersCost: number[]; //单个兵种消耗
    readonly NewSoldiers: number; //新增兵种

}

/**建筑定义配置 */
export type StdDefineBuilding = {
    readonly BuildingId: number;
    readonly MainBase: number;
    readonly HomeId: number;
    readonly BuildingType: number;
    readonly BuildingSubType: number;
    readonly BattleType: number;
    readonly Level: number;
    readonly LevelMax: number;
    readonly Money: number;
    readonly ItemId: number[];
    readonly ItemNum: number[];
    readonly UnlockDuration: number;
    readonly RoleId: number;
    readonly Prefab: string;
    readonly remark: string;
    readonly Desc: string;

}

/**家园配置 */
export type StdHomeLand = {
    readonly HomeId: number;        // 家园id
    readonly Style: string;         // 初始背景皮肤
    readonly Mark: string;         // 分服标识
    readonly Level: number;         // 初始等级
    readonly MaxRole: number;       // 最大表现角色数
    readonly MinScale: number;      // 最小缩放
    readonly MaxScale: number;      // 最大缩放
    readonly InitScale: number;     // 初始缩放
    readonly ConditionId: number[]; // 所需解锁条件（建筑id）
    readonly ConditionLv: number[]; // 建筑等级
    readonly ItemsType: number[];   // 道具类型列表
    readonly ItemsId: number[];     // 所需道具
    readonly ItemCost: number[];    // 道具数量
    readonly BuildingID: number[];  // 新增建筑显示
    readonly Desc: string[];        // 新增建筑描述文本

}

/**建筑等级配置 */
export type StdBuilding = {
    readonly BuildingID: number;        // 建筑id
    readonly BuildingType: number;       //建筑类型
    readonly Level: number;             // 建筑等级
    readonly ConditionId: number[];     // 升级条件（建筑id）	
    readonly ConditionLv: number[];     // 升级条件值（对应建筑id的等级）	
    readonly RewardID: number[];           // 升级所需物品ID	
    readonly RewardNumber: number[];        // 升级所需物品数量
    readonly RewardType: number[];        // 升级所需物品数量
    readonly Money: number;             // 升级所需货币数量	
    readonly AttrFight: number[];
    readonly AttrFightValue: number[];
    readonly Attr: number[];
    readonly AttrValue: number[];
    readonly Texture: string;
    readonly Prefab: string;             // 预制
    readonly CollectEfficiencyPct: number;// 每个角色的采集效率加成
    readonly ConstructDuration?: number; // 建筑升级耗时
    readonly WorkingRolesNum?: number;   // 允许最大的工人数量
    readonly DefenseRolesNum?: number;   //驻守上限
    readonly RewardsPreview: number; //预览奖励（关联任务id）
    readonly produce_casting: number;
}


/**生产工坊 */
export type StdProduction = {
    readonly ID: number;//序号
    readonly BuildingId: number;//建筑id
    readonly ItemID: number;//生产道具ID
    readonly Type: number;//分类类型（切页序号）
    readonly Time: number;//单个生产时长（秒）
    readonly CostItemID: number[];//消耗道具id
    readonly Num: number[];//消耗道具数量
    readonly Show: number;//显示排序
    readonly ConditionID: number[];//配方解锁条件
    readonly ConditionValue: number[];//解锁条件(值）
    readonly Limit: number;//生产道具上限
    readonly CostType: number[];//消耗道具的类型
}
/**事物对应道具表映射id */
export enum ThingItemId {
    ItemId_1 = 1, //彩虹石
    ItemId_2 = 2, //金币
    ItemId_3 = 3, //辉耀石
    ItemId_5 = 5, //鱼票
    ItemId_6 = 6, //木材
    ItemId_7 = 7, //矿石
    ItemId_8 = 8, //水源
    ItemId_9 = 9, //种子
    ItemId_16 = 16, //钓鱼体力
    ItemId_74 = 74,//勋章
    ItemId_201 = 201, //幻彩石
    ItemId_202 = 202, //宝石积分
}
/**事物大类枚举 */
export enum ThingType {
    ThingTypeItem = 1,  // 道具
    ThingTypeCurrency,  // 彩虹体
    ThingTypeGold,      // 金币
    ThingTypeEquipment, // 装备
    ThingTypeRole,      // 角色
    ThingTypeResource,  // 资源
    ThingTypeGemstone,  // 原石
    ThingTypesFuncValue = 8,  //功能数值
    ThingTypeMedal = 74,  //勋章
    ThingTypeGem = 77,  //宝石
}
/**事物小类枚举 */
export enum ThingSubType {
    ItemType_0,
    ItemType_1,
    ItemType_2,
    ItemType_3,
    ItemType_4,
    ItemType_5,
    ItemType_6,
    ItemType_7,
    ItemType_8,
    ItemType_9,
}
/**资源枚举 */
export enum ResourceType {
    wood = 1,
    water,
    rock,
    seed
}
export enum ResourceName {
    "古木" = 1,
    "石灵",
    "水宝",
    "源种"
}

/**功能数值枚举 */
export enum FuncValueType {
    strength = 1,//体力
}
export enum FuncValueTypeName {
    "体力" = 1,
}

/**道具类型枚举 */
export enum ItemType {
    money = 1, // 货币
    box,       // 宝箱
    material,  // 材料
    exp,       // 经验道具
    shard,     // 角色碎片
    speed,     // 加速道具
    shield = 8,    // 防护罩
    rights = 9,     //权益卡
}
/**背包页签类型 */
export enum ItemSubType {
    material = 1, // 材料，资源
    cost,         // 经验道具，宝箱道具等可消耗
    shard,        // 碎片，合成
    weapon        // 装备
}
/**物品枚举 */
export enum ItemQuality {
    N = 1,
    R,
    sR,
    ssR,
    UR
}

/**道具配置 */
export type StdItem = {
    readonly Items: number;           // 道具id
    readonly ItemPrice: number;           // 道具价值
    readonly NameType: number;//是否显示效果文本
    readonly ItemName: string;        // 道具名字
    readonly Type: number;            // 道具大类
    readonly Itemtpye: number;        // 道具类型
    readonly ItemEffect1: number;     // 道具效果1
    readonly ItemEffect2: number;     // 道具效果2
    readonly ItemEffect3: number;     // 道具效果3
    readonly Quality: number;         // 道具品质
    readonly Icon: string;            // 道具图标
    readonly LockTime: number          // 交易冷却时间
    readonly StackLimit: number;      // 堆叠上限
    readonly SubType: number;         // 切页分类
    readonly Remark: string;          // 说明
    readonly SkipGet: any[];          // 获取途径
    readonly Tradetype: number;       // 是否可交易
    readonly Sort: number;            // 排序
    readonly SpecialDisplay: number;  // 特殊展示
    readonly ConditionId: any[];      // 道具使用前置
    readonly ConditionLv: number[];   // 道具使用提交
    readonly Button: any[];           // 道具按钮
    readonly Givetype: number;        // 是否可赠送
}

export type StdLevel = {
    readonly ID: number;
    readonly Name: string;
    readonly ChapterName: string;
    readonly Chapter: number;
    readonly Map: number;
    readonly LevelID: number;
    readonly LevelType: number;
    readonly ConditionId: number[];
    readonly ConditionValue: number[];
    readonly Power: number;
    readonly RewardType: number[];
    readonly RewardID: number[];
    readonly RewardNumber: number[];
    readonly SweepPower: number;
    readonly sweepType: number[];
    readonly sweepID: number[];
    readonly sweepNumber: number[];
    readonly ItemAttrSub?: AttrSub[];
    readonly Monsters?: number[];
    readonly Position1?: number;
    readonly Position2?: number;
    readonly Position3?: number;
    readonly Position4?: number;
    readonly Position5?: number;
}

/**属性配置 */
export type StdAttr = {
    readonly ID: number;
    readonly Type: number;
    readonly Name: string;
    readonly Description: string;
    readonly Per: number;
    readonly Max: number;
    readonly Min: number;
    readonly Power: number;
    readonly Signal: string; // 短名
    readonly Icon: string;   // 图标
}

export enum AttrType {
    HP = 1,
    Attack = 2,
    MoveSpped = 3,
    SkillCD = 4,
    Critical = 5,
    Evade = 6,
    Shield = 7
}

/**角色配置 */
export type StdRole = {
    readonly RoleType: number;           //角色类型id
    readonly FollowerType: number[];     //携带随从类型
    readonly NpcType: number;            //"角色类型1卡牌 2建筑3怪物"
    readonly Quality: number;            //初始品质（1N 2R 3SR 4SSR 5UR）
    readonly PositionType: number;       //职业类型（1前排 2输出 3辅助）
    readonly Prefab: string;             //对应模型
    readonly AIId: number;               //对应AI
    readonly Skill1: number;             //初始技能1
    readonly Skill2: number;             //初始技能2
    readonly Skill3: number;             //初始技能3
    readonly PassiveGife: number,         //初始天赋1
    readonly PassiveJob: number,          //职业天赋1
    readonly AttrFight: number[];        // 战斗属性
    readonly AttrFightValue: number[];   // 战斗属性值
    readonly Attr: number[];             // 采集属性
    readonly AttrValue: number[];        // 采集属性值

    readonly AttackRange: number;        //初始攻击范围
    readonly CriticalPct: number;        //初始暴击率
    readonly Icon: string;               //头像
    readonly Scale: number;              //缩放
    readonly Voice: string;              //语音
    readonly Figure: string;             //立绘
    readonly Anigroup: number[];         //动作组
    readonly BloodHight: number[];       //血条高度
    readonly PieceItem: number;          //合成碎片id
    readonly PieceItemNum: number;       //合成碎片数量
    readonly Name: string;               //角色名
    readonly Synopsis: string;           //简介
    readonly PassiveMAX: number;         //最大被动技能数
    readonly RoleTypeQual: number;        //角色类型品质
    readonly isHeroGallery: number;        //角色图鉴展示

}

/**角色等级配置 */
export type StdRoleLevel = {
    readonly RoleType: number;           // 角色类型id
    readonly Level: number;              // 角色等级
    readonly Exp: number;                // 升级经验
    readonly BreakItem: number[];          // 突破材料
    readonly BreakCost: number[];          // 突破材料数量
    readonly Cost: number;               // 彩虹梯数量
    readonly AttackRange: number;        // 升级攻击范围
    readonly CollectEfficiency: number;  // 基础采集效率
    readonly AttrFight: number[];        // 战斗属性
    readonly AttrFightValue: number[];   // 战斗属性值
    readonly Attr: number[];             // 采集属性
    readonly AttrValue: number[];        // 采集属性值
    readonly ConditionId: number[];       //升级条件组
    readonly ConditionLv: number[];      //升级条件值
    readonly TaskID: number;             //升级奖励
    readonly Power: number;             //战力预览

}

/**属性枚举 */
export enum Attr {
    CollectEfficiency = 1,	    // 采集效率
    CollectEfficiencyPct,	    // 采集效率百分比
    CollectDuration,	        // 可采集时长
    CollectDurationPct,	        // 可采集时长百分比
    WoodCollectEfficiency,	    // 原木采集效率
    WoodCollectEfficiencyPct,	// 原木采集效率百分比
    WaterCollectEfficiency,	    // 纯水采集效率
    WaterCollectEfficiencyPct,	// 纯水采集效率百分比
    RockCollectEfficiency,	    // 顽石采集效率
    RockCollectEfficiencyPct,	// 顽石采集效率百分比
    SeedCollectEfficiency,	    // 种子采集效率
    SeedCollectEfficiencyPct,	// 种子采集效率百分比
    WoodCollectDuration,	    // 原木可采集时长
    WoodCollectDurationPct,	    // 原木可采集时长百分比
    WaterCollectDuration,	    // 纯水可采集时长
    WaterCollectDurationPct,	// 纯水可采集时长百分比
    RockCollectDuration,	    // 顽石可采集时长
    RockCollectDurationPct,	    // 顽石可采集时长百分比
    SeedCollectDuration,	    // 种子可采集时长
    SeedCollectDurationPct,	    // 种子可采集时长百分比
    ALLConscriptNumMax,	        // 所有兵种征兵最大数量
    DefenseAttackVal,	        // 驻守角色攻击值
    DefenseAttackPct,	        // 驻守角色攻击百分比
    DefenseHPMax,	            // 驻守角色生命值
    DefenseHPMaxPct,	        // 驻守角色生命百分比
    ConstructDuration,	        // 建造时间值
    ConstructDurationReduce,	// 建造时间减少值
    ConstructDurationReducePct,	// 建造时间减少百分比
    ProduceDuration,	        // 生产时间值
    ProduceDurationReduce,	    // 生产时间减少
    ProduceDurationReducePct,	// 生产时间减少百分比
    SoldierMAX,	                // 士兵储存上限
    SoldierMAXPct,	            // 士兵储存上限百分比
    LeaderShip,	                // 统御力
    LeaderShipPct,	            // 统御力百分比
    LesionPct,	                // 损伤百分比
    SkillLevel,	                // 技能等级

}

/**战斗属性 */
export enum AttrFight {
    HPMax = 1,	        // 最大生命力
    HPMaxPct,	        // 生命力百分比
    HPCur,	            // 当前生命力
    AttackVal,	        // 攻击力
    AttackPct,	        // 攻击力百分比
    AttackSpeed,	    // 攻速
    AttackSpeedPct,	    // 攻速提升百分比
    StaminaPct,	        // 生命每秒恢复
    GroundMoveSpeed,	// 移动速度
    GroundMoveSpeedPct,	// 移动速度百分比
    SkillCD,	        // 技能冷却
    SkillCDPct,	        // 技能冷却缩减
    CriticalPct,	    // 暴击率
    CriticalIncrPct,	// 暴击率百分比
    CriticalDmgPct,	    // 暴击伤害
    EvadeProb,	        // 闪避率
    ShieldCoverMax,	    // 护盾最大值
    ShieldCoverCur,	    // 护盾当前值
    HitResumeVal,	    // 击中生命恢复
    KillResumeVal,	    // 击杀生命恢复
    DamageReduce,	    // 伤害减免
    DamageIncrease,	    // 伤害增幅
    Vampire,	        // 吸血
    Block,	            // 格挡
    HitMeat,	        // 克制肉盾
    BehitMeat,	        // 被肉盾克制
    HitWarrior,	        // 克制战士
    BehitWarrior,	    // 被战士克制
    HitShooter,	        // 克制射手
    BehitShooter,	    // 被射手克制
    HitAssist,	        // 克制辅助
    BehitAssist,	    // 被辅助克制

}

/**功能跳转配置 */
export type Fetch = {
    readonly Shortcut: number;              // 序号
    readonly WinName: string;               // 功能名
    readonly Desc: string;                  // 描述
    readonly Icon: string;                  // 功能图标
    readonly Win: string;                   // 界面名称
    readonly Param: any[]                    // 参数
}

/**宝箱类型 */
export enum BoxType {
    random = 1,
    select,
    all,
}

/**宝箱配置 */
export type RewardBox = {
    readonly ItemID: number;
    readonly Boxtype: number;
    readonly Repeat: number;
    readonly RewardNum: number;
    readonly Types: number[];
    readonly Items: number[];
    readonly ItemsNum: number[];
    readonly Probability: number[];
    readonly Limit: number;
    readonly Text: string;
}

export enum StdCommonType {
    RoleQualityuo = 1,
    PVP,
    PVE,
    Bourse,
    Seed,
    RoleAtttr,
    Mail,
    Fish,
    Task,
    Compound,
    Friend,
    Gather,
    Home,
    Camera,
    Gem = 19,
}

/**公用配置 */
export type StdCommon = {
    readonly ModuleId: number; //繁育英雄等级经验返还比率（向上取整
    readonly ModuleKey: string;
    readonly ModuleName: string; //家园抢夺当前选择赛季模式
    readonly ConfigValues: any;   //pve免费挑战次数
    readonly MailCost: number;//收件收取手续费
}

/**交易所配置 */
export type Bourse = {
    readonly Id: number; //商品id
    readonly Name: string;//商品名字
    readonly WaresType: number; //商品大类
    readonly ShowType: number;   //商品分页
    readonly ItemId: number; //道具id
    readonly Roletype: number; //角色类型
    readonly Rolequality: number; //角色品质
    readonly LowestPrice: number; //最低单价
    readonly HighestPrice: number; //最高单价
    readonly Mini: number; //上架最少数量
    readonly Stack: number; //上架最大数量
    readonly Single: number; //每次增加数量
    readonly ShowID: number;//展示筛选条件
    readonly Group: number;
    readonly GroupName: string
    readonly Book_LowestPrice: number; //求购最低组单价
    readonly Book_HighestPrice: number; //求购最高组单价

}

/**交易所配置 */
export type Selection = {
    readonly EnumerateID: number; //枚举序号
    readonly Icon: string; //图标
    readonly Value: number[];   //条件值
    readonly EnumerateDesc: string; //描述
    readonly Group: number; //所在分组
    readonly GroupDesc: string; //分组描述
}

/**被动技能配置 */
export type StdPassiveLevel = {
    readonly ID: number;
    readonly Icon: string;
    readonly Desc: string;
    readonly Level: number;
    readonly RewardType: number[];
    readonly RewardID: number[];
    readonly RewardNumber: number[];
    readonly ResoureType: number;
    readonly RareLevel: number;
    readonly QualityType: number;
    readonly Argu1: string;
    readonly Argu2: string;
    readonly Argu3: string;
    readonly Argu4: string;
    readonly Argu5: string;
    readonly Argu6: string;
    readonly Name: string;
    readonly AttrFight: number[];//增加战斗属性类型
    readonly AttrFightValue: number[];//增加战斗属性值
    readonly Attr: number[];//增加采集属性类型
    readonly AttrValue: number[];//增加采集属性值
}
/**
 * 主动技能配置
 */
export type StdActiveSkill = {
    readonly SkillId: number,//技能id
    readonly SkillType: number,//技能等级
    readonly Name: string,//技能名称
    readonly icon: number,//技能图标id
    readonly Quality: number,//技能品质
    readonly Text: string,//技能描述
    readonly AttrFight: number[],//战斗属性
    readonly AttrFightValue: number[],//战斗属性值
    readonly Attr: number[],//采集属性
    readonly AttrValue: number[],//采集属性值
}
/**
 * 钓鱼湖泊配置
 */
export type StdLake = {
    readonly LakesId: number,//湖泊id
    readonly Lakesname: string,//湖泊名字
    readonly Res: string,//资源
    readonly Weight: string,//冰封权重
}
/**
 * 钓鱼（鱼竿）/炸鱼（炸弹）
 */
export type StdFishRod = {
    readonly ID: number,//id
    readonly RodName: string,//名字
    readonly TypeId: number,//类型用途id
    readonly Type: number,//用途类型
    readonly MinValue: number,//最小投入
    readonly MaxValue: number,//最大投入
}
/**
 * 钓鱼鱼种配置
 */
export type StdFishItem = {
    readonly FishsId: number,//鱼id
    readonly Fishsname: string,//鱼名字
    readonly Icon: string,//图标
    readonly Res: string,//动画资源
    readonly Weightmin: number,//出现最小重量
    readonly Weightmax: number,//出现最大重量
    readonly Quality: string,//鱼的品质
    readonly Remark: string,//说明
}

/**
 * 钓鱼通用配置
 */
export type StdFishCommon = {
    readonly KillType: number[],//击杀模式
    readonly Opentime: string[],//开放时间
    readonly OpenLevel: number,//开放等级
    readonly RoundTime: number,//回合时间
    readonly RoundFrozenTime: number,//回合冰冻时间
    readonly Round: number,//回合结算时间
    readonly InitialFatigue: number,//初始疲劳值
    readonly FatigueResetTime: number,//疲劳值重置时间
    readonly DailyCostMax: number,//每日投入上限
    readonly RoundCostMax: number,//回合投入上限
    readonly ConvertPrice: number,//道具转换价格(彩虹币)
    readonly ConvertItem: number[],//道具转换获得的道具ID
    readonly ConvertItemCount: number[],//道具转换获得的道具数量
    readonly CostItemID: number,//投入消耗的道具ID(鱼饵)
    readonly CostSelectType: number[],//投入选项 (每次投入鱼饵的可选数量)
    readonly SettlementFrozenVictoryFct: number,//结算给冰封胜利玩家奖励比例  (1=100%)
    readonly SettlementNotFrozenVictoryFct: number,//结算给非冰封胜利玩家奖励比例  (1=100%)
    readonly FrozenOperateRote: number,//冰封时提杆可操作进度条占比（0-1）
    readonly OperateRote: number,//提杆可操作进度条占比（0-1）
    readonly FishTagSpeed: number,//钓鱼光标移动速度
    readonly ScoreItemId: number,//积分道具
    readonly RankRewardTime: string,//排行榜发放时间
    readonly FishItemBagMax: number,//鱼背包最大储存数量
    readonly RankDistributeType: number[],//排行榜分配人数类型 (高手，空杆，幸运)0=比例,1=绝对值
    readonly RankDistribute: number[],//排行榜分配人数 (高手，空杆，幸运)
    readonly RankScoreUpdateLimit: number[];//排行榜入榜条件(高手，空杆，幸运)
    readonly LuckRankLimitCount: number,//幸运榜限制至少参数次数
    readonly AfterLimitConvertItem: number[],//道具转换获得的道具ID
    readonly AfterLimitConvertItemCount: number[],//道具转换获得的道具数量（超出限制后的兑换内容）
    readonly LimitConvertCountDaily: number,//兑换每日限制
}
/**系统开启配置 */
export type StdFishShop = {
    readonly ShopItemID: number;//商品ID
    readonly ItemId: number;//出售的道具ID
    readonly ItemCount: number;//出售的道具数量
    readonly BuyCountMax: number;//周期内最大可购买次数
    readonly FishScorePrice: number;//钓鱼积分价格
    readonly CurrencyPrice: number;//彩虹币价格
}
/**通用条件类型 */
export enum ConditionType {
    Lock,
    Home_1 = 1,           // 家园1等级
    Home_2,               // 家园2等级
    Home_3,               // 家园3等级
    PlayerPower,          // 玩家战力
    Task,                 // 完成任务id为X的任务
    Guide,                // 完成指引id为X的新手指引
    Role,                 // 拥有指定id为x的英雄角色
    Wood,                 // 木材数量大于等于x
    Rock,                 // 石头数量大于等于x
    Seed,                 // 种子数量大于等于x
    Water,                // 纯水数量大于等于x
    moonCard,             // 是否拥有月卡
    rights,               // 是否有指定权益
    FishStart = 101,      // 钓鱼大赛活动开启
    FishOnIce,            // 玩家在冰封湖泊钓到大鱼
    FishClose,            // 钓鱼大赛活动关闭
    Home101_WoodLevel = 1002,   // 家园1采木场建筑等级
    Home101_RockLevel,          // 家园1采矿场建筑等级
    Home101_WaterLevel,         // 家园1采水场建筑等级
    Home101_SeedLevel,          // 家园1采能场建筑等级
    Home101_HeChengLevel,       // 家园1合成工坊建筑等级
    Home101_FanyuLevel,         // 家园1繁育巢建筑等级
    Home101_ProductLevel,       // 家园1生产工坊建筑等级
    Home101_Tower1Level,        // 家园1防御塔1建筑等级
    Home101_Tower2Level,        // 家园1防御塔2建筑等级
    Home101_BingLevel,          // 家园1兵营建筑等级
    Home101_DoorLevel,          // 家园1城墙大门建筑等级
    Home201_WoodLevel = 2002,   // 家园2采木场建筑等级
    Home201_RockLevel,          // 家园2采矿场建筑等级
    Home201_WaterLevel,         // 家园2采水场建筑等级
    Home201_SeedLevel,          // 家园2采能场建筑等级
    Home201_HeChengLevel,       // 家园2合成工坊建筑等级
    Home201_FanyuLevel,         // 家园2繁育巢建筑等级
    Home201_ProductLevel,       // 家园2生产工坊建筑等级
    Home201_Tower1Level,        // 家园2防御塔1建筑等级
    Home201_Tower2Level,        // 家园2防御塔2建筑等级
    Home201_BingLevel,          // 家园2兵营建筑等级
    Home201_DoorLevel,          // 家园2城墙大门建筑等级
    Home301_WoodLevel = 3002,   // 家园3采木场建筑等级
    Home301_RockLevel,          // 家园3采矿场建筑等级
    Home301_WaterLevel,         // 家园3采水场建筑等级
    Home301_SeedLevel,          // 家园3采能场建筑等级
    Home301_HeChengLevel,       // 家园3合成工坊建筑等级
    Home301_FanyuLevel,         // 家园3繁育巢建筑等级
    Home301_ProductLevel,       // 家园3生产工坊建筑等级
    Home301_Tower1Level,        // 家园3防御塔1建筑等级
    Home301_Tower2Level,        // 家园3防御塔2建筑等级
    Home301_BingLevel,          // 家园3兵营建筑等级
    Home301_DoorLevel,          // 家园3城墙大门建筑等级
    RedPoint_PerMail = 4001,          // 个人有新邮件
    RedPoint_PerMailReward,          // 个人有可领取邮件
    RedPoint_SysMail,          // 系统有新邮件
    RedPoint_SysMailReward,          // 系统有可领取邮件
    RedPoint_BagPiece,          // 背包有可合成的英雄碎片
    RedPoint_BagBox,          // 背包有可点击使用的宝箱道具
    RedPoint_Fish,          //钓鱼活动入口
    RedPoint_FishShopCanBuy,          // 背包中鱼票可购买钓鱼商店的任意道具
    RedPoint_FishShopCanSell,          // 钓鱼商店中有可出售的鱼
    RedPoint_FishShopBtn,          // 钓鱼商城入口
    RedPoint_Role,                    // 角色主界面红点
    RedPoint_HomeUnLock,          // 多家园达到可解锁条件时
    RedPoint_OutdoorTime,          // 探险有免费次数时/有足够的道具进入
    RedPoint_LootTime,          // 掠夺有免费次数时/有足够的道具进入
    RedPoint_CollectTime,          // 采集时长有可补充次数时（包括看广告领取
    RedPoint_CanCompound = 4029,          // 合成工坊道具足够合成时
    Role_Can_tupo,                 // 足够的资源让角色突破
    RedPoint_BombFish = 4033,          //杂鱼入口
    RedPoint_Flip,          //翻翻乐入口
}

/**
 * 功能说明配置
 */
export type StdInstructions = {
    readonly ID: number,//id
    readonly Desc: string,//描述
}
/**钓鱼状态 */
export enum FishRoundState {
    No = 0, //回合未开启
    Select,//选湖阶段
    LiftRod,//提竿阶段
    Settle,//结算阶段
    NoSelect,//未选择湖泊
    NoFishing,//未垂钓
    NoStart,//回合未开始
}
/**运鱼状态*/
export enum FishTradeRoundState {
    No = 0, //回合未开启
    Select,//选气球阶段
    Departure,//起飞阶段
    Settle,//结算阶段
    NoSelect,//未选择气球
    NoFishTrade,//未参加运鱼
    NoStart,//回合未开始
}
/**炸鱼状态 */
export enum FishBombRoundState {
    NoOpen = 0, //活动未开始
    NoRound,//没有回合进行中
    CanCastBomb,//可投弹阶段
    BombBlasts,//炸弹爆炸阶段
    StageSettle,//xiao回合结算
    RoundSettle,//回合结算阶段

}
/**任务配置 */
export type StdTask = {
    TaskId: number,//任务ID
    TaskType: number,//任务类型
    Show: number,//任务类型
    CompletionConditions: number,//完成条件
    ShowTask: number,//是否主线任务
    CompletionValue: number[],//完成条件值（英雄ID配0表示不对英雄ID有要求）；用于满足日常任务-升级建筑、升级英雄等泛任务
    CompletionNum: number,//完成次数
    TaskName: string,//完成次数
    Description: string,//描述
    ConditionId: number[],//接受条件
    ConditionValue: number[],//接受条件值
    PrerequisiteTasks: number[],//前置任务
    TasksGroup: number,//任务组
    CompletionType: number,//完成方式（1自动，2手动）
    ProgressDisplay: number,//进度显示
    RewardType: number[],//奖励大类
    RewardID: number[],//任务奖励
    RewardNumber: number[],//奖励数量
    RronyRewardNum: number,//贡献奖励详情（原石）
    CronyLevel: number[],//好友层级
    CronyReward: number[],//好友奖励比率
    Win: string,//前往id
    Param: any[],//前往id
    ResetType: number,//重置类型 1每日2每周3每月4成就
    ActiveTaskValue: number,//活跃度
    WeekActiveTaskValue: number,//周活跃度
}

/**步骤配置 */
export type StdStep = {
    readonly Step: number;
    readonly StepType: number;
    readonly UI: string;
    readonly Desc: string[];
    readonly Towards: number;
    readonly Offset: number[];
    readonly Size: number[];
}

/**指引配置 */
export type StdGuide = {
    readonly ID: number;
    readonly Type: number;
    readonly Times: number;
    readonly ConditionId1: number[];
    readonly ConditionValue1: number[];
    readonly Step: number[];
    readonly CloseConditionId: number[];
    readonly CloseConditionValue: number[];
}

/**红点指引 */
export type StdRedPoint = {
    readonly ID: number;
    readonly Desc: string;
    readonly ConditionId1: number[];
    readonly ConditionValue1: number[];
    readonly Step: number[];
}

//掠夺排行配置
export type StdLootRank = {
    /**排行榜奖池模式 */
    ListModeID: number,
    /**排行榜类型(1常规、2幸运奖) */
    ListType: number,
    /**名次 */
    Ranking: number[],
    /**名次称号*/
    title: string
    /**资源奖励比率 */
    RoughReward: number,
    /**彩虹体比率 */
    RainbowReward: number,
    /**额外奖励大类 */
    RewardType: number[],
    /**额外奖励类型 */
    RewardItemType: number[],
    /**额外奖励详情 */
    RewardNumber: number[],
}
//掠夺赛季配置
export type StdPVPSnatch = {
    /**赛季模式ID */
    MatchID: number,
    /**赛季图文 */
    View: number,
    /**赛季开启日期 */
    MatchStartTime: string,
    /**赛季结算时间 */
    MatchCloseTime: string,
    /**赛季结束时间/D */
    MatchEddTime: string,
    /**排行榜奖池模式 */
    JackpotType: number,
    /**每日免费抢夺次数 */
    AttackTime: number,
    /**增加次数消耗道具 */
    ConsumeItem: number,
    /**消耗道具数量 */
    ConsumeNumber: number,
    /**购买花费彩虹体 */
    Money: number,
    protect_effect: number,
    /**每次可增加次数 */
    AddTime: number,
    /**抢夺奖励系数模式 */
    AttackRewardType: number,
    /**单日能被攻击次数 */
    BeAttackTime: number,
    /**匹配区间（基地等级） */
    Mate: number[],
    /**N天内有登录玩家 */
    Active: number,
    /**排行榜积分门槛 */
    ResoureScore: number,
    /**开奖最低人数需求 */
    JoinNumber: number,
    /**单区间匹配时长/s */
    MateTime: number,
    /**匹配总时长/s */
    MateTimeMax: number,
    /**匹配总时长/s */
    MateCDAdd: number,
    /**是否使用特殊匹配 */
    SpecialMate: number,
    /**第几次特殊匹配 */
    SpecialTime: number,
    /**匹配到机器人的几率和组 */
    RobotOdds: number[],
    /**匹配到boss几率和组 */
    BossOdds: number[],
    /**是否激活使用道具模式 */
    PropMode: number[],
    /**是否是特殊显示 */
    hide_message: number,
}

/**商店类型*/
export enum ShopType {
    DayShop = 1,//每日商城
    WeekShop,//每周商城
    LuckyShop,//抽奖商城
    GemShop,//宝石商城
    PvpShop,//pvp商城
    TempShop,//临时商店
    WorldBossShop,//世界boss商店
    GemConversion = 9999,//前端自定义商店类型
}

/**商店组id*/
export enum ShopGroupId {
    BaseShop = 1,//基础商城
    GemShop, //宝石商城
    PvpShop, //Pvp商城
    WorldBossShop, //世界boss商城
}

//商城配置
export type StdShopIndex = {
    readonly ID: number,//商城id
    readonly ShopGroupId: number,//商城组id
    readonly ShopType: number,//商城类型
    readonly TabSort: number,//页签排序权重小->大
    readonly ShopIndexType: number,//商城索引类型
    readonly ShopName: string,//商城页签名称
    readonly ShopID: number,//普通商店ID (Shop表)
    readonly LuckyID: number,//抽奖商店ID （ShopLucky表）
    readonly TitleImgRes: string, //商城标签资源
    readonly MoneyType: number[];//商城所用到的消耗大类
    readonly MoneyID: number[];//商城所用到的消耗小类
    readonly SystemOpen: number;//商城是否开启
}
//通用商城配置
export type StdShop = {
    readonly ID: number,//商城id
    readonly OpenTime: number,//持续时间
    readonly RefreshCondition: number,//刷新类型 (0=不刷新,1=定时刷新,2=手动刷新)
    readonly RefreshTimeType: number,//刷新基准 (0=日内刷新，1=周内刷新)
    readonly RefreshTimeValue: number,//自动刷新参数 （基于刷新基准的时分）
    readonly IsCanManualRefresh: number,//是否可以手动刷新 
    readonly AdId: number,
    readonly RefreshThingType: number[],//手动刷新物品类型
    readonly RefreshThingId: number[],//手动刷新消耗
    readonly RefreshThingCount: number[],//手动刷新消耗
    readonly GoodsPoolId: number,//商品库id
    readonly GoodsLimit: number,//商品数量上限
    readonly ShopOpen: number[],//可购买周期
}
//抽奖商城配置
export type StdShopLucky = {
    readonly CardpoolId: number,//奖池id
    readonly OpenTime: number,//持续时间
    readonly Sequence: number,//奖池显示顺序
    readonly CardPoolName: string,//奖池名字
    readonly AdTime: number,//激励广告id
    readonly Banner: string,//奖池banner
    readonly RewardPools: number,//卡池ID
    readonly FreetimesX1: number,//单次抽卡免费次数
    readonly ConsumeX1Type: number[],//单次抽消耗道具类型
    readonly ConsumeX1ItemId: number[],//单次抽消耗道具id
    readonly ConsumeX1Cost: number[],//单次抽消耗道具数量
    readonly FreetimesX10: number,//十抽免费次数
    readonly ADTimes: number,//广告次数
    readonly ConvertToConsumeType: number[],//转换到抽卡消耗道具类型
    readonly ConvertToConsumeItemId: number[],//转换到抽卡卡池消耗道具id
    readonly ConvertToConsumeCost: number[],//转换到抽卡卡池消耗道具数量
    readonly Frequency: number,//每日抽奖次数
    readonly LuckyBgRes: string,//背景资源
    readonly LuckyTitleRes: string,//标题资源
    readonly PoolQual: number,//奖池品质
    readonly ConsumeX100Type: number,//是否可以100抽
}
//抽奖商城奖池配置
export type StdShopLuckyPool = {
    readonly RewardPools: number,//卡池ID
    readonly RewardType: number[],//奖池奖励类型
    readonly RewardId: number[],//奖池奖励id
    readonly RewardNumber: number[],//奖池奖励数量
    readonly Probability: number[],//奖品概率
    readonly GetNumber: number,//必出次数
    readonly Target: number[],//标记奖品位置(从0开始)
    readonly TargetProbability: number[],//标记奖品概率
    readonly Instructions: number,//说明帮助id
}
//通用商品配置
export type StdShopCommodity = {
    readonly Id: number;//商品id
    readonly Goodstype: number[],//商品内容类型
    readonly GoodsID: number[],//商品内容id
    readonly GoodsNum: number[],//商品内容数量
    readonly CostType: number[],//商品对应消耗类型
    readonly CostID: number[],//商品对应消耗id
    readonly CostNumber: number[],//商品对应消耗数量
    readonly GoodAmount: number,//商品限购数量
    readonly Order: number,//商品排序
    readonly Discount: number,//商品折扣
    readonly LimitBuyTime: number,//限购时间(秒)
}
//系统消息类型
export enum SysMessagType {
    Marquee = 1,//跑马灯
    Channel,//系统频道
    MarqueeAndChannel,//跑马灯 + 系统频道
    AllServerEffect, //全服特效
}
//消息id
export enum MessagId {
    Messag_19 = 19,//建筑升级至XX级
    Messag_20 = 20,//建筑建造完成
    Messag_21 = 21,//生产工坊有任意制作完成
    Messag_22 = 22,//采集时长用完，采集结束
    Messag_23 = 23,//兵营招募完成
    Messag_24 = 24,//交易所商品被购买
    Messag_25 = 25,//交易求购商品有人出售
    Messag_26 = 26,//钓鱼商城出售鱼类
    Messag_27 = 27,//激活使用权益卡时
    Messag_32 = 32,//钓鱼活动开始
}

//商城组自定义配置
export type StdShopGroup = {
    ShopGroupId: ShopGroupId,//商城组id
    ShopType: ShopType,//商城页签类型
    TabSort: number,//页签排序
    ShopName: string,//商城页签名字
}
//抽奖商城自定义配置
export type StdLuckyShop = {
    shopId: number,//商城id
    shopStd: StdShopLucky,//商城配置
}

//消息类型配置
export type StdMessag = {
    Serialnumber: number,//配置序号
    MessageType: number,//消息类型
    Content: string,//文本内容
}
//家园id
export enum StdHomeId {
    Home_101 = 101,
    Home_201 = 201,
    Home_301 = 301,
}

//角色宝箱配置
export type StdRewardRole = {
    readonly RewardID: number,//id
    readonly RoleName: string,
    readonly RoleType: number,//角色类型
    readonly RoleLevel: number,//角色等级
    readonly RoleQuality: number,//角色品质
    readonly PassiveId: number[],//额外被动id
    readonly PassiveLevel: number[],//被动等级
    readonly Skilllevel: number[],//主动等级
    readonly Solids: number,//额外带兵数量

}
//广告id定义
export enum AdvisterId {
    Advister_1 = 1,//采集时长广告
    Advister_2,//普攻抽奖次数
    Advister_3,//商量免费道具广告
    Advister_4,//间隔性广告
}
//角色宝箱配置
export type StdAdvister = {
    readonly Ad_ID: number,//广告id
    readonly Max_numb: number,//每日广告次数上限
    readonly Ad_CD: number,//广告冷却时间
    readonly AcquisitionTime: number;//增加采集时长
    readonly RewardType: number[],//广告奖励大类
    readonly RewardID: number[],//广告奖励id
    readonly RewardNumber: number[],//广告奖励数量
}
//广告id定义
export enum StdSysId {
    Sys_1 = 1,//背包
    Sys_2,//角色
    Sys_3,//交易
    Sys_4,//邮件
    Sys_5,//好友
    Sys_6,//采集时长
    Sys_7,//pvp
    Sys_8,//任务
    Sys_9,//pve
    Sys_10,//多家园
    Sys_11,//钓鱼
    Sys_12,//商店
    Sys_13,//繁育
}
/**
 * 系统开启配置
 */
export type StdSystemOpen = {
    readonly ID: number;//系统id
    readonly Name: number;//系统名称
    readonly ConditionId1: number[];//条件1
    readonly ConditionValue1: number[];//条件1值
    readonly ConditionId2: number[];//条件2
    readonly ConditionValue2: number[];//条件2值
    readonly Panel: string[];//界面组
    readonly HideType: number;//隐藏类型0(空)消失1灰色2锁图标
    readonly Step: number[];//入口1
    readonly Tips: string;
}

/**
 * 货币流水配置
 */
export type StdTransactionInfo = {
    readonly ConditionId: number;//
    readonly Desc: string;//
    readonly Text: string;//

}
export enum StdHeadType {
    Head = 1,//头像
    HeadFrame,//头像框
};
/**
 * 头像配置
 */
export type StdHead = {
    readonly ID: number;//头像id
    readonly HeadType: number;//类型（1头像，2头像框）
    readonly LimitTime: number;//时限类型（0永久，>0限时）
    readonly ConditionId: number[],//解锁条件id
    readonly ConditionValue: number[],//解锁条件id
    readonly AttrFight: number[],//战斗属性
    readonly AttrFightValue: number[],//战斗属性值
    readonly Attr: number[],//采集属性
    readonly AttrValue: number[],//采集属性值
    readonly Quality: number;//品质  
    readonly HeadName: string;//头像名称
    readonly HeadDesc: string;//头像描述
    readonly IconRes: string;//头像资源  
}
/**登录一次性检测红点类型 */
export enum OneOffRedPointId {
    OffRedPoint_FishOpen = 1,//钓鱼开始
    OffRedPoint_FishShopBuy,//鱼商店可购买
    OffRedPoint_FishSell,//有鱼可出售
    OffRedPoint_RolePassiveSkill,//玩家被动技能
    OffRedPoint_FishTradeOpen,//运鱼开始
    OffRedPoint_FlipOpen,//翻翻乐开始
}
/**公会通用配置 */
export type StdGuildComm = {
    readonly NameMinLen: number,//公会名称最短长度
    readonly NameMaxLen: number,//公会名称最长长度
    readonly AnnouncementMaxLen: number,//公告最大长度
    readonly LeaderRoleID: number,//会长角色类型
    readonly ExitCdTime: number,//解散公会冷却时长（单位小时）
    readonly MessageLen: number,//心情留言字符限制
    readonly PlayerApplicationsMaxCount: number,//单个玩家最大申请数量
    readonly GuildApplicationsMaxCount: number,//单个公会最大申请数量
    readonly ApplicationsExpirationTime: number,//申请过期时间 (秒)
    readonly CreateGuildMinHomeLevel: number,//创建公会家园等级限制
    readonly JoinGuildMinHomeLevel: number,//加入公会家家园等级限制
    readonly BackDonateMaxCount: number,//公会银行最大储蓄次数
}
/**公会职位配置 */
export type StdGuildRole = {
    readonly ID: number,//职位id
    readonly Name: string,//职位名称
    readonly PostIcon: string,
    readonly Member: number,//职位最大数量
    readonly PermissioneName: number,//改名权限
    readonly PermissionLogo: number,//修改logo权限
    readonly PermissionJoin: number,//修改加入条件权限
    readonly PermissionEditAnnouncement: number,//编辑公告权
    readonly PermissionKickPlayer: number,//踢人权限 (可以踢该权限小于自己的人)
    readonly PermissionApplication: number,//申请审批权限
    readonly PermissionRoleAppointment: number;//职位任命 (可以赋予低于权限的人)
}
/**公会等级配置 */
export type StdGuildLevel = {
    readonly ID: number,//id
    readonly Exp: number,//升级到下一级所需经验
    readonly Member: number,//成员上限
    readonly FunctionOpen: number[],//开启功能
}
/**公会事件配置 */
export type StdGuildEvent = {
    readonly ID: number,//id
    readonly Name: string[],//升级到下一级所需经验
    readonly Content: string,//事件内容
}
/**公会logo配置 */
export type StdGuildLogo = {
    readonly ID: number,//id
    readonly Logo: string,//logo资源名
}
/**公会改名消耗配置 */
export type StdGuildChangeName = {
    readonly ID: number,//id
    readonly Count: number,//修改次数
    readonly CostType: number[],//修改公会名消耗类型
    readonly CostID: number[], //修改公会名消耗ID
    readonly CostCount: number[],//修改公会名消耗数量
}
/**公会类型配置 */
export type StdGuildType = {
    readonly ID: number,//id 1普通公会 2荣耀公会 3殿堂公会
    readonly Name: string;//类型名称
    readonly CreateCostType: number[],//创建公会花费消耗类别
    readonly CreateCostID: number[], //创建公会花费消耗ID
    readonly CreateCostCount: number[],//创建公会花费消耗数量
    readonly WarehouseIsOpen: number,//是否开启仓库功能
    readonly TypeIconRes: string,//公会类型资源标记
    readonly PrivilegeDescList: string[],//公会权益说明
}
/**公会银行配置 */
export type StdGuildBank = {
    readonly DonateId: number,//id 
    readonly SavingsType: number,//储蓄类型
    readonly Guild_Level: number,//解锁条件（公会等级）
    readonly TypeIcon: string,//储蓄类型图标
    readonly TypeBg: string,//储蓄类型底图资源
    readonly TypeNumBg: string,//储蓄次数底图资源
    readonly CostType: number[],//储蓄上交货币类型
    readonly CostId: number[], //储蓄上交货币Id
    readonly CostNum: number[],//储蓄上交货币数量
    readonly Duration: number,//持续时间（天）
    readonly MemberRebate: number,//成员基础利息(利息默认万分比)
    readonly guild_role: number[],//职位类型加成
    readonly AddRebate: number[],//职位类型加成值基础利息(利息默认万分比)
    readonly guild_type: number[],//公会类型加成
    readonly Guild_Rebate: number[],//公会类型加成值基础利息(利息默认万分比)
    readonly TotalRebateType: number[],//储蓄总额加成类型
    readonly TotalRebate: number[],//储蓄总额加成值（默认万分比)
    readonly TotalRebateRole: number[],//储蓄总额加成（生效职位）
    readonly Rebate_type: number,//利息货币类型
}
/**公会权益定义 */
export type StdGuildEquity = {
    readonly ID: number,//权益id
    readonly Type: number,//权益类型
    readonly Name: string,//权益名称
    readonly ChangeForm: string,//关联表格
    readonly ChangePara: string,//关联参数
    readonly Describe: string,//描述文本
    readonly GuildRole: number[],//职位参数详情（1.会长2.副会长3.管理）
    readonly RewardType: number[],//收益比率
}
/**公会银行日息收益类型 */
export type StdGuildBankType = {
    readonly CostType: number,//储蓄类型
    readonly Rebate_type: number,//利息类型
}
/**公会职位定义*/
export enum GuildPostType {
    President = 1,//会长
    VicePresident,//副会长
    Officer,//官员
    Member,//普通成员
}
/**公会类型定义*/
export enum GuildType {
    GeneralGuild = 1,//普通公会
    GloryGuild,//荣耀公会
    PalaceGuild,//殿堂公会
}
/**公会银行储蓄类型定义*/
export enum GuildSavingsType {
    General = 1,//普通
    High,//高级
    Goddess,//女神
}

/**公会权益id定义*/
export enum GuildEquityId {
    GuildEquity_1 = 1,
    GuildEquity_2,
    GuildEquity_3,
}
/**权益卡Tab配置 */
export type StdEquityCardTab = {
    readonly ID: number,//植灵卡id
    readonly Name: string,//植灵卡名称
    readonly EquityCardIds: number[],//权益ID
}
/**权益卡类型定义*/
export enum StdEquityType {
    Type_1 = 1, // 基础
    Type_2,    // 精致
    Type_3,    // 经典
    Type_4,    // 至尊
}
/**权益id */
export enum StdEquityId {
    Id_3 = 3,//赠送手续费（月卡）
    Id_4 = 4,//赠送手续费（终身卡）
    Id_9 = 9,//免广告（月卡）
    Id_10 = 10,//免广告（周卡）
    Id_19 = 19,//解锁生命树升级
}
/**权益卡配置 */
export type StdEquityCard = {
    readonly Equity_CardID: number,//植灵卡id
    readonly name: string,//植灵卡名称
    readonly Equity_list: number[],//权益ID
    readonly Item_Id: number;//对应的item
    readonly CardType: string;//权益卡类型
    readonly TabName: string;//tab按钮名称
    readonly GetEquityIcon: string;//获得权益大图
}

/**权益卡权益配置 */
export type StdEquityList = {
    readonly Equity_ID: number,//权益id
    readonly Equity_Type: number,//权益类型
    readonly Equity_Name: string,//权益类型名称
    readonly ChangeForm: string,//关联表格
    readonly ChangePara: string,//关联参数
    readonly Icon: string,//图标
    readonly describe: string,//文本
    readonly Value: number,//参数详情
    readonly RewardType: number[],//奖励大类
    readonly RewardID: number[],//奖励id
    readonly RewardNumber: number[],//奖励数量
    readonly TIme_Type: number,//持续时间
    readonly isHeroGallery: number,//是否显示权益 0 不显示 1显示
}
/**权益卡权益类型*/
export enum StdEquityListType {
    Type_1 = 1,//1.功能型权益；
    Type_2,//奖励性权益；
    Type_3,//采集时长；
    Type_4,//更改参数型 
    Type_5,//额外采集系数
    Type_6,//有效好友生效
    Type_7,//权益获取勋章

}
export type StdShopowner = {
    readonly ID: number;//
    readonly Uid: string;//联系渠道uid
    readonly Shopowner_Name: string;//渠道名称
    readonly QQid: string;//qq号
    readonly VXid: string;//微信号
}

export type StdProduceCasting = {
    readonly Roleid: number;//角色id
    readonly RoleQuailty: number;//角色品质
    readonly time: number;//生产时间单位（秒）
    readonly produce_casting: number;//每次采集熔铸石
    readonly produce_casting_lock: number; //角色绑定后每次采集熔铸石
}

export type StdProduceMedal = {
    readonly Roleid: number;//角色id
    readonly RoleQuailty: number;//角色品质
    readonly time: number;//生产时间单位（秒）
    readonly produce_medal: number;//每次采集勋章
    readonly produce_medal_lock: number; //角色绑定后每次采集勋章
}

/**玩家改名消耗配置 */
export type StdPlayerChangeName = {
    readonly ID: number,//id
    readonly Count: number,//修改次数
    readonly CostType: number[],//修改公会名消耗类型
    readonly CostID: number[], //修改公会名消耗ID
    readonly CostCount: number[],//修改公会名消耗数量
}

/**运鱼通用配置 */
export type StdFishTradeCommon = {
    readonly KillType: number[],//击杀模式
    readonly Opentime: string[],//开放时间
    readonly OpenLevel: number,//开放等级
    readonly RoundTime: number,//回合时间
    readonly DepartureTime: number,//出发时间
    readonly RoundSettlementTime: number,//回合结算时间
    readonly InitialTradeFatigue: number,//初始疲劳值
    readonly TradeFatigueResetTime: number,//疲劳值重置时间
    readonly TradeDailyCostMax: number,//每日投入最大上限
    readonly TradeRoundCostMax: number,//每回合投入最大上限
    readonly CostItemID: number,//投入消耗的道具ID(鱼获箱)
    readonly CostSelectType: number[],//投入选项 (每次投入鱼获箱的可选数量)
    readonly ScoreItemId: number,
    readonly ConvertPrice: number,
    readonly FishSelectWeightType: number[],//鱼库选项 (一键选择指定范围内重量的鱼,单位克)
    readonly ConvertItem: number[],//兑换道具id
    readonly ConvertItemCount: number[],//兑换道具数量
    readonly FishFrameSize: number[],//鱼框重量对应动画名称
    readonly ScoreItemIdCostWeight: number,//积分道具对应多少个鱼重量转化系数
}

/**运鱼船配置 */
export type StdFishTradeShip = {
    readonly ShipId: number, //船id
    readonly Name: string,//船名字
    readonly TitleTips: string;
    readonly Res: string,//船资源
}

/**钓鱼装备角色*/
export type StdFishHero = {
    readonly ID: number, //id
    readonly Name: string,//名字
    readonly ActivateCostType: number[],//激活消耗类型
    readonly ActivateCostItemID: number[],//激活消耗道具ID
    readonly ActivateCostItemNumber: number[],//激活消耗数量
    readonly ActivateTime: number,//可激活时长
    readonly IconRes: string,//头像资源
    readonly HeorModel: string,//模型资源
    readonly HeroUnlockedRes: string,//未解锁资源
    readonly Slot: number[],//部件槽位
    readonly Part: number[],//组件ID
}
/**钓鱼装备组件 */
export type StdFishHeroPart = {
    readonly ID: number, //id
    readonly Name: string,//名字
    readonly IconRes: string,//组件icon资源
    readonly Level: number,//组件icon资源
    readonly CostType: number[],//升级消耗大类
    readonly CostID: number[],//升级消耗id
    readonly CostNumber: number[],//升级消耗数量
    readonly BarUpgradeMax: number,//升级成功概率
    readonly SkillType: number,//技能效果id
    readonly SkillValue: number,//技能效果值
    readonly SkillDesc: string,//技能效果描述

}
/**钓鱼装备技能 */
export type StdFishHeroSkill = {
    readonly ID: number, //id
    readonly Name: string,//名字
    readonly Effect: string,
    readonly Value: number,//默认值
    readonly ShowType: number,//显示类型（0.固定值；1.百分比）
}

/**钓鱼排行榜奖励 */
export type StdFishRankAward = {
    readonly ListModeID: number;//奖池id
    readonly ListType: number;//排行榜类型(1:高手榜、2空杆榜、3幸运 4赛季榜)
    readonly Ranking: number[];//名次1.固定名次；2、前百分比；3|固定人数
    readonly RoughReward: number;//辉耀石奖励比率
    readonly RainbowReward: number;//彩虹体比率
    readonly RewardType: number[];//额外奖励大类
    readonly RewardItemType: number[];//额外奖励小类
    readonly RewardNumber: number[];//额外奖励数量
}
/**钓鱼装备槽位置定义 */
export enum StdFishEquipSoltType {
    Type_1 = 1, // 1主体
    Type_2,    // 2鱼竿
    Type_3,    // 3凳子
    Type_4,    // 4箱子
    Type_5,    // 5帽子
    Type_6,    // 6手套
    Type_7,    // 7鱼饵
}
/**钓鱼排行榜类型定义 */
export enum StdFishRankType {
    Type_1 = 1, // 1高手榜
    Type_2,    // 2空杆榜
    Type_3,    // 3幸运榜
    Type_4,   // 4赛季榜
}

/**世界交易所配置 */
export type StdCrossBours = {
    readonly Id: number;//商品id
    readonly Name: string;//商品名字
    readonly AllowSellerServer: string;//支持挂单的服务器
    readonly AllowBuyerServer: string[];//允许购买的服务器
    readonly MailSenderType: number;
    readonly PaymentType: number;//支付大类
    readonly PaymentID: number;//支付类型ID
    readonly SellType: number;//出售大类
    readonly SellID: number;//出售类型ID
    readonly LowestPrice: number;//最低组单价
    readonly HighestPrice: number;//最高组单价
    readonly Mini: number;//上架最少组数
    readonly Stack: number;//上架最大组数
    readonly Single: number;//组大小
    readonly Fees: number; //手续费比例
    readonly PayItemID: number; //支付货币对应的id
    readonly SellItemID: number; //出售货币对应的id
}
/**pvp商店 */
export type StdPvpShop = {
    readonly ShopItemID: number;//商品id
    readonly ItemId: number;//购买道具ID
    readonly ItemCount: number;//购买道具数量
    readonly BuyCountMax: number;//周期内最大可购买次数
    readonly ScorePrice: number;//PVP积分价格
    readonly CurrencyPrice: number;//彩虹币价格
}
/**宝石通用配置 */
export type StdGemComm = {
    readonly MailCost: number,//兑换积分收取手续费
    readonly Max: number,//最少兑换数量
    readonly Min: number,//最大兑换数量
    readonly KeepPre: number,//小数精度保留XX位
}
/**个人银行配置 */
export type StdBank = {
    readonly DonateId: number,//id 
    readonly SavingsType: number,//储蓄类型
    readonly Level: number,//解锁条件（生命树等级）
    readonly TypeIcon: string,//储蓄类型图标
    readonly TypeBg: string,//储蓄类型底图资源
    readonly TypeNumBg: string,//储蓄次数底图资源
    readonly CostType: number,//储蓄上交货币类型
    readonly CostId: number, //储蓄上交货币Id
    readonly CostNum: number,//储蓄上交货币数量
    readonly Duration: number,//持续时间（天）
    readonly day: number[],//每日返还
    readonly dayRronyRewardMun: number[],//每日返还贡献
    readonly CostTimes: number,//可储存次数上限
}
/**银行储蓄类型定义*/
export enum SavingsType {
    General = 1,//普通
    High,//高级
    Goddess,//女神
}
/**炸鱼通用配置 */
export type StdFishBombComm = {
    readonly StageType: number[],//回合模式
    readonly Opentime: string[],//开启时间段
    readonly OpenLevel: number,//开放等级
    readonly InitialTradeFatigue: number,//初始疲劳值
    readonly TradeFatigueResetTime: number,//重置疲劳值时间
    readonly TradeDailyCostMax: number,//每日投入上线
    readonly TradeRoundCostMax: number,//回合投入上线
    readonly CostItemID: number,//投入消耗道具id
    readonly CostItemIDCostWeight: number,//投入兑换鱼重量比值
    readonly CostSelectType: number[],//选择投入数量选择
    readonly ConvertPrice: number,//道具转化价格
    readonly ConvertItem: number[],//道具转换获得的道具ID
    readonly ConvertItemCount: number[],//道具转换获得的道具数量
    readonly ScoreItemId: number,//积分道具
    readonly ScoreItemIdCostWeight: number,//一个炸弹对应多少个积分道具
}
/**炸鱼池塘配置 */
export type StdFishBombPond = {
    readonly Id: number,//
    readonly Name: string,//池塘名称
    readonly EffectRes: string,//池塘资源
    readonly WinEffectRes: string,//赢的特效名
    readonly Weight: number,//权重
    readonly Odds: number[],//池塘连续回合的赔率
    readonly riskRes: string,//危险系数资源
}
/**炸鱼池塘配置 */
export type StdFishBombSatge = {
    readonly Id: number,//
    readonly BombCostType: number,//炸弹投入模式 (0=任意可投入 1=仅存活投入)
    readonly StageTime: number,//子回合总时间
    readonly PreparationTime: number,//准备时间 （选择和投入）
    readonly SettlementTime: number,//结算时间
    readonly RewardTime: number,//发奖时间
}
/**炸鱼角色路径数据定义 */
export type StdFishBombHamalPos = {
    pos: Vec3,//
    time?: number,
    dir?: number,
}
/**世界boss通用配置 */
export type StdWorldBossComm = {
    readonly Id: number,
    readonly Opentime: string[],//开启时间段
    readonly RoundTime: number,//回合时间
    readonly RoundStartBattleTime: number,//回合开始时间
    readonly RoundSettlementTime: number,//回合结算时间
    readonly BossType: number[],//boss类型
    readonly BossProb: number[],//出现boss概率
    readonly BossName: string[],//boss名字
    readonly BossIcon: string[],//bossIcon
    readonly BossModel: string[],//boss模型
    readonly FreeCount: number,//每日免费次数
    readonly CountItemType: number,//挑战消耗道具大类
    readonly CountItemID: number,//挑战消耗道具id
    readonly ConsumeNumber: number,//挑战消耗道具数量
    readonly CountMoney: number,//购买消耗彩虹币数量
    readonly AddCountMax: number,//单日购买最大次数
    readonly ScoreItemId: number,//积分道具id
    readonly RewardType: number[],//击败奖励大类
    readonly RewardItemType: number[],//击败奖励id
    readonly RewardNumber: number[],//击败奖励数量

}
/**世界boss伤害奖励*/
export type StdWorldBossHurtAward = {
    readonly PoolID: number,//（201单次，202累计）
    readonly MinDamage: number,//最小伤害
    readonly MaxDamage: number,//最大伤害
    readonly RewardType: number[],//奖励大类
    readonly RewardItemID: number[],//奖励id
    readonly RewardNumber: number[],//奖励数量
}

/**自定义世界boss等级配置*/
export type StdWorldBossLv = {
    readonly ID: number,//boss等级id
    readonly LastbattleTime: string,//boss名字
    readonly icon: string,//bossicon
    readonly model: string,//boss展示模型
    readonly maxHp: number,//boss最大血条
    readonly lv: number,//boss等级
    readonly skillList: number[],//技能列表
    readonly attrTypeList: number[],//持有属性类型
    readonly attrValueList: number[],//持有属性值
    readonly desc: string,//boss说明
}
export type StdWorldBossRankAward = {
    readonly ListModeID: number,
    readonly ListType: number,
    readonly Ranking: number[],
    readonly RewardType: number[],
    readonly RewardItemType: number[],
    readonly RewardNumber: number[],
}
/**角色进化配置*/
export type StdRoleQualityUp = {
    Roleid: number,//角色id
    evolution: number[],//目标角色ID
    Pro: number[],//目标角色概率
    RoleQuailty: number,//目标角色品质
    RewardType: number[],//进化所需物品大类
    RewardID: number[],//进化所需物品ID
    RewardNumber: number[],//进化所需物品数量
    OperateType: number,//1=进化/2=重随
}

/**角色洗练配置*/
export type StdRoleSkillClear = {
    Roleid: number,//角色id
    QualityType: number,//目标角色品质
    RewardType: number[],//洗练所需物品大类
    RewardID: number[],//洗练所需物品ID
    RewardNumber: number[],//洗练所需物品数量
    PassiveSkillNum: number[],//被动数量
    PassiveNumWeight: number[],//生成词条数量权值
    SkillBaseId: number[],//随机技能库
}

/**道具合成配置*/
export type StdItemSyntheSize = {
    ID: number,//序号id
    ItemType: number,//生产道具大类
    ItemID: number,//生产道具ID
    Time: number,//单次生产时长（秒）
    CostType: number[],//消耗道具类型
    CostItemID: number[],//消耗道具id
    Num: number[],//消耗道具数量
    Limit: number,//生产道具上限
}

/**主技能升级配置*/
export type StdActiveSkillUp = {
    SkillId: number,//技能id
    SkillType: number,//技能等级
    Name: number,//技能名
    icon: number,//图标
    Quality: number,//品质
    RewardType: number[],//消耗道具类型
    RewardItemType: number[],//消耗道具id
    RewardNumber: number[],//消耗道具数量
}
/**翻牌通用配置 */
export type StdFlipCommon = {
    readonly Opentime: string[],
    readonly OpenLevel: number,
    readonly CostItemID: number,
    readonly ConvertItem: number[],
    readonly ConvertItemCount: number[],
    readonly ConvertPrice: number,
    readonly BeyondTimes: number,
    readonly DailyCostMax: number,
}

export type StdFilpAnswer = {
    readonly ID: number,
    readonly PrizeType: number,
    readonly HeroView: number[],
    readonly Grade5: number,
    readonly RewardNumber5: number[],
    readonly Grade50: number,
    readonly RewardNumber50: number[],
    readonly Grade500: number,
    readonly RewardNumber500: number[],
}

export type StdFilpGrandPrize = {
    readonly Id: number,
    readonly Name: string,
    readonly BetonType: number,
    readonly PrizeNumber: number[],
    readonly PrizeValue: number[],
    readonly GrandPrizeResult: number,
    readonly gridEffect: string,
}

