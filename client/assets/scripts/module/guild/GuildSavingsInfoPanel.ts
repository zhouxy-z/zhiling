import { Node } from "cc";
import { Panel } from "../../GameRoot";
import { AutoScroller } from "../../utils/AutoScroller";
import PlayerData, {  } from "../roleModule/PlayerData"
 import {SDeposit, SGuildApplication, SGuildDepositTotal} from "../roleModule/PlayerStruct";
import { EventMgr, Evt_GuildChange } from "../../manager/EventMgr";
import { GuildSvbingsInfoItem } from "./GuildSavingsInfoItem";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";

export class GuildSavingsInfoPanel extends Panel {
    protected prefab: string = "prefabs/panel/guild/GuildSavingsInfoPanel";
    private list: AutoScroller;
    private noneListCont:Node;
    private datas:SDeposit[] = [];
    private totalsMap:{[key:string]:SGuildDepositTotal};
    protected onLoad(): void {
        this.list = this.find("list", AutoScroller);
        this.list.SetHandle(this.updateItem.bind(this));
        this.noneListCont = this.find("noneListCont");
        this.CloseBy("closeBtn");
        this.CloseBy("mask");
    }
    public flush(datas:SDeposit[], totalsMap:{[key:string]:SGuildDepositTotal}): void{
        this.datas = datas;
        this.totalsMap = totalsMap;
        this.updateShow();
    }
    
    protected onShow(): void {
        this.datas = [];
        //Session.Send({ type: MsgTypeSend.GuildGetApplications, data: {guild_id:PlayerData.MyGuild.guild_id} });
       
        EventMgr.on(Evt_GuildChange, this.onGuildChange, this);
    }

    protected onHide(...args: any[]): void {
        EventMgr.off(Evt_GuildChange, this.onGuildChange, this);
    }
    private onGuildChange():void{
        if(!this.node.activeInHierarchy) return;
        if(!PlayerData.MyGuild){
            this.Hide();
        }
    }
   
    private updateShow():void{
        this.list.UpdateDatas(this.datas);
        this.noneListCont.active = this.datas.length < 1;
    }
    protected updateItem(item: Node, data: any) {
        let sabingsInfo = item.getComponent(GuildSvbingsInfoItem)||item.addComponent(GuildSvbingsInfoItem);
        sabingsInfo.SetData(data, this.totalsMap);
    }
}