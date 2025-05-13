import { CfgMgr } from "../../manager/CfgMgr";
import { randomI } from "../../utils/Utils";
import { UnitTest } from "../UnitTest";
import { ITest } from "./ITest";

export class TestWorker implements ITest {
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
        let player = this.player;
        let info = player.GetBuilding(this.buildingId);
        let std = CfgMgr.GetBuildingLv(this.buildingId, info.level);
        let len = randomI(1, std.WorkingRolesNum);
        let roles = player.playerInfo.roles.concat();
        let results = [];
        for (let i = 0; i < len; i++) {
            let index = randomI(0, roles.length - 1);
            results.push(roles[index]);
            roles.splice(index, 1);
        }
        for (let i = 0; i < results.length; i++) {
            let sendData = {
                type: "1_BuildingAssignRole",
                data: {
                    building_id: this.buildingId,
                    role_id: results[i].id
                }
            }
            player.Send(sendData);
        }
        this.callBack?.();
        return Promise.resolve(undefined);
    }
    destory() {
    }
}