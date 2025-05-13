import { Button, Component, EditBox, EventTouch, Input, Label, Node, RichText, ScrollView, Sprite, SpriteFrame, Toggle, find, js, path, sp, tween } from "cc";
import { Panel } from "../../GameRoot";
import { EventMgr, Evt_Item_Change, Evt_Mail_Update, Evt_SendMail } from "../../manager/EventMgr";
import { MsgTypeSend } from "../../MsgType";
import { Session } from "../../net/Session";
import PlayerData, {  } from "../roleModule/PlayerData"
 import {SMailPlayerData} from "../roleModule/PlayerStruct";
import { CfgMgr, GuildEquityId, StdCommonType, StdEquityId, StdItem } from "../../manager/CfgMgr";
import { GetNumberAccuracy, ToFixed } from "../../utils/Utils";
import { Tips } from "../login/Tips";
import { GameSet } from "../GameSet";
import { AutoScroller } from "../../utils/AutoScroller";
import { IOS } from "cc/env";
import { ResMgr, folder_item } from "../../manager/ResMgr";
import { Md5Utils } from "../../utils/Md5Utils";
import { SettingPasswordPanel } from "../setting/SettingPasswordPanel";

export class MailSendPanel extends Panel {
    protected prefab: string = "prefabs/mail/MailSendPanel";

    protected head: Node;
    protected nameLab: Label;
    protected uidLab: Label;
    protected homlandLab: Label;
    protected EditBox: EditBox;
    protected giftBtn: Node;
    private data: SMailPlayerData = null;
    private haveLabel: Label;
    private costLabel: Label;
    private allLabel: Label;
    private surePanel: Node;
    private surePanelLabel: RichText;
    private inputPassword:EditBox;
    private RichText: RichText;
    private RichText2: RichText;
    private name_title: Label;
    private open_btn: Button;
    private ListScrollView: AutoScroller;
    private cost_price_label: Label;
    private all_price_label: Label;
    private have_price_icon: Sprite;
    private cost_price_icon: Sprite;
    private all_price_icon: Sprite;
    private navBtns: Node[];



    private MailCost = 0;
    private select_id:number;
    private cfg_item: StdItem;
    private page: number;
    private reg: RegExp = new RegExp(/^[0-9]*$/); //判断是否是数字。
    protected onLoad() {
        this.CloseBy("mask");
        this.CloseBy("spriteFrame/Close");
        this.head = this.find(`spriteFrame/headInfo`);
        this.nameLab = this.find(`spriteFrame/msg/role_name`, Label);
        this.uidLab = this.find(`spriteFrame/msg/uid`, Label);
        this.homlandLab = this.find(`spriteFrame/msg/homeLand`, Label);
        this.giftBtn = this.find(`spriteFrame/giftBtn`);
        this.haveLabel = this.find(`spriteFrame/msg/have/PriceLayout/Price`, Label);
        this.have_price_icon = this.find(`spriteFrame/msg/have/PriceLayout/money_icon`, Sprite);
        this.costLabel = this.find(`spriteFrame/msg/cost/PriceLayout/Price`, Label);
        this.cost_price_icon = this.find(`spriteFrame/msg/cost/PriceLayout/money_icon`, Sprite);
        this.cost_price_label = this.find(`spriteFrame/msg/cost/priceLabel`, Label);
        this.allLabel = this.find(`spriteFrame/msg/all/PriceLayout/Price`, Label);
        this.all_price_icon = this.find(`spriteFrame/msg/all/PriceLayout/money_icon`, Sprite);
        this.all_price_label = this.find(`spriteFrame/msg/all/priceLabel`, Label);
        this.EditBox = this.find(`spriteFrame/msg/sendMsg/editboxBg/EditBox`, EditBox);
        this.surePanel = this.find(`surePanel`);
        this.surePanelLabel = this.find(`surePanel/spriteFrame/MidBg/lab`, RichText);
        this.inputPassword = this.find(`surePanel/spriteFrame/inputBg/inputPassword`, EditBox);
        this.RichText = this.find(`spriteFrame/RichText`, RichText);
        this.RichText2 = this.find(`spriteFrame/RichText2`, RichText);
        this.name_title = this.find(`spriteFrame/msg/sendMsg/nameLayout/name`, Label);
        this.open_btn = this.find(`spriteFrame/msg/sendMsg/nameLayout/openBtn`, Button);
        this.ListScrollView = this.find(`spriteFrame/msg/ListScrollView`, AutoScroller);
        this.ListScrollView.SetHandle(this.updateItem.bind(this));
        this.ListScrollView.node.on('select', this.onSelectItem, this)
        this.navBtns = this.find("spriteFrame/msg/sendMsg/nav").children.concat();
        this.inputPassword.node.on(EditBox.EventType.TEXT_CHANGED, this.onEditBoxChanged, this);
        for (let btn of this.navBtns) {
            btn.on('toggle', this.onPage, this);
        }
        this.onBntEvent()
    }
    private onEditBoxChanged(editBox: EditBox): void {
        let str = "";
        let indexStr: string;
        for (let i = 0; i < editBox.string.length; i++) {
            indexStr = editBox.string.charAt(i);
            if (this.reg.test(indexStr)) {
                str += editBox.string.charAt(i);
            }
        }
        editBox.string = str;
    }
    private onBntEvent() {
        this.open_btn.node.on(Button.EventType.CLICK, this.onOpen, this);
        this.giftBtn.on(Button.EventType.CLICK, this.onShowSurePanel, this);
        this.EditBox.node.on(EditBox.EventType.EDITING_DID_ENDED, this.onEditEnd, this);
        this.EditBox.node.on(EditBox.EventType.TEXT_CHANGED, this.onTextChanged, this);
        find(`spriteFrame/Close`, this.surePanel).on(Input.EventType.TOUCH_END, () => { this.surePanel.active = false }, this);
        find(`spriteFrame/closeBtn`, this.surePanel).on(Input.EventType.TOUCH_END, () => { this.surePanel.active = false }, this);
        find(`spriteFrame/sureBtn`, this.surePanel).on(Input.EventType.TOUCH_END, this.onSendGift, this);
    }

    private onOpen(){
        let is_open = this.ListScrollView.node.active;
        let scaleY = is_open ? -1 : 1;
        this.ListScrollView.node.active = !is_open
        this.open_btn.node.setScale(1, scaleY)
    }

    private onShowSurePanel() {
        this.inputPassword.string = "";
        let has_count = this.page == 0 ? PlayerData.roleInfo.currency : PlayerData.GetItemCount(this.select_id)
        let min_str:string = this.page == 0 ? "Min" : "ItemMin";
        let max_str:string = this.page == 0 ? "Max" : "ItemMax";
        console.log( CfgMgr.GetCommon(StdCommonType.Mail)[min_str])
        console.log( CfgMgr.GetCommon(StdCommonType.Mail)[max_str])
        let count = Number(this.EditBox.string);
        let cost_count = this.page == 0 ? Number(this.allLabel.string) : count;

        if(!PlayerData.roleInfo.is_password){
            SettingPasswordPanel.Show();
            return;
        }

        if (!count || count < 1) {
            return Tips.Show(`请输入要赠送的货币数量！`);
        }
        if (count < CfgMgr.GetCommon(StdCommonType.Mail)[min_str]) {
            return Tips.Show(`未达最小起赠值`);
        }
        if (count > CfgMgr.GetCommon(StdCommonType.Mail)[max_str]) {
            return Tips.Show(`要赠送的超过上限，最多赠送${CfgMgr.GetCommon(StdCommonType.Mail)[max_str]}，请检查后重试！`);
        }

        if (cost_count > has_count) {
            return Tips.Show(this.cfg_item.ItemName +`不足,请检查后重试！`);
        }
        this.surePanel.active = true;
        this.surePanelLabel.string = `将发送<color=#C36316 >${this.EditBox.string}</color>个${this.cfg_item.ItemName}给玩家<color=#0C8EAA>${this.data.name}</color>\n是否确认赠送？`;
    }

    private onSendGift() {
        if(this.page == 0){
            let data = {
                type: MsgTypeSend.SendCurrencyMail,
                data: {
                    receiver_id: this.data.player_id,        // 玩家ID
                    amount: Number(this.EditBox.string),        // 数量
                    authorization: "",
                    rc_token: "",
                    client_os: IOS ? 1 : 2,
                    password:Md5Utils.hash(Md5Utils.hash(this.inputPassword.string)),
                    uuidV1:PlayerData.roleInfo.player_id+":"+(new Date()).getTime(),
                }
            }
            //console.log("mail---->" + data.data.password);
            Session.Send(data, MsgTypeSend.SendCurrencyMail, 5000,true);
        }else{
            let items_list: { [key: number]: number } = js.createMap();
            items_list[this.cfg_item.Items] =  Number(this.EditBox.string);
            let data = {
                type: MsgTypeSend.SendItemMail,
                data: {
                    receiver_id: this.data.player_id,        // 玩家ID
                    items:items_list,
                    authorization: "",
                    rc_token: "",
                    client_os: IOS ? 1 : 2,
                    password:Md5Utils.hash(Md5Utils.hash(this.inputPassword.string)),
                    uuidV1:PlayerData.roleInfo.player_id+":"+(new Date()).getTime(),
                }
            }
            //console.log("mail---->" + data.data.password);
            Session.Send(data, MsgTypeSend.SendItemMail, 5000,true);
        }
    }

    private onEditEnd() {
        let count = Number(this.EditBox.string);
        if(this.page == 0){
            let cost = this.MailCost || 0;
            let num = GetNumberAccuracy((count * cost), 2);
            this.costLabel.string = `${Math.ceil((num) * 100) / 100}`;
            this.allLabel.string = `${Math.ceil((num + count) * 100) / 100}`;
        }else{
            let item_count = PlayerData.GetItemCount(this.select_id)
            this.costLabel.string = `${Math.ceil(count)}`;
            this.allLabel.string = `${Math.ceil(item_count - count)}`;
        }
    }

    private onTextChanged() {
        let count = Number(this.keepNumbersAndOneDot(this.EditBox.string));
        this.EditBox.string = `${Math.ceil((count) * 100) / 100}`;
    }

    private keepNumbersAndOneDot(str) {
        // 使用正则表达式来提取所有数字和小数点
        let result = str.replace(/[^0-9.]/g, '');

        // 找到第一个小数点的位置
        let firstDotIndex = result.indexOf('.');

        // 如果找到了小数点，移除其后的所有小数点
        if (firstDotIndex !== -1) {
            result = result.substring(0, firstDotIndex + 1) + result.substring(firstDotIndex + 1).replace(/\./g, '');
        }

        return result;
    }

    protected onShow(): void {
        EventMgr.on(Evt_SendMail, this.Hide, this);
        this.costLabel.string = `${0}`;
        this.allLabel.string = `${0}`;
        this.EditBox.string = ``;
        this.surePanel.active = false;
        // console.log("is_has_rights", is_has_rights);
        let cost = 0
        if (PlayerData.GetIsActivateRights(StdEquityId.Id_3) || PlayerData.GetIsActivateRights(StdEquityId.Id_4)) {
            this.MailCost = CfgMgr.getEquityListById(StdEquityId.Id_3).Value;     
        } else {
            this.MailCost = CfgMgr.GetCommon(StdCommonType.Mail).MailCost;
        }
        cost = this.MailCost
        let is_has_guild_rights =  PlayerData.GetMyGuildPrivilegeById(GuildEquityId.GuildEquity_1);
        // console.log(is_has_guild_rights)
        this.MailCost = is_has_guild_rights ? 0 : this.MailCost;
        let str = is_has_guild_rights ? "（<color=#DD6E24>0%</color>公会职位减免）" : ""
        this.RichText.string = `<color=#DD6E24>${CfgMgr.GetCommon(StdCommonType.Mail).Min}</color><color=#849AA7>起赠，额外消耗赠送数量的</color><color=#DD6E24>${cost * 100}%</color><color=#849AA7>${str}作为损耗</color>`;
        this.RichText2.string = `</color><color=#849AA7>赠送成功好友需要在</color><color=#DD6E24>个人邮件内</color><color=#849AA7>领取</color>`;
    }

    public flush(data: SMailPlayerData): void {
        this.data = data;
        this.initMsg();
        this.SetPage(0);
    }

    private initMsg() {
        this.nameLab.string = this.data.name;
        this.uidLab.string = `UID:${this.data.player_id}`;
        let homeLandMsg = CfgMgr.GetHomeLandInit(this.data.homeland_id);
        if (homeLandMsg) {
            this.homlandLab.string = homeLandMsg.Desc[0];
        }
    }

    async SetPage(page: number) {
        if (!this.navBtns[page]) return;
        this.page = undefined;
        this.navBtns[page].getComponent(Toggle).isChecked = true;
        this.onPage(this.navBtns[page].getComponent(Toggle));
    }

    private onPage(t: Toggle) {
        if (!t.isChecked) return;
        let page = this.navBtns.indexOf(t.node);
        if ((page < 0 || page == this.page)) return;
        this.EditBox.string = "";
        this.page = page;
        this.cost_price_label.string = this.page == 0 ? "损耗" : "赠送数量";
        this.all_price_label.string = this.page == 0 ? "合计" : "剩余数量"; 
        this.open_btn.node.active = this.page != 0;
        this.ListScrollView.node.active = false;
        this.RichText.node.active = this.page == 0;
        this.RichText2.node.active = this.page != 0;
        if(page == 0){
            this.haveLabel.string = `${this.setResCount(PlayerData.roleInfo.currency)}`;
            this.updateItemInfo();
        }else{
            this.onOpen();
            let list_item_data = CfgMgr.GetCanSenditem();
            this.ListScrollView.UpdateDatas(list_item_data)
            this.ListScrollView.SelectFirst();
        }
    }

    private updateItem(item: Node, data: StdItem) {   
        let label = item.getChildByName("label").getComponent(Label);
        label.string = data.ItemName;
        item["data"] = data;
    }

    private onSelectItem(index: number, item: Node){
        console.log(item["data"]);
        let item_data:StdItem = item["data"];
        this.select_id = item_data.Items;
        this.updateItemInfo();
        this.onOpen();
        this.EditBox.string = "";
    }

    private updateItemInfo(){  
      let icon:string = ""
      let name:string = ""
      let item:StdItem;
        if(this.page == 0){
            this.haveLabel.string = this.setResCount(PlayerData.roleInfo.currency);
            item = CfgMgr.Getitem(1);
            icon = item.Icon;
            name = item.ItemName;
        }else{
            item = CfgMgr.Getitem(this.select_id);
            icon = item.Icon;
            name = item.ItemName;
            let item_count = PlayerData.GetItemCount(this.select_id);
            this.haveLabel.string = item_count + "";
        }
        this.cfg_item = item;
        this.name_title.string = "赠送" + name;
        this.costLabel.string = 0 + "";
        this.allLabel.string = 0 + "";
        ResMgr.LoadResAbSub(path.join(folder_item, icon, "spriteFrame"),SpriteFrame,res=>{
            this.have_price_icon.spriteFrame = res;
            this.all_price_icon.spriteFrame = res;
            this.cost_price_icon.spriteFrame = res;
        })
    }

    /**资源和货币的数量展示 */
    private setResCount(count: number) {
        //判断是否是小数
        let str = count.toString();
        if (str.indexOf(".") != -1) {
            str = ToFixed(count, 2);
        } else {
            str = str + ".00"
        }
        return str;
    }

    protected onHide(...args: any[]): void {
        EventMgr.off(Evt_SendMail, this.Hide, this);
    }

}
