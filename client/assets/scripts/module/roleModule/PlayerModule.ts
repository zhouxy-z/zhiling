// ItemChangePush
import { MsgTypeRet } from "../../MsgType";
import { CfgMgr, StdRoleLevel } from "../../manager/CfgMgr";
import { EventMgr, Evt_ConfigData_Update, Evt_FightChange, Evt_Item_Change, Evt_Passive_Skill_Update, Evt_PlayerBaseInfoChange, Evt_Role_Upgrade } from "../../manager/EventMgr";
import { SyncGameData } from "../../net/MsgProxy";
import { Session } from "../../net/Session";
import { BeforeGameUtils } from "../../utils/BeforeGameUtils";
import Logger from "../../utils/Logger";
import { Second } from "../../utils/Utils";
import { GameSet } from "../GameSet";
import { MsgPanel } from "../common/MsgPanel";
import { RewardTips } from "../common/RewardTips";
import { ShowHeroPanel } from "../common/ShowHeroPanel";
import { CardType } from "../home/panel/Card";
import { HomeUI } from "../home/panel/HomeUI";
import { Tips } from "../login/Tips";
import { RoleTuPoPanel } from "../role/RoleTuPoPanel";
import { RoleTuPoResultPanel } from "../role/RoleTuPoResultPanel";
import { SettingPasswordPanel } from "../setting/SettingPasswordPanel";
import { SettingPasswordSuccessPanel } from "../setting/SettingPasswordSuccessPanel";
import { UserInfoPanel } from "../userInfo/UserInfoPanel";
import PlayerData, {} from "./PlayerData"
 import {SPlayerDataItem, SPlayerDataRole,SPlayerDataSkill,SPlayerViewInfo} from "./PlayerStruct";
/**修改玩家基础信息错误码类型*/
enum ChangeBaseInfoErrorCodeType {
    ErrorInvalidNameLength    = 100, // 名字长度不合法
	ErrorInvalidContactWechat = 101, // 微信号码不合法
	ErrorInvalidContactQQ     = 102, // QQ号码不合法
	ErrorNameExists           = 103, // 名字已经存在
	ErrorNameSuspect          = 104, // 名字包含敏感词
	ErrorContactWechatSuspect = 105, // 微信号包含敏感词
}
export class PlayerModule {
    private tick = 0;
    private changeBaseInfoErrorStr:{[key: string]: string} = BeforeGameUtils.toHashMapObj(
        ChangeBaseInfoErrorCodeType.ErrorInvalidNameLength,"名字长度不合法",
        ChangeBaseInfoErrorCodeType.ErrorInvalidContactWechat,"微信号码不合法",
        ChangeBaseInfoErrorCodeType.ErrorInvalidContactQQ,"QQ号码不合法",
        ChangeBaseInfoErrorCodeType.ErrorNameExists,"名字已经存在",
        ChangeBaseInfoErrorCodeType.ErrorNameSuspect,"名字包含敏感词",
        ChangeBaseInfoErrorCodeType.ErrorContactWechatSuspect,"微信号包含敏感词",
        
    );
    constructor() {
        Session.on(MsgTypeRet.TotalBattlePowerChangePush, this.onPlayerPower, this);
        Session.on(MsgTypeRet.UpgradeRoleRet, this.onUpgradeRoleRet, this);
        Session.on(MsgTypeRet.SetConfigDataRet, this.onUpdateRoleCfg, this);
        Session.on(MsgTypeRet.UpgradePassiveSkillRet, this.onUpgradePassiveSkill, this);
        Session.on(MsgTypeRet.GetPlayerViewInfoRet, this.onGetPlayerViewInfoRet, this);
        Session.on(MsgTypeRet.ChangeNameRet, this.onChangeNameRet, this);
        Session.on(MsgTypeRet.ChangeContactQQRet, this.onChangeContactQQRet, this);
        Session.on(MsgTypeRet.ChangeContactWechatRet, this.onChangeContactWechatRet, this);
        Session.on(MsgTypeRet.ResetRoleRet, this.onResetRoleRet, this);
        Session.on(MsgTypeRet.RoleTypeMaxSumBattlePowerChangePush, this.onRoleTypeMaxSumBattlePowerChange, this);
        Session.on(MsgTypeRet.ResetPasswordSendRet, this.onResetPasswordSendRet, this);
        Session.on(MsgTypeRet.ResetPasswordValidRet, this.onResetPasswordValidRet, this);
        Session.on(MsgTypeRet.RoleActiveSkillUpgradeRet, this.onRoleActiveSkillUpgrade, this);
        GameSet.RegisterUpdate(this.update, this);
    }

    protected fightChangeOff = false;
    protected async onPlayerPower(data: { total_battle_power: number, change_battle_power: number }) {
        PlayerData.roleInfo.battle_power = data.total_battle_power;
        if (this.fightChangeOff) return;
        this.fightChangeOff = true;
        await Second(0.1);
        this.fightChangeOff = false;
        EventMgr.emit(Evt_FightChange);
    }

    private onRoleTypeMaxSumBattlePowerChange(data: { role_type_max_sum_battle_power: number}) {
        PlayerData.roleInfo.role_type_max_sum_battle_power = data.role_type_max_sum_battle_power;
    }

    private onUpgradeRoleRet(data: { role: SPlayerDataRole }): void {
        let old:SPlayerDataRole = JSON.parse(JSON.stringify(PlayerData.GetRoleById(data.role.id)));
        PlayerData.AddRole(data.role);
        let isUpgrade: boolean = false;
        //升级或突破
        if (data.role.level > old.level) {
            let stdLv: StdRoleLevel = CfgMgr.GetRoleLevel(old.type, old.level);
            //突破
            if (stdLv && stdLv.BreakItem && stdLv.BreakItem.length > 0) {
                RoleTuPoResultPanel.Show(data.role.id, true);
            } else {
                isUpgrade = true;
            }
        }
        
        EventMgr.emit(Evt_Role_Upgrade, data.role.id, isUpgrade);
    }

    private onUpdateRoleCfg(data: { config_data: { [key: number]: number } }) {
        PlayerData.roleInfo.config_data = data.config_data;
        if (SyncGameData(data.config_data)) EventMgr.emit(Evt_ConfigData_Update);
    }
    private onUpgradePassiveSkill(data: { role: SPlayerDataRole }): void {
        PlayerData.AddRole(data.role);
        EventMgr.emit(Evt_Passive_Skill_Update, data.role.id);
    }

    private onRoleActiveSkillUpgrade(data:  SPlayerDataRole ): void {
        PlayerData.AddRole(data);
        EventMgr.emit(Evt_Passive_Skill_Update, data.id);
    }
    private onGetPlayerViewInfoRet(data: {code: number, player_view_info:SPlayerViewInfo}):void{
        if(data.code == 0){
            UserInfoPanel.Show(data.player_view_info);
        }
    }
    private update(dt: number) {
        this.tick += dt;
        if (this.tick >= 1) {
            this.tick = 0;
            const timeMap = PlayerData.CycleTimeMap;
            if (!timeMap) return;
            let now = PlayerData.serverTime;
            for (let k in timeMap) {
                let t = Number(k);
                let start = timeMap[k];
                if (now - start >= t) {
                    timeMap[k] = now;
                    // 此处运行更新数据,t表示时间间隔(秒)

                }
            }
        }
    }
    private onChangeNameRet(data: {code: number, name:string, name_changed_times:number}):void{
        if(data.code){
            this.showChangeInfoErrorCode(data.code);
            return;
        } 
        PlayerData.roleInfo.name = data.name;
        PlayerData.roleInfo.name_changed_times = data.name_changed_times;
        this.onChangeBaseInfo();
    }
    private onChangeContactQQRet(data: {code: number, name:string, contact_qq:string}):void{
        if(data.code){
            this.showChangeInfoErrorCode(data.code);
            return;
        } 
        PlayerData.roleInfo.contact_qq = data.contact_qq;
        this.onChangeBaseInfo();
    }
    private onChangeContactWechatRet(data: {code: number, contact_wechat:string}):void{
        if(data.code){
            this.showChangeInfoErrorCode(data.code);
            return;
        } 
        PlayerData.roleInfo.contact_wechat = data.contact_wechat;
        this.onChangeBaseInfo();
    }
    private onResetRoleRet(data: {role:SPlayerDataRole, return_items:SPlayerDataItem[]}):void{
        if(!data.role) return;
        PlayerData.AddRole(data.role);
        EventMgr.emit(Evt_Role_Upgrade, data.role.id);
        ShowHeroPanel.Show(data.role, null, CardType.ResetRoleLv, ()=>{
            if(data.return_items && data.return_items.length){
                RewardTips.Show(data.return_items);
            }
            
        });
    }
    private onResetPasswordSendRet(data: {code: number, msg: string}):void{
        if(data.code > 0){
            Tips.Show(data.msg);
            return;
        }
        MsgPanel.Show("验证码已下发")
    }
    private onResetPasswordValidRet(data: {code: number, msg: string}):void{
        if(data.code > 0){
            Tips.Show(data.msg);
            return;
        }
        SettingPasswordSuccessPanel.Show();
        SettingPasswordPanel.Hide();
        PlayerData.roleInfo.is_password = true;
    }
    private showChangeInfoErrorCode(code:number):void{
        let errorStr:string = this.changeBaseInfoErrorStr[code];
        if(errorStr){
            MsgPanel.Show(errorStr);
        }
        
    }
    private timeNumber:any = null;
    private onChangeBaseInfo():void{
        this.clearTime();
        this.timeNumber = setTimeout(()=>{
            MsgPanel.Show(`修改成功！`);
            this.clearTime();
            EventMgr.emit(Evt_PlayerBaseInfoChange);
        }, 200);
    }
    private clearTime():void{
        if(this.timeNumber){
            clearTimeout(this.timeNumber);
            this.timeNumber = null;
        }
    }
}
