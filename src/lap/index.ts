import { Context, Schema } from 'koishi'

import {Pokebattle,config,Config } from '../index';
import { button, toUrl } from '../utils/mothed';
import pokemonCal from '../utils/pokemon';

export const name = 'lapTwo'


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
    if(user?.lapTwo) return `你已经进入了二周目`
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
        return `请勿重复点击`
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
      exp:0,
      base:pokemonCal.pokeBase(user.monster_1),
      power:pokemonCal.power(user.base,5),
    })
    return `你成功进入了二周目`
  case 'N'||'n':
    return `你取消了操作`
  default:
    return `输入错误`
}

  })

  ctx.command('宝可梦').subcommand('ultra', '传说中的宝可梦收集值')
  .action(async ({ session }) => {
    const { userId } = session
    const userArr=await ctx.database.get('pokebattle',userId)
    const user:Pokebattle=userArr[0]
    const ultra=user?.ultra
    let str:string[]=[]
    let mdStr:string[]=[]
    for(let poke in ultra){
      if(ultra[poke]==null) continue
      const img=await toUrl(ctx,session,`${config.图片源}/sr/${poke.split('.')[0]}.png`)
      str.push(`\u200b
${pokemonCal.pokemonlist(poke)}的收集度是${ultra[poke]}0% ${'🟩'.repeat(Math.floor(ultra[poke]/2))+'🟨'.repeat(ultra[poke]%2)+ '⬜⬜⬜⬜⬜'.substring(Math.round(ultra[poke]/2))}`)
      mdStr.push(`${pokemonCal.pokemonlist(poke)} : ${ultra[poke]}0%  ${'🟩'.repeat(Math.floor(ultra[poke]/2))+'🟨'.repeat(ultra[poke]%2)+ '⬜⬜⬜⬜⬜'.substring(Math.round(ultra[poke]/2))}`)
    }
    if(!ultra) return `你还没有进入二周目`
    if(mdStr.length==0) return `你还没有收集到传说中的宝可梦`

    try{
      // const keys=[config.key6,config.key7,config.key8,config.key9,config.key10]
      // const params=keys.map((key,index)=>{
      //   if (mdStr[index] !== undefined) {
      //     return { key: key, values: [mdStr[index]] };
      //   }
      // })
      // .filter(item => item !== undefined);
      // console.log(params)
      await session.bot.internal.sendMessage(session.channelId, {
        content: "111",
        msg_type: 2,
        markdown: {
          custom_template_id: config.文字MDid,
          params: [
            {
              key: config.key4,
              values: [`\r#\t<@${userId}>当前的收集值`]
            },
            // {
            //   key: config.key5,
            //   values: ['![img#20 #20](']
            // },
            {
              key: config.key6,
              values: [mdStr.join('\r')]
            },
          ]
          // .concat(params)
        },
        keyboard: {
          content: {
            "rows": [
              { "buttons": [button(2, "📷 捕捉", `/捕捉宝可梦`, userId, "1"), button(2, "♂ 杂交", "/杂交宝可梦", userId, "2")] },
            ]
          },
        },
        msg_id: session.messageId,
        timestamp: session.timestamp,
      })
    }catch(e){
      
      return str.join('\n')
    }
  })
  
}
