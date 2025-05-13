import { Component, Label, Node, path, Sprite, SpriteFrame} from "cc";
import { AutoScroller } from "../../utils/AutoScroller";
import { AwardItem } from "../common/AwardItem";
import {  } from "../roleModule/PlayerData"
 import {SThing} from "../roleModule/PlayerStruct";
import { StdFishRankAward } from "../../manager/CfgMgr";
import { folder_icon, ResMgr } from "../../manager/ResMgr";
import { ItemUtil } from "../../utils/ItemUtils";
export class FishingRaceAwardItem extends Component {
    private rankIcon:Sprite;
    private rankLab:Label;
    private awardList:AutoScroller;
    private noAwardLab:Label;
    protected isInit = false;
    private data:StdFishRankAward;
    private rank:number;
    protected onLoad(): void {
        this.rankIcon = this.node.getChildByName("rankIcon").getComponent(Sprite);
        this.rankLab = this.node.getChildByName("rankLab").getComponent(Label);
        this.awardList = this.node.getChildByName("awardList").getComponent(AutoScroller);
        this.awardList.SetHandle(this.updateAwardItem.bind(this));
        this.noAwardLab = this.node.getChildByName("noAwardLab").getComponent(Label);
        this.isInit = true;
        this.updateShow();
    }

    SetData(data:StdFishRankAward, rank:number) {
        this.data = data;
        this.rank = rank;
        this.updateShow();
        
    }
    private updateShow():void{
        if(!this.isInit || !this.data) return;
        let awardDatas:SThing[] = [];
        this.rankIcon.node.active = false;
        if(this.rank > 0){
            if(this.rank > 3){
                this.rankLab.string = this.rank.toString();
                
            }else{
                this.rankLab.string = "";
                this.rankIcon.node.active = true;
                let url = path.join(folder_icon, `rank${this.rank}`, "spriteFrame");
                ResMgr.LoadResAbSub(url, SpriteFrame, res => {
                    this.rankIcon.spriteFrame = res;
                });
            }
            awardDatas = ItemUtil.GetSThingList(this.data.RewardType, this.data.RewardItemType, this.data.RewardNumber);
        }else{
            
            this.rankIcon.node.active = false;
            this.rankLab.string = "未上榜";
        }
        this.noAwardLab.node.active = awardDatas.length < 1;
        this.awardList.UpdateDatas(awardDatas);
    }
    private updateAwardItem(item:Node, itemData:SThing):void{
        let awardItem:AwardItem = item.getComponent(AwardItem) || item.addComponent(AwardItem);
        awardItem.SetData({itemData:itemData});
    }
}