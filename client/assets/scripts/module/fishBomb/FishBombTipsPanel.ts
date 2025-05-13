import { Button, Label, PageView, RichText } from "cc";
import { Panel } from "../../GameRoot";
import { CfgMgr } from "../../manager/CfgMgr";
import { GameSet } from "../GameSet";

export class FishBombTipsPanel extends Panel {
    protected prefab: string = "prefabs/panel/fishBomb/FishBombTipsPanel";
    private pageView:PageView;
    private openTimeLab:RichText;
    private pageViewHc:PageView;
    private openTimeLabHc:RichText;
    private leftBtn:Button;
    private rightBtn:Button;
    private numLab:Label;
    private curNum:number;
    private maxNum:number;
    private curPageView:PageView;
    protected onLoad(): void {
        this.pageView = this.find("PageView", PageView);
        this.openTimeLab = this.find("PageView/view/content/page1/openTimeLab", RichText);
        this.pageViewHc = this.find("PageViewHc", PageView);
        this.openTimeLabHc = this.find("PageViewHc/view/content/page1/openTimeLab", RichText);
        this.numLab = this.find("numLab", Label);
        this.leftBtn = this.find("leftBtn", Button);
        this.rightBtn = this.find("rightBtn", Button);
        this.leftBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.rightBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.CloseBy("mask");
        this.CloseBy("closeBtn");
        
        this.pageView.node.on(PageView.EventType.PAGE_TURNING, this.onPageChange, this);
        this.pageViewHc.node.on(PageView.EventType.PAGE_TURNING, this.onPageChange, this);
    }
    public flush(...args: any[]): void {
        let openTimeStr:string = "";
        let hellOpenTimeStr:string = "";
        let timeStr:string;
        let timeList:string[] = CfgMgr.GetFishBombComm.Opentime;
        for (let index = 0; index < timeList.length; index++) {
            timeStr = timeList[index];
            if(openTimeStr != ""){
                openTimeStr += "、";
            }
            openTimeStr += timeStr;
        }
        let openTimeLab:RichText;
        if (GameSet.GetServerMark() == "hc"){
            this.openTimeLabHc.node.active = true;
            this.openTimeLab.node.active = false;
            this.pageView.node.active = false;
            this.pageViewHc.node.active = true;
            this.curPageView = this.pageViewHc;
            openTimeLab = this.openTimeLabHc;
        }else{
            this.openTimeLabHc.node.active = false;
            this.openTimeLab.node.active = true;
            this.pageView.node.active = true;
            this.pageViewHc.node.active = false;
            openTimeLab = this.openTimeLab;
            this.curPageView = this.pageView;
        }
        openTimeLab.string = `炸鱼大作战开启时间：<color=#25B139>${openTimeStr}</color>`;
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