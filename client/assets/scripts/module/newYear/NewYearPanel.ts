import { Button, Component, EditBox, EventTouch, Input, Label, Node, ProgressBar, RichText, ScrollView, Sprite, SpriteFrame, Toggle, UITransform, instantiate, path, sp, tween } from "cc";
import { Panel } from "../../GameRoot";

import { EventMgr, Evt_TaskChange } from "../../manager/EventMgr";
import PlayerData from "../roleModule/PlayerData";
import { SetLabelColor } from "../../utils/Utils";
import { CfgMgr, StdItemSyntheSize, ThingType } from "../../manager/CfgMgr";
import { MsgTypeRet, MsgTypeSend } from "../../MsgType";
import { Session } from "../../net/Session";
import { RewardPanel } from "../common/RewardPanel";
import { SThing, Tips2ID } from "../roleModule/PlayerStruct";
import { SetNodeGray } from "../common/BaseUI";
import { Tips2 } from "../home/panel/Tips2";

export class NewYearPanel extends Panel {
    protected prefab: string = "prefabs/panel/newYear/NewYearPanel";


    private add: Node;
    private sub: Node;
    private maxBtn: Button;
    private editBox: EditBox;
    private costNode: Node[]
    private changeBtn: Button;
    private spine: sp.Skeleton
    private tipsBtn: Node;

    private can_compound_max_count = 0
    private cur_compound = 0
    private cfg: StdItemSyntheSize

    protected onLoad() {
        this.CloseBy("mark");

        this.add = this.find("bg/addNode/add");
        this.sub = this.find("bg/addNode/sub");
        this.maxBtn = this.find("bg/addNode/maxBtn", Button);
        this.add.on(Input.EventType.TOUCH_END, this.onAdd, this);
        this.sub.on(Input.EventType.TOUCH_END, this.onSub, this);
        this.maxBtn.node.on("click", this.onMaxBtn, this);
        this.costNode = this.find("bg/costNode").children.concat()
        this.changeBtn = this.find("bg/changeBtn", Button);
        this.changeBtn.node.on("click", this.onChange, this);
        this.spine = this.find('bg/spine', sp.Skeleton);
        this.tipsBtn = this.find('bg/tipsBtn')
        this.tipsBtn.active = false;
        this.tipsBtn.on(Input.EventType.TOUCH_END, this.onHelp, this);

        this.editBox = this.find('bg/addNode/Label', EditBox);
        this.editBox.node.on('editing-did-ended', this.onEditBoxEnded, this)
        Session.on(MsgTypeRet.ItemSynthesizeRet, this.onItemSynthesizeRequest, this);
    }

    protected onShow(): void {
        EventMgr.on(Evt_TaskChange, this.flush, this);
    }

    public flush(index?: number): void {
        this.spine.setAnimation(0, "Idle", true)
        this.cfg = CfgMgr.GetItemSynthesSizeCfg()[0];
        this.can_compound_max_count = this.cfg.Limit
        this.cur_compound = 1;
        this.editBox.string = this.cur_compound.toString();
        this.getMaxCost();
        this.updateCostLabel();
    }

    private updateCostLabel() {
        let is_gray = false;
        for (let index = 0; index < this.costNode.length; index++) {
            const element = this.costNode[index];
            let has_label = element.getChildByPath("costLabel/has_num").getComponent(Label);
            let cost_label = element.getChildByPath("costLabel/cost_num").getComponent(Label);
            let has_count = PlayerData.GetItemCount(this.cfg.CostItemID[index])
            has_label.string = has_count + "";
            cost_label.string = "/" + this.cur_compound;
            SetLabelColor(has_label, has_count, this.cur_compound, "7AFF45", "FF4A4A");
            is_gray = has_count < this.cur_compound
        }
        if(this.cur_compound == 0){
            is_gray = true;
        }
        SetNodeGray(this.changeBtn.node, is_gray)
    }

    private onChange() {
        let sendData = {
            type: MsgTypeSend.ItemSynthesize,
            data: {
                id: this.cfg.ID,
                count: this.cur_compound,
            }
        }
        Session.Send(sendData, MsgTypeSend.ItemSynthesize, 1000);
    }

    private onAdd() {
        if (this.cur_compound < this.can_compound_max_count) {
            this.cur_compound++;
        }
        this.editBox.string = this.cur_compound.toString();
        this.updateCostLabel();
    }

    private onSub() {
        if (this.cur_compound > 1) {
            this.cur_compound--;
        }
        this.editBox.string = this.cur_compound.toString();
        this.updateCostLabel();
    }

    private onMaxBtn() {
        this.editBox.string = this.can_compound_max_count == 0 ? "1" : this.can_compound_max_count.toString();
        this.cur_compound = this.can_compound_max_count;
        this.updateCostLabel();
    }

    private onEditBoxEnded(editbox: EditBox) {
        let str = editbox.string ? editbox.string : "1";
        let num = parseInt(str)
        if (isNaN(num)) {
            num = 1
            this.editBox.string = num.toString();
        } else {
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
        this.cur_compound = num;
        this.updateCostLabel();
    }

    /**获取最大可合成数量 */
    private getMaxCost() {
        for (let index = 0; index < this.cfg.CostItemID.length; index++) {
            const item_id = this.cfg.CostItemID[index];
            let item_all = PlayerData.GetItemCount(item_id)
            if (item_all < this.can_compound_max_count) {
                this.can_compound_max_count = item_all;
            }
        }
    }

    onItemSynthesizeRequest(data: { id: number, count: number }) {
        console.log('data', data);
        if (!data) return;
        tween(this.spine)
            .call(() => {
                this.spine.setAnimation(0, "Start", false)
            })
            .delay(0.65)
            .call(() => {
                let info: SThing[] = [{
                    type: ThingType.ThingTypeItem,
                    currency: { type: 2, value: data.count },
                }];
                RewardPanel.Show(info, null, null, true)
                this.spine.setAnimation(0, "Idle", true)
                this.cur_compound = 1;
                this.getMaxCost()
                this.updateCostLabel();
            })
            .start()
    }

    private onHelp() {
        Tips2.Show(Tips2ID.newYear)
    }


    protected onHide(...args: any[]): void {

    }


}
