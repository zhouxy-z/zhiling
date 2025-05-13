import { MsgTypeRet } from "../../MsgType";
import { randomI } from "../../utils/Utils";
import { GmTest } from "../GmTest";
import { UnitTest } from "../UnitTest";
import { ITest } from "./ITest";
import { TestBuildingUpgrade } from "./TestBuildingUpgrade";
import { TestDefense } from "./TestDefense";
import { TestFishTrade } from "./TestFishTrade";
import { TestTask } from "./TestTask";
import { TestWorker } from "./TestWorker";

export class Test1 implements ITest {
    private player: UnitTest;
    private callBack: Function;

    constructor() {
    }
    async run(data: UnitTest | string, host = "http://192.168.0.60:7882", callBack?: (result?: any) => void) {
        this.callBack = callBack;
        if (typeof (data) == "string") {
            this.player = new UnitTest(data, host);
        } else {
            this.player = data;
        }

        await this.player.loginning;

        // 测试任务
        let task = new TestTask().run(this.player);

        await this.gm(host);

        // 升级主基地到9~15级
        await new TestBuildingUpgrade(1, randomI(30, 33)).run(this.player);

        // 防守塔升级到1~10级
        await new TestBuildingUpgrade(9, randomI(1, 10)).run(this.player);
        await new TestBuildingUpgrade(10, randomI(1, 10)).run(this.player);

        // 城门升级到5~22级
        await new TestBuildingUpgrade(12, randomI(5, 22)).run(this.player);

        // 升级资源建筑
        await new TestBuildingUpgrade(2, randomI(5, 15)).run(this.player);
        await new TestBuildingUpgrade(3, randomI(5, 15)).run(this.player);
        await new TestBuildingUpgrade(4, randomI(5, 15)).run(this.player);
        await new TestBuildingUpgrade(5, randomI(5, 15)).run(this.player);

        // 派遣防守
        await new TestDefense(12).run(this.player);

        this.player.Send({ "type": "5_PlunderOpen", "data": { "open": true } });

        // 派遣生产
        new TestWorker(2).run(this.player);
        new TestWorker(3).run(this.player);
        new TestWorker(4).run(this.player);
        new TestWorker(5).run(this.player);

        await task;

        // 压测运鱼
        // await new TestFishTrade().run(this.player);

        this.callBack?.();
        return Promise.resolve(undefined);
    }
    destory() {
        if (this.player) {
            let player = this.player;
            this.player = undefined;
            player.destory();
        }
    }

    private async gm(host: string) {
        GmTest.init(host, this.player.user);

        // 检测是否有植灵卡
        if (!this.player.GetIsActivateRights()) {
            if (!this.player.GetItem(1202)) await GmTest.addItem(1202, 1);
            await this.player.Send({ "type": "1_UseItem", "data": { "item_id": 1202 } }, "UseItemRet");
        }

        // 检测是否有足够的彩虹体
        if (this.player.playerInfo.currency < 1000) await GmTest.addCurrency(1000);

        // 检测是否有足够的资源
        if (this.player.playerInfo.resources.rock < 9000000 ||
            this.player.playerInfo.resources.seed < 9000000 ||
            this.player.playerInfo.resources.water < 9000000 ||
            this.player.playerInfo.resources.wood < 9000000) await GmTest.addResource(9000000, 9000000, 9000000, 9000000);

        // 检测英雄是否足够
        if (!this.player.playerInfo.roles) this.player.playerInfo.roles = [];
        if (this.player.playerInfo.roles.length < 5) {
            await GmTest.addItem(1206, 10);
            let roles = this.player.playerInfo.roles || [];
            this.player.on(MsgTypeRet.AddRolePush, data => {
                for (let i = 0; i < roles.length; i++) {
                    let role = roles[i];
                    if (role.id == data.id) {
                        roles[i] = data;
                        return;
                    }
                }
                roles.push(data);
            }, this);
            await this.player.Send({ "type": "1_OpenBox", "data": { "item_id": 1206, "count": 10, "selected_items": [] } }, "OpenBoxRet");
        }

        // 检测是否有足够的加速道具
        if (!this.player.GetItem(13) || this.player.GetItem(13).count < 1) {
            await GmTest.addItem(13, 2000);
            this.player.SetItem({ id: 13, count: 2000 });
        }
    }
}