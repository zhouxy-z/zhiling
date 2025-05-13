import { Button, EditBox } from "cc";
import { Panel } from "../../GameRoot";
import { MsgPanel } from "../common/MsgPanel";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import { GetUserCode } from "../../Platform";
import { Tips } from "../login/Tips";
import { Md5Utils } from "../../utils/Md5Utils";
import PlayerData from "../roleModule/PlayerData";

export class SettingPasswordPanel extends Panel {
    protected prefab: string = "prefabs/panel/setting/SettingPasswordPanel";
    private inputPassword:EditBox;
    private inputPasswordTwo:EditBox;
    private inputCode:EditBox;
    private getCodeBtn:Button;
    private okBtn:Button;
    private reg: RegExp = new RegExp(/^[0-9]*$/); //判断是否是数字。
    protected onLoad(): void {
        this.inputPassword = this.find("inputPassword", EditBox);
        this.inputPasswordTwo = this.find("inputPasswordTwo", EditBox);
        this.inputCode = this.find("inputCode", EditBox);
        this.getCodeBtn = this.find("getCodeBtn", Button);
        this.okBtn = this.find("okBtn", Button);
        this.CloseBy("mask");
        this.CloseBy("closeBtn");
        this.inputPassword.node.on(EditBox.EventType.TEXT_CHANGED, this.onEditBoxChanged, this);

        this.inputPasswordTwo.node.on(EditBox.EventType.TEXT_CHANGED, this.onEditBoxChanged, this);

        this.inputCode.node.on(EditBox.EventType.TEXT_CHANGED, this.onEditBoxChanged, this);

        this.okBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.getCodeBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
    }
    public flush(): void {
        this.inputPassword.string = "";
        this.inputPasswordTwo.string = "";
        this.inputCode.string = "";
    }

    protected onShow() {
        
    }

    protected onHide(...args: any[]): void {
        
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
    
    private onBtnClick(btn: Button): void {
        switch (btn) {
            case this.okBtn:
                if(!this.inputPassword.string || this.inputPassword.string.length < 1){
                    MsgPanel.Show("请先输入密码");
                    return;
                }
                if(this.inputPassword.string.length < 6){
                    MsgPanel.Show("输入密码不足6位");
                    return;
                }
                if(this.inputPasswordTwo.string != this.inputPassword.string){
                    MsgPanel.Show("二次确认密码与密码不符");
                    return;
                }
                if(!this.inputCode.string || this.inputCode.string.length < 1){
                    MsgPanel.Show("请先输入验证码");
                    return;
                }
                Tips.Show("是否确定设置二级密码", () => {
                    let data = {
                    type: MsgTypeSend.ResetPasswordValid,
                    data:{
                            token: GetUserCode(),
                            code:this.inputCode.string,
                            password: Md5Utils.hash(Md5Utils.hash(this.inputPassword.string)),
                            uuidV1:PlayerData.roleInfo.player_id+":"+(new Date()).getTime()
                        }
                    }
                    //console.log("setting---->" + data.data.password);
                    Session.Send(data, null, null, true);
                });
                
                break;
            case this.getCodeBtn:
                Session.Send({type: MsgTypeSend.ResetPasswordSend, data: {token: GetUserCode()}});
                break;
        }
    }

}