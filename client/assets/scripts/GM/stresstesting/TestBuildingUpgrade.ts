import { DebugTips } from "../../module/login/DebugTips";
import { UnitTest } from "../UnitTest";
import { ITest, ReasonType } from "./ITest";

export class TestBuildingUpgrade implements ITest {

    private buildingId: number;
    private targetLv: number;

    private player: UnitTest;
    private callBack: Function;

    constructor(buildingId: number, lv: number) {
        this.buildingId = buildingId;
        this.targetLv = lv;

    }

    async run(data: UnitTest | string, host = "http://192.168.0.60:7882", callBack?: (result?: any) => void) {
        this.callBack = callBack;
        if (typeof (data) == "string") {
            this.player = new UnitTest(data, host);
        } else {
            this.player = data;
        }

        await this.player.loginning;

        let player = this.player, loop = 1, failtimes = 0;
        let lv = player.GetBuilding(this.buildingId).level || 0;

        if (lv >= this.targetLv) return Promise.resolve(undefined);

        // 等级0则先解锁建筑
        if (lv <= 0) {
            await player.Send({ type: "1_BuildingUnlock", data: { building_id: this.buildingId } }, "BuildingUnlockRet");
            let result = await player.AutoSend({ type: "1_BuildingUpgradeComplete", data: { building_id: this.buildingId, upgrade_level: 1 } }, "BuildingUpgradeCompleteRet");
            if (result.errorCode) {
                DebugTips.Show("建筑解锁失败");
                return Promise.resolve(result);
            }
            lv = 1;
        }

        // 开始升级
        while (lv < this.targetLv) {
            await player.Send({ type: "1_BuildingUpgrade", data: { building_id: this.buildingId, upgrade_level: lv + 1 } }, "BuildingUpgradeRet");
            if (!this.player.GetItem(13, 12, 11, 10)) return Promise.resolve({ reason: ReasonType.Item, value: 13, count: 10 });//加速道具不足
            await player.Send({ type: "1_Boost", data: { boost_type: 1, id: this.buildingId, items: [{ id: this.player.GetItem(13, 12, 11, 10).id, count: loop }] } }, "BoostRet");
            let data = await player.Send({ type: "1_BuildingUpgradeComplete", data: { building_id: this.buildingId, upgrade_level: lv + 1 } }, "BuildingUpgradeCompleteRet");
            if (data && data.upgrade_level) {
                lv = player.GetBuilding(this.buildingId, data.upgrade_level).level;
                failtimes = 0;
            } else {
                failtimes++;
                if (failtimes > 10) {
                    DebugTips.Show("建筑升级失败");
                    return Promise.resolve(data);
                }
            }
        }
        this.callBack?.();
        return Promise.resolve(undefined);
    }

    destory() {
    }
}