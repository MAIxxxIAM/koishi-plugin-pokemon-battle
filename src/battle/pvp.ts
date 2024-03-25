import { Pokebattle, logger } from '..';
import { skillMachine } from '../utils/data';
import { typeEffect } from '../utils/mothed';
import { Battlers, PokemonPower } from './';
import { PVE } from './pve';

export class PVP implements Battlers {
    id: string
    name: string
    level: number
    monster_1: string
    battlename: string
    hitSpeed: number
    power: PokemonPower
    skill: number
    constructor(player1:Pokebattle) {
        this.id= player1.id
        this.name= player1.name
        this.level= player1.level
        this.monster_1= player1.monster_1
        this.battlename= player1.battlename
        this.hitSpeed= Number(player1.base[5])
        this.power= {
            hp: Number(player1.power[0]),
            attack: Number(player1.power[1]),
            defense: Number(player1.power[2]),
            specialAttack: Number(player1.power[3]),
            specialDefense: Number(player1.power[4]),
            speed: Number(player1.power[5])
        }
        this.skill= player1.skill
    }
    private getKeys<T>(obj: T,category:number): (keyof T) {
        return Object.keys(obj)[category] as (keyof T)
    }

    attack(target:PVP){
        const hit=Math.random() <this.hitSpeed/4/256?2:1
        const skillCategory = skillMachine.skill[this.skill].category
        const attCategory=skillCategory
        const defCategory=attCategory+1
        const Effect =typeEffect(this.monster_1,target.monster_1,skillMachine.skill[this.skill].type)
        let damage = Math.floor(((2 * this.level + 10) / 250 * this.power[this.getKeys(this.power,attCategory)] / (1.7*target.power[this.getKeys(target.power,defCategory)]) * skillMachine.skill[this.skill].Dam + 2) *hit*Effect*(Math.random()*0.15+0.85))
        target.power.hp = target.power.hp - damage
      const log=  hit==2?(`*${this.battlename}击中要害,对${target.battlename}造成 ${Math.floor(damage)} 伤害*`):
        (`${this.battlename}的 [${skillMachine.skill[this.skill].skill}]，造成 ${Math.floor(damage)} 伤害,${target.battlename}剩余${Math.floor(target.power.hp)}HP`)
        return log
    }
    wildAttack(target:PVE){
      const hit=Math.random() <this.hitSpeed/4/256?2:1
      const skillCategory = skillMachine.skill[this.skill].category
      const attCategory=skillCategory
      const defCategory=attCategory+1
      const Effect =typeEffect(this.monster_1,target.id,skillMachine.skill[this.skill].type)
      let damage = Math.floor(((2 * this.level + 10) / 250 * this.power[this.getKeys(this.power,attCategory)] / (1.7*target.power[this.getKeys(target.power,defCategory)]) * skillMachine.skill[this.skill].Dam + 2) *hit*Effect*(Math.random()*0.15+0.85))
      target.power.hp = target.power.hp - damage
      target.power.hp=target.power.hp<0?0:target.power.hp
    const log=  hit==2?(`*${this.battlename}击中要害,对${target.name}造成 ${Math.floor(damage)} 伤害*`):
      (`${this.battlename}的 [${skillMachine.skill[this.skill].skill}]，造成 ${Math.floor(damage)} 伤害,${target.name}剩余${Math.floor(target.power.hp)}HP`)
      return log
  }
}

export function pokebattle(a:Pokebattle, b:Pokebattle) {
    try {
      let log = []
      let winner= { id: '' }
      let loser= { id: '' }
      let first:PVP, second:PVP
      if (Number(a.power[5]) > Number(b.power[5])) {
        first = new PVP(a)
        second = new PVP(b)
      } else {
        first = new PVP(b)
        second = new PVP(a)
      }
      while (Number(a.power[0]) > 0 &&Number( b.power[0]) > 0) {
        log.push(first.attack(second))
        if (second.power.hp<= 0) {
          winner = { id: first.id }
          loser = { id: second.id } 
          log.push(`${first.battlename} 胜利了`)
          break
        }
        log.push(second.attack(first))
        if (first.power.hp <= 0) {
          winner = { id: second.id }
          loser = { id: first.id } 
          log.push(`${second.battlename} 胜利了`)
          break
        }
      }
      return [log.join('\n'), winner.id, loser.id]
    } catch(e)
    {
      logger.error(e)
      return [`战斗出现意外了`,a.id,a.id]
    }
  }