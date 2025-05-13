import { CfgMgr, OneOffRedPointId, ResourceType, StdCommonType, StdFishShop, StdPassiveLevel, StdSysId, ThingType } from "../../manager/CfgMgr";
import { ItemUtil } from "../../utils/ItemUtils";
import PlayerData from "./PlayerData";
import { SFishingShopItem, SOneOffRedPoint, SPlayerDataRole, SPlayerDataSkill, SThing } from "./PlayerStruct";

export default class PlayerDataHelp {

    /**
     * 检测角色入口红点
     */
    static CheckRoleEnterRed(): boolean {
        return PlayerData.CheckRoleIsCanUp() || this.CheckRolePassiveSkillIsCanUp();
    }

    /**钓鱼入口红点 */
    static CheckFishEnterRead(): boolean {
        if (PlayerData.CheckFishIsOpen()) return true;
        if (PlayerData.CheckFishShopIsSell()) return true;
        if (this.CheckFishShopIsCanBuy()) return true;
        return false;
    }

    static GetLootAwardThings(data, rewardNum = 1, currencyNum = 1, player_num = 1) {
        // let datas: SThing[] = []
        let all: SThing[] = []
        let thing: SThing = { type: ThingType.ThingTypeResource, resource: {} }
        if (data.rock) {
            thing = { type: ThingType.ThingTypeResource, resource: {} }
            thing.resource.rock = data.rock * rewardNum / player_num;
            let num = data.rock * rewardNum / player_num;
            let list_rock = ItemUtil.GetSThingList([ThingType.ThingTypeResource], [ResourceType.rock], [num])
            all = list_rock.concat(all);
            // datas.push(thing)
        }
        if (data.wood) {
            thing = { type: ThingType.ThingTypeResource, resource: {} }
            thing.resource.wood = data.wood * rewardNum / player_num;
            let num = data.wood * rewardNum / player_num;
            let list_wood = ItemUtil.GetSThingList([ThingType.ThingTypeResource], [ResourceType.wood], [num])
            all = list_wood.concat(all);
            // datas.push(thing)
        }
        if (data.water) {
            thing = { type: ThingType.ThingTypeResource, resource: {} }
            thing.resource.water = data.water * rewardNum / player_num;
            let num = data.water * rewardNum / player_num;
            let list_water = ItemUtil.GetSThingList([ThingType.ThingTypeResource], [ResourceType.water], [num])
            all = list_water.concat(all);
            // datas.push(thing)
        }
        if (data.seed) {
            thing = { type: ThingType.ThingTypeResource, resource: {} }
            thing.resource.seed = data.seed * rewardNum / player_num;
            let num = data.seed * rewardNum / player_num;
            let list_seed = ItemUtil.GetSThingList([ThingType.ThingTypeResource], [ResourceType.seed], [num])
            all = list_seed.concat(all);
            // datas.push(thing)
        }
        if (data.currency) {
            thing = { type: ThingType.ThingTypeCurrency, currency: { type: 0, value: 0 } }
            thing.currency = {
                type: 0,
                value: data.currency * currencyNum / player_num
            };
            let num = data.currency * currencyNum / player_num;
            let list_currency = ItemUtil.GetSThingList([ThingType.ThingTypeCurrency], [ThingType.ThingTypeCurrency], [num])
            all = list_currency.concat(all);
            // datas.push(thing)
        }
        if (data.currency_74) {
            thing = { type: ThingType.ThingTypeMedal, currency: { type: 0, value: 0 } }
            thing.currency = {
                type: 0,
                value: data.currency_74 * currencyNum / player_num
            };
            let num = data.currency_74 * currencyNum / player_num;
            let list_currency = ItemUtil.GetSThingList([ThingType.ThingTypeMedal], [ThingType.ThingTypeMedal], [num])
            all = list_currency.concat(all);
            // datas.push(thing)
        }
        return all;
    }

    /**
     * 检测钓鱼商店是否有可购买的商品
     * @returns 
     */
    static CheckFishShopIsCanBuy(): boolean {
        if (!PlayerData.fishShop) return false;
        let data: SOneOffRedPoint = PlayerData.GetOneOffRedPoint(OneOffRedPointId.OffRedPoint_FishShopBuy);
        if (data.isCheck) return data.redPointVal;
        let isRedPoint: boolean = false;
        if (PlayerData.fishShop.refresh_time < PlayerData.GetServerTime()) {
            isRedPoint = false;
        } else {
            if (PlayerData.fishShop.shop_items) {
                let shopData: SFishingShopItem;
                let stdShop: StdFishShop;
                let needNum: number;
                for (let index = 0; index < PlayerData.fishShop.shop_items.length; index++) {
                    shopData = PlayerData.fishShop.shop_items[index];
                    if (shopData.available_amount < 1) continue;
                    stdShop = CfgMgr.GetFishShopItem(shopData.id);
                    if (stdShop) {
                        needNum = stdShop.FishScorePrice;
                        if (ItemUtil.CheckItemIsHave(ThingType.ThingTypeItem, needNum, CfgMgr.GetFishCommon.ScoreItemId)) {
                            isRedPoint = true;
                            break;
                        }
                        needNum = stdShop.CurrencyPrice;
                        if (ItemUtil.CheckItemIsHave(ThingType.ThingTypeCurrency, needNum, 0)) {
                            isRedPoint = true;
                            break;
                        }

                    }
                }
            }
        }
        data.isCheck = true;
        data.redPointVal = isRedPoint;
        return isRedPoint;
    }
    
    /**
     * 检测是否有角色被动技能升级 roleId不为空时检测指定角色 否则检测全部
     */
    static CheckRolePassiveSkillIsCanUp(roleId?: string): boolean {
        let data: SOneOffRedPoint = PlayerData.GetOneOffRedPoint(OneOffRedPointId.OffRedPoint_RolePassiveSkill);
        if (data.isCheck) return data.redPointVal;
        let skillDataList: SPlayerDataSkill[];
        let nextStd: StdPassiveLevel;
        let curStd: StdPassiveLevel;
        let isRedPoint: boolean = false;
        let checkRole = (role: SPlayerDataRole) => {
            if (!role) return false;
            skillDataList = role.passive_skills;
            if (!skillDataList || skillDataList.length < 1) return false;
            for (let skillData of skillDataList) {
                curStd = CfgMgr.GetPassiveSkill(skillData.skill_id, skillData.level);
                nextStd = CfgMgr.GetPassiveSkill(skillData.skill_id, skillData.level + 1);
                if (nextStd && curStd) {
                    if (ItemUtil.CheckThingConsumes(curStd.RewardType, curStd.RewardID, curStd.RewardNumber, false)) {
                        return true;
                    }
                }
            }
            return false;
        }
        if (roleId != undefined) {
            isRedPoint = checkRole(PlayerData.GetRoleById(roleId));
        } else {
            for (let index = 0; index < PlayerData.roleInfo.roles.length; index++) {
                if (checkRole(PlayerData.roleInfo.roles[index])) {
                    isRedPoint = true;
                    break;
                }
            }
        }
        data.isCheck = true;
        data.redPointVal = isRedPoint;
        return isRedPoint;
    }
    
    /**
     * 检测pve挑战次数
     * @returns 
     */
    static CheckPveRed(): boolean {
        if (!PlayerData.GetSysIsOpen(StdSysId.Sys_9)) return false;
        if (!PlayerData.pveData) return false;
        if (PlayerData.pveData.times > 0) return true;
        if (PlayerData.pveData.paid_refresh_times > 0) {
            let pveConfig = CfgMgr.GetCommon(StdCommonType.PVE);
            if (ItemUtil.CheckThingConsumes([pveConfig.ConsumeItemType], [pveConfig.ConsumeItem], [pveConfig.ConsumeNumber])) {
                return true;
            }
        }

        return false;
    }

    /**翻翻乐入口红点 */
    static CheckFlipEnterRead(): boolean {
        if (PlayerData.CheckFlipIsOpen()) return true;
        return false;
    }
}
