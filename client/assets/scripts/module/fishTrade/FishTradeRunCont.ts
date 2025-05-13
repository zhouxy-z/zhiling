import { Button, Component, Label, Node } from "cc";
import { FishTradeBalloonItem } from "./FishTradeBalloonItem";
import { CfgMgr, StdFishTradeShip } from "../../manager/CfgMgr";
import { FishTradeBalloonRunItem } from "./FishTradeBalloonRunItem";
import PlayerData from "../roleModule/PlayerData";
import { AdaptBgTop } from "../common/BaseUI";
import { AudioGroup, AudioMgr, FishTradeSoundId, FishTradeSoundInfo, SoundDefine } from "../../manager/AudioMgr";
import { folder_sound } from "../../manager/ResMgr";

export class FishTradeRunCont extends Component {
    private titleLab:Label;
    private balloonItem_1:FishTradeBalloonRunItem;
    private balloonItem_2:FishTradeBalloonRunItem;
    private balloonItem_3:FishTradeBalloonRunItem;
    private tempKllEffect:Node;
    private datas:StdFishTradeShip[] = [];
    private killIdMap:{[key:string]:{id:number, isShowCloud:boolean, isKill:boolean}};
    private isInit:boolean = false;
    protected onLoad(): void {
        this.titleLab = this.node.getChildByName("titleLab").getComponent(Label);
        this.tempKllEffect = this.node.getChildByName("tempKillEffect");
        this.balloonItem_1 = this.node.getChildByPath("balloonCont/balloonRunCont_1").addComponent(FishTradeBalloonRunItem);
        this.balloonItem_2 = this.node.getChildByPath("balloonCont/balloonRunCont_2").addComponent(FishTradeBalloonRunItem);
        this.balloonItem_3 = this.node.getChildByPath("balloonCont/balloonRunCont_3").addComponent(FishTradeBalloonRunItem);
        this.balloonItem_1.tempKllEffect = this.tempKllEffect;
        this.balloonItem_2.tempKllEffect = this.tempKllEffect;
        this.balloonItem_3.tempKllEffect = this.tempKllEffect;
        this.isInit = true;
        this.datas = CfgMgr.GetFishTradeShipList;
        this.updateShow();
    }
    onShow():void{
        this.node.active = true;
        AudioMgr.playSound(FishTradeSoundInfo[FishTradeSoundId.Fish_Trade_2], false);
        this.unschedule(this.playThunder);
        this.schedule(this.playThunder, 3);
        console.log(`播放运鱼打雷1音效---->` + FishTradeSoundInfo[FishTradeSoundId.Fish_Trade_2]);
        AdaptBgTop(this.node.getChildByPath("mask"));
        this.updateShow();
    }
    onHide():void{
        this.node.active = false;
        this.killIdMap = null;
        this.unschedule(this.playThunder);
        let audio1: SoundDefine = {
            url: folder_sound + FishTradeSoundInfo[FishTradeSoundId.Fish_Trade_2],
            num: 1,
            group: AudioGroup.Sound
        };
        AudioMgr.Stop(audio1);

        let audio2: SoundDefine = {
            url: folder_sound + FishTradeSoundInfo[FishTradeSoundId.Fish_Trade_3],
            num: 1,
            group: AudioGroup.Sound
        };
        AudioMgr.Stop(audio2);
    }
    private playThunder():void{
        AudioMgr.playSound(FishTradeSoundInfo[FishTradeSoundId.Fish_Trade_3], false);
    }
    private onBtnClick():void{
        this.onHide();
        
    }
    public SetData(killIdMap:{[key:string]:{id:number, isShowCloud:boolean, isKill:boolean}}):void{
        this.killIdMap = killIdMap;
        let round:number = PlayerData.CurFishTradeRoundInfo ? PlayerData.CurFishTradeRoundInfo.round : 0;
        this.titleLab.string = `冒险-第${round}期`;
        this.updateShow();
    }
    private updateShow():void{
        if(!this.isInit || !this.killIdMap) return;
        let stdFishTradeShip:StdFishTradeShip;
        let balloonItem:FishTradeBalloonRunItem;
        for (let index = 0; index < this.datas.length; index++) {
            stdFishTradeShip = this.datas[index];
            balloonItem = this[`balloonItem_${index + 1}`];
            balloonItem.SetData(stdFishTradeShip, this.killIdMap[stdFishTradeShip.ShipId]);
        }
    }
}