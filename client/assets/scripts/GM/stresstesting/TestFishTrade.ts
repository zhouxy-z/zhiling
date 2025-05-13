import { Second, randomI } from "../../utils/Utils";
import { UnitTest } from "../UnitTest";
import { ITest } from "./ITest";

export class TestFishTrade implements ITest {
    private player: UnitTest;
    private callBack: Function;
    private running: Promise<any>;
    private handle: Function;
    private stop: boolean = false;
    constructor() {
        let self = this;
        this.running = new Promise((resolve, reject) => {
            self.handle = resolve;
        });
    }

    async run(entry: UnitTest | string, host?: string, callBack?: (result: any) => void) {
        this.callBack = callBack;
        if (typeof (entry) == "string") {
            this.player = new UnitTest(entry, host);
        } else {
            this.player = entry;
        }

        await this.player.loginning;
        this.cycle();
        return this.running;
    }
    async cycle() {
        this.player.on("ItemChangePush", this.player.SetItem, this.player);

        this.player.Send({ "type": "11_FishingTradeJoin", "data": {} });
        this.player.Send({ "type": "11_FishingTradeGetData", "data": {} });
        this.player.Send({ "type": "11_FishingTradeRecordQuery", "data": { "query_type": 0, "count": 5 } });
        while (!this.stop) {
            this.player.Send({ "type": "11_FishingTradeJoin", "data": {} });
            this.player.Send({ "type": "11_FishingTradeRecordQuery", "data": { "query_type": 0, "count": randomI(-1, 1) * 5 } });
            let count = this.player.GetItem(18)?.count || 0;
            let rand = randomI(1, 10);
            if (!count || count < rand) {
                this.player.Send({ "type": "11_FishingTradeConvertItem", "data": { "count": randomI(-1, 1) * rand } });
            }

            this.player.Send({ "type": "11_FishingTradeSelectShip", "data": { "ship_id": randomI(-1, 1) * randomI(101, 103) } });
            this.player.Send({ "type": "11_FishingTradeLoadFish", "data": { "fish_item_id_list": [], "cost_item_count": randomI(-1, 1) * rand } });
            await Second(0.2);
        }
        this.callBack?.();
        let h = this.handle;
        this.handle = undefined;
        h();
    }

    destory() {
        this.player.off("ItemChangePush", this.player.SetItem, this.player);
        this.stop = true;
    }
}