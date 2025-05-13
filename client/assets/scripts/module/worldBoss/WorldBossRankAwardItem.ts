import { Node, Component, Label, path, Sprite, SpriteFrame } from "cc";
import { SThing } from "../roleModule/PlayerStruct";
import { AutoScroller } from "../../utils/AutoScroller";
import { StdWorldBossRankAward } from "../../manager/CfgMgr";
import { folder_icon, ResMgr } from "../../manager/ResMgr";
import { AwardItem } from "../common/AwardItem";
import { ItemUtil } from "../../utils/ItemUtils";
import { ItemTips } from "../common/ItemTips";

export class WorldBossRankAwardItem extends Component {
    private rankIcon: Sprite;
    private rankLab: Label;
    private awardList:AutoScroller;
    private data:StdWorldBossRankAward;
    private isInit:boolean = false;
    private awardDatas:SThing[];
    protected onLoad(): void {
        this.rankIcon = this.node.getChildByName("rankIcon").getComponent(Sprite);
        this.rankLab = this.node.getChildByName("rankLab").getComponent(Label);
        this.awardList = this.node.getChildByName("awardList").getComponent(AutoScroller);
        this.awardList.SetHandle(this.updateAwardItem.bind(this));
        this.awardList.node.on('select', this.onSelect, this);
        this.isInit = true;
        this.initShow();
    }

    SetData(data:StdWorldBossRankAward,):void {
        this.data = data;
        this.initShow();
    }
    private initShow():void{
        if(!this.isInit || !this.data) return;
        this.awardDatas = [];
        if(this.data.ListModeID > 0){
            this.awardDatas = ItemUtil.GetSThingList(this.data.RewardType, this.data.RewardItemType, this.data.RewardNumber);
            if(this.data.Ranking[0] == 1){
                let rankNum:number = this.data.Ranking[1];
                if(rankNum > 3){
                    this.rankIcon.node.active = false;
                    this.rankLab.node.active = true;
                    this.rankLab.string = rankNum.toString();
                }else{
                    this.rankIcon.node.active = true;
                    this.rankLab.node.active = false;
                    ResMgr.LoadResAbSub(path.join(folder_icon, `rank${rankNum}`, "spriteFrame"), SpriteFrame, (res)=>{
                        this.rankIcon.spriteFrame = res;
                    });
                }
            }
        }else{
            this.rankIcon.node.active = false;
            this.rankLab.node.active = true;
            this.rankLab.string = "未上榜";
        }
        
        this.awardList.UpdateDatas(this.awardDatas);
    }
    private updateAwardItem(item: Node, data: SThing) {
        let awardItem = item.getComponent(AwardItem);
        if (!awardItem) awardItem = item.addComponent(AwardItem);
        awardItem.SetData({ itemData: data });
    }
    private onSelect(index: number, item: Node) {
        let selectData = this.awardDatas[index];
        if(selectData){
            ItemTips.Show(selectData);
        }
    }
}