import { Button, Label, Node, path, ProgressBar, RichText, Sprite, SpriteFrame } from "cc";
import { Panel } from "../../GameRoot";
import { AutoScroller } from "../../utils/AutoScroller";
import PlayerData, {} from "../roleModule/PlayerData"
 import {SGuild,SGuildApplication,SPlayerDataBuilding} from "../roleModule/PlayerStruct";
import { CfgMgr, GuildPostType, StdEquityList, StdGuildEquity, StdGuildLevel, StdGuildLogo, StdGuildType } from "../../manager/CfgMgr";
import { folder_icon, ResMgr } from "../../manager/ResMgr";
import { GuildPrivilegeItem } from "./GuildPrivilegeItem";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import { MsgPanel } from "../common/MsgPanel";
import { Tips } from "../login/Tips";
import { GuildExitPanel } from "./GuildExitPanel";
import { EventMgr, Evt_GuildChange, Evt_SelfApplyGuildUpdate } from "../../manager/EventMgr";
import { SetNodeGray } from "../common/BaseUI";
import { BuildingType } from "../home/HomeStruct";
import { GuildMemberPanel } from "./GuildMemberPanel";

export class GuildInfoPanel extends Panel {
    protected prefab: string = "prefabs/panel/guild/GuildInfoPanel";
    private logo:Sprite;
    private guildType:Sprite;
    private expPro:ProgressBar;
    private expProLab:Label;
    private nameLab:Label;
    private checkBtn:Button;
    private presidentNameLab:Label;
    private memberLab:Label;
    private lvLab:Label;
    private condLab:Label;
    private noPrivilegeTitleLab:Label;
    private privilegeList:AutoScroller;
    private noticeLab:RichText;
    private btn:Button;
    private btnLab:Label;
    private data:SGuild;
    private applyList:SGuildApplication[];
    protected onLoad(): void {
        
        this.logo = this.find("logo", Sprite);
        this.guildType = this.find("guildType", Sprite);
        this.nameLab = this.find("nameLab", Label);
        this.presidentNameLab = this.find("presidentNameLab", Label);
        this.memberLab = this.find("memberLab", Label);
        this.checkBtn =  this.find("checkBtn", Button);
        this.lvLab = this.find("lvLab", Label);
        this.condLab = this.find("condLab", Label);
        this.noPrivilegeTitleLab = this.find("noPrivilegeTitleLab", Label);
        this.privilegeList = this.find("privilegeList", AutoScroller);
        this.privilegeList.SetHandle(this.updatePrivilegeItem.bind(this));
        this.noticeLab = this.find("noticeLab", RichText);
        this.btn = this.find("btn", Button);
        this.btnLab = this.find("btn/btnLab", Label);
        this.btn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.checkBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.CloseBy("closeBtn");
        this.CloseBy("mask");
    }
    public flush(guildData:SGuild): void{
        this.data = guildData;
        this.applyList = [];
        this.updateShow();
    }
    
    protected onShow(): void {
        Session.Send({ type: MsgTypeSend.GuildGetSelfApplications, data: {} });
        EventMgr.on(Evt_GuildChange, this.onGuildChange, this);
        EventMgr.on(Evt_SelfApplyGuildUpdate, this.onApplyListUpdate, this);
    }

    protected onHide(...args: any[]): void {
        EventMgr.off(Evt_GuildChange, this.onGuildChange, this);
        EventMgr.off(Evt_SelfApplyGuildUpdate, this.onApplyListUpdate, this);
    }
    private onGuildChange():void{
        if(!PlayerData.MyGuild){
            this.Hide();
            return;
        }
        this.updateShow();
    }
    private onApplyListUpdate(list:SGuildApplication[]):void{
        if(!this.node.activeInHierarchy) return;
        this.applyList = list || [];
        this.updateShow();
    }
    private updateShow():void{
        SetNodeGray(this.btn.node, false);
        if(PlayerData.MyGuild && PlayerData.MyGuild.guild_id == this.data.guild_id){
            if(PlayerData.GetGuildMeetPost(PlayerData.roleInfo.player_id, GuildPostType.President))
            {
                this.btnLab.string = "解散公会";
            }else{
                this.btnLab.string = "退出公会";
            }
        }else{
            if(PlayerData.GetGuildIsHaveApply(this.data.guild_id, this.applyList)){
                SetNodeGray(this.btn.node, true);
                this.btnLab.string = "已申请";
            }else{
                SetNodeGray(this.btn.node, PlayerData.MyGuild != null);
                this.btnLab.string = "申请加入";
            }
            
        }
        this.nameLab.string = this.data.name;
        this.presidentNameLab.string = this.data.leader_info.name || "";
        let stdLv:StdGuildLevel = CfgMgr.GetGuildLevel(this.data.level);
        this.memberLab.string = `${this.data.member_count}/${stdLv.Member}`;
        this.lvLab.string = `Lv.${this.data.level}`;
        this.condLab.string = `生命树等级${this.data.join_criteria.min_home_level}级可进入公会`;
        this.noticeLab.string = this.data.announcement.content;
        let stdLogo:StdGuildLogo = CfgMgr.GetGuildLogo(Number(this.data.logo));
        if(stdLogo){
            let url = path.join(folder_icon, `guildLogo/${stdLogo.Logo}`, "spriteFrame");
            ResMgr.LoadResAbSub(url, SpriteFrame, res => {
                this.logo.spriteFrame = res;
            });
        }
        let stdGuildType:StdGuildType = CfgMgr.GetGuildType(this.data.type);
        if(stdGuildType.TypeIconRes && stdGuildType.TypeIconRes.length > 0){
            this.guildType.node.active = true;
            let url = path.join(folder_icon, `guildLogo/${stdGuildType.TypeIconRes}`, "spriteFrame");
            ResMgr.LoadResAbSub(url, SpriteFrame, res => {
                this.guildType.spriteFrame = res;
            });
        }else{
            this.guildType.node.active = false;
        }
        let privilegeDatas:string[] = stdGuildType.PrivilegeDescList||[];
        this.privilegeList.UpdateDatas(privilegeDatas);
        this.noPrivilegeTitleLab.node.active = privilegeDatas.length < 1;
    }
    private onBtnClick(btn: Button): void {
        switch (btn) {
            case this.btn:
                if(PlayerData.MyGuild && PlayerData.MyGuild.guild_id == this.data.guild_id){
                    let tipsStr:string = "";
                    if(PlayerData.GetGuildMeetPost(PlayerData.roleInfo.player_id, GuildPostType.President))
                    {
                        if(PlayerData.MyGuild.member_count > 1){
                            MsgPanel.Show("会长不可退出公会，转让会长后再尝试");
                            return;
                        }
                    }
                    GuildExitPanel.Show(PlayerData.roleInfo.player_id);
                
                }else{
                    let homeBuilds:SPlayerDataBuilding[] = PlayerData.GetBuildingByType(BuildingType.ji_di, 101);
                    if(homeBuilds[0].level < CfgMgr.GetGuildComm().JoinGuildMinHomeLevel){
                        MsgPanel.Show(`生命树等级不足${CfgMgr.GetGuildComm().JoinGuildMinHomeLevel}级申请失败`);
                        return;
                    }
                    Session.Send({type: MsgTypeSend.GuildJoin, data:{guild_id:this.data.guild_id}});
                    this.Hide();
                }
                break;
            case this.checkBtn:
                GuildMemberPanel.Show(this.data);
                break;
        }
    }
    private updatePrivilegeItem(item: Node, data: string, index:number):void{
        let privilegeItem:GuildPrivilegeItem = item.getComponent(GuildPrivilegeItem);
        if(!privilegeItem) privilegeItem = item.addComponent(GuildPrivilegeItem);
        privilegeItem.SetData(data);
        
    }
    
}