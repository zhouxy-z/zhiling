import { Color, Component, Label, Node } from "cc";
import { AutoScroller } from "../../utils/AutoScroller";
import {  } from "../../module/roleModule/PlayerData"
 import {SThing} from "../../module/roleModule/PlayerStruct";
import { AwardItem } from "../../module/common/AwardItem";
import { ItemTips } from "../../module/common/ItemTips";
import { ConditionType, StdLevel } from "../../manager/CfgMgr";
import { ItemUtil } from "../../utils/ItemUtils";

export class PveAwardItem extends Component {
    private finishNoPassPoint:Node;
    private finishPassPoint:Node;
    private passPoint:Node;
    private currPoint:Node;
    private noPassPoint:Node;
    private nameLab:Label;
    private battlePowerLab:Label;
    private currIcon:Node;
    private awardList:AutoScroller;
    private isInit:boolean = false;
    private awList:SThing[] = [];
    private type:number;
    private std:StdLevel;
    private curLv:number;
    private len:number;
    protected onLoad(): void {
        this.finishNoPassPoint = this.node.getChildByPath("point/finishNoPassPoint");
        this.finishPassPoint = this.node.getChildByPath("point/finishPassPoint");
        this.passPoint = this.node.getChildByPath("point/passPoint");
        this.currPoint = this.node.getChildByPath("point/currPoint");
        this.noPassPoint = this.node.getChildByPath("point/noPassPoint");
        this.nameLab = this.node.getChildByPath("titleCont/nameLab").getComponent(Label);
        this.battlePowerLab = this.node.getChildByPath("titleCont/battlePowerLab").getComponent(Label);
        this.currIcon = this.node.getChildByPath("currIcon");
        this.awardList = this.node.getChildByName("awardList").getComponent(AutoScroller);
        this.awardList.SetHandle(this.updateAwardItem.bind(this));
        this.awardList.node.on('select', this.onSelect, this);
        this.isInit = true;
        this.updateShow();
    }
    
    SetData(data:StdLevel, type:number, curLv:number, len:number) {
        this.std = data;
        this.type = type;
        this.curLv = curLv;
        this.len = len;
        this.updateShow();
        
    }
    
    private updateShow():void {
        if(!this.isInit || !this.std) return;
        this.finishNoPassPoint.active = false;
        this.finishPassPoint.active = false;
        this.passPoint.active = false;
        this.currPoint.active = false;
        this.noPassPoint.active = false;
        this.currIcon.active = false;
        this.nameLab.string = `${this.std.ChapterName}${this.std.Name}`;
        
        this.awList = [];
        let needBattlePower:number = 0;
        if(this.type == 1){
            this.awList = ItemUtil.GetSThingList(this.std.RewardType, this.std.RewardID, this.std.RewardNumber);
            let condIdList:number[] = this.std.ConditionId ? this.std.ConditionId : [];
            for (let index = 0; index < condIdList.length; index++) {
                let condId:number = condIdList[index];
                if(condId == ConditionType.PlayerPower){
                    needBattlePower = this.std.ConditionValue[index];
                    break;
                }
            }
            this.currIcon.active = this.curLv == 0 && this.std.ID == 1 ? true : this.std.ID == this.curLv + 1;
            this.nameLab.color = this.currIcon.active ? new Color().fromHEX("#0F2DC5") : new Color().fromHEX("#2F7387");
            if(this.std.ID == 1){
                if(this.curLv >= this.std.ID){
                    this.finishPassPoint.active = true;
                }else{
                    this.finishNoPassPoint.active = true;
                }
                
            }else{
                if(this.curLv >= this.std.ID){
                    this.passPoint.active = true;
                }else {
                    if(this.curLv + 1 == this.std.ID){
                        this.currPoint.active = true;
                    }else{
                        this.noPassPoint.active = true;
                    }
                    
                }
            }
            this.battlePowerLab.string = `战力限制:${needBattlePower}`;
        }else if(this.type == 2){
            this.awList = ItemUtil.GetSThingList(this.std.sweepType, this.std.sweepID, this.std.sweepNumber);
            needBattlePower = this.std.SweepPower;
            this.currIcon.active = this.curLv == 0 && this.std.ID == 1 || this.std.ID == this.curLv ? true : false;
            this.nameLab.color = this.currIcon.active ? new Color().fromHEX("#0F2DC5") : new Color().fromHEX("#2F7387");
            if(this.std.ID == 1){
                if(this.curLv <= this.std.ID){
                    this.finishNoPassPoint.active = true;
                }else{
                    this.finishPassPoint.active = true;
                }
                
            }else{
                if(this.curLv == this.std.ID){
                    this.currPoint.active = true;
                }else if(this.curLv < this.std.ID){
                    this.noPassPoint.active = true;
                }else{
                    this.passPoint.active = true;
                }
            }
            this.battlePowerLab.string = `总战力限制:${needBattlePower}`;
        } 
        this.awardList.UpdateDatas(this.awList);
        
    
        
        
    }

    private updateAwardItem(item: Node, data: SThing) {
        let awardItem = item.getComponent(AwardItem);
        if (!awardItem) awardItem = item.addComponent(AwardItem);
        awardItem.SetData({ itemData: data });
    }
    protected onSelect(index: number, item: Node):void {
        let selectData = this.awList[index];
        if(selectData){
            ItemTips.Show(selectData);
        }
    }
}