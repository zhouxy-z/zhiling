import { Component, Label} from "cc";
import { StdFishHeroSkill } from "../../manager/CfgMgr";

export class FishingEquipAttrItem extends Component {
    private attrNameLab:Label;
    private attrValLab:Label;
    private isInit:boolean = false;
    private data:{stdSkill:StdFishHeroSkill, value:number};
    protected onLoad(): void {
        this.attrNameLab = this.node.getChildByPath("cont/attrNameLab").getComponent(Label);
        this.attrValLab = this.node.getChildByPath("cont/attrValLab").getComponent(Label);
        this.isInit = true;
        this.updateShow();
    }
    
    SetData(data:{stdSkill:StdFishHeroSkill, value:number}):void{
        this.data = data;
        this.updateShow();
    }
    private updateShow():void{
        if(!this.isInit || !this.data) return;
        this.attrNameLab.string = this.data.stdSkill.Name;
        if(this.data.stdSkill.ShowType == 1){
            this.attrValLab.string = `+${this.data.value.mul(100)}%`;
        }else{
            this.attrValLab.string = `+${this.data.value}`;
        }
        
    }
}