import { Node, Toggle } from "cc";
import { Panel } from "../../GameRoot";
import { EventMgr, Evt_FishBombLogDataUpdate } from "../../manager/EventMgr";
import {  } from "../roleModule/PlayerData"
 import {SFishBombLogDataRet} from "../roleModule/PlayerStruct";
import { FishBombLogPage } from "./FishBombLogPage";
import { FishBombRecentLogPage } from "./FishBombRecentLogPage";

export class FishBombLogPanel extends Panel {
    protected prefab: string = "prefabs/panel/fishBomb/FishBombLogPanel";
    private navBtns:Node[];
    private fishBombLogPage:FishBombLogPage;
    private fishBombRecentLogPage:FishBombRecentLogPage;
    private page: number;
    protected onLoad(): void {
        this.navBtns = this.find("navBar/view/content").children.concat();
        this.fishBombLogPage = this.find("fishBombLogPage").addComponent(FishBombLogPage);
        this.fishBombRecentLogPage = this.find("fishBombRecentLogPage").addComponent(FishBombRecentLogPage);
        this.CloseBy("mask");
        this.CloseBy("closeBtn");
        for (let btn of this.navBtns) {
            btn.on('toggle', this.onPage, this);
        }
        
    }
    public async flush(...args: any[]): Promise<void> {
        
        this.page = -1;
        this.SetPage(0);
        
    }
    
    protected onShow(): void {
        
    }

    protected onHide(...args: any[]): void {
        this.fishBombLogPage.onHide();
        this.fishBombRecentLogPage.onHide();
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
        this.fishBombLogPage.onHide();
        this.fishBombRecentLogPage.onHide();
        switch (page) {
            case 0: //炸鱼记录
                this.fishBombLogPage.onShow();
                break;
            case 1: //击杀记录
                this.fishBombRecentLogPage.onShow();
                break;
        }
    }
    
}