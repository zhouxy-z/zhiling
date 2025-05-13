import { UnitTest } from "../UnitTest";
import { ITest, TestFailMsg } from "./ITest";

export class TestFanyu implements ITest {

    private player:UnitTest;
    private callBack: Function;

    constructor() {

    }

    async run(entry: string | UnitTest, host?: string, callback?: (result?: any) => void): Promise<TestFailMsg> {
        this.callBack = callback;
        if (typeof (entry) == "string") {
            this.player = new UnitTest(entry, host);
        } else {
            this.player = entry;
        }

        await this.player.loginning;

        // {"type":"1_MergeRole","data":{"role_id":"d3a8f96e-7fc7-4d39-b307-9bbe28aabe4c","target_quality":3,"consume_role_id":"7120a324-a905-45ce-9aa3-94e951e088fe","up_item_ids":[],"up_item_nums":[],"friend_ids":[]}}
        // this.player.playerInfo.
    }

    destory() {
        
    }
}