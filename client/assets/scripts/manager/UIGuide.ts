import { BlockInputEvents, Button, EventTouch, Input, Node, Sprite, SpriteFrame, UITransform, error, find, game, instantiate, js, path } from "cc";
import { Panel } from "../GameRoot";
import { EditorGuide } from "../editor/EditorGuide";
import { GameSet } from "../module/GameSet";
import { IPointTo } from "../module/guide/GuideInterface";
import { HomeLogic } from "../module/home/HomeLogic";
import { Tips } from "../module/login/Tips";
import PlayerData, { } from "../module/roleModule/PlayerData"
import { BuildingState, PlayerDataMap } from "../module/roleModule/PlayerStruct";
import { GetGameData, SaveGameData } from "../net/MsgProxy";
import { CfgMgr, ConditionType, StdGuide, StdRedPoint, StdStep, StdSystemOpen } from "./CfgMgr";
import { CheckCondition } from "./ConditionMgr";
import { EventMgr, Evt_ConfigData_Update, Evt_Guide_Close, Evt_Guide_Step, Evt_ReConnect, Evt_ResetConfig, Evt_Tween_To } from "./EventMgr";
import { PointTo1 } from "../module/guide/PointTo1";
import { PointTo2 } from "../module/guide/PointTo2";
import { ResMgr, folder_common } from "./ResMgr";
import { DEV } from "cc/env";
import { GMPanel } from "../debug/GMPanel";
import { PANEL_TYPE } from "./PANEL_TYPE";
import { ProductionPanel } from "../module/production/ProductionPanel";

/**建筑面板，自动判断指定建筑id是否已经开启 */
const BUILDING_PANEL = {
    "ResourcesPanel": true,
    "SoldierProductionPanel": true,
    "CompoundPanel": true,
    "ProductionPanel": true,
    "FanyuPanel": true,
}

export class UIGuide {
    constructor() {
        EventMgr.on(Evt_ConfigData_Update, this.init, this);
        EventMgr.on(Evt_ResetConfig, this.resetDoors, this);
        EventMgr.on('ui_guide', this.fetch, this);

        if (DEV) {
            new EditorGuide();
            EventMgr.on("gm", () => {
                GMPanel.Show();
            });
            EventMgr.once("gm_guide", id => {
                let std: StdGuide = CfgMgr.Get("guide")[id];
                if (!std) return;
                this.guides[id] = new Guide(std, 1);
            }, this);
        }
    }
    private classzs = {};
    protected GetPanel(key: string) {
        if (this.classzs[key]) return this.classzs[key];
        this.classzs[key] = js.getClassByName(key);
        return this.classzs[key];
    }
    protected fetch(param: string | typeof Panel, ...arg: any[]) {
        let type: string;
        if (typeof (param) != "string") {
            for (let k in PANEL_TYPE) {
                let panel = this.GetPanel(k);
                if (panel == param) {
                    type = k;
                    break;
                }
            }
        } else {
            type = param;
        }

        if (type == undefined) {
            return;
        }

        if (type == "go_home") {
            HomeLogic.ins.EnterMyHomeScene(arg[0]);
        } else {
            if (BUILDING_PANEL[type] && arg[0]) {
                let buildingId = arg[0];
                let sbuilding = PlayerData.GetBuilding(buildingId);
                if (!sbuilding || sbuilding.state == BuildingState.Lock || sbuilding.level == 0) {
                    let def = CfgMgr.GetBuildingUnLock(buildingId);
                    Tips.Show(def ? def.remark + "尚未建造" : "请先建造此建筑");
                    EventMgr.emit(Evt_Tween_To, buildingId);
                    return;
                }
            }
            //panel
            let route = type.split(".");
            type = route.shift();
            if (!this.syslst[type]) {
                let panel = this.GetPanel(type);
                if (panel) {
                    if (route.length) {
                        let func: Function = panel;
                        for (let node of route) {
                            func = func[node];
                        }
                        func.call(panel, ...arg);
                    } else {
                        panel.Show(...arg);
                    }
                }
            } else {
                if (route.length > 0 && route[0] == "Hide") return;
                for (let n = 1; ; n++) {
                    let types = this.syslst[type].Std['ConditionId' + n];
                    let values = this.syslst[type].Std['ConditionValue' + n];
                    if (types && values) {
                        let seed = undefined;
                        let curType, curValue;
                        for (let i = 0; i < types.length; i++) {
                            curType = types[i];
                            curValue = values[i];
                            seed = CheckCondition(curType, curValue);
                            if (seed != undefined) {
                                if (this.syslst[type].Std.Tips) Tips.Show(this.syslst[type].Std.Tips);
                                return;
                            }
                        }
                        if (seed) {
                            Tips.Show(seed);
                            break;
                        }
                    } else {
                        Tips.Show(`系统暂未开启`);
                        break;
                    }
                }
            }
        }
    }

    private syslst: { [panel: string]: SystenDoor } = {};
    private guides: Guide[] = [];
    private guide_datas: number[];
    private redPoints: RedPoint[] = [];

    /**
     * 初始引导系统
     */
    protected init() {
        // 初始化引导
        this.guide_datas = GetGameData(PlayerDataMap.Guide) || [];
        // let stds = CfgMgr.Get('guide');
        // for (let k in stds) {
        //     let std: StdGuide = stds[k];
        //     let id = Number(k);
        //     let t = std.Times - (this.guide_datas[id] || 0);
        //     if (t > 0) {
        //         this.guides[id] = new Guide(std, t);
        //     }
        // }

        this.redPoints.length = 0;
        
        // 初始化红点
        let stdReds = CfgMgr.Get("red_point");
        console.log(stdReds);
        for (let k in stdReds) {
            let std: StdRedPoint = stdReds[k];
            this.redPoints.push(new RedPoint(std));
        }

        // 初始化系统开启
        this.resetDoors();

        let thisObj = this;
        EventMgr.on("update_guide", () => {
            thisObj.loop = 1;
        }, this);
        GameSet.RegisterUpdate(this.update, this);
    }

    protected resetDoors() {

        // 更新所有系统入口
        for (let k in this.syslst) {
            let systemDoor = this.syslst[k];
            systemDoor.update();
            this.syslst[k].resetBtn();
            delete this.syslst[k];
        }

        // 初始化系统开启
        let stdSys: { [key: string]: StdSystemOpen } = CfgMgr.GetSysOpenMap();
        let loop = 1;
        for (let k in stdSys) {
            let std: StdSystemOpen = stdSys[k];
            let panels = std.Panel.length ? std.Panel : ["panel@" + (loop++)];
            for (let panel of panels) {
                this.syslst[panel] = new SystenDoor(std);
            }
        }
    }

    private loop = 1;
    private tick: number = 1;
    protected update(dt: number) {
        this.tick += dt;
        if (this.tick < 0.25) return;
        this.tick = 0;
        if (!this.loop) return;
        this.loop = 0;

        try {
            // 更新所有引导
            for (let i = 0; i < this.guides.length;) {
                let guide = this.guides[i];
                if (!guide) {
                    i++;
                    continue;
                }
                if (guide.isFinish) {
                    // 完成引导
                    this.guides.splice(i, 1);
                    this.guide_datas[guide.std.ID] = (this.guide_datas[guide.std.ID] || 0) + guide.std.Times;
                    SaveGameData(PlayerDataMap.Guide, this.guide_datas);
                } else {
                    // 继续轮训
                    guide.update();
                    i++;
                }
            }

            // 更新所有系统入口
            for (let k in this.syslst) {
                let systemDoor = this.syslst[k];
                systemDoor.update();
                if (systemDoor.isOpen) {
                    this.syslst[k].resetBtn();
                    delete this.syslst[k];
                }
            }

            // 更新所有红点
            for (let redPoint of this.redPoints) {
                redPoint.resetIcon();
            }
            for (let redPoint of this.redPoints) {
                redPoint.update();
            }
        } catch (e) {
            console.warn(e);
        }

    }
}

/**
 * 引导
 */
class Guide {
    public std: StdGuide;
    private times: number;
    private step: IPointTo;
    constructor(std: StdGuide, times: number) {
        this.std = std;
        this.times = times;
        EventMgr.on(Evt_Guide_Step, this.onStep, this);
        EventMgr.on(Evt_Guide_Close, this.onClose, this);
    }
    update() {
        if (this.isFinish) return;
        // 判断触发条件
        let canRun = false;
        for (let n = 1; ; n++) {
            let types = this.std['ConditionId' + n];
            let values = this.std['ConditionValue' + n];
            if (types == undefined || values == undefined) break;
            let seed = true;
            for (let i = 0; i < types.length; i++) {
                let type = types[i];
                let value = values[i];
                if (CheckCondition(type, value)) {
                    seed = false;
                    break;
                }
            }
            if (seed) {
                canRun = true;
                break;
            }
        }

        // 判断关闭条件
        let types = this.std.CloseConditionId;
        let values = this.std.CloseConditionValue;
        if (types && types.length) {
            let close = true;
            for (let i = 0; i < types.length; i++) {
                let type = types[i];
                let value = values[i];
                if (CheckCondition(type, value)) {
                    close = false;
                    break;
                }
            }
            if (close) {
                if (this.step) this.step.Receive();
                this.times = 0;
                return;
            }
        }

        if (!canRun) {
            if (this.step) this.step.active = false;
            return;
        }

        let steps = CfgMgr.Get("step");
        for (let i = this.std.Step.length - 1; i >= 0; i--) {
            let stdStep: StdStep = steps[this.std.Step[i]];
            let target = find(stdStep.UI);
            if (target && target.activeInHierarchy) {
                switch (this.std.Type) {
                    case 1:
                        if (this.step instanceof PointTo1) break;
                        if (this.step) this.step.Receive();
                        this.step = PointTo1.Create();
                        break;
                    case 2:
                        if (this.step instanceof PointTo2) break;
                        if (this.step) this.step.Receive();
                        this.step = PointTo2.Create();
                        break;
                }
                this.step.Update(target, stdStep.Desc, undefined, undefined, undefined, this.std, i);
                return;
            }
        }
    }
    protected onStep(std: StdGuide, index: number) {
        if (std == this.std) {
            if (this.std.Step.length - 1 <= index) {
                this.times--;
            }
        }
    }
    protected onClose(std: StdGuide) {
        if (std == this.std) this.times = 0;
    }
    get isFinish() {
        return this.times <= 0;
    }
}

/**
 * 红点
 */
class RedPoint {
    private std: StdRedPoint;
    private steps: Node[] = [];
    constructor(std: StdRedPoint) {
        this.std = std;
    }
    update() {
        // 判断触发条件
        let canRun = false;
        for (let n = 1; ; n++) {
            let types = this.std['ConditionId' + n];
            if (types == undefined || types.length <= 0) break;

            let seed = true;
            for (let i = 0; i < types.length; i++) {
                let type = types[i];
                if (CheckCondition(type, 0)) {
                    seed = false;
                    break;
                }
            }
            if (seed) {
                canRun = true;
                break;
            }
        }

        let stdSteps = CfgMgr.Get('step');
        let lastRed: Node;
        for (let n = 1; ; n++) {
            let step = this.std['Step' + n];
            if (step == undefined) break;
            let id = step;
            let stdStep: StdStep = stdSteps[id];
            let target = stdStep.UI ? find(stdStep.UI) : null;
            if (target) {
                //console.error("----->" + stdStep.UI + "---->" + canRun);
                if (step) {
                    let icon: Node;
                    if (canRun) {
                        icon = ResMgr.AddRedpoint(target);
                        this.steps[this.steps.length] = icon;
                        lastRed = icon;
                    } else {
                        icon = target.getChildByName("red_point");
                        lastRed = icon;
                    }
                }

            }
        }
        if (lastRed) lastRed.active = canRun;

    }

    resetIcon() {
        this.steps.forEach((icon) => {
            icon.active = false;
        })
    }
}

/**
 * 系统开启
 */
class SystenDoor {
    private std: StdSystemOpen;
    private open: boolean = false;
    private msg: string;
    constructor(std: StdSystemOpen) {
        this.std = std;
    }
    update() {
        //采集时长幻彩城精英服不检测由主界面检测
        if (this.std.ID == 6) {
            if (GameSet.GetServerMark() == "hc" || GameSet.GetServerMark() == "jy") {
                return;
            }
        }
        // 判断触发条件
        let seed = true;
        for (let n = 1; ; n++) {
            let types = this.std['ConditionId' + n];
            let values = this.std['ConditionValue' + n];
            if (types == undefined || types.length == 0 || values == undefined) break;

            for (let i = 0; i < types.length; i++) {
                let type = types[i];
                let value = values[i];
                if (type == ConditionType.moonCard) {
                    value = [values[i]];
                }
                this.msg = CheckCondition(type, value);
                if (this.msg != undefined) {
                    seed = false;
                    break;
                }
            }
        }
        if (seed) {
            this.open = true;
        }
        if (this.open) return;
        let stdSteps = CfgMgr.Get('step');
        let doorSteps: any[] = this.std.Step;
        if (!doorSteps || !doorSteps.length) doorSteps = this.std['UI'] || [];
        for (let i = 0; i < doorSteps.length; i++) {
            let id = doorSteps[i];
            let target;
            if (typeof (id) == "number") {
                let stdStep: StdStep = stdSteps[id];
                if (!stdStep || !stdStep.UI) continue;
                target = find(stdStep.UI);
            } else {
                target = find(id);
            }
            if (!target) continue;
            // 系统入口开启或隐藏样式
            switch (this.std.HideType) {
                case 0:
                    target.active = false;
                    break;
                case 1:
                // SetNodeGray(target, true, true);
                // this.maskTouch(target);
                // break;
                case 2:
                    if (target.getChildByName(`lock`)) {
                        target.getChildByName(`lock`).active = true;
                    } else {
                        let lock = new Node("lock");
                        let sprite = lock.addComponent(Sprite);
                        target.addChild(lock);
                        ResMgr.LoadResAbSub(path.join(folder_common, "lock/spriteFrame"), SpriteFrame, sf => {
                            sprite.spriteFrame = sf;
                        });
                    }
                    this.maskTouch(target);
                    break;
                default:
                    target.active = this.open;
            }
        }
    }

    protected maskTouch(target: any) {
        if (!target['$$mask']) {
            let size = target.getComponent(UITransform).contentSize;
            let sx = target.getScale().x, sy = target.getScale().y;
            let mask = new Node('mask');
            mask.addComponent(Sprite);
            mask.addComponent(BlockInputEvents);
            mask.getComponent(UITransform).setContentSize(size.width * sx, size.height * sy);
            target.addChild(mask);
            target['$$mask'] = mask;
            mask['$$target'] = target;
            mask.on(Input.EventType.TOUCH_START, this.breakTouch, this);
            mask.on(Input.EventType.TOUCH_END, this.breakTouch, this);
            mask.on(Input.EventType.TOUCH_CANCEL, this.breakTouch, this);
            target.on(Node.EventType.PARENT_CHANGED, this.onParentChange, this);
        }
    }
    protected breakTouch(e: EventTouch) {
        let target = e.currentTarget['$$target'];
        let btn = target.getComponent(Button);
        if (btn) {
            if (e.type == Input.EventType.TOUCH_END) {
                btn['_pressed'] = false;
                btn['_updateState']();
            } else {
                let evt = instantiate(e);
                evt.target = btn;
                evt.currentTarget = btn;
                target.dispatchEvent(evt);
            }
        }
        if (e.type == Input.EventType.TOUCH_END) Tips.Show(this.msg);
    }
    protected onParentChange(target: any) {
        if (!target || !target['$$mask']) return;
        if (target['$$mask'].parent) {
            target['$$mask'].parent.removeChild(target['$$mask']);
        }
    }

    resetBtn() {
        let stdSteps = CfgMgr.Get('step');
        for (let i = 0; i < this.std.Step.length; i++) {
            let id = this.std.Step[i];
            let stdStep: StdStep = stdSteps[id];
            if (!stdStep || !stdStep.UI) continue;
            let target = find(stdStep.UI);
            if (!target) continue;
            // 系统入口开启或隐藏样式
            // SetNodeGray(target, false, false);
            target.active = true
            if (target.getChildByName(`lock`)) target.getChildByName(`lock`).active = false;
            if (target['$$mask']) {
                let mask = target['$$mask'];
                target['$$mask'] = undefined;
                mask.off(Input.EventType.TOUCH_START);
                mask.off(Input.EventType.TOUCH_END);
                mask.off(Input.EventType.TOUCH_CANCEL);
                mask.parent && mask.parent.removeChild(mask);
                mask.destroy();
            }
        }
    }
    get isOpen() {
        return this.open;
    }
    get Std() {
        return this.std;
    }
}