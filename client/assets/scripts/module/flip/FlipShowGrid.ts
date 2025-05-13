import { Node, Component, Sprite, v3, tween, easing, Label, Vec3, path, SpriteFrame } from "cc";
import { CfgMgr, StdRole } from "../../manager/CfgMgr";
import { folder_head_card, ResMgr } from "../../manager/ResMgr";

export class FlipShowGrid extends Component {
    private unknown: Node;
    private bg: Sprite;
    private icon: Sprite;
    private cardBack: Node;
    private card: Node;
    private numLab: Label;
    private data: number[];
    protected onLoad(): void {
        this.unknown = this.node.getChildByName("unknown");
        this.card = this.node.getChildByName("card");
        this.bg = this.node.getChildByPath("card/bg").getComponent(Sprite);
        this.icon = this.node.getChildByPath("card/icon").getComponent(Sprite);
        this.cardBack = this.node.getChildByPath("cardBack");
        this.numLab = this.node.getChildByPath("consumeItem/numLab").getComponent(Label);
    }

    onInit(): void {
        this.data = null
        this.unknown.active = true;
        this.card.setScale(v3(0,1,0));
        this.cardBack.active = false;
        this.numLab.string = "???";
        //this.onShowCardBack();
    }

    onShowCardBack(delay: number): void {
        let thisObj = this;
        this.scheduleOnce(() => {
            thisObj.cardBack.active = true;
            thisObj.cardBack.setScale(v3(0, 0, 0));
            tween(thisObj.cardBack)
            .to(0.15, { scale: v3(1.2, 1.2, 0) }, { easing: easing.elasticIn })
            .to(0.5, { scale: v3(1, 1, 0) }, { easing: easing.elasticOut })
            .call(()=>{
                thisObj.unknown.active = false;
            })
            .start()
        }, delay);
        
    }

    onShowCard(delay: number): void {
        this.numLab.string = "???";
        let thisObj = this;
        this.scheduleOnce(() => {
            thisObj.cardBack.active = true;
            thisObj.cardBack.setScale(v3(1, 1, 0));
            thisObj.card.setScale(v3(0, 1, 0));
            tween(thisObj.cardBack)
            .to(0.15, { scale: v3(0, 1, 0) })
            .call(()=>{
                thisObj.cardBack.active = false;
            })
            .start()

            tween(thisObj.card)
            .delay(0.15)
            .to(0.5, { scale: v3(1, 1, 0) })
            .call(()=>{
                thisObj.numLab.string = thisObj.data ? thisObj.data[1].toString() : "0";
            })
            .start()
        }, delay);
        
    }

    SetData(data: number[]): void{
        this.data = data;
        if (this.data){
            
            let std:StdRole = CfgMgr.GetRole()[data[0]];
            if (std) {
                this.icon.node.active = true;
                ResMgr.LoadResAbSub(path.join(folder_head_card, std.Icon, "spriteFrame"), SpriteFrame, (res)=>{
                    this.icon.spriteFrame = res;
                });
            }
            
        } else {
            this.icon.node.active = false;
        }
        
    }

    GetData():number[]{
        return this.data;
    }
    
}