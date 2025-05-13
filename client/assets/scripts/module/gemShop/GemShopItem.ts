import { Button, Component, path, Sprite, SpriteFrame, Node, Label, Vec3, game, Color } from "cc";
import { ConsumeItem } from "../common/ConsumeItem";
import { CfgMgr, ItemType, StdAdvister, StdEquityId, StdLuckyShop, StdShop, StdShopCommodity, StdShopLucky } from "../../manager/CfgMgr";
import PlayerData, {} from "../roleModule/PlayerData"
 import {SAdvister,SLuckyContent,SShopContent,SShopItem,SThing} from "../roleModule/PlayerStruct";
import { ResMgr } from "../../manager/ResMgr";
import { AwardItem } from "../common/AwardItem";
import { ItemUtil } from "../../utils/ItemUtils";
import { DateUtils } from "../../utils/DateUtils";

export class GemShopItem extends Component {
    private bg:Sprite;
    private adBg:Sprite;
    private disCont:Node;
    private disNumLab:Label;
    private awardItem:AwardItem;
    private limitCont:Node;
    private limtNumLab:Label;
    private timeCont:Node;
    private limtTimeTitle:Label;
    private limtTimeLab:Label;
    private adCont:Node;
    private jumpAd:Node;
    private adNumLab:Label;
    private consumeItem:ConsumeItem;
    private noBuy:Node;
    private sellOut:Node;
    private overTime:Node;
    private isInit:boolean = false;
    private std:StdShopCommodity;
    private data:SShopItem;
    private shopId:number;
    private nameColorList:string[] = ["#2C8A6E", "#3573A5", "#64479D", "#A86313", "#B13341"];
    private consumeColorList:string[] = ["#0D5949", "#15456C", "#3B206F", "#6C2F15", "#65210C"];
    protected onLoad(): void {
        this.bg = this.node.getChildByName("bg").getComponent(Sprite);
        this.adBg = this.node.getChildByName("adBg").getComponent(Sprite);
        this.disCont = this.node.getChildByName("disCont");
        this.disNumLab = this.node.getChildByPath("disCont/disNumLab").getComponent(Label);
        this.awardItem = this.node.getChildByName("AwardItem").addComponent(AwardItem);
        this.limitCont = this.node.getChildByName("limitCont");
        this.limtNumLab = this.node.getChildByPath("limitCont/limtNumLab").getComponent(Label);
        this.timeCont = this.node.getChildByPath("limitCont/timeCont");
        this.limtTimeTitle = this.node.getChildByPath("limitCont/timeCont/limtTimeTitle").getComponent(Label);
        this.limtTimeLab = this.node.getChildByPath("limitCont/timeCont/limtTimeLab").getComponent(Label);
        this.consumeItem = this.node.getChildByName("consumeItem").addComponent(ConsumeItem);
        this.adCont = this.node.getChildByName("adCont");
        this.jumpAd = this.node.getChildByPath("adCont/icon/jumpAd");
        this.adNumLab = this.node.getChildByPath("adCont/adNumLab").getComponent(Label);
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
        this.updateAdTime();
    }
    private updateAdTime():void{
        if(!this.data) return;
        //是否才有广告的商品
        if(this.data.isAdItem){
            let std:StdShop = CfgMgr.GetShop(this.shopId);
            if(std.AdId > 0){
                this.adBg.node.active = true;
                let adData:SAdvister = PlayerData.GetAdvisterData(std.AdId);
                let stdAd: StdAdvister = CfgMgr.GetAdvister(std.AdId);
                let cd:number = adData.cdEndTime - game.totalTime;
                if(cd > 0){
                    this.adNumLab.string = DateUtils.FormatTime(cd/1000, "%{mm}:%{ss}");
                }else{
                    this.adNumLab.string = `广告（${adData.count}/${stdAd.Max_numb}）`;
                }
                this.consumeItem.node.active = false;
                this.adCont.active = true;
                
            }else{
                this.adBg.node.active = false;
                this.consumeItem.node.active = true;
                this.adCont.active = false;
            }
        }else{
            this.adBg.node.active = false;
            this.consumeItem.node.active = true;
            this.adCont.active = false;
        }
        
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
        if(this.std.Discount > 0){
            this.disCont.active = true;
            this.disNumLab.string = this.std.Discount.toString();
        }else{
            this.disCont.active = false;
        }

        if(this.std.GoodAmount > 0){
            this.limtNumLab.node.active = true;
            this.limtNumLab.string = `数量：${this.data.count}/${this.std.GoodAmount}`;
        }else{
            this.limtNumLab.node.active = false;
        }
        this.timeCont.active = this.std.LimitBuyTime > 0;
        
        let thing:SThing;
        thing = ItemUtil.CreateThing(this.std.Goodstype[0], this.std.GoodsID[0], this.std.GoodsNum[0]);
        let url = path.join("sheets/gemShop", `qualBg_${thing.resData.qual}`, "spriteFrame");
        ResMgr.LoadResAbSub(url, SpriteFrame, res => {
            this.bg.spriteFrame = res;
        });
        this.awardItem.SetData({itemData:thing});
        let awNumLab = this.awardItem.node.getChildByName("numLab").getComponent(Label);
        let otherNumLab = this.awardItem.node.getChildByName("otherNumLab").getComponent(Label);
        let awNameLab:Label = this.awardItem.node.getChildByName("nameLab").getComponent(Label);
        awNumLab.node.active = true;
        awNumLab.string = "x" + this.std.GoodsNum[0];
        otherNumLab.node.active = false;

        

        let colorIndex:number = thing.resData.qual -1;
        let nameColor:string = this.nameColorList[colorIndex];
        if(!nameColor) nameColor = this.nameColorList[0];
        let consumeColor:string = this.consumeColorList[colorIndex];
        if(!consumeColor) consumeColor = this.nameColorList[0];
        
        awNameLab.color = new Color().fromHEX(nameColor);
    
        thing = ItemUtil.CreateThing(this.std.CostType[0], this.std.CostID[0], this.std.CostNumber[0]);
        this.consumeItem.SetData(thing);
        let consumeNumLab:Label = this.consumeItem.node.getChildByName("numLab").getComponent(Label);
        consumeNumLab.color = new Color().fromHEX(consumeColor);
        this.jumpAd.active = PlayerData.GetIsActivateRights(StdEquityId.Id_9) || PlayerData.GetIsActivateRights(StdEquityId.Id_10);
        
        //let titleColor:Color = new Color().fromHEX(colorList[0]);
    }
}