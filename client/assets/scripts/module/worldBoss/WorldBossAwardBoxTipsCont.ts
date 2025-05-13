import { Component, Label, Node } from "cc";
import { AutoScroller } from "../../utils/AutoScroller";
import {  } from "../roleModule/PlayerData"
 import {SThing} from "../roleModule/PlayerStruct";
import { AwardItem } from "../common/AwardItem";
import { ItemTips } from "../common/ItemTips";
import { CfgMgr, StdWorldBossHurtAward } from "../../manager/CfgMgr";
import { ItemUtil } from "../../utils/ItemUtils";
import { formatNumber } from "../../utils/Utils";

export class WorldBossAwardBoxTipsCont extends Component {
    private awardList:AutoScroller;
    private hurtRangeLab:Label;
    private isInit:boolean = false;
    private datas:SThing[] = [];
    protected onLoad(): void {
        this.hurtRangeLab = this.node.getChildByName("hurtRangeLab").getComponent(Label);
        this.awardList = this.node.getChildByName("awardList").getComponent(AutoScroller);
        this.awardList.SetHandle(this.updateAwardItem.bind(this));
        this.awardList.node.on('select', this.onSelect, this);
        this.isInit = true;
        this.updateShow();
    }
    protected onEnable(): void {
        this.updateShow();
    }
    SetData(hurtVal:number) {
        let hurtAward:StdWorldBossHurtAward = CfgMgr.GetWorldBossHurtAward(hurtVal, 202);
        if(hurtAward){
            let miniHurtStr:string = formatNumber(hurtAward.MinDamage, 2);
            let maxHurtStr:string = formatNumber(hurtAward.MaxDamage, 2);
            this.hurtRangeLab.string = `伤害达${miniHurtStr}-${maxHurtStr}获得`;
            this.datas = ItemUtil.GetSThingList(hurtAward.RewardType, hurtAward.RewardItemID, hurtAward.RewardNumber);
        }else{
            this.hurtRangeLab.string = ``;
            this.datas = [];
        }
        
        this.updateShow();
    }

    private updateShow():void{
        if (!this.isInit || !this.datas) return;
        this.awardList.UpdateDatas(this.datas);
    }
    private updateAwardItem(item: Node, data: SThing) {
        let awardItem = item.getComponent(AwardItem);
        if (!awardItem) awardItem = item.addComponent(AwardItem);
        awardItem.SetData({ itemData: data });
    }
    protected async onSelect(index: number, item: Node) {
        let selectData = this.datas[index];
        if(selectData){
            ItemTips.Show(selectData);
        }
    }
}
