import { Button, Component, EditBox, EventHandler, EventTouch, Input, Label, Layout, Node, ScrollView, Sprite, SpriteFrame, Toggle, find, instantiate, path, sp, tween, view } from "cc";
import { Panel } from "../../GameRoot";
import { AutoScroller } from "../../utils/AutoScroller";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import PlayerData, { } from "../roleModule/PlayerData"
 import {SFriendSortType} from "../roleModule/PlayerStruct";
import { Second } from "../../utils/Utils";

export class CurrencyIncomSortPanel extends Panel {
    protected prefab: string = "prefabs/panel/currencyIncomInfo/CurrencyIncomSortPanel";
    
    private content:Node;
    private currency_type:number = 2
    private callBcak:Function;
    private sort_type:number;
    private pageSize:number = 15;
    private is_mail:boolean;
    private sortList = [2,0,1];//2所有, 0获得, 1赠送
    protected onLoad() {
        this.CloseBy("mask");
        this.CloseBy("panel/closeBtn");
        this.content = this.find("panel/sortList/content")
    }
  
    protected onShow(): void {
        
    }

    async flush(sort_type:number, currency_type:number, page_size:number, callback:Function, is_mail?:boolean) {
        Second(0)
        this.sort_type = is_mail ? this.sortList.indexOf(sort_type) : sort_type;;
        this.currency_type = currency_type;
        this.pageSize = page_size
        this.callBcak = callback;
        this.is_mail = is_mail
        this.content.children[this.sort_type].getComponent(Toggle).isChecked = true;
        
    }

    private onSend(select_type){
        if( this.sort_type == select_type){
            return;
        }else{
            if(!this.currency_type && this.is_mail){
                PlayerData.mails_log = [];
                let data = {
                    type: MsgTypeSend.GetPlayerMails,
                    data: {
                        read_flag: 0,        // 邮件读取状态筛选条件: 0-所有邮件, 1-已读邮件, 2-未读邮件
                        page: 1,             // 邮件列表的页码,用于分页
                        page_size: 10, // 每页的邮件数量,用于分页
                        msg_id: "1", //用于区分邮件是否是转赠记录数据
                        contains_del: true,
                        contains_mode: this.sortList[select_type],
                        source_filter:[1009,2006]
                    }
                }
                Session.Send(data);
            }else{
                this.sort_type = select_type;
                let data = {
                    type:MsgTypeSend.QueryThingRecordsRequest,
                    data:{count_filter:this.sort_type, type1:this.currency_type, page_size:this.pageSize, page:1}
                }
                Session.Send(data);
            }
        }
    }
 
    protected onHide(...args: any[]): void {
        let select_type = 0;
        let children = this.content.children
        for (let index = 0; index < children.length; index++) {
            const element = children[index];
            if(element.getComponent(Toggle).isChecked){
                select_type = index;
                break;
            }
        } 
        if(this.callBcak && this.sort_type != select_type){
            if(this.is_mail){
                this.callBcak(this.sortList[select_type]);
            }else{
                this.callBcak(select_type);
            }
            this.callBcak = undefined; 
        }
       this.onSend(select_type);
    }
  
}