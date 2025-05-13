import { Node, Button, Label, Sprite, Component, path, SpriteFrame, Toggle, Input } from "cc";
import { Panel } from "../../GameRoot";
import { AutoScroller } from "../../utils/AutoScroller";
import { AwardItem } from "../common/AwardItem";
import { CfgMgr, StdCommonType, StdLootRank } from "../../manager/CfgMgr";
import PlayerData, { } from "../roleModule/PlayerData"
import PlayerDataHelp, { } from "../roleModule/PlayerDataHelp"
 import {SThing,SThings} from "../roleModule/PlayerStruct";
import { DateUtils } from "../../utils/DateUtils";
import { ResMgr, folder_icon } from "../../manager/ResMgr";
import { BagItem } from "../bag/BagItem";
import { ItemUtil } from "../../utils/ItemUtils";
import { MsgTypeSend } from "../../MsgType";
import { Session } from "../../net/Session";


export class LootAwardPanel extends Panel {
    protected prefab: string = "prefabs/panel/loot/LootAwardPanel";
    private rankAwardList: AutoScroller;
    private myRankAwardItem: Node;
    private timeCont: Label;
    private navBar: Node;
    private noneListCont: Node;
    private maxCount = 0;
    private type: number;

    protected onLoad() {
        this.CloseBy("closeBtn");
        this.CloseBy("mask");
        this.rankAwardList = this.find(`rankAwardList`, AutoScroller);
        this.myRankAwardItem = this.find(`mayRankAwardItem`);
        this.timeCont = this.find(`timeCont/timeLab`, Label);
        this.noneListCont = this.find(`noneListCont`);
        this.navBar = this.find(`navBar`);
        this.onBtnEvent();
        this.rankAwardList.SetHandle(this.updateRankAward.bind(this));
    }

    private onBtnEvent() {
        this.navBar.children.forEach((node, index) => {
            node.on(Input.EventType.TOUCH_END, () => {
                this.onTouchNav(index)
            });
        })
    }

    protected onShow(): void {

        let cur_rank_data = {
            type: MsgTypeSend.GetRankingList,
            data: {
                seasonId: PlayerData.LootSeasonInfo.season_id
            }
        }
        Session.Send(cur_rank_data);

        let last_rank_data = {
            type: MsgTypeSend.GetRankingList,
            data: {
                seasonId: PlayerData.LootLastSeasonInfo.seasonId
            }
        }
        Session.Send(last_rank_data);

    }
    public flush(...args: any[]): void {
        this.onTouchNav(0);
    }
    protected onHide(...args: any[]): void {
        this.timeCont.node.getComponent(Component).unscheduleAllCallbacks();
        this.navBar.children[0].getComponent(Toggle).isChecked = true;
        this.type = undefined;
    }
    private onTouchNav(index) {
        if(this.type == index) return;
        this.type = index;
        this.initThisSeason();
    }

    private initThisSeason() {
        this.timeCont.node.getComponent(Component).unscheduleAllCallbacks();
        let stdRank: StdLootRank[] = CfgMgr.Get(`RankList`);
        let datas = [];
        let season_id = this.type == 1 ? PlayerData.LootLastSeasonInfo.seasonId : PlayerData.LootSeasonInfo.season_id
        let list_data = CfgMgr.getPVPById(season_id);
        stdRank.forEach((data) => {
            if (list_data && data.ListModeID == list_data.JackpotType && data.ListType == 1) {
                if(data.Ranking[0] == 1){
                    this.maxCount++;
                }
                datas.push(data);
            }
        })
        if (this.type == 0) {
            this.timeCont.string = `剩余时间：${DateUtils.FormatTime(PlayerData.LootSeasonInfo.end_time - PlayerData.GetServerTime(), "%{d}天%{hh}:%{mm}:%{ss}")}`;
            this.timeCont.node.getComponent(Component).schedule(() => {
                this.timeCont.string = `剩余时间：${DateUtils.FormatTime(PlayerData.LootSeasonInfo.end_time - PlayerData.GetServerTime(), "%{d}天%{hh}:%{mm}:%{ss}")}`;
            }, 1)
        } else {
            this.timeCont.string = "已结束";
        }
        this.rankAwardList.UpdateDatas(datas);
        this.updateMyAward(this.myRankAwardItem)
    }
    private async updateRankAward(item: Node, data: StdLootRank, index: number) {
        if (!data) return;
        let rankIcon = item.getChildByName(`rankIcon`).getComponent(Sprite);
        let rankLab = item.getChildByName(`rankLab`).getComponent(Label);
        let name = item.getChildByName(`name`).getComponent(Label);
        let fight_num = item.getChildByPath(`playerNode/fight_num`).getComponent(Label);
        let awardList = item.getChildByName(`awardList`).getComponent(AutoScroller);
        awardList.SetHandle(this.updateAwardItemLits.bind(this));
        rankLab.node.active = true;
        rankIcon.node.active = false;
        name.node.active = false;
        fight_num.node.parent.active = false;
        let seasonData = this.type == 1 ? PlayerData.LootLastSeasonInfo : PlayerData.LootSeasonInfo;
        let player_num = 1;
        if (data.Ranking[0] == 1) {
            rankLab.string = `${data.Ranking[1]}`
            rankLab.fontSize = 70;
            if (data.Ranking[1] <= 3) {
                rankIcon.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_icon, `rank${data.Ranking[1]}`, "spriteFrame"), SpriteFrame);
                rankIcon.node.active = true;
                rankLab.node.active = false;
            }
            
            if(seasonData.rank_list && seasonData.rank_list.length > 0){
                let rand_data = seasonData.rank_list[data.Ranking[1] - 1]
                if(rand_data){
                    name.string = rand_data.playerInfo.player_name;
                    fight_num.string = rand_data.playerInfo.battle_power + "";    
                    name.node.active = true;
                    fight_num.node.parent.active = true;
                }
            }
        } else {
            player_num = Math.ceil(seasonData.all_player * data.Ranking[1]) - this.maxCount
            rankLab.string = `前${data.Ranking[1] * 100}%`
            rankLab.fontSize = 40;
        }

        if(player_num <= 0){
            player_num = 1
        }
        
        let datas: SThing[] = PlayerDataHelp.GetLootAwardThings(seasonData, data.RoughReward, data.RainbowReward, player_num);
        let awList: SThing[] = ItemUtil.GetSThingList(data.RewardType, data.RewardItemType, data.RewardNumber);
        let season_id = this.type == 1 ? PlayerData.LootLastSeasonInfo.seasonId : PlayerData.LootSeasonInfo.season_id;
        //是否满足最小人数
        let joinNumber = CfgMgr.getPVPById(season_id).JoinNumber;
        let awListDatas: SThing[] = [];
        if(joinNumber > seasonData.all_player){
            awListDatas = awList;
        }else{
            awListDatas = this.sortAwardList(awList.concat(datas)); 
        }
        awardList.UpdateDatas(awListDatas);
    }
    private async updateMyAward(item: Node) {
        let seasonData = this.type == 1 ? PlayerData.LootLastSeasonInfo : PlayerData.LootSeasonInfo;
        let season_id = this.type == 1 ? PlayerData.LootLastSeasonInfo.seasonId : PlayerData.LootSeasonInfo.season_id;
        if (!season_id) {
            item.active = false;
            this.noneListCont.active = true;
            return
        }
        item.active = true;
        this.noneListCont.active = false;
        let data = PlayerData.GetLootRankCfg(seasonData, season_id);
        let rankIcon = item.getChildByName(`rankIcon`).getComponent(Sprite);
        let rankLab = item.getChildByName(`rankLab`).getComponent(Label);
        let rangeLab = item.getChildByName(`rangeLab`).getComponent(Label);
        let awardList = item.getChildByName(`awardList`).getComponent(AutoScroller);
        awardList.SetHandle(this.updateAwardItemLits.bind(this));
        rankLab.node.active = true;
        rankIcon.node.active = false;
        awardList.UpdateDatas([]);
        //获取对应排名配置
       
        rankIcon.node.active = false;
        rankLab.node.active = true;
        let player_num = 1;
        if (data) {
            if (data.Ranking[0] == 1) {
                rankLab.string = `${data.Ranking[1]}`
                rangeLab.string = ``;
                rankLab.fontSize = 70;
                if (data.Ranking[1] <= 3) {
                    rankIcon.node.active = true;
                    rankIcon.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_icon, `rank${data.Ranking[1]}`, "spriteFrame"), SpriteFrame);
                    rankLab.node.active = false;
                }
            } else {
                player_num = Math.ceil(seasonData.all_player * data.Ranking[1]) - this.maxCount
                if(player_num <= 0){
                    player_num = 1;
                }
                rankLab.string = `${seasonData.rank}`
                rangeLab.string = `前${data.Ranking[1] * 100}%`;
                rankLab.fontSize = 50;
            }
           
            let datas: SThing[] = PlayerDataHelp.GetLootAwardThings(seasonData, data.RoughReward, data.RainbowReward, player_num);
            let awList: SThing[] = ItemUtil.GetSThingList(data.RewardType, data.RewardItemType, data.RewardNumber);
            let joinNumber = CfgMgr.getPVPById(season_id).JoinNumber;
            let awListDatas: SThing[] = [];
            if(joinNumber > seasonData.all_player){
                awListDatas = awList;
            }else{
                awListDatas = this.sortAwardList(awList.concat(datas)); 
            }
            awardList.UpdateDatas(awListDatas);
        } else {
            rankLab.string = `未上榜`
            rangeLab.string = ``;
        }
    }
    private updateAwardItemLits(item: Node, data: SThing) {
        let awardItem = item.getComponent(BagItem);
        if (!awardItem) awardItem = item.addComponent(BagItem);
        awardItem.SetData(data);
        awardItem.node.getChildByName(`name`).active = false;
        this.scheduleOnce(() => {
            awardItem.node.getComponent(Toggle).enabled = false;
        })
    }

    private sortAwardList(awListDatas){
        let sort_data: SThing[] = [];
        for (let index = 0; index < awListDatas.length; index++) {
            const _data = awListDatas[index];
            if(_data.item && _data.item.count < 0 ){
                return [];
            }
            if(sort_data.length > 0){
                let is_has = false
                for (let index = 0; index < sort_data.length; index++) {
                    const element = sort_data[index];
                    if(element.type == _data.type && element.item && element.item.id == _data.item.id){
                        element.item.count += _data.item.count;
                        is_has = true;
                        break;
                    }           
                }
                if(!is_has){
                    sort_data.push(_data)
                }
            }else{
                sort_data.push(_data)
            }
        }
        return sort_data.length > 0 ? sort_data : awListDatas
    }
}