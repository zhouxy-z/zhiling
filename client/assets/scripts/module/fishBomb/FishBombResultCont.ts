import { Button, Component, Label, Node, path, RichText, sp, Sprite, SpriteFrame, tween, Vec3 } from "cc";
import PlayerData, {} from "../roleModule/PlayerData"
 import {FishingTradePlayerSettlementData,SFishingBombRoundInfo,SFishingBombSettlementData,SFishingBombStageInfo,SFishingItem,SFishingTradePlayerStateData,SFishingTradeRoundInfo,SFishingTradeShipData} from "../roleModule/PlayerStruct";
import { CfgMgr, StdFishItem, StdFishTradeShip } from "../../manager/CfgMgr";
import { formatNumber } from "../../utils/Utils";
import { folder_icon, ResMgr } from "../../manager/ResMgr";
import { AdaptBgTop } from "../common/BaseUI";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
export class FishBombResultCont extends Component {
    private tipsLab:RichText;
    private winEffect:sp.Skeleton;
    private winCont:Node;
    private weightLab:Label;
    private priceLab:Label;
    private fishItem:Node;
    private fishIcon:Sprite;
    private fishWeightLab:Label;
    private fishName:Label;
    private vitItem:Node;
    private vitNumLab:Label;

    private failCont: Node;
    private failWeightLab:Label;
    private failVitNumLab:Label;
    private yuPiaoItem:Node;
    private yuPiaoNumLab:Label;

    private timeTipsCont:Node;
    private exitBtn:Button;
    private continueBtn:Button;
    private continueBtnLab:Label;
    private isTick:boolean;
    private endTime:number = -1;
    protected onLoad(): void {
        this.tipsLab = this.node.getChildByPath("cont/tipsLab").getComponent(RichText);
    
        this.winCont = this.node.getChildByPath("cont/winCont");
        this.winEffect = this.node.getChildByPath("cont/winCont/winEffect").getComponent(sp.Skeleton);
        this.weightLab = this.node.getChildByPath("cont/winCont/weightLab").getComponent(Label);
        this.priceLab = this.node.getChildByPath("cont/winCont/priceLab").getComponent(Label);
        this.fishItem = this.node.getChildByPath("cont/winCont/fishItem");
        this.fishIcon = this.node.getChildByPath("cont/winCont/fishItem/icon").getComponent(Sprite);
        this.fishWeightLab = this.node.getChildByPath("cont/winCont/fishItem/numLab").getComponent(Label);
        this.fishName = this.node.getChildByPath("cont/winCont/fishItem/nameLab").getComponent(Label);
        this.vitItem = this.node.getChildByPath("cont/winCont/vitItem");
        this.vitNumLab = this.node.getChildByPath("cont/winCont/vitItem/numLab").getComponent(Label);

        this.failCont = this.node.getChildByPath("cont/failCont");
        this.failWeightLab = this.node.getChildByPath("cont/failCont/weightLab").getComponent(Label);
        this.failVitNumLab = this.node.getChildByPath("cont/failCont/vitItemLab").getComponent(Label);
        this.yuPiaoItem = this.node.getChildByPath("cont/failCont/yuPiaoItem");
        this.yuPiaoNumLab = this.node.getChildByPath("cont/failCont/yuPiaoItem/numLab").getComponent(Label);

        this.timeTipsCont = this.node.getChildByPath("cont/timeTipsCont");
        this.exitBtn = this.node.getChildByPath("cont/btnCont/exitBtn").getComponent(Button);
        this.continueBtn = this.node.getChildByPath("cont/btnCont/continueBtn").getComponent(Button);
        this.continueBtnLab = this.node.getChildByPath("cont/btnCont/continueBtn/continueBtnLab").getComponent(Label);

        this.exitBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.continueBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
    }
    protected update(dt: number): void {
        if(this.isTick){
            let residueTime:number = Math.max(Math.floor(this.endTime - PlayerData.GetServerTime()), 0);
            this.continueBtnLab.string = `继续游戏(${residueTime}s)`;
        }
    }
    onShow():void{
        this.node.active = true;
        this.isTick = false;
        
        AdaptBgTop(this.node.getChildByPath("mask"));
        this.updateShow();
    }
    onHide():void{
        this.node.active = false;
    }
    private onBtnClick(btn:Button):void{
        switch(btn){
            case this.exitBtn:
                this.onHide();
                Session.Send({type: MsgTypeSend.FishingBombClaimReward, data:{is_continue:false}});
                break;
            case this.continueBtn:
                this.onHide();
                Session.Send({type: MsgTypeSend.FishingBombClaimReward, data:{is_continue:true}});
                break;
        }
    }
    private updateShow():void{
        if(!PlayerData.fishBombData || !PlayerData.fishBombData.settlement) return; 
        let settlement:SFishingBombSettlementData = PlayerData.fishBombData.settlement;
	    let round_info:SFishingBombRoundInfo = PlayerData.fishBombData.round_info;
        let weight:number = 0;
        let ruondNum:number = PlayerData.fishBombData.player.odds_index + 1;
        if(settlement.is_win){
            if(settlement.next_game_open){
                this.isTick = true;
                this.timeTipsCont.active = true;
                this.exitBtn.node.active = true;
            }else{
                this.timeTipsCont.active = false;
                this.exitBtn.node.active = false;
                this.continueBtnLab.string = "离开游戏";
            }
            
            this.endTime = round_info.end_time;
            this.tipsLab.string = `恭喜你连过<color=#FCFFD7><size=50>${ruondNum}关</size></color>成为炸鱼勇士！`;
            this.winCont.active = true;
            this.failCont.active = false;
            this.winEffect.node.active = true;
            this.winEffect.setAnimation(0, "result_1", false);
            this.winEffect.setCompleteListener(()=>{
                this.winEffect.node.active = false;
            });
            this.fishItem.setScale(0.5, 0.5);
            this.vitItem.setScale(0.5, 0.5);
            tween(this.fishItem)
            .to(0.3, { scale: new Vec3(1, 1, 1) }, {
                easing: "backOut",                                         
            })
            .start();

            tween(this.vitItem)
            .to(0.3, { scale: new Vec3(1, 1, 1) }, {
                easing: "backOut",                                         
            })
            .start();

            let fishData:SFishingItem;
            let stdFishItem:StdFishItem;
            for (let index = 0; index < settlement.fish_items.length; index++) {
                fishData = settlement.fish_items[index];
                stdFishItem = CfgMgr.GetFishItem(fishData.fish_id);
                weight = weight.add(fishData.weight);
            }
            let url = path.join(folder_icon, `fish/${stdFishItem.Icon}`, "spriteFrame");
            ResMgr.LoadResAbSub(url, SpriteFrame, res => {
                this.fishIcon.spriteFrame = res;
            });
            this.weightLab.string = formatNumber(weight, 2);
            this.fishName.string = stdFishItem.Fishsname;
            this.fishWeightLab.string = formatNumber(weight, 2);
            this.vitNumLab.string = Math.floor(settlement.fatigue_get).toString();
            this.priceLab.string = formatNumber(weight, 2);
        }else{
            this.continueBtnLab.string = "离开游戏";
            this.timeTipsCont.active = false;
            this.tipsLab.string = `很遗憾，您在第<color=#FCFFD7><size=50>${ruondNum}</size></color>回合失败了`;
            this.winCont.active = false;
            this.failCont.active = true;
            this.yuPiaoItem.setScale(0.5, 0.5);
            tween(this.yuPiaoItem)
            .to(0.3, { scale: new Vec3(1, 1, 1) }, {
                easing: "backOut",                                         
            })
            .start();
            this.exitBtn.node.active = false;
            weight = settlement.cost_lose;
            this.failWeightLab.string = formatNumber(weight, 2);
            this.failVitNumLab.string = Math.floor(settlement.fatigue_lose).toString();
            this.yuPiaoNumLab.string = Math.floor(settlement.fish_score_get).toString();
        }
    }
}