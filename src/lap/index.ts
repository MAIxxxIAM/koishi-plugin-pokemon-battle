import { Context, Schema } from 'koishi'

import {Pokebattle,pokemonUrl,config} from '../index';

export const name = 'lapTwo'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

declare module 'koishi' {
  interface Pokebattle {
    lapTwo:boolean
    ultra:object
  }
}

export function apply(ctx: Context) {

  ctx.model.extend('pokebattle', {
    lapTwo:{
      type: 'boolean',
      initial: false,
      nullable: false,
    },
    ultra:{
      type: 'json',
      initial: {},
      nullable: false,
    }
  })
  
}
