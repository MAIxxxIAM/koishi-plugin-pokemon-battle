import { Context, Schema } from 'koishi'

import {Pokebattle,pokemonUrl,config} from '../index';
import { button } from '../utils/mothed';
import pokemonCal from '../utils/pokemon';

export const name = 'lapTwo'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})



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

  ctx.command('宝可梦').subcommand('lapTwo', '进入二周目')
  .action(async ({ session }) => {
    const { userId,platform } = session
    const userArr=await ctx.database.get('pokebattle',userId)
    const user:Pokebattle=userArr[0]
    if(user.lapTwo) return `你已经进入了二周目`
    if(user.level<80||user.ultramonster.length<5) return `条件不满足，请升级至80级，并且拥有5只传说中的宝可梦`
    if(platform=='qq'&&config.QQ官方使用MD){
      try{await session.bot.internal.sendMessage(session.channelId, {
        content: "111",
        msg_type: 2,
        markdown: {
          custom_template_id: config.文字MDid,
          params: [
            {
              key: config.key4,
              values: [`\r#\t<@${userId}>是否进入二周目`]
            },
            {
              key: config.key5,
              values: ["进入二周目,你的等级将会清空。"]
            },
            {
              key: config.key6,
              values: ["但是你的宝可梦将会保留\r并且开启传说中的宝可梦收集"]
            },
            {
              key: config.key7,
              values: ["当某个传说中的宝可梦收集至100%后，将可以捕捉并杂交"]
            },
          ]
        },
        keyboard: {
          content: {
            "rows": [
              { "buttons": [button(0, "✔️Yes", `Y`, userId, "1"), button(2, "❌No", "N", userId, "2")] },
            ]
          },
        },
        msg_id: session.messageId,
        timestamp: session.timestamp,
      })}catch(e){
        return session.send(`请勿重复点击`)
      }
    }else{
      await session.send(`\u200b
进入二周目,你的等级将会清空。
但是你的宝可梦将会保留，
并且开启传说中的宝可梦收集，
当某个传说中的宝可梦收集至100%后，
将可以捕捉并杂交

请输入Y/N`)
    }

    const inTwo=await session.prompt(config.捕捉等待时间)
switch(inTwo){
  case 'Y'||'y':
    await ctx.database.set('pokebattle',userId,{
      lapTwo:true,
      level:5,
      base:pokemonCal.pokeBase(user.monster_1),
      power:pokemonCal.power(user.base,5),
    })
    return session.send(`你成功进入了二周目`)
  case 'N'||'n':
    return session.send(`你取消了操作`)
  default:
    return session.send(`输入错误`)
}

  })
  
}
