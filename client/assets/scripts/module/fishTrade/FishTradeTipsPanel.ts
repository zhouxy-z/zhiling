import { Button, Label, PageView, RichText } from "cc";
import { Panel } from "../../GameRoot";
import { CfgMgr } from "../../manager/CfgMgr";

export class FishTradeTipsPanel extends Panel {
    protected prefab: string = "prefabs/panel/fishTrade/FishTradeTipsPanel";
    private pageView:PageView;
    private openTimeLab:RichText;
    private hellOpenTimeLab:RichText;
    private leftBtn:Button;
    private rightBtn:Button;
    private numLab:Label;
    private curNum:number;
    private maxNum:number;
    protected onLoad(): void {
        this.pageView = this.find("PageView", PageView);
        this.openTimeLab = this.find("PageView/view/content/page1/openTimeLab", RichText);
        this.hellOpenTimeLab = this.find("PageView/view/content/page1/hellOpenTimeLab", RichText);
        this.numLab = this.find("numLab", Label);
        this.leftBtn = this.find("leftBtn", Button);
        this.rightBtn = this.find("rightBtn", Button);
        this.leftBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.rightBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.CloseBy("mask");
        this.CloseBy("closeBtn");
        
        this.pageView.node.on(PageView.EventType.PAGE_TURNING, this.onPageChange, this);
    }
    public flush(...args: any[]): void {
        let openTimeStr:string = "";
        let hellOpenTimeStr:string = "";
        let timeStr:string;
        for (let index = 0; index < CfgMgr.GetFishTradeCommon.KillType.length; index++) {
            timeStr = CfgMgr.GetFishTradeCommon.Opentime[index];
            let killNum:number = CfgMgr.GetFishTradeCommon.KillType[index]; 
            if(killNum > 1){
                if(hellOpenTimeStr != ""){
                    hellOpenTimeStr += "、";
                }
                hellOpenTimeStr += timeStr;
            }else{
                if(openTimeStr != ""){
                    openTimeStr += "、";
                }
                openTimeStr += timeStr;
            }
        }
        this.openTimeLab.string = `变异鱼大冒险开启时间：<color=#25B139>${openTimeStr}</color>`;
        this.hellOpenTimeLab.string = `<color=#762255>地狱模式</color>开放时间：<color=#25B139>${hellOpenTimeStr}</color>`;
        this.curNum = 1;
        this.maxNum = this.pageView.getPages().length;
        this.toPage(this.curNum);
    }

    protected onShow(): void {

    }

    protected onHide(...args: any[]): void {
    }
    private onPageChange():void{
        this.curNum = this.pageView.getCurrentPageIndex() + 1;
        this.toPage(this.curNum);
    }
    private onBtnClick(btn:Button):void{
        switch (btn) {
            case this.leftBtn:
                if(this.curNum > 1) this.curNum --;
                break;
            case this.rightBtn:
                if(this.curNum < this.maxNum) this.curNum ++;
                break;
        }
        this.toPage(this.curNum);
    }
    private toPage(page:number):void{
        this.numLab.string = `${this.curNum}/${this.maxNum}`;
        console.log(this.pageView.getPages().length)
        this.pageView.scrollToPage(page - 1);
    }
    
}