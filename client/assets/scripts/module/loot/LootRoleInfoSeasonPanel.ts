import { Node, Button, Label, Sprite, path, SpriteFrame, find } from "cc";
import { Panel } from "../../GameRoot";
import { ResMgr, folder_head_card, folder_head_round, folder_icon } from "../../manager/ResMgr";
import { BattleReadyLogic } from "../../battle/Ready/BattleReadyLogic";
import PlayerData, { } from "../roleModule/PlayerData"
import PlayerDataHelp, { } from "../roleModule/PlayerDataHelp"
 import {FightState,SPlayerDataItem,SPlayerDataRole,SThing} from "../roleModule/PlayerStruct";
import { EventMgr, Evt_Hide_Home_Ui, Evt_LootPlunder, Goto } from "../../manager/EventMgr";
import { CardQuality, CfgMgr, ThingType } from "../../manager/CfgMgr";
import { AutoScroller } from "../../utils/AutoScroller";
import { Tips } from "../login/Tips";
import { BagItem } from "../bag/BagItem";


export class LootRoleInfoSeasonPanel extends Panel {
    protected prefab: string = "prefabs/panel/loot/LootRoleInfoSeasonPanel";

    private upgradeBtn: Node;
    private defendList: AutoScroller;
    private awardList: AutoScroller;
    private playerData;

    protected onLoad() {
        this.CloseBy("closeBtn");
        this.CloseBy("mask");
 
        this.defendList = this.find(`defendCont/defendList`, AutoScroller);
        this.awardList = this.find(`awardCont/awardList`, AutoScroller);
        this.upgradeBtn = this.find(`upgradeBtn`);  
        this.onBtnEvent();
        this.defendList.SetHandle(this.setDefendList.bind(this))
        this.awardList.SetHandle(this.UpdateBagItem.bind(this))
    }

    private onBtnEvent() {
        this.upgradeBtn.on(Button.EventType.CLICK, this.onClickLoot, this);
    }

    protected onShow(): void {
        EventMgr.on(Evt_LootPlunder, this.onGetBattleData, this);
    }

    public flush(...args: any[]): void {
        this.playerData = args[0];
        this.onInitInfo();
    }

    protected onHide(...args: any[]): void {
        EventMgr.off(Evt_LootPlunder, this.onGetBattleData, this);
    }

    private onInitInfo() {
        let datas = [];
        let first_datas = [] ;
        if (this.playerData.defense_lineup) {           
            this.playerData.defense_lineup.forEach((element) => {
                this.playerData.roles.forEach((element2) => {
                    if (element.role_id == element2.id) {
                        datas.push(element2);
                    }
                })
            });
        }

        for (let index = 0; index < 5; index++) {
            if(index == 0 && datas.length > 1){
                first_datas.push(datas[0])        
            }else{
                first_datas.push(null)    
            }
        }
        this.defendList.UpdateDatas(first_datas); 
        let award_datas: SThing[] = PlayerDataHelp.GetLootAwardThings(this.playerData);
        this.awardList.UpdateDatas(award_datas);
    }
    private async setDefendList(item: Node, role: SPlayerDataRole, index: number) {
        let qualBg = find(`qualBg`, item).getComponent(Sprite);
        let icon = find(`icon`, item).getComponent(Sprite);
        let quality = find(`typeIcon`, item).getComponent(Sprite);
        let lock = find(`lock`, item);
        if(!role){
            qualBg.spriteFrame = await ResMgr.LoadResAbSub(path.join("sheets/common/无品质底", "spriteFrame"), SpriteFrame);
            quality.node.active = false;
            icon.node.active = false;
            lock.active = true;
            return
        };
        quality.node.active = true;
        icon.node.active = true;
        lock.active = false;
        let std = CfgMgr.GetRole()[role.type];
        qualBg.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_icon, "quality", CardQuality[role.quality] + "_bag_bg", "spriteFrame"), SpriteFrame);
        icon.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_head_card, std.Icon, "spriteFrame"), SpriteFrame);
        quality.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_icon, "quality", CardQuality[role.quality], "spriteFrame"), SpriteFrame);
    }

    private onClickLoot() {
        let callBack = () => {
            // HomeUI.Hide();
            EventMgr.emit(Evt_Hide_Home_Ui);
            if (!BattleReadyLogic.ins)
                new BattleReadyLogic();
            // pvp 防守方玩家数据
            let defData = {
                player_id: this.playerData.player_id,
                type: FightState.PvP,
                homeland_id: this.playerData.homeland_id,
                buildings: this.playerData.buildings,
                battle_power: this.playerData.battle_power,
                icon: this.playerData.icon,
                defense_lineup: this.playerData.defense_lineup,
                roles: this.playerData.roles
            }
            BattleReadyLogic.ins.RealyBattle(defData);
            this.Hide();
            Goto("LootPanel.Hide");
            Goto("LootVsPanel.Hide");
        }
        if (PlayerData.LootPlayerData.match_count <= 0) {
            Goto("LootVsBuyNumPanel.ShowTop",callBack.bind(this));
            return;
        }
        callBack();
        // if (!data) return;
    }

    private async UpdateBagItem(item: Node, data: SPlayerDataItem | SThing) {
        let bagItem = item.getComponent(BagItem);
        if (!bagItem) bagItem = item.addComponent(BagItem);
        item.getComponent(BagItem).setIsShowSelect(false);
        bagItem.SetData(data);
    }

    private onGetBattleData(data: any) {
    }
}