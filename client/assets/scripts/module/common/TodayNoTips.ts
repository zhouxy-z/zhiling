import { Button, Label, RichText, Toggle } from "cc";
import { Panel } from "../../GameRoot";
import { TodayNoTipsId } from "../roleModule/PlayerStruct";
import PlayerData from "../roleModule/PlayerData";

export class TodayNoTips extends Panel {
    protected prefab: string = "prefabs/common/TodayNoTips";
    private titleLab:Label;
    private contLab:RichText;
    private okBtn:Button;
    private okBtnLab:Label;
    private checkBtn:Toggle;
    private cancelBtn:Button;
    private cancelBtnLab:Label;
    private callBack:(cbType:number)=>void;
    private tipsId:TodayNoTipsId;
    private cbType:number;
    
    protected onLoad(): void {
        this.titleLab = this.find("cont/titleCont/titleLab", Label);
        this.contLab = this.find("cont/labCont/contLab", RichText); 
        this.checkBtn = this.find("cont/checkBtn", Toggle);
        this.okBtn = this.find("cont/btnCont/okBtn", Button);
        this.okBtnLab = this.find("cont/btnCont/okBtn/okBtnLab", Label);
        this.cancelBtn = this.find("cont/btnCont/cancelBtn", Button);
        this.cancelBtnLab = this.find("cont/btnCont/cancelBtn/cancelBtnLab", Label);

        this.okBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.cancelBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
    }
    public flush(cont:string, callBack:(cbType:number)=>void, id?:TodayNoTipsId, btnTitle:string[] = ["确定", "取消"], title:string = "提示"): void {
        this.callBack = callBack;
        this.cbType = 1;
        if(id > 0){
            this.checkBtn.node.active = true;
            if(!PlayerData.GetIsShowTodayTips(id)){
                this.Hide();
                return;
            }
        }else{
            this.checkBtn.node.active = false;
        }
        this.checkBtn.isChecked = false;
        this.contLab.string = cont;
        this.tipsId = id;
        this.titleLab.string = title;
        
        if(btnTitle && btnTitle.length){
            if(btnTitle.length == 1){
                this.okBtn.node.active = true;
                this.cancelBtn.node.active = false;
                this.okBtnLab.string = btnTitle[0];
            }else{
                this.okBtn.node.active = true;
                this.cancelBtn.node.active = true;
                this.okBtnLab.string = btnTitle[0];
                this.cancelBtnLab.string = btnTitle[1];
            }
        }else{  
            this.okBtn.node.active = false;
            this.cancelBtn.node.active = false;
        }
    }
    protected onShow(): void {
        
    }
    
    protected onHide(...args: any[]): void {
        if(this.checkBtn.node.active && this.checkBtn.isChecked){
           PlayerData.SetTodayTips(this.tipsId);
        }
        if(this.callBack != null){
            this.callBack(this.cbType);
            
        }
    }

    private onBtnClick(btn:Button):void{
        switch(btn){
            case this.okBtn:
                this.cbType = 1;
                break;
            case this.cancelBtn:
                this.cbType = 2;
                break;
        }
        this.Hide();
    }
    
}