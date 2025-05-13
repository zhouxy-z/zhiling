import { EventMgr, Evt_BankUpdate } from "../../manager/EventMgr";
import { MsgTypeRet } from "../../MsgType";
import { Session } from "../../net/Session";
import { BeforeGameUtils } from "../../utils/BeforeGameUtils";
import { MsgPanel } from "../common/MsgPanel";
import { SBank, SBankTotal } from "../roleModule/PlayerStruct";
import { BankSelectPanel } from "./BankSelectPanel";

/**错误码类型*/
enum ErrorCodeType {
    PbCodeInvalidParams                  = 400, // 参数错误
	PbCodeNoConfig                       = 300, // 功能未开启（实际上是配置未找到）
	PbCodeDepositNotArrivedRequiredLevel = 301, // 存款类型所需家园等级不符合要求
	PbCodeDepositChargebackFailed        = 304, // 存款扣款失败
	PbCodeDepositTooManyTimes            = 305, // 存款次数超出上限
	PbCodeDepositOnSettling              = 306, //存款结算中，结算期间不能存款
    PbCodeDepositNoPrivilege             = 308, // 需要相关权益才能进行存储！
	PbCodeSysErr                         = 500, // 服务器内部逻辑报错
}

export class BankModule{
    private errorStr:{[key: string]: string} = BeforeGameUtils.toHashMapObj(
        ErrorCodeType.PbCodeInvalidParams,"参数错误",
        ErrorCodeType.PbCodeNoConfig,"功能未开启（实际上是配置未找到）",
        ErrorCodeType.PbCodeDepositNotArrivedRequiredLevel,"存款类型所需家园等级不符合要求",
        ErrorCodeType.PbCodeDepositChargebackFailed,"存款扣款失败",
        ErrorCodeType.PbCodeDepositTooManyTimes,"存款次数超出上限",
        ErrorCodeType.PbCodeDepositOnSettling,"存款结算中，结算期间不能存款",
        ErrorCodeType.PbCodeDepositNoPrivilege,"需要相关权益才能进行存储！",
        ErrorCodeType.PbCodeSysErr,"服务器内部逻辑报错",
        
    );
    
    constructor() {
        Session.on(MsgTypeRet.FlexibleBankGetDepositInfosRet, this.onFlexibleBankGetDepositInfosRet, this);
        Session.on(MsgTypeRet.FlexibleBankDepositRet, this.onFlexibleBankDepositRet, this);
        
    }
    private onFlexibleBankGetDepositInfosRet(data:{code:number, list:SBank[], totals:{[key:string]:SBankTotal}}):void{
        if(data.code){
            this.showErrorCode(data.code);
            return;
        }
        EventMgr.emit(Evt_BankUpdate, data.list || [], data.totals);
    }
    private onFlexibleBankDepositRet(data:{code:number, list:SBank[], totals:{[key:string]:SBankTotal}}):void{
        if(data.code){
            this.showErrorCode(data.code);
            return;
        }
        if(data.list && data.list.length){
            MsgPanel.Show(`储蓄成功！`);
            BankSelectPanel.Hide();
            EventMgr.emit(Evt_BankUpdate, data.list || [], data.totals);
        }
        
    }
    private showErrorCode(code:number):void{
        let errorStr:string = this.errorStr[code];
        if(errorStr){
            MsgPanel.Show(errorStr);
        }
        
    }
    
}