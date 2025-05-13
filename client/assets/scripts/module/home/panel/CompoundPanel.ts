import { _decorator, Button, color, Color, Component, EditBox, EventTouch, Input, js, Label, math, Node, path, ProgressBar, sp, Sprite, SpriteFrame, tween, UITransform, v3, Widget } from 'cc';
import { Panel } from '../../../GameRoot';
import { GameSet } from '../../GameSet';
import { MsgTypeRet, MsgTypeSend } from '../../../MsgType';
import { Session } from '../../../net/Session';
import PlayerData, { } from '../../roleModule/PlayerData'
import { SPlayerDataItem, SThing } from '../../roleModule/PlayerStruct';
import { CfgMgr, ThingType } from '../../../manager/CfgMgr';
import { HomeUI } from './HomeUI';
import { Tips } from '../../login/Tips';
import { ToFixed, formatNumber, SetLabelColor } from '../../../utils/Utils';
import Logger from '../../../utils/Logger';
import { folder_item, ResMgr } from '../../../manager/ResMgr';
import { RewardTips } from '../../common/RewardTips';
import { CLICKLOCK } from '../../common/Drcorator';
import { RewardPanel } from '../../common/RewardPanel';
import { EventMgr, Evt_Hide_Scene, Evt_Show_Scene } from '../../../manager/EventMgr';
import { AudioMgr } from '../../../manager/AudioMgr';
import { AdaptBgTop, SetNodeGray } from '../../common/BaseUI';

export class CompoundPanel extends Panel {
    protected prefab: string = 'prefabs/panel/CompoundPanel';
    compoundBtn: Node;
    close: Node;
    editBox: EditBox;
    /**合成次数 */
    compoundCount: number = 0;
    config: any;
    resItem: Node[] = [];
    allCostLab: number[] = [];
    needCostLab: Label[] = [];
    hasCostLab: Label[] = [];
    /**配置的最大数量 */
    maxCount: number;
    private item_icon: Sprite
    private item_need: Label;
    private item_has: Label;
    private qiao: sp.Skeleton
    private item_spine: sp.Skeleton
    private ckickNode: Node;
    private add: Node;
    private sub: Node;
    private maxBtn: Button;
    /**可获得的数量 */
    private get_currency: Label;

    rock: Label = null;
    wood: Label = null;
    water: Label = null;
    seed: Label = null;
    currency: Label = null;
    // closeCallBack: Function;
    private isClick: boolean = true;
    /**当前的合成数量 */
    private cur_can_compound: number = 1;
    /**可以合成的最大数量 */
    private can_compound_max_count: number = Number.MAX_SAFE_INTEGER;

    protected onLoad(): void {
        this.CloseBy('panel/return');
        this.ckickNode = this.find("panel/ckickNode");
        this.rock = this.find('panel/MeansLayout/stone/Label', Label);
        this.wood = this.find('panel/MeansLayout/tree/Label', Label);
        this.water = this.find('panel/MeansLayout/water/Label', Label);
        this.seed = this.find('panel/MeansLayout/seed/Label', Label);
        this.currency = this.find('panel/MeansLayout/currency/Label', Label);
        this.item_has = this.find('panel/bg/cost/Node/count/item_has', Label);
        this.item_icon = this.find('panel/bg/cost/Node/icon', Sprite);
        this.item_need = this.find('panel/bg/cost/Node/count/item_need', Label);
        this.qiao = this.find("panel/bg/ring/qiao_spine", sp.Skeleton);
        this.item_spine = this.find("panel/bg/item_spine", sp.Skeleton);
        this.editBox = this.find('panel/bg/addNode/Label').getComponent(EditBox);
        this.get_currency = this.find('panel/bg/ring/count/get_currency', Label);
        this.editBox.node.on('editing-did-ended', this.onEditBoxEnded, this)
        this.add = this.find("panel/bg/addNode/add");
        this.sub = this.find("panel/bg/addNode/sub");
        this.maxBtn = this.find("panel/bg/addNode/maxBtn", Button);
        this.add.on(Input.EventType.TOUCH_END, this.onAdd, this);
        this.sub.on(Input.EventType.TOUCH_END, this.onSub, this);
        this.maxBtn.node.on("click", this.onMaxBtn, this);
    }

    protected onShow(): void {
        let qipao = this.find("panel/bg/ring/qiao_spine", sp.Skeleton);
        let qipao_hc = this.find("panel/bg/ring/qiao_spine_hc", sp.Skeleton);
        let qipao_xf = this.find("panel/bg/ring/qiao_spine_xf", sp.Skeleton);
        let role_spine = this.find("panel/bg/role_spine", sp.Skeleton);
        let role_spine_hc = this.find("panel/bg/role_spine_hc", sp.Skeleton);
        if (GameSet.GetServerMark() == "hc") {
            qipao.node.active = false;
            qipao_hc.node.active = true;
            qipao_xf.node.active = false;
            this.qiao = qipao_hc;

            role_spine.node.active = false;
            role_spine_hc.node.active = true;
        }else if(GameSet.GetServerMark() == "xf"){
            qipao.node.active = false;
            qipao_hc.node.active = false;
            qipao_xf.node.active = true;
            this.qiao = qipao_xf;

            role_spine.node.active = false;
            role_spine_hc.node.active = true;
        } else {
            qipao.node.active = true;
            qipao_hc.node.active = false;
            qipao_xf.node.active = false;
            this.qiao = qipao;

            role_spine.node.active = true;
            role_spine_hc.node.active = false;
        }
        EventMgr.emit(Evt_Hide_Scene, js.getClassName(this));
        this.showMeans();
        this.compoundBtn = this.find('panel/bg/compoundBtn');
        this.compoundBtn.on(Input.EventType.TOUCH_END, this.onCompoundClick, this);
        Session.on(MsgTypeRet.ResourceExchangeRet, this.onResourceExchangeRet, this);

        this.compoundCount = PlayerData.roleInfo.resource_exchange_uses || 0;
        this.config = CfgMgr.GetCompound();
        //@ts-ignore
        this.maxCount = Math.max(...Object.keys(this.config))
        this.allCostLab = [];
        this.needCostLab = [];
        this.hasCostLab = [];
        this.resItem = [];
        let item_node = this.item_spine.node.getChildByName("item_node").children;
        for (let index = 0; index < item_node.length; index++) {
            let child = item_node[index];
            // let count = child.getChildByName('count');
            let need = child.getChildByName("need").getComponent(Label);
            let has = child.getChildByName("has").getComponent(Label);
            this.needCostLab.push(need);
            this.hasCostLab.push(has);
            this.resItem.push(child);
        }
    }

    showMeans() {
        let res = PlayerData.resources;
        this.rock.string = formatNumber(res.rock, 2);
        this.wood.string = formatNumber(res.wood, 2);
        this.water.string = formatNumber(res.water, 2);
        this.seed.string = formatNumber(res.seed, 2);
        this.currency.string = ToFixed(PlayerData.roleInfo.currency, 2);
    }

    public flush(...args: any[]) {
        // this.closeCallBack = args[0];
        this.cur_can_compound = 1;
        let max = this.getMaxCost();
        if (max <= 0) {
            max = 1;
        }
        this.can_compound_max_count = max;
        this.editBox.string = "1"
        AdaptBgTop(this.node.getChildByPath("panel/bg1"));
        this.editBox.getComponent(Widget).updateAlignment();
        this.check();
    }
    protected onHide(...args: any[]): void {
        EventMgr.emit(Evt_Show_Scene, js.getClassByName(this));
        // this.closeCallBack && this.closeCallBack();

    }

    protected update(dt: number): void {

    }

    async check() {
        this.ckickNode.active = false;
        Logger.log(this.compoundCount + 1 > this.maxCount ? this.maxCount : this.compoundCount + 1)
        let info = this.config[this.compoundCount + 1 > this.maxCount ? this.maxCount : this.compoundCount + 1];
        let cost_list = this.getCostData(this.cur_can_compound);
        let wood = cost_list[0];
        let rock = cost_list[1];
        let seed = cost_list[2];
        let water = cost_list[3];
        let item_cost = cost_list[4];
        let money = cost_list[5];
        this.get_currency.string = money + "";
        let res = PlayerData.resources;
        let std = CfgMgr.Getitem(info.ItemId)
        this.item_icon.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_item, std.Icon, "spriteFrame"), SpriteFrame);
        let item_all = PlayerData.GetItemCount(info.ItemId)

        if (res.wood < cost_list[0] || res.rock < cost_list[1] || res.seed < cost_list[2] || res.water < cost_list[3] || item_all < cost_list[4]) {
            SetNodeGray(this.compoundBtn, true);
            this.compoundBtn.off(Input.EventType.TOUCH_END, this.onCompoundClick, this);
        }else{
            SetNodeGray(this.compoundBtn, false);
            this.compoundBtn.on(Input.EventType.TOUCH_END, this.onCompoundClick, this);
        }
        this.allCostLab = [];
        for (let index = 0; index < this.resItem.length; index++) {
            let resCount = 0;
            switch (index) {
                case 0:
                    resCount = res.rock;
                    break;
                case 1:
                    resCount = res.water;
                    break;
                case 2:
                    resCount = res.wood;
                    break;
                case 3:
                    resCount = res.seed;
                    break;

                default:
                    break;
            }
            this.allCostLab.push(resCount);
        }

        for (let index = 0; index < this.needCostLab.length; index++) {
            let need = this.needCostLab[index];
            let all = this.allCostLab[index];
            let count = 0;
            switch (index) {
                case 0:
                    count = rock;
                    break;
                case 1:
                    count = water;
                    break;
                case 2:
                    count = wood;
                    break;
                case 3:
                    count = seed;
                    break;

                default:
                    break;
            }
            this.needCostLab[index].string = `/${formatNumber(count, 2)}`;
            this.hasCostLab[index].string = `${formatNumber(all, 2)}`;
            all >= count ? this.hasCostLab[index].color = new Color().fromHEX('7AFF45') : this.hasCostLab[index].color = new Color().fromHEX('FF4A4A');
        }

        this.item_need.string = "/" + item_cost;
        this.item_has.string = item_all + "";
        SetLabelColor(this.item_has, item_all, item_cost, "7AFF45", "FF4A4A");
    }

    /**合成 */
    @CLICKLOCK(1)
    onCompoundClick() {
        if (this.isClick) {
            let compoundCount = this.compoundCount + 1 > this.maxCount ? this.maxCount : this.compoundCount + 1;
            let cfg = this.config[compoundCount]
            let cost_list = this.getCostData(this.cur_can_compound);
            if (!cfg) return;
            let res = PlayerData.resources;
            let count = PlayerData.GetItemCount(cfg.ItemId);
            if (res.wood >= cost_list[0] && res.rock >= cost_list[1] && res.seed >= cost_list[2] && res.water >= cost_list[3] && count >= cost_list[4]) {
                // this.isClick = false;
                // let callback = () => {
                    let sendData = {
                        type: MsgTypeSend.ResourceExchange,
                        data: {
                            exchange_count: this.cur_can_compound,
                        }
                    }
                    Session.Send(sendData, MsgTypeRet.ResourceExchangeRet);
                    // this.compoundBtn.off(Input.EventType.TOUCH_END);
                // }
            } else {
                Tips.Show("道具数量不足")
            }
        }

    }

    private showSpineEffect() {
        // tween(this.compoundBtn)
        //     .call(callback)
        //     .delay(0.1)
        //     .call(() => { this.compoundBtn.on(Input.EventType.TOUCH_END, this.onCompoundClick, this); })
        //     .start()
    }

    onResourceExchangeRet(data) {
        Logger.log('data', data);
        if(!data) return;
                tween(this.item_spine)
                    .call(() => {
                        this.ckickNode.active = true;
                        AudioMgr.playSound("compound_compound", false);
                        this.item_spine.setAnimation(0, "Start", false);
                    })
                    .delay(1.57)
                    .call(() => {
                        this.qiao.setAnimation(0, "Start", false)
                        this.qiao.setTrackCompleteListener(this.qiao.setAnimation(0, "Start", false), this.showSpineEffect.bind(this))
                    })
                    .call(()=>{
                        RewardPanel.Show(info, callBack1, callBack2)
                        this.qiao.setAnimation(0, "Idle", true)
                        this.item_spine.setAnimation(0, "Idle", true);
                    })
                    .start()
        this.isClick = true;
        this.qiao.setAnimation(0, "Idle", true)
        this.item_spine.setAnimation(0, "Idle", true);
        let money = Number(this.get_currency.string);
        let info: SThing[] = [{
            type: ThingType.ThingTypeCurrency,
            currency: { type: 0, value: money },
        }];
        this.cur_can_compound = 1;
        this.editBox.string = 1 + "";
        let max = this.getMaxCost();
        this.can_compound_max_count = max == 0 ? 1 : max;
        let self = this;
        let update = () => {
            let count = data.updated_count;
            PlayerData.updateCompoundCount(count);
            self.compoundCount = count;
            // PlayerData.roleInfo.currency += money;
            HomeUI.Flush();
            self.check();
            self.showMeans();
        }

        let callBack1 = () => {
            update();
        }

        let callBack2 = () => {
            update();
            self.onCompoundClick();
        }
        // RewardPanel.Show(info, callBack1, callBack2)
    }

    private onAdd() {
        if (this.cur_can_compound < this.can_compound_max_count) {
            this.cur_can_compound++;
        }
        this.editBox.string = this.cur_can_compound.toString();
        this.check();
    }


    private onSub() {
        if (this.cur_can_compound > 1) {
            this.cur_can_compound--;
        }
        this.editBox.string = this.cur_can_compound.toString();
        this.check();
    }

    private onMaxBtn() {
        let max = this.getMaxCost();
        this.editBox.string = max == 0 ? "1" : max.toString();
        this.cur_can_compound = this.can_compound_max_count;
        this.check();
    }

    private onEditBoxEnded(editbox: EditBox) {
        let str = editbox.string ? editbox.string : "1";
        let num = parseInt(str)
        if(isNaN(num)){
            num = 1
            this.editBox.string = num.toString();
        }else{
            if (num > this.can_compound_max_count) {
                this.editBox.string = this.can_compound_max_count.toString();
                num = this.can_compound_max_count;
            } else {
                if (num <= 0) {
                    num = 1;
                }
                this.editBox.string = num.toString();
            }
        }
        this.cur_can_compound = num;
        this.check();
    }

    private getMaxCost() {
        let is_has = true;
        //循环次数
        let max_num = 0;
        let cost_list = [];
        let res = PlayerData.resources;
        let std = this.config[this.maxCount];
        let item_all = PlayerData.GetItemCount(std.ItemId)
        while (is_has) {
            max_num += 1;
            cost_list = this.getCostData(max_num);
            if (res.wood < cost_list[0] || res.rock < cost_list[1] || res.seed < cost_list[2] || res.water < cost_list[3] || item_all < cost_list[4]) {
                is_has = false;
                max_num -= 1;
            }
        }
        return max_num;
    }

    private getCostData(count: number) {
        let info;
        let wood = 0;
        let rock = 0;
        let seed = 0;
        let water = 0;
        let money = 0;
        //策划说这个道具不会变
        let item_cost = 0;
        //超出配置的部分取最后一条
        if (this.compoundCount >= this.maxCount) {
            info = this.config[this.maxCount];
            wood += info.WoodNum * count;
            rock += info.RockNum * count;
            seed += info.SeedNum * count;
            water += info.WaterNum * count;
            money += info.Money * count;
            item_cost += info.Cost * count;
        } else {
            let _compoundCount = this.compoundCount;
            for (let index = 0; index < count; index++) {
                _compoundCount += 1;
                if (_compoundCount >= this.maxCount) {
                    info = this.config[this.maxCount];
                } else {
                    info = this.config[_compoundCount];
                }
                wood += info.WoodNum;
                rock += info.RockNum;
                seed += info.SeedNum;
                water += info.WaterNum;
                money += info.Money;
                item_cost += info.Cost;
            }
        }
        return [wood, rock, seed, water, item_cost, money]
    }
}


