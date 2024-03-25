import { skillMachine } from "../utils/data"

export interface PokemonPower{
    hp: number
    attack: number
    defense: number
    specialAttack: number
    specialDefense: number
    speed: number
}

export interface Battlers{
    id:string
    name:string
    level: number
    monster_1: string
    battlename: string
    hitSpeed: number
    power: PokemonPower
    skill: number
}

export interface WildPokemon{
    id:string
    name:string
    type: string[]
    level: number
    hitSpeed: number
    power: PokemonPower
    skill: number
}

export class Skill {
    id:number
    name:string
    type:string
    category:number
    dam:number
    hit:number
    descript:string
    constructor (id:string|number){
        const skillId=Number(id)
        const skill=skillMachine.skill[skillId]
        this.id=Number(skill.id)
        this.name=skill.skill
        this.type=skill.type
        this.category=Number(skill.category)
        this.dam=skill.Dam
        this.hit=skill.hit
        this.descript=skill.descript
    }

}

export class Skills{
    skills:Skill[]
    constructor(skills:object){
        this.skills=[]
        for (const skill in skills) {
            this.skills.push(new Skill(skill))
        }
    }
}