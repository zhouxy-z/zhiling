import { Node, Component, math, UITransform, Sprite, Label } from "cc";
export class WorldBossHp extends Component {
    private bar1:Node;
    private bar2:Node;
    private numLab:Label;
    private hpNumLab:Label;
    private defColorList:string[] = ["#F7322C", "#FD710B", "#3FD63C", "#509Aff", "#A530FF"];
    private barNum: number = 0;
    private barMaxVal: number = 0;
    private barMaxWidth: number = 0;
    private curHp: number = 0;
    private maxHp: number = 0;
    private hpRate: number = 1;
    private isInit:boolean = false;
    
    protected onLoad(): void {
        this.bar1 = this.node.getChildByName("bar1");
        this.bar2 = this.node.getChildByName("bar2");
        this.numLab = this.node.getChildByName("numLab").getComponent(Label);
        this.hpNumLab = this.node.getChildByName("hpNumLab").getComponent(Label);
        this.barMaxWidth = this.getBarWidth(this.bar1);
        this.isInit = true;
        this.updateBar();
    }
    /**
     * 设置血条数据
     * @param curHp 当前血量
     * @param maxHp 最大血量
     * @param barNum 血条数量
     */
    public SetData(curHp:number, maxHp:number, barNum:number) {
        this.barNum = barNum;
        this.maxHp = maxHp;
        this.curHp = Math.max(curHp, 0);
        this.barMaxVal = this.barNum > 1 ? this.maxHp / barNum : this.maxHp;
        this.hpRate = this.barMaxWidth / (this.barMaxVal);
        this.updateBar();
    }

    private updateBar():void{
        if(!this.isInit || this.maxHp < 1) return;
        let curBarIndex = this.getCurBarIndex();
        this.setBarColor(this.bar2, curBarIndex);
        let barOffset:number = this.curHp < this.maxHp ? this.curHp % this.barMaxVal : this.barMaxVal;
        this.setBarWidth(this.bar2, barOffset * this.hpRate);
        this.numLab.string = `${this.curHp}/${this.maxHp}`;
        this.hpNumLab.string = `x${curBarIndex + 1}`;
        if(this.barNum > 1 && curBarIndex > 0){
            this.bar1.active = true;
            let nextBarIndex:number = curBarIndex - 1;
            this.setBarColor(this.bar1, nextBarIndex);
            this.setBarWidth(this.bar1, this.barMaxWidth);
        }else{
            this.bar1.active = false;
        }
    }
    
    private setBarColor(bar:Node, index:number):void{
        if(index >= this.defColorList.length){
            index = index % this.defColorList.length;
        }
        bar.getComponent(Sprite).color = math.color(this.defColorList[index]);
    }

    private setBarWidth(bar:Node, width:number):void{
        let trans:UITransform = bar.getComponent(UITransform);
        trans.width = width;
    }

    private getCurBarIndex():number{
        if(this.barNum == 1) return 0; 
        return Math.min(Math.floor(this.curHp / this.barMaxVal), this.barNum - 1);
    }

    private getBarWidth(bar:Node):number{
        let trans:UITransform = bar.getComponent(UITransform);
        return trans.width;
    }

}