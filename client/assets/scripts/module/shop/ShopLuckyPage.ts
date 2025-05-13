import { Component, Input, Node, path, sp, Sprite, SpriteFrame } from "cc";
import { ShopBasePage } from "./ShopPageBase";
import { AutoScroller } from "../../utils/AutoScroller";
import { CfgMgr, StdLuckyShop, StdShopLucky } from "../../manager/CfgMgr";
import { ShopLuckyItem } from "./ShopLuckyItem";
import { folder_bgm, ResMgr } from "../../manager/ResMgr";
import { EventMgr, Evt_ShopLuckyGet } from "../../manager/EventMgr";
import PlayerData, {  } from "../roleModule/PlayerData"
 import {SThing} from "../roleModule/PlayerStruct";
import { RewardTips } from "../common/RewardTips";
import { BeforeGameUtils } from "../../utils/BeforeGameUtils";
import { AudioGroup, AudioMgr } from "../../manager/AudioMgr";
import LocalStorage from "../../utils/LocalStorage";

export class ShopLuckyPage extends ShopBasePage {
    private titleImg: Sprite;
    private effect: sp.Skeleton;
    private luckList: AutoScroller;
    private noneListCont: Node;
    private luckyList: StdLuckyShop[];
    private effectName: { [key: string]: string } = BeforeGameUtils.toHashMapObj(
        1, "Blue",
        2, "Purple",
        3, "Gold",
    );
    private jump: Node;

    private items:SThing[];
    protected onLoad(): void {
        this.titleImg = this.node.getChildByPath("titleImg").getComponent(Sprite);
        this.noneListCont = this.node.getChildByName("noneListCont");
        this.luckList = this.node.getChildByName("luckList").getComponent(AutoScroller);
        this.effect = this.node.getChildByPath("effectNode/effect").getComponent(sp.Skeleton);
        this.jump = this.node.getChildByPath("effectNode/jump");
        this.jump.on(Input.EventType.TOUCH_END, this.updateEffect, this)
        this.luckList.SetHandle(this.updateLuckItem.bind(this));
        EventMgr.on(Evt_ShopLuckyGet, this.onGetAward, this);
        super.onLoad();
    }

    onShow(): void {
        super.onShow();
    }

    onHide(): void {
        super.onHide();
    }
    private onGetAward(items: SThing[], luckyShopId: number): void {
        this.items = items;
        if (this.node.active) {
            let is_jump = LocalStorage.GetBool("shop_eff" + PlayerData.roleInfo.player_id);
            if(is_jump){
                RewardTips.Show(items, false, null, null, true);
            }else{
                AudioMgr.playSound("shop_lucky_effect", false);
                AudioMgr.Pause({ url: folder_bgm + "scene_bgm_6", num: 1, group: AudioGroup.Music });
                console.log(`播放幸运商城抽奖音效---->shop_lucky_effect`);
                let stdShopLucky: StdShopLucky = CfgMgr.GetShopLucky(luckyShopId);
                this.effect.node.parent.active = true;
                this.effect.node.active = true;
                this.effect.clearTracks();
                this.effect.addAnimation(0, this.effectName[stdShopLucky.PoolQual], false);
                this.effect.setCompleteListener(() => {
                    AudioMgr.PlayCycle({ url: folder_bgm + "scene_bgm_6", num: 1, group: AudioGroup.Music });
                    RewardTips.Show(items, false, null, null, true);
                    this.effect.node.active = false;
                    this.effect.node.parent.active = false;
                });
            }
        } else {
            RewardTips.Show(items, false, null, null, true);
        }
    }

    protected updateOnShow(): void {
        //this.effect.node.active = false;
    }

    protected UpdateShow(): void {
        let stdShopIndex = CfgMgr.GetShopIndex(this.data.ShopGroupId, this.data.ShopType);
        let url = path.join("sheets/shop", stdShopIndex.TitleImgRes, "spriteFrame");
        ResMgr.LoadResAbSub(url, SpriteFrame, res => {
            this.titleImg.spriteFrame = res;
        });
        this.luckyList = CfgMgr.GetLuckyDatas(this.data.ShopGroupId, this.data.ShopType);
        this.luckList.UpdateDatas(this.luckyList);
        this.noneListCont.active = this.luckyList.length < 1;
    }
    protected updateLuckItem(item: Node, data: StdLuckyShop, index: number) {
        let luckyItem = item.getComponent(ShopLuckyItem);
        if (!luckyItem) luckyItem = item.addComponent(ShopLuckyItem);
        luckyItem.SetData(data);
    }

    private updateEffect() {
        LocalStorage.SetBool("shop_eff" + PlayerData.roleInfo.player_id,  true);
        this.effect.clearTracks();
        this.effect.node.active = false;
        this.effect.node.parent.active = false;
        RewardTips.Show(this.items, false, null, null, true);
        this.items = [];
    }
}