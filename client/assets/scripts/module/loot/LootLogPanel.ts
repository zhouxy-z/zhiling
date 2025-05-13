import { Node, Button, Label, find, path, SpriteFrame, Sprite } from "cc";
import { Panel } from "../../GameRoot";
import { MsgTypeRet, MsgTypeSend } from "../../MsgType";
import { Session } from "../../net/Session";
import PlayerData, { } from "../roleModule/PlayerData"
import { FightState, SOpponentInfo, SPlunderRecordData, SQueryPlunderRecordData } from "../roleModule/PlayerStruct";
import { EventMgr, Evt_BuyPlunderTimes, Evt_Hide_Home_Ui, Evt_LootGetPlayerBattleData, Evt_LootPlunderRecord, Goto } from "../../manager/EventMgr";
import { AutoScroller } from "../../utils/AutoScroller";
import { ResMgr, folder_head_round } from "../../manager/ResMgr";
import { formatDate } from "../../utils/Utils";
import { BattleReadyLogic } from "../../battle/Ready/BattleReadyLogic";
import { Tips } from "../login/Tips";
import { CopyToClip } from "../../Platform";
import { MsgPanel } from "../common/MsgPanel";
import { BattleLogic } from "../../battle/BattleLogic";
import { CfgMgr } from "../../manager/CfgMgr";
import { DEV } from "cc/env";


export class LootLogPanel extends Panel {
    protected prefab: string = "prefabs/panel/loot/LootLogPanel";
    private LootLogList: AutoScroller;
    private challengeNumLab: Label;
    private addBtn: Node;
    private empty: Node;
    private logList: [] = [];
    private logRecordData: SQueryPlunderRecordData;
    private playerData: any;
    private revengeId: any;

    protected onLoad() {
        this.CloseBy("closeBtn");
        this.CloseBy("mask");
        this.LootLogList = this.find(`lootLogList`, AutoScroller)
        this.challengeNumLab = this.find(`challengeNumLab`, Label)
        this.addBtn = this.find(`addBtn`)
        this.empty = this.find(`empty`)
        this.onBtnEvent();
        this.LootLogList.SetHandle(this.onUpdateLogItem.bind(this));
    }

    private onBtnEvent() {
    }

    protected onShow(): void {
        EventMgr.on(Evt_LootPlunderRecord, this.onPlunderRocord, this);
        EventMgr.on(Evt_LootGetPlayerBattleData, this.onGetPlayerData, this);
        Session.on(MsgTypeRet.QueryPlunderReplayRet, this.onReplay, this);
        EventMgr.on(Evt_BuyPlunderTimes, this.onChangeTime, this);
        this.addBtn.on(Button.EventType.CLICK, this.onAddBtn, this);
    }
    public flush(...args: any[]): void {
        let data = {
            type: MsgTypeSend.QueryPlunderRecord,
            data: {
                player_id: PlayerData.roleInfo.player_id,
                page: 1,
                page_size: 30
            }
        }
        Session.Send(data);
        this.onChangeTime();
    }
    protected onHide(...args: any[]): void {
        EventMgr.off(Evt_LootPlunderRecord, this.onPlunderRocord, this);
        EventMgr.off(Evt_LootGetPlayerBattleData, this.onGetPlayerData, this);
        Session.off(MsgTypeRet.QueryBattlePlunderRecordRet, this.onReplay, this);
        EventMgr.off(Evt_BuyPlunderTimes, this.onChangeTime, this);
    }
    private onChangeTime() {
        this.challengeNumLab.string = `${PlayerData.LootPlayerData.match_count}次`;
    }
    private onPlunderRocord(data: SQueryPlunderRecordData) {
        if ($$record) {
            this.logRecordData = $$record;
        } else {
            this.logRecordData = data;
        }
        this.empty.active = this.logRecordData.opponent_info_list.length <= 0;
        this.LootLogList.UpdateDatas(this.logRecordData.opponent_info_list);
    }
    private onAddBtn() {
        Goto("LootVsBuyNumPanel.ShowTop");
    }
    private async onUpdateLogItem(item: Node, data: SOpponentInfo, index: number) {
        let PlunderRecordData: SPlunderRecordData = this.logRecordData.plunder_record_data[index];
        let defBg = find(`defBg`, item);
        let failBg = find(`failBg`, item);
        let attackIcon = find(`attackIcon`, item);
        let defendIcon = find(`defendIcon`, item);
        let typeLab = find(`typeLab`, item).getComponent(Label);
        let headCont = find(`headCont`, item);
        let playBackBtn = find(`playBackBtn`, item);
        let nameLab = find(`nameLab`, item).getComponent(Label);
        let powerLab = find(`powerLab`, item).getComponent(Label);
        let timeLab = find(`timeLab`, item).getComponent(Label);
        let revengeBtn = find(`revengeBtn`, item);
        let winFlag = find(`winFlag`, item);
        let failFlag = find(`failFlag`, item);
        let pointLab = find(`pointLab`, item).getComponent(Label);

        let isAttack = PlunderRecordData.plunder_data.attacker_player_id == PlayerData.roleInfo.player_id;
        attackIcon.active = isAttack;
        defendIcon.active = !isAttack;

        winFlag.active = false;
        failFlag.active = false;
        revengeBtn.active = false;
        defBg.active = false;
        failBg.active = false;
        if (PlunderRecordData.plunder_data.process.result != `lose`) {
            if (isAttack) {
                typeLab.string = `进攻成功`;
                defBg.active = true;
                winFlag.active = true;
            } else {
                typeLab.string = `防守失败`;
                failBg.active = true;
                failFlag.active = PlunderRecordData.has_revenged;
                // revengeBtn.active = !PlunderRecordData.has_revenged;
                revengeBtn.off(Button.EventType.CLICK)
                revengeBtn.on(Button.EventType.CLICK, () => {
                    let callBack = () => {
                        this.revengeId = PlunderRecordData.plunder_data.battle_id;
                        let sendData = {
                            type: MsgTypeSend.GetPlayerBattleData,
                            data: {
                                player_id: data.player_id,
                            }
                        };
                        Session.Send(sendData);
                    }
                    if (PlayerData.LootPlayerData.match_count <= 0) {
                        Goto("LootVsBuyNumPanel.ShowTop", callBack.bind(this));
                        return;
                    }
                    callBack();
                }, this)
            }
        } else {
            if (isAttack) {
                typeLab.string = `进攻失败`;
                failBg.active = true;
                failFlag.active = true;
            } else {
                typeLab.string = `防守成功`;
                defBg.active = true;
                winFlag.active = true;
            }
        }

        let headIcon = find(`Mask/icon`, headCont).getComponent(Sprite);
        if (data.icon_url) headIcon.spriteFrame = await ResMgr.LoadResAbSub(path.join(folder_head_round, data.icon_url, "spriteFrame"), SpriteFrame);
        nameLab.string = data.name;
        powerLab.string = `${data.battle_power}`;
        timeLab.string = `${formatDate(PlunderRecordData.plunder_data.create_time * 1000, 'yyyy-MM-dd hh:mm:ss')}`;
        pointLab.string = isAttack ? `+${PlunderRecordData.score}` : `+${PlunderRecordData.defender_score}`;


        playBackBtn.off(Button.EventType.CLICK)

        playBackBtn.on(Button.EventType.CLICK, () => {

            if ($$record) {
                this.onReplay($$record.plunder_record_data[0]);
                return;
            }
            // if(!this.checkVersion(PlunderRecordData.plunder_data.version))
            // {
            //     MsgPanel.Show(CfgMgr.GetText("replay_1"));
            //     return;
            // }


            let sendData = {
                type: MsgTypeSend.QueryPlunderReplay,
                data: {
                    battle_id: PlunderRecordData.plunder_data.battle_id,
                }
            };
            Session.Send(sendData, MsgTypeSend.QueryPlunderReplay, 2000);
        });

        find("copyIdBtn", item).on(Button.EventType.CLICK, () => {
            if (!PlunderRecordData.plunder_data.battle_id) return;
            CopyToClip(PlunderRecordData.plunder_data.battle_id, (desc: string) => {
                if (desc != undefined || desc != null) {
                    MsgPanel.Show("已复制到粘贴板");
                }
            });
        }, this);


    }

    private onGetPlayerData(data) {
        console.log(data)
        this.playerData = data.battle_data;
        this.onClickRevege()
    }

    private onClickRevege() {
        // HomeUI.Hide();
        EventMgr.emit(Evt_Hide_Home_Ui);
        PlayerData.LootMatchList = [];
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
            roles: this.playerData.roles,
            revenge_battle_id: this.revengeId,
            season_id: PlayerData.LootSeasonInfo.season_id,
        }
        BattleReadyLogic.ins.RealyBattle(defData);
        this.Hide();
        Goto("LootPanel.Hide");
    }

    private onReplay(data) {

        // if(!this.checkVersion(data.plunder_data.version))
        // {
        //     MsgPanel.Show(CfgMgr.GetText("replay_1"));
        //     return;
        // }

        // if(!data.plunder_data.version || !BattleLogic.version)
        // {
        //     MsgPanel.Show(CfgMgr.GetText("replay_1"));
        //     return;
        // }

        // // 提取前两个子串
        // const getMajorMinor = (ver) => ver.split('.').slice(0, 2).join('.');

        // let majorMinorVersion = getMajorMinor(BattleLogic.version);
        // let majorMinorDataVersion = getMajorMinor(data.plunder_data.version);

        // if(majorMinorVersion != majorMinorDataVersion)
        // {
        //     MsgPanel.Show(CfgMgr.GetText("replay_1"));
        //     return;
        // }

        this.Hide();
        // HomeUI.Hide();
        EventMgr.emit(Evt_Hide_Home_Ui);

        Goto("LootPanel.Hide");
        data.exitType = 1
        Goto("BattleReplayPanel", data);
    }

    // 检查战斗版本
    checkVersion(version) {
        if (!version || !BattleLogic.version)
            return false;

        // 提取前两个子串
        const getMajorMinor = (ver) => ver.split('.').slice(0, 2).join('.');

        let majorMinorVersion = getMajorMinor(BattleLogic.version);
        let majorMinorDataVersion = getMajorMinor(version);

        if (majorMinorVersion != majorMinorDataVersion)
            return false;

        return true;
    }
}

var $$record: SQueryPlunderRecordData = undefined;
if(DEV) {
}