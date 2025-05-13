import { UnitTest } from "../UnitTest";

export enum ReasonType {
    None,
    HomeLv,//家园等级不足
    Item,  //缺少道具
}

export type TestFailMsg = {
    reason:ReasonType; // 原因
    value:number;      // id等参数
    count:number;      // 数量
}

export interface ITest {
    run(entry: UnitTest | string, host?: string, callback?: (result?: any) => void): Promise<TestFailMsg>;
    destory(): any;
}

