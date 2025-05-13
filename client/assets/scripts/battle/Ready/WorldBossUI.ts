import { Node, Button, Label, path, sp, Sprite, SpriteFrame, instantiate } from "cc";
import { Panel } from "../../GameRoot";
import { WorldBossHp } from "../../module/worldBoss/WorldBossHp";
import { EventMgr, Evt_Hide_Home_Ui, Evt_Show_Home_Ui, Evt_WorldBossBattleStart, Evt_WorldBossRankUpdate, Evt_WorldBossStateUpdate, Goto } from "../../manager/EventMgr";
import PlayerData from "../../module/roleModule/PlayerData";
import { BattleLogic } from "../BattleLogic";
import { BattleReadyLogic } from "./BattleReadyLogic";
import { SPlayerDataSkill, SWorldBossBattleResult, SWorldBossData, SWorldBossRankData } from "../../module/roleModule/PlayerStruct";
import { HomeLogic } from "../../module/home/HomeLogic";
import { folder_sound, ResMgr } from "../../manager/ResMgr";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import { AdaptBgTop } from "../../module/common/BaseUI";
import { AudioGroup, AudioMgr } from "../../manager/AudioMgr";
import { Runtime } from "../BattleLogic/Runtime";
import { WorldBossBattleResult } from "./WorldBossBattleResult";
import { DateUtils } from "../../utils/DateUtils";
import { CfgMgr } from "../../manager/CfgMgr";
import { BattleSkillItem } from "./BattleSkillItem";
import { WorldBossInfoPanel } from "../../module/worldBoss/WorldBossInfoPanel";
import { TodayNoTips } from "../../module/common/TodayNoTips";
import { BattleReportPanel } from "./BattleReportPanel";
import { SpriteLabel } from "../../utils/SpriteLabel";

export class WorldBossUI extends Panel {
    protected prefab: string = 'prefabs/battle/WorldBossUI';
    private bossIcon:Sprite;
    private iconBtn:Button;
    private bossName:Label;
    private bossHp:WorldBossHp;
    private hurtCont:Node;
    private totleHurtLab:SpriteLabel;
    private autoEffect:Node;
    private timeLab:Label;
    private exitBtn:Button;
    private startCont:Node;
    private resultCont:WorldBossBattleResult;
    private startEffect:sp.Skeleton;
    private skillCont:Node;
    private tempSkillItem:Node;
    private worldBossData:SWorldBossData;
    private gameSpeed: number = 1;
    private isCanSendGetRank:boolean = false;
    private battleID:number;
    private roundTime:number;
    private battleIsWin:boolean = false;
    private closeIsToHome:boolean = false;
    private resultData:SWorldBossBattleResult;
    private _resultReport:any;
    private myOldAttackHurt:number;//上局伤害记录
    protected async onLoad() {
        this.SetLink(undefined);
        AdaptBgTop(this.node);
        AdaptBgTop(this.find("topCont/topBg"));
        AdaptBgTop(this.find("startCont/mask"));

        this.iconBtn = this.find("topCont/iconBg2", Button);
        this.bossIcon = this.find("topCont/iconBg2/bossIcon", Sprite);
        this.bossName = this.find("topCont/bossName", Label);
        this.timeLab = this.find("topCont/timeLab", Label);
        this.bossHp = this.find("topCont/bossHp").addComponent(WorldBossHp);
        this.hurtCont = this.find("topCont/hurtCont");
        this.totleHurtLab = this.find("topCont/hurtCont/totleHurtLab").addComponent(SpriteLabel);
        this.totleHurtLab.font = "sheets/common/number/font2";
        this.autoEffect = this.find("topCont/autoEffect");

        this.exitBtn = this.find("bottomCont/leftBtnCont/exitBtn", Button);
        this.skillCont = this.find("bottomCont/skillList/view/content");
        this.tempSkillItem = this.find("tempSkillItem");

        this.startCont = this.find("startCont");
        this.startEffect = this.find("startCont/effect", sp.Skeleton);
        this.startCont.active = false;
        this.resultCont = this.find("resultCont").addComponent(WorldBossBattleResult);
        this.resultCont.ResultCloseCb = this.onResultClose.bind(this);
        this.resultCont.onHide();

        this.exitBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.iconBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
    }
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
        if(this.roundTime){
            let time:number = Math.max(this.roundTime - Math.floor(PlayerData.GetServerTime()), 0);
            this.timeLab.string = DateUtils.FormatTime(time, "%{m}:%{s}");
        }
    }

    public flush(...args: any[]): void {
        this.roundTime = null;
        this.resultData = null;
        this.battleIsWin = false;
        this.closeIsToHome = false;
        this.myOldAttackHurt = 0;
        this.hurtCont.active = false;
        this.timeLab.string = DateUtils.FormatTime(CfgMgr.GetWorldBossComm.RoundTime, "%{m}:%{s}");
        this.updateBossShow();
        this.onWorldBossRankUpdate();
        this.autoEffect.active = false;
        this.startCont.active = false;
        this.resultCont.onHide();
    }

    protected async onShow(...args: any) {
        EventMgr.emit(Evt_Hide_Home_Ui);
        EventMgr.on(Evt_WorldBossStateUpdate, this.onWorldBossStateUpdate, this);
        EventMgr.on(Evt_WorldBossRankUpdate, this.onWorldBossRankUpdate, this);
        EventMgr.on(Evt_WorldBossBattleStart, this.onBattleStart, this);
        
        Goto("BattleArrayPanel", PlayerData.fightState, PlayerData.worldBossAttackRoles, 5,true);
    }

    protected onHide(...args: any[]): void {
        EventMgr.off(Evt_WorldBossStateUpdate, this.onWorldBossStateUpdate, this);
        EventMgr.off(Evt_WorldBossRankUpdate, this.onWorldBossRankUpdate, this);
        EventMgr.off(Evt_WorldBossBattleStart, this.onBattleStart, this);
        BattleLogic.ins?.end();
        BattleReadyLogic.ins.isInBattle = false;
        HomeLogic.ins.ExitWorldBossScene();
        EventMgr.emit(Evt_Show_Home_Ui);
        WorldBossInfoPanel.Hide();
        if(!this.closeIsToHome){
            let worldBossData:SWorldBossData = PlayerData.worldBossData;
            if(worldBossData){
                if(PlayerData.GetWorldIsCanChallenge()){
                    Goto("WorldBossPanel");
                }else{
                    Goto("WorldBossHurtRankPanel");
                }
            }
        } 
        //Runtime.battleModule.onBattleOver = null;
    }

    private onBtnClick(btn:Button):void{
        switch(btn){
            case this.iconBtn:
                WorldBossInfoPanel.Show(this.worldBossData);
                break;
            case this.exitBtn:
                TodayNoTips.Show("确定退出挑战？", (cbType:number)=>{
                    if(cbType == 1){
                        this.Hide();
                    }
                });
                break;
        }
    }
    private onResultClose(type:number):void{
        switch(type){
            case 1://返回家园
                this.closeIsToHome = true;
                this.Hide();
                
                break;
            case 2://继续战斗
                this.Hide();
                break;
            case 3://查看战报
                if(!this._resultReport) this._resultReport = Runtime.collector.settlement();
                            
                BattleReportPanel.Show({ resultReport: this._resultReport, battleID: this.battleID});
                break;
        }
    }
    
    private onBattleStart(data:any):void{
        this.resultData = data.plunder_data.push;
        this.myOldAttackHurt = data.plunder_data.harm || 0;
        data.isReplay = true;
        data.battle_type = "plunder"
        data.homeland_id = data.plunder_data.defender_battle_data.homeland_id;
        this.battleID = data.plunder_data.battle_id;
        this.roundTime = PlayerData.GetServerTime() + CfgMgr.GetWorldBossComm.RoundTime;
        let attackerData = data.plunder_data.attacker_battle_data;
        let roles = attackerData.roles;
        if (roles == undefined || roles == null || roles.length == 0) {
            console.error('attackRoles is null');
            return;
        }
        if(!BattleLogic.ins) new BattleLogic();
        BattleLogic.ins.BattleStartPushData = data;
        BattleLogic.ins.init();
        this.initSkillData(roles);
        this.playStartAni();
    }
    private initSkillData(attackRoles:any[]):void{
        let skillNode:Node;
        let skillCom:BattleSkillItem;
        let roleData:any; 
        let len:number = attackRoles.length;
        let maxLen = Math.max(len, this.skillCont.children.length);
        for (let index = 0; index < maxLen; index++) {
            skillNode = this.skillCont.children[index];
            if(!skillNode) {
                skillNode = instantiate(this.tempSkillItem);
                this.skillCont.addChild(skillNode);
            }
            skillCom = skillNode.getComponent(BattleSkillItem) || skillNode.addComponent(BattleSkillItem);
            roleData = index < attackRoles.length ? attackRoles[index] : null;
            skillNode.active = roleData != null;
            skillCom.SetData(roleData, index);
        }
    }
    private playStartAni():void {
        this.startCont.active = true;
        this.startEffect.clearAnimation();
        this.startEffect.setAnimation(0, "animation", false);
        let thisObj = this;
        this.startEffect.setCompleteListener(() => {
            setTimeout(() => {
                thisObj.hurtCont.active = true;
                thisObj.updateHurt();
                thisObj.startCont.active = false;
                //thisObj.autoEffect.active = true;
                BattleLogic.ins.start();
                thisObj.gameSpeed = 1;
                thisObj.SetGameSpeed(thisObj.gameSpeed);
            }, 0.5)
        })
        this.PlaySound("battle_start");
        Runtime.battleModule.onBattleOver = (result)=>{
            thisObj.battleIsWin = result;
            thisObj.showSettle();
        };
    }

    private PlaySound(url) {
        AudioMgr.PlayOnce({
            url: `${folder_sound}${url}`,
            num: 1,
            group: AudioGroup.Sound
        });
    }
    
    private SetGameSpeed(speed: number){
        speed = speed < 0 ? 0 : speed;
        Runtime.game?.["SetGameSpeed"](speed);
        if(speed != 0)
            this.gameSpeed = speed;
    }
    private sendGetRankData():void{
        if(!PlayerData.worldBossData){
            return;
        }
        if(PlayerData.GetWorldIsCanChallenge()){
            let oldRankData:SWorldBossRankData = PlayerData.worldBossRankData;
            Session.Send({ type: MsgTypeSend.GetBossFightRank, data: {type:1, cnt:3, t: oldRankData ? oldRankData.t : 0} });
        }
    }
    
    private onWorldBossStateUpdate():void{
        this.updateBossShow();
    }
    private onWorldBossRankUpdate():void{
        this.isCanSendGetRank = true;
        this.updateHurt();
    }
    private updateHurt():void{
        let rankData:SWorldBossRankData = PlayerData.worldBossRankData;
        let newHurt:number = rankData ? rankData.harm : 0;
        let totalHurt:number = Math.max(newHurt - this.myOldAttackHurt, 0);
        this.totleHurtLab.string = totalHurt.toString();
    }
    private updateBossShow():void{
        this.worldBossData = PlayerData.worldBossData;
        if(!this.worldBossData){
            //this.Hide();
            return;
        }
        
        this.bossName.string = this.worldBossData.name;
        ResMgr.LoadResAbSub(path.join("sheets/worldBoss", this.worldBossData.icon, "spriteFrame"), SpriteFrame, res => {
            if(this.bossIcon.spriteFrame != res){
                this.bossIcon.spriteFrame = res;
            }
        });

        this.bossHp.SetData(this.worldBossData.HP, this.worldBossData.max_Hp, 10);
    }
    private showSettle():void{
        if(!this.resultData){
            this.resultData = {
                harm:0,
                RewardType:[],
                RewardItemID:[],
                RewardNumber:[],
            }
        }
        this.resultCont.onShow(this.resultData);
        if(this.battleIsWin){
            this.PlaySound("battle_win");
        }else{
            this.PlaySound("battle_lose");
        }
    }

}