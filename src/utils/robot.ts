import { Pokebattle } from ".."
import pokemonCal from "./pokemon"

export class Robot implements Pokebattle {
    id: string
    name: string
    level: number
    exp: number
    monster_1: string
    battlename: string
    battleTimes: number
    battleToTrainer: number
    base: string[]
    power: string[]
    skill: number
    trainer: string[]
    relex:Date
      
    constructor(level:number){
        this.level =level>=98?100: level+ Math.floor(Math.random()* 5) - 2
        this.id= 'robot'+'-'+Math.random().toString(36).substring(2, 10)
        this.name= '洛托姆'+Math.floor(Math.random()* 1000)+"号"
        this.exp= 0
        const p1= pokemonCal.mathRandomInt(1, 151)
        const p2= pokemonCal.mathRandomInt(1, 151)
        this.monster_1= p1+'.'+p2
        this.battlename= pokemonCal.pokemonlist(this.monster_1)
        this.base=pokemonCal.pokeBase(this.monster_1)
        this.power=pokemonCal.power(this.base, this.level)
        this.skill= Math.floor(Math.random()* 150)+1
        this.trainer=['robot']
        this.battleTimes=30
        this.battleToTrainer=30
        this.relex=new Date(0)
    }
}