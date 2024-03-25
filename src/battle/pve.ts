import { PokemonPower, WildPokemon } from ".";
import { config, logger } from "..";
import { Pokebattle } from "../model";
import { skillMachine, skills } from "../utils/data";
import { getType, typeEffect } from "../utils/mothed";
import pokemonCal from "../utils/pokemon";
import { PVP } from "./pvp";

export class PVE implements WildPokemon {
    id: string
    name: string
    type: string[]
    level: number
    hitSpeed: number
    power: PokemonPower
    skill: number
    constructor(id: string, player: Pokebattle) {
        this.id = id
        this.name = pokemonCal.pokemonlist(id)
        this.type = getType(id)
        const level = player.level
        this.level = level
        const PokeBase = pokemonCal.pokeBase(id)
        this.hitSpeed = Number(PokeBase[5])
        const power = pokemonCal.power(PokeBase, level)
        this.power = {
            hp: Number(power[0]) * config.野生宝可梦难度系数*Math.ceil(player.level/100),
            attack: Number(power[1]) * config.野生宝可梦难度系数*Math.ceil(player.level/100),
            defense: Number(power[2]) * config.野生宝可梦难度系数*Math.ceil(player.level/100),
            specialAttack: Number(power[3]) * config.野生宝可梦难度系数*Math.ceil(player.level/100),
            specialDefense: Number(power[4]) *config.野生宝可梦难度系数*Math.ceil(player.level/100),
            speed: Number(power[5])
        }
        const skill = skills.skills.filter(skill => skill.type === this.type[0])
        const chooseSkill = Math.floor((this.level-1) / 100 * skill.length)
        this.skill = skill[chooseSkill].id
    }
    private getKeys<T>(obj: T, category: number): (keyof T) {
        return Object.keys(obj)[category] as (keyof T)
    }
    wildAttack(target: PVP) {
        const hit = Math.random() < this.hitSpeed / 4 / 256 ? 2 : 1
        const skillCategory = skillMachine.skill[this.skill].category
        const attCategory = skillCategory
        const defCategory = attCategory + 1
        const Effect = typeEffect(this.id, target.monster_1, skillMachine.skill[this.skill].type)
        let damage = Math.floor(((2 * this.level + 10) / 250 * this.power[this.getKeys(this.power, attCategory)] / (1.7 * target.power[this.getKeys(target.power, defCategory)]) * skillMachine.skill[this.skill].Dam + 2) * hit * Effect * (Math.random() * 0.15 + 0.85))
        target.power.hp = target.power.hp - damage
        target.power.hp = target.power.hp < 0 ? 0 : target.power.hp
        const log = hit == 2 ? (`*${this.name}击中要害,对${target.battlename}造成 ${Math.floor(damage)} 伤害*`) :
            (`${this.name}的 [${skillMachine.skill[this.skill].skill}]，造成 ${Math.floor(damage)} 伤害,${target.battlename}剩余${Math.floor(target.power.hp)}HP`)
        return log
    }
}

export function catchPokemon(a: Pokebattle, b: string) {
    try {
        let log = []
        let winner: string
        let first, second
        const wildPokemon = new PVE(b, a)
        const player = new PVP(a)
        if (player.power.speed > wildPokemon.power.speed) {
            first = player
            second = wildPokemon
        } else {
            first = wildPokemon
            second = player
        }
        while (player.power.hp > 0 && wildPokemon.power.hp > 0) {
            log.push(first.wildAttack(second))
            if (second.power.hp <= 0) {
                winner = first.id
                log.push(`${first.name} 胜利了`)
                break
            }
            log.push(second.wildAttack(first))
            if (first.power.hp <= 0) {
                winner = second.id
                log.push(`${second.name} 胜利了`)
                break
            }
        }
        return [log.join('\n'), winner == a.id]
    } catch (e) {
        logger.error(e)
        return [`战斗出现意外了`, false]
    }
}