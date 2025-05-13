import { Button, EditBox, Input, instantiate, Label, Node, ScrollView, utils } from "cc";
import { Panel } from "../../GameRoot";
import PlayerData, {} from "../roleModule/PlayerData"
 import {NoticeData,SDownlineInfo,SFriendSortType,SGetDownlines,SPlayerViewInfo} from "../roleModule/PlayerStruct";

import { FrameTask } from "../../utils/FrameTask";
import { Session } from "../../net/Session";
import { EventMgr, Evt_GetDownLineInfo, Evt_PlayerBaseInfoChange } from "../../manager/EventMgr";
import { FanyuUpSelectFriendItem } from "../fanyu/FanyuUpSelectFriendItem";
import { MsgTypeRet, MsgTypeSend } from "../../MsgType";
import { AutoScroller } from "../../utils/AutoScroller";
import { UserEditInfoPanel } from "../userInfo/UserEditInfoPanel";
import { Tips } from "../login/Tips";
import { MsgPanel } from "../common/MsgPanel";
import { HeadItem } from "../common/HeadItem";
import { SetNodeGray } from "../common/BaseUI";
import LocalStorage from "../../utils/LocalStorage";
import { DateUtils } from "../../utils/DateUtils";
import { GetUserCode } from "../../Platform";
import { NewHomeInvitePanel } from "./NewHomeInvitePanel";
export class NewHomeCreatePanel extends Panel {
    protected prefab: string = "prefabs/panel/newHomeCreate/NewHomeCreatePanel";

    private createBtn: Node
    private scroller: AutoScroller;
    private okBtn: Button;

    private name_editBox: EditBox;
    private weixin_editBox: EditBox;
    private qq_editBox: EditBox;

    protected datas: { info: SDownlineInfo, select: boolean, sussNum: number, isend: boolean }[] = [];
    private page: number = 1;
    private page_size: number = 10;
    private ishas: boolean = false;
    private name_label:string = "";
    private weixin_label:string = "";
    private qq_label:string = "";
    protected onLoad() {
        this.createBtn = this.find("node/createBtn");
        this.scroller = this.find("node/ScrollView", AutoScroller);
        this.scroller.SetHandle(this.updateItem.bind(this));
        this.okBtn = this.find("node/okBtn",Button);
        // this.name_editBox = this.find("node/name_bg/editBox", EditBox);
        // this.name_editBox.node.on('editing-did-ended', this.onNameEditBoxEnded, this)
        this.weixin_editBox = this.find("node/weiXinCont/editBox", EditBox);
        this.weixin_editBox.node.on('editing-did-ended', this.onWeixinEditBoxEnded, this)
        this.qq_editBox = this.find("node/qqCont/editBox", EditBox);
        this.qq_editBox.node.on('editing-did-ended', this.onQqEditBoxEnded, this)

        this.CloseBy("mask");
        // GetUserCode()
        this.createBtn.on(Input.EventType.TOUCH_END, () => {
            let obj = {
                type: MsgTypeSend.NewSerPreCreate,
                data: {
                    token: GetUserCode(),
                }
            }
            Session.Send(obj);
        }, this);
        this.okBtn.node.on(Button.EventType.CLICK, this.onInvite, this);
        EventMgr.on(Evt_GetDownLineInfo, this.updateFriendData, this);
        Session.on(MsgTypeRet.NewSerPreCreateRet, data => {
            Tips.Show("家园2创建成功：" + data.player_id);
        }, this);
        Session.on(MsgTypeRet.SendMailToDownlinesRet, () => {
            Tips.Show("邀请成功");
            SetNodeGray(this.okBtn.node, true);
            LocalStorage.SetNumber(PlayerData.roleInfo.player_id + "SendMailToDownlinesRequest" , PlayerData.serverTime)
        }, this);
    }

    protected onShow(): void {

    }
    protected onHide(...args: any[]): void {
        this.weixin_editBox.string = "";
        this.qq_editBox.string = "";
        this.weixin_label = "";
        this.qq_label = "";
    }

    public async flush(isAuto: boolean = false): Promise<void> {
        this.page = 1;
        this.datas = [];
        this.onSend(); 
        let time = LocalStorage.GetNumber(PlayerData.roleInfo.player_id +"SendMailToDownlinesRequest", 0);
        let is_one_day = time == 0 ? false : DateUtils.isSameDay(time * 1000, PlayerData.GetServerTime() *  1000)
        SetNodeGray(this.okBtn.node, is_one_day)
    }


    private updateFriendData(data: SGetDownlines) {
        let datas: SDownlineInfo[] = data.downlines;
        for (const iterator of datas) {
            if (iterator.is_upline && !this.ishas) {
                let _data = {
                    info: iterator,
                    select: false,
                    sussNum: 0,
                    isend: false,
                }
                this.datas.push(_data)
                this.ishas = true
            } else {
                if (!iterator.is_upline) {
                    let _data = {
                        info: iterator,
                        select: false,
                        sussNum: 0,
                        isend: false,
                    }
                    this.datas.push(_data)
                }
            }

        }
        this.scroller.UpdateDatas(this.datas);
    }

    protected updateItem(item: Node, data: { info: SDownlineInfo, select: boolean, sussNum: number, isend: boolean }) {
        let headItem:HeadItem = item.getChildByPath("HeadItem").addComponent(HeadItem);
        let playerName = item.getChildByPath("playerName").getComponent(Label);
        let viewInfo:SPlayerViewInfo = {player_id: data.info.player_id};
        headItem.SetData(viewInfo);
        playerName.string = data.info.name;
        this.checkPage(data);
    }

    private checkPage(data: { info: SDownlineInfo, select: boolean, sussNum: number, isend: boolean }) {
        if (!(data.isend) && this.datas[this.datas.length - 1] == data) {
            data.isend = true;
            this.page++;
            this.onSend();
        }
    }

    private onSend() {
        let data = {
            type: MsgTypeSend.GetDownlinesRequest,
            data: { page: this.page, page_size: this.page_size, sort_type: SFriendSortType.SortBindTimeAsc, filter_type: 0, search_player_id: "" }
        }
        Session.Send(data);
    }

    // private onNameEditBoxEnded(editbox: EditBox) {
    //     this.name_label = editbox.string;
    // }
    private onWeixinEditBoxEnded(editbox: EditBox) {
        let reg = /^[a-zA-Z0-9_-]*$/;
        if(!reg.test(editbox.string)){     
            MsgPanel.Show("微信号输入有误");
            return;        
        }
        this.weixin_label = editbox.string;
    }
    private onQqEditBoxEnded(editbox: EditBox) {     
        let reg = /^[1-9][0-9]{4,10}$/;
        if(!reg.test(editbox.string)){     
            MsgPanel.Show("QQ号输入有误");
            return;        
        }
        this.qq_label = editbox.string;
    }

    private onInvite() {
        if (this.weixin_label == "" || this.qq_label == "") {
            Tips.Show("请输入联系方式")
            return;
        }
        let callback = ()=>{
            let data = {
                type: MsgTypeSend.SendMailToDownlinesRequest,
                data: { mail_id: 26,  wechat_contact:this.weixin_label, qq_contact:this.qq_label}
            }
            Session.Send(data);
        }
        NewHomeInvitePanel.Show(callback.bind(this));
    }

}