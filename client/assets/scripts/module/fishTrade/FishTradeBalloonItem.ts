import { Button, Component, Label, Node, RichText, sp } from "cc";
import { formatNumber, randomI, ToFixed } from "../../utils/Utils";
import { CfgMgr, StdFishTradeShip } from "../../manager/CfgMgr";
import { BeforeGameUtils } from "../../utils/BeforeGameUtils";
import PlayerData, {  } from "../roleModule/PlayerData"
 import {SFishingTradeRoundInfo, SFishingTradeShipData} from "../roleModule/PlayerStruct";
/**气球待机动作类型 */
enum BalloonWeightType {
    Weight_0,//没有鱼待机状态
    Weight_1,//小筐鱼待机状态
    Weight_2,//中筐鱼待机状态
    Weight_3,//大筐鱼待机状态
}

export class FishTradeBalloonItem extends Component {
    private select:Node;
    private effect:sp.Skeleton;
    private nameIcon:Node;
    private myFishCont:Node;
    private tipsLab:RichText;
    private numLab:Label;
    private std:StdFishTradeShip;
    private data:SFishingTradeShipData;
    private isInit:boolean = false;
    private isSelect:boolean = false;
    private isHot:boolean = false;
    private curAnimInfo:{idleName:string, flyName:string};
    private curWeight:BalloonWeightType = BalloonWeightType.Weight_0;
    private balloonAnimInfo:{[key: string]: {idleName:string, flyName:string}} = BeforeGameUtils.toHashMapObj(
        BalloonWeightType.Weight_0, {idleName:"Idle_0",flyName:"Take_off_0"},
        BalloonWeightType.Weight_1, {idleName:"Idle_1", flyName:"Take_off_1"},
        BalloonWeightType.Weight_2, {idleName:"Idle_2", flyName:"Take_off_2"},
        BalloonWeightType.Weight_3, {idleName:"Idle_3", flyName:"Take_off_3"},
    );
    private weightTime_1:number = Number.MAX_VALUE;
    private weightTime_2:number = Number.MAX_VALUE;
    private weightTime_3:number = Number.MAX_VALUE;
    protected onLoad(): void {
        this.select = this.node.getChildByName("select");
        this.effect = this.node.getChildByName("effect").getComponent(sp.Skeleton);
        this.nameIcon = this.node.getChildByName("nameIcon");
        this.tipsLab = this.node.getChildByPath("nameIcon/tipsLab").getComponent(RichText);
        this.myFishCont = this.node.getChildByName("myFishCont");
        this.numLab = this.node.getChildByPath("myFishCont/numLab").getComponent(Label);
        this.initWeightTime();
        this.isInit = true;
        this.updateShow();
    }
    protected update(dt: number): void {
        let curRoundInfo:SFishingTradeRoundInfo = PlayerData.CurFishTradeRoundInfo;
        if(!curRoundInfo){
            this.initWeightTime();
            this.curWeight = BalloonWeightType.Weight_0;
            this.updateShipWeight();
        }else{
            let residueTime:number;
            let selectLakeTime:number = curRoundInfo.start_time + CfgMgr.GetFishTradeCommon.DepartureTime;
            residueTime = Math.max(Math.floor(selectLakeTime - PlayerData.GetServerTime()), 0);
            if(residueTime > 0){
                if(residueTime <= this.weightTime_1){
                    this.curWeight = BalloonWeightType.Weight_3;
                }else if(residueTime <= this.weightTime_2){
                    this.curWeight = BalloonWeightType.Weight_2;
                }else if(residueTime <= this.weightTime_3){
                    this.curWeight = BalloonWeightType.Weight_1;
                }
                this.updateShipWeight();
            }else{
                if(PlayerData.fishTradeData.player.round_cost < 1){
                    this.initWeightTime();
                    this.curWeight = BalloonWeightType.Weight_0;
                    this.updateShipWeight();
                }
            }
        }
        
    }
    private initWeightTime():void{
        this.weightTime_1 = randomI(1, 5);
        this.weightTime_2 = randomI(11, 17);
        this.weightTime_3 = randomI(20, 25);
    }
    SetData(data:StdFishTradeShip, isSelect:boolean = false):void{
        this.std = data;
        this.isSelect = isSelect;
        this.updateShow();
    }
    
    private updateShow():void{
        if(!this.isInit || !this.std) return;
        this.data = PlayerData.GetShipData(this.std.ShipId);
        if(!this.data) return;
        this.select.active = this.isSelect;
        this.tipsLab.string = this.std.TitleTips;
        this.myFishCont.active = this.isSelect;
        this.nameIcon.active = true;
        this.tipsLab.node.active = true;
        let num:number = PlayerData.fishTradeData.player ? PlayerData.fishTradeData.player.round_cost : 0; 
        this.numLab.string = ToFixed(num, 2);
        this.updateShipWeight();
    }

    PlayEfect(isFly:boolean = false):void{
        let animName:string = isFly ? this.curAnimInfo.flyName : this.curAnimInfo.idleName;
        if(animName == this.effect.animation) return;
        this.effect.setAnimation(0, animName, !isFly);
        this.effect.setCompleteListener(() => {
            if(isFly){
                this.initWeightTime();
                this.curWeight = this.curWeight = BalloonWeightType.Weight_0;
                this.updateShipWeight();
            }
        });
        if(isFly){
            this.myFishCont.active = false;
            this.nameIcon.active = false;
            this.isSelect = false;
            this.select.active = false;
            this.tipsLab.node.active = false;
        }
    }

    private updateShipWeight():void{
        this.curAnimInfo = this.balloonAnimInfo[this.curWeight];
        this.PlayEfect();
    }
}