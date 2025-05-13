import { Component, Label, Node, path, sp, Sprite, SpriteFrame, tween, Vec3 } from "cc";
import PlayerData, {} from "../roleModule/PlayerData"
 import {FishingTradePlayerSettlementData,SFishingItem,SFishingTradePlayerStateData,SFishingTradeRoundInfo,SFishingTradeShipData} from "../roleModule/PlayerStruct";
import { CfgMgr, StdFishItem, StdFishTradeShip } from "../../manager/CfgMgr";
import { formatNumber } from "../../utils/Utils";
import { folder_icon, ResMgr } from "../../manager/ResMgr";
import { AdaptBgTop } from "../common/BaseUI";
export class FishTradeResultCont extends Component {
    private nameLab:Label;
    private nameTitleLab:Label
    private tipsNameLab:Label;
    private titleLab:Label;
    
    private winEffect:sp.Skeleton;
    private winCont:Node;
    private weightLab:Label;
    private priceLab:Label;
    private fishItem:Node;
    private fishIcon:Sprite;
    private fishWeightLab:Label;
    private fishName:Label;
    private vitItem:Node;
    private vitNumLab:Label;

    private failCont: Node;
    private failWeightLab:Label;
    private failVitNumLab:Label;
    private yuPiaoItem:Node;
    private yuPiaoNumLab:Label;
    protected onLoad(): void {
        this.nameLab = this.node.getChildByPath("cont/stormCont/nameLab").getComponent(Label);
        this.nameTitleLab = this.node.getChildByPath("cont/stormCont/titleLab").getComponent(Label);
        this.tipsNameLab = this.node.getChildByPath("cont/tipsCont/tipsNameLab").getComponent(Label);
        this.titleLab = this.node.getChildByPath("cont/tipsCont/titleLab").getComponent(Label);

        this.winEffect = this.node.getChildByPath("cont/winCont/winEffect").getComponent(sp.Skeleton);
        this.winCont = this.node.getChildByPath("cont/winCont");
        this.weightLab = this.node.getChildByPath("cont/winCont/weightLab").getComponent(Label);
        this.priceLab = this.node.getChildByPath("cont/winCont/priceLab").getComponent(Label);
        this.fishItem = this.node.getChildByPath("cont/winCont/fishItem");
        this.fishIcon = this.node.getChildByPath("cont/winCont/fishItem/icon").getComponent(Sprite);
        this.fishWeightLab = this.node.getChildByPath("cont/winCont/fishItem/numLab").getComponent(Label);
        this.fishName = this.node.getChildByPath("cont/winCont/fishItem/nameLab").getComponent(Label);
        this.vitItem = this.node.getChildByPath("cont/winCont/vitItem");
        this.vitNumLab = this.node.getChildByPath("cont/winCont/vitItem/numLab").getComponent(Label);

        this.failCont = this.node.getChildByPath("cont/failCont");
        this.failWeightLab = this.node.getChildByPath("cont/failCont/weightLab").getComponent(Label);
        this.failVitNumLab = this.node.getChildByPath("cont/failCont/vitItemLab").getComponent(Label);
        this.yuPiaoItem = this.node.getChildByPath("cont/failCont/yuPiaoItem");
        this.yuPiaoNumLab = this.node.getChildByPath("cont/failCont/yuPiaoItem/numLab").getComponent(Label);
    }
    onShow():void{
        this.node.active = true;
        AdaptBgTop(this.node.getChildByPath("mask"));
        this.updateShow();
    }
    onHide():void{
        this.node.active = false;
    }
    
    private updateShow():void{
        if(!PlayerData.fishTradeData || !PlayerData.fishTradeData.settlement) return; 
        let settlement:FishingTradePlayerSettlementData = PlayerData.fishTradeData.settlement;
        let player:SFishingTradePlayerStateData = PlayerData.fishTradeData.player;
        let ship:SFishingTradeShipData[] = PlayerData.fishTradeData.ship;
	    let round_info:SFishingTradeRoundInfo = PlayerData.fishTradeData.round_info;
        let shipData:SFishingTradeShipData;
        let stdShip:StdFishTradeShip;
        let nameKill:string = "";
        let myShipName:string = "";
        let weight:number = 0;
        for (let index = 0; index < ship.length; index++) {
            shipData = ship[index];
            stdShip = CfgMgr.GetFishTradeShip(shipData.ship_id);
            if(player.ship_id == shipData.ship_id){
                myShipName = stdShip.Name;
            }
            if(shipData.is_kill){
                if(nameKill!=""){
                    nameKill += "、";
                }
                nameKill += stdShip.Name;
            }
        }
        if(nameKill != ""){
            this.nameLab.node.active = true;
            this.nameLab.string = nameKill;
            this.nameTitleLab.string = "遭遇了暴风雪！";
        }else{
            this.nameLab.node.active = false;
            this.nameTitleLab.string = "所有飞船冒险成功！";
        }
        
        this.tipsNameLab.string = myShipName;
        if(settlement.is_win){
            this.winCont.active = true;
            this.failCont.active = false;
            this.titleLab.string = "获得";

            this.winEffect.node.active = true;
            this.winEffect.setAnimation(0, "result_1", false);
            this.winEffect.setCompleteListener(()=>{
                this.winEffect.node.active = false;
            });
            this.fishItem.setScale(0.5, 0.5);
            this.vitItem.setScale(0.5, 0.5);
            tween(this.fishItem)
            .to(0.3, { scale: new Vec3(1, 1, 1) }, {
                easing: "backOut",                                         
            })
            .start();

            tween(this.vitItem)
            .to(0.3, { scale: new Vec3(1, 1, 1) }, {
                easing: "backOut",                                         
            })
            .start();

            let fishData:SFishingItem;
            let stdFishItem:StdFishItem;
            for (let index = 0; index < settlement.fish_items.length; index++) {
                fishData = settlement.fish_items[index];
                stdFishItem = CfgMgr.GetFishItem(fishData.fish_id);
                weight = weight.add(fishData.weight);
            }
            let url = path.join(folder_icon, `fish/${stdFishItem.Icon}`, "spriteFrame");
            ResMgr.LoadResAbSub(url, SpriteFrame, res => {
                this.fishIcon.spriteFrame = res;
            });
            this.weightLab.string = formatNumber(weight, 2);
            this.fishName.string = stdFishItem.Fishsname;
            this.fishWeightLab.string = formatNumber(weight, 2);
            this.vitNumLab.string = Math.floor(settlement.fatigue_get).toString();
            this.priceLab.string = formatNumber(weight, 2);
        }else{
            this.winCont.active = false;
            this.failCont.active = true;
            this.titleLab.string = "损失";
            this.yuPiaoItem.setScale(0.5, 0.5);
            tween(this.yuPiaoItem)
            .to(0.3, { scale: new Vec3(1, 1, 1) }, {
                easing: "backOut",                                         
            })
            .start();
            //let rote:number = CfgMgr.GetFishTradeCommon.ScoreItemIdCostWeight;
            weight = settlement.cost_lose;
            this.failWeightLab.string = formatNumber(weight, 2);
            this.failVitNumLab.string = Math.floor(settlement.fatigue_lose).toString();
            this.yuPiaoNumLab.string = Math.floor(settlement.fish_score_get).toString();
        }
    }
}