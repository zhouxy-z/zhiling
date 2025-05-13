import { Button, Color, Game, game, instantiate, js, Label, Layout, Node, NodePool, path, ProgressBar, RichText, Size, sp, Sprite, SpriteFrame, Tween, tween, UITransform, v2, v3, Vec2, Vec3 } from "cc";
import { Panel } from "../../GameRoot";
import { formatNumber, randomf, randomI } from "../../utils/Utils";
import { CfgMgr, FishBombRoundState, StdFishBombHamalPos, StdFishBombPond, StdFishBombSatge, StdFishRod, ThingType } from "../../manager/CfgMgr";
import { GameSet } from "../GameSet";
import { FishBombHamal } from "./FishBombHamal";
import { FishBombResultCont } from "./FishBombResultCont";
import { ConsumeItem } from "../common/ConsumeItem";
import { AdaptBgTop } from "../common/BaseUI";
import { EventMgr, Evt_Change_Scene_Bgm, Evt_FishBombDataUpdate, Evt_Hide_Scene, Evt_Item_Change, Evt_Show_Scene } from "../../manager/EventMgr";
import { SFishingBombFishPoolData, SFishingBombStageInfo, SThing } from "../roleModule/PlayerStruct";
import { ItemUtil } from "../../utils/ItemUtils";
import { ClickTipsPanel } from "../common/ClickTipsPanel";
import { FishingShopPanel } from "../fishing/FishingShopPanel";
import { FishBombPondItem } from "./FishBombPondItem";
import { BeforeGameUtils } from "../../utils/BeforeGameUtils";
import { SimpleAStarUtils } from "../../utils/SimpleAStarUtils";
import PlayerData from "../roleModule/PlayerData";
import { MsgPanel } from "../common/MsgPanel";
import { MsgTypeSend } from "../../MsgType";
import { Session } from "../../net/Session";
import { DateUtils } from "../../utils/DateUtils";
import { FishBombTipsPanel } from "./FishBombTipsPanel";
import { FishBombLogPanel } from "./FishBombLogPanel";
import { ResMgr } from "../../manager/ResMgr";
import { BezierTween3 } from "../../utils/Bezier";
import { FishBombBuyPanel } from "./FishBombBuyPanel";
import { AudioMgr, FishBombSoundId, FishBombSoundInfo, SceneBgmId } from "../../manager/AudioMgr";
import LocalStorage from "../../utils/LocalStorage";
import { Tips3 } from "../home/panel/Tips3";
import { FishBombLatestRound } from "./FishBombLatestRound";
export class FishBombPanel extends Panel {
    protected prefab: string = "prefabs/panel/fishBomb/FishBombPanel";
    private pathImg:Sprite;
    private addBtn:Button;
    private fishItemLab:Label;
    private vitLab:Label;
    private fishTicketLab:Label;
    private noOpenCont:Node;
    private totalNumCont:Node;
    private curRateLab:Label;
    private nextRateLab:Label;
    private boxEffect:sp.Skeleton;
    private latestRound:FishBombLatestRound;
    private totalNumLab:Label;
    private roundNumCont:Node;
    private roundNumLab:Label;
    private roundCont:Node;
    private openTimeLab: Label;
    private noOpenLab:Label;
    private roundEffect:sp.Skeleton;
    private roundProBar:ProgressBar;
    private roundTimeLab:Label;
    private roundCdCont:Node;
    private roundCdTimeLab:Label;
    private hamalAICont:Node;
    private tempRole:Node;
    private monster1:sp.Skeleton;
    private monster2:sp.Skeleton;
    private resultCont:FishBombResultCont;
    private roundTips:Node;
    private roundTipsEffect:sp.Skeleton;
    private roundTipsNumLab:Label;
    private operateBtnCont:Node;
    private dieMask:Node;
    private tipsCont:Node;
    private tipsRoleEffect:sp.Skeleton;
    private tipsLab:RichText;
    private downBtn:Button;
    private downBtnItem:ConsumeItem;
    private downBtnArrow:Node;
    private downCont:Node;
    private downBtnCont:Node;
    private tempDownBtn:Node;
    private helpBtn2:Button;
    private shopBtn:Button;
    private logBtn: Button;
    private gbaBtn: Button;
    private btn:Button;
    private tempCell:Node;
    private cellCont:Node;
    private awardFlyTemp:Node;
    private bombFlyTemp:Node;
    private pool:NodePool = new NodePool();
    private itemNumList:number[];
    private curItemIndex:number = -1;
    private stdFishBombPondList:StdFishBombPond[];
    private fishBombPondItem:FishBombPondItem[] = [];
    //格子大小
    private cellSize:Size = new Size(60,60);
    //18 * 14
    private mapData:number[][] = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],//0
        [1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1],//1
        [1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1],//2
        [1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1],//3
        [1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1],//4
        [1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1],//5
        [1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1],//6
        [1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1],//7
        [1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1],//8
        [1,1,1,1,0,0,1,0,0,0,0,1,1,1,1,1,1,1],//9
        [1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1],//10
        [1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1],//11
        [1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1],//12
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],//13
    ]
    private myRole:FishBombHamal;
    private pondCell: { [key: string]: Vec2 } = BeforeGameUtils.toHashMapObj(
        0, v2(8, 12),
        101, v2(4, 10),
        102, v2(11, 8),
        103, v2(12, 1),
    );
    private pondStopDir: { [key: number]: number } = BeforeGameUtils.toHashMapObj(
        0, -1,
        101, 1,
        102, -1,
        103, 1,
    );
    private monsterPos: { [key: string]: {pos:Vec3, angle:number, scale:number} } = BeforeGameUtils.toHashMapObj(
        101, {pos:v3(-352, -80), angle:30, scale:1},
        102, {pos:v3(400, -20), angle:0, scale:-1},
        103, {pos:v3(-6, -460), angle:0, scale:1},
    );
    private aiOffsetCell: { [key: string]: Vec2[] } = BeforeGameUtils.toHashMapObj(
        101, [v2(4, 10), v2(5, 10), v2(6, 10), v2(5, 9)],
        102, [v2(11, 8), v2(11, 7), v2(10, 8), v2(10, 7)],
        103, [v2(12, 1), v2(13, 1), v2(13, 2), v2(14, 1)],
    );
    private pondLabColor: { [key: string]: string } = BeforeGameUtils.toHashMapObj(
        101, "#F3B1F7",
        102, "#8EC3FF",
        103, "#FF99A0",
    );
    private pondColor = new Color();
    private curRoundId:number;//当前回合id
    private curStageId:number;//当前小回合id
    private curSelectPondId:number = 0;//当前选择池塘id
    private curRoundState:FishBombRoundState;
    private awardFlyPool:NodePool = new NodePool();
    private bombFlyPool:NodePool = new NodePool();
    private isRunAi:boolean = false;
    private currKillId:number[] = [];
    private curMyOldCost:number;
    protected onLoad(): void {
    
        this.stdFishBombPondList = CfgMgr.GetFishBombPondList();
       
        this.itemNumList = CfgMgr.GetFishBombComm.CostSelectType;
        this.helpBtn2 = this.find("topCont/helpBtn2", Button);
        this.addBtn = this.find("topCont/fishItemCont/addBtn", Button);
        this.fishItemLab = this.find("topCont/fishItemCont/fishItemLab", Label);
        this.vitLab = this.find("topCont/vitCont/vitLab", Label);
        this.fishTicketLab = this.find("topCont/fishTicketCont/fishTicketLab", Label);
        this.noOpenCont = this.find("topCont/noOpenCont");
        this.openTimeLab = this.find("topCont/noOpenCont/openTimeLab", Label);

        this.pathImg = this.find("operateCont/pathImg", Sprite);
        this.totalNumCont = this.find("operateCont/totalNumCont");
        this.totalNumLab = this.find("operateCont/totalNumCont/numLab", Label);
        this.boxEffect = this.find("operateCont/totalNumCont/boxEffect", sp.Skeleton);
        this.curRateLab = this.find("operateCont/totalNumCont/curRateLab", Label);
        this.nextRateLab = this.find("operateCont/totalNumCont/nextRateLab", Label);
        this.latestRound = this.find("operateCont/roundInfoCont").addComponent(FishBombLatestRound);
        this.roundNumCont = this.find("operateCont/roundNumCont");
        this.roundNumLab = this.find("operateCont/roundNumCont/roundNumLab", Label);
        this.roundCont = this.find("operateCont/roundCont");
        this.roundEffect = this.find("operateCont/roundCont/roundEffect", sp.Skeleton);
        this.roundProBar = this.find("operateCont/roundCont/proBar", ProgressBar);
        this.roundTimeLab = this.find("operateCont/roundCont/timeLab", Label);
        this.roundCdCont = this.find("operateCont/roundCdCont");
        this.roundCdTimeLab = this.find("operateCont/roundCdCont/roundCdLab", Label);
        this.tempCell = this.find("operateCont/pathCont/cellItem");
        this.cellCont = this.find("operateCont/pathCont/cellCont");
        this.hamalAICont = this.find("operateCont/pathCont/hamalAICont");
        this.monster1 = this.find("operateCont/monster1", sp.Skeleton);
        this.monster2 = this.find("operateCont/monster2", sp.Skeleton);
        this.dieMask = this.find("operateCont/dieMask");
        this.resultCont = this.find("resultCont").addComponent(FishBombResultCont);

        this.roundTips = this.find("roundTips");
        this.roundTipsEffect = this.find("roundTips/effect", sp.Skeleton);
        this.roundTipsNumLab = this.find("roundTips/roundNumLab", Label);

        this.operateBtnCont = this.find("bottomCont/operateBtnCont");
        this.downBtn = this.find("bottomCont/operateBtnCont/downBtn", Button);
        this.downBtnItem = this.find("bottomCont/operateBtnCont/downBtn/consumeItem").addComponent(ConsumeItem);
        this.downBtnArrow = this.find("bottomCont/operateBtnCont/downBtn/arrow");
        this.tipsCont = this.find("bottomCont/tipsCont");
        let tipsRoleEffect = this.find("bottomCont/tipsCont/tipsRoleEffect", sp.Skeleton);
        let tipsRoleEffectHc = this.find("bottomCont/tipsCont/tipsRoleEffectHc", sp.Skeleton);
        this.tipsLab = this.find("bottomCont/tipsCont/tipsLab", RichText);

        this.downCont = this.find("downCont");
        this.downBtnCont = this.find("downCont/btnCont");
        this.tempDownBtn = this.find("downCont/tempBtnNode");
        this.downCont.active = false;

        this.awardFlyTemp = this.find("awardFlyTemp");
        this.bombFlyTemp = this.find("bombFlyTemp");

        let pondItem:FishBombPondItem;
        let btn:Button;
        let stdFishBombPond:StdFishBombPond;
        for (let index = 0; index < this.stdFishBombPondList.length; index++) {
            pondItem = this.find("operateCont/pondCont/pondItem_" + (index + 1)).addComponent(FishBombPondItem);
            this.fishBombPondItem.push(pondItem);
            stdFishBombPond = this.stdFishBombPondList[index];
            pondItem.SetData(stdFishBombPond);
            btn = pondItem.node.getComponent(Button);
            btn.node.on(Button.EventType.CLICK, this.onPondSelect.bind(this, stdFishBombPond.Id));
        }

        this.noOpenLab = this.find("bottomCont/noOpenLab", Label);
        this.shopBtn = this.find("bottomCont/btnCont/shopBtn", Button);
        this.logBtn = this.find("bottomCont/btnCont/logBtn", Button);
        this.gbaBtn = this.find("bottomCont/btnCont/gbaBtn", Button);
        this.noOpenLab = this.find("bottomCont/noOpenLab", Label);

        this.btn = this.find("bottomCont/operateBtnCont/btn", Button);
        this.btn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        
        this.shopBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.logBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.gbaBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.downBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.btn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.addBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.helpBtn2.node.on(Button.EventType.CLICK, this.onHelpBtn2, this);
        this.resultCont.onHide();
        this.roundTips.active = false;
        this.monster1.node.active = false;
        this.monster2.node.active = false;
        this.CloseBy("topCont/closeBtn");

        //this.initPathCell();
        let tempHamalRole = this.find("operateCont/pathCont/hamalRole");
        let tempHamalRoleHc = this.find("operateCont/pathCont/hamalRoleHc");
        let pathCont:Node = this.find("operateCont/pathCont");
        if(GameSet.GetServerMark() == "hc"){
            this.tempRole = tempHamalRoleHc;
            this.tipsRoleEffect = tipsRoleEffectHc;
            tipsRoleEffect.node.active = false;
        }else{
            this.tempRole = tempHamalRole;
            this.tipsRoleEffect = tipsRoleEffect;
            tipsRoleEffectHc.node.active = false;
        }
        this.myRole = instantiate(this.tempRole).addComponent(FishBombHamal);
        this.myRole.node.name = "myRole"
        this.myRole.node.active = true;
        this.myRole.SetData(true);
        this.myRole.node.parent = pathCont;
        this.creatHamalAi();
    }
    private initPathCell():void{
        for(let i= 0; i < this.mapData.length; i++){
            for(let j = 0; j < this.mapData[0].length; j++){
                 let v = this.mapData[i][j];
                 if(v == 0){
                    let barrier = instantiate(this.tempCell);
                    barrier.active = true;
                    barrier.position = SimpleAStarUtils.cellPosToMapPos(j, i, this.cellSize);
                    barrier.parent = this.cellCont;
                    let posLab:Label = barrier.getChildByName("posLab").getComponent(Label);
                    posLab.string = j + "," + i;
                 }
            }
        }
    }
    private sendTime:number = 1;
    private aiTime:number = 2;
    private aiUpTime:number = 1;
    private aiLayerTime:number = 0.3;
    protected update(dt: number): void {
        if(this.curRoundState == FishBombRoundState.NoOpen || this.curRoundState == FishBombRoundState.NoRound){
            if(PlayerData.fishBombData && PlayerData.fishBombData.session_info){
                let residueTime:number = Math.floor(PlayerData.fishBombData.session_info.start_time - PlayerData.GetServerTime());
                residueTime = Math.max(residueTime, 0);
                this.openTimeLab.string = "炸鱼大作战开启：" + DateUtils.FormatTime(residueTime, "%{hh}:%{mm}:%{ss}");
                if(this.sendTime > 0){
                    this.sendTime -= dt;
                }
                if(this.sendTime <= 0){
                    this.sendTime = 1;
                    this.initSendData();
                }
            }else{
                this.openTimeLab.string = "活动未开启";
            }
        }else{
            this.sendTime = 1;
            let curRoundInfo:SFishingBombStageInfo = PlayerData.CurFishBombSatgeInfo;
            if(!curRoundInfo) return;
            this.updateRoundState(true);
            this.updateRoundTime(dt);
        }
        if(this.isRunAi){
            if(this.aiTime <= 0){
                this.runHamalAi();
                this.aiTime = 2;
            }else{
                this.aiTime-=dt;
            }
            if(this.aiUpTime <= 0){
                this.updateHamalAiCost();
                this.aiUpTime = 1;
            }else{
                this.aiUpTime-=dt;
            }
        }else{
            this.aiTime = 2;
            this.aiUpTime = 1;
        }
        if(this.aiLayerTime <= 0){
            this.aiLayerTime = 0.3;
            this.updateHamalLayer();
        }else{
            this.aiLayerTime-=dt;
        }
        
    }
    private tempTime:number = 0;
    private updateRoundTime(dt:number):void{
        this.roundEffect.node.active = false;
        let curRoundInfo:SFishingBombStageInfo = PlayerData.CurFishBombSatgeInfo;
        if(!curRoundInfo) return;
        let residueTime:number = Math.max(Math.floor(curRoundInfo.ignite_time - PlayerData.GetServerTime()), 0);
        if(residueTime > 0 && residueTime <= 5){
            this.roundEffect.node.active = true;
            if(this.tempTime <= 0){
                this.tempTime = 1;
            }else{
                this.tempTime -= dt;
            }
            
        }else{
            this.tempTime = 0;
            this.roundEffect.node.active = false;
        }
        this.roundTimeLab.string = residueTime.toString();
        this.roundProBar.progress = residueTime / (curRoundInfo.ignite_time - curRoundInfo.start_time);
        if(PlayerData.GetServerTime() >= curRoundInfo.settlement_time){
            this.roundCdCont.active = true;
            let stdSatge:StdFishBombSatge = CfgMgr.GetFishBombStage(curRoundInfo.stage_id);
            let offsetTime:number = stdSatge.StageTime - stdSatge.SettlementTime;
            residueTime = Math.max(Math.floor((curRoundInfo.settlement_time + offsetTime) - PlayerData.GetServerTime()), 0);
            this.roundCdTimeLab.string = "等待下回合 倒计时" + residueTime;
            
        }else{
            this.roundCdCont.active = false;
        }
    }
    public flush(): void{
        let is_first = LocalStorage.GetBool("firsr_fish_bomb" + PlayerData.roleInfo.player_id);
        if(!is_first){
            this.onHelpBtn2();
            LocalStorage.SetBool("firsr_fish_bomb" + PlayerData.roleInfo.player_id, true);
        }
        this.curMyOldCost = 0;
        this.isRunAi = false;
        this.downBtnArrow.angle = -90;
        this.curItemIndex = Math.max(this.curItemIndex, 0);
        this.updateItemSelect();
        this.updateRoundState(true);
        this.changeMyRolePos(true);
        this.initSendData();
        this.onItemUpdate();
    }
    
    protected onShow(): void {
        AdaptBgTop(this.node.getChildByPath("topCont/topBg"));
        AdaptBgTop(this.node.getChildByPath("roundTips/mask"));
        game.on(Game.EVENT_SHOW, this.onShowGame, this);
        EventMgr.emit(Evt_Hide_Scene, js.getClassName(this));
        EventMgr.emit(Evt_Change_Scene_Bgm, SceneBgmId.SceneBgm_10);   
        EventMgr.on(Evt_FishBombDataUpdate, this.onFishBombDataUpdate, this);
        EventMgr.on(Evt_Item_Change, this.onItemUpdate, this);
    }

    protected onHide(...args: any[]): void {
        game.off(Game.EVENT_SHOW, this.onShowGame, this);
        EventMgr.emit(Evt_Show_Scene, js.getClassByName(this));
        EventMgr.emit(Evt_Change_Scene_Bgm);
        EventMgr.off(Evt_FishBombDataUpdate, this.onFishBombDataUpdate, this);
        EventMgr.off(Evt_Item_Change, this.onItemUpdate, this);
        ClickTipsPanel.Hide();
    }
    private onItemUpdate():void{
        let itemNum:number = PlayerData.GetItemCount(CfgMgr.GetFishBombComm.CostItemID);
        this.fishItemLab.string = itemNum.toString();
        let yuPiaoNum:number = PlayerData.GetItemCount(CfgMgr.GetFishBombComm.ScoreItemId);
        this.fishTicketLab.string = yuPiaoNum.toString();
    }
    private initSendData():void{
        this.curRoundState = FishBombRoundState.NoOpen;
        this.curRoundId = 0;
        this.curStageId = 0;
        Session.Send({type: MsgTypeSend.FishingBombGetData, data:{}});
        Session.Send({type: MsgTypeSend.FishingBombJoin, data:{}});
    }
    private onFishBombDataUpdate(type:string):void{
        let newRoundId:number = 0;
        let newStageId:number = 0;
        
        if(PlayerData.fishBombData && PlayerData.fishBombData.round_info){
            newRoundId = PlayerData.fishBombData.round;
            newStageId = PlayerData.fishBombData.round_info.stage_index;
        }
        let isUpdateState:boolean = newRoundId != this.curRoundId || newStageId != this.curStageId;
        this.updateRoundState(isUpdateState);
        switch(type){
            case "InitData"://初始化数据
                //this.updateRoundInfo();
                break;
            case "PondSelect"://选择池塘
                
                break;
            case "BombLoad"://装载炸弹
                let newCost:number = PlayerData.GetFishBombSelfCurRoundCost();
                if(newCost > this.curMyOldCost){
                    let pos1:Vec3 = v3(this.downBtn.node.worldPosition.x,this.downBtn.node.worldPosition.y);
                    let pos2:Vec3 = v3(this.totalNumCont.worldPosition.x, this.totalNumCont.worldPosition.y);
                    this.flyNodePool(newCost - this.curMyOldCost, pos1,pos2 , 2);
                }
                break;
            case "NewRound"://新的大回合
                this.playRoundStart();
                break;
            case "NewStage"://新的小回合
                this.playRoundStart();
                break;
            case "Ignite"://炸弹爆炸
                break;
            case "StageSettlement"://小回合结算
                break;
            case "Settlement"://大回合结算
                break;
            case "Update"://数据更新
                break;
            case "StopRound"://停止回合
                break;
        }
        this.updateBaseInfo();
    }
    private playRoundStart():void{
        ClickTipsPanel.Hide();
        AudioMgr.playSound(FishBombSoundInfo[FishBombSoundId.Fish_Bomb_3], false);
        console.log(`播放回合开始音效---->` + FishBombSoundInfo[FishBombSoundId.Fish_Bomb_3]);
        this.roundTips.active = true;
        this.roundTipsNumLab.node.setScale(v3(0,0,0));
        Tween.stopAllByTarget(this.roundCdTimeLab.node);
        tween(this.roundTipsNumLab.node)
        .delay(0.2)
        .to(0.4, { scale: new Vec3(1, 1, 1) }, {
            easing: "backOut",                                         
        })
        .start();
        this.roundTipsEffect.clearAnimation();
        this.roundTipsEffect.setAnimation(0, "Stage", false);
        this.roundTipsEffect.setCompleteListener(()=>{
            this.roundTips.active = false;
        });
    }
    
    private updateBaseInfo():void{
        let curRoundInfo:SFishingBombStageInfo = PlayerData.CurFishBombSatgeInfo;
        let stageId:number = 1;
        let pondEffectName:string = "Lie";
        if(curRoundInfo){
            pondEffectName = "Idle";
            stageId = PlayerData.fishBombData.round_info.stage_index;
            let roundNum:number = PlayerData.fishBombData.player.odds_index + 1;
            let roundStr:string = `第${roundNum}回合`;
            this.roundTipsNumLab.string = roundNum == 1 ? "回合开始" : roundStr;
            this.roundNumLab.string = roundStr;
        }
        if(PlayerData.fishBombData && PlayerData.fishBombData.player){
            this.vitLab.string = Math.floor(PlayerData.fishBombData.player.fatigue).toString();
        }else{
            this.vitLab.string = "0";
        }
        let newCost:number = PlayerData.GetFishBombSelfCurRoundCost();
        this.myRole.SetVel(newCost);
        this.curMyOldCost = newCost;
        this.totalNumLab.string = formatNumber(newCost, 2);
        this.changeMyRolePos();
        let pathImgUrl = path.join("sheets/fishBomb", "path" + stageId, "spriteFrame");
        ResMgr.LoadResAbSub(pathImgUrl, SpriteFrame, res => {
            this.pathImg.spriteFrame = res;
        });
        let pondItem:FishBombPondItem;
        let selectPondId = PlayerData.GetFishBombCurPondId();
        let stdPond:StdFishBombPond = CfgMgr.GetFishBombPond(selectPondId);
        let curRate:number = 0;
        let rateIndex:number = PlayerData.fishBombData.player.odds_index;
        if(stdPond){
            if(rateIndex < stdPond.Odds.length){
                curRate = stdPond.Odds[rateIndex];
            }
        }
        this.curRateLab.string = curRate > 0 ? curRate.toString() : "--";
        for (let index = 0; index < this.fishBombPondItem.length; index++) {
            pondItem = this.fishBombPondItem[index];
            if(pondItem.GetStd().Id == selectPondId){
                pondItem.SetEffectAction("Select" + stageId); 
            }else{
                pondItem.SetEffectAction(pondEffectName + stageId); 
            }
            pondItem.UpdateHot();
        }

        
    }

    private updateRoleTips():void{
        this.dieMask.active = false;
        this.operateBtnCont.active = true;
        this.noOpenLab.node.active = false;
        if(PlayerData.CurFishBombSatgeInfo && PlayerData.fishBombData.session_info.is_open){
            if(PlayerData.fishBombData.player.is_alive){
                let pondId = PlayerData.GetFishBombCurPondId();
                if(pondId > 0){
                    let stdPond:StdFishBombPond = CfgMgr.GetFishBombPond(pondId);
                    if(PlayerData.GetFishBombJoin()){
                        if(PlayerData.GetServerTime() >= PlayerData.CurFishBombSatgeInfo.settlement_time + 3){
                            this.playerRoleTipsEffect("Win", `您在<color=#FF2A00>${stdPond.Name}</color>\n作战成功`);
                        }else{
                            this.playerRoleTipsEffect("Idle", `已投弹作战区域\n<color=#FF2A00>${stdPond.Name}</color>`);
                        }
                        
                    }else{
                        this.playerRoleTipsEffect("Idle", `已选择作战区域\n<color=#FF2A00>${stdPond.Name}</color>`);
                    }
                }else{
                    this.playerRoleTipsEffect("Idle", "请选择作战区域");
                } 
            }else{
                if(PlayerData.GetFishBombJoin()){
                    let dieRound:number = PlayerData.GetFishBombDieRoundNum();
                    if(dieRound == PlayerData.fishBombData.round_info.stage_index){
                        if(PlayerData.GetServerTime() >= PlayerData.CurFishBombSatgeInfo.settlement_time + 3){
                            this.updateRoleDie();
                        }
                    }else if(PlayerData.fishBombData.round_info.stage_index > dieRound){
                        this.updateRoleDie();
                    }
                    
                }else{
                    this.playerRoleTipsEffect("Lie", "您未参与作战\n请等待回合结束");
                }
                
            }
        }else{
            ClickTipsPanel.Hide();
            this.noOpenLab.string = "活动暂未开启";
            this.noOpenLab.node.active = true;
            this.operateBtnCont.active = false;
            this.playerRoleTipsEffect("Lie", "作战未开启");
        }
    }
    private updateRoleDie():void{
        this.dieMask.active = true;
        this.operateBtnCont.active = false;
        this.noOpenLab.node.active = true;
        ClickTipsPanel.Hide();
        this.noOpenLab.string = "您已被淘汰请等待回合结束";
        this.playerRoleTipsEffect("Lost2", "您已经被<color=#FF2A00>鱼怪击败</color>\n请等待回合结束...");
    }
    private changeMyRolePos(init:boolean = false):void{
        let newPondId = PlayerData.GetFishBombCurPondId();
        let targeCell:Vec2 = this.pondCell[newPondId];
        
        if(newPondId == 0 || init){
            this.myRole.StopMove(this.pondStopDir[newPondId]);
            this.curSelectPondId = newPondId;
            this.myRole.node.position = SimpleAStarUtils.cellPosToMapPos(targeCell.x, targeCell.y, this.cellSize);
        }else{
            if(this.curSelectPondId != newPondId){
                this.curSelectPondId = newPondId;
                let curCell:Vec2 = SimpleAStarUtils.mapPosToCellPos(this.myRole.node.position.x, this.myRole.node.position.y, this.cellSize);
                let pathList:Vec2[] = SimpleAStarUtils.findPath(curCell, targeCell, this.mapData);
                if(pathList && pathList.length){
                    let posList:StdFishBombHamalPos[] = this.convertPath(pathList);
                    this.myRole.SetRun(posList);
                }else{
                    console.log('----找不到炸鱼运输路径---')
                }
            }
            
        }
        
        

        this.curSelectPondId = PlayerData.GetFishBombCurPondId();
        if(this.curSelectPondId < 1){
            
        }
    }
    private convertPath(pathList:Vec2[], speed:number = 0.2):StdFishBombHamalPos[]{
        let posList:StdFishBombHamalPos[] = [];
        let preCell:Vec2;
        for (let index = 0; index < pathList.length; index++) {
            let cell:Vec2 = pathList[index];
            let scale:number = 0;
            if(preCell){
                if(cell.x < preCell.x){
                    scale = 1;
                }else if(cell.x > preCell.x){
                    scale = -1;
                }
            }
            preCell = cell;
            posList.push({
                pos:SimpleAStarUtils.cellPosToMapPos(cell.x, cell.y, this.cellSize),
                dir:scale,
                time:speed,
            });
        }
        return posList;
    }
    private updateRoundState(isUpdate:boolean = false):void{
        this.updateRoleTips();
        let state:FishBombRoundState = PlayerData.GetFishBombRoundState();
        if(!isUpdate || this.curRoundState == state) return;
        this.curRoundState = state;
        this.currKillId = [];
        this.unschedule(this.playAttackRecult);
        this.noOpenCont.active = false;
        this.myRole.node.active = true;
        this.latestRound.onShow(isUpdate);
        this.roundNumCont.active = true;
        this.roundCont.active = true;
        this.totalNumCont.active = true;
        this.resultCont.onHide();
        this.roundCdCont.active = true;
        this.noOpenCont.active = false;
        this.monster1.node.active = false;
        this.monster1.clearAnimation();
        this.monster2.node.active = false;
        this.monster2.clearAnimation();
        this.hamalAICont.active = true;
        this.isRunAi = false;
        
        switch(this.curRoundState){
            case FishBombRoundState.CanCastBomb:
                this.isRunAi = true;
                console.log("炸鱼回合状态---->可投入炸弹");
                break;
            case FishBombRoundState.BombBlasts:
                if(this.curSelectPondId > 0){
                    this.changeMyRolePos(true);
                    if(this.curSelectPondId == 101){
                        this.myRole.SetEffectName("Throwbomb_c");
                    }else{
                        this.myRole.SetEffectName("Throwbomb");
                    }
                    AudioMgr.playSound(FishBombSoundInfo[FishBombSoundId.Fish_Bomb_1], false);
                    console.log(`播放炸鱼投弹音效---->` + FishBombSoundInfo[FishBombSoundId.Fish_Bomb_1]);
                }
                this.stopHamalAi(true);
                console.log("炸鱼回合状态---->炸弹爆炸");
                break;
            case FishBombRoundState.StageSettle:
                this.playerMonsterAttack();
                console.log("炸鱼回合状态---->小回合结算");
                break;
            case FishBombRoundState.RoundSettle:
                if(PlayerData.GetFishBombJoin()){
                    this.resultCont.onShow();
                }
                console.log("炸鱼回合状态---->大回合结算");
                break;
            default:
                console.log("回合状态---->未开始")
                
                this.myRole.node.active = false;
                this.roundNumCont.active = false;
                this.roundCont.active = false;
                this.totalNumCont.active = false;
                this.roundCdCont.active = false;
                this.noOpenCont.active = true;
                this.roundTips.active = false;
                this.hamalAICont.active = false;
                this.latestRound.onHide();
                break;
        }
        
    }
    private playerRoleTipsEffect(name:string, tipsStr:string):void{
        this.tipsCont.active = true;
        if(this.tipsRoleEffect.animation != name){
            this.tipsRoleEffect.clearAnimation();
            this.tipsRoleEffect.setAnimation(0, name, true);
        }
        this.tipsLab.string = tipsStr;
    }
    private playerMonsterAttack():void{
        if(!PlayerData.CurFishBombSatgeInfo || !PlayerData.CurFishBombSatgeInfo.fish_pool) return;
        let pandDatas:{[key:number]:SFishingBombFishPoolData} = PlayerData.CurFishBombSatgeInfo.fish_pool;
        this.currKillId = [];
        for (let key in pandDatas) {
            if(pandDatas[key].is_kill){
                this.currKillId.push(pandDatas[key].fish_pool_id);
            }
        }
        if(this.currKillId.length < 1) return;
        let pondItem:FishBombPondItem;
        let killPosList:{pos:Vec3, angle:number, scale:number}[] = [];
        let pondId:number;
        for (let index = 0; index < this.fishBombPondItem.length; index++) {
            pondItem = this.fishBombPondItem[index];
            pondId = pondItem.GetStd().Id;
            if(this.currKillId.indexOf(pondId) > -1){
                killPosList.push(this.monsterPos[pondId]);
            }else{
                if(PlayerData.CurFishBombSatgeInfo.stage_id == PlayerData.fishBombData.round_info.stage_type){
                    pondItem.PlayWin();
                }
            }
        }
        if(killPosList.length < 1) return;
        for (let index = 0; index < killPosList.length; index++) {
            let pos = killPosList[index];
            this.showMonster(pos, `monster${index + 1}`);
        }
        
        if(this.currKillId.indexOf(this.curSelectPondId) > -1){
            this.changeMyRolePos(true);
        }
        AudioMgr.playSound(FishBombSoundInfo[FishBombSoundId.Fish_Bomb_2], false);
        console.log(`播放鱼怪出现音效---->` + FishBombSoundInfo[FishBombSoundId.Fish_Bomb_2]);
        this.scheduleOnce(this.playAttackRecult, 3);
        
    }
    private showMonster(pos:{pos:Vec3, angle:number, scale:number}, name:string):void{
        let monster:sp.Skeleton = this[name];
        monster.node.position = pos.pos;
        monster.node.angle = pos.angle;
        monster.node.scale = v3(pos.scale, 1, 1);
        monster.node.active = true;
        monster.setAnimation(0, "Lost", false);
        monster.setCompleteListener(()=>{
            monster.node.active = false;
        });
    }
    private playAttackRecult():void{
        if(this.currKillId.length < 1 || !PlayerData.CurFishBombSatgeInfo) return;
        let pondId:number;
        let pondItem:FishBombPondItem;
        for (let index = 0; index < this.fishBombPondItem.length; index++) {
            pondItem = this.fishBombPondItem[index];
            pondId = pondItem.GetStd().Id;
            if(this.currKillId.indexOf(pondId) < 0){
                if(PlayerData.CurFishBombSatgeInfo.stage_id == PlayerData.fishBombData.round_info.stage_type){
                    pondItem.PlayWin();
                }
            }
        }
        if(this.currKillId.length > 0 && this.curSelectPondId > 0 && this.currKillId.indexOf(this.curSelectPondId) < 0){
            this.myRole.SetEffectName("Win", false);
        }
        
        let hamalNode: Node;
        let hamalItem:FishBombHamal;
        let targeCell:Vec2;
        for (let index = 0; index < this.hamalAICont.children.length; index++) {
            hamalNode = this.hamalAICont.children[index];
            hamalItem = hamalNode.getComponent(FishBombHamal);
            if(hamalItem.GetTargetPondId() > 0){
                if(this.currKillId.indexOf(hamalItem.GetTargetPondId()) > -1){
                    hamalItem.StopMove(this.pondStopDir[0]);
                    targeCell = this.pondCell[0];
                    hamalNode.position = SimpleAStarUtils.cellPosToMapPos(targeCell.x, targeCell.y, this.cellSize);
                }else{
                    hamalItem.SetEffectName("Win", false);
                }
            }
        }
    }
    
    private onPondSelect(id:number):void{
        if(!this.checkRoundState()) return;
        if(this.curSelectPondId != id){
            Session.Send({type: MsgTypeSend.FishingBombSelect, data:{fish_pool_id: id}});
        }
        
    }
    private checkRoundState(isShowTips:boolean = true):boolean{
        if(this.curRoundState == FishBombRoundState.NoOpen){
            if(isShowTips) MsgPanel.Show("活动未开启");
            return false;
        }
        if(this.curRoundState == FishBombRoundState.NoRound){
            if(isShowTips) MsgPanel.Show("没有进行中的回合");
            return false;
        }
        if(!PlayerData.fishBombData.player.is_alive){
            if(isShowTips){
                if(PlayerData.GetFishBombJoin()){
                    MsgPanel.Show(`您在本局已经被淘汰了，请等待下局`);
                }else{
                    MsgPanel.Show(`您未参与本局作战，请等待下局`);
                }
                
            } 
            return false;
        }
        if(this.curRoundState == FishBombRoundState.BombBlasts){
            if(isShowTips) MsgPanel.Show("炸弹已点燃");
            return false;
        }
        if(this.curRoundState == FishBombRoundState.StageSettle){
            if(isShowTips) MsgPanel.Show("请等待回合开始");
            return false;
        }
        if(this.curRoundState == FishBombRoundState.RoundSettle){
            if(isShowTips) MsgPanel.Show("请等待回合开始");
            return false;
        }
        return true;
    }
    private onShowGame():void{
        this.initSendData();
    }
    private onBtnClick(btn:Button):void{
        switch(btn){
            case this.btn:
                if(!this.checkRoundState()) return;
                if(PlayerData.fishBombData.player.odds_index > 0){
                    MsgPanel.Show("非第一回合，不可再使用炸弹");
                    return;
                }
                if(PlayerData.GetFishBombCurPondId() < 1){
                    MsgPanel.Show("请先选择池塘");
                    return;
                }
                let num:number = this.itemNumList[this.curItemIndex];
                if(!ItemUtil.CheckThingConsumes([ThingType.ThingTypeItem], [CfgMgr.GetFishBombComm.CostItemID], [num], true)){
                    FishBombBuyPanel.Show();
                    return;
                }
                Session.Send({type: MsgTypeSend.FishingBombLoad, data:{cost_item_count: num}});
                break;
            case this.shopBtn:
                FishingShopPanel.Show();
                break;
            case this.logBtn:
                FishBombLogPanel.Show();
                break;
            case this.gbaBtn:
                FishBombTipsPanel.Show();
                break;
            case this.downBtn:
                this.downBtnArrow.angle = -180;
                this.onShowMenu();
                break;
            case this.addBtn:
                FishBombBuyPanel.Show();
                break;
        }
    }
    private onShowMenu():void{
        let len:number = this.itemNumList.length;
        let maxLen = Math.max(len, this.downBtnCont.children.length);
        let layout:Layout = this.downBtnCont.getComponent(Layout);
        let totalH:number = layout.paddingTop + layout.paddingBottom;
        let btnNode:Node; 
        let btn:Button;
        let typeItemCom:ConsumeItem;
        let consumeItemList:ConsumeItem[] = [];
        let typeItemNode:Node;
        let itemNum:number;
        let itemDataList:SThing[] = [];
        for (let index = 0; index < maxLen; index++) {
            btnNode = this.downBtnCont.children[index];
            if(!btnNode){
                btnNode = instantiate(this.tempDownBtn);
                btnNode.parent = this.downBtnCont;
            }
            typeItemNode = btnNode.getChildByName("consumeItem");
            btn = btnNode.getComponent(Button);
            btn.node.targetOff(this);
            if(index < len){
                itemNum = this.itemNumList[index];
                btnNode.position = new Vec3(0,0,0);
                btnNode.active = true;
                btn.node.on(Button.EventType.CLICK, this.onMenuBtnClick.bind(this, index), this);
                totalH += btnNode.getComponent(UITransform).height;
                totalH += layout.spacingY;
                typeItemCom = typeItemNode.getComponent(ConsumeItem) || typeItemNode.addComponent(ConsumeItem);
                consumeItemList.push(typeItemCom);
                itemDataList.push(ItemUtil.CreateThing(ThingType.ThingTypeItem, CfgMgr.GetFishBombComm.CostItemID, itemNum));
                if(index < this.itemNumList.length - 1) totalH += layout.spacingY;
            }else{
                btnNode.active = false;
            }
        }
        let showPos = this.downBtn.node.worldPosition.clone();
        this.downBtnCont.getComponent(UITransform).height = totalH;
        this.downCont.getComponent(UITransform).height = totalH;
        //let downBg = this.downCont.getChildByName("bg");
        //downBg.getComponent(UITransform).height = totalH;
        
        showPos.y += 60;
        this.scheduleOnce(()=>{
            let item:ConsumeItem;
            for (let index = 0; index < itemDataList.length; index++) {
                item = consumeItemList[index];
                item.SetData(itemDataList[index]);
            }
        },0.1)
        ClickTipsPanel.Show(this.downCont, this.node, this.downBtn.node, showPos, 0,()=>{
            this.downBtnArrow.angle = -90;
        });
    }

    private onMenuBtnClick(index:number):void{
        this.curItemIndex = index;
        this.updateItemSelect();
        ClickTipsPanel.Hide();
    }
    private updateItemSelect():void{
        let num:number = this.itemNumList[this.curItemIndex];
        let itemData:SThing = ItemUtil.CreateThing(ThingType.ThingTypeItem, CfgMgr.GetFishBombComm.CostItemID, num);
        this.downBtnItem.SetData(itemData);
    }
    private flyNodePool(num:number, pos1:Vec3, pos2:Vec3, flyType:number):void{
        if(num < 1 || !pos1) return;
        let p1:Vec3 = pos1;
        let p2:Vec3 = pos2;
        let c1:Vec3;
        let c2:Vec3;
        let maxNum:number = 8;
        num = Math.min(num, maxNum);
        for (let index = 0; index < num; index++) {
            let angle = randomf(index * 360 / num, (index + 1) * 360 / num);
            let r = randomf(100, 150);// 随机散开半径
            let rx = p1.x + r * Math.cos(angle);
            let ry = p1.y + r * Math.sin(angle);
            c1 = new Vec3(p1.x - randomI(200, 100), p1.y + randomI(400, 300), p1.z);
            c2 = new Vec3(p2.x - randomI(100, 50), p2.y - randomI(200, 100), p2.z);
            this.creatFlyNode(index * randomf(0.05, 0.1), new Vec3(rx, ry), c1, c2, p2, flyType);
        }
    }
    private creatFlyNode(delay:number, p1:Vec3, c1:Vec3, c2:Vec3, p2:Vec3, flyType:number):void{
        let copyNode: Node;
        let pool:NodePool;
        let tempNode:Node;
        if(flyType == 1){
            pool = this.awardFlyPool;
            tempNode = this.awardFlyTemp;
        }else{
            pool = this.bombFlyPool;
            tempNode = this.bombFlyTemp;
        }
        if (pool.size() > 0) {
            copyNode = pool.get();
        } else {
            copyNode = instantiate(tempNode);   
        }
        this.node.addChild(copyNode);
        copyNode.active = true;
        copyNode.worldPosition = p1;
        BezierTween3(copyNode, 1, p1, c1, c2, p2, delay, () => {
            pool.put(copyNode);
            if(flyType == 1){
                this.boxEffect.setAnimation(0, "plus", false);
                this.boxEffect.setCompleteListener(() => {
                    this.boxEffect.setAnimation(0, "animation", true);
                }); 
            }
        });
    }
    
    private creatHamalAi():void{
        let hamalNode: Node;
        let hamalItem:FishBombHamal;
        for (let index = 0; index < 10; index++) {
            hamalNode = instantiate(this.tempRole);
            hamalNode.name = this.tempRole.name + (index + 1);
            hamalItem = hamalNode.getComponent(FishBombHamal) || hamalNode.addComponent(FishBombHamal);
            hamalItem.SetData(false);
            hamalItem.SetTargetPondId(0);
            this.hamalAICont.addChild(hamalNode);
            hamalNode.active = true;
            hamalNode.position = SimpleAStarUtils.cellPosToMapPos(this.pondCell[0].x, this.pondCell[0].y, this.cellSize);
        }
    }
    private updateHamalAiCost():void{
        if(!PlayerData.CurFishBombSatgeInfo) return;
        let runNum:number = randomI(0, this.hamalAICont.children.length - 1);
        let runIndexList:number[] = [];
        let randomIndex:number;
        let stdRodList:StdFishRod[] = CfgMgr.GetFishRodTypeList(2);
        while(runIndexList.length < runNum){
            randomIndex = randomI(0, runNum);
            if(runIndexList.indexOf(randomIndex) < 0){
                runIndexList.push(randomIndex);
            }
        }
        let hamalNode: Node;
        let hamalItem:FishBombHamal;
        let std:StdFishRod;
        for (let index = 0; index < runIndexList.length; index++) {
            hamalNode = this.hamalAICont.children[runIndexList[index]];
            hamalItem = hamalNode.getComponent(FishBombHamal);
            std = stdRodList[randomI(0, stdRodList.length - 1)];
            let num:number = randomf(std.MinValue, std.MaxValue);
            hamalItem.SetVel(num);
        }
    }
    private runHamalAi():void{
        if(!PlayerData.CurFishBombSatgeInfo) return;
        let runNum:number = randomI(0, this.hamalAICont.children.length - 1);
        let runIndexList:number[] = [];
        let randomIndex:number;
        while(runIndexList.length < runNum){
            randomIndex = randomI(0, runNum);
            if(runIndexList.indexOf(randomIndex) < 0){
                runIndexList.push(randomIndex);
            }
        }
        let hamalNode: Node;
        let hamalItem:FishBombHamal;
        let curCell:Vec2;
        let targeCell:Vec2;
        let posList:StdFishBombHamalPos[];
        for (let index = 0; index < runIndexList.length; index++) {
            hamalNode = this.hamalAICont.children[runIndexList[index]];
            hamalItem = hamalNode.getComponent(FishBombHamal);
            curCell = SimpleAStarUtils.mapPosToCellPos(hamalNode.position.x, hamalNode.position.y, this.cellSize);
            let pondId:number = randomI(101, 103);
            hamalItem.SetTargetPondId(pondId);
            let aiPosList:Vec2[] = this.aiOffsetCell[pondId];
            let posIndex:number = randomI(0, aiPosList.length - 1);
            targeCell = aiPosList[posIndex];
            let pathList:Vec2[] = SimpleAStarUtils.findPath(curCell, targeCell, this.mapData);
            if(pathList && pathList.length){
                hamalItem.StopMove();
                posList = this.convertPath(pathList, randomf(0.1, 0.3));
                hamalItem.SetRun(posList);
            }
        }
    }

    private stopHamalAi(isBomb:boolean = true):void{
        let hamalNode: Node;
        let hamalItem:FishBombHamal;
        let targeCell:Vec2;
        for (let index = 0; index < this.hamalAICont.children.length; index++) {
            hamalNode = this.hamalAICont.children[index];
            hamalItem = hamalNode.getComponent(FishBombHamal);
            let stopId:number = randomI(101, 104);
            if(!this.pondStopDir[stopId]){
                stopId = 0;
            }
            hamalItem.SetTargetPondId(stopId);
            hamalItem.StopMove(this.pondStopDir[stopId]);
            targeCell = this.pondCell[stopId];
            hamalNode.position = SimpleAStarUtils.cellPosToMapPos(targeCell.x, targeCell.y, this.cellSize);
            if(stopId > 0){
                if(stopId == 101){
                    hamalItem.SetEffectName("Throwbomb_c");
                }else{
                    hamalItem.SetEffectName("Throwbomb");
                }
                
            }
        }
        
    }
    private updateHamalLayer():void{
        this.hamalAICont.children.sort((a:Node, b:Node)=>{
            return b.position.y - a.position.y;
        });
        
    }
    private onHelpBtn2() {
        Tips3.Show(6);
    }
}