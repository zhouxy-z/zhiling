import { Button, Component, EventTouch, Input, Node } from "cc";
import { TradeHeroPanel } from "../trade/TradeHeroPanel";
import {  } from "../roleModule/PlayerData"
 import {SPlayerDataRole} from "../roleModule/PlayerStruct";
import { GameSet } from "../GameSet";
import { EventMgr, Evt_RightsToPage } from "../../manager/EventMgr";

export class RightsGiftPage extends Component {
    private buyBtn:Button;
    private car_item:Node[];
    private isInit:boolean = false;
    protected onLoad(): void {
        this.buyBtn = this.node.getChildByName("buyBtn").getComponent(Button);
        this.buyBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);

        this.car_item = this.node.getChildByPath("reward3/rewar2ScrollView/view/content").children.concat();
        for (let btn of this.car_item) {
            btn.on(Input.EventType.TOUCH_END, this.onRoleInfoShow, this);
        } 
        this.isInit = true;
        this.updateShow();
    }

    onShow():void{
        this.node.active = true;
        this.updateShow();
    }
    onHide():void{
        this.node.active = false;
        
    }
    private updateShow():void{
        if(!this.isInit) return;
        let server = GameSet.Server_cfg;
        if(server && server.Mark){
            this.buyBtn.node.active = true; 
        }else{
            this.buyBtn.node.active = false;
        }
    }
    private onRoleInfoShow(event:EventTouch){
        let index = event.currentTarget.getSiblingIndex();
        let type = [108, 113, 109, 107, 111, 112, 110];
        let role:SPlayerDataRole = {
            id: "",
            type: type[index],
            level: 1,
            experience: 0,
            soldier_num: 0,
            active_skills: [],
            passive_skills: [],
            is_in_building: false,
            building_id: 0,
            battle_power: 0,
            quality: 1,
            skills: [],
            is_assisting: false,
            is_in_attack_lineup: false,
            is_in_defense_lineup: false,
            trade_cd: 0
        }
        TradeHeroPanel.Show(role) 
    }
    private onBtnClick(btn:Button): void {
        switch(btn){
            case this.buyBtn:
                EventMgr.emit(Evt_RightsToPage);
                break;
        }
    }
    
}