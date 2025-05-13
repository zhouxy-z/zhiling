import { Canvas, Node, UITransform, View, find, game } from "cc";
export type ServerCfg = {
    Host?: string,
    Rank?: string,
    AppId?: string,
    state?: number,
    Mark?: string,
    msg?: string,
    Desc?: string
}
export const mod: any = {};
export class GameSet {
    /**
     * 游戏全局配置
     */
    static globalCfg: {
        debug: boolean,
        root_url: string,
        backstage: string,
        client_version: number,
        cfg_version: number,
        reset: string,
        kefu: { qq: { icon: string, url: string }, wx: { icon: string, url: string }, kf: { icon: string, url: string } },
        changes: [{ ID: number, Uid: string, Shopowner_Name: string, QQid: string, VXid: string }],
        ad_channel: {
            rewardAdId1: number,
            rewardAdId2: number,
            rewardAdId3: number,
            rewardAdId4: number,
        },
        server_list: ServerCfg[]
    };

    static usecode: string = "";

    static Scenelayer = 1;

    static debug = false;

    private static sceneCanvasTrans: UITransform;
    private static sceneCanvas: Node;
    static GetSceneCanvas() {
        if (!this.sceneCanvas) {
            this.sceneCanvas = find("SceneCanvas");
            this.sceneCanvasTrans = this.sceneCanvas.getComponent(UITransform);
        }
        return this.sceneCanvas;
    }
    private static get sceneTrans() {
        this.GetSceneCanvas();
        return this.sceneCanvasTrans;
    }

    private static uiCanvasTrans: UITransform;
    private static uiCanvas: Node;
    static GetUICanvas() {
        if (!this.uiCanvas) {
            this.uiCanvas = find("Canvas");
            this.uiCanvasTrans = this.uiCanvas.getComponent(UITransform);
        }
        return this.uiCanvas;
    }
    private static get uiTrans() {
        this.GetUICanvas();
        return this.uiCanvasTrans;
    }


    static get SceneCanvasWidth() {
        return this.sceneTrans.contentSize.width;
    }
    static get SceneCanvasHeight() {
        return this.sceneTrans.contentSize.height;
    }
    static get Half_Width_SceneCanvas() {
        return this.SceneCanvasWidth / 2;
    }
    static get Half_Height_SceneCanvas() {
        return this.SceneCanvasHeight / 2;
    }

    static get UICanvasWidth() {
        return this.uiTrans.contentSize.width;
    }

    static get UICanvasHeight() {
        return this.uiTrans.contentSize.height - this.StatusBarHeight;
    }

    static get Half_width_UICanvas() {
        return this.UICanvasWidth / 2;
    }
    static get Half_Height_UICanvas() {
        return this.UICanvasHeight / 2;
    }

    static get Frame_Tick() {
        return 1 / Number(game.frameRate);
    }

    static Token: string = '';
    static GateUrl: string = "";

    static HomeWidth: number = 1080;
    static HomeHeight: number = 1920;
    static HomeScale: number = 1;

    private static updatels: Function[] = [];
    private static thisObjs = [];
    static RegisterUpdate(update: Function, thisObj: any) {
        if (this.updatels.indexOf(update) == -1 || this.thisObjs.indexOf(thisObj) == -1) {
            this.updatels.push(update);
            this.thisObjs.push(thisObj);
        }
    }
    static UpRegisterUpdate(update: Function, thisObj?: any) {
        for (let i = this.updatels.length - 1; i >= 0; i--) {
            if (this.updatels[i] == update && (!thisObj || thisObj == this.thisObjs[i])) {
                this.updatels.splice(i, 1);
                this.thisObjs.splice(i, 1);
            }
        }
    }
    static Update(dt: number) {
        let ls = this.updatels.concat();
        let objs = this.thisObjs.concat();
        for (let i = 0; i < ls.length; i++) {
            let h = ls[i];
            let obj = objs[i];
            if (obj) {
                h.apply(obj, [dt]);
            } else {
                h(dt);
            }
        }
    }

    /**
     * 获取服务器标识
     * @returns 
     */
    static GetServerMark() {
        let mark = this.Server_cfg?.Mark;
        if (!mark) return "cw";
        if (mark == "_Rlite") return "jy";
        if (mark == "_hc") return "hc";
        if (mark == "_xf") return "xf";
        return undefined;
    }

    static GetMoneyName() {
        if (this.GetServerMark() == "hc") {
            return "幻彩石";
        } else if(this.GetServerMark() == "xf"){
            return "灵石";
        } else {
            return "彩虹体";
        }
    }

    static Local_host = "";
    static Server_cfg: ServerCfg = {};

    static StatusBarHeight = 0;

    static Reconnect = false;

    static maxConcurrency = 12;

    static intoGame = false;

    static ForBack: () => string = function () { return ""; };
}