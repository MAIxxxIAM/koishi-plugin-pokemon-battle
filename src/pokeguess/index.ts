import { h } from "koishi"
import { config } from ".."
import { button, isResourceLimit, isVip, toUrl } from "../utils/mothed"
import { PokeGuess } from "./pokeguess"
import { PrivateResource } from "../model"





export async function  apply ( ctx ) {
        
    ctx.command('宝可梦').subcommand('宝可问答', '回答问题，获得奖励')
    .action(async ({session}) => {
        const q= new PokeGuess()
        const qImage = await q.q(ctx)
        const aImage = await q.a(ctx)
        const players=await ctx.database.get('pokebattle', { id: session.userId })
        if (players.length === 0) {
            await session.execute('签到')
            return
        }
        const player = players[0]
        const vip = isVip(player)
        const vipRGold = vip ? 150 : 0
        try{
            await session.bot.internal.sendMessage(session.channelId, {
                content: "111",
                msg_type: 2,
                markdown: {
                  custom_template_id: config.MDid,
                  params: [
                    {
                      key: config.key1,
                      values: [`请<@${session.userId}>听题：\r\r 猜猜我的父母是谁`]
                    },
                    {
                      key: config.key2,
                      values: ["[img#458px #331px]"]
                    },
                    {
                      key: config.key3,
                      values: [await toUrl(ctx,session,qImage)]
                    },
                    {
                      key: config.key4,
                      values: [`猜猜我是谁`]
                    },
                    {
                      key: config.key6,
                      values: [`本题答题时间30秒`]
                    }
                  ]
                },
                keyboard: {
                  content: {
                    "rows": [
                      { "buttons": [button(0, q.name[0],q.name[0], session.userId, "1"), button(0, q.name[1], q.name[1], session.userId, "2")] },
                      { "buttons": [button(0, q.name[2], q.name[2], session.userId, "1"), button(0, q.name[3], q.name[3], session.userId, "2")] },
                    ]
                  },
                },
                msg_id: session.messageId,
                timestamp: session.timestamp,
                msg_seq: Math.floor(Math.random() * 1000000),
              })
        }catch(e){
            await session.send(`${h('at', { id: (session.userId) })}请听题：
${h('image', { url:qImage})}
猜猜我的父母是谁
本题答题时间60秒
1·${q.name[0]}
2·${q.name[1]}
3·${q.name[2]}
4·${q.name[3]}
回复机器人输入答案序号或者答案文字`)
        }
        const answer = await session.prompt(60000)
        console.log(answer)
        if (!answer) {
            try {
                await session.send(`时间到，答题结束`)
                await session.bot.internal.sendMessage(session.channelId, {
                  content: "111",
                  msg_type: 2,
                  keyboard: {
                    content: {
                      "rows": [
                        { "buttons": [button(2, "📜 继续答题", `/宝可问答`, session.userId, "1"), button(2, "💳 查看信息", "/查看信息", session.userId, "2")] },
                      ]
                    },
                  },
                  msg_id: session.messageId,
                  timestamp: session.timestamp,
                  msg_seq: Math.floor(Math.random() * 1000000),
                })
                return
              } catch {
                await session.send(`时间到，答题结束`)
                return
              }
        }
        let y_n:boolean
        switch (answer) {
            case '1':
            case q.name[0]:
                y_n = q.which === 0
                break
            case '2':
            case q.name[1]:
                y_n = q.which === 1
                break
            case '3':
            case q.name[2]:
                y_n = q.which === 2
                break
            case '4':
            case q.name[3]:
                y_n = q.which === 3
                break
        }
        const right = q.name[q.which]
        let end:string
        let y =''
        if (player.ultramonster.length > 0) {
            y = `,当前回答受到传说中的宝可梦的加成，奖励增加`
          }
        if (y_n) {
        if (player.battleToTrainer >= config.对战次数+(vip?20:0)) {
          const addgole = 100 + vipRGold + 50 * player.ultramonster.length
          const resource = await isResourceLimit(session.userId, ctx)
          const rLimit = new PrivateResource(resource.resource.goldLimit)
          await rLimit.getGold(ctx, addgole, session.userId)
          player.gold += addgole
          end = `回答正确\r你获得了${addgole}金币,现在你的体力是满的，回答问题只会获得金币哦~${y}`
        }
        else {
          const addbattle = player.ultramonster.length + 1
          player.battleToTrainer += addbattle
          await ctx.database.set('pokebattle', { id: session.userId }, {
            battleToTrainer: { $add: [{ $: 'battleToTrainer' }, addbattle] },
          })
          end = `回答正确\r你获得了${player.ultramonster.length + 1}体力${y}`
        }
      }
      else {
        end = `回答错误\r正确答案是${right}`
      }
       
        try{
            await session.bot.internal.sendMessage(session.guildId, {
                content: "111",
                msg_type: 2,
                markdown: {
                  custom_template_id: config.MDid,
                  params: [
                    {
                        key: config.key1,
                        values: [`<@${session.userId}>问答结果：`]
                      },
                      {
                        key: config.key2,
                        values: ["[img#458px #331px]"]
                      },
                      {
                        key: config.key3,
                        values: [await toUrl(ctx,session,aImage)]
                      },
                      {
                        key: config.key4,
                        values: [end]
                      },
                      {
                        key: config.key6,
                        values: [`当前体力：${player.battleToTrainer}\r当前金币：${player.gold}`]
                      },
                  ]
                },
                keyboard: {
                  content: {
                    "rows": [
                      { "buttons": [button(2, "📜 继续答题", `/宝可问答`, session.userId, "1"), button(2, "💳 查看信息", "/查看信息", session.userId, "2")] },
                    ]
                  },
                },
                msg_id: session.messageId,
                timestamp: session.timestamp,
                msg_seq: Math.floor(Math.random() * 1000000),
              })
        }catch(e){
            await session.send(`<@${session.userId}>问答结果：
${h('image', { url:aImage})}
${end}
当前体力：${player.battleToTrainer}\r当前金币：${player.gold}
`)
        }
    })

}