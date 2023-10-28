import { Context, Schema, Time, h } from 'koishi'
import pokemonCal from './module/pokemon'
import { } from "koishi-plugin-echarts"
import { } from "koishi-plugin-skia-canvas"
import { argv } from 'process'
import { pathToFileURL } from 'url'
import { resolve } from 'path'
import * as fs from 'fs';
import * as path from 'path';
import * as yauzl from './module/yauzl/index.js';


export const name = 'pokemon-battle'

export const using = ['database', 'echarts']
export const usage = `### 10.20 新增功能
- 更明显的经验条显示
- 放生获得经验
- 指令回复更合理的产生联动
- 【属性】指令的雷达图样式
### 10.21 
- 图片由网络api更改至本地，现在频道也能看见杂交的宝可梦了
- 相同宝可梦可以杂交了

### 10.22
- 图包由整合在插件内改为解压图包文件，启用插件后，根据日志提示解压文件。（推荐手动解压，由于数量过多，指令解压会很慢）

### 10.23
- 修复了一些bug
- 更新了对战功能【对战 @对手】
- 增加了技能抽奖机【技能扭蛋机】
- 增加了技能背包【技能背包】
- 增加了技能机使用指令【装备技能 <技能名字>】
- 可能会出现一下无法预料的bug（原谅我的屎山代码
`

export interface Config {
  签到指令别名: string
  捕捉指令别名: string
  杂交指令别名: string
  查看信息指令别名: string
  放生指令别名: string
  签到获得个数: number
}

export const Config = Schema.intersect([
  Schema.object({
    签到指令别名: Schema.string().default('签到'),
    捕捉指令别名: Schema.string().default('捕捉宝可梦'),
    杂交指令别名: Schema.string().default('杂交宝可梦'),
    查看信息指令别名: Schema.string().default('查看信息'),
    放生指令别名: Schema.string().default('放生')
  }),
  Schema.object({
    签到获得个数: Schema.number().default(2),
  }).description('数值设置')
])

declare module 'koishi' {
  interface Tables {
    pokebattle: Pokebattle
  }
}

export interface Pokebattle {
  id: String
  date: Number
  captureTimes: Number
  level: Number
  exp: Number
  monster_1: String
  battlename: String
  AllMonster: string[]
  base: string[]
  power: string[]
  skill: Number
  coin: Number
  gold: Number
  skillbag: string[]
}

export async function apply(ctx, config: Config) {
  const logger = ctx.logger('pokemon')
  const task1 = ctx.downloads.nereid('task1', [
    'npm://pokemon-imgx',
    'npm://pokemon-imgx?registry=https://registry.npmmirror.com', ,
  ], 'bucket1')
  task1.promise.then((path) => {
    logger.info('下载图包完成')
    logger.info('图包目录：' + resolve(path) + '可以通过指令【解压图包文件】\n如果不想通过指令解压图包\n【指令解压可能会很慢】，可以到日志提示的目录下\n手动解压到koishi根目录（即让image文件夹与downloads文件夹同级）')
  })
  ctx.database.extend('pokebattle', {
    id: 'string',
    date: 'integer',
    captureTimes: 'integer',
    battleTimes: 'integer',
    level: 'unsigned',
    exp: 'unsigned',
    monster_1: 'string',
    battlename: 'string',
    AllMonster: 'list',
    base: 'list',
    power: 'list',
    skill: 'integer',
    coin: 'integer',
    gold: 'integer',
    skillbag: 'list'
  }, {
    primary: "id"
  })
  const exptolv = require('./ExpToLv.json')
  const Base = require('./PokemonBase.json')
  const skillMachine = require('./skillMachine.json')
  //签到
  ctx.command('宝可梦签到')
    .alias(config.签到指令别名)
    .action(async ({ session }) => {
      const userArr = await ctx.database.get('pokebattle', { id: session.userId })
      let dateToday = Math.round(Number(new Date()) / 1000)
      if (userArr.length != 0) {
        let dateNow = Math.floor((userArr[0].date + 28800) / 86400)
        if (dateNow == Math.floor((dateToday + 28800) / 86400)) {
          session.send('今天你已经签到过了哟~快去捕捉属于你的宝可梦吧')
        } else {
          if(userArr[0].monster_1=='null') {
            await ctx.database.set('pokebattle', { id: session.userId }, {
              monster_1:'0'
            })
          if(!userArr[0].skill){
            await ctx.database.set('pokebattle', { id: session.userId }, {
              skill:0
            })
          }
          }
          let expGet = pokemonCal.mathRandomInt(exptolv.exp_lv[userArr[0].level].exp * 0.05, exptolv.exp_lv[userArr[0].level].exp * 0.2)
          let expNew = pokemonCal.expCal(userArr[0].level, userArr[0].exp + expGet)[1]
          let lvNew = pokemonCal.expCal(userArr[0].level, userArr[0].exp + expGet)[0]
          let ToDo
          if (userArr[0].monster_1 !== '0') {
            ToDo = `当前战斗宝可梦：${(pokemonCal.pokemonlist(userArr[0].monster_1))}
            ${(pokemonCal.pokemomPic(userArr[0].monster_1, true))}
            `
          } else {
            ToDo = '快去杂交出属于你的宝可梦吧'
          }
          try {await ctx.database.set('pokebattle', { id: session.userId }, {
            captureTimes: { $add: [{ $: 'captureTimes' }, config.签到获得个数] },
            battleTimes: 3,
            date: dateToday,
            level: lvNew,
            exp: expNew,
            battlename: pokemonCal.pokemonlist(userArr[0].monster_1),
            base: pokemonCal.pokeBase(userArr[0].monster_1 ),
            power: pokemonCal.power(pokemonCal.pokeBase(userArr[0].monster_1), lvNew),
            coin: { $add: [{ $: 'coin' }, config.签到获得个数] },
            gold: { $add: [{ $: 'gold' }, 3000] },
          })}catch(e){return `请再试一次`}
          session.send(`${(h('at', { id: (session.userId) }))}
精灵球+${(config.签到获得个数)}
经验+${(expGet)}
当前等级为lv.${(lvNew)}
当前经验：[[${(pokemonCal.exp_bar(lvNew, expNew))}]]
当前精灵球数：${(userArr[0].captureTimes + config.签到获得个数)}个
金币+3000
技能扭蛋机代币+${(config.签到获得个数)}
${(ToDo)}
通过【${(config.查看信息指令别名)}】来查询自己的宝可梦
快去成为宝可梦大师吧！
Tips：可以通过【${(config.放生指令别名)}】来把宝可梦放归大自然
被放生的宝可梦有概率给你珍藏的精灵球和经验噢~`)
        }
      } else {
        let firstMonster_ = pokemonCal.mathRandomInt(1, 151)
        let firstMonster = firstMonster_ + '.' + firstMonster_
        await ctx.database.create('pokebattle', {
          id: session.userId,
          date: Math.round(Number(new Date()) / 1000),
          captureTimes: config.签到获得个数,
          level: 5,
          exp: 0,
          monster_1: '0',
          AllMonster: [firstMonster,],
          coin: config.签到获得个数,
          gold: 3000
        })
        session.send(`${(h('at', { id: (session.userId) }))}
恭喜你成功进入宝可梦的世界
在这个世界中
由于原生宝可梦极其稀有
所以你无法使用原生宝可梦就行战斗
通过 【${(config.捕捉指令别名)}】
来获取原生宝可梦
通过 【${(config.杂交指令别名)}】
进行杂交宝可梦
使用杂交出来的优秀宝可梦进行战斗
每个人身上只能携带一只杂交宝可梦以及6只原生宝可梦
你当前信息：
当前等级为lv.5
当前精灵球数量：${(config.签到获得个数)}
你的第一只宝可梦是：
【${(pokemonCal.pokemonlist(firstMonster))}】
${pokemonCal.pokemomPic(firstMonster, false)}
初始资金：3000
初始技能扭蛋机代币：${(config.签到获得个数)}个
已经放进背包啦`)
      }
    })
  ctx.command('捕捉宝可梦')
    .alias(config.捕捉指令别名)
    .action(async ({ session }) => {
      const userArr = await ctx.database.get('pokebattle', { id: session.userId })
      if (userArr.length == 0) {
        return `请先输入【${(config.签到指令别名)}】领取属于你的宝可梦和精灵球`
      } else {
        if (userArr[0].captureTimes > 0) {
          let grassMonster1 = pokemonCal.mathRandomInt(1, 151), grassMonster2 = pokemonCal.mathRandomInt(1, 151), grassMonster3 = pokemonCal.mathRandomInt(1, 151)
          let poke1 = grassMonster1 + '.' + grassMonster1
          let poke2 = grassMonster2 + '.' + grassMonster2
          let poke3 = grassMonster3 + '.' + grassMonster3
          session.send(`
${(h('at', { id: (session.userId) }))}🌿🌿🌿🌿
🌿🌿🌿🌿🌿🌿🌿🌿
【1】${(pokemonCal.pokemonlist(poke1))}🌿🌿🌿
${h.image(pathToFileURL(resolve(__dirname, './images', grassMonster1 + '.png')).href)}
🌿🌿🌿🌿🌿🌿🌿🌿
【2】${(pokemonCal.pokemonlist(poke2))}🌿🌿🌿
${h.image(pathToFileURL(resolve(__dirname, './images', grassMonster2 + '.png')).href)}
🌿🌿🌿🌿🌿🌿🌿🌿
【3】${(pokemonCal.pokemonlist(poke3))}🌿🌿🌿
${h.image(pathToFileURL(resolve(__dirname, './images', grassMonster3 + '.png')).href)}
🌿🌿🌿🌿🌿🌿🌿🌿
请在10秒内输入序号
  `)
          const chooseMonster = await session.prompt()
          let choose
          let poke
          let reply
          if (!chooseMonster) {
            await ctx.database.set('pokebattle', { id: session.userId }, {
              captureTimes: { $subtract: [{ $: 'captureTimes' }, 1] },
            })
            return `哎呀！宝可梦们都逃跑了！
精灵球-1`
          }
          switch (chooseMonster) {
            case '1':
              poke = poke1
              session.send(`${(h('at', { id: (session.userId) }))}恭喜获得${(pokemonCal.pokemonlist(poke))}
${pokemonCal.pokemomPic(poke, false)}
精灵球-1`)
              break;
            case '2':
              poke = poke2
              session.send(`${(h('at', { id: (session.userId) }))}恭喜获得${(pokemonCal.pokemonlist(poke))}
${pokemonCal.pokemomPic(poke, false)}
精灵球-1`)
              break;
            case '3':
              poke = poke3
              session.send(`${(h('at', { id: (session.userId) }))}恭喜获得${(pokemonCal.pokemonlist(poke))}
${pokemonCal.pokemomPic(poke, false)}
精灵球-1`)
              break;
          }
          await ctx.database.set('pokebattle', { id: session.userId }, {
            captureTimes: { $subtract: [{ $: 'captureTimes' }, 1] },
          })
          if (userArr[0].AllMonster.length < 6) {
            let five: string = ''
            if (userArr[0].AllMonster.length === 5) five = `\n你的背包已经满了,你可以通过【${(config.放生指令别名)}】指令，放生宝可梦`

            if (poke == poke1 || poke == poke2 || poke == poke3) {
              userArr[0].AllMonster.push(poke)
              await ctx.database.set('pokebattle', { id: session.userId }, {
                AllMonster: userArr[0].AllMonster,
              })
            }
            return five
          } else if (chooseMonster == '1' || chooseMonster == '2' || chooseMonster == '3') {
            session.send(`${(h('at', { id: (session.userId) }))}
你的背包中已经有6只原生宝可梦啦
请选择一只替换
【1】${(pokemonCal.pokemonlist(userArr[0].AllMonster[0]))}
【2】${(pokemonCal.pokemonlist(userArr[0].AllMonster[1]))}
【3】${(pokemonCal.pokemonlist(userArr[0].AllMonster[2]))}
【4】${(pokemonCal.pokemonlist(userArr[0].AllMonster[3]))}
【5】${(pokemonCal.pokemonlist(userArr[0].AllMonster[4]))}
【6】${(pokemonCal.pokemonlist(userArr[0].AllMonster[5]))}
          `)
            const BagNum = await session.prompt(25000)

            if (!BagNum) {
              return '你犹豫太久啦！宝可梦从你手中逃走咯~'
            }
            switch (BagNum) {
              case '1':
                userArr[0].AllMonster[0] = poke
                await ctx.database.set('pokebattle', { id: session.userId }, {
                  AllMonster: userArr[0].AllMonster,
                })
                reply = `你小心翼翼的把 ${(pokemonCal.pokemonlist(poke))} 放在了背包第一格`
                break;
              case '2':
                userArr[0].AllMonster[1] = poke
                await ctx.database.set('pokebattle', { id: session.userId }, {
                  AllMonster: userArr[0].AllMonster,
                })
                reply = `你小心翼翼的把 ${(pokemonCal.pokemonlist(poke))} 放在了背包第二格`
                break;
              case '3':
                userArr[0].AllMonster[2] = poke
                await ctx.database.set('pokebattle', { id: session.userId }, {
                  AllMonster: userArr[0].AllMonster,
                })
                reply = `你小心翼翼的把 ${(pokemonCal.pokemonlist(poke))} 放在了背包第三格`
                break;
              case '4':
                userArr[0].AllMonster[3] = poke
                await ctx.database.set('pokebattle', { id: session.userId }, {
                  AllMonster: userArr[0].AllMonster,
                })
                reply = `你小心翼翼的把 ${(pokemonCal.pokemonlist(poke))} 放在了背包第四格`
                break;
              case '5':
                userArr[0].AllMonster[4] = poke
                await ctx.database.set('pokebattle', { id: session.userId }, {
                  AllMonster: userArr[0].AllMonster,
                })
                reply = `你小心翼翼的把 ${(pokemonCal.pokemonlist(poke))} 放在了背包第五格`
                break;
              case '6':
                userArr[0].AllMonster[5] = poke
                await ctx.database.set('pokebattle', { id: session.userId }, {
                  AllMonster: userArr[0].AllMonster,
                })
                reply = `你小心翼翼的把 ${(pokemonCal.pokemonlist(poke))} 放在了背包最后一格`
                break;
              default:
                reply = `你好像对新的宝可梦不太满意，把 ${(pokemonCal.pokemonlist(poke))} 放生了`
            }
            session.send(reply)
          } else {
            return '球丢歪啦！重新捕捉吧~\n精灵球-1"'
          }
        } else {
          let dateToday = Math.round(Number(new Date()) / 1000)
          let dateNow = Math.floor(userArr[0].date / 86400 - 28800)
          if (dateNow == Math.floor(dateToday / 86400 - 28800)) {
            return `${(h('at', { id: (session.userId) }))}
今日次数已用完
请明天通过【${(config.签到指令别名)}】获取精灵球
`
          } else {
            return `${(h('at', { id: (session.userId) }))}
你的精灵球已经用完啦
请通过【${(config.签到指令别名)}】获取新的精灵球
          `
          }
        }
      }
    })
  ctx.command('杂交宝可梦')
    .alias(config.杂交指令别名)
    .action(async ({ session }) => {
      const userArr = await ctx.database.get('pokebattle', { id: session.userId })
      let bagspace: string[] = []
      let dan
      if (userArr.length != 0) {
        for (let i = 0; i < 6; i++) {
          if (userArr[0].AllMonster[i] != 0) {
            bagspace.push(userArr[0].AllMonster[i])
          } else {
            bagspace.push("空精灵球")
          }
        }
        session.send(`${(h('at', { id: (session.userId) }))}
请选择背包中的宝可梦进行杂交
输入【编号】空格【编号】
你的背包：
【1】${(pokemonCal.pokemonlist(bagspace[0]))}【2】${(pokemonCal.pokemonlist(bagspace[1]))}
【3】${(pokemonCal.pokemonlist(bagspace[2]))}【4】${(pokemonCal.pokemonlist(bagspace[3]))}
【5】${(pokemonCal.pokemonlist(bagspace[4]))}【6】${(pokemonCal.pokemonlist(bagspace[5]))}
`)
        const zajiao = await session.prompt(30000)
        if (zajiao) {
          let comm = zajiao.split(' ')
          let pokeM = bagspace[Number(comm[0]) - 1]
          let pokeW = bagspace[Number(comm[1]) - 1]
          let tip=''
          if (pokeM=='150.150'&&pokeW=='150.150') tip='超梦是人造宝可梦，自交会导致基因断裂，成为梦幻形态'
          dan = pokemonCal.pokemonzajiao(pokeM, pokeW)
          if (dan == 0 || dan[0] == 0) {
            //处理杂交错误
            return '输入错误'
          } else {
            if (userArr[0].monster_1 != '0') {
              //有战斗宝可梦
              session.send(`${(h('at', { id: (session.userId) }))}
恭喜你成功杂交出优秀的后代宝可梦【${(dan[0])}】
${pokemonCal.pokemomPic(dan[1], true)}
当前战斗宝可梦是：【${(pokemonCal.pokemonlist(userArr[0].monster_1))}】
${pokemonCal.pokemomPic(userArr[0].monster_1, true)}
是否放入战斗栏（y/n）
${tip}
`)
              const battleBag = await session.prompt(20000)
              switch (battleBag) {
                case 'y':
                case 'Y':
                  await ctx.database.set('pokebattle', { id: session.userId }, {
                    monster_1: dan[1],
                    battlename: dan[0],
                    base: pokemonCal.pokeBase(dan[1]),
                    power: pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)
                  })
                  const chart = ctx.echarts.createChart(300, 300, pokemonCal.pokemonproperties(pokemonCal.pokeBase(dan[1]), pokemonCal.pokemonlist(dan[1])))
                  const buffer = (await chart).canvas.toBuffer("image/png")
                    ; (await chart).dispose()
                  return '成功将' + dan[0] + '放入战斗栏' + '\n' + h.image(buffer, "image/png");
                case 'n':
                case 'N':
                  return '你对这个新宝可梦不太满意，把他放生了';
                default:
                  return '新出生的宝可梦好像逃走了';
              }
            } else {
              //没有战斗宝可梦
              await ctx.database.set('pokebattle', { id: session.userId }, {
                monster_1: dan[1],
                base: pokemonCal.pokeBase(dan[1]),
                battlename: dan[0],
                power: pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)
              })

              return `${(h('at', { id: (session.userId) }))}恭喜你
              成功杂交出优秀的后代宝可梦【${(dan[0])}】
              ${pokemonCal.pokemomPic(dan[1], true)}
              成功将${(dan[0])}放入战斗栏`
            }
          }
        } else { return `蛋好像已经臭了，无法孵化。` }

      } else {
        return `请先输入【${(config.签到指令别名)}】领取属于你的宝可梦和精灵球`
      }
    })
  ctx.command('查看信息 <user:user>')
    .alias(config.查看信息指令别名)
    .action(async ({ session }, user) => {
      if (!user) {
        //查看自己信息
        const userArr = await ctx.database.get('pokebattle', { id: session.userId })
        if (userArr.length != 0) {
          let bagspace: string[] = []
          for (let i = 0; i < 6; i++) {
            if (userArr[0].AllMonster[i] != 0) {
              bagspace.push(userArr[0].AllMonster[i])
            } else {
              bagspace.push("空精灵球")
            }
          }
          //存在数据
          if (userArr[0].monster_1 != '0') {
            return `${(h('at', { id: (session.userId) }))}
当前等级为lv.${(userArr[0].level)}
当前经验：[[${(pokemonCal.exp_bar(userArr[0].level, userArr[0].exp))}]]
当前金币：${(userArr[0].gold)}
当前扭蛋币：${(userArr[0].coin)}
当前精灵球数：${(userArr[0].captureTimes)}个
当前战斗宝可梦:【${(pokemonCal.pokemonlist(userArr[0].monster_1))}】
${pokemonCal.pokemomPic(userArr[0].monster_1, true)}
你的背包：
【1】${(pokemonCal.pokemonlist(bagspace[0]))}【2】${(pokemonCal.pokemonlist(bagspace[1]))}
【3】${(pokemonCal.pokemonlist(bagspace[2]))}【4】${(pokemonCal.pokemonlist(bagspace[3]))}
【5】${(pokemonCal.pokemonlist(bagspace[4]))}【6】${(pokemonCal.pokemonlist(bagspace[5]))}
输入指令【技能背包】来查看已有的技能机
 `
          } else {
            return `${(h('at', { id: (session.userId) }))}
当前等级为lv.${(userArr[0].level)}
当前经验：[[${(pokemonCal.exp_bar(userArr[0].level, userArr[0].exp))}]]
当前精灵球数：${(userArr[0].captureTimes)}个
你还没有杂交出满意的宝可梦
请输入【${(config.杂交指令别名)}】
你的背包：
【1】${(pokemonCal.pokemonlist(bagspace[0]))}【2】${(pokemonCal.pokemonlist(bagspace[1]))}
【3】${(pokemonCal.pokemonlist(bagspace[2]))}【4】${(pokemonCal.pokemonlist(bagspace[3]))}
【5】${(pokemonCal.pokemonlist(bagspace[4]))}【6】${(pokemonCal.pokemonlist(bagspace[5]))}
输入指令【技能背包】来查看已有的技能机`
          }
        } else {
          return `请先输入【${(config.签到指令别名)}】领取属于你的宝可梦和精灵球`
          //不存在数据
        }

      } else {
        //查看at用户信息
        const [platform, userId] = user.split(':')
        const userArr = await ctx.database.get('pokebattle', { id: userId })
        if (userArr.length != 0) {
          //存在数据
          if (userArr[0].monster_1 != '0') {
            return `${(h('at', { id: (session.userId) }))}
当前等级为lv.${(userArr[0].level)}
他的战斗宝可梦:【${(pokemonCal.pokemonlist(userArr[0].monster_1))}】
${pokemonCal.pokemomPic(userArr[0].monster_1, true)}
 `
          } else {
            return `${(h('at', { id: (session.userId) }))}
他当前等级为lv.${(userArr[0].level)}
他还没有杂交出满意的宝可梦`
          }
        } else {
          return `他还没有领取宝可梦和精灵球`
          //不存在数据
        }
      }
    })
  ctx.command('放生')
    .alias(config.放生指令别名)
    .action(async ({ session }) => {
      const userArr = await ctx.database.get('pokebattle', { id: session.userId })
      let bagspace: string[] = []
      if (userArr.length == 0) return `请先输入【${(config.签到指令别名)}】领取属于你的宝可梦和精灵球`
      for (let i = 0; i < 6; i++) {
        if (userArr[0].AllMonster[i] != 0) {
          bagspace.push(userArr[0].AllMonster[i])
        } else {
          bagspace.push("空精灵球")
        }
      }
      session.send(`${(h('at', { id: (session.userId) }))}
回复【编号】对背包中的宝可梦进行放生
你的背包：
【1】${(pokemonCal.pokemonlist(bagspace[0]))}【2】${(pokemonCal.pokemonlist(bagspace[1]))}
【3】${(pokemonCal.pokemonlist(bagspace[2]))}【4】${(pokemonCal.pokemonlist(bagspace[3]))}
【5】${(pokemonCal.pokemonlist(bagspace[4]))}【6】${(pokemonCal.pokemonlist(bagspace[5]))}
`)
      const choose = await session.prompt(20000)
      let RandomPoke = ''
      let getBall = 0
      if (!choose) return `${(h('at', { id: (session.userId) }))}你好像还在犹豫，有点舍不得他们`
      if (userArr[0].AllMonster[Number(choose) - 1]) {
        if (userArr[0].AllMonster.length === 1) return `${(h('at', { id: (session.userId) }))}你只剩一只宝可梦了，无法放生`
        // let discarded=userArr[0].AllMonster[Number(choose)-1]
        let discarded = userArr[0].AllMonster.splice(Number(choose) - 1, 1)
        let RandomBall = pokemonCal.mathRandomInt(0, 100)
        let expGet = pokemonCal.mathRandomInt(exptolv.exp_lv[userArr[0].level].exp * 0.05, exptolv.exp_lv[userArr[0].level].exp * 0.2)
        let expNew = pokemonCal.expCal(userArr[0].level, userArr[0].exp + expGet)[1]
        let goldGet=pokemonCal.mathRandomInt(100,500)
        let lvNew = pokemonCal.expCal(userArr[0].level, userArr[0].exp + expGet)[0]
        if (RandomBall > 50) {
          getBall = 1
          RandomPoke = `\n它好像有点舍不得你
并且送还给你一个精灵球
精灵球+1`
        }
        await ctx.database.set('pokebattle', { id: session.userId }, {
          captureTimes: { $add: [{ $: 'captureTimes' }, getBall] },
          AllMonster: userArr[0].AllMonster,
          level: lvNew,
          exp: expNew,
          power: pokemonCal.power(pokemonCal.pokeBase(userArr[0].monster_1), lvNew),
          gold:{ $add: [{ $: 'gold' }, goldGet] },
        })
        return `
        ${(h('at', { id: (session.userId) }))}你将
【${(pokemonCal.pokemonlist(discarded[0]))}】放生了
${pokemonCal.pokemomPic(discarded[0], false)}${(RandomPoke)}
经验+${expGet}
金币+${goldGet}
当前等级为lv.${lvNew}
当前经验：[[${(pokemonCal.exp_bar(lvNew, expNew))}]]
        `
      } else {
        return `你好像想放生一些了不得的东西`
      }

    })
  ctx.command('属性 <user:user>')
    .action(async ({ session }, user) => {
      let tar
      try {
        const [platform, userId] = user.split(':')
        tar = userId
      } catch { tar = session.userId }
      const userArr = await ctx.database.get('pokebattle', { id: tar })
      ctx.database.set('pokebattle', { id: session.userId }, {
        base: pokemonCal.pokeBase(userArr[0].monster_1),
        power: pokemonCal.power(pokemonCal.pokeBase(userArr[0].monster_1), userArr[0].level)
      })
      const chart = ctx.echarts.createChart(300, 300, pokemonCal.pokemonproperties(pokemonCal.pokeBase(userArr[0].monster_1), pokemonCal.pokemonlist(userArr[0].monster_1)))
      const buffer = (await chart).canvas.toBuffer("image/png")
        ; (await chart).dispose()
      let toDo = ''
      if (userArr[0].base[0]) {
        toDo = `【能力值】：
生命:${(pokemonCal.power(pokemonCal.pokeBase(userArr[0].monster_1), userArr[0].level)[0])}  攻击:${(pokemonCal.power(pokemonCal.pokeBase(userArr[0].monster_1), userArr[0].level)[1])}  防御:${(pokemonCal.power(pokemonCal.pokeBase(userArr[0].monster_1), userArr[0].level)[2])}  特殊:${(pokemonCal.power(pokemonCal.pokeBase(userArr[0].monster_1), userArr[0].level)[3])}  速度:${(pokemonCal.power(pokemonCal.pokeBase(userArr[0].monster_1), userArr[0].level)[4])}
        `}
      return `${(h.image(buffer, "image/png"))}
${(toDo)}
      `

    })
  ctx.command('对战 <user:user>')
    .action(async ({ session }, user) => {
      try {
        let losergold=''
        let [platform, userId] = user.split(':')  
        const userArr = await ctx.database.get('pokebattle', { id: session.userId })
        const tarArr = await ctx.database.get('pokebattle', {id:userId })
        if (userArr[0].length == 0) return `请先输入【${(config.签到指令别名)}】领取属于你的宝可梦和精灵球`
        if (!userArr[0].skill) return `你们的宝可梦必须全部装备上对战技能哦~`
        if (userArr[0].gold < 500||tarArr[0].battleTimes==0) { return (`你的金币不足或者对方的宝可梦还在恢复，无法对战`) }else if(session.userId==user){return (`你不能对自己发动对战`)}else if(tarArr[0].length == 0||tarArr[0].monster_1=='0'){return (`对方还没有宝可梦`)}
        session.send(`你支付了500金币，对${(h('at', { id: (userId) }))}发动了宝可梦对战`)
        await ctx.database.set('pokebattle', { id: userId }, {
          battleTimes: { $subtract: [{ $: 'battleTimes' }, 1] },
        })
        if(tarArr[0].battleTimes==1){
          setTimeout(async () => {
            await ctx.database.set('pokebattle', { id: userId }, {
              battleTimes:3,
            })
          },Time.hour*2)
          session.send(`${h('at', { id: (userId) })}你的宝可梦已经筋疲力尽，2小时后恢复完毕`)
        }
        let battle=pokemonCal.pokebattle(userArr, tarArr)
        let battlelog =battle[0]
        let winner = battle[1]
        let loser =battle[2]
        await ctx.database.set('pokebattle', { id: session.userId }, {
          gold: { $subtract: [{ $: 'gold' }, 500] },
        })
        await ctx.database.set('pokebattle', { id: winner }, {
          coin: { $add: [{ $: 'coin' }, 1] },
        })
        if (loser == session.userId) {
          losergold = `${(h('at', { id: (session.userId) }))}你输了，金币返还150`
          await ctx.database.set('pokebattle', { id: session.userId }, {
            gold: { $add: [{ $: 'gold' }, 150] },
          })
        }
        session.send(`${battlelog}\n${losergold}`)
        return `获胜者是${h('at', { id: (winner) })}
获得技能扭蛋机代币+1
`} catch(e) { logger.info(e) }
    })
  ctx.command('解压图包文件')
    .action(async () => {
      const zipFilePath = './downloads/bucket1-h3vhg7cvhz443zb1ga819kmpzabblyzv/image.zip'
      const targetFolder = './'
      if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder);
      }
      let extractedCount = 0;
      await yauzl.open(zipFilePath, { lazyEntries: true }, (err, zipfile) => {
        if (err) throw err;
        zipfile.readEntry();
        zipfile.on('entry', (entry) => {
          const entryPath = path.join(targetFolder, entry.fileName);
          if (/\/$/.test(entry.fileName)) {
            fs.mkdirSync(entryPath, { recursive: true });
            zipfile.readEntry();
          } else {
            zipfile.openReadStream(entry, (err, readStream) => {
              if (err) throw err;
              readStream.on('end', () => {
                extractedCount++;
                logger.info(`已解压${extractedCount} / 22965 。`)
                zipfile.readEntry();
              });
              const writeStream = fs.createWriteStream(entryPath);
              readStream.pipe(writeStream);
            });
          }
        });
      });
    })
  ctx.command('技能扭蛋机')
    .action(async ({ session }) => {
      const userArr = await ctx.database.get('pokebattle', { id: session.userId })
      if (userArr.length == 0) return `${h('at', { id: (session.userId) })}请先输入【${(config.签到指令别名)}】领取属于你的宝可梦和精灵球`
      if (userArr[0].coin < 1) { return (`你的代币不足，要积极参与对战哦~`) }
      await ctx.database.set('pokebattle', { id: session.userId }, {
        coin: { $subtract: [{ $: 'coin' }, 1] },
      })
      let getskill = pokemonCal.pokemonskill(userArr[0].level)
      if(userArr[0].skill==0){
        userArr[0].skillbag.push(String(getskill))
        await ctx.database.set('pokebattle', { id: session.userId }, {
          skill: getskill,
          skillbag: userArr[0].skillbag
        })
        return `${h('at', { id: (session.userId) })}✨✨✨恭喜你获得了【${(skillMachine.skill[getskill].skill)}】技能✨✨✨`
      }else if(userArr[0].skillbag.includes(String(getskill))){
        await ctx.database.set('pokebattle', { id: session.userId }, {
          gold: { $add: [{ $: 'gold' }, 350] },
        })
        return `${h('at', { id: (session.userId) })}你已经有【${(skillMachine.skill[getskill].skill)}】技能了，转换为🪙金币+350`
      }else{
        userArr[0].skillbag.push(String(getskill))
        await ctx.database.set('pokebattle', { id: session.userId }, {
          skillbag: userArr[0].skillbag
        })
        return `${h('at', { id: (session.userId) })}✨✨✨恭喜你获得了【${(skillMachine.skill[getskill].skill)}】技能✨✨✨\n已放入技能背包`
      }

    })
    ctx.command('技能背包')
    .action(async ({ session }) => {
      const userArr = await ctx.database.get('pokebattle', { id: session.userId })
      if (userArr.length == 0) return `请先输入【${(config.签到指令别名)}】领取属于你的宝可梦和精灵球`
      return pokemonCal.skillbag(userArr[0].skillbag)?`${h('at', { id: (session.userId) })}你的技能背包：\n${pokemonCal.skillbag(userArr[0].skillbag)}`:`你还没有技能哦\n签到领取代币到【技能扭蛋机】抽取技能吧`
    })
    ctx.command('装备技能 <skill>')
    .action(async ({ session },skill) => {
      if (!skill) return `请输入技能名称 例如：【装备技能 大爆炸】`
      const userArr = await ctx.database.get('pokebattle', { id: session.userId })
      if (userArr.length == 0) return `${h('at', { id: (session.userId) })}请先输入【${(config.签到指令别名)}】领取属于你的宝可梦和精灵球`
      if(!userArr[0].skillbag.includes(String(pokemonCal.findskillId(skill))))return `${h('at', { id: (session.userId) })}你还没有这个技能哦`
      console.info(userArr[0].skillbag.includes(String(pokemonCal.findskillId(skill))))
      await ctx.database.set('pokebattle', { id: session.userId }, {
        skill: Number(pokemonCal.findskillId(skill)),
      })
      return `${h('at', { id: (session.userId) })}成功装备了【${skill}】技能`
    })
    ctx.command('查询技能 <skill>')
    .action(async ({ session },skill) => {
      const userArr = await ctx.database.get('pokebattle', { id: session.userId })
      try{if(!userArr[0].skillbag[2]&&!skill) return `你的技能还太少，有什么先用着吧，或者输入你想查询的技能名字 例如：【查询技能 大爆炸】`
      if (!skill) return (pokemonCal.skillinfo(userArr[0].skillbag))
      return `${skill}的技能信息：\n威力：${skillMachine.skill[Number(pokemonCal.findskillId(skill))].Dam}\n描述：${skillMachine.skill[Number(pokemonCal.findskillId(skill))].descript}`}catch(e){
   logger.info(e)
        return `输入错误，没有这个技能哦`
      }
    })
      
}
