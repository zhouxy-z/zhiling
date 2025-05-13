import { Button, EditBox, js, Label, Node, ProgressBar, RichText, Sprite, UIOpacity, UITransform, Vec3 } from "cc";
import { Panel } from "../../GameRoot";
import { EventMgr, Evt_GuildChange, Evt_GuildMenuShow, Evt_GuildSearch, Evt_Hide_Scene, Evt_Show_Scene } from "../../manager/EventMgr";
import { AutoScroller } from "../../utils/AutoScroller";
import { GuildMemberItem } from "./GuildMemberItem";
import PlayerData, { } from "../roleModule/PlayerData"
 import {SGuild,SGuildMember} from "../roleModule/PlayerStruct";
import { CfgMgr, GuildPostType, StdGuildLevel } from "../../manager/CfgMgr";
import { GuildMenuCont } from "./GuildMenuCont";
import { ClickTipsPanel } from "../common/ClickTipsPanel";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import { MsgPanel } from "../common/MsgPanel";

export class GuildMemberPanel extends Panel {
    protected prefab: string = "prefabs/panel/guild/GuildMemberPanel";
    private memberNumLab:Label;
    private inputName:EditBox;
    private seekBtn:Button;
    private list: AutoScroller;
    private menuBtnCont:GuildMenuCont;
    private data:SGuild;
    private isMyGuild:boolean;
    activeBoxTips: any;
    private members: { [key: string]: SGuildMember } = js.createMap();//成员列表
    protected onLoad(): void {
        this.memberNumLab = this.find("memberNumLab", Label);
        this.inputName = this.node.getChildByPath("seekCont/inputName").getComponent(EditBox);
        this.seekBtn = this.node.getChildByPath("seekCont/seekBtn").getComponent(Button);
        this.list = this.find("list", AutoScroller);
        this.menuBtnCont = this.find("menuBtnCont").addComponent(GuildMenuCont);
        this.menuBtnCont.node.active = false;
        this.list.SetHandle(this.updateItem.bind(this));
        this.seekBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.inputName.node.on(EditBox.EventType.TEXT_CHANGED, this.onEditBoxChanged, this);
        this.inputName.node.on(EditBox.EventType.EDITING_DID_ENDED, this.onEditEnd, this);
        this.CloseBy("closeBtn");
        this.CloseBy("mask");
    }
    public flush(guildData:SGuild): void{
        this.data = guildData;
        this.isMyGuild = PlayerData.MyGuild && PlayerData.MyGuild.guild_id == guildData.guild_id;
        this.updateShow();
        if(!this.isMyGuild){
            Session.Send({type: MsgTypeSend.GuildSearchByID, data:{guild_id_list:[guildData.guild_id], show_member:true}});
        }
    }
    
    protected onShow(): void {
        EventMgr.on(Evt_GuildMenuShow, this.onShowMenu, this);
        EventMgr.on(Evt_GuildChange, this.onGuildChange, this);
        EventMgr.on(Evt_GuildSearch, this.onGuildSearch, this);
    }

    protected onHide(...args: any[]): void {
        this.inputName.string = "";
        EventMgr.off(Evt_GuildMenuShow, this.onShowMenu, this);
        EventMgr.off(Evt_GuildChange, this.onGuildChange, this);
        EventMgr.off(Evt_GuildSearch, this.onGuildSearch, this);
        ClickTipsPanel.Hide();
    }
    private onGuildSearch(datas:SGuild[]):void{
        if(!this.node.activeInHierarchy) return;
        let searchGuild:SGuild;
        for (let index = 0; index < datas.length; index++) {
            searchGuild = datas[index];
            if(searchGuild.guild_id == this.data.guild_id){
                this.members = searchGuild.members;
                break;
            }
        }
        this.updateMemberData(this.members);
    }
    private onEditBoxChanged(editBox: EditBox):void {
        if(editBox.string.length < 1){
            this.updateShow();
        }
        
    }
    private onEditEnd(editBox: EditBox): void {
        if(editBox.string.length < 1){
            this.updateShow();
        }
    }
    private onBtnClick(btn:Button):void{
        switch(btn){
            case this.seekBtn:
                let list:{[key:string]:SGuildMember} = PlayerData.SearchGuildMember(this.inputName.string, this.members);
                let isSeek:boolean = false;
                for (let key in list) {
                    isSeek = true;
                    break;
                }
                if(!isSeek){
                    MsgPanel.Show("找不到该玩家");
                    return;
                }
                this.updateMemberData(list);
                break;
        }
    }
    private onGuildChange():void{
        if(this.isMyGuild && !PlayerData.MyGuild){
            this.Hide();
            
            return;
        }
        this.updateShow();
    }
   
    private onShowMenu(data:SGuildMember, showPos:Vec3, clickTarget:Node):void{
        
        this.menuBtnCont.SetData(data);
        showPos.x -= clickTarget.getComponent(UITransform).width / 2 + 40; 
        //showPos.y -= this.menuBtnCont.node.getComponent(UITransform).height / 2 + 40;
        
        ClickTipsPanel.Show(this.menuBtnCont.node, this.node, clickTarget, showPos, 0);
        //this.menuBtnCont.node.active = true;
        
                
    }
    private updateShow():void{
        let stdLv:StdGuildLevel = CfgMgr.GetGuildLevel(this.data.level);
        this.memberNumLab.string = `${this.data.member_count}/${stdLv.Member}`;
        if(this.isMyGuild){
            this.members = PlayerData.MyGuild.members;
            this.updateMemberData(this.members);
        }else{
            //this.members = this.data.members;
            this.updateMemberData(this.members);
            
        }
        
    }
    private updateMemberData(list:{ [key: string]: SGuildMember }):void{
        let topDatas:SGuildMember[] = [];
        let memberList:SGuildMember[] = [];
        let member:SGuildMember;
        if(!list) list = js.createMap();
        for (let id in list) {
            member = list[id];
            if(member.role < GuildPostType.Member){
                topDatas.push(member);
            }else{
                memberList.push(member);
            }
            
        }
        topDatas.sort((a, b) => {
            return a.role - b.role;
        });
        memberList.sort((a, b) => {
            return a?.level - b?.level;
        });
        let newList:SGuildMember[] = topDatas.concat(memberList);
        this.list.UpdateDatas(newList);
    }
    protected updateItem(item: Node, data: SGuildMember) {
        let memberItem = item.getComponent(GuildMemberItem);
        if (!memberItem) memberItem = item.addComponent(GuildMemberItem);
        memberItem.SetData(data, this.isMyGuild);
    }
}