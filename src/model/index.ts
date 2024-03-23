import { $, Context, Session } from "koishi"
import { Pokedex } from "../pokedex/pokedex"
import { PokemonPower, Skill } from "../battle"
import pokemonCal from "../utils/pokemon"
import { PVP } from "../battle/pvp"
import { config } from ".."


declare module 'koishi' {
    interface Tables {
        'pokemon.battleSlot': BattleSlot
        'pokebattle': Pokebattle
        'pokemon.notice': PNotice
        'pokemon.resourceLimit': Resource
        'pokemon.addGroup': AddGroup
    }
}

export interface AddGroup {
    id: string
    count: number
    addGroup: string[]
}

export class PrivateResource {
    goldLimit: number
    constructor(gold: number) {
        this.goldLimit = gold
    }
    async getGold(ctx: Context, gold: number, userId:string){
        if (this.goldLimit >= gold) {
            this.goldLimit = this.goldLimit - gold
        } else {
            gold = this.goldLimit
            this.goldLimit = 0
        }
        await ctx.database.set('pokemon.resourceLimit', {id:userId}, {rankScore: 0, resource: this })

        await ctx.database.set('pokebattle', {id:userId}, (data) => ({
            gold: $.add(data.gold, gold)
        }))
        return gold
    }
    async addGold(ctx: Context, gold: number, userId:string){
        this.goldLimit = this.goldLimit + gold*10000
        await ctx.database.set('pokemon.resourceLimit', {id:userId}, {rankScore: 0, resource: this })
    }
    async subGold(ctx: Context, gold: number, userId:string){
        if (this.goldLimit <gold*10000) {
            this.goldLimit=0
            return
        }
        this.goldLimit = this.goldLimit - gold*10000
        await ctx.database.set('pokemon.resourceLimit', {id:userId}, {rankScore: 0, resource: this })
    }
}

export interface Resource {
    id: string
    rankScore: number
    resource: PrivateResource
}

export class Pokemon {
    id: number
    monster_1: string
    battlename: string
    level: number
    hitSpeed: number
    power: PokemonPower
    skill: [Skill?, Skill?, Skill?, Skill?]
    constructor(mId: string) {
        this.monster_1 = mId
        this.id = Number(mId.split('.')[0])
        this.battlename = pokemonCal.pokemonlist(mId)
        this.level = 5
        const allBase = pokemonCal.pokeBase(mId)
        this.hitSpeed = Number(allBase[5])
        const allPower = pokemonCal.power(allBase, this.level)
        this.power = {
            hp: Number(allPower[0]),
            attack: Number(allPower[1]),
            defense: Number(allPower[2]),
            specialAttack: Number(allPower[3]),
            specialDefense: Number(allPower[4]),
            speed: Number(allPower[5])
        }
        this.skill = [new Skill(0)]
    }
    // attack(target:PVP){
    //     const hit=Math.random() <this.hitSpeed/4/256?2:1
    //     const skillCategory = skillMachine.skill[this.skill].category
    //     const attCategory=skillCategory
    //     const defCategory=attCategory+1
    //     const Effect =typeEffect(this.monster_1,target.monster_1,skillMachine.skill[this.skill].type)
    //     let damage = Math.floor(((2 * this.level + 10) / 250 * this.power[this.getKeys(this.power,attCategory)] / (1.7*target.power[this.getKeys(target.power,defCategory)]) * skillMachine.skill[this.skill].Dam + 2) *hit*Effect*(Math.random()*0.15+0.85))
    //     target.power.hp = target.power.hp - damage
    //   const log=  hit==2?(`*${this.battlename}击中要害,对${target.battlename}造成 ${Math.floor(damage)} 伤害*`):
    //     (`${this.battlename}的 [${skillMachine.skill[this.skill].skill}]，造成 ${Math.floor(damage)} 伤害,${target.battlename}剩余${Math.floor(target.power.hp)}HP`)
    //     return log
    // }

}

interface PokeBag {
    pokemon: [Pokemon?, Pokemon?, Pokemon?, Pokemon?, Pokemon?, Pokemon?]
}

export interface BattleSlot {
    id: string
    pokemonBag: PokeBag
}

export interface PNotice {
    id: number
    date: Date
    notice: string
}

export interface Pokebattle {
    id: string
    name: string
    date?: number
    captureTimes?: number
    battleTimes: number
    battleToTrainer: number
    pokedex?: Pokedex
    level: number
    exp: number
    vip?: number
    monster_1: string
    battlename?: string
    AllMonster?: string[]
    ultramonster?: string[]
    base: string[]
    power: string[]
    skill: number
    coin?: number
    gold?: number
    changeName?: number
    skillbag?: string[]
    trainer: string[]
    trainerNum?: number
    trainerName?: string[]
    lapTwo?: boolean
    ultra?: object
}

export async function model(ctx: Context) {

    ctx.model.extend('pokebattle', {
        id: 'string',
        name: 'string',
        date: 'integer',
        captureTimes: 'unsigned',
        battleTimes: 'unsigned',
        battleToTrainer: 'unsigned',
        pokedex: 'json',
        level: 'unsigned',
        exp: 'unsigned',
        vip: {
            type: 'unsigned',
            initial: 0,
            nullable: false,
        },
        monster_1: 'string',
        battlename: 'string',
        AllMonster: 'list',
        ultramonster: 'list',
        base: 'list',
        power: 'list',
        skill: 'integer',
        coin: 'unsigned',
        gold: 'unsigned',
        changeName: {
            type: 'integer',
            initial: 1,
            nullable: false,
        },
        skillbag: 'list',
        trainer: 'list',
        trainerNum: 'unsigned',
        trainerName: 'list',
    }, {
        primary: "id"
    })
    ctx.model.extend('pokemon.notice', {
        id: 'unsigned',
        date: 'date',
        notice: 'string'
    }, {
        autoInc: true,
        primary: "id"
    })

    ctx.model.extend('pokemon.resourceLimit', {
        id: 'string',
        rankScore: 'unsigned',
        resource: {
            type: 'json',
            initial: new PrivateResource(config.金币获取上限),
            nullable: false,
        },
    }, {
        primary: "id"
    })
    ctx.model.extend('pokemon.addGroup', {
        id: 'string',
        count:{
            type: 'unsigned',
            initial:3,
            nullable: false,
        },
        addGroup: 'list'
    }, {
        primary: "id"
    })
}