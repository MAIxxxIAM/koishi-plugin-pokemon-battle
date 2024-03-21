
import exptolv from '../assets/json/ExpToLv.json'
import expbase from '../assets/json/expbase.json'
import skillMachines from '../assets/json/skillMachine.json'
import Base from '../assets/json/PokemonBase.json'
import * as Type from '../assets/json/pokemonType.json'
import * as bType from '../assets/json/battleType.json'
import { Skills } from '../battle'


export const expToLv= exptolv
export const expBase = expbase
export const skillMachine = skillMachines
export const pokemonBase = Base
export const type = Type
export const battleType = bType

export const skills=new Skills(skillMachines.skill)