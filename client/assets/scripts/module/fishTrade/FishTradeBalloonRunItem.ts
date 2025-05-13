import {Component, instantiate, Node, NodePool, path, sp,UITransform, Vec3 } from "cc";
import {randomI } from "../../utils/Utils";
import { StdFishTradeShip } from "../../manager/CfgMgr";
import { ResMgr } from "../../manager/ResMgr";
interface KillEffectInfo {
    showPosY:number,//特效出现坐标
    showTime:number,//特效出现时间
    isKill:boolean,//是否击杀
    resName:string,//特效资源名称
    index:number,//下标
}
export class FishTradeBalloonRunItem extends Component {
    private moveNode:Node;
    private resultEffect:sp.Skeleton;
    private killCont:Node;
    private isInit:boolean = false;
    private data:StdFishTradeShip;
    private trans:UITransform;
    private pos:Vec3;
    private moveTime:number = 10000;
    private speed:number;
    private isStart:boolean = false;
    private isPlayKill:boolean = false;
    private curTime:number = 0;
    private killData:{id:number, isShowCloud:boolean, isKill:boolean};
    private killEffectInof:KillEffectInfo[] = [];
    public tempKllEffect:Node;
    private curSkillEffectInfo:KillEffectInfo;
    private pool:NodePool = new NodePool();
    private resList:string[] = ["mg_Dragon", "mg_Wind", "mg_Darclouds"];
    protected onLoad(): void {
        this.trans = this.getComponent(UITransform);
        this.moveNode = this.node.getChildByName("moveNode");
        this.killCont = this.node.getChildByName("killCont");
        this.pos = this.moveNode.position.clone();
        this.speed = this.trans.height / this.moveTime;
        this.resultEffect = this.node.getChildByPath("resultEffect").getComponent(sp.Skeleton);
        this.isInit = true;
        this.updateShow();
    }
    protected update(dt: number): void {
        if(!this.isStart || !this.data) return;
        this.pos.y = this.curTime * this.speed; 
        let info:KillEffectInfo;
        for (let index = 0; index < this.killEffectInof.length; index++) {
            info = this.killEffectInof[index];
            if(this.curTime >= info.showTime){
                if(info.isKill) this.curSkillEffectInfo = info;
                this.createEffect(info);
                this.killEffectInof.splice(index, 1);
                break;
            }
        }
        if(this.curSkillEffectInfo && this.curSkillEffectInfo.isKill){
            if(this.moveNode.position.y + 70 < this.curSkillEffectInfo.showPosY){
                this.moveNode.position =  this.pos;
            }else{
                if(!this.isPlayKill){
                    this.isPlayKill = true;
                    this.playKill();
                }
            }
            
        }else{
            this.moveNode.position =  this.pos;
        }
        if(this.curTime >= this.moveTime){
            this.isStart = false;
            this.playResult();
        }
        this.curTime += dt * 1000;
    }
    SetData(data:StdFishTradeShip, killData:{id:number, isShowCloud:boolean, isKill:boolean}):void{
        this.data = data;
        this.isStart = false;
        this.curTime = 0;
        this.killData = killData;
        this.updateShow();
    }
    private updateShow():void{
        if(!this.isInit || !this.data || !this.killData) return;
        this.pos.y = 0; 
        this.curSkillEffectInfo = null;
        this.isStart = true;
        this.isPlayKill = false;
        this.moveNode.active = true;
        this.resultEffect.node.active = false;
        this.createEffectPos();
        //this.killPosY = randomI(80, this.trans.height - 40);
        this.moveNode.position = this.pos;
    }
    
    private playResult():void{
        this.resultEffect.node.active = true;
        this.resultEffect.setAnimation(0, this.curSkillEffectInfo && this.curSkillEffectInfo.isKill ? "lost" : "win", false);
        this.resultEffect.setCompleteListener(() => {
            
        });
    }

    private createEffectPos():void{
        while(this.killCont.children.length > 0){
            this.pool.put(this.killCont.children[0]);
        }
        this.killEffectInof = [];
        let startPosY:number = 200;//障碍出现开始坐标
        let endPosY:number = this.trans.height - 20;//障碍出现结束坐标
        let rangeH:number = endPosY - startPosY;
        let maxNum:number = 4;//出现障碍最大数量
        let miniNum:number = 2;//出现障碍最小数量
        let newNum:number = randomI(miniNum, maxNum);
        let showPosY:number;
        let showTime:number;
        let isNewKill:boolean = false;
        let isKill:boolean = false;
        let gap:number = Math.floor(rangeH / newNum);
        let curStarPosY:number = 0;
        let curEndPosY:number = 0;
        let resName:string;
        if(this.killData.isKill){
            resName = randomI(0, 1) == 0 ? "mg_Dragon" : "mg_Darclouds";
        }else{
            resName = randomI(0, 1) == 0 ? "mg_Wind" : "mg_Darclouds";
        }
        for (let index = 0; index < newNum; index++) {
            curStarPosY = index * gap + startPosY + (index * 60);
            curEndPosY = (index + 1) * gap + startPosY;
            //console.log("---->"+ this.data.ShipId +"------>"+newNum+"--------->" + curStarPosY + "------>" + curEndPosY);
            showPosY = randomI(curStarPosY, curEndPosY);
            //console.log("showPosY---->"+ showPosY);
            showTime = showPosY / this.speed - 3000;
            isKill = false;
            
            if(!isNewKill && this.killData.isKill && index > 0){
                isNewKill = true;
                isKill = this.killData.isKill;
            }
            //console.log(this.data.ShipId + "---->"+ isKill);
            let effectInfo:KillEffectInfo = {
                index:index,
                showPosY:showPosY,
                showTime:showTime,
                isKill:isKill,
                resName:resName,
            }
            
            this.killEffectInof[index] = effectInfo;
            if(isKill) break;
            //this.createEffect(effectInfo);
        }
    }

    private createEffect(info:KillEffectInfo):void{
        let effect:Node = this.pool.get() || instantiate(this.tempKllEffect);
        effect.active = false;
        effect.parent = this.killCont;
        effect.position = new Vec3(0, info.showPosY, 0);
        let s:sp.Skeleton = effect.getComponent(sp.Skeleton);
        let url:string = path.join("spine/effect", info.resName, info.resName);
        ResMgr.LoadResAbSub(url, sp.SkeletonData, (res:sp.SkeletonData)=>{
            effect.active = true;
            s.skeletonData = res; 
            s.setAnimation(0, info.isKill ? "danger" : "safe", false);
            s.setCompleteListener(()=>{
                this.pool.put(effect);
            });
        });
    }

    private playKill():void{
        if(!this.curSkillEffectInfo) return;
        let effect:Node = this.pool.get() || instantiate(this.tempKllEffect);
        effect.active = false;
        effect.parent = this.killCont;
        this.moveNode.active = false;
        effect.position = this.moveNode.position.clone();
        let s:sp.Skeleton = effect.getComponent(sp.Skeleton);
        let url:string = path.join("spine/effect", "mg_balloon_destroy", "mg_balloon_destroy");
        ResMgr.LoadResAbSub(url, sp.SkeletonData, (res:sp.SkeletonData)=>{
            effect.active = true;
            s.skeletonData = res; 
            s.setAnimation(0, "animation", false);
            s.setCompleteListener(()=>{
                this.pool.put(effect);
            });
        });
    }
}