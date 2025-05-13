import { Button, Component, Event, EventTouch, Input, Label, Layout, Node, RichText, ScrollView, Sprite, SpriteFrame, Toggle, Tween, UIOpacity, UITransform, Vec3, Widget, easing, find, instantiate, js, path, sp, tween, view } from "cc";
import { Panel } from "../../GameRoot";
import { AutoScroller } from "../../utils/AutoScroller";
import PlayerData, { RoleCardPower } from "../roleModule/PlayerData"
import { SPlayerDataRole, Tips2ID} from "../roleModule/PlayerStruct";
import { CardQuality, CfgMgr, StdRoleQualityUp, ThingItemId, ThingType } from "../../manager/CfgMgr";
import { ResMgr, folder_attr, folder_common, folder_icon, folder_item, folder_quality, folder_skill } from "../../manager/ResMgr";
import { Session } from "../../net/Session";
import { MsgTypeRet, MsgTypeSend } from "../../MsgType";
import { SetNodeGray } from "../common/BaseUI"
import { ToFixed } from "../../utils/Utils";
import { SelectHeroPanel } from "../common/SelectHeroPanel";
import { ShowHeroPanel } from "../common/ShowHeroPanel";
import { EventMgr, Evt_Currency_Updtae, Evt_Hide_Scene, Evt_Item_Change, Evt_Jinghua_Role, Evt_Role_Update, Evt_Show_Scene, Goto } from "../../manager/EventMgr";
import { SpriteLabel } from "../../utils/SpriteLabel";
import { ItemUtil } from "../../utils/ItemUtils";
import { TradeHeroPanel } from "../trade/TradeHeroPanel";
import { PANEL_TYPE } from "../../manager/PANEL_TYPE";
import { Tips } from "../login/Tips";
import { Tips2 } from "../home/panel/Tips2";

export class FanyuChongSuiPanel extends Panel {
    protected prefab: string = "prefabs/panel/FanyuChongSuiPanel";

    private add_jin_hua_btn: Node;
    private jinhua_roleInfo: Node;
    private jinhua_role_eff: Sprite;
    private jinhua_role: sp.Skeleton;
    private light_spine: sp.Skeleton;
    private jinhua_occupation: Sprite;
    private jinhua_quility: Sprite;
    private jinhua_Lv: Label;
    private jinhua_power: SpriteLabel;
    private jinhua_CarScroller: ScrollView;
    private role_item: Node;
    private jinhua_costLayout: AutoScroller;
    private randomBtn: Button;
    private jinhua_cost_node:Node
    private jinhua_closeBtn: Node;
    private jinhua_helpBtn:Node;
    private jinhua_Clone_item:Node;
    private _viewWide:number;
    private _itemWide:number;
    private car_conten:Node;
    private targetCard:Node;
    private closeBtn: Node;
    private navBar: Node;
    private carLayout: Node;
    private jinhuaRole: SPlayerDataRole;
    private jinhuaCfg: StdRoleQualityUp;
   

    protected onLoad() {
        this.closeBtn = this.find(`closeBtn`);
        this.carLayout = this.node.getChildByPath("jinhuaPage/car_bg/carLayout");
        this.jinhua_closeBtn = this.node.getChildByPath("jinhuaPage/jinhua_closeBtn");
        this.role_item = this.node.getChildByPath("jinhuaPage/car_bg/carScrollView/view/content/item");
        this.jinhua_Clone_item = this.node.getChildByPath("jinhuaPage/car_bg/carLayout/view/content/item");
        this.jinhua_roleInfo = this.node.getChildByPath("jinhuaPage/roleNode/roleInfo");
        this.add_jin_hua_btn = this.node.getChildByPath("jinhuaPage/roleNode/addBtn");
        this.jinhua_role = this.node.getChildByPath(`jinhuaPage/roleNode/roleInfo/roleNode/role`).getComponent(sp.Skeleton);
        this.jinhua_role_eff = this.node.getChildByPath("jinhuaPage/roleNode/roleInfo/role_eff").getComponent(Sprite);
        this.jinhua_occupation = this.node.getChildByPath("jinhuaPage/roleNode/roleInfo/occupation").getComponent(Sprite);
        this.jinhua_quility = this.node.getChildByPath("jinhuaPage/roleNode/roleInfo/quility").getComponent(Sprite);
        this.jinhua_Lv = this.node.getChildByPath("jinhuaPage/roleNode/roleInfo/Lv").getComponent(Label);
        this.jinhua_power = this.node.getChildByPath("jinhuaPage/roleNode/roleInfo/power").addComponent(SpriteLabel);
        this.jinhua_CarScroller = this.node.getChildByPath("jinhuaPage/car_bg/carScrollView").getComponent(ScrollView);
        this.car_conten = this.node.getChildByPath("jinhuaPage/car_bg/carLayout/view/content");
        this.targetCard = this.node.getChildByPath("jinhuaPage/car_bg/target");
        this.jinhua_cost_node = this.node.getChildByPath("jinhuaPage/costNode")
        this.jinhua_costLayout = this.node.getChildByPath("jinhuaPage/costNode/costLayout").getComponent(AutoScroller);
        this.jinhua_costLayout.SetHandle(this.updateCostItem.bind(this));
        this.light_spine = this.node.getChildByPath(`jinhuaPage/car_bg/light_spine`).getComponent(sp.Skeleton);

        this.car_conten.removeChild(this.jinhua_Clone_item);
        this.targetCard.active = false;
        this._viewWide = this.find("jinhuaPage/car_bg/carLayout/view").getComponent(UITransform).contentSize.width;
        this._itemWide = this.jinhua_Clone_item.getComponent(UITransform).contentSize.width+this.car_conten.getComponent(Layout).spacingX;

        this.randomBtn = this.node.getChildByPath("jinhuaPage/btnNode/randomBtn").getComponent(Button);
        this.jinhua_helpBtn = this.node.getChildByPath("jinhuaPage/helpBtn");
        this.navBar = this.find("navBar");
        let thisObj = this;
        this.navBar.children.forEach((node, index) => {
            node.on(Input.EventType.TOUCH_END, () => {
                thisObj.setNav(index)
            })
        })
        this.closeBtn.on(Input.EventType.TOUCH_END, this.Hide, this);
        this.add_jin_hua_btn.on(Input.EventType.TOUCH_END, this.onAddJinhuaRole, this);
        this.jinhua_role.node.parent.on(Input.EventType.TOUCH_END, this.onAddJinhuaRole, this);
        this.randomBtn.node.on("click", this.onJinHua, this);
        this.jinhua_closeBtn.on(Input.EventType.TOUCH_END, this.onBackJinhua, this);
        this.jinhua_helpBtn.on(Input.EventType.TOUCH_END, this.onHelpBtn2, this);
        
        EventMgr.on(Evt_Item_Change, this.updateItem, this)
        EventMgr.on(Evt_Currency_Updtae, this.updateItem, this)
    }

    protected onShow(): void {
        EventMgr.on(Evt_Jinghua_Role, this.OnJinHuaCallBack, this);
        EventMgr.emit(Evt_Hide_Scene, js.getClassName(this));
    }

    public flush(...args: any[]): void {    
        // this.setNav(2)
        this.initJinHuaData();
    }

    //切页
    private setNav(index) {
        if (index == 0) {
            Goto(PANEL_TYPE.FanyuPanel)
            this.Hide();
        } else if (index == 1) {
            Goto(PANEL_TYPE.FanyuJinHuaPanel)
            this.Hide();
        } else if (index == 2) {

        } else if (index == 3) {
            Goto(PANEL_TYPE.FanyuXiLianPanel);
            this.Hide();
            return;
        } 
    }

    private initJinHuaData(){
        this.tweenStep = 1;
        this.jinhuaRole = null;
        this.navBar.active = true;
        this.closeBtn.active = true;
        this.jinhua_closeBtn.active = false;
        this.add_jin_hua_btn.active = true;
        this.jinhua_roleInfo.active = false;
        this.jinhua_cost_node.active = false;
        this.car_conten.removeAllChildren();
        this.carLayout.active = true;
        this.jinhua_CarScroller.node.active = false;
        this.light_spine.setAnimation(0, "Idle", true);
        SetNodeGray(this.randomBtn.node, true)
        this.startJinhuaTween()
    }

    private startJinhuaTween(){
        let list = []
        for (let index = 0; index < 4; index++) {
            list.push(null);
        }
        this.createCarList(list)
    }

    onAddJinhuaRole() {
        let curRoles = PlayerData.getJinHuaRole(2);
        if(!curRoles || curRoles.length <= 0) return Tips.Show("暂无可重随英雄")
        SelectHeroPanel.SelectJinHua(curRoles, [this.jinhuaRole], 1, this.setJinHuaRole.bind(this));
    }

    async setJinHuaRole(selects: SPlayerDataRole[]) {
        if(!selects[0]){
            this.initJinHuaData();
            return
        }
        this.navBar.active = false;
        this.jinhuaRole = selects[0];   
        this.closeBtn.active = false;
        this.jinhua_closeBtn.active = true;
        this.add_jin_hua_btn.active = false;
        this.jinhua_roleInfo.active = true;
        let std = CfgMgr.GetRole()[selects[0].type];
        let scale = std.Scale || 1;
        this.jinhua_role.node.active = true;
        this.jinhua_role.node.setScale(0.7 * scale, 0.7 * scale);
        this.jinhua_role.skeletonData = await ResMgr.LoadResAbSub(path.join("spine/role_p", std.Prefab, std.Prefab), sp.SkeletonData);
        this.jinhua_role.setAnimation(0, `Idle`, true);
        let url = path.join(folder_icon + "quality", CardQuality[selects[0].quality] + "_big", "spriteFrame");
        this.jinhua_quility.spriteFrame = await ResMgr.LoadResAbSub(url, SpriteFrame);
        let quality_eff_url = path.join("sheets/fanyu", CardQuality[selects[0].quality], "spriteFrame");
        this.jinhua_role_eff.spriteFrame = await ResMgr.LoadResAbSub(quality_eff_url, SpriteFrame);

        let occupation_url = path.join(folder_icon, "pos" + std.PositionType, "spriteFrame");
        this.jinhua_occupation.spriteFrame = await ResMgr.LoadResAbSub(occupation_url, SpriteFrame);
        this.jinhua_Lv.string = "Lv." + selects[0].level;
        let label = this.jinhua_power.getComponent(SpriteLabel);
        label.font = "sheets/common/number/font2";
        label.string = selects[0].battle_power + "";

        // this.tweenStep = 2;
        this.jinhuaCfg = CfgMgr.GetRoleQualityUpCfg(this.jinhuaRole.type, this.jinhuaRole.quality, 2);
        this.createCarList(this.jinhuaCfg.evolution)
        this.carLayout.active = false;
        this.jinhua_CarScroller.node.active = true;
        this.jinhua_CarScroller.content.removeAllChildren();
        for (let index = 0; index < this.jinhuaCfg.evolution.length; index++) {
            let type =  this.jinhuaCfg.evolution[index];
            var item = instantiate(this.role_item);
            this.updateCardScrollItem(item,type,true)
            this.jinhua_CarScroller.content.addChild(item);
        }

        this.jinhua_cost_node.active = true;
         
        this.updateItem();
    }

    private updateItem(){
        let is_can_jinhua: boolean = false;
        let is_has_list: boolean[] = [];
        let cost_item = [];
        if(!this.jinhuaCfg) return;
        let itemData = ItemUtil.GetSThingList(this.jinhuaCfg.RewardType, this.jinhuaCfg.RewardID, this.jinhuaCfg.RewardNumber);
        for (let index = 0; index < itemData.length; index++) {
            const element = itemData[index];
            let has_count = 0;
            let cost_data: { icon: string, count: number, has_count: number } = { icon: "", count: 0, has_count: 0 };
            if (element.item) {
                if (element.item.id == ThingItemId.ItemId_1) {
                    has_count = PlayerData.roleInfo.currency;
                } else if (element.item.id == ThingItemId.ItemId_2) {
                    has_count = PlayerData.roleInfo.currency2;
                } else if (element.item.id == ThingItemId.ItemId_3) {
                    has_count = PlayerData.roleInfo.currency3;
                } else {
                    has_count = PlayerData.GetItemCount(element.item.id);
                }
            }
            cost_data.icon = element.resData.iconUrl;
            cost_data.count = element.item.count;
            cost_data.has_count = has_count;
            cost_item.push(cost_data);
            is_has_list.push(element.item.count > has_count);
        }
        is_can_jinhua = is_has_list.indexOf(true) != -1
        this.jinhua_costLayout.UpdateDatas(cost_item);
        if(this.tweenStep < 3){
            SetNodeGray(this.randomBtn.node, is_can_jinhua)
        }
    }

    private onJinHua(btn:Button) {
        Tips.Show("是否确认重随", ()=>{
            let jinhuaData = {
                type: MsgTypeSend.RoleTypeUpgrade,
                data: { role_id: this.jinhuaRole.id, operate_type: 2}
            }
            Session.Send(jinhuaData, MsgTypeSend.RoleTypeUpgrade, 500)
        })
        // let jinhuaData = {
        //     type: MsgTypeSend.RoleTypeUpgrade,
        //     data: { role_id: this.jinhuaRole.id }
        // }
        // Session.Send(jinhuaData, MsgTypeSend.RoleTypeUpgrade, 500)
    }

    private updateCardScrollItem(item: Node, type: number, is_reversal?:boolean){
        let unknown = item.getChildByName("unknown");
        let car = item.getChildByName("car");
        unknown.active = true;
        car.active = true;
        this.updateCarItem(item, type)
        if(is_reversal){ 
            //开始翻转
            tween(item)
            .call(()=>{
                unknown.active = true;
                car.active = false;
            })
            .to(0.2, { scale: new Vec3(0, 1, 1) })
            .call(()=>{
                unknown.active = false;
                car.active = true;
            })
            .to(0.2, { scale: new Vec3(1, 1, 1) })
            .start();
        }else{
            unknown.active = false;
        }
    }

    private updatetargetCardItem(item: Node, type: number, is_scale?:boolean){    
        let unknown = item.getChildByName("unknown");
        let car = item.getChildByName("car");
        car.active = true;
        unknown.active = false;
        this.updateCarItem(item, type)
    }

    private updateCarddefItem(item: Node, type: number){
        let unknown = item.getChildByName("unknown");
        let car = item.getChildByName("car");
        unknown.active = this.tweenStep == 1;
        car.active = this.tweenStep == 1 || this.tweenStep == 3;
        this.updateCarItem(item, type)
    }

    private async updateCarItem(item: Node, type: number) {
        if(!this.jinhuaRole)return;
        let cfg = CfgMgr.GetRole()[type];
        if(!cfg || !cfg.PositionType) {
            debugger;
        }
        let bg = item.getChildByPath("car/bg").getComponent(Sprite);
        let bgEffect = item.getChildByPath("car/bgEffect").getComponent(sp.Skeleton);
        let pillarBg = item.getChildByPath("car/pillarBg").getComponent(Sprite);
        let typeIcon = item.getChildByPath("car/type").getComponent(Sprite);
        let quality = item.getChildByPath("car/quality").getComponent(Sprite);
        let body = item.getChildByPath("car/body").getComponent(sp.Skeleton);
        let role_power = item.getChildByPath("car/power/value").getComponent(Label);
        let role_Lv = item.getChildByPath("car/level").getComponent(Label);

        bg.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_icon, "quality", CardQuality[this.jinhuaCfg.RoleQuailty] + "_card", "spriteFrame"), SpriteFrame);
        let pillarId: number = 0;
        if (cfg && cfg.RoleTypeQual > 0) {
            bgEffect.node.active = true;
            pillarId = cfg.RoleTypeQual;
            let effectName: string = "ui_HeroBackground_0" + cfg.RoleTypeQual;
            bgEffect.skeletonData = await ResMgr.LoadResAbSub(path.join("spine/effect", effectName, effectName), sp.SkeletonData);
            bgEffect.setAnimation(0, "animation", true);
        } else {
            bgEffect.node.active = false;
        }
        pillarBg.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_common, "pillar_" + pillarId, "spriteFrame"), SpriteFrame);
        typeIcon.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_icon, "pos" + cfg.PositionType, "spriteFrame"), SpriteFrame);
        quality.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_quality, CardQuality[this.jinhuaCfg.RoleQuailty], "spriteFrame"), SpriteFrame);
        let prefab = cfg.Prefab;
        let scale = cfg.Scale || 1;
        body.node.setScale(0.3 * scale, 0.3 * scale);
        body.skeletonData = await ResMgr.LoadResAbSub(path.join("spine/role", prefab, prefab), sp.SkeletonData);
        body.setAnimation(0, "Idle", true);
        let power = RoleCardPower(type, this.jinhuaCfg.RoleQuailty, 1)
        role_power.string = power + "";
        role_Lv.string = "Lv.1";

        let role: SPlayerDataRole = {
            id: "",
            type: type,
            level: 1,
            experience: 0,
            soldier_num: 0,
            active_skills: [],
            passive_skills: [],
            is_in_building: false,
            building_id: 0,
            battle_power: power,
            quality: this.jinhuaCfg.RoleQuailty,
            skills: [],
            is_assisting: false,
            is_in_attack_lineup: false,
            is_in_defense_lineup: false,
            trade_cd: 0,
        }
        item.off(Input.EventType.TOUCH_END, ()=>{
            TradeHeroPanel.Show(role)
        }, this)
        item.on(Input.EventType.TOUCH_END, ()=>{
            TradeHeroPanel.Show(role)
        }, this)
    }

    private updateCostItem(item: Node, data: { icon: string, count: number, has_count: number }) {
        let icon = item.getChildByName("icon").getComponent(Sprite);
        let costLabel = item.getChildByName("costLabel").getComponent(Label);
        ResMgr.LoadResAbSub(data.icon, SpriteFrame, res => {
            icon.spriteFrame = res
        });
        costLabel.string = data.count + "/" + ToFixed(data.has_count, 2)
    }

    public OnJinHuaCallBack(data: { role: SPlayerDataRole, up_role: SPlayerDataRole}) {
        if (!data.up_role) {
            ShowHeroPanel.ShowMerge(data.role, null);
        } else {
            SetNodeGray(this.randomBtn.node, true)
            this.jinhua_closeBtn.active = false;
            this.light_spine.setAnimation(0, "Start", true);
            this.carLayout.active = true;
            this.jinhua_CarScroller.node.active = false;
            this.tweenStep = 3;
            this.jinhuaCfg = CfgMgr.GetRoleQualityUpCfg(this.jinhuaRole.type, this.jinhuaRole.quality, 2);
            let addw = 2500-(this.car_conten.getComponent(UITransform).contentSize.width-this.car_conten.position.x-this._viewWide);
            let n = Math.ceil(addw/this._itemWide/this.jinhuaCfg.evolution.length)+2;
            let list = this.jinhuaCfg.evolution.concat();
            while(n>0) {
                list.push(...this.jinhuaCfg.evolution);
                n--;
            }
            
            list.push(data.up_role.type,...this.jinhuaCfg.evolution.slice(0,4));
            this.createCarList(list);

            this.targetCard.active = true;
            let target = this.car_conten.getComponent(UITransform).contentSize.width-this._itemWide*5-this._viewWide/2+this._itemWide/2;
            tween(this.car_conten).to(5,{position:new Vec3(target,0)},{easing: easing.circOut}).call(()=>{
                setTimeout(() => {
                    PlayerData.AddRole(data.up_role);
                    EventMgr.emit(Evt_Role_Update, data.role);
                    ShowHeroPanel.Show(data.up_role);
                    this.initJinHuaData();
                }, 1000);
            }).start();
        }
        
    }

    private onBackJinhua(){
        this.initJinHuaData();
    }

    private tweenIndex = undefined;
    private tweenStep = 1; // 滚动阶段，1背面待机滚动，2选卡待机滚动，3抽奖滚动
    protected update(dt: number): void {
        if(this.tweenStep <= 2) {
            // 待机循环
            this.tweenIndex = undefined;
            this.targetCard.active = false;
            const sp = 10,limit = this.car_conten.getComponent(UITransform).contentSize.width/2;
            this.car_conten.setPosition(this.car_conten.position.x+sp,0);
            if(this.car_conten.position.x>=limit)this.car_conten.setPosition(this.car_conten.position.x-limit,0);
        }else if(this.tweenStep == 3){
            let index = Math.round((this.car_conten.position.x+this._viewWide/2)/this._itemWide);
            if(this.tweenIndex != index) {
                Tween.stopAllByTarget(this.targetCard);
                this.updatetargetCardItem(this.targetCard,this.car_conten.children[index]['car_type'],);
                this.targetCard.setScale(1,1,1);
                tween(this.targetCard).to(0.2,{scale:new Vec3(1.4,1.4,1)}).start();
                this.tweenIndex = index;
            }
        }
    }

    private cardPool:Node[] = [];
    private createCarList(list:any[]){
        this.cardPool.push(...this.car_conten.children);
        this.car_conten.removeAllChildren();
        let len = Math.max(list.length*2,Math.ceil(this._viewWide/this._itemWide)+1);//保证content能超出view一个item的宽度，便于循环滚动
        for (let index = 0; index < len; index++) {
            let type = list[index];
            if(type == undefined)type = list[index%list.length];//循环取列表里的值
            if(this.cardPool.length)
                var item = this.cardPool.pop()
            else
                var item = instantiate(this.jinhua_Clone_item);

            item['car_type'] = type;
            this.updateCarddefItem(item,type)
            this.car_conten.addChild(item);
        }
        this.car_conten.getComponent(Layout).updateLayout();
    }

    private onHelpBtn2(){
        Tips2.Show(Tips2ID.Jinhua)
    }

  protected onHide(...args: any[]): void {
    if(this.targetCard)Tween.stopAllByTarget(this.targetCard);
    Tween.stopAllByTarget(this.car_conten);
    EventMgr.off(Evt_Jinghua_Role, this.OnJinHuaCallBack, this);
    EventMgr.off(Evt_Item_Change, this.updateItem, this)
    EventMgr.off(Evt_Currency_Updtae, this.updateItem, this)
    EventMgr.emit(Evt_Show_Scene, js.getClassByName(this));
  }
}