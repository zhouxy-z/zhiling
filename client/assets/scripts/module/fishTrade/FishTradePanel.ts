import { Button, Game, game, Input, instantiate, js, Label, Layout, Node, NodePool, path, ProgressBar, Size, sp, Sprite, SpriteFrame, tween, UITransform, Vec3 } from "cc";
import { Panel } from "../../GameRoot";
import { FishTradeFishSelectPanel } from "./FishTradeFishSelectPanel";
import { ClickTipsPanel } from "../common/ClickTipsPanel";
import { CfgMgr, FishTradeRoundState, OneOffRedPointId, StdFishTradeShip, StdItem, ThingType } from "../../manager/CfgMgr";
import { ConsumeItem } from "../common/ConsumeItem";
import PlayerData, {} from "../roleModule/PlayerData"
 import {FishingTradePlayerSettlementData,SFishingItem,SFishingTradeRoundInfo,SFishingTradeShipData,SThing} from "../roleModule/PlayerStruct";
import { ItemUtil } from "../../utils/ItemUtils";
import { EventMgr, Evt_Change_Scene_Bgm, Evt_FishItemUpdate, Evt_FishTradeDataUpdate, Evt_FishTradeSelect, Evt_Hide_Scene, Evt_Item_Change, Evt_Show_Scene } from "../../manager/EventMgr";
import { formatNumber, randomI } from "../../utils/Utils";
import { FishTradeLatestCont } from "./FishTradeLatestCont";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import { FishTradeRunCont } from "./FishTradeRunCont";
import { FishTradeResultCont } from "./FishTradeResultCont";
import { AdaptBgTop } from "../common/BaseUI";
import { FishTradeBalloonItem } from "./FishTradeBalloonItem";
import { DateUtils } from "../../utils/DateUtils";
import { MsgPanel } from "../common/MsgPanel";
import { FishTradeTipsPanel } from "./FishTradeTipsPanel";
import { FishTradeItemBuyPanel } from "./FishTradeItemBuyPanel";
import { FishTradeLogPanel } from "./FishTradeLogPanel";
import { ResMgr } from "../../manager/ResMgr";
import { AudioMgr, FishTradeSoundId, FishTradeSoundInfo, SceneBgmId } from "../../manager/AudioMgr";
import { FishingShopPanel } from "../fishing/FishingShopPanel";
import { GameSet } from "../GameSet";
import LocalStorage from "../../utils/LocalStorage";
import { Tips3 } from "../home/panel/Tips3";
import { FishTradeCastRankPanel } from "./FishTradeCastRankPanel";

export class FishTradePanel extends Panel {
    protected prefab: string = "prefabs/panel/fishTrade/FishTradePanel";
    private addBtn:Button;
    private fishItemLab:Label;
    private vitLab:Label;
    private fishTicketLab:Label;
    private noOpenCont:Node;
    private openTimeLab: Label;
    private noOpenLab:Label;
    private latestCont:FishTradeLatestCont;
    private totalFishNumCont:Node;
    private totalFishNumLab:Label;
    private roundCont:Node;
    private roundEffect:sp.Skeleton;
    private roundProBar:ProgressBar;
    private roundTimeLab:Label;
    private roundCdCont:Node;
    private roundCdTimeLab:Label;
    private hamalCont:Node;
    private tempHamalRole:Node;
    private tempHamalRoleHc:Node;
    private balloonList:FishTradeBalloonItem[] = [];
    private runCont:FishTradeRunCont;
    private resultCont:FishTradeResultCont;
    private rankBtn: Button;
    private shopBtn:Button;
    private logBtn: Button;
    private gbaBtn: Button;
    private operateBtnCont:Node;
    private fishBtn:Button;
    private fishBtnLab:Label;
    private downBtn:Button;
    private downBtnItem:ConsumeItem;
    private downBtnArrow:Node;
    private downCont:Node;
    private downBtnCont:Node;
    private tempDownBtn:Node;
    private btn:Button;
    private btnIcon:Sprite;
    private itemNumList:number[];
    private curItemIndex:number = 0;
    private curSelectFinsList:number[] = [];
    private curRoundId:number;
    private hamalPath:Vec3[][] = [
        [new Vec3(0,120),new Vec3(540,120),new Vec3(540,524),new Vec3(274,524)],
        [new Vec3(0,120),new Vec3(540,120),new Vec3(540,524),new Vec3(540,676)],
        [new Vec3(0,120),new Vec3(540,120),new Vec3(540,524),new Vec3(818,524)]
    ];
    private pool:NodePool = new NodePool();
    private stdFishTradeShip:StdFishTradeShip[] = [];
    private curSelectShipId:number = -1;
    private curRoundState:FishTradeRoundState;
    private isInit:boolean;
    private curWeightVal:number = 0;
    private oldShipPutNum:{[key:string]:number};
    protected onLoad(): void {
        this.itemNumList = [0];
        this.itemNumList =  this.itemNumList.concat(CfgMgr.GetFishTradeCommon.CostSelectType);
        this.itemNumList.reverse();

        this.stdFishTradeShip = CfgMgr.GetFishTradeShipList;
        this.addBtn = this.find("topCont/fishItemCont/addBtn", Button);
        this.fishItemLab = this.find("topCont/fishItemCont/fishItemLab", Label);
        this.vitLab = this.find("topCont/vitCont/vitLab", Label);
        this.fishTicketLab = this.find("topCont/fishTicketCont/fishTicketLab", Label);
        this.noOpenCont = this.find("topCont/noOpenCont");
        this.openTimeLab = this.find("topCont/noOpenCont/openTimeLab", Label);

        this.latestCont = this.find("operateCont/latestCont").addComponent(FishTradeLatestCont);
        this.totalFishNumCont = this.find("operateCont/totalFishNumCont");
        this.totalFishNumLab = this.find("operateCont/totalFishNumCont/numLab", Label);
        this.roundCont = this.find("operateCont/roundCont");
        this.roundEffect = this.find("operateCont/roundCont/roundEffect", sp.Skeleton);
        this.roundProBar = this.find("operateCont/roundCont/proBar", ProgressBar);
        this.roundTimeLab = this.find("operateCont/roundCont/timeLab", Label);
        this.roundCdCont = this.find("operateCont/roundCdCont");
        this.roundCdTimeLab = this.find("operateCont/roundCdCont/roundCdLab", Label);

        this.hamalCont = this.find("operateCont/pathCont/hamalCont");
        this.tempHamalRole = this.find("operateCont/pathCont/hamalRole");
        this.tempHamalRoleHc = this.find("operateCont/pathCont/hamalRoleHc");

        this.runCont = this.find("runCont").addComponent(FishTradeRunCont);
        this.resultCont = this.find("resultCont").addComponent(FishTradeResultCont);

        this.noOpenLab = this.find("bottomCont/noOpenLab", Label);
        this.rankBtn = this.find("bottomCont/btnCont/rankBtn", Button);
        this.shopBtn = this.find("bottomCont/btnCont/shopBtn", Button);
        this.logBtn = this.find("bottomCont/btnCont/logBtn", Button);
        this.gbaBtn = this.find("bottomCont/btnCont/gbaBtn", Button);
        this.noOpenLab = this.find("bottomCont/noOpenLab", Label);

        this.operateBtnCont = this.find("bottomCont/operateBtnCont");
        this.fishBtn = this.find("bottomCont/operateBtnCont/fishBtn", Button);
        this.fishBtnLab = this.find("bottomCont/operateBtnCont/fishBtn/fishBtnLab", Label);
        this.downBtn = this.find("bottomCont/operateBtnCont/downBtn", Button);
        this.downBtnItem = this.find("bottomCont/operateBtnCont/downBtn/consumeItem").addComponent(ConsumeItem);
        this.downBtnArrow = this.find("bottomCont/operateBtnCont/downBtn/arrow");
        this.btn = this.find("bottomCont/operateBtnCont/btn", Button);
        this.btnIcon = this.find("bottomCont/operateBtnCont/btn/cont/icon", Sprite);

        this.downCont = this.find("downCont");
        this.downBtnCont = this.find("downCont/btnCont");
        this.tempDownBtn = this.find("downCont/tempBtnNode");
        this.downCont.active = false;

        let balloonItem:FishTradeBalloonItem;
        let btn:Button;
        let stdFishTradeShip:StdFishTradeShip;
        for (let index = 0; index < this.stdFishTradeShip.length; index++) {
            balloonItem = this.find("operateCont/balloonCont/balloonCont_" + (index + 1)).addComponent(FishTradeBalloonItem);;
            this.balloonList.push(balloonItem);
            stdFishTradeShip = this.stdFishTradeShip[index];
            balloonItem.SetData(stdFishTradeShip);
            btn = balloonItem.node.getComponent(Button);
            btn.node.on(Button.EventType.CLICK, this.onBalloonSelect.bind(this, stdFishTradeShip.ShipId));
        }
        
        this.CloseBy("topCont/closeBtn");
        this.rankBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.shopBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.logBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.gbaBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.fishBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.downBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.btn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.addBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.runCont.onHide();
        this.resultCont.onHide();
        this.find("bottomCont/btnCont/heleBtn2").on(Input.EventType.TOUCH_END, this.onHelpBtn2, this);
    }
    private sendTime:number = 1;
    protected update(dt: number): void {
        if(this.curRoundState == FishTradeRoundState.No){
            //防止未加入参加运鱼就开着界面等活动开时，到时间主动请求加入
            if(PlayerData.fishTradeData && PlayerData.fishTradeData.session_info){
                let residueTime:number = Math.floor(PlayerData.fishTradeData.session_info.start_time - PlayerData.GetServerTime());
                residueTime = Math.max(residueTime, 0);
                this.openTimeLab.string = "变异鱼大冒险开启：" + DateUtils.FormatTime(residueTime, "%{hh}:%{mm}:%{ss}");
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
            let curRoundInfo:SFishingTradeRoundInfo = PlayerData.CurFishTradeRoundInfo;
            if(!curRoundInfo) return;
            let residueTime:number = Math.max(Math.floor(curRoundInfo.end_time - PlayerData.GetServerTime()), 0);
            if(residueTime <= 0 && PlayerData.fishTradeData.session_info.start_time > PlayerData.GetServerTime()){
                this.updateRoundState(true);
            }
            this.updateRoundTime(dt);
        }
    }
    private tempTime:number = 0;
    private updateRoundTime(dt:number):void{
        this.roundEffect.node.active = false;
        let curRoundInfo:SFishingTradeRoundInfo = PlayerData.CurFishTradeRoundInfo;
        if(!curRoundInfo) return;
        let residueTime:number;
        let selectLakeTime:number = curRoundInfo.start_time + CfgMgr.GetFishTradeCommon.DepartureTime;
        residueTime = Math.max(Math.floor(selectLakeTime - PlayerData.GetServerTime()), 0);
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
        this.roundProBar.progress = residueTime / CfgMgr.GetFishTradeCommon.DepartureTime;
        residueTime = Math.max(Math.floor(curRoundInfo.end_time - PlayerData.GetServerTime()), 0);
        this.roundCdTimeLab.string = "等待下回合 倒计时" + residueTime;
    }
    public flush(...args: any[]): void {
        let is_first = LocalStorage.GetBool("firsr_fish_trade" + PlayerData.roleInfo.player_id);
        if(!is_first){
            this.onHelpBtn2();
            LocalStorage.SetBool("firsr_fish_trade" + PlayerData.roleInfo.player_id, true);
        }
        this.oldShipPutNum = js.createMap();
        this.downBtnArrow.angle = -90;
        this.curItemIndex = this.itemNumList.length - 1;
        this.curRoundState = null;
        this.curSelectShipId = -1;
        this.curSelectFinsList = [];
        this.isInit = true;
        this.initSendData();
        this.onFishSelect();
        this.updateItemSelect();
        this.onItemUpdate();
    }
    
    protected onShow(): void {
        AdaptBgTop(this.node.getChildByPath("topCont/topBg"));
        game.on(Game.EVENT_SHOW, this.onShowGame, this);
        EventMgr.emit(Evt_Hide_Scene, js.getClassName(this));
        EventMgr.on(Evt_FishTradeSelect, this.onFishSelect, this);
        EventMgr.on(Evt_FishTradeDataUpdate, this.onFishTradeDataUpdate, this);
        EventMgr.on(Evt_Item_Change, this.onItemUpdate, this);
        EventMgr.on(Evt_FishItemUpdate, this.onFishItemUpdate, this);
        PlayerData.SetOneOffRedPoint(OneOffRedPointId.OffRedPoint_FishTradeOpen);
        EventMgr.emit(Evt_Change_Scene_Bgm, SceneBgmId.SceneBgm_8);   
    }

    protected onHide(...args: any[]): void {
        game.off(Game.EVENT_SHOW, this.onShowGame, this);
        EventMgr.off(Evt_FishTradeSelect, this.onFishSelect, this);
        EventMgr.off(Evt_FishTradeDataUpdate, this.onFishTradeDataUpdate, this);
        EventMgr.off(Evt_Item_Change, this.onItemUpdate, this);
        EventMgr.off(Evt_FishItemUpdate, this.onFishItemUpdate, this);
        EventMgr.emit(Evt_Change_Scene_Bgm);
        EventMgr.emit(Evt_Show_Scene, js.getClassByName(this));
        
    }
    
    private onShowGame():void{
        this.isInit = true;
        this.initSendData();
    }
    private onFishTradeDataUpdate(fish_item_id_list:number[]):void{
        
        if(!this.node.activeInHierarchy) return;
        if(fish_item_id_list && fish_item_id_list.length > 0){
            this.onFishSelect([]);
        }
        let newRoundId:number = 0;
        let newWeightVal:number = 0;
        if(PlayerData.fishTradeData && PlayerData.fishTradeData.player){
            newWeightVal = PlayerData.fishTradeData.player.round_cost;
            newRoundId = PlayerData.fishTradeData.round;
        } ;
        if(newWeightVal > 0){
            let addVal = newWeightVal - this.curWeightVal;
            if(addVal) this.creatHamal(PlayerData.fishTradeData.player.ship_id);
        }
        this.curWeightVal = newWeightVal;
        if(newRoundId != this.curRoundId){
            this.oldShipPutNum = js.createMap();
        }
        this.updateRoundState(newRoundId != this.curRoundId, this.isInit);
        this.curSelectShipId = -1;
        if(PlayerData.fishTradeData && PlayerData.fishTradeData.player){
            if(this.curRoundState == FishTradeRoundState.Select) this.curSelectShipId = PlayerData.fishTradeData.player.ship_id;
            this.vitLab.string = Math.floor(PlayerData.fishTradeData.player.fatigue).toString();
            newRoundId = PlayerData.fishTradeData.round;
            this.totalFishNumLab.string = formatNumber(PlayerData.fishTradeData.player.round_cost, 2);
            if(PlayerData.fishTradeData.ship){
                for (let index = 0; index < PlayerData.fishTradeData.ship.length; index++) {
                    let shipData = PlayerData.fishTradeData.ship[index];
                    let oldNum:number = this.oldShipPutNum[shipData.ship_id] || 0;
                    if(shipData.cost > oldNum){
                        if(PlayerData.fishTradeData.player.ship_id != shipData.ship_id) this.creatHamal(shipData.ship_id);
                    }
                    this.oldShipPutNum[shipData.ship_id] = shipData.cost;
                }
            }
        }else{
            this.vitLab.string = "0";
            this.totalFishNumLab.string = "0";
        }
        this.updateBalloonSelect();
        this.onFishSelect(this.curSelectFinsList);
        
        this.isInit = false;
        this.curRoundId = newRoundId;
    }
    private onItemUpdate():void{
        let fishItemNum:number = PlayerData.GetItemCount(CfgMgr.GetFishTradeCommon.CostItemID);
        this.fishItemLab.string = fishItemNum.toString();
        let yuPiaoNum:number = PlayerData.GetItemCount(CfgMgr.GetFishTradeCommon.ScoreItemId);
        this.fishTicketLab.string = Math.floor(yuPiaoNum).toString();
    }
    private onFishItemUpdate():void{
        this.onFishSelect(this.curSelectFinsList);
    }
    private onBalloonSelect(shipId:number):void{
        let curRoundInfo:SFishingTradeRoundInfo = PlayerData.CurFishTradeRoundInfo;
        if(!curRoundInfo || curRoundInfo.end_time < PlayerData.GetServerTime()){
            MsgPanel.Show("活动未开启");
            return;
        } 
        if(curRoundInfo.is_departure){
            if(PlayerData.fishTradeData.player.round_cost < 1){
                MsgPanel.Show("未参与本轮冒险，请下个回合再来");
                return    
            }
            MsgPanel.Show("气球飞走了不可操作");
            return;
        }
        Session.Send({type: MsgTypeSend.FishingTradeSelectShip, data:{ship_id: shipId}});
    }
    private updateBalloonSelect():void{
        let balloonItem:FishTradeBalloonItem;
        let std:StdFishTradeShip;
        let isSelect:boolean;
        let selectIndex:number = -1;
        for (let index = 0; index < this.balloonList.length; index++) {
            balloonItem = this.balloonList[index];
            std = this.stdFishTradeShip[index];
            if(std.ShipId == this.curSelectShipId){
                isSelect = true;
                selectIndex = index;
            }else{
                isSelect = false;
            }
            balloonItem.SetData(std, isSelect);
        }
        if(selectIndex > -1){
            this.btnIcon.node.active = true;
            let iconUrl = path.join("sheets/fishTrade", `0${selectIndex + 1}`, "spriteFrame");
            ResMgr.LoadResAbSub(iconUrl, SpriteFrame, res => {
                this.btnIcon.spriteFrame = res;
            });
        }else{
            this.btnIcon.node.active = false;
        }
    }
    private balloonFly():void{
        let balloonItem:FishTradeBalloonItem;
        for (let index = 0; index < this.balloonList.length; index++) {
            balloonItem = this.balloonList[index];
            balloonItem.PlayEfect(true);
        }
        
    }
    private initSendData():void{
        this.curRoundState = null;
        this.curRoundId = 0;
        Session.Send({type: MsgTypeSend.FishingTradeJoin, data:{}});
        Session.Send({type: MsgTypeSend.FishingTradeGetData, data:{}});
        
    }
    private onFishSelect(selectList:number[] = []):void{
       
        let weight:number = 0;
        let fishItem:SFishingItem;
        let newItemIdList:number[] = [];
        for (let index = 0; index < selectList.length; index++) {
            fishItem = PlayerData.GetFishItem(selectList[index]);
            if(fishItem){
                newItemIdList.push(fishItem.id);
                weight = weight.add(fishItem.weight);
            }
        }
        this.curSelectFinsList = newItemIdList;
        this.fishBtnLab.string = formatNumber(weight, 2);
    }
    private onBtnClick(btn:Button):void{
        switch(btn){
            case this.rankBtn:
                FishTradeCastRankPanel.Show();
                break;
            case this.addBtn:
                FishTradeItemBuyPanel.Show();
                break;
            case this.shopBtn:
                FishingShopPanel.Show();
                break;
            case this.logBtn:
                FishTradeLogPanel.Show();
                break;
            case this.gbaBtn:
                FishTradeTipsPanel.Show();
                break;
            case this.fishBtn:
                FishTradeFishSelectPanel.Show(this.curSelectFinsList);
                break;
            case this.downBtn:
                this.downBtnArrow.angle = -180;
                this.onShowMenu();
                break;
            case this.btn:
                if(this.curRoundState == FishTradeRoundState.Select){
                    if(PlayerData.CurFishTradeRoundInfo && PlayerData.CurFishTradeRoundInfo.is_departure){
                        MsgPanel.Show("冒险已开始不可操作");
                        return;
                    }
                    if(PlayerData.fishItems && PlayerData.fishItems.length >= CfgMgr.GetFishCommon.FishItemBagMax){
                        MsgPanel.Show(`钓鱼背包已满，清理后再参加`);
                        return;
                    }
                    let num:number = this.itemNumList[this.curItemIndex];
                    if(num == 0 && this.curSelectFinsList.length == 0){
                        MsgPanel.Show(`冒险失败请先选择鱼或者渔获道具`);
                        return;
                    }
                    if(num > 0){
                        let havNum:number = PlayerData.GetItemCount(CfgMgr.GetFishTradeCommon.CostItemID);
                        if(havNum < num){
                            //FishingFeedBuyPanel.Show();
                            let stdItem:StdItem = CfgMgr.Getitem(CfgMgr.GetFishTradeCommon.CostItemID);
                            MsgPanel.Show(`冒险失败${stdItem.ItemName}不足${num}个`);
                            return;
                        }
                    }
                    Session.Send({type: MsgTypeSend.FishingTradeLoadFish, data:{fish_item_id_list:this.curSelectFinsList, cost_item_count:num}});
                    return;
                }else if(this.curRoundState == FishTradeRoundState.NoSelect){
                    MsgPanel.Show("请先选择冒险气球");
                    return;
                }else if(this.curRoundState == FishTradeRoundState.Departure){
                    MsgPanel.Show("冒险已开始，请等待下个回合");
                    return;
                }else if(this.curRoundState == FishTradeRoundState.NoFishTrade){
                    MsgPanel.Show("冒险已开始，请等待下个回合");
                    return;
                }else if(this.curRoundState == FishTradeRoundState.No){
                    MsgPanel.Show("活动未开始");
                    return;
                }
                break;
        }
    }
    private creatHamal(shipId:number):void{
        let index:number = CfgMgr.GetFishTradeShipIndex(shipId);
        if(index < 0) return;
        let posList:Vec3[] = this.hamalPath[index];
        let leftScaleX:number = index == 0 ? 1 : -1;
        let tempRole:Node = GameSet.GetServerMark() == "hc" ? this.tempHamalRoleHc : this.tempHamalRole;
        let hamalNode: Node = this.pool.size() > 0 ? this.pool.get():instantiate(tempRole);
        this.hamalCont.addChild(hamalNode);
        hamalNode.active = true;
        hamalNode.scale = new Vec3(-0.15, 0.15, 1);
        hamalNode.position = posList[0];
        tween(hamalNode)
        .to(1, { position: posList[1]})
        .to(0.8, { position: posList[2]})
        .set({scale:new Vec3(leftScaleX * 0.15, 0.15, 1)})
        .to(0.6, { position: posList[3]})
        .union()
        .call(()=>{
            this.pool.put(hamalNode);
        })
        .start();
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
                itemDataList.push(ItemUtil.CreateThing(ThingType.ThingTypeItem, CfgMgr.GetFishTradeCommon.CostItemID, itemNum));
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
        let itemData:SThing = ItemUtil.CreateThing(ThingType.ThingTypeItem, CfgMgr.GetFishTradeCommon.CostItemID, num);
        this.downBtnItem.SetData(itemData);
    }
    private updateRoundState(isNewRound:boolean = false, isInit:boolean = false):void{
        let state:FishTradeRoundState = PlayerData.GetFishTradeRoundState;
        if(!isNewRound && this.curRoundState == state) return;
        this.unschedule(this.showResult);
        let oldState:number = this.curRoundState;
        let isStart:boolean = oldState == FishTradeRoundState.No && state != FishTradeRoundState.No;
        this.curRoundState = state;
        this.totalFishNumCont.active = false;
        this.roundCont.active = true;
        this.roundCdCont.active = true;
        this.operateBtnCont.active = true;
        this.latestCont.onShow(isNewRound || isInit);
        this.noOpenCont.active = false;
        this.noOpenLab.node.active = false;
        switch(this.curRoundState){
            case FishTradeRoundState.Select:
                this.roundCdCont.active = false;
                console.log("回合状态---->已选择气球")
                this.runCont.onHide();
                this.resultCont.onHide();
                break;
            case FishTradeRoundState.Departure:
                console.log("回合状态---->运鱼气球起飞")
                this.roundCdCont.active = false;
                this.resultCont.onHide();
                this.runCont.onHide();
                if(isInit){
                    
                }else{
                    let thisObj = this;
                    this.scheduleOnce(()=>{
                        AudioMgr.playSound(FishTradeSoundInfo[FishTradeSoundId.Fish_Trade_1], false);
                        console.log(`播放运鱼飞船飞音效---->` + FishTradeSoundInfo[FishTradeSoundId.Fish_Trade_1]);
                        thisObj.balloonFly();
                    }, 0.1)
                    
                }
                
                break;
            case FishTradeRoundState.Settle:
                console.log("回合状态---->运鱼结算")
                if(isInit){
                    this.runCont.onHide();
                    this.resultCont.onShow();
                }else{
                    let shipList:SFishingTradeShipData[] = PlayerData.fishTradeData.ship;
                    let shipData:SFishingTradeShipData;
                    let killIdMap:{[key:string]:{id:number, isShowCloud:boolean, isKill:boolean}} = {};
                    let isShowCloud:boolean;
                    for (let index = 0; index < shipList.length; index++) {
                        shipData = shipList[index];
                        isShowCloud = shipData.is_kill ? shipData.is_kill : Boolean(randomI(0, 1));
                        killIdMap[shipData.ship_id] = {id:shipData.ship_id, isShowCloud:isShowCloud , isKill:shipData.is_kill};
                    }
                    this.runCont.SetData(killIdMap);
                    this.runCont.onShow();
                    this.scheduleOnce(this.showResult, 12);
                    
                }
                break;
            case FishTradeRoundState.NoSelect:
                this.roundCdCont.active = false;
                console.log("回合状态---->未选择气球")
                this.runCont.onHide();
                this.resultCont.onHide();
                break;
            case FishTradeRoundState.NoFishTrade:
                console.log("回合状态---->未参加与运鱼")
                this.runCont.onHide();
                this.resultCont.onHide();
                break;
            default:
                console.log("回合状态---->未开始")
                this.runCont.onHide();
                this.resultCont.onHide();
                this.latestCont.onHide();
                this.totalFishNumCont.active = false;
                this.roundCont.active = false;
                this.roundCdCont.active = false;
                this.operateBtnCont.active = false;
                this.noOpenCont.active = true;
                this.noOpenLab.node.active = true;
                break;
        }
        
    }

    private showResult():void{
        this.runCont.onHide();
        this.resultCont.onShow();
    }

    private onHelpBtn2() {
        Tips3.Show(4);
    }
}