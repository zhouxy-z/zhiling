import { EventMgr, Evt_Passive_Skill_Update, Evt_Role_Update, Evt_XiLianSkillDataSvaeUpdate, Evt_XiLianSkillDataUpdate, Evt_XiLianSkillLogUpdate } from "../../manager/EventMgr";
import { MsgTypeRet } from "../../MsgType";
import { Session } from "../../net/Session";
import PlayerData, {  } from "../roleModule/PlayerData"
import {SPlayerDataItem, SPlayerDataRole, SPlayerDataSkill} from "../roleModule/PlayerStruct";


export class FanyuXiLianModule {
    constructor() {
        Session.on(MsgTypeRet.RoleSkillShuffleRet, this.onRoleSkillShuffle, this);
        Session.on(MsgTypeRet.RoleSkillShuffleSaveRet, this.RoleSkillShuffleSave, this);
        Session.on(MsgTypeRet.GetRoleSkillShuffleRecordsRet, this.GetRoleSkillShuffleRecords, this);
    }

    /**
     * 洗练结果
     * @param data 
     */
    protected onRoleSkillShuffle(data: { result:{player_id:string, role_id:string, shuffle_id:string,new_passive_skills:SPlayerDataSkill[], new_soldier_num:number}}) {
        if(data.result.new_passive_skills){
            EventMgr.emit(Evt_XiLianSkillDataUpdate, data.result)
        }
    }

    /**保存洗练 */
    private RoleSkillShuffleSave(data:{role:SPlayerDataRole}){
        let role_data = PlayerData.GetRoleById(data.role.id);  
        if(role_data){
            PlayerData.AddRole(data.role);
        }
        EventMgr.emit(Evt_XiLianSkillDataSvaeUpdate, data.role)
    }

    /**查询洗练 */
    private GetRoleSkillShuffleRecords(data: { page:number, total:number, records:{record_timestamp:number, player_id:string, role_id:string, shuffle_id:string,new_passive_skills:SPlayerDataSkill[]}[]}){
        EventMgr.emit(Evt_XiLianSkillLogUpdate, data.records)
    }

   
}