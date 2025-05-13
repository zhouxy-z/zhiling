import { Button, Component, Label} from "cc";
import { ConsumeItem } from "../common/ConsumeItem";
import { SBank, SDeposit, SGuildDepositTotal, SThing} from "../roleModule/PlayerStruct";
import { CfgMgr, StdBank} from "../../manager/CfgMgr";
import { ItemUtil } from "../../utils/ItemUtils";
import { DateUtils } from "../../utils/DateUtils";
import { BankBackInfoPanel } from "./BankBackInfoPanel";
export class BankSvbingsInfoItem extends Component {
    private savingsItem:ConsumeItem;
    private backGetItem:ConsumeItem;
    private helpBtn:Button;
    private endTimeLab:Label;
    private isInit:boolean = false;
    private data:SBank;
    private std:StdBank;
    protected onLoad(): void {
        this.savingsItem = this.node.getChildByName("savingsItem").addComponent(ConsumeItem);
        this.backGetItem = this.node.getChildByName("backGetItem").addComponent(ConsumeItem);
        this.helpBtn = this.node.getChildByName("helpBtn").getComponent(Button);
        this.endTimeLab = this.node.getChildByName("endTimeLab").getComponent(Label);
        this.helpBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.isInit = true;
        this.updateShow();
    }
    private onBtnClick(btn:Button):void{
        switch(btn){
            case this.helpBtn:
                BankBackInfoPanel.Show(this.std, this.data);
                break;
        }
    }
    SetData(data:SBank):void {
        this.data = data;
        this.updateShow();
    }
    
    
    private updateShow():void{
        if(!this.isInit || !this.data) return;
        this.std = CfgMgr.GetBank(Number(this.data.donate_id));
        let itemData:SThing;
        itemData = ItemUtil.CreateThing(this.std.CostType,this.std.CostId, this.std.CostNum);
        this.savingsItem.SetData(itemData);

        itemData = ItemUtil.CreateThing(this.std.CostType, this.std.CostId, CfgMgr.GetBankBackNum(this.std));
        this.backGetItem.SetData(itemData);

        let dates:string[] = DateUtils.TimestampToDate(this.data.expiration_time * 1000, true);
        this.endTimeLab.string = `到期：${dates[0]}-${dates[1]}-${dates[2]}  ${dates[3]}:${dates[4]}:${dates[5]}`;
        
    }
}