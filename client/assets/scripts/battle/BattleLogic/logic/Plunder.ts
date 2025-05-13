import { BattleLogic } from "../../BattleLogic";
import { ActorType, CreateContext, map_grid_size } from "../Def";
import { Runtime } from "../Runtime"
import { Vec2, Vec3 } from 'cc';
import { GameMap } from "./actor/GameMap";
import { Add } from '../../../module/home/entitys/Add';
import { GoToCommand } from "./component/UnitBehavior";
import { FixedVector2 } from "../base/fixed/FixedVector2";
import { ConfigManager } from "../../manager/ConfigManager";
import FixedMaths from "../base/fixed/FixedMaths";


export class Plunder {

    onInitHeroFinish; // 初始化攻击方阵容后回调
    onBattleOver;
    onBattleProcess;

    battleInitData;
    battleOver;

    isReplay;
    homeland_id;

    cameraFollowUnit;

    battleShowTime;

    battleResult = "lose";//模式結果

    InitBattleActor() {
        this.battleOver = false;
        this.InitRoleBattle();
    }


    InitRoleBattle() {

        this.addAttacks();
        this.addDefenders();
        this.addBuildings();
    }

    GetRole(roles: any[], roleId: string) {
        for (let j = 0; j < roles.length; j++) {
            if (roles[j]['id'] == roleId) {
                return roles[j];
            }
        }
        return null;
    }

    addAttacks() {
        let data = this.battleInitData;
        
        let attackPlayerId = data['attacker_player_id'];
        let attackerBattleData = data['attacker_battle_data'];
        let attackRoles = attackerBattleData.attack_lineup;
        let roles = attackerBattleData['roles'];
        //let assist_role = data.attacker_assist_role;
        if (roles == undefined || roles == null || roles.length == 0)
            return;
        let camp = 1;
        for (let i = 0; i < attackRoles.length; i++) {
            let lineupInfo = attackRoles[i]
            if (!lineupInfo)
                continue
            
            let role = this.GetRole(roles, lineupInfo.role_id);
            // if (!role && lineupInfo.role_id == assist_role.id) {
            //     role = assist_role;
            // }
            
            
            if (!role)
                continue;
    
            let pos = Runtime.map.GetAtkPosition(i);
            let group = camp * 100 + i;

            let roleConfig = Runtime.configManager.Get("role_type")[role.type];
            let context: CreateContext = {
                actorType: ActorType.hero,
                unitType: roleConfig.RoleType,
                camp: camp,
                pos: new FixedVector2(pos[0], pos[1]),
                angleY: pos[3],
                attrs: role.battle_attributes,
                scale: 1,
                group: group,
                skillSlotId: i,
                skills: Runtime.configManager.GetSkillIds(role),
                passiveSkills: role.passive_skills,
            };
            Runtime.gameLogic.CreateActor(context);
            

            this.addSoldier(lineupInfo.soldiers, context.camp, pos, group, pos[3]);
        }
    
        if (this.onInitHeroFinish)
            this.onInitHeroFinish();
    }

    addDefenders() {
        let data = this.battleInitData;
        
        let defenderPlayerId = data['defender_player_id'];
        let defenderBattleData = data['defender_battle_data'];
        let defenderRoles = defenderBattleData.defense_lineup;
        let roles = defenderBattleData['roles'];
        if (roles == undefined || roles == null || roles.length == 0 || defenderRoles == undefined || defenderRoles.length == 0)
            return;
        let camp = 2;
        for (let i = 0; i < defenderRoles.length; i++) {
            let lineupInfo = defenderRoles[i]
            if (!lineupInfo)
                continue
            
            let role = this.GetRole(roles, lineupInfo.role_id);
            if (!role)
                continue;

            let roleConfig = Runtime.configManager.Get("role_type")[role.type];
            let group = camp * 100 + i;
            let pos = Runtime.map.GetDefPosition(i);
            let context: CreateContext = {
                actorType: ActorType.hero,
                unitType: roleConfig.RoleType,
                camp: camp,
                pos: new FixedVector2(pos[0], pos[1]),
                angleY: pos[3],
                attrs: role.battle_attributes,
                scale: 1,
                group: group,
                skills: Runtime.configManager.GetSkillIds(role),
                passiveSkills: role.passive_skills,
            };
            Runtime.gameLogic.CreateActor(context);
            
            this.addSoldier(lineupInfo.soldiers, context.camp, pos, group, pos[3]);
        }
    }

    addBuildings()
    {
        let data = this.battleInitData;

        let defenderPlayerId = data['defender_player_id'];
        let defenderBattleData = data['defender_battle_data'];
        let buildings = defenderBattleData['buildings'];
        
        for (let i = 0; i < buildings.length; i++) {
            let buildingId = buildings[i].id;
            let buildingConfig = Runtime.configManager.GetBuildingConfig(buildingId);

            if(buildingConfig == undefined || buildingConfig == null || buildingConfig == '')
                continue;
           
            let buildingInfo = Runtime.map.GetBuildingInfo(buildingConfig.BuildingId)
            if(!buildingInfo.pos)
                continue;
            
            let unitTypeConfig = Runtime.configManager.Get('role_type')[buildingConfig.RoleId];
            if(!unitTypeConfig)
                continue;

                let context: CreateContext = {
                    actorType: ActorType.building,
                    unitType: unitTypeConfig.RoleType,
                    camp: 2,
                    pos: new FixedVector2(buildingInfo.pos[0], buildingInfo.pos[1]),
                    angleY: 180,
                    scale: 1,
                    group: defenderPlayerId,
                    buildingId: buildingConfig.BuildingId,
                    grids: buildingInfo.bounds,
                    radius : buildingInfo.radius,
                    attrs: buildings[i].battle_attributes,
                    skills: Runtime.configManager.GetSkillIds(unitTypeConfig),
                    level: buildings[i].level,
                };
                Runtime.gameLogic.CreateActor(context);
        }
    }

    addSoldier(soldiers, camp, pos, group, angle)
    {
        let soldier = Runtime.collector.InitSoldierStats(soldiers, camp);

        if (!soldier || !soldier.soldier_type || soldier.count <= 0)
            return

        let facingBack = !(angle > 90 && angle < 270);
        let dir = facingBack ? 1 : -1;
        let unitTypeConfig = Runtime.configManager.Get("role_type")[soldier.id];
        for(let k = 0; k < 6; k++)
        {
            if (k == 1)
                continue

            let offset = this.calculateSoldierOffset(k);

            let context: CreateContext = {
                actorType: ActorType.soldier,
                unitType: soldier.id,
                camp: camp,
                pos: new FixedVector2(pos[0] + offset.x * dir, pos[1] + offset.y * dir),
                angleY: angle,
                attrs: soldier.battle_attributes,
                scale: 1,
                group: group,
                soldierType: soldier.soldier_type,
                skills: Runtime.configManager.GetSkillIds(unitTypeConfig),
            };
            Runtime.gameLogic.CreateActor(context);
        }
    }

    private calculateSoldierOffset(index : number): {x: number, y: number} 
    {
        // 假设 map_grid_size 变量已经定义并赋值
        const gridSize = map_grid_size
        
        // 根据 index 计算士兵相对于英雄的偏移量
        const rowOffset = Math.floor(index / 3)
        const colOffset = index % 3

        // 计算士兵的实际偏移量
        const offsetX = (colOffset - 1) * gridSize 
        const offsetY = -(rowOffset + 2) * gridSize + 0.2

        return {x: offsetX, y: offsetY}
    }

    IsBattleOver() {
        const heroes = Runtime.gameLogic.GetActorsByType(ActorType.hero);
        const soldiers = Runtime.gameLogic.GetActorsByType(ActorType.soldier);
        const buildings = Runtime.gameLogic.GetActorsByType(ActorType.building);
    
        let camp1Count = 0;
        let camp2Count = 0;
    
        // 统计英雄、士兵和建筑的阵营数量
        for (const id in heroes) {
            const hero = heroes[id];
            if (!hero.isDie) {
                if (hero.camp === 1) {
                    camp1Count++;
                } else if (hero.camp === 2) {
                    camp2Count++;
                }
            }
        }
    
        for (const id in soldiers) {
            const soldier = soldiers[id];
            if (!soldier.isDie) {
                if (soldier.camp === 1) {
                    camp1Count++;
                } else if (soldier.camp === 2) {
                    camp2Count++;
                }
            }
        }
    
        for (const id in buildings) {
            const building = buildings[id];
            if (!building.isDie) {
                if (building.camp === 1) {
                    camp1Count++;
                } else if (building.camp === 2) {
                    camp2Count++;
                }
            }
        }
        
        // console.log("IsBattleOver",camp1Count , camp2Count,this.isReplay , this.battleOver);

        // 判断是否有一个阵营全部阵亡
        if (camp1Count === 0 || camp2Count === 0) {
            this.battleResult = camp1Count > 0 ? "win" : "lose";
            this.Over(this.battleResult)
            return true;
        }

        if(this.battleOver)
            return true;
        return false;
    }

    Settle()
    {

    }

    Over(result)
    {
        if(this.isReplay || this.battleOver)
            return;

        Runtime.game.SetGameSpeed(1);
        this.battleOver = true;
        if (this.onBattleOver) {
            this.onBattleOver({
                result: result,
                operations: [...Runtime.gameLogic.syncBattleProcess.frameEventList]
            });
        }
    }

    ReplayEnd(result){
        if(this.battleOver)
            return;

        this.battleOver = true;
        console.log("Runtime.game.isVerification",Runtime.game.isVerification);
        console.log("Replay End : " + result + "     Verification:" + this.battleResult);
        if (this.onBattleOver) {
            if(!Runtime.game.isVerification) // 如果不是验证模式
                this.onBattleOver(result);
            else
                this.onBattleOver(this.battleResult)
        }
    }


    IsPart1Over()
    {
        let heroUnits = Object.keys(Runtime.gameLogic.actorsByType[ActorType.hero]).map(key => Runtime.gameLogic.actorsByType[ActorType.hero][key]);
        let soldierUnits = Object.keys(Runtime.gameLogic.actorsByType[ActorType.soldier]).map(key => Runtime.gameLogic.actorsByType[ActorType.soldier][key]);
        let buildingUnits = Object.keys(Runtime.gameLogic.actorsByType[ActorType.building]).map(key => Runtime.gameLogic.actorsByType[ActorType.building][key]);
        let units = [...heroUnits, ...soldierUnits, ...buildingUnits];

        let jidi = buildingUnits.find(actor => actor.buildingConfig?.BuildingType == 1)
        if(jidi)
            jidi.isInvincible = true; // 防止基地被攻击


        const filteredHeroes = units.filter(actor => actor.camp === 2 && !actor.isDie && !(actor.buildingConfig?.BuildingType == 1));

        return filteredHeroes.length === 0
    }

    GoEnemyHome()
    {
        if(!this.homeland_id)
            this.homeland_id = Runtime.configManager.homeland_id;

        let heroUnits = Object.keys(Runtime.gameLogic.actorsByType[ActorType.hero]).map(key => Runtime.gameLogic.actorsByType[ActorType.hero][key]);
        let soldierUnits = Object.keys(Runtime.gameLogic.actorsByType[ActorType.soldier]).map(key => Runtime.gameLogic.actorsByType[ActorType.soldier][key]);

        let units = [...heroUnits, ...soldierUnits];

        const filteredHeroes = units.filter(actor => actor.camp === 1 && !actor.isDie);

        let paths = Runtime.map.GetPath(Runtime.battleModule.homeland_id)
        if(!paths)
            return;
        
        let walks = 3; // 修改路径
        for (let i = 0; i < filteredHeroes.length; ++i) {
            let unit = filteredHeroes[i];
        
            unit.unitBehavior.EndSearchTarget();

            let path = paths[i % walks];
        
           
            for (let j = 0; j < path.length; ++j) {
                let command = new GoToCommand(path[j]);
                unit.unitBehavior.AppendCommand(command);
            }
            
            // let index = walk - i % walk;

            // let lastCommand = new GoToCommand(path[path.length - index]);
            // unit.unitBehavior.AppendCommand(lastCommand);
        }

        let buildingUnits = Object.keys(Runtime.gameLogic.actorsByType[ActorType.building]).map(key => Runtime.gameLogic.actorsByType[ActorType.building][key]);
        let jidi = buildingUnits.find(actor => actor.buildingConfig?.BuildingType == 1)
        if(jidi)
            jidi.isInvincible = false; // 防止基地被攻击

    }

    IsMoveOver(){
        let heroUnits = Object.keys(Runtime.gameLogic.actorsByType[ActorType.hero]).map(key => Runtime.gameLogic.actorsByType[ActorType.hero][key]);
        let soldierUnits = Object.keys(Runtime.gameLogic.actorsByType[ActorType.soldier]).map(key => Runtime.gameLogic.actorsByType[ActorType.soldier][key]);

        let units = [...heroUnits, ...soldierUnits];

        const filteredHeroes = units.filter(actor => actor.camp === 1 && !actor.isDie && actor.unitBehavior.commandQueue.length > 0);

        if(filteredHeroes.length == 0)
        {
            let buildingUnits = Object.keys(Runtime.gameLogic.actorsByType[ActorType.building]).map(key => Runtime.gameLogic.actorsByType[ActorType.building][key]);
            const filteredHeroes = buildingUnits.filter(actor => actor.camp === 2 && !actor.isDie);
            if(filteredHeroes && filteredHeroes.length > 0)
            {
                this.cameraFollowUnit = filteredHeroes[0];
                return true;
            }
        }

        return false;

    }

    //表演阶段
    BattleShow(){
        if(this.isReplay) return true;

        if(!this.battleShowTime)
        {
            this.battleShowTime = Runtime.game.currTime;
            Runtime.game.SetGameSpeed(0.5);
        }
        return this.battleShowTime + 2 < Runtime.game.currTime;
    }



    BattleProcess(data)
    {
        if (this.onBattleProcess){
            this.onBattleProcess({
                current_frame : Runtime.game.currFrame,
                operations: data.operations,
                casualties: null,
                occupation_rate: 0,
                is_finished: false,
                result : null,
            })
        }
    }
}
