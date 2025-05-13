import { _decorator, Button, CCBoolean, Color, Component, find, Input, instantiate, Label, Layout, Node, ScrollView, Toggle, ToggleContainer, UITransform, Vec2, Widget } from 'cc';
import { Evt_Building_Upgrade_Complete, EventMgr, Goto } from '../../../manager/EventMgr';
import { Tips } from '../../login/Tips';
import { PANEL_TYPE } from '../../../manager/PANEL_TYPE';
const { ccclass, disallowMultiple, property, type } = _decorator;

@ccclass('BaseNavPage')
@disallowMultiple(true)
export class BaseNavPage extends Component {

    @property(CCBoolean)
    get showNavBtn(): boolean { return this.node.getChildByName("navBar").active; }
    set showNavBtn(value: boolean) {
        this.node.getChildByName("navBar").active = value;
    }

    @type([Node])
    pages: Node[] = [];

    private content: Node;
    private buildName: Label;
    private buildLevel: Label;
    private helpBtn: Node;
    private closeBtn: Node;
    private buildingId: number;
    private origin: Node;
    private navScroller: ScrollView;
    private contentH: number;
    private itemPool: Node[] = [];
    private static pageOffsets: { [uuid: string]: number } = {};
    private btnTiles: string[] = [];

    _level: number = 0;
    _name: string;
    _levelBtn: Node;
    
    protected onLoad(): void {
        this.content = this.node.getChildByPath("navBar/view/content");
        this.contentH = this.node.getComponent(UITransform).contentSize.height;
        this.navScroller = this.node.getChildByPath("navBar").getComponent(ScrollView);
        this.buildName = this.node.getChildByPath("frame/tileBar/buildName").getComponent(Label);
        this.buildLevel = this.node.getChildByPath("frame/tileBar/buildLevel").getComponent(Label);
        this.helpBtn = this.node.getChildByPath("frame/tileBar/helpBtn");
        this.closeBtn = this.node.getChildByPath("frame/closeBtn");

        this.closeBtn.on(Input.EventType.TOUCH_END, this.onClose, this);
        this.origin = this.content.children[0];
        this.content.removeChild(this.origin);
        this.itemPool.push(...this.content.children);
        this.content.removeAllChildren();

        if (!this.btnTiles.length) {
            for (let i = 0; i < this.pages.length; i++) {
                this.btnTiles.push("page" + i);
            }
            this.SetNav(this.btnTiles, [], ...this.pages);
        }

        this._levelBtn = this.node.getChildByPath("frame/levelBtn");
        this._levelBtn.on(Button.EventType.CLICK, () => {
            if(this.buildingId <= 0 || this._level <= 0)
            {
                Tips.Show(this._name + "尚未解锁");
                return;
            }
            Goto(PANEL_TYPE.BuildingUpgradePreviewPanel, this.buildingId, this._level, this._name);
        },this)

        EventMgr.on(Evt_Building_Upgrade_Complete, this.updateLevel, this);
    }

    private onClose() {
        this.node.emit("close");
    }

    /**
     * 设置标题
     * @param name 
     * @param level 
     */
    SetTile(name: string, buildingId: number, level?: number, preview: boolean = false) {
        this.buildingId = buildingId;
        this.buildName.string = name;
        if (level == undefined) {
            this.buildLevel.string = "";
        } else {
            this.buildLevel.string = "Lv." + level;
        }
        this._name = name;
        this._level = level;
        this._levelBtn.active = preview;
    }
    protected updateLevel(bulidingId: number, level: number) {
        if (this.buildingId == bulidingId) {
            this.buildLevel.string = "Lv." + level;
            this._level = level;
        }
    }

    /**
     * 设置切换按钮
     * @param btns 
     * @param unenabled 
     */
    SetNav(btns: string[], colors: string[] = [], ...pages: (Component | Node)[]) {
        console.log("SetNav", pages);
        this.btnTiles = btns;
        this.pages.length = 0;
        for (let page of pages) {
            let node: Node;
            if (page instanceof Node) {
                node = page
            } else {
                node = page.node;
            }
            node.active = false;
            this.pages.push(node);
            let widget = node.getComponent(Widget);
            if (!BaseNavPage.pageOffsets[node.uuid]) {
                BaseNavPage.pageOffsets[node.uuid] = (widget ? widget.bottom : node.position.y);
            }
        }
        this.itemPool.push(...this.content.children);
        this.content.removeAllChildren();
        for (let i = 0; i < btns.length; i++) {
            let item = this.itemPool.pop() || instantiate(this.origin);
            this.content.addChild(item);
            let lab = item.getChildByName("lab").getComponent(Label);
            let checkLab = find(`Checkmark/lab`, item).getComponent(Label);
            if (colors[i]) checkLab.color = new Color().fromHEX(colors[i]);
            lab.string = btns[i];
            checkLab.string = btns[i];
            // let toggle = item.getComponent(Toggle);
            item.on("toggle", this.onSelect, this);
        }
        if (btns.length > 4) {
            this.navScroller.horizontal = true;
            this.content.getComponent(UITransform).setContentSize(946.065, this.contentH);
        } else {
            this.navScroller.horizontal = false;
            this.content.setPosition(0, 0);
            if (btns.length < 3) {
                this.content.getComponent(Layout).resizeMode = Layout.ResizeMode.CHILDREN;
                this.content.getComponent(UITransform).setContentSize(880, this.contentH);
            } else {
                this.content.getComponent(Layout).resizeMode = Layout.ResizeMode.CONTAINER;
                this.content.getComponent(UITransform).setContentSize(946.065, this.contentH);
            }
        }
        this.layoutPage();
    }

    protected layoutPage() {
        if (this.btnTiles.length >= 2) {
            this.node.getChildByName("navBar").active = true;
            for (let i = 0; i < this.pages.length; i++) {
                let page = this.pages[i];
                let widget = page.getComponent(Widget);
                if (widget) {
                    widget.bottom = BaseNavPage.pageOffsets[page.uuid];
                } else {
                    page.setPosition(0, BaseNavPage.pageOffsets[page.uuid]);
                }
            }
        } else {
            this.node.getChildByName("navBar").active = false;
            for (let i = 0; i < this.pages.length; i++) {
                let page = this.pages[i];
                let widget = page.getComponent(Widget);
                if (widget) {
                    widget.bottom = BaseNavPage.pageOffsets[page.uuid] - 117.575;
                } else {
                    page.setPosition(0, BaseNavPage.pageOffsets[page.uuid] - 117.575);
                }
            }
        }
    }

    /**
     * 设置页签
     * @param index 
     */
    SetPage(index: number) {
        let child = this.content.children[index];
        if (!child) return;
        let t = child.getComponent(Toggle);
        t.isChecked = true;
        this.onSelect(t);
    }

    private onSelect(t: Toggle) {
        if (!t.isChecked) return;
        let index = this.content.children.indexOf(t.node);
        if (index == -1) return;
        let target: Node;
        if (this.pages && this.pages.length) {
            for (let i = 0; i < this.pages.length; i++) {
                let page = this.pages[i];
                if (i == index) target = page;
                page.active = i == index;
            }
        }
        // let lab = t.node.getChildByName("lab").getComponent(Label);
        // let color = t.isChecked ? '#63A6A9' : '#4C6C6E';
        // lab.color = new Color().fromHEX(color);
        this.node.emit("select", index, target);
    }

    start() {

    }

    update(deltaTime: number) {

    }
}


