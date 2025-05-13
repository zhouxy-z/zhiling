import { Node, Toggle } from "cc";
import { Panel } from "../../GameRoot";
import { FishTradeLogPage } from "./FishTradeLogPage";
import { FishTradeKillLogPage } from "./FishTradeKillLogPage";
export class FishTradeLogPanel extends Panel {
    protected prefab: string = "prefabs/panel/fishTrade/FishTradeLogPanel";
    private navBtns:Node[];
    private tradeLogPage:FishTradeLogPage;
    private killLogPage:FishTradeKillLogPage;
    private page: number;
    protected onLoad(): void {
        this.navBtns = this.find("navBar/view/content").children.concat();
        this.tradeLogPage = this.find("tradeLogPage").addComponent(FishTradeLogPage);
        this.killLogPage = this.find("killLogPage").addComponent(FishTradeKillLogPage);
        this.CloseBy("mask");
        this.CloseBy("closeBtn");
        for (let btn of this.navBtns) {
            btn.on('toggle', this.onPage, this);
        }
    }
    public flush(...args: any[]): void {
        this.page = -1;
        this.SetPage(0);
        
    }
    
    protected onShow(): void {
        
    }

    protected onHide(...args: any[]): void {

    }
    
    async SetPage(page: number) {
        if (!this.$hasLoad) await this.initSub;
        if (!this.navBtns[page]) return;
        this.page = undefined;
        this.navBtns[page].getComponent(Toggle).isChecked = true;
        this.onPage(this.navBtns[page].getComponent(Toggle));
    }
    private onPage(t: Toggle):void{
        if (!t.isChecked) return;
        let page = this.navBtns.indexOf(t.node);
        if (page < 0 || page == this.page) return;
        this.page = page;
        this.tradeLogPage.onHide();
        this.killLogPage.onHide();
        switch (page) {
            case 0: //贸易记录
                this.tradeLogPage.onShow();
                break;
            case 1: //打劫记录
                this.killLogPage.onShow();
                break;
        }
    }
    
}