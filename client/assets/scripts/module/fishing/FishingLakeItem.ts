import { Node, Component, Label, sp, path } from "cc";
import { StdLake } from "../../manager/CfgMgr";
import PlayerData, { } from "../roleModule/PlayerData"
 import {SFishingLakeData,SFishingRoundInfo} from "../roleModule/PlayerStruct";
import { ResMgr } from "../../manager/ResMgr";

export class FishingLakeItem extends Component {
    private feedCont:Node;
    private icedModel:sp.Skeleton;
    private hotEffect:sp.Skeleton;
    private feedLab: Label;
    private nameLab: Label;
    private ownIcon:Node;
    private noneMask:Node;
    protected $loadSub: Promise<any>;
    protected complete: Function;
    protected hasLoad = false;
    private data:StdLake;
    protected onLoad(): void {
        this.feedCont = this.node.getChildByName("feedCont");
        this.icedModel = this.node.getChildByPath("icedModel").getComponent(sp.Skeleton);
        this.hotEffect = this.node.getChildByPath("hotEffect").getComponent(sp.Skeleton);
        this.feedLab = this.node.getChildByPath("feedCont/feedLab").getComponent(Label);
        this.nameLab = this.node.getChildByName("nameLab").getComponent(Label);
        this.ownIcon = this.node.getChildByName("ownIcon");
        this.noneMask = this.node.getChildByName("noneMask");
        this.hasLoad = true;
        this.icedModel.node.active = false;
        this.complete?.();
    }

    protected get loadSub() {
        if (this.$loadSub) return this.$loadSub;
        let thisObj = this;
        this.$loadSub = new Promise((resolve, reject) => {
            thisObj.complete = resolve;
        });
    }
    
    async SetData(data:StdLake, isSelect:boolean = false) {
        if (!this.hasLoad) await this.loadSub;
        this.data = data;
        this.updateShow();
    }
    async PlayIcedEffect():Promise<void>{
        this.icedModel.node.active = true;
        //this.icedModel.skeletonData = null;
        let icedEfeectName:string = "mg_btnice";
        if(PlayerData.FishSessionIsHell){
            icedEfeectName = "mg_btnice_hell";
        }
        let url:string = path.join("spine/effect", icedEfeectName, "skeleton");
        ResMgr.LoadResAbSub(url, sp.SkeletonData, (res:sp.SkeletonData)=>{
            if(this.icedModel.skeletonData != res){
                this.icedModel.skeletonData = res; 
            }
            this.icedModel.setAnimation(0, "show", false);
            this.icedModel.setCompleteListener(() => {
                if(this.icedModel.findAnimation("loop")){
                    this.icedModel.setAnimation(0, "loop", true);
                }
                
            });
        });
        
        
        
    }
    StopIcedEffect():void{
        this.icedModel.node.active = false;
    }
    private updateShow():void{
        this.nameLab.string = this.data.Lakesname;
        this.noneMask.active = false;
        this.feedCont.active = false;
        this.ownIcon.active = false;
        this.hotEffect.node.active = PlayerData.GetHotLake(this.data.LakesId);
        let lakeInfo:SFishingLakeData = PlayerData.GetLakeData(this.data.LakesId);
        if(!lakeInfo) return;
        this.feedLab.string = lakeInfo.cost.toString();
        let curRoundInfo:SFishingRoundInfo = PlayerData.CurFishRoundInfo;
        if(curRoundInfo && curRoundInfo.is_open && curRoundInfo.end_time > PlayerData.GetServerTime()){
            this.feedCont.active = true;
            this.ownIcon.active = this.data.LakesId == PlayerData.fishData.player.lake_id && PlayerData.fishData.player.round_cost > 0;
        }else{
            this.noneMask.active = true; 
            this.hotEffect.node.active = false;
        }
    }
    get lakeData():StdLake{
        return this.data;
    }
    
}