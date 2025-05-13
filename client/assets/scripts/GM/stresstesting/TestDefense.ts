import { MsgTypeSend } from "../../MsgType";
import { CfgMgr } from "../../manager/CfgMgr";
import {  } from "../../module/roleModule/PlayerData"
 import {SBattleRole} from "../../module/roleModule/PlayerStruct";
import { randomI } from "../../utils/Utils";
import { UnitTest } from "../UnitTest";
import { ITest } from "./ITest";

export class TestDefense implements ITest {
    private player: UnitTest;
    private callBack: Function;
    private buildingId: number;
    constructor(buildingId: number) {
        this.buildingId = buildingId;
    }

    async run(entry: UnitTest | string, host?: string, callBack?: (result: any) => void) {
        this.callBack = callBack;
        if (typeof (entry) == "string") {
            this.player = new UnitTest(entry, host);
        } else {
            this.player = entry;
        }

        await this.player.loginning;
        let player = this.player;;
        let info = player.GetBuilding(this.buildingId);
        let std = CfgMgr.GetBuildingLv(this.buildingId, info.level);
        let len = randomI(1, std.DefenseRolesNum);
        let roles = player.playerInfo.roles.concat();
        let results = [];
        for (let i = 0; i < len; i++) {
            let index = randomI(0, roles.length - 1);
            results.push(roles[index]);
            roles.splice(index, 1);
        }
        let battles = [];
        for (let i = 0; i < results.length; i++) {
            let battle: SBattleRole = {
                role_id: results[i].id,
                soldiers: undefined
            }
            battles[i] = battle;
        }
        let sendData = {
            type: MsgTypeSend.SetDefenseRoles,
            data: {
                lineup: battles
            }
        }
        player.Send(sendData);
        this.callBack?.();
        return Promise.resolve(undefined);
    }

    destory() {
    }
}