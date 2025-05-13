import { Component, Label} from "cc";
import { ConsumeItem } from "../common/ConsumeItem";
import { SDeposit, SGuildDepositTotal, SThing } from "../roleModule/PlayerStruct";
import { ItemUtil } from "../../utils/ItemUtils";
import { CfgMgr, StdGuildBank, StdGuildBankType } from "../../manager/CfgMgr";
import PlayerData from "../roleModule/PlayerData";
import { DateUtils } from "../../utils/DateUtils";
import { formatNumber } from "../../utils/Utils";
export class GuildSvbingsInfoItem extends Component {
    private savingsItem:ConsumeItem;
    private interestLab:Label;
    private dayItem:ConsumeItem;
    private endTimeLab:Label;
    private isInit:boolean = false;
    private data:SDeposit;
    private stdGuildBank:StdGuildBank;
    private totalsMap:{[key:string]:SGuildDepositTotal};
    private curDeposit:SGuildDepositTotal;
    protected onLoad(): void {
        this.savingsItem = this.node.getChildByName("savingsItem").addComponent(ConsumeItem);
        this.interestLab = this.node.getChildByName("interestLab").getComponent(Label);
        this.dayItem = this.node.getChildByName("dayItem").addComponent(ConsumeItem);
        this.endTimeLab = this.node.getChildByName("endTimeLab").getComponent(Label);
        this.isInit = true;
        
        this.updateShow();
    }
    
    SetData(data:SDeposit, totalsMap:{[key:string]:SGuildDepositTotal}) {
        this.data = data;
        this.totalsMap = totalsMap;
        this.updateShow();
    }
    
    
    private updateShow():void{
        if(!this.isInit || !this.data) return;
        this.stdGuildBank = CfgMgr.GetGuildSavings(Number(this.data.donate_id));
        let itemData:SThing = ItemUtil.CreateThing(this.data.cost_type,0, this.data.amount);
        this.savingsItem.SetData(itemData);
        this.curDeposit = this.totalsMap[this.data.cost_type];
        let totalAddRate:number[] = CfgMgr.GetGuildSavingsTotalRate(this.stdGuildBank.DonateId, this.curDeposit.total_amount, PlayerData.GetMyGuildLimit().ID);
        let myRate:number = CfgMgr.GetGuildSavingsRate(this.stdGuildBank.DonateId, PlayerData.MyGuild.type, PlayerData.GetMyGuildLimit().ID);
        if(totalAddRate) myRate += totalAddRate[1];
        this.interestLab.string = `${formatNumber(myRate,2)}%`;

        let stdGuildBankType:StdGuildBankType = CfgMgr.GetGuildBankType(this.data.cost_type);
        let dayVal:number = this.data.amount * myRate / 100;
        itemData = ItemUtil.CreateThing(stdGuildBankType.Rebate_type, 0, dayVal);
        this.dayItem.SetData(itemData);
        let dates:string[] = DateUtils.TimestampToDate(this.data.expiration_time * 1000, true);
        this.endTimeLab.string = `到期：${dates[0]}-${dates[1]}-${dates[2]}  ${dates[3]}:${dates[4]}:${dates[5]}`;
    }
}