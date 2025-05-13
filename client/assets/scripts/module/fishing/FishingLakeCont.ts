import { Node, Component, Label, path, ProgressBar, Sprite, SpriteFrame, sp, v3, tween, instantiate, Vec3, isValid, Button } from "cc";
import PlayerData, { } from "../roleModule/PlayerData"
 import {SFishingRoundInfo,SFishingSettlementData} from "../roleModule/PlayerStruct";
import { folder_icon, ResMgr } from "../../manager/ResMgr";
import { CfgMgr, FishRoundState, StdFishHero, StdLake } from "../../manager/CfgMgr";
import { FishingContBase } from "./FishingContBase";
import { EventMgr, Evt_FishDataUpdate, Evt_FishHeroUpdate} from "../../manager/EventMgr";
import { SetNodeGray } from "../common/BaseUI";
import { BeforeGameUtils } from "../../utils/BeforeGameUtils";
import { AudioMgr, FishSoundId, FishSoundInfo, SoundDefine } from "../../manager/AudioMgr";
import { FishingEquipPanel } from "../fishingEquip/FishingEquipPanel";
import { FishingRaceMainPanel } from "../fishingRaceRank/FishingRaceMainPanel";
import { randomI } from "../../utils/Utils";
import { GameSet } from "../GameSet";
import { MsgPanel } from "../common/MsgPanel";
/**鱼竿动作类型 */
enum RodAnimType {
    idle = 1,//待机
    shuaigan,//甩杆
    changeice,//冰冻湖面
    wait,//等待鱼咬钩
    wait_ice,//冰冻等待鱼咬钩
    lache,//拉杆
    lache_ice,//冰冻拉杆
    get,//鱼咬钩
    get_ice,//冰冻鱼咬钩
    win,//钓鱼成功
    win_ice,//冰冻钓鱼成功
    lost,//钓鱼失败
    lost_ice,//冰冻钓鱼失败
}

export class FishingLakeCont extends FishingContBase {
    private lakeBg:Sprite;
    private rodModel:sp.Skeleton;
    private rodUpEffect:sp.Skeleton;
    private roleModel:sp.Skeleton;
    private equipBtn:Button;
    private thEffect:sp.Skeleton;
    private feedEffect:sp.Skeleton;
    private fishFeedLab:Label;
    private proBar:ProgressBar;
    private timeTitleSLab:Label;
    private roundCont:Node;
    private typeIcon:Sprite;
    private roundEffect:sp.Skeleton;
    private roundTimeTitleLab:Label;
    private timeLab:Label;
    private roundCdCont:Node;
    private roundCdLab:Label;
    private lakeNameLab:Label;
    private currFeed:number;
    private lakeId:number;
    private curRodAnimName:string;
    private rodType:number;
    public feedCont:Node;
    private raceRankBtn:Button;
    private curRoleAnimName:string = "Lie";
    private curHeroId:number;
    //钓鱼动画信息 name：动画名称 loop是否循环播放 finishInfo动作完成后播放
    private rodAnimInfo:{[key: string]: {name:string, loop:boolean, finishCbType?:RodAnimType}} = BeforeGameUtils.toHashMapObj(
        RodAnimType.idle, {name:"idle", loop:true},
        RodAnimType.shuaigan, {name:"shuaigan", loop:false, finishCbType:RodAnimType.wait},
        RodAnimType.changeice, {name:"changeice", loop:false, finishCbType:RodAnimType.wait_ice},
        RodAnimType.wait, {name:"wait", loop:true},
        RodAnimType.wait_ice, {name:"wait_ice", loop:true},
        RodAnimType.get, {name:"get", loop:false, finishCbType:RodAnimType.lache},
        RodAnimType.get_ice, {name:"get_ice", loop:false, finishCbType:RodAnimType.lache_ice},
        RodAnimType.lache, {name:"lache", loop:false},
        RodAnimType.lache_ice, {name:"lache_ice", loop:false},
        RodAnimType.win, {name:"win", loop:false},
        RodAnimType.win_ice, {name:"win_ice", loop:false},
        RodAnimType.lost, {name:"lost", loop:false},
        RodAnimType.lost_ice, {name:"lost_ice", loop:false},
    );
    private curRodInfo:{type:number, isForce:boolean, cb:Function};
    protected onLoad(): void {
        this.lakeBg = this.node.getChildByPath("lakeBg").getComponent(Sprite);
        this.rodModel = this.node.getChildByName("rodModel").getComponent(sp.Skeleton);
        this.rodUpEffect = this.node.getChildByName("rodUpEffect").getComponent(sp.Skeleton);
        this.roleModel = this.node.getChildByName("roleModel").getComponent(sp.Skeleton);
        this.equipBtn = this.node.getChildByName("equipBtn").getComponent(Button);
        this.thEffect = this.node.getChildByName("thEffect").getComponent(sp.Skeleton);
        this.feedCont = this.node.getChildByName("fishFeedCont");
        this.feedEffect = this.node.getChildByPath("fishFeedCont/feedEffect").getComponent(sp.Skeleton);
        this.fishFeedLab = this.node.getChildByPath("fishFeedCont/fishFeedLab").getComponent(Label);
        this.roundCont = this.node.getChildByPath("roundCont");
        this.typeIcon = this.node.getChildByPath("roundCont/typeIcon").getComponent(Sprite);
        this.roundEffect = this.node.getChildByPath("roundCont/roundEffect").getComponent(sp.Skeleton);
        this.proBar = this.node.getChildByPath("roundCont/proBar").getComponent(ProgressBar);
        this.timeTitleSLab = this.node.getChildByPath("roundCont/timeTitleSLab").getComponent(Label);
        this.roundTimeTitleLab = this.node.getChildByPath("roundCont/roundTimeTitleLab").getComponent(Label);
        this.timeLab = this.node.getChildByPath("roundCont/timeLab").getComponent(Label);
        this.roundCdCont = this.node.getChildByPath("roundCdCont");
        this.roundCdLab = this.node.getChildByPath("roundCdCont/roundCdLab").getComponent(Label);
        this.lakeNameLab = this.node.getChildByPath("lakeNameCont/lakeNameLab").getComponent(Label);
        this.raceRankBtn = this.node.getChildByName("raceRankBtn").getComponent(Button);
        this.isInit = true;
        this.thEffect.node.active = false;
        this.rodUpEffect.node.active = false;
        this.roundCont.active = false;
        this.roundCdCont.active = false;
        this.curRodInfo = {type:RodAnimType.idle, isForce:false, cb:null};
        this.initShow();
        this.equipBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.raceRankBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        //非精英服不开放入口
        //this.raceRankBtn.node.active = GameSet.Server_cfg.Mark ? true : false;
        EventMgr.on(Evt_FishDataUpdate, this.onFishDataUpdate, this);
        EventMgr.on(Evt_FishHeroUpdate, this.onFishHeroUpdate, this);
    }
    private onBtnClick(btn:Button):void{
        switch(btn){
            case this.equipBtn:
                FishingEquipPanel.Show();
                break;
            case this.raceRankBtn:
                if(!PlayerData.GetFishRaceIsOpen()){
                    MsgPanel.Show("未开启钓鱼赛季");
                    return;
                }
                FishingRaceMainPanel.Show();
                break
        }
    }
    onShow(state: number): void {
        this.lakeId = 0;
        this.currFeed = 0;
        this.curRodAnimName = "";
        this.curRoleAnimName = "";
        this.rodUpEffect.node.active = false;
        this.rodType = PlayerData.FishRodType;
        super.onShow(state);
    }
    private onFishDataUpdate():void{
        if(!this.node.activeInHierarchy) return;
        
        this.updateCont();
    }
    private onFishHeroUpdate():void{
        if(!this.node.activeInHierarchy) return;
        this.updateHeroModel();
    }
    protected updateCont(): void {
        this.thEffect.node.active = false;
        this.roleModel.node.active = true;
        this.rodModel.node.active = true;
        this.updateHeroModel();
        let typeIconUrl:string = "generalTypeIcon";
        let rodModelUrl:string = "mg_dg";
        if(PlayerData.FishSessionIsHell){
            typeIconUrl = "hellTypeIcon";
            rodModelUrl = "mg_dg_hell";
        }
        typeIconUrl = path.join("sheets/fishing", typeIconUrl, "spriteFrame");
        ResMgr.LoadResAbSub(typeIconUrl, SpriteFrame, res => {
            this.typeIcon.spriteFrame = res;
        });

        let url:string = path.join("spine/effect", rodModelUrl, "mg_dg");
        ResMgr.LoadResAbSub(url, sp.SkeletonData, (res:sp.SkeletonData)=>{
            if(this.rodModel.skeletonData != res){
                this.rodModel.skeletonData = res; 
                if(this.curRodInfo){
                    this.playRodAnim(this.curRodInfo.type, true, this.curRodInfo.cb);
                }
            }
            
        });

        if(!PlayerData.fishData || !PlayerData.fishData.player) return;
        this.lakeBg.node.active = false;
        this.lakeNameLab.string = "???";
        let newFeed:number = PlayerData.fishData.player.round_cost;
        let updateRod:boolean = false;
        let newRod:number = PlayerData.FishRodType;
        if(newRod > this.rodType){
            updateRod = true;
        }
        this.rodType = newRod;
        let cast:boolean = false;//是否投杆
        if(this.currFeed != newFeed){
            cast = this.currFeed == 0 && newFeed > 0;
            this.currFeed = newFeed;
            
        }
        this.fishFeedLab.string = this.currFeed.toString();
        let newLakeId:number = PlayerData.fishData.player.lake_id;
        let newLake:boolean = false;
        if(this.lakeId != newLakeId){
            if(newLakeId > 0){
                AudioMgr.playSound(FishSoundInfo[FishSoundId.Fish_1], false);
                console.log(`播放钓鱼音效---->` + FishSoundInfo[FishSoundId.Fish_1]);
            } 
            newLake = this.lakeId == 0;
            this.lakeId = newLakeId;
        }
        
        if(this.lakeId > 0){
            let stdLake:StdLake = CfgMgr.GetStdLake(PlayerData.fishData.player.lake_id);
            this.lakeNameLab.string = stdLake.Lakesname;
            if(!this.lakeBg.spriteFrame || this.lakeBg.spriteFrame.name != stdLake.Res){
                let url = path.join(folder_icon, stdLake.Res, "spriteFrame");
                ResMgr.LoadResAbSub(url, SpriteFrame, res => {
                    this.lakeBg.node.active = true;
                    this.lakeBg.spriteFrame = res;
                });
            }else{
                this.lakeBg.node.active = true;
            }
        }
        this.roundCont.active = false;
        this.roundCdCont.active = false;
        switch(this.curRoundState){
            case FishRoundState.Select:
                SetNodeGray(this.timeTitleSLab.node, false);
                SetNodeGray(this.roundTimeTitleLab.node, false);
                this.roundCont.active = true;
                if(PlayerData.fishData.player.round_cost > 0){
                    this.PlayRoleAnim("Idle_Back");
                }else{
                    this.PlayRoleAnim("Lie");
                }
                
                if(cast){
                    //重新投杆
                    this.playRodAnim(RodAnimType.shuaigan, true);
                    AudioMgr.playSound(FishSoundInfo[FishSoundId.Fish_2], false);
                    console.log(`播放钓鱼音效---->` + FishSoundInfo[FishSoundId.Fish_2]);
                }else {
                    if(updateRod){
                        this.rodUpEffect.node.active = true;
                        let updateName:string = "levelup" + this.rodType;
                        this.rodUpEffect.setAnimation(0, updateName, false);
                        this.rodUpEffect.setCompleteListener(() => {
                            this.rodUpEffect.node.active = false;
                            this.playRodAnim(RodAnimType.wait);
                        });
                    }else{
                        //已投杆升级鱼竿
                        this.playRodAnim(RodAnimType.wait);
                    }
                    
                } 
                break;
            case FishRoundState.LiftRod:
                this.PlayRoleAnim("Idle_Back");
                if(PlayerData.FishMyLakeIsIced){
                    this.playRodAnim(RodAnimType.wait_ice);
                }else{
                    this.playRodAnim(RodAnimType.wait);
                }
                break;
            case FishRoundState.Settle:
                this.roleModel.node.active = false;
                this.rodModel.node.active = false;
                break;
            case FishRoundState.NoSelect:
                this.PlayRoleAnim("Lie");
                SetNodeGray(this.timeTitleSLab.node, false);
                SetNodeGray(this.roundTimeTitleLab.node, false);
                this.roundCont.active = true;
                this.playRodAnim(RodAnimType.idle);
                break;
            case FishRoundState.NoFishing:
                this.PlayRoleAnim("Lie");
                SetNodeGray(this.timeTitleSLab.node, true);
                SetNodeGray(this.roundTimeTitleLab.node, true);
                this.roundCont.active = true;
                this.roundCdCont.active = true;
                this.playRodAnim(RodAnimType.idle);
                break;
            case FishRoundState.NoStart:
                this.PlayRoleAnim("Lie");
                this.playRodAnim(RodAnimType.idle);
                break;
            case FishRoundState.No:
                this.PlayRoleAnim("Lie");
                this.playRodAnim(RodAnimType.idle);
                break;
        }
        
        
    }
    
    PlayGetFishAnim(finishCb:Function):void{
        if(!this.node.activeInHierarchy) return;
        let data:SFishingSettlementData = PlayerData.fishData.settlement;
        if(data){
            let anmiaType:RodAnimType;
            if(PlayerData.FishMyLakeIsIced){
                anmiaType = data.is_miss ? RodAnimType.lost_ice : RodAnimType.get_ice;
            }else{
                anmiaType = data.is_miss ? RodAnimType.lost: RodAnimType.get;
                
            }
            this.thEffect.node.active = !data.is_miss;
            this.playRodAnim(anmiaType, false, ()=>{
                this.thEffect.node.active = false;
                if(!data.is_miss){
                    
                    anmiaType = PlayerData.FishMyLakeIsIced ? RodAnimType.win_ice : RodAnimType.win;
                    this.playRodAnim(anmiaType, false, ()=>{
                        finishCb();
                    });
                }else{
                   
                    finishCb();
                }
            });
        }
    }
    public PlayRoleAnim(name:string):void{
        this.curRoleAnimName = name;
        this.updateRoleAnim();
    }
    private updateRoleAnim():void{
        if(this.roleModel.animation == this.curRoleAnimName || !this.roleModel.findAnimation(this.curRoleAnimName)) return;
        this.roleModel.setAnimation(0, this.curRoleAnimName, true);
    }
    private updateHeroModel():void{
        let newHeroId:number = PlayerData.GetFishingHeroId();
        if(newHeroId == this.curHeroId) return;
        this.curHeroId = newHeroId;
        let curHero:StdFishHero = CfgMgr.GetFishHero(this.curHeroId);
        let modelName:string = "mg_role";
        if(curHero && curHero.HeorModel && curHero.HeorModel.length > 0){
            modelName = curHero.HeorModel;
        }
        if(modelName == "mg_role" && GameSet.GetServerMark() == "hc"){
            modelName = "mg_role_3"
        }
        let url:string = path.join("spine/effect", modelName, modelName);
        ResMgr.LoadResAbSub(url, sp.SkeletonData, (res:sp.SkeletonData)=>{
            if(this.roleModel.skeletonData != res){
                this.roleModel.skeletonData = res; 
            } 
            this.updateRoleAnim();
        });
    }
    private playRodAnim(type:number, isForce:boolean = false, cb:Function = null):void{
        
        let animInfo:{name:string, loop:boolean, finishCbType?:RodAnimType} = this.rodAnimInfo[type];
        let rodType:number = PlayerData.FishRodType + 1;
        let nextName:string = animInfo.name + rodType; 
        if(!this.rodModel.findAnimation(nextName)) {
            return;
        }
        this.curRodInfo = {type:type, isForce:isForce, cb:cb};
        if(isForce || this.curRodAnimName !== nextName){
            this.curRodAnimName = nextName;
            this.rodModel.setAnimation(0, nextName, animInfo.loop);
            this.rodModel.setCompleteListener(() => {
                if(animInfo.finishCbType){
                    this.playRodAnim(animInfo.finishCbType, true, cb);
                }else if(cb != null){
                    cb();
                } 
            })
        }   
    }
    PlayFeedEffect():void{
        this.feedEffect.setAnimation(0, "Plus", false);
        this.feedEffect.setCompleteListener(() => {
            this.feedEffect.setAnimation(0, "Idle", false);
        })
    }
    private tempTime:number = 0;
    protected update(dt: number): void {
        this.roundEffect.node.active = false;
        let curRoundInfo:SFishingRoundInfo = PlayerData.CurFishRoundInfo;
        if(!curRoundInfo) return;
        let residueTime:number;
        let selectLakeTime:number = curRoundInfo.start_time + CfgMgr.GetFishCommon.RoundFrozenTime;
        residueTime = Math.max(Math.floor(selectLakeTime - PlayerData.GetServerTime()), 0);
        if(residueTime > 0 && residueTime <= 5){
            this.roundEffect.node.active = true;
            if(this.tempTime <= 0){
                AudioMgr.playSound(FishSoundInfo[FishSoundId.Fish_4], false);
                console.log(`播放钓鱼音效---->` + FishSoundInfo[FishSoundId.Fish_4]);
                this.tempTime = 1;
            }else{
                this.tempTime -= dt;
            }
            
        }else{
            this.tempTime = 0;
            this.roundEffect.node.active = false;
        }
        this.timeLab.string = residueTime.toString();
        this.proBar.progress = residueTime / CfgMgr.GetFishCommon.RoundFrozenTime;
        residueTime = Math.max(Math.floor(curRoundInfo.end_time - PlayerData.GetServerTime()), 0);
        this.roundCdLab.string = residueTime.toString();
        
    }
}