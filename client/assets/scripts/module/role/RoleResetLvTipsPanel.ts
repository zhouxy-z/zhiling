import { Button, RichText } from "cc";
import { Panel } from "../../GameRoot";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import { CfgMgr, StdCommonType } from "../../manager/CfgMgr";

export class RoleResetLvTipsPanel extends Panel {
    protected prefab: string = "prefabs/panel/role/RoleResetLvTipsPanel";
    private cont:RichText;
    private btn:Button;
    private roleId:string;
    protected onLoad(): void {
        this.cont = this.find("cont", RichText);
        this.btn = this.find("btn", Button);
        this.btn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.CloseBy("closeBtn");
        this.CloseBy("mask");
    }
    public flush(roleId:string): void{
        this.roleId = roleId;
        this.updateShow();
    }
    
    protected onShow(): void {
        
    }

    protected onHide(...args: any[]): void {
        
    }
    
    private updateShow():void{
        let rate:number = CfgMgr.GetCommon(StdCommonType.RoleQualityuo).ReturnExp * 100;
        let tipsStr:string = `是否确认重置该植灵等级植灵等级重置为<color=#138BD5>1级</color>返还<color=#E6721C>${rate}%</color>的升级道具与突破材料`;
        this.cont.string = tipsStr;
    }
    private onBtnClick(btn: Button): void {
        Session.Send({type: MsgTypeSend.ResetRole, data:{role_id:this.roleId}});    
        this.Hide(); 
    }
    
}