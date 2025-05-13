import { Component, Label, sp } from "cc";
import { ConsumeItem } from "../common/ConsumeItem";
import { } from "../roleModule/PlayerData"
 import {SFishingRankPlayerInfoData,SThing} from "../roleModule/PlayerStruct";
import { ItemUtil } from "../../utils/ItemUtils";
import { CfgMgr, StdFishRankAward, StdFishRankType, ThingType } from "../../manager/CfgMgr";

export class FishingRaceRankAwardTopItem extends Component {
    private bodyModel:sp.Skeleton;
    private nameLab: Label;
    private rankLab: Label;
    private consumeItem: ConsumeItem;
    private data:SFishingRankPlayerInfoData;
    private awardData:StdFishRankAward;
    private isInit:boolean = false;
    protected onLoad(): void {
        this.bodyModel = this.node.getChildByName("bodyModel").getComponent(sp.Skeleton);
        this.nameLab = this.node.getChildByName("nameLab").getComponent(Label);
        this.rankLab = this.node.getChildByName("rankLab").getComponent(Label);
        this.consumeItem = this.node.getChildByName("ConsumeItem").addComponent(ConsumeItem);
        this.isInit = true;
        this.initShow();
    }

    SetData(data:SFishingRankPlayerInfoData, awardData:StdFishRankAward) {
        this.data = data;
        this.awardData = awardData;
        this.initShow();
    }
    private initShow():void{
        if(!this.isInit || !this.data) return;
        this.nameLab.string = this.data.name;
        this.rankLab.string = this.data.rank.toString();
        this.consumeItem.SetData(ItemUtil.CreateThing(this.awardData.RewardType[0], this.awardData.RewardItemType[0], this.awardData.RewardNumber[0]));
    }
}