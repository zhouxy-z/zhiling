import { EventMgr, Evt_Jinghua_Role, Evt_Passive_Skill_Update, Evt_Role_Update } from "../../manager/EventMgr";
import { MsgTypeRet } from "../../MsgType";
import { Session } from "../../net/Session";
import PlayerData, {  } from "../roleModule/PlayerData"
import {SPlayerDataItem, SPlayerDataRole} from "../roleModule/PlayerStruct";



export class FanyuJinHuaModule {
    constructor() {
        Session.on(MsgTypeRet.RoleTypeUpgradeRet, this.onJinHuaRet, this);
    }
    /**
     * 进化结果
     * @param data 
     */
    protected onJinHuaRet(data: { role: SPlayerDataRole, up_role: SPlayerDataRole}) {
        PlayerData.DelRole(data.role.id);
        if (data.up_role) {
            // PlayerData.AddRole(data.up_role);
            // EventMgr.emit(Evt_Role_Update, data.role);
        } else {
            console.log(`进化失败`);
        }
        EventMgr.emit(Evt_Jinghua_Role,data);
    }
}