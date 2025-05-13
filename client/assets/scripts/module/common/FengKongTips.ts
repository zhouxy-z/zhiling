import { Button, Label, RichText } from "cc";
import { Panel } from "../../GameRoot";

export class FengKongTips extends Panel {
    protected prefab: string = "prefabs/common/FengKongTips";
    private titleLab:Label;
    private contLab:RichText;
    private okBtn:Button;
    private okBtnLab:Label;
    private cancelBtn:Button;
    private cancelBtnLab:Label;
    private callBack:(cbType:number)=>void = null;
    private cbType:number;
    
    protected onLoad(): void {
        this.titleLab = this.find("cont/titleCont/titleLab", Label);
        this.contLab = this.find("cont/labCont/contLab", RichText); 
        this.okBtn = this.find("cont/btnCont/okBtn", Button);
        this.okBtnLab = this.find("cont/btnCont/okBtn/okBtnLab", Label);
        this.cancelBtn = this.find("cont/btnCont/cancelBtn", Button);
        this.cancelBtnLab = this.find("cont/btnCont/cancelBtn/cancelBtnLab", Label);

        this.okBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.cancelBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
    }
    public flush(cont:string, callBack:(cbType:number)=>void, btnTitle:string[] = ["确定", "取消"], title:string = "提示"): void {
        this.callBack = callBack;
        this.cbType = 1;
        this.contLab.string = cont;
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