import { DEV } from "cc/env";
import Logger from "../../../../utils/Logger";
import { Mathf } from "../../../../utils/Mathf";
import FixedMaths from "../../base/fixed/FixedMaths";
import { Runtime } from "../../Runtime";
import { Unit } from "../actor/Unit";
import { PrimaryAttr, SecondaryAttr } from './BattleAttributes';
import { PassiveSkillTrigger } from "./PassiveSkillTrigger";

export type BattleDamageInfo = {
    value: number;          // 总数值
    hp: number;             // 生命值
    shield: number;         // 护盾值
    type?: string;           // 伤害类型
    isDodge?: boolean;      // 是否闪避
    isBlock?: boolean;      // 是否格挡
    isCritical?: boolean;   // 是否暴击
}

export class BattleCalculator{

    // 计算部分伤害
    private static calculateDamage(attackPower, skillMultiplier, finalDamageReduction, finalDamageIncrease, criticalDamageMultiplier, blockReductionPercentage, classAdvantage = 1) {
        // 攻击力代入值
        let attackPowerValue = attackPower;
        
        // 技能累加系数
        let skillMultiplierValue = skillMultiplier;
        
        // 最终伤害减免
        let finalDamageReductionValue = BattleCalculator.clamp(finalDamageReduction, 0, 1);
        
        // 最终伤害增幅
        let finalDamageIncreaseValue = BattleCalculator.clamp(finalDamageIncrease, 0, 1);;
        
        // 最终暴击伤害系数
        let criticalDamageMultiplierValue = criticalDamageMultiplier;
        
        // 格挡减免百分比
        let blockReductionPercentageValue = BattleCalculator.clamp(1 - blockReductionPercentage, 0, 1);
        
        // 职业克制代入值
        let classAdvantageValue = classAdvantage;
        
        // 计算技能伤害
        let damage = attackPowerValue * 
                          skillMultiplierValue * 
                          (1 - finalDamageReductionValue + finalDamageIncreaseValue) * 
                          criticalDamageMultiplierValue * 
                          blockReductionPercentageValue * 
                          classAdvantageValue;
        
        Logger.battle(damage,attackPowerValue,skillMultiplierValue,finalDamageReductionValue,finalDamageIncreaseValue,criticalDamageMultiplierValue,blockReductionPercentageValue,classAdvantageValue);
        return damage;
    }

    // 总伤害 = 计算伤害 + 固定伤害
    static calculateTatolDamage(attacker: Unit, defence: Unit, ratio: number, tureDamage?: number[]): number{

        let battleDamageInfo: BattleDamageInfo = {
            value: 0,
            hp: 0,
            shield: 0,
        }

        let createActor = attacker;
        if (attacker.actorType == 5 && attacker.createActor) // 子弹要取子弹的创建者，但属性不取当前的
        {
            createActor = attacker.createActor;
        }
        
        battleDamageInfo.isDodge = BattleCalculator.isDodge(defence.attrs.getPrimaryAttribute(PrimaryAttr.EvadeProb));

        if(!battleDamageInfo.isDodge)
        {
            // 计算伤害
            battleDamageInfo.isCritical = BattleCalculator.isCritical(attacker.attrs.getPrimaryAttribute(PrimaryAttr.CriticalPct));
            battleDamageInfo.isBlock = BattleCalculator.isBlock(defence.attrs.getPrimaryAttribute(PrimaryAttr.Block));

            battleDamageInfo.value = -BattleCalculator.calculateDamage(attacker.attrs.getPrimaryAttribute(PrimaryAttr.AttackVal), ratio, 
                                        defence.attrs.getPrimaryAttribute(PrimaryAttr.DamageReduce), 
                                        attacker.attrs.getPrimaryAttribute(PrimaryAttr.DamageIncrease),
                                        battleDamageInfo.isCritical ? 1.5 + attacker.attrs.getPrimaryAttribute(PrimaryAttr.CriticalDmgPct) : 1,
                                        battleDamageInfo.isBlock ? 0.5 : 0,    
                                        BattleCalculator.ProfessionMechanism(defence, createActor));

            // 固定伤害
            if(tureDamage && tureDamage.length === 2)
            {
                let value = 0;
                //1：最大生命  2：当前已损失生命  3.攻击力  4：当前护盾值
                switch(tureDamage[0])
                {
                    case 1:
                        value = attacker.attrs.getPrimaryAttribute(PrimaryAttr.HPMax);
                        break;
                    case 2:
                        value = attacker.attrs.getPrimaryAttribute(PrimaryAttr.HPMax) -  attacker.attrs.getSecondaryAttribute(SecondaryAttr.HPCur);
                        break;
                    case 3:
                        value = attacker.attrs.getPrimaryAttribute(PrimaryAttr.AttackVal);
                        break;
                    case 4:
                        value = attacker.attrs.getSecondaryAttribute(SecondaryAttr.ShieldCoverCur);
                        break;
                }
                battleDamageInfo.value -= tureDamage[1] * value;
                Logger.battle("tureDamage:",value,battleDamageInfo.value,tureDamage.join("-"));
            }

        }
        battleDamageInfo.value = Mathf.parseNumber(Math.floor(battleDamageInfo.value));

        if(battleDamageInfo.value < 0)
        {
            // 伤害结算
            BattleCalculator.hurtCalculate(defence, battleDamageInfo, attacker);

            // 特殊机制结算
            BattleCalculator.SpecialMechanism(defence, battleDamageInfo.value, createActor);

        }
        
        return battleDamageInfo.value;

    }

    static BuffCalculate(attacker: Unit, defence: Unit, value: number) {
        value = Math.ceil(value);
        let battleDamageInfo: BattleDamageInfo = {
            value: value,
            hp: 0,
            shield: 0,
        }

        // 先扣盾在扣血
        if(battleDamageInfo.value < 0)
        {
            BattleCalculator.hurtCalculate(defence, battleDamageInfo, attacker);
            // let damage = defence.attrs.getSecondaryAttribute(SecondaryAttr.ShieldCoverCur) + battleDamageInfo.value;
            // battleDamageInfo.shield = damage > 0 ? battleDamageInfo.value : -defence.attrs.getSecondaryAttribute(SecondaryAttr.ShieldCoverCur);
            // battleDamageInfo.hp = battleDamageInfo.value - battleDamageInfo.shield;
        }
        else
        {
            BattleCalculator.healCalculate(defence, battleDamageInfo, attacker);
            
            // // 治疗
            // const maxHp = defence.attrs.getPrimaryAttribute(PrimaryAttr.HPMax);
            // let hurt = maxHp - defence.attrs.getSecondaryAttribute(SecondaryAttr.HPCur);
            // if(hurt < battleDamageInfo.value)
            // {
            //     battleDamageInfo.hp = hurt;
            //     battleDamageInfo.shield = battleDamageInfo.value - hurt;
            // }
            // else
            // {
            //     battleDamageInfo.hp = battleDamageInfo.value;
            //     battleDamageInfo.shield = 0;
            // }
        }

    }

    private static hurtCalculate(defence: Unit, battleDamageInfo: BattleDamageInfo, attacker: Unit) {
        let damage = defence.attrs.getSecondaryAttribute(SecondaryAttr.ShieldCoverCur) + battleDamageInfo.value;
        battleDamageInfo.shield = damage > 0 ? battleDamageInfo.value : -defence.attrs.getSecondaryAttribute(SecondaryAttr.ShieldCoverCur);
        battleDamageInfo.hp = battleDamageInfo.value - battleDamageInfo.shield;

        BattleCalculator.UpdateHp(defence, battleDamageInfo, attacker);
    }

    // defence 受效果者  attacker 施法者  受治疗加成影响
    private static healCalculate(defence: Unit, battleDamageInfo: BattleDamageInfo, attacker: Unit) {

        battleDamageInfo.value *= 1 + defence.attrs.getPrimaryAttribute(PrimaryAttr.TreatUp); //治疗加成
        battleDamageInfo.value = Math.ceil(battleDamageInfo.value);

        const maxHp = defence.attrs.getPrimaryAttribute(PrimaryAttr.HPMax);
        let hurt = maxHp - defence.attrs.getSecondaryAttribute(SecondaryAttr.HPCur);
        if(hurt < battleDamageInfo.value)
        {
            battleDamageInfo.hp = hurt;
            battleDamageInfo.shield = battleDamageInfo.value - hurt;
        }
        else
        {
            battleDamageInfo.hp = battleDamageInfo.value;
            battleDamageInfo.shield = 0;
        }

        BattleCalculator.UpdateHp(defence, battleDamageInfo, attacker);
    }

    // 闪避判断
    private static isDodge(value): boolean {
        return false;
        let rand = FixedMaths.random();
        Logger.battle(rand,value);
        return rand < value;
    }

    // 格挡判断
    private static isBlock(value): boolean {
        let seed = FixedMaths.random();
        Logger.battle(seed,value);
        return seed < value;
    }

    // 暴击判断
    private static isCritical(value): boolean {
        let seed = FixedMaths.random();
        Logger.battle(seed,value);
        return seed < value;
    }
    

    private static UpdateHp(owner: Unit, value: BattleDamageInfo, attacker: Unit) 
    {
             // 检查hp和shield是否为有效的数字
        if (isNaN(value.hp) || isNaN(value.shield) || value.hp === null || value.shield === null) {
            console.log(" UpdateHp: Invalid hp or shield value:", value.hp, value.shield);
            return false;
        }
        let realValue = value.value; // 保存原始值

        // 初始值
        const shieldMax = owner.attrs.getPrimaryAttribute(PrimaryAttr.ShieldCoverMax);
        const shieldCur = owner.attrs.getSecondaryAttribute(SecondaryAttr.ShieldCoverCur);
        const maxHp = owner.attrs.getPrimaryAttribute(PrimaryAttr.HPMax);
        const hpCur = owner.attrs.getSecondaryAttribute(SecondaryAttr.HPCur);
        
        // HitMeat,           // 对肉盾英雄造成伤害时，最终伤害=普通伤害*（1+克制肉盾系数）
        // BehitMeat,         // 被肉盾英雄攻击时，最终伤害=普通伤害*（1+克制肉盾系数）
        // HitWarrior,        // 对战士英雄造成伤害时，最终伤害=普通伤害*（1+克制战士系数）
        // BehitWarrior,      // 被战士英雄攻击时，最终伤害=普通伤害*（1+克制战士系数）
        // HitShooter,        // 对射手英雄造成伤害时，最终伤害=普通伤害*（1+克制射手系数）
        // BehitShooter,      // 被射手英雄攻击时，最终伤害=普通伤害*（1+克制射手系数）
        // HitAssist,         // 对辅助英雄造成伤害时，最终伤害=普通伤害*（1+克制辅助系数）
        // BehitAssist,       // 被辅助英雄攻击时，最终伤害=普通伤害*（1+克制辅助系数）
        // 1盾兵 2战士 3射手 4辅助
        let bjob = Runtime.configManager.GetRoleType(owner.createContext.unitType).PositionType;
        let atker = undefined;
        if(attacker.actorType == 2 || attacker.actorType == 3) {
            // hero
            atker = attacker;
        }else if(attacker.actorType == 5) {
            // buttle
            atker = attacker['createActor'];
        }
        let af = 0,bf = 0,f = 0;
        if(atker) {
            switch(bjob) {
                case 1:
                    bf = atker.attrs.getSecondaryAttribute(SecondaryAttr.HitMeat);
                    break;
                case 2:
                    bf = atker.attrs.getSecondaryAttribute(SecondaryAttr.HitWarrior);
                    break;
                case 3:
                    bf = atker.attrs.getSecondaryAttribute(SecondaryAttr.HitShooter);
                    break;
                case 4:
                    bf = atker.attrs.getSecondaryAttribute(SecondaryAttr.HitAssist);
                    break;
            }
            let ajob = Runtime.configManager.GetRoleType(atker.createContext.unitType).PositionType;
            switch(ajob) {
                case 1:
                    af = owner.attrs.getSecondaryAttribute(SecondaryAttr.BehitMeat);
                    break;
                case 2:
                    af = owner.attrs.getSecondaryAttribute(SecondaryAttr.BehitWarrior);
                    break;
                case 3:
                    af = owner.attrs.getSecondaryAttribute(SecondaryAttr.BehitShooter);
                    break;
                case 4:
                    af = owner.attrs.getSecondaryAttribute(SecondaryAttr.BehitAssist);
                    break;
            }
        }
        f = af+bf;

        // 计算变化量
        const shieldChange = value.shield; // 直接使用 value.shield，因为它表示变化量
        const hpChange = value.hp*(1+f); // 同上

        // 更新属性
        owner.attrs.setSecondaryAttribute(SecondaryAttr.ShieldCoverCur, Math.min(shieldMax, Math.max(0, shieldCur + shieldChange)),owner);
        owner.attrs.setSecondaryAttribute(SecondaryAttr.HPCur, BattleCalculator.clamp(hpCur + hpChange, 0, maxHp),owner);

        if(owner?.unitTypeConfig?.Name.indexOf("灵芝") > -1) {
            console.log("updatehp",hpChange,owner.attrs.getSecondaryAttribute(SecondaryAttr.HPCur)/owner.attrs.getSecondaryAttribute(SecondaryAttr.HPMax));
        }
        
        // 计算最终变化量（如果属性值没有超过最大或最小限制）
        const finalShieldChange = owner.attrs.getSecondaryAttribute(SecondaryAttr.ShieldCoverCur) - shieldCur;
        const finalHpChange = owner.attrs.getSecondaryAttribute(SecondaryAttr.HPCur) - hpCur;
        value.shield = shieldChange;//finalShieldChange;
        value.hp = hpChange;//finalHpChange;
        value.value = value.shield+value.hp;//finalShieldChange + finalHpChange;
        
        if(value.value != 0)
        {
            let type = value.value > 0 ? "heal" : "hurt";
            const tickerContext={
                pos: owner.pos,
                info: value,
                camp: owner.camp,
                offset: owner.unitTypeConfig?.BloodHight[1],
                type: type,
            }
            Runtime.gameLogic.PlayTicker(tickerContext)

        }

        owner.passiveSkillsCom?.handleEvent(PassiveSkillTrigger.OnHPLoseAddBuff);

        // if(DEV)console.log("changeHp",owner.createContext.actorType,value.hp);
        if(value.hp < 0 || value.shield < 0)
        {
            Runtime.collector.onHurt(owner, {
                hurtValue: Math.abs(value.value),
                attacker: attacker,
                realValue: realValue,
                })
        }
        else
        {
            Runtime.collector.onHeal(owner, {
                healValue: Math.abs(value.value),
                attacker: attacker,
                realValue: realValue,
            })
        }
        
    }
    private static clamp(value, min, max)
    {
        return Math.min(max, Math.max(min, value))
    }

    // 特殊机制结算
    private static SpecialMechanism(defense: Unit, value: number, attacker: Unit) {
        if(defense.actorId == attacker.actorId) return; // 同单位不结算

        //吸血
        if (value < 0) {
            let heal: BattleDamageInfo = {
                value: 0,
                hp: 0,
                shield: 0,
            }
            heal.value = Math.abs(value) * attacker.attrs.getPrimaryAttribute(PrimaryAttr.Vampire);
            if (heal.value > 0) {
                BattleCalculator.healCalculate(attacker, heal, attacker); 
            }
        }

        
    }

    // 职业克制机制结算
    private static ProfessionMechanism(defense: Unit, attacker: Unit) {
        let radio = 1;
        if(attacker.unitTypeConfig && defense.unitTypeConfig)
        {
            const attackerType = attacker.unitTypeConfig.PositionType;
            const defenseType = defense.unitTypeConfig.PositionType;

            const attackFactors = {
                1: attacker.attrs.getSecondaryAttribute(SecondaryAttr.HitMeat),     // 肉盾克制系数
                2: attacker.attrs.getSecondaryAttribute(SecondaryAttr.HitWarrior),  // 剑士克制系数
                3: attacker.attrs.getSecondaryAttribute(SecondaryAttr.HitShooter),  // 弓兵克制系数
                4: attacker.attrs.getSecondaryAttribute(SecondaryAttr.HitAssist)    // 辅助克制系数
            };

            const defeneFactors = {
                1: defense.attrs.getSecondaryAttribute(SecondaryAttr.BehitMeat),     // 肉盾被克制系数
                2: defense.attrs.getSecondaryAttribute(SecondaryAttr.BehitWarrior),  // 剑士被克制系数
                3: defense.attrs.getSecondaryAttribute(SecondaryAttr.BehitShooter),  // 弓兵被克制系数
                4: defense.attrs.getSecondaryAttribute(SecondaryAttr.BehitAssist)    // 辅助被克制系数
            };

            radio = radio + attackFactors[defenseType] - defeneFactors[attackerType];
        } 

        return radio;
    }

}