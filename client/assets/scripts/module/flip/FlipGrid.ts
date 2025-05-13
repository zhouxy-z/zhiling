import { Node, Component, Sprite, v3, tween, easing, path, SpriteFrame, Label, Button, sp, Tween } from "cc";
import { CfgMgr, StdRole } from "../../manager/CfgMgr";
import { folder_head_card, ResMgr } from "../../manager/ResMgr";

export class FlipGrid extends Component {
    private unknown: Node;
    private bg: Sprite;
    private icon: Sprite;
    private numLab: Label;
    private cardBack: Node;
    private card: Node;
    private btn: Button;
    private effect: sp.Skeleton;
    private data: number[];
    private isOpen: boolean = false;
    private effectStr:string;
    protected onLoad(): void {
        this.unknown = this.node.getChildByName("unknown");
        this.card = this.node.getChildByName("card");
        this.bg = this.node.getChildByPath("card/bg").getComponent(Sprite);
        this.icon = this.node.getChildByPath("card/icon").getComponent(Sprite);
        this.numLab = this.node.getChildByPath("numLab").getComponent(Label);
        this.effect = this.node.getChildByPath("effect").getComponent(sp.Skeleton);
        this.cardBack = this.node.getChildByPath("cardBack");
        this.btn = this.node.getComponent(Button);
    }
    
    onInit(): void {
        this.unschedule(this.showCardBack);
        this.unschedule(this.showCard);
        Tween.stopAllByTarget(this.cardBack);
        Tween.stopAllByTarget(this.card);
        this.data = null;
        this.isOpen = false;
        this.effectStr = null;
        this.effect.node.active = false;
        this.btn.interactable = false;
        this.unknown.active = true;
        this.card.setScale(v3(0, 1, 0));
        this.cardBack.setScale(v3(0, 1, 0));
    }

    onShowCardBack(delay: number): void {
        this.scheduleOnce(this.showCardBack, delay);
        
    }

    private showCardBack():void{
        this.cardBack.setScale(v3(0, 0, 0));
        tween(this.cardBack)
        .to(0.15, { scale: v3(1.2, 1.2, 0) }, { easing: easing.elasticIn })
        .to(0.5, { scale: v3(1, 1, 0) }, { easing: easing.elasticOut })
        .call(()=>{
            this.unknown.active = false;
        })
        .start();
    }

    onShowCard(delay: number = 0): void {
        if(this.isOpen) return;
        this.scheduleOnce(this.showCard, delay);
        
    }

    private showCard(): void{
        this.isOpen = true;
        this.btn.interactable = false;
        this.cardBack.setScale(v3(1, 1, 0));
        this.card.setScale(v3(0, 1, 0));
        tween(this.cardBack)
        .to(0.15, { scale: v3(0, 1, 0) })
        .start()

        tween(this.card)
        .delay(0.15)
        .to(0.5, { scale: v3(1, 1, 0) })
        .call(()=>{
            if (this.effectStr) {
                this.effect.node.active = true;
                this.effect.setAnimation(0, "animation", true);
            }
            
        })
        .start();
    }

    GetIsOpen(): boolean{
        return this.isOpen;
    }

    SetData(data: number[], effectStr: string = null, isBigPrize: boolean = false): void{
        this.data = data;
        this.effectStr = effectStr;
        if (this.data){
            this.btn.interactable = true;
           
            this.numLab.string = data[0] + "," + data[1];
            let std:StdRole = CfgMgr.GetRole()[data[0]];
            if (std) {
                this.icon.node.active = true;
                ResMgr.LoadResAbSub(path.join(folder_head_card, std.Icon, "spriteFrame"), SpriteFrame, (res)=>{
                    this.icon.spriteFrame = res;
                });
            }
            if (effectStr) {
                if (isBigPrize) {
                    this.effect.node.active = true;
                }
                let url:string = path.join("spine/effect", effectStr, effectStr);
                ResMgr.LoadResAbSub(url, sp.SkeletonData, (res:sp.SkeletonData)=>{
                    if(this.effect.skeletonData != res){
                        this.effect.skeletonData = res; 
                        this.effect.setAnimation(0, "animation", true);
                    }
                    
                });
            }
            
        } else {
            this.numLab.node.active = false;
            this.icon.node.active = false;
        }
        
    }

    GetData():number[]{
        return this.data;
    }
}