import { Node, Button, Label, Input, Sprite, path, SpriteFrame, js, sp } from "cc";
import { Panel } from "../../GameRoot";
import { Tips } from "../login/Tips";
import { CfgMgr, StdCommonType } from "../../manager/CfgMgr";
import { RankTopItem } from "../rank/RankTopItem";
import { AutoScroller } from "../../utils/AutoScroller";
import { RankItem } from "../rank/RankItem";
import { AdaptBgTop } from "../common/BaseUI";
import { EventMgr, Evt_Hide_Scene, Evt_LootRankUpdate, Evt_Show_Scene } from "../../manager/EventMgr";
import { DateUtils } from "../../utils/DateUtils";
import PlayerData, {  } from "../roleModule/PlayerData"
 import {SPlayerViewInfo} from "../roleModule/PlayerStruct";
// import { LootRankTopItem } from "./LootRankTopItem";
// import { LootRankItem } from "./LootRankItem";
import { MsgTypeSend } from "../../MsgType";
import { Session } from "../../net/Session";
import { SLootRankInfo } from "../home/HomeStruct";
import { HeadItem } from "../common/HeadItem";
import { ResMgr } from "../../manager/ResMgr";
import { GameSet } from "../GameSet";


export class LootRankPanel extends Panel {
    protected prefab: string = "prefabs/panel/loot/LootRankPanel";

    private noneListCont:Node;
    private myNode: Node;
    private top3Cont: Node;
    private rankList: AutoScroller;
    private timeLab: Label;
    private rankNeedCount: Label;
    private allPlayerNum: Label
    protected onLoad(): void {
        this.noneListCont = this.find("noneListCont");
        this.myNode = this.find("myRankItem");
        this.top3Cont = this.find("top3Cont");
        this.rankList = this.find("lootRankList").getComponent(AutoScroller);
        this.rankList.SetHandle(this.updateRankItem.bind(this));
        this.timeLab = this.find("timeCont/timeLab").getComponent(Label);
        this.rankNeedCount = this.find("rankNeedNode/rankNeedCount", Label);
        this.allPlayerNum = this.find("allPlayerNode/allPlayerNum", Label);
        this.CloseBy("backBtn");

        EventMgr.on(Evt_LootRankUpdate, this.updateShow.bind(this));
    }
    public async flush() {
        this.allPlayerNum.string = 0 + "名";
        let data = {
            type: MsgTypeSend.GetRankingList,
            data: {
                seasonId: PlayerData.LootSeasonInfo.season_id
            }
        }
        Session.Send(data);

        for (let node of this.top3Cont.children) {
            let spine = node.getChildByName("bodyModel").getComponent(sp.Skeleton)
            let url = path.join("spine/role_p/", "role_001_ngr", "role_001_ngr");
            if(GameSet.GetServerMark() == "hc"){
                url = path.join("spine/role_p/", "hc_role_001_ngr", "hc_role_001_ngr");
            }
            let skeletonData = await ResMgr.LoadResAbSub(url, sp.SkeletonData);
            spine.skeletonData = skeletonData;
        }

        let id = CfgMgr.GetCommon(StdCommonType.PVP).SnatchMatch;
        let cfg = CfgMgr.Get("SnatchRatio")
        for (const iterator of cfg) {
            if(iterator.RatioID == id){
                this.rankNeedCount.string = iterator.LowPoint + "";
                break;
            }
        }
    }

    protected onShow() {
        AdaptBgTop(this.find("titleCont"));
        EventMgr.emit(Evt_Hide_Scene, js.getClassName(this));
    }

    protected onHide(...args: any[]) {
        EventMgr.emit(Evt_Show_Scene, js.getClassByName(this));
    }
    private updateShow(data: { seasonId: number, rankingList: SLootRankInfo[] }) {
        let top3List: any[] = [
            {
                playerID: null,
                name: "虚位以待",
                score: 0,
                battle_power: 0,
                rank: -1,
                all_player: data.rankingList.length
            },
            {
                playerID: null,
                name: "虚位以待",
                score: 0,
                battle_power: 0,
                rank: -1,
                all_player: data.rankingList.length
            },
            {
                playerID: null,
                name: "虚位以待",
                score: 0,
                battle_power: 0,
                rank: -1,
                all_player: data.rankingList.length
            },
        ];
        let rankList: SLootRankInfo[] = data.rankingList;
        let otherRankList: SLootRankInfo[] = [];
        let myRankData: SLootRankInfo = {
            playerID: PlayerData.roleInfo.player_id,
            playerInfo: {
                player_id: PlayerData.roleInfo.player_id,//玩家ID
                level: 0,
                player_name: PlayerData.roleInfo.name,
                player_icon_url: PlayerData.roleInfo.icon_url,
                battle_power: PlayerData.roleInfo.battle_power
            },
            score: PlayerData.LootSeasonInfo.score,
            rank: PlayerData.LootSeasonInfo.rank,
            all_player: rankList.length,
        };

        for (let index = 0; index < rankList.length; index++) {
            let rankData = rankList[index];
            rankData.rank = index + 1;
            rankData.all_player =rankList.length;
            if (rankData.playerID == PlayerData.roleInfo.player_id) {
                myRankData = rankData;
            }
            if (index < top3List.length) {
                top3List[index].playerID = rankData.playerID;
                top3List[index].name = rankData.playerInfo.player_name;
                top3List[index].score = rankData.score;
                top3List[index].battle_power = rankData.playerInfo.battle_power;
                top3List[index].rank = index + 1;
            } else {
                otherRankList.push(rankData);
            }
        }
        this.allPlayerNum.string = data.rankingList.length + "名";
        this.updateTop3Cont(top3List);
        this.updateOtherCont(otherRankList);
        this.updateRankItem(this.myNode, myRankData);
    }
    private async updateTop3Cont(top3List) {
        for (let index = 0; index < this.top3Cont.children.length; index++) {
            let node = this.top3Cont.children[index]
            let data = top3List[index];
            let nameLab = node.getChildByName("nameLab").getComponent(Label);
            let valueLab = node.getChildByPath("valueCont/numLab").getComponent(Label);
            let pointLab = node.getChildByPath("pointCount/numLab").getComponent(Label);
            let title_icon = node.getChildByName("title_icon").getComponent(Sprite);
            node.on(Input.EventType.TOUCH_END, ()=>{
                if(data.playerID != PlayerData.roleInfo.player_id){
                    // TODO 发送查看玩家数据
                    Session.Send({ type: MsgTypeSend.GetPlayerViewInfo, 
                        data: {
                            player_id: data.playerID,
                        } 
                    });
                };
            });

            nameLab.string = data.name;
            valueLab.string = data.battle_power + "";
            pointLab.string = data.score + "";
            let rank_cfg = PlayerData.GetLootRankCfg(data, PlayerData.LootSeasonInfo.season_id);
            if(rank_cfg){
                title_icon.node.active = true;
                title_icon.spriteFrame = await ResMgr.LoadResAbSub(path.join("sheets/title/", `loot_${rank_cfg.title}`, "spriteFrame"), SpriteFrame);
            }else{
                title_icon.node.active = false;
            }
        }
    }
    private updateOtherCont(otherRankList: SLootRankInfo[]) {
        this.rankList.UpdateDatas(otherRankList);
        this.noneListCont.active = otherRankList.length < 1;
    }
    protected async updateRankItem(item: Node, data: SLootRankInfo) {
        let head = item.getChildByName("HeadItem").addComponent(HeadItem);
        let nameLab = item.getChildByName("nameLab").getComponent(Label);
        let rankLab = item.getChildByName("rankLab").getComponent(Label);
        let valueLab = item.getChildByPath("valueCont/numLab").getComponent(Label);
        let powerLab = item.getChildByName("powerLab").getComponent(Label);
        let title_icon = item.getChildByName("title_icon").getComponent(Sprite);

        nameLab.string = data.playerInfo.player_name;
        if (data.rank > 0) {
            rankLab.string = data.rank.toString();
        } else {
            rankLab.string = "未上榜";
        }
        valueLab.string = data.score + "";
        powerLab.string = data.playerInfo.battle_power + "";

        let player_data: SPlayerViewInfo = {
            player_id: data.playerID,
            icon_url: data.playerInfo.player_icon_url,
        };
        head.SetData(player_data);
        let rank_cfg = PlayerData.GetLootRankCfg(data, PlayerData.LootSeasonInfo.season_id);
        if(rank_cfg){
            title_icon.node.active = true;
            title_icon.spriteFrame = await ResMgr.LoadResAbSub(path.join("sheets/title/", `loot_${rank_cfg.title}`, "spriteFrame"), SpriteFrame);
        }else{
            title_icon.node.active = false;
        }
    }
    protected update(dt: number) {
        if (!this.timeLab) return;
        let residueTime: number = Math.max(Math.floor(PlayerData.LootSeasonInfo.end_time - PlayerData.GetServerTime()), 0);
        if (residueTime > 86400) {
            this.timeLab.string = "刷新时间：" + DateUtils.FormatTime(residueTime, "%{d}天%{hh}:%{mm}:%{ss}");
        } else {
            this.timeLab.string = "刷新时间：" + DateUtils.FormatTime(residueTime, "%{hh}:%{mm}:%{ss}");
        }
    }
}