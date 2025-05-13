import { Button, Color, Component, EditBox, EventTouch, Input, Label, Node, ScrollView, Sprite, SpriteFrame, Toggle, find, js, path, sp, tween } from "cc";
import { Panel } from "../../GameRoot";
import PlayerData, {} from "../roleModule/PlayerData"
 import {SPlayerDataItem,SPlayerMailData,SThing} from "../roleModule/PlayerStruct";
import { AutoScroller } from "../../utils/AutoScroller";
import { ResMgr, folder_icon, folder_mail } from "../../manager/ResMgr";
import { EventMgr, Evt_CurrencyIncomInfoUpdate, Evt_Hide_Scene, Evt_Item_Change, Evt_Mail_Add, Evt_Mail_Update, Evt_ReadMail, Evt_Show_Scene } from "../../manager/EventMgr";
import { ToFixed, formatDate, formatK } from "../../utils/Utils";
import { MailContentPanel } from "./MailContentPanel";
import { MsgTypeSend } from "../../MsgType";
import { Session } from "../../net/Session";
import { Tips } from "../login/Tips";
import { AdaptBgTop } from "../common/BaseUI";
import { DateUtils } from "../../utils/DateUtils";
import { AudioMgr, Audio_CommonDelete, Audio_OpenMail } from "../../manager/AudioMgr";
import { CfgMgr, StdCommonType, ThingType } from "../../manager/CfgMgr";
import { CurrencyIncomSortPanel } from "../currencyIncomInfo/CurrencyIncomSortPanel";
import { BagItem } from "../bag/BagItem";
import LocalStorage from "../../utils/LocalStorage";
import { Tips3 } from "../home/panel/Tips3";
import { MsgPanel } from "../common/MsgPanel";
import { GameSet } from "../GameSet";

export class MailPanel extends Panel {
    protected prefab: string = "prefabs/mail/MailPanel";

    protected page = 1;
    protected pageSize = 6;
    protected scroller: AutoScroller;
    private nav: Node[];
    private SendMail: Node;
    private myUidLab:Label;
    private EditBox: EditBox;
    private deletBtn: Node;
    private getAwardBtn: Node;
    private serchBtn: Node;
    private seleteIndex:number = 0;
    private systemList: SPlayerMailData[] = []
    private playerList: SPlayerMailData[] = []
    private empty: Node;
    private content:Node;
    private logNode: Node;
    private logScroller: AutoScroller;

    // private deleteTime1:number;
    // private deleteTime2:number

    private mailLogpage = 1;
    private mailLogDatas: SPlayerMailData[] = [];
    private sortType:number;
    // private time_lock:number

    protected onLoad() {
        this.CloseBy("layout/closeBtn");
        this.nav = this.find(`layout/nav`).children.concat();
        this.scroller = this.find("layout/ScrollView", AutoScroller);
        this.content = this.find(`layout/ScrollView/view/content`);
        this.SendMail = this.find("layout/SendMail");
        this.EditBox = this.find("layout/SendMail/editboxBg/EditBox", EditBox);
        this.myUidLab = this.find("layout/SendMail/myUidLab", Label);
        this.deletBtn = this.find("layout/deletBtn");
        this.getAwardBtn = this.find("layout/getAwardBtn");
        this.serchBtn = this.find("layout/serchBtn");
        this.empty = this.find("layout/empty");
        this.logNode = this.find("layout/logNode");
        this.logScroller = this.find("layout/logNode/logScrollView", AutoScroller);

        this.scroller.SetHandle(this.updateMailItem.bind(this));
        this.logScroller.SetHandle(this.updateMailLogItem.bind(this));
        this.onBntEvent()
    }

    private onBntEvent() {
        this.nav.forEach((node, index) => {
            node.on("toggle",  this.onPage, this);
        })
        this.serchBtn.on(Input.EventType.TOUCH_END, this.onSerch, this);
        this.deletBtn.on(Input.EventType.TOUCH_END, this.onDeleteAll, this);
        this.getAwardBtn.on(Input.EventType.TOUCH_END, this.onClaimAll, this);
        this.find("layout/logNode/sortBtn").on(Input.EventType.TOUCH_END, this.onSortBtn, this);
        this.find("layout/heleBtn2").on(Input.EventType.TOUCH_END, this.onHelpBtn2, this);
    }

    async SetPage(page: number) {
        if (!this.$hasLoad) await this.initSub;
        if (!this.nav[page]) return;
        this.page = undefined;
        this.nav[page].getComponent(Toggle).isChecked = true;
        this.onPage(this.nav[page].getComponent(Toggle));
    }

    private onPage(t:Toggle) {   
        if (!t.isChecked) return;
        let index = this.nav.indexOf(t.node);
        if(index == 3){//转赠记录
            this.logNode.active = true;
            this.scroller.node.active = false;
            this.SendMail.active = false;
            this.deletBtn.active = false;
            this.getAwardBtn.active = false;
            this.serchBtn.active = false;
            this.page = 1;
            this.sortType = this.sortType ? this.sortType : 2;
            PlayerData.mails_log = [];
            this.onRefershItem();
        }else if (index == 2) {//发件
            // if(GameSet.GetServerMark() == "xf"){
            //     this.SetPage(this.seleteIndex);
            //     MsgPanel.Show("暂未开放");
            //     return;
            // }
            this.logNode.active = false;
            this.scroller.node.active = false;
            this.SendMail.active = true;
            this.deletBtn.active = false;
            this.getAwardBtn.active = false;
            this.serchBtn.active = true;
        } else {//个人和系统邮件
            this.logNode.active = false;
            this.scroller.node.active = true;
            this.SendMail.active = false;
            this.deletBtn.active = true;
            this.getAwardBtn.active = true;
            this.serchBtn.active = false;
            this.page = 1;
            PlayerData.mails = [];
            PlayerData.mailmap = {};
            this.onRefershItem();
        }
        this.seleteIndex = index;
        // this.nav.children[index].getComponent(Toggle).isChecked = true;
    }

    private async updateMailItem(item: Node, data: SPlayerMailData, index: number) {
        item.getChildByName(`title`).getComponent(Label).string = data.title;
        let time = DateUtils.timeElapsedSince(data.time * 1000);
        let str = "";
        if (time.days > 0) {
            str = `${time.days}天前`
        } else if (time.hours > 0) {
            str = `${time.hours}小时前`
        } else if (time.minutes > 0) {
            str = `${time.minutes}分前`
        } else if (time.seconds > 0) {
            str = `${time.seconds}秒前`
        } 
        
        item.getChildByName("time").getComponent(Label).string = `${str}`;
        let scroller = item.getChildByName(`itemLayout`).getComponent(AutoScroller);
        scroller.SetHandle(this.UpdateBagItem.bind(this));
        let reward_data = data.attachments.data ? PlayerData.getMailReward(data.attachments.data) : [];
        scroller.UpdateDatas(reward_data);
        let bg = item.getChildByName(`bg`).getComponent(Sprite);
        let mailIcon = item.getChildByName(`mailIcon`).getComponent(Sprite);
        let awardIcon = item.getChildByName(`awardIcon`).getComponent(Sprite);
        let state = item.getChildByName(`state`).getComponent(Label);

        // let max_time:number;
        if (data.is_attachment_claimed) {
            awardIcon.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_mail, `getAward`, "spriteFrame"), SpriteFrame);
            bg.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_mail, `readBg`, "spriteFrame"), SpriteFrame);
            state.string = `已领取`;
            scroller.node.getComponent(ScrollView).content.children.forEach((node) => {
                node.children.forEach((child) => {
                    if (child.getComponent(Sprite)) child.getComponent(Sprite).grayscale = true;
                })
            })
            // max_time = this.deleteTime2
            // if(time_differ > this.deleteTime2){
            //     delete_item.string = "";
            // }else{
            //     //最大时间 - 已过时间 = 剩余时间
            //     this.setTimeLabel(delete_item, this.deleteTime2, time_differ, data.lock_time)
            // }
        } else {
            scroller.node.getComponent(ScrollView).content.children.forEach((node) => {
                node.children.forEach((child) => {
                    if (child.getComponent(Sprite)) child.getComponent(Sprite).grayscale = false;
                })
            })
            awardIcon.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_mail, `unGetAward`, "spriteFrame"), SpriteFrame);
            if (data.is_read) {
                bg.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_mail, `readBg`, "spriteFrame"), SpriteFrame);
                mailIcon.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_mail, `redIcon`, "spriteFrame"), SpriteFrame);
                state.string = `已读`;

                // if(reward_data.length > 0){  
                //     max_time = this.deleteTime1   
                // }else{
                //     max_time = this.deleteTime2
                // }

            } else {
                bg.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_mail, `unReadBg`, "spriteFrame"), SpriteFrame);
                mailIcon.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_mail, `unRedIcon`, "spriteFrame"), SpriteFrame);
                state.string = `未读`;
                // max_time = this.deleteTime1
            }
        }
        // item["data"] = {is_attachment_claimed:data.is_attachment_claimed, is_read:data.is_read,
        //      is_reward:reward_data.length>0, max_time:max_time, time: data.time};
      

        item.off(Input.EventType.TOUCH_END)
        item.on(Input.EventType.TOUCH_END, () => { this.onSelect(data._id) }, this);
        this.checkPage(data);
    }

    private async updateMailLogItem(item: Node, data: SPlayerMailData) {
        let is_get = item.getChildByName("is_get").getComponent(Sprite);
        let source = item.getChildByName("source").getComponent(Label);
        let time = item.getChildByName("time").getComponent(Label);
        let incom = item.getChildByName("incom").getComponent(Label);
        let datetime = DateUtils.TimestampToDate(data.time * 1000)
        let m = parseInt(datetime[1]) < 10 ? `0${datetime[1]}` : `${datetime[1]}`;
        let d = parseInt(datetime[2]) < 10 ? `0${datetime[2]}` : `${datetime[2]}`;
        let h = parseInt(datetime[3]) < 10 ? `0${datetime[3]}` : `${datetime[3]}`;
        let min = parseInt(datetime[4]) < 10 ? `0${datetime[4]}` : `${datetime[4]}`;
        let s = parseInt(datetime[5]) < 10 ? `0${datetime[5]}` : `${datetime[5]}`;
        time.string = datetime[0] + "-" + m + "-" + d + "  " + h + ":" + min + ":" + s;
        let currency_num = ToFixed(data.attachments.data[0].currency.value, 2) 
        let is_Add = data.sender_player_id != PlayerData.roleInfo.player_id
        source.string = is_Add ? data.sender_player_id : data.player_id;
        incom.string = is_Add ? "+" + currency_num : "-" + currency_num;
        incom.color = is_Add ? new Color().fromHEX("#498127") : new Color().fromHEX("#AD5858")
        let icon_name = is_Add ? "get" : "send"
        is_get.spriteFrame = await ResMgr.LoadResAbSub(path.join("sheets/mail", icon_name, "spriteFrame"), SpriteFrame);
        this.checkPage(data);
    }

    /**
     * 更新背包道具item
     * @param item 
     * @param data 
     */
    private async UpdateBagItem(item: Node, data: SPlayerDataItem | SThing) {
        await BagItem.UpdateBagItem(item, data);
        item.getComponent(Toggle).enabled = false;
    }

    protected onSelect(id: string) {
        AudioMgr.PlayOnce(Audio_OpenMail);
        let info = {
            type: MsgTypeSend.ReadMail,
            data: {
                mail_id: id,        // 邮件读取状态筛选条件: 0-所有邮件, 1-已读邮件, 2-未读邮件
            }
        }
        Session.Send(info);
    }

    private onSerch() {
        if (this.EditBox.string) {
            if (this.EditBox.string == PlayerData.roleInfo.player_id) return Tips.Show(`无法搜索自己的ID`);
            let data = {
                type: MsgTypeSend.GetPlayerInfo,
                data: {
                    player_id: this.EditBox.string,        // 玩家ID
                }
            }
            this.EditBox.string = ``;
            Session.Send(data);
        } else {
            Tips.Show(`请输入玩家ID！`);
        }
    }

    protected onSortBtn() {
        let callback = (sort_type) => {
            this.sortType = sort_type
            this.page = 1;
        };
        CurrencyIncomSortPanel.Show(this.sortType, null, 10, callback.bind(this), true);
    }

    protected onShow(): void {
        this.scroller.UpdateDatas([]);
        this.page = 1;
        this.sortType = 2;
        this.SetPage(0);
        EventMgr.on(Evt_Mail_Add, this.onRefershItem, this);
        EventMgr.on(Evt_Mail_Update, this.flush, this);
        EventMgr.on(Evt_ReadMail, this.flush, this)
        EventMgr.emit(Evt_Hide_Scene, js.getClassName(this));
    }

    public flush(...args: any[]): void {
        AdaptBgTop(this.find("bg"))
        let is_first = LocalStorage.GetBool("firsr_mail" + PlayerData.roleInfo.player_id);
        if(!is_first){
            this.onHelpBtn2();
            LocalStorage.SetBool("firsr_mail" + PlayerData.roleInfo.player_id, true);
        }
        this.myUidLab.string = `我的UID:${PlayerData.roleInfo.player_id}`;
        // let time_data = CfgMgr.GetCommon(StdCommonType.Mail);
        // this.deleteTime1 = time_data.DeleteTime1;
        // this.deleteTime2 = time_data.DeleteTime2;

        this.mailLogDatas = [];
        let datas = [];
        if(this.seleteIndex != 3){
            PlayerData.mails.forEach((data) => {
                if (this.seleteIndex == 0) {
                    if (!data.sender_player_id || data.sender_player_id.length < 1) {
                        datas.push(data)
                        this.systemList.push(data);
                    }
                } else {
                    if (data.sender_player_id && data.sender_player_id.length >= 1) {
                        datas.push(data)
                        this.playerList.push(data);
                    }
                }
            })
            this.scroller.UpdateDatas(datas);
        }else{
            PlayerData.mails_log.forEach((data) => {
                if (data.sender_player_id && data.sender_player_id.length >= 1) {
                    datas.push(data)
                    this.mailLogDatas.push(data);
                }
            })
            datas.sort((a:SPlayerMailData,b:SPlayerMailData)=>{
                return b.time - a.time;
            })
            this.logScroller.UpdateDatas(datas);
        }
        this.empty.active = datas.length <= 0;
    }


    protected onHide(...args: any[]): void {
        EventMgr.off(Evt_Mail_Update, this.flush, this);
        EventMgr.off(Evt_ReadMail, this.flush, this)
        EventMgr.off(Evt_Mail_Add, this.onRefershItem, this);
        // PlayerData.resetMail();
        EventMgr.emit(Evt_Show_Scene, js.getClassByName(this));
    }

    private onRefershItem() {
        if(this.seleteIndex != 3){
            let data = {
                type: MsgTypeSend.GetPlayerMails,
                data: {
                    read_flag: 0,        // 邮件读取状态筛选条件: 0-所有邮件, 1-已读邮件, 2-未读邮件
                    page: this.page,             // 邮件列表的页码,用于分页
                    page_size: this.pageSize, // 每页的邮件数量,用于分页
                }
            }
            Session.Send(data);
        }else{
            let data = {
                type: MsgTypeSend.GetPlayerMails,
                data: {
                    read_flag: 0,        // 邮件读取状态筛选条件: 0-所有邮件, 1-已读邮件, 2-未读邮件
                    page: this.page,             // 邮件列表的页码,用于分页
                    page_size: 10, // 每页的邮件数量,用于分页
                    msg_id: "1", //用于区分邮件是否是转赠记录数据
                    contains_del: true,
                    contains_mode:this.sortType,
                    source_filter:[1009,2006]
                }
            }
            Session.Send(data);
        }
    }

    private onDeleteAll() {
        AudioMgr.PlayOnce(Audio_CommonDelete);
        let data = {
            type: MsgTypeSend.DeleteAllMails,
            data: {},
        }
        Session.Send(data);
    }

    private onClaimAll() {
        let data = {
            type: MsgTypeSend.ClaimAllMailAttachments,
            data: {},
        }
        Session.Send(data);
    }

    private checkPage(data: SPlayerMailData) {
        let list = []
        if(this.seleteIndex == 3){
            list = this.mailLogDatas;
        }else if (this.seleteIndex == 0) {
            list = this.systemList;
        } else {
            list = this.playerList;
        }
        if (!data.is_last && list[list.length - 1] == data) {
            data.is_last = true;
            this.page++;
            this.onRefershItem()
        }
    }

    // protected update(dt: number): void {
    //     for (let index = 0; index < this.content.children.length; index++) {
    //         const element = this.content.children[index];
    //         if(element && element["data"] ){
    //             let data:{is_attachment_claimed:boolean, is_read: boolean, is_reward:boolean, max_time:number, time:number} = element["data"];
    //             let max_time:number;
    //             if (data.is_attachment_claimed) {                  
    //                 max_time = this.deleteTime2            
    //             } else {
    //                 if (data.is_read) {
    //                     if(data.is_reward){  
    //                         max_time = this.deleteTime1   
    //                     }else{
    //                         max_time = this.deleteTime2
    //                     }    
    //                 } else {  
    //                     max_time = this.deleteTime1                    
    //                 }
    //             }
    //             let delete_item =  element.getChildByName("delete_time").getComponent(Label)
    //             let time_differ = PlayerData.GetServerTime() - data.time
    //             if(time_differ > max_time){
    //                 delete_item.string = "";
    //             }else{
    //                 //最大时间 - 已过时间 = 剩余时间   
    //                 let seconds = max_time - time_differ + PlayerData.GetServerTime();
    //                 seconds = Math.floor(seconds)
    //                 let show_time = PlayerData.countDown2(seconds);
    //                 if( show_time.d > 0){
    //                     delete_item.string = "剩余" + show_time.d + "天";
    //                 }else{
    //                     delete_item.string = "剩余" + show_time.h + ":" + show_time.m + ":" + show_time.s;
    //                 }
    //             }
    //         }
            
    //     }

        
    // }

    private onHelpBtn2() {
        Tips3.Show(2);
    }
}

