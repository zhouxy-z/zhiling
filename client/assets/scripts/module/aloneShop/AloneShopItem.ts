import { Component, Node, Label} from "cc";
import { ConsumeItem } from "../common/ConsumeItem";
import { CfgMgr, StdShopCommodity } from "../../manager/CfgMgr";
import PlayerData, {} from "../roleModule/PlayerData"
 import {SShopItem,SThing} from "../roleModule/PlayerStruct";
import { AwardItem } from "../common/AwardItem";
import { ItemUtil } from "../../utils/ItemUtils";
import { DateUtils } from "../../utils/DateUtils";

export class AloneShopItem extends Component {
    private awardItem:AwardItem;
    private limitCont:Node;
    private limtNumLab:Label;
    private timeCont:Node;
    private limtTimeTitle:Label;
    private limtTimeLab:Label;
    private consumeItem:ConsumeItem;
    private noBuy:Node;
    private sellOut:Node;
    private overTime:Node;
    private isInit:boolean = false;
    private std:StdShopCommodity;
    private data:SShopItem;
    private shopId:number;
    protected onLoad(): void {
        this.awardItem = this.node.getChildByName("AwardItem").addComponent(AwardItem);
        this.limitCont = this.node.getChildByName("limitCont");
        this.limtNumLab = this.node.getChildByPath("limitCont/limtNumLab").getComponent(Label);
        this.timeCont = this.node.getChildByPath("limitCont/timeCont");
        this.limtTimeTitle = this.node.getChildByPath("limitCont/timeCont/limtTimeTitle").getComponent(Label);
        this.limtTimeLab = this.node.getChildByPath("limitCont/timeCont/limtTimeLab").getComponent(Label);
        this.consumeItem = this.node.getChildByName("consumeItem").addComponent(ConsumeItem);
        this.noBuy = this.node.getChildByName("noBuy");
        this.sellOut = this.node.getChildByPath("noBuy/sellOut");
        this.overTime = this.node.getChildByPath("noBuy/overTime");
        this.isInit = true;
        this.updateShow();
    }
    protected update(dt: number): void {
        if(this.data && this.std.LimitBuyTime > 0){
            let residueTime:number = Math.max(Math.floor(this.data.expiration_time - PlayerData.GetServerTime()), 0);
            this.limtTimeLab.string = DateUtils.FormatTime(residueTime, "%{hh}:%{mm}:%{ss}");
            if(residueTime > 86400){
                this.limtTimeLab.string = DateUtils.FormatTime(residueTime, "%{d}天%{hh}:%{mm}:%{ss}");
            }else{
                if(residueTime > 0){
                    this.limtTimeLab.string = DateUtils.FormatTime(residueTime, "%{hh}:%{mm}:%{ss}");
                }else{
                    this.limtTimeLab.string = "活动结束";
                    //this.SetData(this.data);
                }   
            }
        }
        this.updateShopState();
        
    }
    
    SetData(data:SShopItem, shopId:number) {
        this.data = data;
        this.shopId = shopId;
        this.updateShow();
        this.updateShopState();
    }
    private updateShopState():void{
        if(!this.data || !this.std) return;
        this.noBuy.active = false;
        if(this.std.GoodAmount > 0){
            if(this.data.count < 1){
                this.noBuy.active = true;
                this.sellOut.active = true;
                this.overTime.active= false;
            }
        }
        if(this.std.LimitBuyTime > 0 && !this.noBuy.active){
            if(this.data.expiration_time - PlayerData.GetServerTime() <= 0){
                this.noBuy.active = true;
                this.sellOut.active = false;
                this.overTime.active= true;
            }
        }
    }
    private updateShow():void {
        if(!this.isInit || !this.data) return;
        this.std = CfgMgr.GetCommShopItem(this.data.id);
        
        if(this.std.GoodAmount > 0){
            this.limtNumLab.node.active = true;
            if(this.data.whole_amount_max){
                let num = this.data.whole_amount ? this.data.whole_amount : 0
                this.limtNumLab.string = `个人:${this.data.count}/${this.std.GoodAmount} 全局:(${num}/${this.data.whole_amount_max})`;
            }else{
                this.limtNumLab.string = `数量：${this.data.count}/${this.std.GoodAmount}`;
            }
        }else{
            this.limtNumLab.node.active = false;
        }
        this.timeCont.active = this.std.LimitBuyTime > 0;
        
        let thing:SThing;
        thing = ItemUtil.CreateThing(this.std.Goodstype[0], this.std.GoodsID[0], this.std.GoodsNum[0]);
        this.awardItem.SetData({itemData:thing});
        
        thing = ItemUtil.CreateThing(this.std.CostType[0], this.std.CostID[0], this.std.CostNumber[0]);
        this.consumeItem.SetData(thing);
    }
}