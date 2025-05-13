import { Component, Label, Sprite, Node, RichText, path, SpriteFrame} from "cc";
import { AutoScroller } from "../../utils/AutoScroller";
import {} from "../roleModule/PlayerData"
 import {SFishBombLogItemData, SFishingItem,SThing} from "../roleModule/PlayerStruct";
import { DateUtils } from "../../utils/DateUtils";
import { CfgMgr, FuncValueType, StdFishBombPond, StdFishItem, ThingType } from "../../manager/CfgMgr";
import { folder_icon, ResMgr } from "../../manager/ResMgr";
import { AwardItem } from "../common/AwardItem";
import { ItemUtil } from "../../utils/ItemUtils";
import { formatNumber } from "../../utils/Utils";
import { ConsumeItem } from "../common/ConsumeItem";

export class FishBombLogItem extends Component {
    private phaseLab: RichText;
    private timeLab: Label;
    private selectPondNameLab:Label;
    private killWinFlag:Node;
    private killLoseFlag:Node;
    private killNameLab:Label;
    private keepNumLab:Label;
    private rateNumLab:Label;

    private fishItemCont: Node;
    private fishNoneLab:Label;
    private fishIcon:Sprite;
    private fishName:Label;
    private fishWeightLab:Label;
    private fishPriceLab:Label;
    private awardList:AutoScroller;
    private consumeNumLab:Label;
    private winFlag:Node;
    private loseFlag:Node;
    private logData:SFishBombLogItemData;
    private isInit:boolean;
    protected onLoad(): void {
        this.phaseLab = this.node.getChildByName("phaseLab").getComponent(RichText);
        this.timeLab = this.node.getChildByName("timeLab").getComponent(Label);
        this.selectPondNameLab = this.node.getChildByName("selectPondNameLab").getComponent(Label);
        this.killWinFlag = this.node.getChildByName("killWinFlag");
        this.killLoseFlag = this.node.getChildByName("killLoseFlag");
        this.killNameLab = this.node.getChildByName("killNameLab").getComponent(Label);
        this.keepNumLab = this.node.getChildByName("keepNumLab").getComponent(Label);
        this.rateNumLab = this.node.getChildByName("rateNumLab").getComponent(Label);
        this.fishItemCont = this.node.getChildByName("fishItemCont");
        this.fishIcon = this.node.getChildByPath("fishItemCont/icon").getComponent(Sprite);
        this.fishWeightLab = this.node.getChildByPath("fishItemCont/weightLab").getComponent(Label);
        this.fishName = this.node.getChildByPath("fishItemCont/nameLab").getComponent(Label);
        this.fishPriceLab = this.node.getChildByPath("fishItemCont/priceLab").getComponent(Label);
        this.fishNoneLab = this.node.getChildByName("fishNoneLab").getComponent(Label);
        this.awardList = this.node.getChildByName("awardList").getComponent(AutoScroller);
        this.consumeNumLab = this.node.getChildByPath("consumeCont/numLab").getComponent(Label);
        this.winFlag = this.node.getChildByName("winFlag");
        this.loseFlag = this.node.getChildByName("loseFlag");
        this.awardList.SetHandle(this.updateItem.bind(this));
        this.isInit = true;
        this.updateShow();
    }
    SetData(data:SFishBombLogItemData) {
        this.logData = data;
        this.updateShow();
        
    }
    private updateShow():void{
        if(!this.isInit || !this.logData) return;
        this.phaseLab.string = `<size=30>第<size=40>${this.logData.round}</size>期</size>`;
        let dates:string[] = DateUtils.TimestampToDate(this.logData.start_time * 1000, true);
        this.timeLab.string = `${dates[0]}-${dates[1]}-${dates[2]}  ${dates[3]}:${dates[4]}:${dates[5]}`;
        let stdPond:StdFishBombPond;
        let selectId:number;
        if(this.logData.fish_pool_id){
            selectId = this.logData.fish_pool_id[1];
        }
        stdPond = CfgMgr.GetFishBombPond(selectId);
        if(stdPond){
            this.selectPondNameLab.string = stdPond.Name;
        }else{
            this.selectPondNameLab.string = "--";
        }
        let killPondName:string = "";
        if(this.logData.kill_pools){
            let killList:number[] = this.logData.kill_pools[1];
            if(killList){
                for (let index = 0; index < killList.length; index++) {
                    let killPondId:number = killList[index];
                    stdPond = CfgMgr.GetFishBombPond(killPondId);
                    if(stdPond){
                        if(killPondName != ""){
                            killPondName += "、";
                        }
                        killPondName += stdPond.Name;
                    }
                }
            }
            
        }
        this.killNameLab.string = killPondName == "" ? "--" : killPondName;
        this.keepNumLab.string = this.logData.odds_index != null ? (this.logData.odds_index + 1).toString() : "--";
        this.rateNumLab.string = this.logData.odds != null ? this.logData.odds.toString() : "--";
        this.winFlag.active = false;
        this.loseFlag.active = false;
        this.killWinFlag.active = false;
        this.killLoseFlag.active = false;
        this.consumeNumLab.string = formatNumber(this.logData.cost, 3);
        if(this.logData.is_win){
            let fishData:SFishingItem = this.logData.fish_item[0];
            let stdFishItem:StdFishItem = CfgMgr.GetFishItem(fishData.fish_id);
            let weightStr:string = formatNumber(fishData.weight, 2);
            this.killWinFlag.active = this.winFlag.active = this.fishItemCont.active = true;
            
            this.fishName.string = stdFishItem.Fishsname;
            this.fishWeightLab.string = weightStr;
            this.fishPriceLab.string = weightStr;
            let url = path.join(folder_icon, `fish/${stdFishItem.Icon}`, "spriteFrame");
            ResMgr.LoadResAbSub(url, SpriteFrame, res => {
                this.fishIcon.spriteFrame = res;
            });
            this.fishNoneLab.node.active = false;
            let awardList:SThing[] = [];
            //awardList[0] = ItemUtil.CreateThing(ThingType.ThingTypeItem, CfgMgr.GetFishCommon.CostItemID, data.cost_get);
            awardList[0] = ItemUtil.CreateThing(ThingType.ThingTypesFuncValue, FuncValueType.strength, this.logData.is_send_reward ? this.logData.fatigue_get : 0);
            //awardList[2] = ItemUtil.CreateThing(ThingType.ThingTypeItem, CfgMgr.GetFishCommon.ScoreItemId, data.fatigue_get);
            this.awardList.UpdateDatas(awardList);
        }else{
            this.fishItemCont.active = false;
            this.killLoseFlag.active = this.loseFlag.active = this.fishNoneLab.node.active = true;
            let awardList:SThing[] = [];
            awardList[0] = ItemUtil.CreateThing(ThingType.ThingTypeItem, CfgMgr.GetFishBombComm.ScoreItemId, this.logData.fish_score_get);
            this.awardList.UpdateDatas(awardList);
        }
        
    }
    private updateItem(item: Node, data:SThing) {
        let awardItem = item.getComponent(AwardItem);
        if (!awardItem) awardItem = item.addComponent(AwardItem);
        awardItem.SetData({itemData:data});
    }
}