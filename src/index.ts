import { Schema, h, $, Context } from 'koishi'
import pokemonCal from './utils/pokemon'
import { button, catchbutton, findItem, getPic, getRandomName, is12to14, moveToFirst, toUrl, urlbutton } from './utils/mothed'
import { pathToFileURL } from 'url'
import { resolve } from 'path'
import * as fs from 'fs'
import * as path from 'path'
import os from 'os'
import pidusage from 'pidusage'
import { exec } from 'child_process'
import * as lapTwo from './lap/index'

import { qu, an, imglk, expToLv, expBase, skillMachine } from './utils/data'

export const pokemonUrl='https://pokeimg.maimai.icu/i'



export const name = 'pokemon-battle'

export const inject = {
  required: ['database', 'downloads', 'canvas']
}

export const usage = `
<a class="el-button" target="_blank" href="http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=bFdYGdp562abZWTmbHPAEw52aQq_fWqu&authKey=TPF8n37idd8paD0YfQJhpEax9PKe9sRPUk5GToIMr6%2Fs5I3v4ycBmT4k%2FGch0z8S&noverify=0&group_code=709239435"><b>加入宝可梦融合研究基金会  </b></a>

[宝可梦融合研究基金会群号：709239435](http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=bFdYGdp562abZWTmbHPAEw52aQq_fWqu&authKey=TPF8n37idd8paD0YfQJhpEax9PKe9sRPUk5GToIMr6%2Fs5I3v4ycBmT4k%2FGch0z8S&noverify=0&group_code=709239435)


### 1.10
- 更新官方bot MD消息(不能使用本地服务)
- 修复canvas和puppeteer冲突

### 2.1
- 恭喜麦麦获奖！！！！
- 加急学会了mysql，并且对战兼容了mysql数据库
`

export interface Config {
  指令使用日志: boolean
  QQ官方使用MD: boolean
  签到指令别名: string
  捕捉指令别名: string
  杂交指令别名: string
  查看信息指令别名: string
  放生指令别名: string
  签到获得个数: number
  战斗详情是否渲染图片: boolean
  是否开启友链: boolean
  精灵球定价: number
  训练师定价: number
  扭蛋币定价: number
  改名卡定价: number
  canvas图片品质: number
  对战图片品质: number
  对战cd: number
  对战次数: number
  捕捉等待时间: number
  MDid: string
  文字MDid: string
  key1: string
  key2: string
  key3: string
  key4: string
  key5: string
  key6: string
  key7: string
  key8: string
  key9: string
  key10: string
  bot邀请链接: string
  时区: number
}

export const Config = Schema.intersect([
  Schema.object({
    签到指令别名: Schema.string().default('签到'),
    捕捉指令别名: Schema.string().default('捕捉宝可梦'),
    杂交指令别名: Schema.string().default('杂交宝可梦'),
    查看信息指令别名: Schema.string().default('查看信息'),
    放生指令别名: Schema.string().default('放生'),
    指令使用日志: Schema.boolean().default(false).description('是否输出指令使用日志'),
    是否开启友链: Schema.boolean().default(false).description('是否开启友链'),
    战斗详情是否渲染图片: Schema.boolean().default(false).description('渲染图片需要加载puppeteer服务'),
    canvas图片品质: Schema.number().role('slider')
      .min(0).max(1).step(0.1).default(1),
    对战图片品质: Schema.number().role('slider')
      .min(0).max(100).step(1).default(100),
    时区: Schema.number().default(8).description('中国时区为8，其他时区请自行调整'),
  }),
  Schema.object({
    签到获得个数: Schema.number().default(2),
    精灵球定价: Schema.number().default(800),
    训练师定价: Schema.number().default(10000),
    扭蛋币定价: Schema.number().default(1500),
    改名卡定价: Schema.number().default(60000),
    对战cd: Schema.number().default(10).description('单位：秒'),
    对战次数: Schema.number().default(15),
    捕捉等待时间: Schema.number().default(20000).description('单位：毫秒'),
  }).description('数值设置'),
  Schema.object({
    QQ官方使用MD: Schema.boolean().default(false),
  }).description('Markdown设置,需要server.temp服务'),
  Schema.union([
    Schema.object({
      QQ官方使用MD: Schema.const(true).required(),
      MDid: Schema.string().description('MD模板id'),
      文字MDid: Schema.string().description('文字MD模板id(可留空)'),
      key1: Schema.string().default('tittle').description('标题'),
      key2: Schema.string().default('imgsize').description('图片大小'),
      key3: Schema.string().default('img_url').description('图片路径'),
      key4: Schema.string().default('text1').description('宝可梦选项1'),
      key5: Schema.string().default('text2').description('宝可梦选项2'),
      key6: Schema.string().default('text3').description('宝可梦选项3'),
      key7: Schema.string().default('text4').description('宝可梦选项4'),
      key8: Schema.string().default('text5').description('宝可梦选项5'),
      key9: Schema.string().default('text6').description('宝可梦选项6'),
      key10: Schema.string().default('text7').description('宝可梦选项7'),
      bot邀请链接: Schema.string().default('https://qun.qq.com/qunpro/robot/qunshare?robot_uin=3889000472&robot_appid=102072441&biz_type=0'),
    }),
    Schema.object({}),
  ]),

])

declare module 'koishi' {
  interface Tables {
    pokebattle: Pokebattle
  }
}



export interface Pokebattle {
  id: string
  name: string
  date: number
  captureTimes: number
  battleTimes: number
  battleToTrainer: number
  level: number
  exp: number
  monster_1: string
  battlename: string
  AllMonster: string[]
  ultramonster: string[]
  base: string[]
  power: string[]
  skill: number
  coin: number
  gold: number
  changeName: number
  skillbag: string[]
  trainer: string[]
  trainerNum: number
  trainerName: string[]
  battlecd: Date
  relex: Date
}

export let testcanvas: string
export let logger: any
export let shop: any[]
export let config: Config

export async function apply(ctx, conf: Config) {



  config = conf

  if (config.指令使用日志) {
    ctx.on('command/before-execute', ({ session, command }) => {
      const freeCpu = os.freemem() / os.totalmem();
      const usedCpu = 1 - freeCpu;
      pidusage(process.pid, (err, stats) => {
        console.log(`${session.userId}使用了${command.name}  当前内存占用${(usedCpu * 100).toFixed(2)}% cpu占用${(stats.cpu).toFixed(2)}%`)
      })
    })
  }

  logger = ctx.logger('pokemon')

  try {
    testcanvas = 'file://'
    await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, './assets/img/components', 'spawn.png')}`)
    logger.info('当前使用的是puppeteer插件提供canvas服务')
  } catch (e) {
    testcanvas = ''
    logger.info('当前使用的是canvas插件提供canvas服务')
  }

  if (!fs.existsSync('./zpix.ttf')) {
    const fontTask = ctx.downloads.nereid('zpixfont', [
      'npm://pix-ziti',
      'npm://pix-ziti?registry=https://registry.npmmirror.com', ,
    ], 'bucket2')
    fontTask.promise.then((path1) => {
      const sourceFilePath = path1 + '/zpix.ttf'
      const targetFilePath = path.join(__dirname, '..', '..', '..', path.basename(sourceFilePath))

      fs.rename(sourceFilePath, targetFilePath, function (err) {
        if (err) {
          logger.info(sourceFilePath);
        } else {
          logger.info('移动文件成功');
        }
      })
    })
  }


  ctx.database.extend('pokebattle', {
    id: 'string',
    name: 'string',
    date: 'integer',
    captureTimes: 'integer',
    battleTimes: 'integer',
    battleToTrainer: 'integer',
    level: 'unsigned',
    exp: 'unsigned',
    monster_1: 'string',
    battlename: 'string',
    AllMonster: 'list',
    ultramonster: 'list',
    base: 'list',
    power: 'list',
    skill: 'integer',
    coin: 'integer',
    gold: 'integer',
    changeName: {
      type: 'integer',
      initial: 1,
      nullable: false,
    },
    skillbag: 'list',
    trainer: 'list',
    trainerNum: 'integer',
    trainerName: 'list',
    battlecd: 'timestamp',
    relex: 'timestamp'
  }, {
    primary: "id"
  })

  shop = [
    {
      id: 'captureTimes',
      name: '精灵球',
      price: config.精灵球定价,
    },
    {
      id: 'coin',
      name: '扭蛋代币',
      price: config.扭蛋币定价,
    },
    {
      id: 'trainerNum',
      name: '人物盲盒',
      price: config.训练师定价
    },
    {
      id: 'changeName',
      name: '改名卡',
      price: config.改名卡定价
    }
  ]


  const banID = ['150.150', '151.151', '144.144', '145.145', '146.146']

  ctx.plugin(lapTwo)

  ctx.command('宝可梦').subcommand('解压图包文件', { authority: 4 })
    .action(async ({ session }) => {
      const system = os.platform()
      let cmd:string  = ''
      let cp:string = 'copy'
      exec(`mkdir koishi启动不了将里面的备份取出覆盖`, (error) => {
        if (error) {
          console.error(`创建目录失败: ${error}`);
          return;
        }})
      if(system!=='win32'){
        cmd = 'sudo '
        cp = 'cp'

    }
      exec(`${cp} koishi.yml 如果koishi启动不了将名字改为koishi.yml覆盖`, (error) => {
        if (error) {
          console.error(`复制文件失败: ${error}`);
          return;
        }
        console.log(`文件已成功复制`);
      });
      exec(cmd+'tar -xvf ./downloads/bucket1-mnlaakixr8b0v4yngpq865qr144y63jx/image.tar', async (error, stdout, stderr) => {
        if (error) {
          return
        }
        await session.send(`解压已完成`)
      })
    })


  ctx.command("宝可梦", '宝可梦玩法帮助').action(async ({ session }) => {

    const { platform } = session
    const imgurl = resolve(__dirname, `./assets/img/components/help.jpg`)
    if (platform == 'qq' && config.QQ官方使用MD) {
      try {
        await session.bot.internal.sendMessage(session.channelId, {
          content: "111",
          msg_type: 2,
          markdown: {
            custom_template_id: config.MDid,
            params: [
              {
                key: config.key1,
                values: ["宝可梦玩法"]
              },
              {
                key: config.key2,
                values: ["[img#480px #270px]"]
              },
              {
                key: config.key3,
                values: [await toUrl(ctx, `file://${imgurl}`)]
              },
            ]
          },
          keyboard: {
            content: {
              "rows": [
                {
                  "buttons": [
                    button(2, "🖊签到", "/签到", session.userId, "1"),
                    button(2, "💳查看", "/查看信息", session.userId, "2"),
                    button(2, "🔖帮助", "/宝可梦", session.userId, "3"),
                  ]
                },
                {
                  "buttons": [
                    button(2, "⚔️对战", "/对战", session.userId, "4"),
                    button(2, "♂杂交", "/杂交宝可梦", session.userId, "5"),
                    button(2, "👐放生", "/放生", session.userId, "6"),
                  ]
                },
                {
                  "buttons": [
                    button(2, "📷捕捉", "/捕捉宝可梦", session.userId, "7"),
                    button(2, "📕属性", "/属性", session.userId, "8"),
                    button(2, "🛒商店", "/购买", session.userId, "9"),
                  ]
                },
                {
                  "buttons": [
                    urlbutton(2, "📜反馈", "http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=CEqeK9q1yilezUrsSX9L3kO0hK5Wpi_7&authKey=SBuSSQtld6nFctvq9d4Xm1lW%2B0C3QuFZ6FLhCJk8ELCbtOqiR4drHcrbfRLVmcvz&noverify=0&group_code=836655539", session.userId, "10"),
                    urlbutton(2, "📎邀请BOT", config.bot邀请链接, session.userId, "11"),
                    button(2, "宝可问答", "/宝可问答", session.userId, "12"),
                  ]
                },
                config.是否开启友链?{"buttons":[button(2, "🔗友情链接，里面有好van的哦~", "/friendlink", session.userId, "13")]}:null,
              ]
            },
          },
          msg_id: session.messageId,
          timestamp: session.timestamp,
        })
      } catch (e) {
        return `网络繁忙，再试一次`
      }
      return
    }
    return h.image(pathToFileURL(imgurl).href)
  })


  ctx.command('宝可梦').subcommand('宝可梦签到', '每日的宝可梦签到')
    .alias(config.签到指令别名)
    .usage(`/${config.签到指令别名}`)
    .action(async ({ session }) => {
      const { platform } = session
      const userArr = await ctx.database.get('pokebattle', { id: session.userId })
      let dateToday = Math.round(Number(new Date()) / 1000)
      if (userArr.length != 0) {
        let dateNow = Math.floor((userArr[0].date + 28800) / 86400)
        if (dateNow == Math.floor((dateToday + 28800) / 86400)) {
          await session.send('今天你已经签到过了哟~快去捕捉属于你的宝可梦吧')
        } else {
          if (userArr[0].monster_1 == 'null') {
            await ctx.database.set('pokebattle', { id: session.userId }, {
              monster_1: '0'
            })
            if (!userArr[0].skill) {
              await ctx.database.set('pokebattle', { id: session.userId }, {
                skill: 0
              })
            }
          }
          let expGet: number
          if (userArr[0].monster_1 == '0') {
            //更改
            expGet = Math.floor(userArr[0].level * Number(expBase.exp[Number(userArr[0].AllMonster[0].split('.')[0]) - 1].expbase) / 7)
          } else {
            expGet = userArr[0].level > 99 ? 0 : Math.floor(userArr[0].level * Number(expBase.exp[(Number(userArr[0].monster_1.split('.')[0]) > Number(userArr[0].monster_1.split('.')[1]) ? Number(userArr[0].monster_1.split('.')[1]) : Number(userArr[0].monster_1.split('.')[0])) - 1].expbase) / 7 * (Math.random() + 0.5))
          }
          let expNew = pokemonCal.expCal(userArr[0].level, userArr[0].exp + expGet)[1]
          let lvNew = pokemonCal.expCal(userArr[0].level, userArr[0].exp + expGet)[0]
          let ToDo: string
          if (userArr[0].monster_1 !== '0') {
            ToDo = `当前战斗宝可梦：${(pokemonCal.pokemonlist(userArr[0].monster_1))}
            ${(pokemonCal.pokemomPic(userArr[0].monster_1, true))}
            `
          } else {
            ToDo = '快去杂交出属于你的宝可梦吧'
          }
          const playerName = userArr[0].name ? userArr[0].name : session.username.length < 6 ? session.username : session.username.slice(0, 4)
          try {
            await ctx.database.set('pokebattle', { id: session.userId }, {
              name: playerName,
              captureTimes: { $add: [{ $: 'captureTimes' }, config.签到获得个数] },
              battleTimes: 3,
              battleToTrainer: config.对战次数,
              date: dateToday,
              level: lvNew,
              exp: expNew,
              battlename: pokemonCal.pokemonlist(userArr[0].monster_1),
              base: pokemonCal.pokeBase(userArr[0].monster_1),
              power: pokemonCal.power(pokemonCal.pokeBase(userArr[0].monster_1), lvNew),
              coin: { $add: [{ $: 'coin' }, config.签到获得个数] },
              gold: { $add: [{ $: 'gold' }, 3000] },
              trainer: userArr[0].trainer[0] ? userArr[0].trainer : ['0'],
              trainerName: userArr[0].trainerName[0] ? userArr[0].trainerName : ['默认训练师']
            })
          } catch (e) { return `请再试一次` }
          //图片服务
          let image = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, './assets/img/components', '签到.png')}`)
          let pokemonimg = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, `./assets/img/basepokemon/0.png`)}`)
          let pokemonimg1 = []
          for (let i = 0; i < userArr[0].AllMonster.length; i++) {
            pokemonimg1[i] = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, `./assets/img/basepokemon/${userArr[0].AllMonster[i].split('.')[0]}.png`)}`)
          }
          let ultramonsterimg = []
          for (let i = 0; i < 5; i++) {
            ultramonsterimg[i] = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, `./assets/img/basepokemon/${banID[i].split('.')[0]}.png`)}`)
          }
          if (userArr[0].monster_1 !== '0') pokemonimg = await ctx.canvas.loadImage(`${pokemonUrl}/fusion/${userArr[0].monster_1.split('.')[0]}/${userArr[0].monster_1}.png`)
          let trainers = '0'
          if (userArr[0].trainer[0] !== '0') { trainers = userArr[0].trainer[0] }
          let trainerimg = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, './assets/img/trainer/' + trainers + '.png')}`)
          let expbar = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, './assets/img/components', 'expbar.png')}`)
          let overlay = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, './assets/img/components', 'overlay_exp.png')}`)
          let time = Date.now()
          let date = new Date(time).toLocaleDateString()
          let img
          const dataUrl = await ctx.canvas.render(512, 763, async (ctx) => {
            ctx.drawImage(image, 0, 0, 512, 763)
            ctx.drawImage(pokemonimg, 21, 500, 160, 160)
            ctx.drawImage(trainerimg, 21, 56, 160, 160)
            ctx.font = 'normal 30px zpix'
            ctx.fillText(userArr[0].gold + 3000, 290, 100)
            ctx.fillText(playerName + `签到成功`, 49, 270)
            ctx.font = 'normal 20px zpix'
            ctx.fillText(`零花钱：`, 254, 65)
            ctx.font = 'normal 20px zpix'
            ctx.fillText(`获得金币+3000`, 49, 300)
            ctx.fillText(`当前可用精灵球:${userArr[0].captureTimes + config.签到获得个数}`, 256, 300)
            ctx.fillText(`获得精灵球+${config.签到获得个数}`, 49, 325)
            ctx.fillText(`获得经验+${expGet}`, 256, 325)
            ctx.font = 'normal 15px zpix'
            ctx.fillStyle = 'red';
            ctx.fillText(`输入【/宝可梦】查看详细指令`, 135, 350)
            ctx.fillStyle = 'black';
            ctx.fillText(`hp:${pokemonCal.power(pokemonCal.pokeBase(userArr[0].monster_1), lvNew)[0]} att:${pokemonCal.power(pokemonCal.pokeBase(userArr[0].monster_1), lvNew)[1]} def:${pokemonCal.power(pokemonCal.pokeBase(userArr[0].monster_1), lvNew)[2]}`, 30, 715)
            ctx.fillText(`   spec:${pokemonCal.power(pokemonCal.pokeBase(userArr[0].monster_1), lvNew)[3]}  spe:${pokemonCal.power(pokemonCal.pokeBase(userArr[0].monster_1), lvNew)[4]}`, 30, 740)
            ctx.fillText(date, 308, 173)
            ctx.fillText('Lv.' + lvNew.toString(), 328, 198)
            ctx.drawImage(overlay, 318, 203, 160 * expNew / expToLv.exp_lv[lvNew].exp, 8)
            ctx.drawImage(expbar, 300, 200, 180, 20)
            ctx.font = 'bold 20px zpix'
            for (let i = 0; i < 5; i++) {
              ctx.globalAlpha = 0.5
              if (userArr[0].ultramonster.includes(banID[i])) { ctx.globalAlpha = 1 }
              ctx.drawImage(ultramonsterimg[i], 227, 459 + 60 * i)
            }
            ctx.globalAlpha = 1
            for (let i = 0; i < userArr[0].AllMonster.length; i++) {

              ctx.drawImage(pokemonimg1[i], 277, 439 + 50 * i, 40, 40)
              ctx.fillText('【' + pokemonCal.pokemonlist(userArr[0].AllMonster[i]) + '】', 322, 467 + 50 * i)
            }
            img = await ctx.canvas.toDataURL('image/jpeg', config.canvas图片品质)
          })
          if (platform == 'qq' && config.QQ官方使用MD) {
            try {
              await session.bot.internal.sendMessage(session.guildId, {
                content: "111",
                msg_type: 2,
                markdown: {
                  custom_template_id: config.MDid,
                  params: [
                    {
                      key: config.key1,
                      values: [`<@${session.userId}>签到成功`]
                    },
                    {
                      key: config.key2,
                      values: ["[img#512px #763px]"]
                    },
                    {
                      key: config.key3,
                      values: [await toUrl(ctx, img)]
                    },
                    {
                      key: config.key4,
                      values: [`每人都有一次初始的改名机会~输入【/改名】即可改名`]
                    },
                  ]
                },
                keyboard: {
                  content: {
                    "rows": [
                      {
                        "buttons": [
                          button(2, "🖊签到", "/签到", session.userId, "1"),
                          button(2, "💳查看", "/查看信息", session.userId, "2"),
                          button(2, "🔖帮助", "/宝可梦", session.userId, "3"),
                        ]
                      },
                      {
                        "buttons": [
                          button(2, "⚔️对战", "/对战", session.userId, "4"),
                          button(2, "♂杂交", "/杂交宝可梦", session.userId, "5"),
                          button(2, "👐放生", "/放生", session.userId, "6"),
                        ]
                      },
                      {
                        "buttons": [
                          button(2, "📷捕捉", "/捕捉宝可梦", session.userId, "7"),
                          button(2, "📕属性", "/属性", session.userId, "8"),
                          button(2, "🛒商店", "/购买", session.userId, "9"),
                        ]
                      },
                      {
                        "buttons": [
                          urlbutton(2, "📜反馈", "http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=CEqeK9q1yilezUrsSX9L3kO0hK5Wpi_7&authKey=SBuSSQtld6nFctvq9d4Xm1lW%2B0C3QuFZ6FLhCJk8ELCbtOqiR4drHcrbfRLVmcvz&noverify=0&group_code=836655539", session.userId, "10"),
                          urlbutton(2, "📎邀请BOT", config.bot邀请链接, session.userId, "11"),
                          button(2, "宝可问答", "/宝可问答", session.userId, "12"),
                        ]
                      },
                      config.是否开启友链?{"buttons":[button(2, "🔗友情链接，里面有好van的哦~", "/friendlink", session.userId, "13")]}:null,
                    ]
                  },
                },
                msg_id: session.messageId,
                timestamp: session.timestamp,
              })
            } catch (e) {
              return `网络繁忙，再试一次`
            }
          } else { return h.image(img) }
          //图片服务
        }
      } else {
        let img: string
        let firstMonster_: string
        let firstMonster: string
        do {
          firstMonster_ = pokemonCal.mathRandomInt(1, 151).toString()
        
        firstMonster = firstMonster_ + '.' + firstMonster_
      } while (banID.includes(firstMonster))
        await ctx.database.create('pokebattle', {
          id: session.userId,
          name: session.username.length < 6 ? session.username : session.username.slice(0, 4),
          date: Math.round(Number(new Date()) / 1000),
          captureTimes: config.签到获得个数,
          battleTimes: 3,
          battleToTrainer: config.对战次数,
          level: 5,
          exp: 0,
          monster_1: '0',
          AllMonster: [firstMonster,],
          coin: config.签到获得个数,
          gold: 3000,
          trainer: ['0'],
          trainerName: ['默认训练师']
        })
        //图片服务
        const bg_img = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, './assets/img/components', 'spawn.png')}`)
        const pokemonimg = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, `./assets/img/basepokemon/${firstMonster_}.png`)}`)
        const replyImg = await ctx.canvas.render(512, 384, async (ctx) => {
          ctx.drawImage(bg_img, 0, 0, 512, 384)
          ctx.drawImage(pokemonimg, 99, 285, 64, 64)
          ctx.font = 'normal 16px zpix'
          ctx.fillText(`你好，${session.username.length < 6 ? session.username : session.username.slice(0, 4)}`, 31, 38)
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(`精灵球+${(config.签到获得个数)}`, 375, 235)
          ctx.fillText(`初始资金:3000`, 375, 260)
          ctx.fillText(`扭蛋机币+${(config.签到获得个数)}`, 375, 285)
          ctx.fillText(`你的第一只宝可梦【${pokemonCal.pokemonlist(firstMonster)}】`, 375, 310)
          ctx.fillStyle = 'red';
          ctx.fillText(`输入【/宝可梦】获取详细指令`, 256, 351)
          ctx.fillStyle = 'black';
          img = await ctx.canvas.toDataURL('image/jpeg', config.canvas图片品质)
        })
        //图片服务
        if (platform == 'qq' && config.QQ官方使用MD) {
          try {
            await session.bot.internal.sendMessage(session.guildId, {
              content: "111",
              msg_type: 2,
              markdown: {
                custom_template_id: config.MDid,
                params: [
                  {
                    key: config.key1,
                    values: [`<@${session.userId}>注册成功`]
                  },
                  {
                    key: config.key2,
                    values: ["[img#512px #384px]"]
                  },
                  {
                    key: config.key3,
                    values: [await toUrl(ctx, img)]
                  },
                ]
              },
              keyboard: {
                content: {
                  "rows": [
                    {
                      "buttons": [
                        button(2, "🖊签到", "/签到", session.userId, "1"),
                        button(2, "💳查看", "/查看信息", session.userId, "2"),
                        button(2, "🔖帮助", "/宝可梦", session.userId, "3"),
                      ]
                    },
                    {
                      "buttons": [
                        button(2, "⚔️对战", "/对战", session.userId, "4"),
                        button(2, "♂杂交", "/杂交宝可梦", session.userId, "5"),
                        button(2, "👐放生", "/放生", session.userId, "6"),
                      ]
                    },
                    {
                      "buttons": [
                        button(2, "📷捕捉", "/捕捉宝可梦", session.userId, "7"),
                        button(2, "📕属性", "/属性", session.userId, "8"),
                        button(2, "🛒商店", "/购买", session.userId, "9"),
                      ]
                    },
                    {
                      "buttons": [
                        urlbutton(2, "📜反馈", "http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=CEqeK9q1yilezUrsSX9L3kO0hK5Wpi_7&authKey=SBuSSQtld6nFctvq9d4Xm1lW%2B0C3QuFZ6FLhCJk8ELCbtOqiR4drHcrbfRLVmcvz&noverify=0&group_code=836655539", session.userId, "10"),
                        urlbutton(2, "📎邀请BOT", config.bot邀请链接, session.userId, "11"),
                        button(2, "宝可问答", "/宝可问答", session.userId, "12"),
                      ]
                    },
                    config.是否开启友链?{"buttons":[button(2, "🔗友情链接，里面有好van的哦~", "/friendlink", session.userId, "13")]}:null,
                  ]
                },
              },
              msg_id: session.messageId,
              timestamp: session.timestamp,
            })
          } catch (e) {
            return `网络繁忙，再试一次`
          }
        } else { return h.image(img) }

      }
    })


  ctx.command('宝可梦').subcommand('捕捉宝可梦', '随机遇到3个宝可梦')
    .alias(config.捕捉指令别名)
    .usage(`/${config.捕捉指令别名}`)
    .action(async ({ session }) => {
      const { platform } = session
      const userArr = await ctx.database.get('pokebattle', { id: session.userId })
      let usedCoords = []
      if (userArr.length == 0) {
        return `请先输入【${(config.签到指令别名)}】领取属于你的宝可梦和精灵球`
      } else {
        let pokeM = []
        let grassMonster = []
        let black = ['', '', '']
        if (userArr[0].captureTimes > 0) {

          for (let i = 0; i < 3; i++) {
            grassMonster[i] = pokemonCal.mathRandomInt(1, userArr[0].lapTwo?251:151)
            pokeM[i] = grassMonster[i] + '.' + grassMonster[i]
            for (let j = 0; j < pokemonCal.pokemonlist(pokeM[i]).length; j++) {
              black[i] = black[i] + ('⬛')

            }
          }
          //创建图片
          let poke_img = []
          let dataUrl
          let bg_img = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, './assets/img/components', 'catchBG.png')}`)
          poke_img[0] = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, './assets/img/basepokemon', grassMonster[0] + '.png')}`)
          poke_img[1] = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, './assets/img/basepokemon', grassMonster[1] + '.png')}`)
          poke_img[2] = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, './assets/img/basepokemon', grassMonster[2] + '.png')}`)
          let grassImg = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, './assets/img/components', 'Grass.png')}`)
          let catchpockmon_img = await ctx.canvas.render(512, 512, async (ctx) => {
            //载入背景
            ctx.drawImage(bg_img, 0, 0, 512, 512)
            // 随机生成草堆的坐标并绘制草堆
            for (let i = 0; i < 15; i++) {
              let x, y;
              do {
                x = Math.floor(Math.random() * (512 - 64));
                y = Math.floor(Math.random() * (512 - 64));
              } while (usedCoords.some(([usedX, usedY]) => Math.abs(usedX - x) < 64 && Math.abs(usedY - y) < 64));
              usedCoords.push([x, y]);
              ctx.drawImage(grassImg, x, y, 64, 64);
            }
            // 随机生成宝可梦的坐标并绘制宝可梦
            for (let i = 0; i < 3; i++) {
              let x, y;
              do {
                x = Math.floor(Math.random() * (512 - 64));
                y = Math.floor(Math.random() * (512 - 64));
              } while (usedCoords.some(([usedX, usedY]) => Math.abs(usedX - x) < 64 && Math.abs(usedY - y) < 64));
              usedCoords.push([x, y]);
              ctx.drawImage(poke_img[i], x, y, 64, 64);
            }
            dataUrl = await ctx.canvas.toDataURL('image/jpeg', config.canvas图片品质)

          })
          //创建图片
          if (platform == 'qq' && config.QQ官方使用MD) {
            try {
              await session.bot.internal.sendMessage(session.guildId, {
                content: "111",
                msg_type: 2,
                markdown: {
                  custom_template_id: config.MDid,
                  params: [
                    {
                      key: config.key1,
                      values: [`<@${session.userId}>捕捉宝可梦`]
                    },
                    {
                      key: config.key2,
                      values: ["[img#300px #300px]"]
                    },
                    {
                      key: config.key3,
                      values: [await toUrl(ctx, dataUrl)]
                    },
                    {
                      key: config.key4,
                      values: [`tip:"⬛"的个数，表示的是宝可梦名字的长度`]
                    },
                    {
                      key: config.key5,
                      values: [`例如：大岩蛇就是⬛⬛⬛`]
                    },
                    {
                      key: config.key6,
                      values: [`传说中的宝可梦是不会放进背包的哦`]
                    },
                    {
                      key: config.key7,
                      values: [`你当前的精灵球：${userArr[0].captureTimes}`]
                    },
                    {
                      key: config.key10,
                      values: [`如果实在不知道选哪个可以点这里👉[/随机捕捉]\t(mqqapi://aio/inlinecmd?command=${Math.floor(Math.random() * 3) + 1}&reply=false&enter=true)👈`]
                    },
                  ]
                },
                keyboard: {
                  content: catchbutton(black[0], black[1], black[2], session.userId),
                },
                msg_id: session.messageId,
                timestamp: session.timestamp,
              })
            } catch (e) {
              return `网络繁忙，再试一次`
            }
          } else {
            await session.send(`${h.image(dataUrl)}
\n
官方机器人输入【@Bot 序号】
请向其中一个投掷精灵球
【1】${black[0]}
【2】${black[1]}
【3】${black[2]}
请在10秒内输入序号\n
${(h('at', { id: (session.userId) }))}
  `)
          }
          const chooseMonster = await session.prompt(config.捕捉等待时间)
          let poke
          let reply: string
          await ctx.database.set('pokebattle', { id: session.userId }, {//扣除精灵球
            captureTimes: { $subtract: [{ $: 'captureTimes' }, 1] },
          })
          if (!chooseMonster) {//未输入
            return `哎呀！宝可梦们都逃跑了！
精灵球-1`
          }
          switch (chooseMonster) {//选择宝可梦
            case '1':
              poke = pokeM[0]
              reply = `
【1】✨【${(pokemonCal.pokemonlist(poke))}】✨\r【2】⬛（${(pokemonCal.pokemonlist(pokeM[1]))}）⬛\r【3】⬛（${(pokemonCal.pokemonlist(pokeM[2]))}）⬛\r恭喜${(h('at', { id: (session.userId) }))}获得${(pokemonCal.pokemonlist(poke))}
`
              break;
            case '2':
              poke = pokeM[1]
              reply = `
【1】⬛（${(pokemonCal.pokemonlist(pokeM[0]))}）⬛\r【2】✨【${(pokemonCal.pokemonlist(poke))}】✨\r【3】⬛（${(pokemonCal.pokemonlist(pokeM[2]))}）⬛\r恭喜${(h('at', { id: (session.userId) }))}获得${(pokemonCal.pokemonlist(poke))}`
              break;
            case '3':
              poke = pokeM[2]
              reply = `
【1】⬛（${(pokemonCal.pokemonlist(pokeM[0]))}）⬛\r【2】⬛（${(pokemonCal.pokemonlist(pokeM[1]))}）⬛\r【3】✨【${(pokemonCal.pokemonlist(poke))}】✨\r恭喜${(h('at', { id: (session.userId) }))}获得${(pokemonCal.pokemonlist(poke))}`
              break;
            default:
              return '球丢歪啦！重新捕捉吧~\n精灵球-1"'
          }
          if (banID.includes(poke)) {
            // 检查是否是传说宝可梦
            const hasPoke = userArr[0].ultramonster?.includes(poke)
            if (hasPoke) {
              // 用户已经拥有这个传说宝可梦，增加捕获次数
              await ctx.database.set('pokebattle', { id: session.userId }, {
                captureTimes: { $add: [{ $: 'captureTimes' }, 1] },
              })

              return `${h('at', { id: session.userId })}你已经拥有一只了，${pokemonCal.pokemonlist(poke)}挣脱束缚逃走了
但是他把精灵球还你了`
            } else {
              // 用户未拥有这个传说宝可梦，添加到用户的传说宝可梦列表中
              userArr[0].ultramonster.push(poke)
              await ctx.database.set('pokebattle', { id: session.userId }, {
                ultramonster: userArr[0].ultramonster,
              })
              // 将 ultramonster 转换为 Set
              let ultramonsterSet = new Set(userArr[0].ultramonster)
              // 添加新的宝可梦
              ultramonsterSet.add(poke)
              // 将 Set 转换回数组
              userArr[0].ultramonster = Array.from(ultramonsterSet)
              // 更新数据库
              await ctx.database.set('pokebattle', { id: session.userId }, {
                ultramonster: userArr[0].ultramonster,
              })
              return `${h('at', { id: session.userId })}恭喜你获得了传说宝可梦【${pokemonCal.pokemonlist(poke)}】`
            }
          }
          if (platform == 'qq' && config.QQ官方使用MD) {
            try {
              await session.bot.internal.sendMessage(session.channelId, {
                content: "111",
                msg_type: 2,
                markdown: {
                  custom_template_id: config.MDid,
                  params: [
                    {
                      key: config.key1,
                      values: [`<@${session.userId}>获得了新的宝可梦`]
                    },
                    {
                      key: config.key2,
                      values: ["[img#512px #512px]"]
                    },
                    {
                      key: config.key3,
                      values: [await toUrl(ctx, `${(pokemonCal.pokemomPic(poke, false)).toString().match(/src="([^"]*)"/)[1]}`)]
                    },
                    {
                      key: config.key4,
                      values: ["tips: “大灾变” 事件后的宝可梦好像并不能进行战斗了"]
                    }
                  ]
                },
                keyboard: {
                  content: {
                    "rows": [
                      { "buttons": [button(2, `继续捕捉宝可梦`, "/捕捉宝可梦", session.userId, "1")] },
                    ]
                  },
                },
                msg_id: session.messageId,
                timestamp: session.timestamp,
                msg_seq: Math.floor(Math.random() * 1000000),
              })
            } catch (e) {
              return `网络繁忙，再试一次`
            }
          } else {
            await session.send(`${pokemonCal.pokemomPic(poke, false)}
\u200b${reply}精灵球-1`
            )
          }


          if (userArr[0].AllMonster.length < 6) {//背包空间
            let five: string = ''
            if (userArr[0].AllMonster.length === 5) five = `\n你的背包已经满了,你可以通过【${(config.放生指令别名)}】指令，放生宝可梦`//背包即满

            if (poke == pokeM[0] || poke == pokeM[1] || poke == pokeM[2]) {//原生宝可梦判定
              userArr[0].AllMonster.push(poke)
              await ctx.database.set('pokebattle', { id: session.userId }, {
                AllMonster: userArr[0].AllMonster,
              })
            }
            return five
          } else if (chooseMonster == '1' || chooseMonster == '2' || chooseMonster == '3') {//背包满
            //图片服务
            let pokemonimg1: string[] = []
            let dataUrl: string
            const bgImg = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, './assets/img/components', 'bag.png')}`)
            for (let i = 0; i < userArr[0].AllMonster.length; i++) {
              pokemonimg1[i] = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, `./assets/img/basepokemon/${userArr[0].AllMonster[i].split('.')[0]}.png`)}`)
            }
            await ctx.canvas.render(512, 381, async ctx => {
              ctx.drawImage(bgImg, 0, 0, 512, 381)
              ctx.font = 'bold 20px zpix'
              for (let i = 0; i < pokemonimg1.length; i++) {
                if (i % 2 == 0) {
                  ctx.drawImage(pokemonimg1[i], 28, 60 + 90 * (i / 2), 64, 64)
                  ctx.fillText('【' + (i + 1) + '】' + pokemonCal.pokemonlist(userArr[0].AllMonster[i]), 82, 100 + 90 * (i / 2))
                } else {
                  ctx.drawImage(pokemonimg1[i], 276, 72 + 90 * ((i - 1) / 2), 64, 64)
                  ctx.fillText('【' + (i + 1) + '】' + pokemonCal.pokemonlist(userArr[0].AllMonster[i]), 330, 112 + 90 * ((i - 1) / 2))
                }
              }
              dataUrl = await ctx.canvas.toDataURL('image/jpeg', config.canvas图片品质)
            })
            //图片服务
            if (platform == 'qq' && config.QQ官方使用MD) {
              try {
                await session.bot.internal.sendMessage(session.guildId, {
                  content: "111",
                  msg_type: 2,
                  markdown: {
                    custom_template_id: config.MDid,
                    params: [
                      {
                        key: config.key1,
                        values: [`<@${session.userId}>的宝可梦背包已经满了`]
                      },
                      {
                        key: config.key2,
                        values: ["[img#512px #381px]"]
                      },
                      {
                        key: config.key3,
                        values: [await toUrl(ctx, dataUrl)]
                      },
                      {
                        key: config.key4,
                        values: [`<@${session.userId}>请你选择需要替换的宝可梦`]
                      },
                      {
                        key: config.key5,
                        values: ["ps:替换宝可梦不会获得经验哦"]
                      },
                    ]
                  },
                  keyboard: {
                    content: {
                      "rows": [
                        { "buttons": [button(0, pokemonCal.pokemonlist(userArr[0].AllMonster[0]), "1", session.userId, "1"), button(0, pokemonCal.pokemonlist(userArr[0].AllMonster[1]), "2", session.userId, "2")] },
                        { "buttons": [button(0, pokemonCal.pokemonlist(userArr[0].AllMonster[2]), "3", session.userId, "3"), button(0, pokemonCal.pokemonlist(userArr[0].AllMonster[3]), "4", session.userId, "4")] },
                        { "buttons": [button(0, pokemonCal.pokemonlist(userArr[0].AllMonster[4]), "5", session.userId, "5"), button(0, pokemonCal.pokemonlist(userArr[0].AllMonster[5]), "6", session.userId, "6")] },
                        { "buttons": [button(0, '放生', "/放生", session.userId, "7")] },
                      ]
                    },
                  },
                  msg_id: session.messageId,
                  timestamp: session.timestamp,
                  msg_seq: Math.floor(Math.random() * 1000000),
                })
              } catch (e) {
                return `网络繁忙，再试一次`
              }
            } else {
              await session.send(`\n
你的背包中已经有6只原生宝可梦啦
请选择一只替换
【1】${(pokemonCal.pokemonlist(userArr[0].AllMonster[0]))}
【2】${(pokemonCal.pokemonlist(userArr[0].AllMonster[1]))}
【3】${(pokemonCal.pokemonlist(userArr[0].AllMonster[2]))}
【4】${(pokemonCal.pokemonlist(userArr[0].AllMonster[3]))}
【5】${(pokemonCal.pokemonlist(userArr[0].AllMonster[4]))}
【6】${(pokemonCal.pokemonlist(userArr[0].AllMonster[5]))}
${(h('at', { id: (session.userId) }))}
          `)
            }
            const BagNum = await session.prompt(25000)

            if (!BagNum) {
              return '你犹豫太久啦！宝可梦从你手中逃走咯~'
            }
            if (BagNum >= '1' && BagNum <= '6') {
              const index = parseInt(BagNum) - 1;
              userArr[0].AllMonster[index] = poke;
              await ctx.database.set('pokebattle', { id: session.userId }, {
                AllMonster: userArr[0].AllMonster,
              });
              reply = `你小心翼翼的把 ${(pokemonCal.pokemonlist(poke))} 放在了背包第${BagNum}格`;
            } else {
              reply = `你好像对新的宝可梦不太满意，把 ${(pokemonCal.pokemonlist(poke))} 放生了`;
            }
            await session.send(reply)
          }
        } else {
          let dateToday = Math.round(Number(new Date()) / 1000)
          let dateNow = Math.floor(userArr[0].date / 86400 - 28800)
          if (dateNow == Math.floor(dateToday / 86400 - 28800)) {
            return `\n
今日次数已用完
请明天通过【${(config.签到指令别名)}】获取精灵球
${(h('at', { id: (session.userId) }))}
`
          } else {
            return `\n
你的精灵球已经用完啦
请通过【${(config.签到指令别名)}】获取新的精灵球
${(h('at', { id: (session.userId) }))}
          `
          }
        }
      }
    })


  ctx.command('宝可梦').subcommand('杂交宝可梦', '选择两只宝可梦杂交')
    .alias(config.杂交指令别名)
    .usage(`/${config.杂交指令别名}`)
    .action(async ({ session }) => {
      const { platform } = session
      const userArr = await ctx.database.get('pokebattle', { id: session.userId })
      let dan
      let dataUrl: string
      if (userArr.length != 0) {
        //图片服务
        let pokemonimg1: string[] = []
        const bgImg = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, './assets/img/components', 'bag.png')}`)
        for (let i = 0; i < userArr[0].AllMonster.length; i++) {
          pokemonimg1[i] = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, `./assets/img/basepokemon/${userArr[0].AllMonster[i].split('.')[0]}.png`)}`)
        }
        const image = await ctx.canvas.render(512, 381, async ctx => {
          ctx.drawImage(bgImg, 0, 0, 512, 381)
          ctx.font = 'bold 20px zpix'
          for (let i = 0; i < pokemonimg1.length; i++) {
            if (i % 2 == 0) {
              ctx.drawImage(pokemonimg1[i], 28, 60 + 90 * (i / 2), 64, 64)
              ctx.fillText('【' + (i + 1) + '】' + pokemonCal.pokemonlist(userArr[0].AllMonster[i]), 82, 100 + 90 * (i / 2))
            } else {
              ctx.drawImage(pokemonimg1[i], 276, 72 + 90 * ((i - 1) / 2), 64, 64)
              ctx.fillText('【' + (i + 1) + '】' + pokemonCal.pokemonlist(userArr[0].AllMonster[i]), 330, 112 + 90 * ((i - 1) / 2))
            }
          }
          dataUrl = await ctx.canvas.toDataURL('image/jpeg', config.canvas图片品质)
        })
        //图片服务
        if (platform == 'qq' && config.QQ官方使用MD) {
          try {
            await session.bot.internal.sendMessage(session.guildId, {
              content: "111",
              msg_type: 2,
              markdown: {
                custom_template_id: config.MDid,
                params: [
                  {
                    key: config.key1,
                    values: [`请<@${session.userId}>选择两个宝可梦`]
                  },
                  {
                    key: config.key2,
                    values: ["[img#512px #381px]"]
                  },
                  {
                    key: config.key3,
                    values: [await toUrl(ctx, dataUrl)]
                  },
                  {
                    key: config.key5,
                    values: [`请求第三方失败属于正常情况`]
                  },
                  {
                    key: config.key8,
                    values: [`不需要理会`]
                  },
                  {
                    key: config.key10,
                    values: [`如果无法使用按钮可以\r点击👉[这里]\t(mqqapi://aio/inlinecmd?command=&reply=true&enter=false)👈后\r输入@麦麦子MaiBot 编号 编号，注意编号之间有空格，发送即可`]
                  },
                ]
              },
              keyboard: {
                content: {
                  "rows": [
                    { "buttons": [button(0, pokemonCal.pokemonlist(userArr[0].AllMonster[0]), `1`, session.userId, '1'), button(0, pokemonCal.pokemonlist(userArr[0].AllMonster[1]), `2`, session.userId, '2')] },
                    { "buttons": [button(0, pokemonCal.pokemonlist(userArr[0].AllMonster[2]), `3`, session.userId, '3'), button(0, pokemonCal.pokemonlist(userArr[0].AllMonster[3]), `4`, session.userId, '4')] },
                    { "buttons": [button(0, pokemonCal.pokemonlist(userArr[0].AllMonster[4]), `5`, session.userId, '5'), button(0, pokemonCal.pokemonlist(userArr[0].AllMonster[5]), `6`, session.userId, '6')] },

                  ]
                },
              },
              msg_id: session.messageId,
              timestamp: session.timestamp,
              msg_seq: Math.floor(Math.random() * 10000)
            })
          } catch (e) {
            return `网络繁忙，再试一次`
          }
        } else {
          await session.send(`\n${image}
回复【编号】 【编号】进行杂交
官方机器人输入
@Bot【编号】 【编号】
`)
        }
        let zajiao = await session.prompt(30000)
        const bagNumber = ['1', '2', '3', '4', '5', '6']
        if (zajiao) {
          if (bagNumber.includes(zajiao) && zajiao.length == 1) {
            const zajiao1 = zajiao
            session.send(`请点击第二个宝可梦`)
            const zajiao2 = await session.prompt(30000)
            if (!zajiao2) {
              return '你犹豫太久啦！'
            }
            zajiao = zajiao1 + ' ' + zajiao2
          }
          let comm = zajiao.split(' ')
          let pokeM = userArr[0].AllMonster[Number(comm[0]) - 1]
          let pokeW = userArr[0].AllMonster[Number(comm[1]) - 1]
          dan = pokemonCal.pokemonzajiao(pokeM, pokeW)
          if (dan == 0 || dan[0] == 0) {
            if (platform == 'qq' && config.QQ官方使用MD) {
              await session.bot.internal.sendMessage(session.guildId, {
                content: "111",
                msg_type: 2,
                keyboard: {
                  content: {
                    "rows": [
                      { "buttons": [button(2, "输入错误点击按钮重新杂交", "/杂交宝可梦", session.userId, "1")] },
                    ]
                  },
                },
                msg_id: session.messageId,
                timestamp: session.timestamp,
                msg_seq: Math.floor(Math.random() * 1000000),
              })
              return
            }
            //处理杂交错误
            return '输入错误'
          } else {
            let dataUrl: string
            if (userArr[0].monster_1 != '0') {
              //图片服务
              let img_fuse = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, './assets/img/components/fuse.png')}`)
              let img_F = await ctx.canvas.loadImage(`${pokemonUrl}/fusion/${pokeM.split('.')[0]}/${pokeM.split('.')[0]}.png`)
              let img_M = await ctx.canvas.loadImage(`${pokemonUrl}/fusion/${pokeW.split('.')[0]}/${pokeW.split('.')[0]}.png`)
              let img_S = await ctx.canvas.loadImage(`${pokemonUrl}/fusion/${dan[1].split('.')[0]}/${dan[1]}.png`)
              let img_C = await ctx.canvas.loadImage(`${pokemonUrl}/fusion/${userArr[0].monster_1.split('.')[0]}/${userArr[0].monster_1}.png`)
              let img_zj = await ctx.canvas.render(512, 768, async ctx => {
                ctx.drawImage(img_fuse, 0, 0, 512, 768)
                ctx.drawImage(img_F, 16, 78, 112, 112)
                ctx.font = 'normal 15px zpix'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillText(pokemonCal.pokemonlist(pokeM) + '♂', 72, 206)
                ctx.fillText(pokemonCal.pokemonlist(pokeW) + '♀', 435, 206)
                ctx.fillText(`是否要将【${pokemonCal.pokemonlist(userArr[0].monster_1)}】替换为新生宝可梦【${dan[0]}】`, 256, 694)
                ctx.fillText(dan[0], 253, 326)
                ctx.drawImage(img_M, 379, 78, 112, 112)
                ctx.drawImage(img_S, 163, 114, 180, 180)
                ctx.drawImage(img_C, 294, 449, 180, 180)
                ctx.drawImage(img_S, 42, 449, 180, 180)
                dataUrl = await ctx.canvas.toDataURL('image/jpeg', config.canvas图片品质)
              })
              //图片服务
              //有战斗宝可梦
              if (platform == 'qq' && config.QQ官方使用MD) {
                try {
                  await session.bot.internal.sendMessage(session.guildId, {
                    content: "111",
                    msg_type: 2,
                    markdown: {
                      custom_template_id: config.MDid,
                      params: [
                        {
                          key: config.key1,
                          values: [`<@${session.userId}>是否放入战斗栏`]
                        },
                        {
                          key: config.key2,
                          values: ["[img#512px #768px]"]
                        },
                        {
                          key: config.key3,
                          values: [await toUrl(ctx, dataUrl)]
                        },
                        {
                          key: config.key4,
                          values: [`生命：${Math.sign(Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[0]) - userArr[0].power[0]) >= 0 ? '+' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[0]) - userArr[0].power[0]) : '' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[0]) - userArr[0].power[0])}`]
                        },
                        {
                          key: config.key5,
                          values: [`攻击：${Math.sign(Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[1]) - userArr[0].power[1]) >= 0 ? '+' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[1]) - userArr[0].power[1]) : '' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[1]) - userArr[0].power[1])}`]
                        },
                        {
                          key: config.key6,
                          values: [`防御：${Math.sign(Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[2]) - userArr[0].power[2]) >= 0 ? '+' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[2]) - userArr[0].power[2]) : '' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[2]) - userArr[0].power[2])}`]
                        },
                        {
                          key: config.key7,
                          values: [`特殊：${Math.sign(Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[3]) - userArr[0].power[3]) >= 0 ? '+' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[3]) - userArr[0].power[3]) : '' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[3]) - userArr[0].power[3])}`]
                        },
                        {
                          key: config.key8,
                          values: [`速度：${Math.sign(Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[4]) - userArr[0].power[4]) >= 0 ? '+' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[4]) - userArr[0].power[4]) : '' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[4]) - userArr[0].power[4])}`]
                        },
                      ]
                    },
                    keyboard: {
                      content: {
                        "rows": [
                          { "buttons": [button(0, "✅Yes", "Y", session.userId, "1"), button(0, "❌No", "N", session.userId, "2")] },
                        ]
                      },
                    },
                    msg_id: session.messageId,
                    timestamp: session.timestamp,
                    msg_seq: Math.floor(Math.random() * 10000)
                  })
                } catch (e) {
                  return `网络繁忙，再试一次`
                }
              } else {
                await session.send(`
${img_zj}
能力变化：
生命：${Math.sign(Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[0]) - userArr[0].power[0]) >= 0 ? '+' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[0]) - userArr[0].power[0]) : '' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[0]) - userArr[0].power[0])}
攻击：${Math.sign(Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[1]) - userArr[0].power[1]) >= 0 ? '+' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[1]) - userArr[0].power[1]) : '' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[1]) - userArr[0].power[1])}
防御：${Math.sign(Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[2]) - userArr[0].power[2]) >= 0 ? '+' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[2]) - userArr[0].power[2]) : '' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[2]) - userArr[0].power[2])}
特殊：${Math.sign(Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[3]) - userArr[0].power[3]) >= 0 ? '+' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[3]) - userArr[0].power[3]) : '' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[3]) - userArr[0].power[3])}
速度：${Math.sign(Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[4]) - userArr[0].power[4]) >= 0 ? '+' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[4]) - userArr[0].power[4]) : '' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[4]) - userArr[0].power[4])}
是否放入战斗栏（Y/N）
${(h('at', { id: (session.userId) }))}
`)
              }
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

                  return '\u200b\r成功将' + dan[0] + '放入战斗栏' + `\n能力值：
生命：${pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[0]}  ${Math.sign(Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[0]) - userArr[0].power[0]) >= 0 ? '+' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[0]) - userArr[0].power[0]) : '' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[0]) - userArr[0].power[0])}
攻击：${pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[1]}  ${Math.sign(Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[1]) - userArr[0].power[1]) >= 0 ? '+' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[1]) - userArr[0].power[1]) : '' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[1]) - userArr[0].power[1])}
防御：${pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[2]}  ${Math.sign(Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[2]) - userArr[0].power[2]) >= 0 ? '+' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[2]) - userArr[0].power[2]) : '' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[2]) - userArr[0].power[2])}
特殊：${pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[3]}  ${Math.sign(Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[3]) - userArr[0].power[3]) >= 0 ? '+' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[3]) - userArr[0].power[3]) : '' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[3]) - userArr[0].power[3])}
速度：${pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[4]}  ${Math.sign(Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[4]) - userArr[0].power[4]) >= 0 ? '+' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[4]) - userArr[0].power[4]) : '' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[4]) - userArr[0].power[4])}`
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

              return `恭喜你
成功杂交出优秀的后代宝可梦【${(dan[0])}】
${pokemonCal.pokemomPic(dan[1], true)}
成功将${(dan[0])}放入战斗栏
${(h('at', { id: (session.userId) }))}`
            }
          }
        } else {
          return `蛋好像已经臭了，无法孵化。`
        }

      } else {
        return `请先输入【${(config.签到指令别名)}】领取属于你的宝可梦和精灵球`
      }
    })


  ctx.command('宝可梦').subcommand('查看信息 <user:string>', '查看用户信息')
    .alias(config.查看信息指令别名)
    .usage(`/${config.查看信息指令别名} @user`)
    .action(async ({ session }, user) => {
      const { platform } = session
      let pokemonimg1 = []
      let pokemonimg = []
      let ultramonsterimg = []
      let userArr: string | any[]
      let userId: string
      let infoImgSelf
      const infoImgSelf_bg = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, './assets/img/components', 'trainercard.png')}`)
      let expbar = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, './assets/img/components', 'expbar.png')}`)
      let overlay = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, './assets/img/components', 'overlay_exp.png')}`)
      if (!user) {
        //查看自己信息
        userId = session.userId
        userArr = await ctx.database.get('pokebattle', { id: session.userId })
      } else {

        if (session.platform == 'red') {
          try { userId = session.elements[1].attrs.id } catch {
            return `请@一位训练师或者查看自己属性`
          }
        } else {
          try { userId = /[0-9A-Z]+/.exec(user)[0] } catch {
            return `请@一位训练师或者查看自己属性`
          }
        }
        userArr = await ctx.database.get('pokebattle', { id: userId })
      }
      if (userArr.length != 0) {
        let bagspace: string[] = []
        for (let i = 0; i < userArr[0].AllMonster.length; i++) {
          if (userArr[0].AllMonster[i] != 0) {
            bagspace.push(userArr[0].AllMonster[i])
          }
        }
        //存在数据
        //图片服务

        const infoId = userArr[0].id.length > 15 ? `${userArr[0].id.slice(0, 3)}...${userArr[0].id.slice(-3)}` : userArr[0].id
        const infoName = userArr[0].name ? userArr[0].name : session.username > 10 ? session.username : infoId
        for (let i = 0; i < userArr[0].AllMonster.length; i++) {
          pokemonimg1[i] = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, `./assets/img/basepokemon/${userArr[0].AllMonster[i].split('.')[0]}.png`)}`)
        }
        for (let i = 0; i < 5; i++) {
          ultramonsterimg[i] = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, `./assets/img/basepokemon/${banID[i].split('.')[0]}.png`)}`)
        }
        if (userArr[0].monster_1 !== '0') pokemonimg = await ctx.canvas.loadImage(`${pokemonUrl}/fusion/${userArr[0].monster_1.split('.')[0]}/${userArr[0].monster_1}.png`)
        let trainers = '0'
        if (userArr[0].trainer[0] !== '0') { trainers = userArr[0].trainer[0] }
        let trainerimg = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, `./assets/img/trainer/${trainers}.png`)}`)
        const infoImgSelfClassic = await ctx.canvas.render(485, 703, async ctx => {
          ctx.drawImage(infoImgSelf_bg, 0, 0, 485, 703)
          if (userArr[0].monster_1 !== '0') {
            ctx.globalAlpha = 0.5
            ctx.drawImage(pokemonimg, 316, 95, 135, 135)
            ctx.globalAlpha = 1
            ctx.drawImage(trainerimg, 342, 119, 112, 112)
          } else {
            ctx.drawImage(trainerimg, 316, 95, 135, 135)
          }
          for (let i = 0; i < ultramonsterimg.length; i++) {
            ctx.globalAlpha = 0.5
            if (userArr[0].ultramonster.includes(banID[i])) { ctx.globalAlpha = 1 }
            ctx.drawImage(ultramonsterimg[i], 134 + 48 * i, 300, 25, 25)
          }
          ctx.globalAlpha = 1
          ctx.font = 'bold 20px zpix'
          for (let i = 0; i < pokemonimg1.length; i++) {
            if (i % 2 == 0) {
              ctx.drawImage(pokemonimg1[i], 6, 360 + 90 * (i / 2), 64, 64)
              ctx.fillText('【' + pokemonCal.pokemonlist(userArr[0].AllMonster[i]) + '】', 76, 400 + 90 * (i / 2))
            } else {
              ctx.drawImage(pokemonimg1[i], 254, 373 + 90 * ((i - 1) / 2), 64, 64)
              ctx.fillText('【' + pokemonCal.pokemonlist(userArr[0].AllMonster[i]) + '】', 324, 413 + 90 * ((i - 1) / 2))
            }
          }
          ctx.font = 'normal 25px zpix'
          ctx.fillText('：' + infoId, 61, 72)
          ctx.fillText('：' + infoName, 86, 122)
          ctx.fillText('：' + userArr[0].gold, 137, 168)
          ctx.fillText('：' + userArr[0].captureTimes, 137, 218)
          ctx.fillText('：' + userArr[0].coin, 137, 263)
          ctx.fillText(userArr[0].level, 358, 73)
          ctx.font = 'bold 25px zpix'
          ctx.fillText('EXP>>                <<', 105, 650)
          ctx.drawImage(overlay, 181, 644, 160 * userArr[0].exp / expToLv.exp_lv[userArr[0].level].exp, 8)
          ctx.drawImage(expbar, 163, 641, 180, 20)
          infoImgSelf = await ctx.canvas.toDataURL('image/jpeg', config.canvas图片品质)
        })
        //图片服务
        if (platform == 'qq' && config.QQ官方使用MD) {
          try {
            await session.bot.internal.sendMessage(session.guildId, {
              content: "111",
              msg_type: 2,
              markdown: {
                custom_template_id: config.MDid,
                params: [
                  {
                    key: config.key1,
                    values: [`<@${userId}>的训练师卡片`]
                  },
                  {
                    key: config.key2,
                    values: ["[img#485px #703px]"]
                  },
                  {
                    key: config.key3,
                    values: [await toUrl(ctx, infoImgSelf)]
                  },
                ]
              },
              keyboard: {
                content: {
                  "rows": [
                    {
                      "buttons": [
                        button(2, "🖊签到", "/签到", session.userId, "1"),
                        button(2, "💳查看", "/查看信息", session.userId, "2"),
                        button(2, "🔖帮助", "/宝可梦", session.userId, "3"),
                      ]
                    },
                    {
                      "buttons": [
                        button(2, "⚔️对战", "/对战", session.userId, "4"),
                        button(2, "♂杂交", "/杂交宝可梦", session.userId, "5"),
                        button(2, "👐放生", "/放生", session.userId, "6"),
                      ]
                    },
                    {
                      "buttons": [
                        button(2, "📷捕捉", "/捕捉宝可梦", session.userId, "7"),
                        button(2, "📕属性", "/属性", session.userId, "8"),
                        button(2, "🛒商店", "/购买", session.userId, "9"),
                      ]
                    },
                    {
                      "buttons": [
                        urlbutton(2, "📜反馈", "http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=CEqeK9q1yilezUrsSX9L3kO0hK5Wpi_7&authKey=SBuSSQtld6nFctvq9d4Xm1lW%2B0C3QuFZ6FLhCJk8ELCbtOqiR4drHcrbfRLVmcvz&noverify=0&group_code=836655539", session.userId, "10"),
                        urlbutton(2, "📎邀请BOT", config.bot邀请链接, session.userId, "11"),
                        button(2, "宝可问答", "/宝可问答", session.userId, "12"),
                      ]
                    },
                    config.是否开启友链?{"buttons":[button(2, "🔗友情链接，里面有好van的哦~", "/friendlink", session.userId, "13")]}:null,
                  ]
                },
              },
              msg_id: session.messageId,
              timestamp: session.timestamp,
            })
          } catch (e) {
            return `网络繁忙，再试一次`
          }
        } else {
          return `${h.image(infoImgSelf)}
${(h('at', { id: (session.userId) }))}`
        }
      } else {
        return `请先输入【${(config.签到指令别名)}】领取属于你的宝可梦和精灵球`
        //不存在数据
      }
    })


  ctx.command('宝可梦').subcommand('放生', '放生宝可梦')
    .alias(config.放生指令别名)
    .usage(`/${config.放生指令别名}`)
    .action(async ({ session }) => {
      const { platform } = session
      const userArr = await ctx.database.get('pokebattle', { id: session.userId })

      if (userArr.length == 0) return `请先输入【${(config.签到指令别名)}】领取属于你的宝可梦和精灵球`
      //图片服务
      let pokemonimg1: string[] = []
      let dataUrl: string
      const bgImg = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, './assets/img/components', 'bag.png')}`)
      for (let i = 0; i < userArr[0].AllMonster.length; i++) {
        pokemonimg1[i] = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, `./assets/img/basepokemon/${userArr[0].AllMonster[i].split('.')[0]}.png`)}`)
      }
      const image = await ctx.canvas.render(512, 381, async ctx => {
        ctx.drawImage(bgImg, 0, 0, 512, 381)
        ctx.font = 'bold 20px zpix'
        for (let i = 0; i < pokemonimg1.length; i++) {
          if (i % 2 == 0) {
            ctx.drawImage(pokemonimg1[i], 28, 60 + 90 * (i / 2), 64, 64)
            ctx.fillText('【' + (i + 1) + '】' + pokemonCal.pokemonlist(userArr[0].AllMonster[i]), 82, 100 + 90 * (i / 2))
          } else {
            ctx.drawImage(pokemonimg1[i], 276, 72 + 90 * ((i - 1) / 2), 64, 64)
            ctx.fillText('【' + (i + 1) + '】' + pokemonCal.pokemonlist(userArr[0].AllMonster[i]), 330, 112 + 90 * ((i - 1) / 2))
          }
        }
        dataUrl = await ctx.canvas.toDataURL('image/jpeg', config.canvas图片品质)
      })
      //图片服务
      if (platform == 'qq' && config.QQ官方使用MD) {
        try {
          await session.bot.internal.sendMessage(session.guildId, {
            content: "111",
            msg_type: 2,
            markdown: {
              custom_template_id: config.MDid,
              params: [
                {
                  key: config.key1,
                  values: [`<@${session.userId}>选择放生宝可梦`]
                },
                {
                  key: config.key2,
                  values: ["[img#512px #381px]"]
                },
                {
                  key: config.key3,
                  values: [await toUrl(ctx, dataUrl)]
                },
              ]
            },
            keyboard: {
              content: {
                "rows": [
                  { "buttons": [button(0, pokemonCal.pokemonlist(userArr[0].AllMonster[0]), "1", session.userId, "1"), button(0, pokemonCal.pokemonlist(userArr[0].AllMonster[1]), "2", session.userId, "2")] },
                  { "buttons": [button(0, pokemonCal.pokemonlist(userArr[0].AllMonster[2]), "3", session.userId, "3"), button(0, pokemonCal.pokemonlist(userArr[0].AllMonster[3]), "4", session.userId, "4")] },
                  { "buttons": [button(0, pokemonCal.pokemonlist(userArr[0].AllMonster[4]), "5", session.userId, "5"), button(0, pokemonCal.pokemonlist(userArr[0].AllMonster[5]), "6", session.userId, "6")] },
                ]
              },
            },
            msg_id: session.messageId,
            timestamp: session.timestamp,
          })
        } catch (e) {
          return `网络繁忙，再试一次`
        }
      } else {
        await session.send(`\n${image}
回复【编号】进行放生
官方机器人请@Bot后输入序号
`)
      }
      const choose = await session.prompt(20000)
      let RandomPoke = ''
      let getBall = 0
      if (!choose) return `${(h('at', { id: (session.userId) }))}你好像还在犹豫，有点舍不得他们`
      if (userArr[0].AllMonster[Number(choose) - 1]) {
        if (userArr[0].AllMonster.length === 1) return `${(h('at', { id: (session.userId) }))}你只剩一只宝可梦了，无法放生`
        // let discarded=userArr[0].AllMonster[Number(choose)-1]
        let chsNum = Number(choose) - 1
        let baseexp = Number(expBase.exp[Number(String(userArr[0].AllMonster[chsNum]).split('.')[0]) - 1].expbase)
        let expGet = userArr[0].level > 99 ? 0 : Math.floor(userArr[0].level * baseexp / 7)
        let discarded = userArr[0].AllMonster.splice(Number(choose) - 1, 1)
        let expNew = pokemonCal.expCal(userArr[0].level, userArr[0].exp + expGet)[1]
        let lvNew = pokemonCal.expCal(userArr[0].level, userArr[0].exp + expGet)[0]
        await ctx.database.set('pokebattle', { id: session.userId }, {
          AllMonster: userArr[0].AllMonster,
          level: lvNew,
          exp: expNew,
          power: pokemonCal.power(pokemonCal.pokeBase(userArr[0].monster_1), lvNew),
        })
        return `
你将【${(pokemonCal.pokemonlist(discarded[0]))}】放生了
${pokemonCal.pokemomPic(discarded[0], false)}${(RandomPoke)}
经验+${expGet}
当前等级为lv.${lvNew}
当前经验：[[${(pokemonCal.exp_bar(lvNew, expNew))}]]
${(h('at', { id: (session.userId) }))}
        `
      } else {
        return `你好像想放生一些了不得的东西`
      }

    })


  ctx.command('宝可梦').subcommand('属性', '查看战斗宝可梦属性')
    .usage(`/属性`)
    .action(async ({ session },) => {
      const { platform } = session
      let tar = session.userId
      const userArr = await ctx.database.get('pokebattle', { id: tar })
      if (userArr.length == 0) return `请先输入【${(config.签到指令别名)}】领取属于你的宝可梦和精灵球`
      if (userArr[0].monster_1 == '0') return `你还没有宝可梦，快去【${(config.杂交指令别名)}】吧`
      const img = userArr[0].monster_1
      const fath = userArr[0].monster_1.split('.')[0] + '.' + userArr[0].monster_1.split('.')[0]
      const math = userArr[0].monster_1.split('.')[1] + '.' + userArr[0].monster_1.split('.')[1]
      let toDo = ''
      if (userArr[0].base[0]) {
        toDo = `\r能力值：\r生命：${pokemonCal.power(pokemonCal.pokeBase(userArr[0].monster_1), userArr[0].level)[0]}\r攻击：${pokemonCal.power(pokemonCal.pokeBase(userArr[0].monster_1), userArr[0].level)[1]}\r防御：${pokemonCal.power(pokemonCal.pokeBase(userArr[0].monster_1), userArr[0].level)[2]}\r特殊：${pokemonCal.power(pokemonCal.pokeBase(userArr[0].monster_1), userArr[0].level)[3]}\r速度：${pokemonCal.power(pokemonCal.pokeBase(userArr[0].monster_1), userArr[0].level)[4]}`
      }
      if (platform == 'qq' && config.QQ官方使用MD) {
        try {
          await session.bot.internal.sendMessage(session.guildId, {
            content: "111",
            msg_type: 2,
            markdown: {
              custom_template_id: config.MDid,
              params: [
                {
                  key: config.key1,
                  values: [`${userArr[0].battlename}的属性`]
                },
                {
                  key: config.key2,
                  values: ["[img#512 #512]"]
                },
                {
                  key: config.key3,
                  values: [`${pokemonUrl}/fusion/${img.split('.')[0]}/${img}.png`]
                },
                {
                  key: config.key4,
                  values: [`${(toDo)}`]
                },
                {
                  key: config.key10,
                  values: [`父本：${pokemonCal.pokemonlist(fath)}\r母本：${pokemonCal.pokemonlist(math)}`]
                }
              ]
            },
            keyboard: {
              content: {
                "rows": [
                  { "buttons": [button(0, "♂ 杂交宝可梦", "/杂交宝可梦", session.userId, "1"), button(0, "📷 捕捉宝可梦", "/捕捉宝可梦", session.userId, "2")] },
                  { "buttons": [button(0, "💳 查看信息", "/查看信息", session.userId, "3"), button(0, "⚔️ 对战", "/对战", session.userId, "4")] },
                ]
              },
            },
            msg_id: session.messageId,
            timestamp: session.timestamp,
            msg_seq: 5145
          })
        } catch (e) {
          return `网络繁忙，再试一次`
        }
        return
      }
      return `\u200b
============
${userArr[0].battlename}
${(toDo)}
============
tips:听说不同种的宝可梦杂交更有优势噢o(≧v≦)o~~
      `

    })


  ctx.command('宝可梦').subcommand('对战 <user>', '和其他训练师对战')
    .usage(`/对战 @user`)
    .action(async ({ session }, user) => {
      let battlenow = new Date().getTime()
      let battleSuccess = false
      let jli: string = ''
      try {
        let losergold = ''
        let userId: string
        let randomUser: { id: string }
        const userArr = await ctx.database.get('pokebattle', { id: session.userId })
        if (userArr.length == 0) return `请先输入【${(config.签到指令别名)}】领取属于你的宝可梦和精灵球`
        if (userArr[0].gold < 500) {
          return (`你的金币不足，无法对战`)
        }
        let maxLevelUser = await ctx.database
          .select('pokebattle')
          .where(row => $.ne(row.id, userArr[0].id))
          .where(row => $.or($.lte(row.relex, new Date(battlenow - 3600000)), $.gt(row.battleTimes, 0)))
          .where(row => $.ne(row.monster_1, '0'))
          .where(row => $.ne(row.skillbag, []))
          .where(row => $.ne(row.power, []))
          .orderBy(row => row.level)
          .execute()
        let maxLevel: number
        if (maxLevelUser.length == 0) return `你已经找不到合适的对手了`
        maxLevel = maxLevelUser[maxLevelUser.length - 1].level
        if (userArr[0].battlecd?.getTime() + config.对战cd * 1000 >= battlenow) {
          return `对战太过频繁，请${Math.ceil((userArr[0].battlecd?.getTime() + config.对战cd * 1000 - battlenow) / 1000)}秒后再试`
        }
        if (userArr[0].monster_1 == '0') return `你还没有宝可梦，快去【${(config.杂交指令别名)}】吧`
        if (userArr[0].skillbag.length == 0) return `快使用【技能扭蛋机】抽取一个技能并装备上`
        if (userArr[0].battleToTrainer <= 0) return `你的宝可梦还在恢复，无法对战，如果你今天还没签到，记得先签到再对战哦`
        if (!user) {
          let randomID = await ctx.database
            .select('pokebattle')
            .where(row => $.ne(row.id, userArr[0].id))
            .where(row => $.or($.lte(row.relex, new Date(battlenow - 3600000)), $.gt(row.battleTimes, 0)))
            .where(row => $.lte(row.level, Number(userArr[0].level) + 2))
            .where(row => $.gte(row.level, Number(userArr[0].level) - 2))
            .where(row => $.ne(row.monster_1, '0'))
            .where(row => $.ne(row.skillbag, []))
            .where(row => $.ne(row.power, []))
            .execute()
          let levelCount = Number(userArr[0].level)
          if (randomID.length == 0) {
            do {
              randomID = await ctx.database
                .select('pokebattle')
                .where(row => $.ne(row.id, userArr[0].id))
                .where(row => $.or($.lte(row.relex, new Date(battlenow - 3600000)), $.gt(row.battleTimes, 0)))
                .where(row => $.eq(row.level, levelCount))
                .where(row => $.ne(row.monster_1, '0'))
                .where(row => $.ne(row.skillbag, []))
                .where(row => $.ne(row.power, []))
                .execute()
              if (maxLevel < levelCount) {
                levelCount = levelCount - 1
              } else {
                levelCount = levelCount + 1
              }
            } while (randomID.length == 0)
          }
          do {
            randomUser = randomID[Math.floor(Math.random() * randomID.length)]
            userId = randomUser.id
          } while (userId == session.userId)
        }
        else {
          if (session.platform == 'red') {
            userId = session.elements[1].attrs.id
            battleSuccess = true
          } else {
            battleSuccess = false
            userId = /[0-9A-Z]+/.exec(user)[0]
            if (!/[0-9A-Z]+/.test(userId)) {
              return (`请@一位宝可梦训练师，例如对战 @麦Mai`);
            }
          }
        }
        let tarArr = await ctx.database.get('pokebattle', { id: userId })
        const getTimes = ((battlenow - new Date(tarArr[0]?.relex).getTime()) / 3600000) > 3 ? 3 : Math.floor((battlenow - new Date(tarArr[0]?.relex).getTime()) / 3600000)
        if (session.userId == userId) {
          return (`你不能对自己发动对战`)
        } else if (tarArr.length == 0 || tarArr[0].monster_1 == '0') {
          return (`对方还没有宝可梦`)
        }
        let battleTimes = (getTimes + tarArr[0].battleTimes - 1) >= 2 ? 2 : getTimes + tarArr[0].battleTimes - 1
        let relex = ((battlenow - new Date(tarArr[0]?.relex).getTime()) / 3600000) > 3 ? new Date(battlenow) : new Date((new Date(tarArr[0]?.relex)).getTime() + 3600000 * Math.floor(battlenow - new Date(tarArr[0]?.relex).getTime()) / 3600000)
        if (battleTimes < 0) {
          battleTimes = 0
          return `对方的宝可梦还在恢复，无法对战`
        }
        tarArr[0].battleTimes = battleTimes

        tarArr[0].base = pokemonCal.pokeBase(tarArr[0].monster_1)
        tarArr[0].power = pokemonCal.power(pokemonCal.pokeBase(tarArr[0].monster_1), tarArr[0].level)

        await ctx.database.set('pokebattle', { id: userId }, {
          battleTimes: battleTimes,
          base: tarArr[0].base,
          power: tarArr[0].power,
          relex: (new Date(relex.getTime() + (8 - config.时区) * 3600000)).toISOString().slice(0, 19).replace('T', ' ')
        })
        await ctx.database.set('pokebattle', { id: session.userId }, {
          battleToTrainer: { $subtract: [{ $: 'battleToTrainer' }, 1] },
          gold: { $subtract: [{ $: 'gold' }, 500] },
          battlecd: (new Date(battlenow + (8 - config.时区) * 3600000)).toISOString().slice(0, 19).replace('T', ' ')
        })
        await session.send(`你支付了500金币，请稍等，正在发动了宝可梦对战`)
        if (tarArr[0].battleTimes == 0) {
          let noTrainer = battleSuccess ? session.elements[1].attrs.name : tarArr[0].name || tarArr[0].battlename
          jli = `${noTrainer}已经筋疲力尽,每一小时恢复一次可对战次数`
        }
        let battle = pokemonCal.pokebattle(userArr, tarArr)
        let battlelog = battle[0]
        let winner = battle[1]
        let loser = battle[2]
        let getgold = pokemonCal.mathRandomInt(500, 1200)
        let loserArr = await ctx.database.get('pokebattle', { id: loser })
        let winnerArr = await ctx.database.get('pokebattle', { id: winner })
        let expGet = loserArr[0].level > 99 ? 0 : Math.floor(loserArr[0].level * Number(expBase.exp[(Number(winnerArr[0].monster_1.split('.')[0]) > Number(winnerArr[0].monster_1.split('.')[1]) ? Number(winnerArr[0].monster_1.split('.')[1]) : Number(winnerArr[0].monster_1.split('.')[0])) - 1].expbase) / 7)
        if (loserArr[0].level >= winnerArr[0].level + 6) {
          expGet = Math.floor(expGet * 0.2)
        }
        let expNew = pokemonCal.expCal(loserArr[0].level, loserArr[0].exp + expGet)[1]
        let lvNew = pokemonCal.expCal(loserArr[0].level, loserArr[0].exp + expGet)[0]
        losergold += `${loserArr[0].name || loserArr[0].battlename}输了\r等级:lv.${lvNew}\r经验：+${expGet}`
        await ctx.database.set('pokebattle', { id: winner }, {
          gold: { $add: [{ $: 'gold' }, getgold] },
        })
        await ctx.database.set('pokebattle', { id: loser }, {
          level: lvNew,
          exp: expNew,
          power: pokemonCal.power(pokemonCal.pokeBase(loserArr[0].monster_1), lvNew),
        })
        if (session.platform == 'qq' && config.QQ官方使用MD) {
          await session.bot.internal.sendMessage(session.guildId, {
            content: "111",
            msg_type: 2,
            markdown: {
              custom_template_id: config.MDid,
              params: [
                {
                  key: config.key1,
                  values: [`<@${session.userId}>对战结束`]
                },
                {
                  key: config.key2,
                  values: [`[img#712px #750px]`]
                },
                {
                  key: config.key3,
                  values: [await toUrl(ctx, await getPic(ctx, battlelog, userArr[0], tarArr[0]))]
                },
                {
                  key: config.key4,
                  values: [`获胜者:${winnerArr[0].name || winnerArr[0].battlename}`]
                },
                {
                  key: config.key5,
                  values: [`金币+${getgold}`]
                },
                {
                  key: config.key7,
                  values: [`${losergold}`]
                }
              ]
            },
            keyboard: {
              content: {
                "rows": [
                  { "buttons": [button(2, "♂ 杂交宝可梦", "/杂交宝可梦", session.userId, "1"), button(2, "📷 捕捉宝可梦", "/捕捉宝可梦", session.userId, "2")] },
                  { "buttons": [button(2, "💳 查看信息", "/查看信息", session.userId, "3"), button(2, "⚔️ 对战", "/对战", session.userId, "4")] },
                  { "buttons": [button(2, "🎯 对手信息", `/查看信息 ${userId}`, session.userId, "5"), button(2, "⚔️ 和他对战", `/对战 ${session.userId}`, session.userId, "6")] },
                ]
              },
            },
            msg_id: session.messageId,
            timestamp: session.timestamp,
            msg_seq: Math.floor(Math.random() * 10000)
          })
          return
        }
        return `${h.image(await getPic(ctx, battlelog, userArr[0], tarArr[0]))}
${h('at', { id: (session.userId) })}\u200b
战斗结束
====================
获胜者:${winnerArr[0].name || winnerArr[0].battlename}
金币+${getgold}
====================
${losergold}
\r[[${(pokemonCal.exp_bar(lvNew, expNew))}]]
${jli}`
      } catch (e) {
        logger.info(e)
        return `对战失败`
      }
    })


  ctx.command('宝可梦').subcommand('技能扭蛋机 [count:number]', '消耗扭蛋币，抽取技能')
    .usage(`/ 技能扭蛋机`)
    .action(async ({ session }, count) => {
      const userArr = await ctx.database.get('pokebattle', { id: session.userId })
      if (count > userArr[0].coin || count < 1) return `你的代币不足，要积极参与对战哦~`
      if (!count) {
        count = 1
      }
      count=Math.floor(count)
      if (userArr.length == 0) return `${h('at', { id: (session.userId) })}请先输入【${(config.签到指令别名)}】领取属于你的宝可梦和精灵球`
      if (userArr[0].coin < 1) { return (`你的代币不足，要积极参与对战哦~`) }
      await ctx.database.set('pokebattle', { id: session.userId }, {
        coin: { $subtract: [{ $: 'coin' }, count] },
      })
      let skilllist = []
      let getgold = 0
      for (let i = 0; i < count; i++) {
        let getskill = pokemonCal.pokemonskill(userArr[0].level)
        if (userArr[0].skill == 0) {
          userArr[0].skillbag.push(String(getskill))
          await ctx.database.set('pokebattle', { id: session.userId }, {
            skill: getskill,
          })
        } else if (userArr[0].skillbag.includes(String(getskill))) {
          getgold += 350
          skilllist.push(`${(skillMachine.skill[getskill].skill)}(重复)`)
          continue
        } else {
          userArr[0].skillbag.push(String(getskill))
        }
        skilllist.push(skillMachine.skill[getskill].skill)
      }
      await ctx.database.set('pokebattle', { id: session.userId }, {
        gold: { $add: [{ $: 'gold' }, getgold] },
        skillbag: userArr[0].skillbag
      })
      await session.send(`${h('at', { id: (session.userId) })}\u200b
你抽取了${count}个技能
重复技能将被换成金币
====================
${skilllist.join('\n')}
====================
金币+${getgold}
====================
指令末尾添加数字可以连续抽取技能
例如：【技能扭蛋机 10】`
      )
    })


  ctx.command('宝可梦').subcommand('技能背包', '查看所有获得的技能')
    .usage(`/技能背包`)
    .action(async ({ session }) => {
      const userArr = await ctx.database.get('pokebattle', { id: session.userId })
      if (userArr.length == 0) return `请先输入【${(config.签到指令别名)}】领取属于你的宝可梦和精灵球`
      return pokemonCal.skillbag(userArr[0].skillbag) ? `${h('at', { id: (session.userId) })}你的技能背包：\n${pokemonCal.skillbag(userArr[0].skillbag)}` : `你还没有技能哦\n签到领取代币到【技能扭蛋机】抽取技能吧`
    })


  ctx.command('宝可梦').subcommand('装备技能 <skill>', '装备技能')
    .usage(`/装备技能 <技能名字>`)
    .action(async ({ session }, skill) => {
      if (!skill) return `请输入技能名称 例如：【装备技能 大爆炸】`
      const userArr = await ctx.database.get('pokebattle', { id: session.userId })
      if (userArr.length == 0) return `${h('at', { id: (session.userId) })}请先输入【${(config.签到指令别名)}】领取属于你的宝可梦和精灵球`
      if (!userArr[0].skillbag.includes(String(pokemonCal.findskillId(skill)))) return `${h('at', { id: (session.userId) })}你还没有这个技能哦`

      await ctx.database.set('pokebattle', { id: session.userId }, {
        skill: Number(pokemonCal.findskillId(skill)),
      })
      return `${h('at', { id: (session.userId) })}成功装备了【${skill}】技能`
    })


  ctx.command('宝可梦').subcommand('查询技能 <skill>', '查询技能信息')
    .usage(`/查询技能 <技能名字>|<空>`)
    .action(async ({ session }, skill) => {
      const userArr = await ctx.database.get('pokebattle', { id: session.userId })
      try {
        if (!userArr[0].skillbag[2] && !skill) return `你的技能还太少，有什么先用着吧，或者输入你想查询的技能名字 例如：【查询技能 大爆炸】`
        if (!skill) return (pokemonCal.skillinfo(userArr[0].skillbag))
        return `${skill}的技能信息：\n威力：${skillMachine.skill[Number(pokemonCal.findskillId(skill))].Dam}\n描述：${skillMachine.skill[Number(pokemonCal.findskillId(skill))].descript}`
      } catch (e) {
        logger.info(e)
        return `输入错误，没有这个技能哦`
      }
    })


  ctx.command('宝可梦').subcommand('更换训练师 <name:string>', '更换训练师,留空则查看所有训练师')
    .usage(`/更换训练师 <训练师名字>|<空>`)
    .action(async ({ session }, name) => {
      const userArr = await ctx.database.get('pokebattle', { id: session.userId })
      if (userArr.length == 0) return `${h('at', { id: (session.userId) })}请先输入【${(config.签到指令别名)}】领取属于你的宝可梦和精灵球`
      if (userArr[0].trainer.length == 1) return `${h('at', { id: (session.userId) })}你只有一个训练师，无法更换`
      let nameList = `${userArr[0].trainerName.map((item: any, index: number) => `${index + 1}.${item}`).join('\n')}`
      if (!name) {
        await session.send(`${h('at', { id: (session.userId) })}请输入你想更换的训练师名字\n${nameList}`)
        const choose = await session.prompt(20000)
        if (!choose) return `${h('at', { id: (session.userId) })}你好像还在犹豫，一会再换吧`
        if (isNaN(Number(choose)) || Number(choose) > userArr[0].trainer.length) return `${h('at', { id: (session.userId) })}输入错误`
        let newTrainer = moveToFirst(userArr[0].trainer, userArr[0].trainer[Number(choose) - 1])
        let newTrainerName = moveToFirst(userArr[0].trainerName, userArr[0].trainerName[Number(choose) - 1])
        await ctx.database.set('pokebattle', { id: session.userId }, {
          trainer: newTrainer,
          trainerName: newTrainerName
        })
        return `${h('at', { id: (session.userId) })}成功更换了训练师${h.image(pathToFileURL(resolve(__dirname, './assets/img/trainer', newTrainer[0] + '.png')).href)}`
      }
      if (userArr[0].trainerName.includes(name)) {
        const distance = userArr[0].trainerName.indexOf(name)
        let newTrainer = moveToFirst(userArr[0].trainer, userArr[0].trainer[distance])
        let newTrainerName = moveToFirst(userArr[0].trainerName, name)
        await ctx.database.set('pokebattle', { id: session.userId }, {
          trainer: newTrainer,
          trainerName: newTrainerName
        })
        return `${h('at', { id: (session.userId) })}成功更换了训练师${h.image(pathToFileURL(resolve(__dirname, './assets/img/trainer', newTrainer[0] + '.png')).href)}`
      }

    })


  ctx.command('宝可梦').subcommand('盲盒', '开启盲盒，抽取训练师')
    .usage(`/盲盒`)
    .action(async ({ session }) => {
      const { platform } = session
      const userArr = await ctx.database.get('pokebattle', { id: session.userId })
      if (userArr.length == 0) return `${h('at', { id: (session.userId) })}请先输入【${(config.签到指令别名)}】领取属于你的宝可梦和精灵球`
      if (userArr[0].trainerNum < 1) return `${h('at', { id: (session.userId) })}你的盲盒不足，无法开启`
      let getTrainer = String(pokemonCal.mathRandomInt(0, 60))
      while (userArr[0].trainer.includes(getTrainer)) {
        getTrainer = String(pokemonCal.mathRandomInt(0, 60))
      }
      userArr[0].trainer.push(getTrainer)
      const trainerImg = h.image(pathToFileURL(resolve(__dirname, './assets/img/trainer', getTrainer + '.png')).href)
      if (platform == 'qq' && config.QQ官方使用MD) {
        await session.bot.internal.sendMessage(session.guildId, {
          content: "111",
          msg_type: 2,
          markdown: {
            custom_template_id: config.MDid,
            params: [
              {
                key: config.key1,
                values: [`<@${session.userId}>开启了盲盒`]
              },
              {
                key: config.key2,
                values: ["[img#128px #128px]"]
              },
              {
                key: config.key3,
                values: [await toUrl(ctx, pathToFileURL(resolve(__dirname, './assets/img/trainer', getTrainer + '.png')).href)]
              },
              {
                key: config.key4,
                values: [`恭喜你获得了新训练师`]
              },
            ]
          },
          keyboard: {
            content: {
              "rows": [
                { "buttons": [button(0, '点击输入新训练师名字', "", session.userId, "1", false)] },
              ]
            },
          },
          msg_id: session.messageId,
          timestamp: session.timestamp,
          msg_seq: Math.floor(Math.random() * 1000000),
        })
      } else {
        await session.send(`${trainerImg}
恭喜你获得了训练师
请输入新训练师的名字:________`)
      }
      const trainerName = await session.prompt(60000)
      if (!trainerName) {
        let randomName = getRandomName(3)
        let numr = userArr[0].trainerName.push(randomName)
        await ctx.database.set('pokebattle', { id: session.userId }, {
          trainerNum: { $subtract: [{ $: 'trainerNum' }, 1] },
          trainer: userArr[0].trainer,
          trainerName: userArr[0].trainerName,
        })
        return `你好像没有输入名字，训练师已经自动命名为【${randomName}】
输入【更换训练师】可以更换你的训练师`
      }
      userArr[0].trainerName.push(trainerName)
      await ctx.database.set('pokebattle', { id: session.userId }, {
        trainerNum: { $subtract: [{ $: 'trainerNum' }, 1] },
        trainer: userArr[0].trainer,
        trainerName: userArr[0].trainerName,
      })
      return `你的训练师已经命名为【${trainerName}】
输入【更换训练师】可以更换你的训练师`
    })


  ctx.command('宝可梦').subcommand('购买 <item:string> [num:number]', '购买物品，或查看商店')
    .usage(`/购买 <物品名称> [数量]|<空>`)
    .example('购买 精灵球 10')
    .action(async ({ session }, item, num) => {
      const { platform } = session
      const userArr = await ctx.database.get('pokebattle', { id: session.userId })
      if (!num) num = 1
      num=Math.floor(num)
      if (num < 1) return `宝可梦的世界不支持赊账`
      let reply = ''
      if (!item) {
        shop.forEach(item => {
          reply += `${item.name} 价格：${item.price}\r`
        })
        if (platform == 'qq' && config.QQ官方使用MD) {
          let MDreply: string = ''
          shop.forEach(item => {
            MDreply += `[${item.name}]\t(mqqapi://aio/inlinecmd?command=${encodeURIComponent(`/购买 ${item.name}`)}&reply=false&enter=true) 价格：${item.price}\r`
          })
          try {
            await session.bot.internal.sendMessage(session.channelId, {
              content: "111",
              msg_type: 2,
              markdown: {
                custom_template_id: config.MDid,
                params: [
                  {
                    key: config.key1,
                    values: [`<@${session.userId}>来到了商店`]
                  },
                  {
                    key: config.key2,
                    values: ["[img#128px #128px]"]
                  },
                  {
                    key: config.key3,
                    values: [await toUrl(ctx, `file://${resolve(__dirname, `assets/img/trainer/${userArr[0].trainer[0]}.png`)}`)]
                  },
                  {
                    key: config.key4,
                    values: [`商店物品：\r${MDreply}输入【购买 物品名称 数量】来购买物品，或者点击道具名字购买一个\r你当前金币：${userArr[0].gold}`]
                  },
                ]
              },
              keyboard: {

                content: {
                  "rows": [
                    { "buttons": [button(2, '购买', "/购买", session.userId, "1", false)] },
                  ]
                },
              },
              msg_id: session.messageId,
              timestamp: session.timestamp,
              msg_seq: Math.floor(Math.random() * 1000000),
            })
          } catch (e) {
            return `网络繁忙，再试一次`
          }
          return
        }
        return `商店物品：\r${reply}输入【/购买 物品名称 数量】来购买物品，数量不写默认为1\r你当前金币：${userArr[0].gold}`
      }

      if (userArr.length == 0) return `${h('at', { id: (session.userId) })}请先输入【${(config.签到指令别名)}】领取属于你的宝可梦和精灵球`
      const matchedItem = findItem(item)
      if (matchedItem.length == 0) return `没有这个物品哦`
      if (userArr[0].gold < matchedItem[0].price * num) return `你的金币不足`
      if (matchedItem.length > 1) {
        const item = matchedItem.map(item => `${item.name} 价格：${item.price}`).join('\n')
        return `找到多个物品，请输入完整名称\n${item}`
      } else {
        let tips = ''
        switch (matchedItem[0].name) {
          case '人物盲盒':
            tips = `输入【盲盒】来开启盲盒`;
            break;
          case '扭蛋代币':
            tips = `输入【技能扭蛋机】来抽取技能`;
            break;
          case '精灵球':
            tips = `输入【捕捉宝可梦】来捕捉宝可梦`;
            break;
          case '改名卡':
            tips = `输入【改名】改名`;
            break;
        }
        await ctx.database.set('pokebattle', { id: session.userId }, {
          gold: { $subtract: [{ $: 'gold' }, matchedItem[0].price * num] },
          [matchedItem[0].id]: { $add: [{ $: matchedItem[0].id }, num] }
        })
        return `${h('at', { id: (session.userId) })}\u200b
购买成功
====================
${matchedItem[0].name}+${num}
====================
tips:${tips}`
      }
    })


  ctx.command('宝可梦').subcommand('宝可问答', '回答问题，获得奖励')
    .action(async ({ session }) => {
      const { platform } = session
      const userId = session.userId
      if (!is12to14()) return `\u200b
====================
 现在不是答题时间哦
====================
 每天中午12点到下午
 3点是答题时间
====================
 答对问题可以获得
 体力或者金币
====================`
      const userArr = await ctx.database.get('pokebattle', { id: userId })
      let reply: string
      if (userArr.length == 0) return `${h('at', { id: (userId) })}请先输入【${(config.签到指令别名)}】领取属于你的宝可梦和精灵球`
      if (userArr[0].battleToTrainer >= 15) {
        reply = `现在你的体力是满的，回答问题只会获得金币哦~`
      }
      let y: string = ''
      if (userArr[0].ultramonster.length > 0) {
        y = `,当前回答受到传说中的宝可梦的加成，奖励增加`
      }
      let battleToTrainer = userArr[0].battleToTrainer
      const qNumber = pokemonCal.mathRandomInt(0, 142)
      const question = qu[qNumber]
      const ans = [an[qNumber].blue, an[qNumber].red, an[qNumber].green, an[qNumber].yellow]
      const right = an[qNumber].answer
      const imglink = await toUrl(ctx, imglk[qNumber].split('?')[0])
      if (platform == 'qq' && config.QQ官方使用MD) {
        try {
          await session.bot.internal.sendMessage(session.channelId, {
            content: "111",
            msg_type: 2,
            markdown: {
              custom_template_id: config.MDid,
              params: [
                {
                  key: config.key1,
                  values: [`请<@${userId}>听题：`]
                },
                {
                  key: config.key2,
                  values: ["[img#800px #450px]"]
                },
                {
                  key: config.key3,
                  values: [imglink]
                },
                {
                  key: config.key4,
                  values: [question]
                },
                {
                  key: config.key5,
                  values: [`题目出自宝可梦 太阳＆月亮第${qNumber + 3}集`]
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
                  { "buttons": [button(0, ans[0], ans[0], session.userId, "1"), button(0, ans[1], ans[1], session.userId, "2")] },
                  { "buttons": [button(0, ans[2], ans[2], session.userId, "1"), button(0, ans[3], ans[3], session.userId, "2")] },
                ]
              },
            },
            msg_id: session.messageId,
            timestamp: session.timestamp,
            msg_seq: Math.floor(Math.random() * 1000000),
          })
        } catch (e) {
          return `网络繁忙，再试一次`
        }
      } else {
        await session.send(`${h('at', { id: (userId) })}请听题：
${h('image', { url: imglink })}
${question}
题目出自宝可梦 太阳＆月亮第${qNumber + 3}集
本题答题时间15秒
1·${ans[0]}
2·${ans[1]}
3·${ans[2]}
4·${ans[3]}
回复机器人输入答案序号或者答案文字`)
      }
      let re = await session.prompt(300000)
      let end: string = ''
      if (!re) return `你好像还在犹豫，一会再来吧`
      if ('1234'.includes(re)) {
        re = ans[Number(re) - 1]
      }
      let pd: boolean = false
      switch (re) {
        case right:
          pd = true
          break
        default:
          pd = false
          break
      }

      if (pd) {
        if (battleToTrainer >= 15) {
          await ctx.database.set('pokebattle', { id: userId }, {
            gold: { $add: [{ $: 'gold' }, 100 + 50 * userArr[0].ultramonster.length] },
          })
          end = `回答正确\r你获得了${100 + 50 * userArr[0].ultramonster.length}金币${y}`
        }
        else {
          await ctx.database.set('pokebattle', { id: userId }, {
            battleToTrainer: { $add: [{ $: 'battleToTrainer' }, userArr[0].ultramonster.length + 1] },
          })
          end = `回答正确\r你获得了${userArr[0].ultramonster.length + 1}体力${y}`
        }
      }
      else {
        end = `回答错误\r正确答案是${right}`
      }
      if (platform == 'qq' && config.QQ官方使用MD && config.文字MDid) {
        await session.bot.internal.sendMessage(session.guildId, {
          content: "111",
          msg_type: 2,
          markdown: {
            custom_template_id: config.文字MDid,
            params: [
              {
                key: config.key4,
                values: [`\r#\t<@${userId}>问答结果:`]
              },
              {
                key: config.key5,
                values: [`${end}`]
              },
              {
                key: config.key6,
                values: [`\r\r>\t当前体力：${userArr[0].battleToTrainer}\r当前金币：${userArr[0].gold}`]
              },
            ]
          },
          keyboard: {
            content: {
              "rows": [
                { "buttons": [button(2, "📜 继续答题", `/宝可问答`, userId, "1"), button(2, "💳 查看信息", "/查看信息", userId, "2")] },
              ]
            },
          },
          msg_id: session.messageId,
          timestamp: session.timestamp,
          msg_seq: Math.floor(Math.random() * 1000000),
        })
        return
      }
      return `\u200b
====================
${end}
====================
当前体力：${userArr[0].battleToTrainer}
当前金币：${userArr[0].gold}`
    }
    )


  ctx.command('宝可梦').subcommand('改名 [name:text]', '改名，请输入2-6位中文')
    .action(async ({ session }, name: string) => {
      const userArr = await ctx.database.get('pokebattle', { id: session.userId })
      if (userArr[0].changeName < 1) return `你的改名次数已经用完`
      let regex = /^[\u4e00-\u9fa5]{2,6}$/
      if (!regex.test(name)) {
        do {
          await session.send(`请回复2-6位中文`)
          await session.bot.internal.sendMessage(session.channelId, {
            content: "111",
            msg_type: 2,
            keyboard: {
              content: {
                "rows": [
                  { "buttons": [button(0, '点击输入新名字', "", session.userId, "1", false)] },
                ]
              },
            },
            msg_id: session.messageId,
            timestamp: session.timestamp,
            msg_seq: Math.floor(Math.random() * 1000000),
          })
          const entry = await session.prompt(60000)
          name = entry
        }
        while (!regex.test(name))
      }
      if (userArr.length == 0) return `${h('at', { id: (session.userId) })}请先输入【${(config.签到指令别名)}】领取属于你的宝可梦和精灵球`
      await ctx.database.set('pokebattle', { id: session.userId }, {
        name: name,
        changeName: { $subtract: [{ $: 'changeName' }, 1] }
      })
      return `你的名字已经改为【${name}】`
    })


}
