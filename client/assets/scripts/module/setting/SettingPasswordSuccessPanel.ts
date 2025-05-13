import { Panel } from "../../GameRoot";

export class SettingPasswordSuccessPanel extends Panel {
    protected prefab: string = "prefabs/panel/setting/SettingPasswordSuccessPanel";
    protected onLoad(): void {
        
        this.CloseBy("mask");
        this.CloseBy("closeBtn");
        this.CloseBy("okBtn");
        
    }
    public flush(): void {
        
    }

    protected onShow() {
        
    }

    protected onHide(...args: any[]): void {
        
    }
    
}