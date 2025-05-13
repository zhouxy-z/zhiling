import { Node, Button, Component, Label, sp } from "cc";
import { AutoScroller } from "../../utils/AutoScroller";
import { AdaptBgTop } from "../../module/common/BaseUI";
import { SThing, SWorldBossBattleResult } from "../../module/roleModule/PlayerStruct";
import { ItemUtil } from "../../utils/ItemUtils";
import { AwardItem } from "../../module/common/AwardItem";

export class WorldBossBattleResult extends Component {
    private effect:sp.Skeleton;
    private battleLogBtn:Button;
    private hurtCont:Node;
    private hurtNumLab:Label;
    private awardList:AutoScroller;
    private surpriseCont:Node;
    private goHomeBtn:Button;
    private toBattleBtn:Button;
    private data:SWorldBossBattleResult;
    private isInit:boolean = false;
    private battleResultClose:(type:number)=>void;
    protected onLoad(): void {
        AdaptBgTop(this.node.getChildByName("mask"));
        this.effect = this.node.getChildByPath("cont/topCont/effect").getComponent(sp.Skeleton);
        this.battleLogBtn = this.node.getChildByPath("cont/topCont/battleLogBtn").getComponent(Button);
        this.hurtCont = this.node.getChildByPath("cont/topCont/hurtCont");
        this.hurtNumLab = this.node.getChildByPath("cont/topCont/hurtCont/hurtNumLab").getComponent(Label);
        this.awardList = this.node.getChildByPath("cont/awardCont/awardList").getComponent(AutoScroller);
        this.awardList.SetHandle(this.updateAwardList.bind(this));
        this.goHomeBtn = this.node.getChildByPath("cont/bottomCont/goHomeBtn").getComponent(Button);
        this.toBattleBtn = this.node.getChildByPath("cont/bottomCont/toBattleBtn").getComponent(Button);
        this.battleLogBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.goHomeBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.toBattleBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.isInit = true;
        this.updateShow();
    }
    set ResultCloseCb(cb:(type:number)=>void){
        this.battleResultClose = cb;
    }
    onShow(data:SWorldBossBattleResult):void{
        this.data = data;
        this.node.active = true;
        this.updateShow();
    }
    onHide():void{
        this.node.active = false;
        this.data = null;
    }
    private onBtnClick(btn:Button):void{
        switch(btn){
            case this.battleLogBtn:
                this.battleResultClose(3);
                break;
            case this.goHomeBtn:
                this.battleResultClose(1);
                break;
            case this.toBattleBtn:
                this.battleResultClose(2);
                break;
        }
    }
    private updateShow():void{
        if(!this.isInit||!this.data) return;
        this.effect.clearAnimation();
        this.effect.setAnimation(0, "start", false);
        this.effect.setCompleteListener(()=>{
            if(this.effect.animation != "loop"){
                this.effect.setAnimation(0, "loop", true);
            }
        });
        this.hurtCont.active = false;
        let hurtCont = this.hurtCont;
        this.scheduleOnce(()=>{
            hurtCont.active = true;
        },0.3)
        this.hurtNumLab.string = this.data.harm.toString();
        let awardDatas:SThing[] = [];
        if(this.data.RewardType && this.data.RewardType.length > 0){
            awardDatas = ItemUtil.GetSThingList(this.data.RewardType, this.data.RewardItemID, this.data.RewardNumber);
        }
        this.awardList.UpdateDatas(awardDatas);
        
    }

    private updateAwardList(item:Node, data:SThing):void{
        let awardItem:AwardItem = item.getComponent(AwardItem)||item.addComponent(AwardItem);
        awardItem.SetData({itemData:data});
    }
    
}