import { Node, Component, sp, Sprite, SpriteFrame, path} from "cc";
import { StdFishBombPond } from "../../manager/CfgMgr";
import PlayerData from "../roleModule/PlayerData";
import { ResMgr } from "../../manager/ResMgr";

export class FishBombPondItem extends Component{
    private isInit:boolean = false;
    private effect:sp.Skeleton;
    private riskIcon:Sprite;
    private winEffect:sp.Skeleton;
    private hotEffect:Node;
    private std:StdFishBombPond;
    private effctAction:string = "Lie";
    protected onLoad(): void {
        this.effect = this.node.getChildByName("effect").getComponent(sp.Skeleton);
        this.riskIcon = this.node.getChildByName("riskIcon").getComponent(Sprite);
        this.winEffect = this.node.getChildByName("winEffect").getComponent(sp.Skeleton);
        this.hotEffect = this.node.getChildByName("hotEffect");
        this.winEffect.node.active = false;
        this.hotEffect.active = false;
        this.isInit = true;
        this.updateShow();
    }
    SetData(data:StdFishBombPond):void{
        this.std = data;
        this.updateShow();
    }
    
    private updateShow():void{
        if(!this.std || !this.isInit) return;
        ResMgr.LoadResAbSub(path.join("sheets/fishBomb", this.std.riskRes, "spriteFrame"), SpriteFrame, res => {
            this.riskIcon.spriteFrame = res;
        });
        
        this.SetEffectAction(this.effctAction);
        this.UpdateHot();
    }

    public SetEffectAction(name:string):void{
        if(this.effect.animation != name){
            if(this.effect.findAnimation(name)){
                this.effect.setAnimation(0, name, true);
            }
        }
        this.effctAction = name;
    }

    public GetStd():StdFishBombPond{
        return this.std;
    }

    public PlayWin():void{
        let thisObj = this;
        this.scheduleOnce(()=>{
            thisObj.winEffect.node.active = true;
            thisObj.winEffect.clearAnimation();
            thisObj.winEffect.setAnimation(0, thisObj.std.WinEffectRes, false);
            thisObj.winEffect.setCompleteListener(()=>{
                thisObj.winEffect.node.active = false;
            });
        }, 3);
    }

    public UpdateHot():void{
        if(!this.isInit) return;
        //this.hotEffect.active = PlayerData.GetHotPond(this.std.Id);
    }
}