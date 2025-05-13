import { Node, Component, Label, sp, Tween, tween, Vec3, Sprite, v3 } from "cc";
import { StdFishBombHamalPos, StdFishBombPond } from "../../manager/CfgMgr";
import PlayerData from "../roleModule/PlayerData";
import { BeforeGameUtils } from "../../utils/BeforeGameUtils";
import { formatNumber } from "../../utils/Utils";

export class FishBombHamal extends Component{
    private isInit:boolean = false;
    private titleCont:Node;
    private numLab:Label;
    private effect:sp.Skeleton;
    private isMe:boolean;
    private effctAction:string = "Idlebomb";
    private type:number = 1;
    private defScale:number = 0.15;
    private targetPondId:number;
    private toIdeName: { [key: string]: boolean } = BeforeGameUtils.toHashMapObj(
        "Throwbomb1", true,
        "Throwbomb2", true,
        "Throwbomb3", true,
        "Throwbomb_c1", true,
        "Throwbomb_c2", true,
        "Throwbomb_c3", true,
        "Win", true
    );
    protected onLoad(): void {
        this.titleCont = this.node.getChildByName("titleCont");
        this.numLab =  this.node.getChildByPath("titleCont/numLab").getComponent(Label);
        this.effect = this.node.getChildByName("effect").getComponent(sp.Skeleton);
        this.isInit = true;
        this.updateShow();
    }
    SetData(isMe:boolean):void{
        this.isMe = isMe;
        this.updateShow();
    }
    SetTargetPondId(id:number):void{
        this.targetPondId = id;
    }
    GetTargetPondId():number{
       return this.targetPondId;
    }
    public SetRun(posList:StdFishBombHamalPos[]):void{
        if(!this.isInit) return;
        this.StopMove();
        if(posList.length > 0){
            this.SetEffectName("Transportbomb");
            
            this.effect.node.scale = new Vec3(-this.defScale, this.defScale, 0);
            let action;
            let actionList = [];
            let posInfo:StdFishBombHamalPos;
            let scale:any;
            let scaleList = [];
            for (let index = 0; index < posList.length; index++) {
                posInfo = posList[index];
                action = tween().to(posInfo.time, { position: posInfo.pos});
                actionList.push(action);
                if(posInfo.dir != 0){
                    scale = tween().delay(posInfo.time).to(0, {scale:new Vec3(posInfo.dir * this.defScale, this.defScale, 0)});
                    scaleList.push(scale);
                }else{
                    scale = tween().delay(posInfo.time).to(0, {});
                    scaleList.push(scale);
                }
                
            }
            let sequence1 = tween().sequence(...actionList);
            tween(this.node)
            .then(sequence1)
            .call(()=>{
                this.SetEffectName("Idlebomb");
            })
            .start();

            let sequence2 = tween().sequence(...scaleList);
            tween(this.effect.node)
            .then(sequence2)
            .start();
        }
        
    }
    
    private updateShow():void{
        if(!this.isInit) return;
        this.titleCont.active = this.isMe;
        this.SetVel(PlayerData.GetFishBombSelfCurRoundCost());
        this.SetEffectName(this.effctAction);

        
    }
    
    public SetVel(num:number):void{
        if(!this.isInit) return;
        
        this.numLab.string = formatNumber(num, 2);
        this.type = PlayerData.FishBombType(num);
        this.SetEffectName(this.effctAction);
    }

    public StopMove(dir?:number):void{
        if(!this.isInit) return;
        this.SetEffectName("Idlebomb");
        Tween.stopAllByTarget(this.node);
        Tween.stopAllByTarget(this.effect.node);
        if(dir){
            this.effect.node.scale = v3(this.defScale * dir, this.defScale, 0);
        }
    }

    public SetEffectName(name:string, isAddType:boolean = true):void{
        if(!this.isInit){
            this.effctAction = name;
            return;
        } 
        let allName:string = isAddType ? name + this.type : name;
        if(this.effect.animation != allName){
            if(this.effect.findAnimation(allName)){
                this.effect.setAnimation(0, allName, true);
                this.effect.setCompleteListener(()=>{
                    if(this.toIdeName[this.effect.animation]){
                        this.SetEffectName("Idlebomb");
                    }
                })
                
            }
        }
        this.effctAction = name;
    }
}