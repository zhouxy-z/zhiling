import { Button, Canvas, Input, Node, UITransform, Widget } from "cc";
import { Panel } from "../../GameRoot";
import LocalStorage from "../../utils/LocalStorage";
import { CfgMgr } from "../../manager/CfgMgr";
import { GameSet } from "../GameSet";

export class SelectHomePanel extends Panel {
    protected prefab: string = "prefabs/ui/SelectHomePanel";
    protected effect1: Node;
    protected effect2: Node;
    protected selectIndex = 1;
    protected callBack: Function;
    protected async onLoad() {
        this.effect1 = this.find("frame/effect1");
        this.effect2 = this.find("frame/effect2");
        this.find("frame/select1").on(Input.EventType.TOUCH_END, this.onSelect1, this);
        this.find("frame/select2").on(Input.EventType.TOUCH_END, this.onSelect2, this);
        this.find("frame/enter").on(Button.EventType.CLICK, this.onEnter, this);

        this.select(LocalStorage.GetNumber("SelectHomePanel", 1));
    }

    private onSelect1() {
        this.select(1);
    }
    private onSelect2() {
        this.select(2);
    }

    private onEnter() {
        LocalStorage.SetNumber("SelectHomePanel", this.selectIndex);
        if (this.selectIndex == 1) {
            
            this.callBack();
        } else {
            let list = [];
            if (GameSet.globalCfg) {
                list = GameSet.globalCfg.server_list;
            } else {
                list = CfgMgr.GetServerList();
            }
            for (let server of list) {
                if (server.Mark == "_Rlite") {
                    GameSet.Local_host = server.Host;
                    GameSet.Server_cfg = server;
                    CfgMgr.InitServerCfg(GameSet.Server_cfg.Mark);
                    this.callBack();
                    return;
                }
            }
        }
    }

    private select(index: number) {
        if (index == 1) {
            this.selectIndex = 1;
            this.effect1.active = true;
            this.effect2.active = false;
        } else {
            this.selectIndex = 2;
            this.effect1.active = false;
            this.effect2.active = true;
        }
    }

    protected onShow(): void {

    }
    public flush(callBack: Function): void {
        this.callBack = callBack;
    }
    protected onHide(...args: any[]): void {

    }

}