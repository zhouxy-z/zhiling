import { _decorator, UITransform, Node, Toggle, Layout, HorizontalTextAlignment, Vec3, sp, path, ScrollView, instantiate, Input, Label } from 'cc';
import { Panel } from '../../GameRoot';
import { } from '../roleModule/PlayerData'
 import {SThing} from '../roleModule/PlayerStruct';
import { ResMgr } from '../../manager/ResMgr';
import { Second } from '../../utils/Utils';
import { AudioMgr, Audio_GetReward } from '../../manager/AudioMgr';
import { GameSet } from '../GameSet';

export class RewardPanel extends Panel {
    protected prefab: string = "prefabs/ui/RewardPanel";

    private eff_tittle:sp.Skeleton
    private eff_bg:sp.Skeleton
    private eff_box:sp.Skeleton
    private getBtn:Node;
    private continueBtn:Node;
    protected initW: number;
    protected initH: number;
    private data: SThing[]
    private callBack1:Function;
    private callBack2:Function;
    private count:Label
    private taizi:Node;
    private newyear:Node
    private is_new_year:boolean
    protected onLoad(): void {
        this.getBtn = this.find(`Node/getBtn`)
        this.continueBtn = this.find(`Node/continueBtn`)
        this.taizi = this.find(`Node/taizi`)
        this.newyear = this.find(`Node/new_year`)
        this.eff_tittle = this.find("Node/eff_tittle",sp.Skeleton);
        this.eff_bg = this.find("Node/eff_bg",sp.Skeleton);
        this.eff_box = this.find("Node/taizi/eff_box",sp.Skeleton);
        this.count = this.find("Node/num_bg/count",Label);
        this.getBtn.on(Input.EventType.TOUCH_START, this.onGet,this);
        this.continueBtn.on(Input.EventType.TOUCH_START, this.onCcontinue,this);
    }
    protected onShow(): void {
    }
    public async flush(datas: SThing[],  callBack1?:Function, callBack2?:Function, is_new_year?:boolean) {       
        this.callBack1 = callBack1;
        this.callBack2 = callBack2;
        this.is_new_year = is_new_year;
        this.data = datas;
        this.count.string = this.data[0].currency.value + "";
        this.taizi.active = !is_new_year
        this.newyear.active = is_new_year;
        if(!is_new_year){
            let eff_box_hc = this.find("Node/taizi/eff_box_hc",sp.Skeleton);
            let eff_box = this.find("Node/taizi/eff_box",sp.Skeleton);
            if (GameSet.GetServerMark() == "hc") {
                eff_box.node.active = false;
                eff_box_hc.node.active = true;
                this.eff_box = eff_box_hc;
            } else {
                eff_box.node.active = true;
                eff_box_hc.node.active = false;
                this.eff_box = eff_box;
            } 
        }
        this.showEffect();   
    }

    private showTittleEffect(){
        this.eff_tittle.setAnimation(0,"Loop",true)  
    }
    private showBgEffect(){
        this.eff_bg.setAnimation(0,"Loop",true)
    }
    private showBoxEffect(){
        this.eff_box.setAnimation(0,"Idle",true);
    }
    private async showEffect(){
        AudioMgr.PlayOnce(Audio_GetReward);
        this.eff_tittle.skeletonData = await ResMgr.LoadResAbSub(path.join("spine/effect", "ui_congratulationstitle", "ui_congratulationstitle"), sp.SkeletonData);
        this.eff_tittle.setAnimation(0,"Start",false)
        this.eff_tittle.setTrackCompleteListener(this.eff_tittle.setAnimation(0,"Start",false), this.showTittleEffect.bind(this))
        this.eff_bg.skeletonData = await ResMgr.LoadResAbSub(path.join("spine/effect", "ui_emissionlight", "ui_emissionlight"), sp.SkeletonData);
        this.eff_bg.setAnimation(0,"Start",false)
        this.eff_bg.setTrackCompleteListener(this.eff_bg.setAnimation(0,"Start",false), this.showBgEffect.bind(this))
        if(!this.is_new_year){
            this.eff_box.setAnimation(0,"Start",false)
            let spine_path = "ui_Synthetic_workshop_gemstone";
            if(GameSet.GetServerMark() == "hc"){
                spine_path = "ui_hcs_02";
            }else if(GameSet.GetServerMark() == "xf"){
                spine_path = "ui_HCS_02_xf";
            }
            this.eff_box.skeletonData = await ResMgr.LoadResAbSub(path.join("spine/effect", spine_path, spine_path), sp.SkeletonData);
            this.eff_box.setTrackCompleteListener(this.eff_box.setAnimation(0,"Start",false), this.showBoxEffect.bind(this))
        }
        
    }


    protected onHide(...args: any[]): void {
        if(!this.is_new_year){
            this.eff_box.setAnimation(0,"Start",false)
        }
        this.eff_tittle.setAnimation(0,"Start",false)
        this.eff_bg.setAnimation(0,"Start",false)
    }

    private onGet(){
        if(this.callBack1) this.callBack1();
        this.Hide();
    }

    private onCcontinue(){
        if(this.callBack2) this.callBack2();
        this.Hide();
    }
}


