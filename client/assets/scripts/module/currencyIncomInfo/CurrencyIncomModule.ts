import { MsgTypeRet, MsgTypeSend } from "../../MsgType";
import { EventMgr, Evt_CurrencyIncomInfoUpdate } from "../../manager/EventMgr";
import { Session } from "../../net/Session";
import {  } from "../roleModule/PlayerData"
 import {SQueryThing} from "../roleModule/PlayerStruct";

export class CurrencyIncomModule {
    constructor() {
        Session.on(MsgTypeRet.QueryThingRecordsRet, this.queryThingRecords, this);
    }

    /**获取货币流水 */
    private queryThingRecords(data:{records:SQueryThing[]}) {
        console.log(data)
        EventMgr.emit(Evt_CurrencyIncomInfoUpdate,data.records);
    }

  
}