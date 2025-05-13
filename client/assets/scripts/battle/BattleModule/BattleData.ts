import { IEntity } from "../../module/home/entitys/IEntity"
import { LikeNode } from "../../module/home/MapData";
import {  } from "../../module/roleModule/PlayerData"
 import {SBattleSoldier} from "../../module/roleModule/PlayerStruct";

export type Deployment =
    {
        ID: string,
        Role: IEntity,
        Index: number,
        Type: number,
        MaxCount: number,
        SoldierType: number[],
        BattlePower: number,
        IsAssist: boolean,
        pos: LikeNode,
        LeaderShip: number,
        Soldiers?: SBattleSoldier[],
    }


export type SliderValue = {
    id: number, // 士兵ID
    count: number,
    max: number,
    index: number,
    kucun: number,
}
