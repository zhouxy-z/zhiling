import { Node, Button, Label, Sprite, game, js, Game, v3, Vec3, UITransform, path, sp, SpriteFrame } from "cc";
import { Panel } from "../../GameRoot";
import { WorldBossTopThreeItem } from "./WorldBossTopThreeItem";
import { EventMgr, Evt_Change_Scene_Bgm, Evt_Hide_Home_Ui, Evt_Hide_Scene, Evt_Show_Scene, Evt_WorldBossChallengeNumUpdate, Evt_WorldBossRankUpdate, Evt_WorldBossStateUpdate, Goto } from "../../manager/EventMgr";
import { WorldBossHp } from "./WorldBossHp";
import { WorldBossAwardBoxTipsCont } from "./WorldBossAwardBoxTipsCont";
import { ClickTipsPanel } from "../common/ClickTipsPanel";
import { WorldBossNumBuyPanel } from "./WorldBossNumBuyPanel";
import PlayerData from "../roleModule/PlayerData";
import { FightState, SWorldBossData, SWorldBossRankData, SWorldBossRankItemData, SWorldBossStateData, Tips2ID } from "../roleModule/PlayerStruct";
import { ResMgr } from "../../manager/ResMgr";
import { MsgTypeSend } from "../../MsgType";
import { Session } from "../../net/Session";
import { DateUtils } from "../../utils/DateUtils";
import { BattleReadyLogic } from "../../battle/Ready/BattleReadyLogic";
import { WorldBossInfoPanel } from "./WorldBossInfoPanel";
import { MsgPanel } from "../common/MsgPanel";
import { WorldBossHurtLogPanel } from "./WorldBossHurtLogPanel";
import { AloneShopPanel } from "../aloneShop/AloneShopPanel";
import { CfgMgr, ShopGroupId } from "../../manager/CfgMgr";
import { SceneBgmId } from "../../manager/AudioMgr";
import { Tips2 } from "../home/panel/Tips2";
import { SpriteLabel } from "../../utils/SpriteLabel";
import { WorldBossRankPanel } from "./WorldBossRankPanel";
import { WorldBossRankAwardPanel } from "./WorldBossRankAwardPanel";
export class WorldBossPanel extends Panel {
    protected prefab: string = "prefabs/panel/worldBoss/WorldBossPanel";
    private bossIcon:Sprite;
    private iconBtn:Button;
    private bossName:Label;
    private bossHp:WorldBossHp;
    private timeTitleLab:Label;
    private timeLab:Label;
    private myRankLab:SpriteLabel;
    private noRankImg:Node;
    private myHurtLab: SpriteLabel;
    private hurtLogBtn:Button;
    private bossModel:sp.Skeleton;
    private top3Cont:Node;
    private top3Item: WorldBossTopThreeItem[] = [];
    private awardBtn:Button;
    private shopBtn:Button;
    private gbaBtn:Button;
    private rankAwardBtn:Button;
    private rankBtn:Button;
    private challengeBtn:Button;
    private addBtn:Button;
    private challengeNumLab:Label;
    private awardTips:WorldBossAwardBoxTipsCont;
    private worldBossData:SWorldBossData;
    protected onLoad(): void {
        this.iconBtn = this.find("topCont/iconBg2", Button);
        this.bossIcon = this.find("topCont/iconBg2/bossIcon", Sprite);
        this.bossName = this.find("topCont/bossName", Label);
        this.bossHp = this.find("topCont/bossHp").addComponent(WorldBossHp);
        this.timeTitleLab = this.find("topCont/timeTitleLab", Label);
        this.timeLab = this.find("topCont/timeLab", Label);
        this.myRankLab = this.find("topCont/rankTitleCont/myRankLab").addComponent(SpriteLabel);
        this.myRankLab.font = "sheets/common/number/font2";
        this.noRankImg = this.find("topCont/rankTitleCont/noRankImg");
        this.myHurtLab = this.find("topCont/hurtTitleCont/myHurtLab").addComponent(SpriteLabel);
        this.myHurtLab.font = "sheets/common/number/font2";
        this.hurtLogBtn = this.find("topCont/hurtTitleCont/hurtLogBtn", Button);
        this.bossModel = this.find("bossModel", sp.Skeleton);
        this.top3Cont = this.find("bottomCont/top3Cont");
        let rankNode:Node;
        let rankCom:WorldBossTopThreeItem;
        for (let index = 0; index < this.top3Cont.children.length; index++) {
            rankNode = this.top3Cont.children[index];
            rankCom = rankNode.addComponent(WorldBossTopThreeItem);
            this.top3Item.push(rankCom);
        }
        this.awardBtn = this.find("bottomCont/awardBtn", Button);
        this.shopBtn = this.find("bottomCont/btnCont/shopBtn", Button);
        this.gbaBtn = this.find("bottomCont/btnCont/gbaBtn", Button);
        this.rankAwardBtn = this.find("bottomCont/btnCont/rankAwardBtn", Button);
        this.rankBtn = this.find("bottomCont/btnCont/rankBtn", Button);
        this.challengeBtn = this.find("bottomCont/challengeBtn", Button);
        this.addBtn = this.find("bottomCont/addBtn", Button);
        this.challengeNumLab = this.find("bottomCont/challengeNumLab", Label);
        this.awardTips = this.find("awardTipsCont").addComponent(WorldBossAwardBoxTipsCont);
        this.CloseBy("topCont/backBtn");
        this.awardBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.shopBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.gbaBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.rankAwardBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.rankBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.challengeBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.addBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.iconBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.hurtLogBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.awardTips.node.active = false;
    }
    private isCanSendGetRank:boolean = false;
    private senRankTime:number = 5;
    protected update(dt: number): void {
        if(this.isCanSendGetRank){
            if(this.senRankTime <= 0){
                this.sendGetRankData();
                this.senRankTime = 5;
            }else{
                this.senRankTime -= dt;
            }
            
        }
        if(this.worldBossData){
            let residueTime:number;
            if(PlayerData.GetServerTime() > this.worldBossData.start){
                residueTime = Math.max(Math.floor(this.worldBossData.end - PlayerData.GetServerTime()), 0);
                this.timeTitleLab.string = "结束时间：";
                this.timeLab.string = DateUtils.FormatTime(residueTime, "%{h}时%{m}分%{s}秒");
            }else{
                residueTime = Math.max(Math.floor(this.worldBossData.start - PlayerData.GetServerTime()), 0);
                this.timeTitleLab.string = "刷新时间：";
                this.timeLab.string = DateUtils.FormatTime(residueTime, "%{m}分%{s}秒");
            } 
            
        }
    }

    public flush(): void{
        
    }
    
    protected onShow(): void {
        this.isCanSendGetRank = false;
        this.senRankTime = 5;
        this.updateBossShow();
        this.sendGetRankData(true);
        this.onNumUpdate();
        EventMgr.emit(Evt_Change_Scene_Bgm, SceneBgmId.SceneBgm_12);   
        EventMgr.emit(Evt_Hide_Scene, js.getClassName(this));
        EventMgr.on(Evt_WorldBossChallengeNumUpdate, this.onNumUpdate, this);
        EventMgr.on(Evt_WorldBossStateUpdate, this.onWorldBossStateUpdate, this);
        EventMgr.on(Evt_WorldBossRankUpdate, this.onWorldBossRankUpdate, this);
    }
    protected onHide(...args: any[]): void {
        EventMgr.emit(Evt_Change_Scene_Bgm);
        EventMgr.emit(Evt_Show_Scene, js.getClassByName(this));
        EventMgr.off(Evt_WorldBossChallengeNumUpdate, this.onNumUpdate, this);
        EventMgr.off(Evt_WorldBossStateUpdate, this.onWorldBossStateUpdate, this);
        EventMgr.off(Evt_WorldBossRankUpdate, this.onWorldBossRankUpdate, this);
    }
    private onWorldBossRankUpdate():void{
        this.isCanSendGetRank = true;
        let rankData:SWorldBossRankData = PlayerData.worldBossRankData;
        let totalHurt:number = 0;
        let myHurt:number = 0;
        let myRank:number = 0;
        let top3List:SWorldBossRankItemData[] = [
            {
                id:null,
                name:"虚位以待",
                harm:0,
            },
            {
                id:null,
                name:"虚位以待",
                harm:0,
            },
            {
                id:null,
                name:"虚位以待",
                harm:0,
            },
        ];
        if(rankData){
            totalHurt = rankData.boss_harm;
            myHurt = rankData.harm;
            myRank = rankData.rank;
            if(rankData.rank_data_list){
                for (let index = 0; index < top3List.length; index++) {
                    if(index <= rankData.rank_data_list.length - 1){
                        top3List[index] = rankData.rank_data_list[index];
                    }
                    
                }
            }
        }
        for (let index = 0; index < this.top3Item.length; index++) {
            let rankItem = this.top3Item[index];
            rankItem.SetData(top3List[index]);
        }
        this.myHurtLab.string = myHurt.toString();
        if(myRank > 0){
            this.noRankImg.active = false;
            this.myRankLab.node.active = true;
            this.myRankLab.string = myRank.toString();
        }else{
            this.noRankImg.active = true;
            this.myRankLab.node.active = false;
        }
        
    }
    private onWorldBossStateUpdate():void{
        this.updateBossShow();
    }
    private onNumUpdate():void{
        let free:number = CfgMgr.GetWorldBossComm.FreeCount - PlayerData.roleInfo.boss_data.free;
        let num:number = PlayerData.roleInfo.boss_data.times + free;
        this.challengeNumLab.string = num.toString();
    }
    
    private onBtnClick(btn:Button):void{
        switch (btn) {
            case this.iconBtn:
                WorldBossInfoPanel.Show(this.worldBossData);
                break;
            case this.awardBtn:
                let rankData:SWorldBossRankData = PlayerData.worldBossRankData;
                this.awardTips.SetData(rankData ? rankData.harm : 0);
                let targetPos:Vec3 = this.awardBtn.node.worldPosition.clone();
                let tipsTrans:UITransform = this.awardTips.getComponent(UITransform);
                let showPos = v3(targetPos.x - 20, targetPos.y + tipsTrans.height / 2 + 80, 0);
                ClickTipsPanel.Show(this.awardTips.node, this.node, this.awardBtn.node, showPos, 0);
                break;
            case this.shopBtn:
                AloneShopPanel.Show(ShopGroupId.PvpShop);
                //AloneShopPanel.Show(ShopGroupId.WorldBossShop, "Boss商城");
                break;
            case this.gbaBtn:
                Tips2.Show(Tips2ID.WorldBoss);
                break;
            case this.rankAwardBtn:
                WorldBossRankAwardPanel.Show(PlayerData.worldBossRankData);
                break;
            case this.rankBtn:
                WorldBossRankPanel.Show();
                break;
            case this.challengeBtn:
                let free:number = CfgMgr.GetWorldBossComm.FreeCount - PlayerData.roleInfo.boss_data.free;
                let num:number = PlayerData.roleInfo.boss_data.times + free;
                if(num < 1){
                    WorldBossNumBuyPanel.Show();
                    return;
                }
                if(this.worldBossData.terminator != ""){
                    MsgPanel.Show("boss已被击杀");
                    return;
                }
                if(PlayerData.GetServerTime() < this.worldBossData.start){
                    MsgPanel.Show("boss挑战未开始");
                    return;
                }
                if(PlayerData.GetServerTime() >= this.worldBossData.end){
                    MsgPanel.Show("boss挑战时间已结束");
                    return;
                }
                if(this.worldBossData.HP <= 0){
                    MsgPanel.Show("boss已死亡");
                    return;
                }
                let battleData = {
                    type: FightState.WorldBoss,
                    player_id: 101,
                    homeland_id: 101,
                    monsters:[PlayerData?.worldBossData.boss_type]
                }
                EventMgr.emit(Evt_Hide_Home_Ui);
        
                if(!BattleReadyLogic.ins)
                    new BattleReadyLogic();
                BattleReadyLogic.ins.RealyBattle(battleData);
                this.Hide();
                
                break;
            case this.addBtn:
                WorldBossNumBuyPanel.Show();
                break;
            case this.hurtLogBtn:
                WorldBossHurtLogPanel.Show();
                break;
        }
    }
    private updateBossShow():void{
        this.worldBossData = PlayerData.worldBossData;
        if(!this.worldBossData){
            //this.Hide();
            return;
        }
        
        this.bossName.string = this.worldBossData.name;
        ResMgr.LoadResAbSub(path.join("spine/role", this.worldBossData.model, this.worldBossData.model), sp.SkeletonData, (res:sp.SkeletonData)=>{
            if(this.bossModel.skeletonData != res){
                this.bossModel.skeletonData = res; 
                this.bossModel.setAnimation(0, "Idle", true);
            }
        });
    
        ResMgr.LoadResAbSub(path.join("sheets/worldBoss", this.worldBossData.icon, "spriteFrame"), SpriteFrame, res => {
            if(this.bossIcon.spriteFrame != res){
                this.bossIcon.spriteFrame = res;
            }
        });

        this.bossHp.SetData(this.worldBossData.HP, this.worldBossData.max_Hp, 10);
    }
    private sendGetRankData(isInit:boolean = false):void{
        if(!PlayerData.worldBossData){
            return;
        }
        if(PlayerData.worldBossData.terminator != "" || PlayerData.GetServerTime() < PlayerData.worldBossData.end){
            let oldRankData:SWorldBossRankData = PlayerData.worldBossRankData;
            let t:number = isInit ? 0 : (oldRankData ? oldRankData.t : 0);
            Session.Send({ type: MsgTypeSend.GetBossFightRank, data: {type:1, cnt:3, t: t} });
        }
    }
}