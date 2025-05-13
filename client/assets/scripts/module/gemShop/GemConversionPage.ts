import { Button, Component, EditBox } from "cc";
import { ToFixed } from "../../utils/Utils";
import { ConsumeItem } from "../common/ConsumeItem";
import { ItemUtil } from "../../utils/ItemUtils";
import PlayerData, { } from "../roleModule/PlayerData"
import { SThing } from "../roleModule/PlayerStruct";
import { CfgMgr, StdCommonType, StdGemComm, ThingType } from "../../manager/CfgMgr";
import { MsgPanel } from "../common/MsgPanel";
import { CheckRisk, isFengkong } from "../../Platform";
import { Session } from "../../net/Session";
import { MsgTypeRet, MsgTypeSend } from "../../MsgType";
import { EventMgr, Evt_Currency_Updtae } from "../../manager/EventMgr";
import { GemBillLogPanel } from "./GemBillLogPanel";
import { IOS } from "cc/env";
import { RiskPanel } from "../login/RiskPanel";

export class GemConversionPage extends Component {
    private gemItem: ConsumeItem;
    private getGemItem: ConsumeItem;
    private costItem: ConsumeItem;
    private totalCostItem: ConsumeItem;
    private inputBox: EditBox;
    private btn: Button;
    private logBtn: Button;
    private reg: RegExp = new RegExp(/^[0-9]+.?[0-9]*/); //判断是否是数字。
    private keepLen: number = 6;
    private std: StdGemComm;
    private inputValue: number = 0;
    private clickTime: number = 0;
    protected onLoad(): void {
        this.std = CfgMgr.GetCommon(StdCommonType.Gem);
        this.gemItem = this.node.getChildByName("gemItem").addComponent(ConsumeItem);
        this.getGemItem = this.node.getChildByName("getGemItem").addComponent(ConsumeItem);
        this.costItem = this.node.getChildByName("costItem").addComponent(ConsumeItem);
        this.totalCostItem = this.node.getChildByName("totalCostItem").addComponent(ConsumeItem);
        this.inputBox = this.node.getChildByName("inputBox").getComponent(EditBox);
        this.btn = this.node.getChildByName("btn").getComponent(Button);
        this.logBtn = this.node.getChildByName("logBtn").getComponent(Button);
        this.inputBox.node.on(EditBox.EventType.TEXT_CHANGED, this.onEditBoxChanged, this);
        this.inputBox.node.on(EditBox.EventType.EDITING_DID_ENDED, this.onEditEnd, this);
        this.btn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.logBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);

        EventMgr.on("bind_gem", this.onGetGem, this);
    }
    private onEditBoxChanged(editBox: EditBox): void {
        let str = "";
        let indexStr: string;
        for (let i = 0; i < editBox.string.length; i++) {
            indexStr = editBox.string.charAt(i);

            if (indexStr == ".") {
                if (i == 0 && indexStr == ".") {
                    str = "";
                    break;
                }
                if (str.indexOf(".") < 0) {
                    str += editBox.string.charAt(i);
                }
            } else {
                if (this.reg.test(indexStr)) {
                    str += editBox.string.charAt(i);
                }
            }

        }
        if (isNaN(Number(str))) str = "";
        editBox.string = ToFixed(str.length > 0 ? str : "", this.std.KeepPre);
        this.updateShow();
    }
    private onEditEnd(editBox: EditBox): void {
        this.updateShow();
    }

    private onBtnClick(btn: Button): void {
        switch (btn) {
            case this.btn:
                if (this.inputValue <= 0) {
                    MsgPanel.Show(`请先输入提取宝石积分数量`);
                    return;
                }
                if (this.inputValue > this.std.Max) {
                    MsgPanel.Show('提取宝石积分超出限制');
                    return;
                }
                if (this.inputValue < this.std.Min) {
                    MsgPanel.Show(`提取数量最小${this.std.Min}`);
                    return;
                }
                let sxf: number = this.std.MailCost.mul(this.inputValue);
                let totalNum: number = sxf + this.inputValue;
                if (totalNum > PlayerData.roleInfo.currency_77) {
                    MsgPanel.Show(`提取宝石积分不足`);
                    return;
                }
                if (this.clickTime > 0) {
                    MsgPanel.Show(`点击太快了`);
                    return;
                }
                this.clickTime = 1;
                let thisObj = this;
                this.scheduleOnce(() => { thisObj.clickTime = 0 }, 1);
                if (isFengkong()) {
                    RiskPanel.Show();
                    CheckRisk((data: { authorization: string, rc_token: string }) => {
                        RiskPanel.Hide();
                        Session.Send({
                            type: MsgTypeSend.UserAuth, data: {
                                authorization: data.authorization,
                                rc_token: data.rc_token,
                                client_os: IOS ? 1 : 2
                            },
                        }, MsgTypeRet.UserAuthRet);
                    });
                } else {
                    Session.Send({
                        type: MsgTypeSend.UserAuth, data: {
                            authorization: "",
                            rc_token: "",
                            client_os: IOS ? 1 : 2
                        },
                    }, MsgTypeRet.UserAuthRet);
                }

                break;
            case this.logBtn:
                GemBillLogPanel.Show();
                break;
        }
    }
    onGetGem(data: any) {
        if (isFengkong()) {
            RiskPanel.Show();
            CheckRisk((result: { authorization: string, rc_token: string }) => {
                RiskPanel.Hide();
                Session.Send({
                    type: MsgTypeSend.Withdraw, data: {
                        authorization: result.authorization,
                        rc_token: result.rc_token,
                        amount: this.inputValue,
                        chaowan_code: data.code,
                        client_os: IOS ? 1 : 2
                    }
                });
            });
        } else {
            Session.Send({
                type: MsgTypeSend.Withdraw, data: {
                    amount: this.inputValue,
                    chaowan_code: data.code
                }
            });
        }
    }
    onShow(): void {
        this.node.active = true;
        this.inputValue = 0;
        this.inputBox.string = "";
        this.updateShow();
        EventMgr.on(Evt_Currency_Updtae, this.onCurrencyUpdate, this);
    }

    onHide(): void {
        this.node.active = false;
        EventMgr.off(Evt_Currency_Updtae, this.onCurrencyUpdate, this);
    }
    private onCurrencyUpdate(): void {
        this.updateHaveItem();
    }
    private updateHaveItem(): void {
        let thing: SThing = ItemUtil.CreateThing(ThingType.ThingTypeGem, 0, PlayerData.roleInfo.currency_77);
        this.gemItem.SetData(thing);
    }
    private updateShow(): void {
        this.updateHaveItem();
        let thing: SThing;

        this.inputValue = Number(this.inputBox.string);
        if (isNaN(this.inputValue)) this.inputValue = 0;
        let sxf: number = this.std.MailCost.mul(this.inputValue);
        thing = ItemUtil.CreateThing(ThingType.ThingTypeGem, 0, this.inputValue + sxf);
        this.totalCostItem.SetData(thing);

        thing = ItemUtil.CreateThing(ThingType.ThingTypeGem, 0, sxf);
        this.costItem.SetData(thing);

        thing = ItemUtil.CreateThing(ThingType.ThingTypeGem, 0, this.inputValue);
        this.getGemItem.SetData(thing);
    }
}