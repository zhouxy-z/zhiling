import { Label, RichText, js } from "cc";
import { EvtPass, getQualifiedClassName, hex2b64 } from "./utils/Utils";
import { GameSet } from "./module/GameSet";
import { BattleArrayPanel } from "./battle/Ready/BattleArrayPanel";
import { BattleReplayPanel } from "./battle/Ready/BattleReplayPanel";
import { BattleReportPanel } from "./battle/Ready/BattleReportPanel";
import { BattleUI } from "./battle/Ready/BattleUI";
import { MatchmakingPanel } from "./battle/Ready/MatchmakingPanel";
import { PveAwardPanel } from "./battle/Ready/PveAwardPanel";
import { PveNumBuyPanel } from "./battle/Ready/PveNumBuyPanel";
import { PvePanel } from "./battle/Ready/PvePanel";
import { PveSaoDangPanel } from "./battle/Ready/PveSaoDangPanel";
import { SendOutTroopsPanel } from "./battle/Ready/SendOutTroopsPanel";
import { BagPanel } from "./module/bag/BagPanel";
import { ComposePanel } from "./module/bag/ComposePanel";
import { GetMoreWin } from "./module/bag/GetMoreWin";
import { OpenBoxPanel } from "./module/bag/OpenBoxPanel";
import { ActiveSkillTipsPanel } from "./module/common/ActiveSkillTipsPanel";
import { BuildCompletedPanel } from "./module/common/BuildCompletedPanel";
import { BuildingUpgradePreviewPanel } from "./module/common/BuildingUpgradePreviewPanel";
import { ItemTips } from "./module/common/ItemTips";
import { PassiveSkillTipsPanel } from "./module/common/PassiveSkillTipsPanel";
import { RewardPanel } from "./module/common/RewardPanel";
import { SelectHeroPanel } from "./module/common/SelectHeroPanel";
import { ShowHeroPanel } from "./module/common/ShowHeroPanel";
import { CurrencyIncomInfoPanel } from "./module/currencyIncomInfo/CurrencyIncomInfoPanel";
import { CurrencyIncomSortPanel } from "./module/currencyIncomInfo/CurrencyIncomSortPanel";
import { FanyuPanel } from "./module/fanyu/FanyuPanel";
import { FishingFeedBuyPanel } from "./module/fishing/FishingFeedBuyPanel";
import { FishingLogPage } from "./module/fishing/FishingLogPage";
import { FishingLogPanel } from "./module/fishing/FishingLogPanel";
import { FishingLuckyPoolPanel } from "./module/fishing/FishingLuckyPoolPanel";
import { FishingPanel } from "./module/fishing/FishingPanel";
import { FishingRankPanel } from "./module/fishing/FishingRankPanel";
import { FishingShopBuyPanel } from "./module/fishing/FishingShopBuyPanel";
import { FishingShopPanel } from "./module/fishing/FishingShopPanel";
import { FishingTipsPanel } from "./module/fishing/FishingTipsPanel";
import { FishingEquipHeroActivePanel } from "./module/fishingEquip/FishingEquipHeroActivePanel";
import { FishingEquipPanel } from "./module/fishingEquip/FishingEquipPanel";
import { FishingEquipUpgradePanel } from "./module/fishingEquip/FishingEquipUpgradePanel";
import { FishingRaceAwardPanel } from "./module/fishingRaceRank/FishingRaceAwardPanel";
import { FishingRaceMainPanel } from "./module/fishingRaceRank/FishingRaceMainPanel";
import { FishTradeFishSelectPanel } from "./module/fishTrade/FishTradeFishSelectPanel";
import { FishTradeItemBuyPanel } from "./module/fishTrade/FishTradeItemBuyPanel";
import { FishTradeLogPanel } from "./module/fishTrade/FishTradeLogPanel";
import { FishTradePanel } from "./module/fishTrade/FishTradePanel";
import { FishTradeTipsPanel } from "./module/fishTrade/FishTradeTipsPanel";
import { FriendBindOrUnbindPanel } from "./module/friend/FriendBindOrUnbindPanel";
import { FriendHelpItem } from "./module/friend/FriendHelpItem";
import { FriendHelpPanel } from "./module/friend/FriendHelpPanel";
import { FriendIncomeListPanel } from "./module/friend/FriendIncomeListPanel";
import { FriendInfoPanel } from "./module/friend/FriendInfoPanel";
import { FriendInviteListPanel } from "./module/friend/FriendInviteListPanel";
import { FriendListPanel } from "./module/friend/FriendListPanel";
import { FriendPanel } from "./module/friend/FriendPanel";
import { FriendSharePanel } from "./module/friend/FriendSharePanel";
import { FriendSortPanel } from "./module/friend/FriendSortPanel";
import { GemBillLogPanel } from "./module/gemShop/GemBillLogPanel";
import { GuildAuditItem } from "./module/guild/GuildAuditItem";
import { GuildAuditPanel } from "./module/guild/GuildAuditPanel";
import { GuildBankPanel } from "./module/guild/GuildBankPanel";
import { GuildBankSelectPanel } from "./module/guild/GuildBankSelectPanel";
import { GuildCreatPanel } from "./module/guild/GuildCreatPanel";
import { GuildEditNotesPanel } from "./module/guild/GuildEditNotesPanel";
import { GuildDonatePanel } from "./module/guild/GuildDonatePanel";
import { GuildExitPanel } from "./module/guild/GuildExitPanel";
import { GuildInfoPanel } from "./module/guild/GuildInfoPanel";
import { GuildMemberItem } from "./module/guild/GuildMemberItem";
import { GuildMemberPanel } from "./module/guild/GuildMemberPanel";
import { GuildNonePanel } from "./module/guild/GuildNonePanel";
import { GuildPanel } from "./module/guild/GuildPanel";
import { GuildRankPage } from "./module/guild/GuildRankPage";
import { GuildSavingsPanel } from "./module/guild/GuildSavingsPanel";
import { GuildSavingsViewPanel } from "./module/guild/GuildSavingsViewPanel";
import { ChangeScenePanel } from "./module/home/ChangeScenePanel";
import { AddCollectTime } from "./module/home/panel/AddCollectTime";
import { BoostPanel } from "./module/home/panel/BoostPanel";
import { BuildingPanel } from "./module/home/panel/BuildingPanel";
import { CompoundPanel } from "./module/home/panel/CompoundPanel";
import { JidiPanel } from "./module/home/panel/JidiPanel";
import { MarqueePanel } from "./module/home/panel/MarqueePanel";
import { OneKeyBoostPanel } from "./module/home/panel/OneKeyBoostPanel";
import { ResourcesPanel } from "./module/home/panel/ResourcesPanel";
import { SpeedUpPanel } from "./module/home/panel/SpeedUpPanel";
import { UnlockHomeLandPanel } from "./module/home/panel/UnlockHomeLandPanel";
import { BuyTips } from "./module/login/BuyTips";
import { LootApplyPanel } from "./module/loot/LootApplyPanel";
import { LootLogPanel } from "./module/loot/LootLogPanel";
import { LootPanel } from "./module/loot/LootPanel";
import { LootRankPanel } from "./module/loot/LootRankPanel";
import { LootRoleInfoPanel } from "./module/loot/LootRoleInfoPanel";
import { LootRoleInfoSeasonPanel } from "./module/loot/LootRoleInfoSeasonPanel";
import { LootVsBuyNumPanel } from "./module/loot/LootVsBuyNumPanel";
import { LootVsPanel } from "./module/loot/LootVsPanel";
import { MailContentPanel } from "./module/mail/MailContentPanel";
import { MailDeletePanel } from "./module/mail/MailDeletePanel";
import { MailPanel } from "./module/mail/MailPanel";
import { MailPlayerPanel } from "./module/mail/MailPlayerPanel";
import { MailSendPanel } from "./module/mail/MailSendPanel";
import { NewHomeCreatePanel } from "./module/newHomeCreate/NewHomeCreatePanel";
import { NewHomeInvitePanel } from "./module/newHomeCreate/NewHomeInvitePanel";
import { NoticePanel } from "./module/notice/NoticePanel";
import { ProductionPanel } from "./module/production/ProductionPanel";
import { RankPanel } from "./module/rank/RankPanel";
import { rightsPanel } from "./module/rights/rightsPanel";
import { rightsTips } from "./module/rights/rightsTips";
import { RoleAttrPage } from "./module/role/RoleAttrPage";
import { RoleInfoPanel } from "./module/role/RoleInfoPanel";
import { RoleNoneSkillTipsPanel } from "./module/role/RoleNoneSkillTipsPanel";
import { RolePanel } from "./module/role/RolePanel";
import { RolePassiveSkillUpgradePanel } from "./module/role/RolePassiveSkillUpgradePanel";
import { RolePreviewPanel } from "./module/role/RolePreviewPanel";
import { RoleTuPoPanel } from "./module/role/RoleTuPoPanel";
import { RoleTuPoResultPanel } from "./module/role/RoleTuPoResultPanel";
import { SafeProtPanel } from "./module/safeProt/SafeProtPanel";
import { SettingPanel } from "./module/setting/SettingPanel";
import { ShopBuyPanel } from "./module/shop/ShopBuyPanel";
import { ShopLuckyBuyPanel } from "./module/shop/ShopLuckyBuyPanel";
import { ShopPanel } from "./module/shop/ShopPanel";
import { ShopRefreshPanel } from "./module/shop/ShopRefreshPanel";
import { SoldierProductionPanel } from "./module/soldierProduction/SoldierProductionPanel";
import { SignPanel } from "./module/task/SignPanel";
import { TaskPanel } from "./module/task/TaskPanel";
import { BuyFailPanel } from "./module/trade/BuyFailPanel";
import { BuyPanel } from "./module/trade/BuyPanel";
import { OrderAgainConfirmPanel } from "./module/trade/OrderAgainConfirmPanel";
import { RoleMsgPanel } from "./module/trade/RoleMsgPanel";
import { SortPanel } from "./module/trade/SortPanel";
import { TradeCreateOrderPanel } from "./module/trade/TradeCreateOrderPanel";
import { TradeHeroPanel } from "./module/trade/TradeHeroPanel";
import { TradePanel } from "./module/trade/TradePanel";
import { UserEditInfoPanel } from "./module/userInfo/UserEditInfoPanel";
import { UserHeadPanel } from "./module/userInfo/UserHeadPanel";
import { UserInfoPanel } from "./module/userInfo/UserInfoPanel";
import { WelfareAdPanel } from "./module/welfare/WelfareAdPanel";
import { fanyuTips } from "./module/fanyu/fanyuTips";
import { BankPanel } from "./module/bank/BankPanel";
import { BankSavingsInfoPanel } from "./module/bank/BankSavingsInfoPanel";
import { BankBackInfoPanel } from "./module/bank/BankBackInfoPanel";
import { TodayNoTips } from "./module/common/TodayNoTips";
import { ZhiLingPalacePanel } from "./module/palace/ZhiLingPalacePanel";
import { FishBombPanel } from "./module/fishBomb/FishBombPanel";
import { FishBombTipsPanel } from "./module/fishBomb/FishBombTipsPanel";
import { FishBombBuyPanel } from "./module/fishBomb/FishBombBuyPanel";
import { FishBombLogPanel } from "./module/fishBomb/FishBombLogPanel";
import { LootSessionAwardPanel } from "./module/loot/LootSessionAwardPanel";
import { Tips } from "./module/login/Tips";
import { WorldBossUI } from "./battle/Ready/WorldBossUI";
import { WorldBossPanel } from "./module/worldBoss/WorldBossPanel";
import { WorldBossHurtRankPanel } from "./module/worldBoss/WorldBossHurtRankPanel";
import { WorldBossHurtLogPanel } from "./module/worldBoss/WorldBossHurtLogPanel";
import { WorldBossNumBuyPanel } from "./module/worldBoss/WorldBossNumBuyPanel";
import { WorldBossRankPanel } from "./module/worldBoss/WorldBossRankPanel";
import { WorldBossInfoPanel } from "./module/worldBoss/WorldBossInfoPanel";
import { AloneShopPanel } from "./module/aloneShop/AloneShopPanel";
import { FanyuXiLianPanel } from "./module/fanyu/FanyuXiLianPanel";
import { FanyuJinHuaPanel } from "./module/fanyu/FanyuJinHuaPanel";
import { WorldBossRankAwardPanel } from "./module/worldBoss/WorldBossRankAwardPanel";
import JSEncrypt from "jsencrypt";
import { SettingPasswordPanel } from "./module/setting/SettingPasswordPanel";
import { SettingPasswordSuccessPanel } from "./module/setting/SettingPasswordSuccessPanel";
import { FanyuChongSuiPanel } from "./module/fanyu/FanyuChongSuiPanel";
import { FlipPanel } from "./module/flip/FlipPanel";
import { FlipItemBuyPanel } from "./module/flip/FlipItemBuyPanel";
import { FlipPrizeLogPanel } from "./module/flip/FlipPrizeLogPanel";
import { FishTradeCastRankPanel } from "./module/fishTrade/FishTradeCastRankPanel";
import { FlipCastRankPanel } from "./module/flip/FlipCastRankPanel";

/**
 * 解除循环依赖
 */
export class Decoupling {

    constructor() {

        /** 注入类,用于各个文档上下文在不import的情况下直接通过类名访问到指定类 **/

        /**单向侦听调度命令,用于固定的一段操作 **/
        EvtPass.on("Reset", () => {

        }, this);

        js.setClassName("BattleArrayPanel", BattleArrayPanel);
        js.setClassName("BattleReplayPanel", BattleReplayPanel);
        js.setClassName("BattleReportPanel", BattleReportPanel);
        js.setClassName("BattleUI", BattleUI);
        js.setClassName("MatchmakingPanel", MatchmakingPanel);
        js.setClassName("PveAwardPanel", PveAwardPanel);
        js.setClassName("PveNumBuyPanel", PveNumBuyPanel);
        js.setClassName("PvePanel", PvePanel);
        js.setClassName("PveSaoDangPanel", PveSaoDangPanel);
        js.setClassName("SendOutTroopsPanel", SendOutTroopsPanel);
        js.setClassName("BagPanel", BagPanel);
        js.setClassName("ComposePanel", ComposePanel);
        js.setClassName("GetMoreWin", GetMoreWin);
        js.setClassName("OpenBoxPanel", OpenBoxPanel);
        js.setClassName("ActiveSkillTipsPanel", ActiveSkillTipsPanel);
        js.setClassName("BuildCompletedPanel", BuildCompletedPanel);
        js.setClassName("BuildingUpgradePreviewPanel", BuildingUpgradePreviewPanel);
        js.setClassName("ItemTips", ItemTips);
        js.setClassName("PassiveSkillTipsPanel", PassiveSkillTipsPanel);
        js.setClassName("RewardPanel", RewardPanel);
        js.setClassName("SelectHeroPanel", SelectHeroPanel);
        js.setClassName("ShowHeroPanel", ShowHeroPanel);
        js.setClassName("CurrencyIncomInfoPanel", CurrencyIncomInfoPanel);
        js.setClassName("FanyuPanel", FanyuPanel);
        js.setClassName("FanyuTips",fanyuTips);
        js.setClassName("FishingFeedBuyPanel", FishingFeedBuyPanel);
        js.setClassName("FishingLogPage", FishingLogPage);
        js.setClassName("FishingLogPanel", FishingLogPanel);
        js.setClassName("FishingLuckyPoolPanel", FishingLuckyPoolPanel);
        js.setClassName("FishingPanel", FishingPanel);
        js.setClassName("FishingRankPanel", FishingRankPanel);
        js.setClassName("FishingShopBuyPanel", FishingShopBuyPanel);
        js.setClassName("FishingShopPanel", FishingShopPanel);
        js.setClassName("FishingTipsPanel", FishingTipsPanel);
        js.setClassName("FishingEquipHeroActivePanel", FishingEquipHeroActivePanel);
        js.setClassName("FishingEquipPanel", FishingEquipPanel);
        js.setClassName("FishingEquipUpgradePanel", FishingEquipUpgradePanel);
        js.setClassName("FishingRaceAwardPanel", FishingRaceAwardPanel);
        js.setClassName("FishingRaceMainPanel", FishingRaceMainPanel);
        js.setClassName("FishTradeFishSelectPanel", FishTradeFishSelectPanel);
        js.setClassName("FishTradeItemBuyPanel", FishTradeItemBuyPanel);
        js.setClassName("FishTradeLogPanel", FishTradeLogPanel);
        js.setClassName("FishTradePanel", FishTradePanel);
        js.setClassName("FishTradeTipsPanel", FishTradeTipsPanel);
        js.setClassName("FriendBindOrUnbindPanel", FriendBindOrUnbindPanel);
        js.setClassName("FriendHelpPanel", FriendHelpPanel);
        js.setClassName("FriendIncomeListPanel", FriendIncomeListPanel);
        js.setClassName("FriendInfoPanel", FriendInfoPanel);
        js.setClassName("FriendInviteListPanel", FriendInviteListPanel);
        js.setClassName("FriendListPanel", FriendListPanel);
        js.setClassName("FriendPanel", FriendPanel);
        js.setClassName("FriendSharePanel", FriendSharePanel);
        js.setClassName("FriendSortPanel", FriendSortPanel);
        js.setClassName("GemBillLogPanel", GemBillLogPanel);
        js.setClassName("GuildAuditPanel", GuildAuditPanel);
        js.setClassName("GuildBankPanel", GuildBankPanel);
        js.setClassName("GuildBankSelectPanel", GuildBankSelectPanel);
        js.setClassName("GuildCreatPanel", GuildCreatPanel);
        js.setClassName("GuildDonatePanel", GuildDonatePanel);
        js.setClassName("GuildEditNotesPanel", GuildEditNotesPanel);
        js.setClassName("GuildExitPanel", GuildExitPanel);
        js.setClassName("GuildInfoPanel", GuildInfoPanel);
        js.setClassName("GuildMemberPanel", GuildMemberPanel);
        js.setClassName("GuildNonePanel", GuildNonePanel);
        js.setClassName("GuildPanel", GuildPanel);
        js.setClassName("GuildRankPage", GuildRankPage);
        js.setClassName("GuildSavingsPanel", GuildSavingsPanel);
        js.setClassName("GuildSavingsViewPanel", GuildSavingsViewPanel);
        js.setClassName("ChangeScenePanel", ChangeScenePanel);
        js.setClassName("AddCollectTime", AddCollectTime);
        js.setClassName("BoostPanel", BoostPanel);
        js.setClassName("BuildingPanel", BuildingPanel);
        js.setClassName("CompoundPanel", CompoundPanel);
        js.setClassName("JidiPanel", JidiPanel);
        js.setClassName("MarqueePanel", MarqueePanel);
        js.setClassName("OneKeyBoostPanel", OneKeyBoostPanel);
        js.setClassName("ResourcesPanel", ResourcesPanel);
        js.setClassName("SpeedUpPanel", SpeedUpPanel);
        js.setClassName("UnlockHomeLandPanel", UnlockHomeLandPanel);
        js.setClassName("BuyTips", BuyTips);
        js.setClassName("LootApplyPanel", LootApplyPanel);
        js.setClassName("LootLogPanel", LootLogPanel);
        js.setClassName("LootPanel", LootPanel);
        js.setClassName("LootRankPanel", LootRankPanel);
        js.setClassName("LootRoleInfoPanel", LootRoleInfoPanel);
        js.setClassName("LootRoleInfoSeasonPanel", LootRoleInfoSeasonPanel);
        js.setClassName("LootVsBuyNumPanel", LootVsBuyNumPanel);
        js.setClassName("LootVsPanel", LootVsPanel);
        js.setClassName("LootSessionAwardPanel", LootSessionAwardPanel);
        js.setClassName("MailContentPanel", MailContentPanel);
        js.setClassName("MailDeletePanel", MailDeletePanel);
        js.setClassName("MailPanel", MailPanel);
        js.setClassName("MailPlayerPanel", MailPlayerPanel);
        js.setClassName("MailSendPanel", MailSendPanel);
        js.setClassName("NewHomeCreatePanel", NewHomeCreatePanel);
        js.setClassName("NewHomeInvitePanel", NewHomeInvitePanel);
        js.setClassName("NoticePanel", NoticePanel);
        js.setClassName("ProductionPanel", ProductionPanel);
        js.setClassName("RankPanel", RankPanel);
        js.setClassName("rightsPanel", rightsPanel);
        js.setClassName("rightsTips", rightsTips);
        js.setClassName("RoleAttrPage", RoleAttrPage);
        js.setClassName("RoleInfoPanel", RoleInfoPanel);
        js.setClassName("RoleNoneSkillTipsPanel", RoleNoneSkillTipsPanel);
        js.setClassName("RolePanel", RolePanel);
        js.setClassName("RolePassiveSkillUpgradePanel", RolePassiveSkillUpgradePanel);
        js.setClassName("RolePreviewPanel", RolePreviewPanel);
        js.setClassName("RoleTuPoPanel", RoleTuPoPanel);
        js.setClassName("RoleTuPoResultPanel", RoleTuPoResultPanel);
        js.setClassName("SafeProtPanel", SafeProtPanel);
        js.setClassName("SettingPanel", SettingPanel);
        js.setClassName("ShopBuyPanel", ShopBuyPanel);
        js.setClassName("ShopLuckyBuyPanel", ShopLuckyBuyPanel);
        js.setClassName("ShopPanel", ShopPanel);
        js.setClassName("ShopRefreshPanel", ShopRefreshPanel);
        js.setClassName("SoldierProductionPanel", SoldierProductionPanel);
        js.setClassName("SignPanel", SignPanel);
        js.setClassName("TaskPanel", TaskPanel);
        js.setClassName("BuyFailPanel", BuyFailPanel);
        js.setClassName("BuyPanel", BuyPanel);
        js.setClassName("OrderAgainConfirmPanel", OrderAgainConfirmPanel);
        js.setClassName("RoleMsgPanel", RoleMsgPanel);
        js.setClassName("SortPanel", SortPanel);
        js.setClassName("TradeCreateOrderPanel", TradeCreateOrderPanel);
        js.setClassName("TradeHeroPanel", TradeHeroPanel);
        js.setClassName("TradePanel", TradePanel);
        js.setClassName("UserEditInfoPanel", UserEditInfoPanel);
        js.setClassName("UserHeadPanel", UserHeadPanel);
        js.setClassName("UserInfoPanel", UserInfoPanel);
        js.setClassName("WelfareAdPanel", WelfareAdPanel);
        js.setClassName("BankPanel", BankPanel);
        js.setClassName("BankSavingsInfoPanel", BankSavingsInfoPanel);
        js.setClassName("BankBackInfoPanel", BankBackInfoPanel);
        js.setClassName("TodayNoTips", TodayNoTips);
        js.setClassName("ZhiLingPalacePanel", ZhiLingPalacePanel);
        js.setClassName("FishBombPanel", FishBombPanel);
        js.setClassName("FishBombTipsPanel", FishBombTipsPanel);
        js.setClassName("FishBombBuyPanel", FishBombBuyPanel);
        js.setClassName("FishBombLogPanel", FishBombLogPanel);
        js.setClassName("Tips", Tips);
        js.setClassName("WorldBossUI",WorldBossUI);
        js.setClassName("WorldBossPanel", WorldBossPanel);
        js.setClassName("WorldBossHurtRankPanel", WorldBossHurtRankPanel);
        js.setClassName("WorldBossHurtLogPanel", WorldBossHurtLogPanel);
        js.setClassName("WorldBossNumBuyPanel", WorldBossNumBuyPanel);
        js.setClassName("WorldBossRankPanel", WorldBossRankPanel);
        js.setClassName("WorldBossInfoPanel", WorldBossInfoPanel);
        js.setClassName("WorldBossRankAwardPanel", WorldBossRankAwardPanel);
        js.setClassName("AloneShopPanel", AloneShopPanel);
        js.setClassName("FanyuXiLianPanel", FanyuXiLianPanel);
        js.setClassName("FanyuJinHuaPanel", FanyuJinHuaPanel);
        js.setClassName("FanyuChongSuiPanel", FanyuChongSuiPanel);
        js.setClassName("SettingPasswordPanel", SettingPasswordPanel);
        js.setClassName("SettingPasswordSuccessPanel", SettingPasswordSuccessPanel);
        js.setClassName("FlipPanel", FlipPanel);
        js.setClassName("FlipItemBuyPanel", FlipItemBuyPanel);
        js.setClassName("FlipPrizeLogPanel", FlipPrizeLogPanel);
        js.setClassName("FishTradeCastRankPanel", FishTradeCastRankPanel);
        js.setClassName("FlipCastRankPanel", FlipCastRankPanel);
        
        
        
        /**
         * 分段加密
         * @param {*} string 
         * @returns 
         */
        JSEncrypt.prototype['encryptLong2'] = function (string) {
            var k = this.getKey();
            // var partLen = /8 - 11
            try {
                var lt = "";
                var ct = "";
                //RSA每次加密245bytes，需要辅助方法判断字符串截取位置
                //1.获取字符串截取点
                var bytes = new Array();
                bytes.push(0);
                var byteNo = 0;
                var len, c;
                len = string.length;
                var temp = 0;
                for (var i = 0; i < len; i++) {
                    c = string.charCodeAt(i);
                    if (c >= 0x010000 && c <= 0x10FFFF) {
                        byteNo += 4;
                    } else if (c >= 0x000800 && c <= 0x00FFFF) {
                        byteNo += 3;
                    } else if (c >= 0x000080 && c <= 0x0007FF) {
                        byteNo += 2;
                    } else {
                        byteNo += 1;
                    }

                    if ((byteNo % 245) >= 242 || (byteNo % 245) == 0) {
                        if (byteNo - temp >= 242) {
                            bytes.push(i);
                            temp = byteNo;
                        }
                    }
                }
                //2.截取字符串并分段加密
                if (bytes.length > 1) {
                    for (var i = 0; i < bytes.length - 1; i++) {
                        var str;
                        if (i == 0) {
                            str = string.substring(0, bytes[i + 1] + 1);
                        } else {
                            str = string.substring(bytes[i] + 1, bytes[i + 1] + 1);
                        }
                        var t1 = k.encrypt(str);
                        ct += t1;
                    }
                    ;
                    if (bytes[bytes.length - 1] != string.length - 1) {
                        var lastStr = string.substring(bytes[bytes.length - 1] + 1);
                        ct += k.encrypt(lastStr);
                    }
                    return hex2b64(ct);
                }
                var t = k.encrypt(string);
                var y = hex2b64(t);
                return y;
            } catch (ex) {
                return false;
            }
        };
    }



}

export function OnLoginServer() {
    // Object.defineProperty(Label.prototype, "string", {
    //     get: function () {
    //         return this._string;
    //     },
    //     set: function (value) {
    //         if (value === null || value === undefined) {
    //             value = '';
    //         } else {
    //             value = value.toString();
    //         }
    //         if (GameSet.GetServerMark() == "hc") {
    //             value = value.replace(/彩虹体/g, "幻彩石");
    //         }
    //         if (this._string === value) {
    //             return;
    //         }

    //         this._string = value;
    //         this.markForUpdateRenderData();
    //     }
    // });

    // Object.defineProperty(RichText.prototype,"string",{
    //     get :function() {
    //         return this._string;
    //     },
    //     set :function (value) {
    //         if (this._string === value) {
    //             return;
    //         }
    //         if (GameSet.GetServerMark() == "hc") {
    //             value = value.replace(/彩虹体/g, "幻彩石");
    //         }
    //         this._string = value;
    //         this._updateRichTextStatus();
    //     }
    // });
}