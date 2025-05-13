import { Node, Toggle } from "cc";
import { Panel } from "../../GameRoot";
import { AutoScroller } from "../../utils/AutoScroller";
import { CfgMgr, StdLevel } from "../../manager/CfgMgr";
import { PveAwardItem } from "./PveAwardItem";
import PlayerData from "../../module/roleModule/PlayerData";

export class PveAwardPanel extends Panel {
    protected prefab: string = "prefabs/pve/PveAwardPanel";
    private navBtns:Node[];
    private list:AutoScroller;
    private page: number;
    private type:number;
    private datas:StdLevel[];
    private curLv:number;
    protected onLoad(): void {
        this.navBtns = this.find("navBar/view/content").children.concat();
        this.list = this.find("list", AutoScroller);
        this.list.SetHandle(this.updateAwardItem.bind(this));
        this.CloseBy("mask");
        this.CloseBy("closeBtn");
        for (let btn of this.navBtns) {
            btn.on('toggle', this.onPage, this);
        }
    }
    public flush(): void {
        this.page = -1;
        this.type = 1;
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
        switch (page) {
            case 0: //探险奖励
                this.type = 1;
                this.curLv = PlayerData.pveData.progress;
                break;
            case 1: //扫荡奖励
                this.type = 2;
                let szBattlePower = PlayerData.roleInfo.role_type_max_sum_battle_power || 0;
                let stdInfo:StdLevel = CfgMgr.GetSaoDangLevel(PlayerData.pveData.progress, szBattlePower);
                this.curLv = stdInfo ? stdInfo.ID : 0;
            
                break;
        }
        this.updateAwardList();  
    }
    private updateAwardList():void{
        if(!this.datas){
            this.datas = [];
            let lvMap = CfgMgr.GetLevels();
            for (let key in lvMap) {
                this.datas.push(lvMap[key]); 
            }
        }
        this.list.UpdateDatas(this.datas);
        this.list.ScrollToIndex(Math.max(this.curLv -1, 0));
    }
    private updateAwardItem(item: Node, data: StdLevel):void{
        
        let awardItem = item.getComponent(PveAwardItem) || item.addComponent(PveAwardItem);
        awardItem.SetData(data, this.type, this.curLv, this.datas.length);
    }
}