import { Button, Label, PageView, RichText } from "cc";
import { Panel } from "../../GameRoot";
import { CfgMgr } from "../../manager/CfgMgr";
import { GameSet } from "../GameSet";

export class FishingTipsPanel extends Panel {
    protected prefab: string = "prefabs/panel/fishing/FishingTipsPanel";
    private pageView:PageView;
    private openTimeLab:RichText;
    private hellOpenTimeLab:RichText;
    private pageViewHc:PageView;
    private openTimeLabHc:RichText;
    private hellOpenTimeLabHc:RichText;
    private pageViewXF:PageView;
    private openTimeLabXF:RichText;
    private hellOpenTimeLabXF:RichText;
    private leftBtn:Button;
    private rightBtn:Button;
    private numLab:Label;
    private curNum:number;
    private maxNum:number;
    private curPageView:PageView;
    protected onLoad(): void {
        this.pageView = this.find("PageView", PageView);
        this.openTimeLab = this.find("PageView/view/content/page1/openTimeLab", RichText);
        this.hellOpenTimeLab = this.find("PageView/view/content/page1/hellOpenTimeLab", RichText);
        this.pageViewHc = this.find("PageViewHc", PageView);
        this.openTimeLabHc = this.find("PageViewHc/view/content/page1/openTimeLab", RichText);
        this.hellOpenTimeLabHc = this.find("PageViewHc/view/content/page1/hellOpenTimeLab", RichText);
        this.pageViewXF = this.find("PageViewXF", PageView);
        this.openTimeLabXF = this.find("PageViewXF/view/content/page1/openTimeLab", RichText);
        this.hellOpenTimeLabXF = this.find("PageViewXF/view/content/page1/hellOpenTimeLab", RichText);
        this.numLab = this.find("numLab", Label);
        this.leftBtn = this.find("leftBtn", Button);
        this.rightBtn = this.find("rightBtn", Button);
        this.leftBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.rightBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.CloseBy("mask");
        this.CloseBy("closeBtn");
        
        this.pageView.node.on(PageView.EventType.PAGE_TURNING, this.onPageChange, this);
        this.pageViewHc.node.on(PageView.EventType.PAGE_TURNING, this.onPageChange, this);
        this.pageViewXF.node.on(PageView.EventType.PAGE_TURNING, this.onPageChange, this);
    }
    public flush(...args: any[]): void {
        let openTimeStr:string = "";
        let hellOpenTimeStr:string = "";
        let timeStr:string;
        for (let index = 0; index < CfgMgr.GetFishCommon.KillType.length; index++) {
            timeStr = CfgMgr.GetFishCommon.Opentime[index];
            let killNum:number = CfgMgr.GetFishCommon.KillType[index]; 
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
        let openTimeLab:RichText;
        let hellOpenTimeLab:RichText;

        this.openTimeLabHc.node.active = false;
        this.hellOpenTimeLabHc.node.active = false;
        this.openTimeLab.node.active = false;
        this.hellOpenTimeLab.node.active = false;
        this.openTimeLabXF.node.active = false;
        this.hellOpenTimeLabXF.node.active = false;
        this.pageView.node.active = false;
        this.pageViewHc.node.active = true;
        this.pageViewXF.node.active = true;
        if (GameSet.GetServerMark() == "hc"){
            this.openTimeLabHc.node.active = true;
            this.hellOpenTimeLabHc.node.active = true;
            this.pageViewHc.node.active = true;
            this.curPageView = this.pageViewHc;
            openTimeLab = this.openTimeLabHc;
            hellOpenTimeLab = this.hellOpenTimeLabHc;
        }else if (GameSet.GetServerMark() == "xf"){
            this.openTimeLabXF.node.active = true;
            this.hellOpenTimeLabXF.node.active = true;
            this.pageViewXF.node.active = true;
            this.curPageView = this.pageViewXF;
            openTimeLab = this.openTimeLabXF;
            hellOpenTimeLab = this.hellOpenTimeLabXF;
        }else{
            this.openTimeLab.node.active = true;
            this.hellOpenTimeLab.node.active = true;
            this.pageView.node.active = true;
            openTimeLab = this.openTimeLab;
            hellOpenTimeLab = this.hellOpenTimeLab;
            this.curPageView = this.pageView;
        }
        openTimeLab.string = `普通模式开放时间：<color=#25B139>${openTimeStr}</color>`;
        hellOpenTimeLab.string = `<color=#762255>地狱模式</color>开放时间：<color=#25B139>${hellOpenTimeStr}</color>`;
        this.curNum = 1;
        this.maxNum = this.curPageView.getPages().length;
        this.toPage(this.curNum);
    }

    protected onShow(): void {

    }

    protected onHide(...args: any[]): void {
    }
    private onPageChange():void{
        this.curNum = this.curPageView.getCurrentPageIndex() + 1;
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
        this.curPageView.scrollToPage(page - 1);
    }
    
}