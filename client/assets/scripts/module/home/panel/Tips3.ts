import { RichText, ScrollView, UITransform, Node, Widget, Label} from "cc";
import { Panel } from "../../../GameRoot";
import { CfgMgr } from "../../../manager/CfgMgr";

export class Tips3 extends Panel {
    protected prefab: string = "prefabs/ui/Tips3";
    private ScrollView: ScrollView

    private label: Label;
    private titleLab: Label;
    protected onLoad(): void {
        this.titleLab = this.find("frame/titleLab", Label);
        this.label = this.find("frame/ScrollView/view/content/label", Label);
        this.ScrollView = this.find("frame/ScrollView", ScrollView);
        this.CloseBy("frame/topCont/close");
        // this.CloseBy("mask");
    }

    protected onShow(): void {

    }
    public flush(id: number): void {
        let str_cfg = this.GetLanguageById(id)
        let result = str_cfg.Desc.replace(/\\n/g, '\n');
        this.label.string = result;
        this.titleLab.string = str_cfg.Title;
        this.ScrollView.scrollToTop(0.01);
    }
   

    private GetLanguageById(id: number) {
        let cfg = CfgMgr.Get("RiskWarning");
        for (const iterator of cfg) {
            if (iterator.ID == id) {
                return iterator;
            }
        }
        return null
    }

    protected onHide(...args: any[]): void {

    }
}