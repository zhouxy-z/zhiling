import { Node, Button, Label, find, Sprite, path, SpriteFrame, UITransform, UI } from "cc";
import { Panel } from "../../GameRoot";
import { EventMgr, Evt_BuyPlunderTimes, Evt_LootGetPlayerBattleData, Evt_LootPlayerData, Evt_Matching, Evt_Matching2, Evt_PvpSerchFinsh, Evt_PvpUdateTween } from "../../manager/EventMgr";
import { MsgTypeSend } from "../../MsgType";
import { Session } from "../../net/Session";
import { Tips } from "../login/Tips";
import { LootVsBuyNumPanel } from "./LootVsBuyNumPanel";
import { LootRoleInfoPanel } from "./LootRoleInfoPanel";
import PlayerData from "../roleModule/PlayerData";
import { CfgMgr, ThingType } from "../../manager/CfgMgr";
import { ChangeScenePanel } from "../home/ChangeScenePanel";
import { randomI, ToFixed, formatNumber } from '../../utils/Utils';
import { ResMgr, folder_loot } from "../../manager/ResMgr";
import { LootRoleInfoSeasonPanel } from "./LootRoleInfoSeasonPanel";
import { ConsumeItem } from "../common/ConsumeItem";
import { ItemUtil } from "../../utils/ItemUtils";
import { GameSet } from "../GameSet";


export class LootVsPanel extends Panel {
    protected prefab: string = "prefabs/panel/loot/LootVsPanel";
    private seekBtn: Button;
    private challengeNumLab: Label;
    private addBtn: Button;
    private matchData;
    private cdTime = 0;
    private serch: Node;

    protected onLoad() {
        this.CloseBy("closeBtn");
        this.CloseBy("mask");
        // this.vsCont = this.find(`vsCont`);
        this.seekBtn = this.find(`seekBtn`, Button);
        this.challengeNumLab = this.find(`challengeNumLab`, Label);
        this.addBtn = this.find(`addBtn`, Button);
        this.serch = this.find(`serch`);
        this.onBtnEvent();
    }

    private onBtnEvent() {
        this.addBtn.node.on(Button.EventType.CLICK, this.onAddBtn, this);
        this.seekBtn.node.on(Button.EventType.CLICK, this.onSeekBtn, this);
    }

    protected onShow(): void {
        EventMgr.on(Evt_LootPlayerData, this.onPlayerData, this);
        EventMgr.on(Evt_LootGetPlayerBattleData, this.onGetPlayerData, this);
        EventMgr.on(Evt_BuyPlunderTimes, this.onChangeTime, this);
        EventMgr.on(Evt_Matching2, this.onCD, this);
        EventMgr.on(Evt_PvpSerchFinsh, () => { this.serch.active = false }, this);
    }
    public flush(...args: any[]): void {
        if (!args[0]) return;
        this.matchData = args[0];
        this.refershCount();
        EventMgr.emit(Evt_PvpUdateTween);
        this.onCD();
    }
    protected onHide(...args: any[]): void {
        EventMgr.off(Evt_LootPlayerData, this.onPlayerData, this);
        EventMgr.off(Evt_LootGetPlayerBattleData, this.onGetPlayerData, this);
        EventMgr.off(Evt_BuyPlunderTimes, this.onChangeTime, this);
        EventMgr.off(Evt_Matching2, this.onCD, this);
    }

    private onChangeTime() {
        this.challengeNumLab.string = `${PlayerData.LootPlayerData.match_count}次`;
    }

    private async onSeekBtn() {
        let data = {
            type: MsgTypeSend.Matchmaking,
            data: {
            }
        }
        Session.Send(data);
        // await ChangeScenePanel.PlayEffect(Evt_PvpSerchFinsh);
        this.serch.active = true;
    }
    private onAddBtn() {
        LootVsBuyNumPanel.Show();
    }
    private onPlayerData(data) {
        this.challengeNumLab.string = `${data.match_player_data.match_count}次`;
    }
    private refershCount() {
        let Num = randomI(3, 1);
        let vsCont = this.find(`vsCont${Num}`)
        let bg = this.find(`map`, Sprite);
        ResMgr.LoadResAbSub(path.join(folder_loot, `0${Num}`, `spriteFrame`), SpriteFrame, res => {
            bg.spriteFrame = res;
        });
        let spr_path = path.join("sheets/loot/", "home", "spriteFrame")
        if(GameSet.GetServerMark() == "hc"){
            spr_path = path.join("sheets/loot/", "home_hc", "spriteFrame")
        }

        this.find(`vsCont${1}`).active = false
        this.find(`vsCont${2}`).active = false
        this.find(`vsCont${3}`).active = false
        vsCont.active = true;
        let hide_message = CfgMgr.getPVPById(PlayerData.LootSeasonInfo.season_id).hide_message;
        vsCont.children.forEach((node, index) => {
            if (this.matchData[index]) {
                ResMgr.LoadResAbSub(spr_path, SpriteFrame, res => {
                    find(`homeIcon`, node).getComponent(Sprite).spriteFrame = res;
                });
                let data = this.matchData[index];
                let powerLab = find(`resCont/powerLab`, node).getComponent(Label);
                let itemNode:Node = find(`resCont/item`, node);
                let itemCom:ConsumeItem = itemNode.getComponent(ConsumeItem) || itemNode.addComponent(ConsumeItem);
                itemCom.SetData(ItemUtil.CreateThing(ThingType.ThingTypeMedal, 0, data.currency_74));
                let roleLvLab = find(`infoCont/roleLvLab`, node).getComponent(Label);
                let roleNameLab = find(`infoCont/roleNameLab`, node).getComponent(Label);
                let revengeIcon = find(`revengeIcon`, node);
                let attacjNumIcon = find("attacjNumIcon", node);
                let shieldEffect = find(`ui_shield`, node);
                //let roleNameBg = node.getChildByPath(`infoCont/roleNameBg`).getComponent(UITransform);
                roleLvLab.string = hide_message == 1 ? "??" :  data.level;
                powerLab.string = data.battle_power;
                
                roleNameLab.string = hide_message == 1 ? "??????" : data.player_name;
                // roleNameLab.updateRenderData();
                //roleNameBg.width = roleNameLab.node.getComponent(UITransform).width + 70;
                shieldEffect.active = data.has_shield;
                revengeIcon.active = data.are_enemies;
                attacjNumIcon.active = data.attack_count > 0;
                node.off(Node.EventType.TOUCH_END);
                node.on(Node.EventType.TOUCH_END, () => {

                    let seasonData = CfgMgr.getPVPById(PlayerData.LootSeasonInfo.season_id);
                    if(data.has_shield && (!seasonData || !seasonData.protect_effect))
                    {
                        Tips.Show(CfgMgr.GetText("pvp_2"));
                        return;
                    }


                    let sendData = {
                        type: MsgTypeSend.GetPlayerBattleData,
                        data: {
                            player_id: data.player_id,
                        }
                    };
                    Session.Send(sendData);
                }, this);
            }
        })
        this.challengeNumLab.string = `${PlayerData.LootPlayerData.match_count}次`;
        this.serch.active = false;
    }
    private onGetPlayerData(data) {
        let seasonData = CfgMgr.getPVPById(PlayerData.LootSeasonInfo.season_id);
        if(seasonData.hide_message == 1){
            LootRoleInfoSeasonPanel.ShowTop(data.battle_data);
        }else{
            LootRoleInfoPanel.Show(data.battle_data);
        }
    }

    private onCD() {
        let seasonData = CfgMgr.getPVPById(PlayerData.LootSeasonInfo.season_id);
        this.cdTime = seasonData.MateCDAdd;
        this.seekBtn.node.getComponent(Sprite).grayscale = true;
        this.seekBtn.interactable = false;
        this.seekBtn.node.children.forEach((node) => {
            node.active = node.name == `CDLab`;
        })
        this.seekBtn.node.getChildByName(`CDLab`).getComponent(Label).string = `搜索冷却(${this.cdTime}S)`
        this.seekBtn.unscheduleAllCallbacks();
        this.seekBtn.schedule(() => {
            this.cdTime--;
            this.seekBtn.node.getChildByName(`CDLab`).getComponent(Label).string = `搜索冷却(${this.cdTime}S)`
            if (this.cdTime <= 0) {
                this.seekBtn.node.getComponent(Sprite).grayscale = false;
                this.seekBtn.interactable = true;
                this.seekBtn.node.children.forEach((node) => {
                    node.active = node.name != `CDLab`;
                })
            }
        }, 1, this.cdTime)
        this.serch.active = false;
    }
}