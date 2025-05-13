import { Button, Component, path, Sprite, SpriteFrame } from "cc";
import { CfgMgr, StdHomeLand } from "../../../manager/CfgMgr";
import { folder_home, ResMgr } from "../../../manager/ResMgr";
import PlayerData from "../../roleModule/PlayerData";
import { HomeLogic } from "../HomeLogic";
import { UnlockHomeLandPanel } from "./UnlockHomeLandPanel";
import { SetNodeGray } from "../../common/BaseUI";
import { Session } from "../../../net/Session";
import { GameSet } from "../../GameSet";
import { EventMgr, Evt_ReLogin } from "../../../manager/EventMgr";

export class HomeItem extends Component {
    private btn: Button;
    private icon: Sprite;
    private data: StdHomeLand;
    private _clickCb: (name: StdHomeLand) => void = null;
    private isInit: boolean = false;
    protected onLoad(): void {
        this.btn = this.node.getComponent(Button);
        this.icon = this.node.getComponent(Sprite);
        this.btn.node.on(Button.EventType.CLICK, this.onClick, this);
        this.isInit = true;
        this.updateShow();

    }
    private onClick(): void {
        if (this.data) {
            if (this._clickCb != null) this._clickCb(this.data);
            if (GameSet.Server_cfg.Mark) {
                if (this.data.Mark == "_hc") {
                    let list = [];
                    if (GameSet.globalCfg) {
                        list = GameSet.globalCfg.server_list;
                    } else {
                        list = CfgMgr.GetServerList();;
                    }
                    for (let server of list) {
                        if (server.Mark == "_hc") {
                            Session.Close(() => {
                                GameSet.Local_host = server.Host;
                                GameSet.Server_cfg = server;
                                CfgMgr.InitServerCfg(GameSet.Server_cfg.Mark);
                                EventMgr.emit(Evt_ReLogin, GameSet.Server_cfg);
                            });
                            break;
                        }
                    }
                } else if (this.data.Mark == "_Rlite") {
                    let list = [];
                    if (GameSet.globalCfg) {
                        list = GameSet.globalCfg.server_list;
                    } else {
                        list = CfgMgr.GetServerList();;
                    }
                    for (let server of list) {
                        if (server.Mark == "_Rlite") {
                            Session.Close(() => {
                                GameSet.Local_host = server.Host;
                                GameSet.Server_cfg = server;
                                CfgMgr.InitServerCfg(GameSet.Server_cfg.Mark);
                                EventMgr.emit(Evt_ReLogin, GameSet.Server_cfg);
                            });
                            break;
                        }
                    }
                }
                return;
            }
            for (let info of PlayerData.roleInfo.homelands) {
                if (info.id == this.data.HomeId) {
                    HomeLogic.ins.EnterMyHomeScene(this.data.HomeId);
                    return;
                }
            }
            UnlockHomeLandPanel.Show(this.data.HomeId);
        }
    }
    SetClickCb(cb: (data: StdHomeLand) => void): void {
        this._clickCb = cb;
    }
    async SetData(data: StdHomeLand) {
        this.data = data;
        this.updateShow();
    }
    private updateShow(): void {
        if (!this.isInit) return;
        if (!this.data) {
            this.node.active = false;
            return;
        } else {
            this.node.active = true;
        }
        let url = path.join(folder_home, `home_${this.data.HomeId}`, "spriteFrame");
        ResMgr.LoadResAbSub(url, SpriteFrame, res => {
            this.icon.spriteFrame = res;
        });
        SetNodeGray(this.node, true, false);
        if (GameSet.Server_cfg.Mark) {
            SetNodeGray(this.node, false, false);
        } else {
            for (const homeData of PlayerData.roleInfo.homelands) {
                if (homeData.id == this.data.HomeId) {
                    SetNodeGray(this.node, false, false);
                    break;
                }
            }
        }
    }
}