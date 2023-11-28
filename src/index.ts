import {  Schema,  Time, h } from 'koishi'
import pokemonCal from './module/pokemon'
import { pathToFileURL } from 'url'
import { resolve } from 'path'
import * as fs from 'fs'
import * as path from 'path'
import { } from 'koishi-plugin-puppeteer'
import { } from 'koishi-plugin-canvas'
import { exec } from 'child_process'


export const name = 'pokemon-battle'

export const inject = {
  required: ['database', 'downloads', 'canvas'],
  optional: ['puppeteer']
}
export const usage = `
<a class="el-button" target="_blank" href="http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=bFdYGdp562abZWTmbHPAEw52aQq_fWqu&authKey=TPF8n37idd8paD0YfQJhpEax9PKe9sRPUk5GToIMr6%2Fs5I3v4ycBmT4k%2FGch0z8S&noverify=0&group_code=709239435"><b>加入宝可梦融合研究基金会  </b></a>

[宝可梦融合研究基金会群号：709239435](http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=bFdYGdp562abZWTmbHPAEw52aQq_fWqu&authKey=TPF8n37idd8paD0YfQJhpEax9PKe9sRPUk5GToIMr6%2Fs5I3v4ycBmT4k%2FGch0z8S&noverify=0&group_code=709239435)

### 11.22
- 适配了官方QQ群机器人图文排版

### 11.25
- 修复了下载图包是任务名冲突导致path错误
- 更新了查看信息指令回复
- 更新了捕捉宝可梦图片

### 11.26
- 修正了经验获取算法
- 建了个群，都加加

### 11.29
- 更新了图片解包方法，可以使用指令解包了

### Todo
- 传说中的宝可梦收集度
`

export interface Config {
  管理员: string
  签到指令别名: string
  捕捉指令别名: string
  杂交指令别名: string
  查看信息指令别名: string
  放生指令别名: string
  签到获得个数: number
  战斗详情是否渲染图片: boolean
  是否关闭战斗详情: boolean
  精灵球定价: number
  训练师定价: number
  扭蛋币定价: number
  canvas图片品质: number
  对战图片品质: number
  对战cd: number
  对战次数: number
}

export const Config = Schema.intersect([
  Schema.object({
    签到指令别名: Schema.string().default('签到'),
    捕捉指令别名: Schema.string().default('捕捉宝可梦'),
    杂交指令别名: Schema.string().default('杂交宝可梦'),
    查看信息指令别名: Schema.string().default('查看信息'),
    放生指令别名: Schema.string().default('放生'),
    管理员: Schema.string().default(''),
    战斗详情是否渲染图片: Schema.boolean().default(false).description('渲染图片需要加载puppeteer服务'),
    是否关闭战斗详情: Schema.boolean().default(true).description('渲染图片需要加载puppeteer服务'),
    canvas图片品质: Schema.number().role('slider')
      .min(0).max(1).step(0.1).default(1),
    对战图片品质: Schema.number().role('slider')
      .min(0).max(100).step(1).default(100),
  }),
  Schema.object({
    签到获得个数: Schema.number().default(2),
    精灵球定价: Schema.number().default(800),
    训练师定价: Schema.number().default(10000),
    扭蛋币定价: Schema.number().default(1500),
    对战cd: Schema.number().default(10).description('单位：秒'),
    对战次数: Schema.number().default(15),
  }).description('数值设置')
])

declare module 'koishi' {
  interface Tables {
    pokebattle: Pokebattle
  }
}

export interface Pokebattle {
  id: String
  name: String
  date: Number
  captureTimes: Number
  battleTimes: Number
  battleToTrainer: Number
  level: Number
  exp: Number
  monster_1: String
  battlename: String
  AllMonster: string[]
  ultramonster: string[]
  base: string[]
  power: string[]
  skill: Number
  coin: Number
  gold: Number
  skillbag: string[]
  trainer: string[]
  trainerNum: Number
  trainerName: string[]
  battlecd: Number
}

export async function apply(ctx, config: Config) {
  const logger = ctx.logger('pokemon')
  if (!fs.existsSync('./image')) {
    const imageTask = ctx.downloads.nereid('pokemonimage', [
      'npm://pokemon-picture',
      'npm://pokemon-picture?registry=https://registry.npmmirror.com', ,
    ], 'bucket1')
    imageTask.promise.then((path) => {
      logger.info('下载图包完成')
      logger.info('图包目录：' + resolve(path) + '可以通过指令【解压图包文件】\n如果不想通过指令解压图包，可以到日志提示的目录下\n手动解压到koishi根目录（即让image文件夹与downloads文件夹同级）')
    })
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
    skillbag: 'list',
    trainer: 'list',
    trainerNum: 'integer',
    trainerName: 'list',
    battlecd: 'integer'
  }, {
    primary: "id"
  })
  const shop = [
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
    }]
  const exptolv = require('./ExpToLv.json')
  const Base = require('./PokemonBase.json')
  const expbase = require('./expbase.json')
  const skillMachine = require('./skillMachine.json')

  let restartUser = await ctx.database
    .select('pokebattle')
    .where({ battleTimes: { $lte: 0 } })
    .execute()

  for (let i = 0; i < restartUser.length; i++) {
    await ctx.database.set('pokebattle', { id: restartUser[i].id }, {
      battleTimes: 1,
    })
  }
  let banID = ['150.150', '151.151', '144.144', '145.145', '146.146']
  let regex = new RegExp(banID.join('|'))
  let allUsers = await ctx.database
    .select('pokebattle')
    .execute();

  let nexttUser = allUsers.filter(user => user.AllMonster.some(monster => regex.test(monster)));
  for (let i = 0; i < nexttUser.length; i++) {
    let ls = nexttUser[i].AllMonster.filter(monster => !banID.includes(monster))
    let ultramonsterPlus = nexttUser[i].AllMonster.filter(monster => banID.includes(monster))
    if (ls.length === 0) ls = ['6.6']
    nexttUser[i].ultramonster.push(ultramonsterPlus)
    await ctx.database.set('pokebattle', { id: nexttUser[i].id }, {
      AllMonster: ls,
      ultramonster: nexttUser[i].ultramonster
    })
  }
  for (let i = 0; i < allUsers.length; i++) {
    allUsers[i].ultramonster = [...new Set(allUsers[i].ultramonster)]
    await ctx.database.set('pokebattle', { id: allUsers[i].id }, {
      ultramonster: allUsers[i].ultramonster,
      trainer: allUsers[i].trainer[0] ? allUsers[i].trainer : ['0'],
      trainerName: allUsers[i].trainerName[0] ? allUsers[i].trainerName : ['默认训练师']

    })
  }
//宝可梦帮助图像化

  // ctx.before('send', (session) => {
  //   if(session._stripped.content!=='宝可梦'||session._sendType!=='command') return
  //   let str=session.event.message.elements[0].attrs.content
  //   let arr=str.split('\n')
  //   for(let i=0;i<arr.length;i++){
  //     arr[i]=arr[i].replace(/    /g,"")
  //     arr[i]=arr[i].split('  ')
  //   }
  //   console.info(arr)
  //   session.elements[0]=h('text', { content: arr.toString() })
  // })



  //签到
  ctx.command('宝可梦').subcommand('宝可梦签到', '每日的宝可梦签到')
    .alias(config.签到指令别名)
    .usage(`/${config.签到指令别名}`)
    .action(async ({ session }) => {
      const userArr = await ctx.database.get('pokebattle', { id: session.userId })
      let dateToday = Math.round(Number(new Date()) / 1000)
      if (userArr.length != 0) {
        let dateNow = Math.floor((userArr[0].date + 28800) / 86400)
        if (dateNow == Math.floor((dateToday + 28800) / 86400)) {
          session.send('今天你已经签到过了哟~快去捕捉属于你的宝可梦吧')
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
          let expGet
          if (userArr[0].monster_1 == '0') {
            expGet = Math.floor(userArr[0].level * expbase.exp[Number(userArr[0].AllMonster[0].split('.')[0]) - 1].expbase / 7)
          } else {
            expGet = userArr[0].level > 99 ? 0 : Math.floor(userArr[0].level * expbase.exp[(Number(userArr[0].monster_1.split('.')[0]) > Number(userArr[0].monster_1.split('.')[1]) ? Number(userArr[0].monster_1.split('.')[1]) : Number(userArr[0].monster_1.split('.')[0])) - 1].expbase / 7 * pokemonCal.mathRandomInt(0.3, 0.8))
          }
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
          try {
            await ctx.database.set('pokebattle', { id: session.userId }, {
              name: session.username.length < 6 ? session.username : session.username.slice(0, 4),
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
          let image = await ctx.canvas.loadImage(resolve(__dirname, './qiandao', '签到.png'))
          let pokemonimg = await ctx.canvas.loadImage(resolve(__dirname, `./images/0.png`))
          let pokemonimg1 = []
          for (let i = 0; i < userArr[0].AllMonster.length; i++) {
            pokemonimg1[i] = await ctx.canvas.loadImage(resolve(__dirname, `./images/${userArr[0].AllMonster[i].split('.')[0]}.png`))
          }
          let ultramonsterimg = []
          for (let i = 0; i < 5; i++) {
            ultramonsterimg[i] = await ctx.canvas.loadImage(resolve(__dirname, `./images/${banID[i].split('.')[0]}.png`))
          }
          if (userArr[0].monster_1 !== '0') pokemonimg = await ctx.canvas.loadImage(`./image/${userArr[0].monster_1}.png`)
          let trainers = '0'
          if (userArr[0].trainer[0] !== '0') { trainers = userArr[0].trainer[0] }
          let trainerimg = await ctx.canvas.loadImage(resolve(__dirname, `./img/trainer/${trainers}.png`))
          let expbar = await ctx.canvas.loadImage(resolve(__dirname, './qiandao', 'expbar.png'))
          let overlay = await ctx.canvas.loadImage(resolve(__dirname, './qiandao', 'overlay_exp.png'))
          let time = Date.now()
          let date = new Date(time).toLocaleDateString()
          let img
          const dataUrl = await ctx.canvas.render(512, 763, async (ctx) => {
            ctx.drawImage(image, 0, 0, 512, 763)
            ctx.drawImage(pokemonimg, 21, 500, 160, 160)
            ctx.drawImage(trainerimg, 21, 56, 160, 160)
            ctx.font = 'normal 30px zpix'
            ctx.fillText(userArr[0].gold + 3000, 290, 100)
            ctx.fillText(session.username.length < 6 ? session.username : session.username.slice(0, 4) + `签到成功`, 49, 270)
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
            ctx.drawImage(overlay, 318, 203, 160 * expNew / exptolv.exp_lv[lvNew].exp, 8)
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
          return h.image(img)
          //图片服务
        }
      } else {
        let firstMonster_ = pokemonCal.mathRandomInt(1, 151)
        let firstMonster = firstMonster_ + '.' + firstMonster_
        await ctx.database.create('pokebattle', {
          id: session.userId,
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
          trainer: ['0']
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
初始资金：3000
初始技能扭蛋机代币：${(config.签到获得个数)}个
已经放进背包啦
输入【@bot /宝可梦】获取详细指令
你的第一只宝可梦是：
【${(pokemonCal.pokemonlist(firstMonster))}】
${pokemonCal.pokemomPic(firstMonster, false)}`)

      }
    })
  ctx.command('宝可梦').subcommand('捕捉宝可梦', '随机遇到3个宝可梦')
    .alias(config.捕捉指令别名)
    .usage(`/${config.捕捉指令别名}`)
    .action(async ({ session }) => {
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
            grassMonster[i] = pokemonCal.mathRandomInt(1, 151)
            pokeM[i] = grassMonster[i] + '.' + grassMonster[i]
            for (let j = 0; j < pokemonCal.pokemonlist(pokeM[i]).length; j++) {
              black[i] = black[i] + ('⬛')

            }
          }
          //创建图片
          let poke_img = []
          let dataUrl
          let bg_img = await ctx.canvas.loadImage(resolve(__dirname, './qiandao', 'catchBG.png'))
          poke_img[0] = await ctx.canvas.loadImage(resolve(__dirname, './images', grassMonster[0] + '.png'))
          poke_img[1] = await ctx.canvas.loadImage(resolve(__dirname, './images', grassMonster[1] + '.png'))
          poke_img[2] = await ctx.canvas.loadImage(resolve(__dirname, './images', grassMonster[2] + '.png'))
          let grassImg = await ctx.canvas.loadImage(resolve(__dirname, './qiandao', 'Grass.png'))
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
          session.send(`
${h.image(dataUrl)}
${(h('at', { id: (session.userId) }))}📦官方机器人输入【@Bot 序号】📦
请向其中一个投掷精灵球
【1】${black[0]}
【2】${black[1]}
【3】${black[2]}
请在10秒内输入序号
  `)
          const chooseMonster = await session.prompt()
          let poke
          let reply
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
              session.send(`${pokemonCal.pokemomPic(poke, false)}
📦
【1】✨【${(pokemonCal.pokemonlist(poke))}】✨
【2】⬛（${(pokemonCal.pokemonlist(pokeM[1]))}）⬛
【3】⬛（${(pokemonCal.pokemonlist(pokeM[2]))}）⬛
恭喜${(h('at', { id: (session.userId) }))}获得${(pokemonCal.pokemonlist(poke))}
精灵球-1`)
              break;
            case '2':
              poke = pokeM[1]
              session.send(`${pokemonCal.pokemomPic(poke, false)}
📦
【1】⬛（${(pokemonCal.pokemonlist(pokeM[0]))}）⬛
【2】✨【${(pokemonCal.pokemonlist(poke))}】✨
【3】⬛（${(pokemonCal.pokemonlist(pokeM[2]))}）⬛
恭喜${(h('at', { id: (session.userId) }))}获得${(pokemonCal.pokemonlist(poke))}
精灵球-1`)
              break;
            case '3':
              poke = pokeM[2]
              session.send(`${pokemonCal.pokemomPic(poke, false)}
📦
【1】⬛（${(pokemonCal.pokemonlist(pokeM[0]))}）⬛
【2】⬛（${(pokemonCal.pokemonlist(pokeM[1]))}）⬛
【3】✨【${(pokemonCal.pokemonlist(poke))}】✨
恭喜${(h('at', { id: (session.userId) }))}获得${(pokemonCal.pokemonlist(poke))}
精灵球-1`)
              break;
            default:
              return '球丢歪啦！重新捕捉吧~\n精灵球-1"'
          }
          if (banID.includes(poke)) {
            // 检查用户是否已经拥有这个传说宝可梦
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
  ctx.command('宝可梦').subcommand('杂交宝可梦', '选择两只宝可梦杂交')
    .alias(config.杂交指令别名)
    .usage(`/${config.杂交指令别名}`)
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
📦官方机器人请@Bot后输入序号📦
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
          dan = pokemonCal.pokemonzajiao(pokeM, pokeW)
          if (dan == 0 || dan[0] == 0) {
            //处理杂交错误
            return '输入错误'
          } else {
            if (userArr[0].monster_1 != '0') {
              //图片服务
              let img_fuse = await ctx.canvas.loadImage(resolve(__dirname, './qiandao/fuse.png'))
              let img_F = await ctx.canvas.loadImage(`./image/${pokeM.split('.')[0]}.png`)
              let img_M = await ctx.canvas.loadImage(`./image/${pokeW.split('.')[0]}.png`)
              let img_S = await ctx.canvas.loadImage(`./image/${dan[1]}.png`)
              let img_C = await ctx.canvas.loadImage(`./image/${userArr[0].monster_1}.png`)
              let img_zj = await ctx.canvas.render(512, 768, ctx => {
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
              })
              //图片服务
              //有战斗宝可梦
              session.send(`${(h('at', { id: (session.userId) }))}
${img_zj}
能力变化：
生命：${Math.sign(Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[0]) - userArr[0].power[0]) >= 0 ? '+' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[0]) - userArr[0].power[0]) : '' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[0]) - userArr[0].power[0])}
攻击：${Math.sign(Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[1]) - userArr[0].power[1]) >= 0 ? '+' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[1]) - userArr[0].power[1]) : '' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[1]) - userArr[0].power[1])}
防御：${Math.sign(Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[2]) - userArr[0].power[2]) >= 0 ? '+' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[2]) - userArr[0].power[2]) : '' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[2]) - userArr[0].power[2])}
特殊：${Math.sign(Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[3]) - userArr[0].power[3]) >= 0 ? '+' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[3]) - userArr[0].power[3]) : '' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[3]) - userArr[0].power[3])}
速度：${Math.sign(Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[4]) - userArr[0].power[4]) >= 0 ? '+' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[4]) - userArr[0].power[4]) : '' + (Number(pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)[4]) - userArr[0].power[4])}
是否放入战斗栏（Y/N）
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

                  return '成功将' + dan[0] + '放入战斗栏' + `\n能力值：
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
  ctx.command('宝可梦').subcommand('查看信息 <user:string>', '查看用户信息')
    .alias(config.查看信息指令别名)
    .usage(`/${config.查看信息指令别名} @user`)
    .action(async ({ session }, user) => {
      let pokemonimg1 = []
      let pokemonimg = []
      let ultramonsterimg = []
      let userArr: string | any[]
      let userId: string
      let infoImgSelf
      const infoImgSelf_bg = await ctx.canvas.loadImage(resolve(__dirname, './qiandao', 'trainercard.png'))
      let expbar = await ctx.canvas.loadImage(resolve(__dirname, './qiandao', 'expbar.png'))
      let overlay = await ctx.canvas.loadImage(resolve(__dirname, './qiandao', 'overlay_exp.png'))
      if (!user) {
        //查看自己信息
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
        const infoName = userArr[0].name ? `${userArr[0].name}` : session.username > 10 ? `${session.username}` : infoId
        for (let i = 0; i < userArr[0].AllMonster.length; i++) {
          pokemonimg1[i] = await ctx.canvas.loadImage(resolve(__dirname, `./images/${userArr[0].AllMonster[i].split('.')[0]}.png`))
        }
        for (let i = 0; i < 5; i++) {
          ultramonsterimg[i] = await ctx.canvas.loadImage(resolve(__dirname, `./images/${banID[i].split('.')[0]}.png`))
        }
        if (userArr[0].monster_1 !== '0') pokemonimg = await ctx.canvas.loadImage(`./image/${userArr[0].monster_1}.png`)
        let trainers = '0'
        if (userArr[0].trainer[0] !== '0') { trainers = userArr[0].trainer[0] }
        let trainerimg = await ctx.canvas.loadImage(resolve(__dirname, `./img/trainer/${trainers}.png`))
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
          ctx.drawImage(overlay, 181, 644, 160 * userArr[0].exp / exptolv.exp_lv[userArr[0].level].exp, 8)
          ctx.drawImage(expbar, 163, 641, 180, 20)
          infoImgSelf = await ctx.canvas.toDataURL('image/jpeg', config.canvas图片品质)
        })

        //图片服务

        return `${h.image(infoImgSelf)}
${(h('at', { id: (session.userId) }))}`
      } else {
        return `请先输入【${(config.签到指令别名)}】领取属于你的宝可梦和精灵球`
        //不存在数据
      }
    })
  ctx.command('宝可梦').subcommand('放生', '放生宝可梦')
    .alias(config.放生指令别名)
    .usage(`/${config.放生指令别名}`)
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
📦官方机器人请@Bot后输入序号📦
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
        let chsNum = Number(choose) - 1
        let baseexp = expbase.exp[Number(String(userArr[0].AllMonster[chsNum]).split('.')[0]) - 1].expbase
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
        ${(h('at', { id: (session.userId) }))}你将
【${(pokemonCal.pokemonlist(discarded[0]))}】放生了
${pokemonCal.pokemomPic(discarded[0], false)}${(RandomPoke)}
经验+${expGet}
当前等级为lv.${lvNew}
当前经验：[[${(pokemonCal.exp_bar(lvNew, expNew))}]]
        `
      } else {
        return `你好像想放生一些了不得的东西`
      }

    })
  ctx.command('宝可梦').subcommand('属性', '查看战斗宝可梦属性')
    .usage(`/属性`)
    .action(async ({ session },) => {
      let tar = session.userId
      const userArr = await ctx.database.get('pokebattle', { id: tar })
      let toDo = ''
      if (userArr[0].base[0]) {
        toDo = `${userArr[0].battlename}能力值：
生命：${pokemonCal.power(pokemonCal.pokeBase(userArr[0].monster_1), userArr[0].level)[0]}
攻击：${pokemonCal.power(pokemonCal.pokeBase(userArr[0].monster_1), userArr[0].level)[1]}
防御：${pokemonCal.power(pokemonCal.pokeBase(userArr[0].monster_1), userArr[0].level)[2]}
特殊：${pokemonCal.power(pokemonCal.pokeBase(userArr[0].monster_1), userArr[0].level)[3]}
速度：${pokemonCal.power(pokemonCal.pokeBase(userArr[0].monster_1), userArr[0].level)[4]}`
      }
      return `${h('at', { id: (session.userId) })}※※※※※
${(toDo)}
※※※※※※※※※※※※
      `

    })
  ctx.command('宝可梦').subcommand('对战 <user>', '和其他训练师对战，不选择对手则随机与相近等级的对手对战,官方机器人仅支持随机对战')
    .usage(`/对战 @user`)
    .action(async ({ session }, user) => {
      let battleSuccess = false
      try {
        // if (!user) return `请@一位宝可梦训练师，例如对战 @麦Mai`
        let losergold = ''
        let userId
        let randomUser
        let banMID = ['144', '145', '146', '150', '151']
        const userArr = await ctx.database.get('pokebattle', { id: session.userId })
        let maxLevelUser = await ctx.database
          .select('pokebattle', {
            battleTimes: { $gte: 1 },
            id: { $ne: userArr[0].id },
            monster_1: { $ne: '0' },
            skillbag: { $ne: [] },
            power: { $ne: [] }
          })
          .orderBy('level', 'desc')
          .limit(1)
          .execute()
        let maxLevel
        if (maxLevelUser.length == 0) return `你已经找不到合适的对手了`

        maxLevel = maxLevelUser[0].level

        let battlenow = new Date().getTime()
        if (userArr[0].battlecd + config.对战cd * 1000 >= battlenow) {
          return `对战太过频繁，请${Math.ceil((userArr[0].battlecd + config.对战cd * 1000 - battlenow) / 1000)}秒后再试`
        }
        if (userArr.length == 0) return `请先输入【${(config.签到指令别名)}】领取属于你的宝可梦和精灵球`
        if (userArr[0].monster_1 == '0') return `你还没有宝可梦，快去【${(config.杂交指令别名)}】抓一只吧`
        if (userArr[0].skillbag.length == 0 || userArr[0].skill == 0) return `快使用【技能扭蛋机】抽取一个技能并装备上`
        if (userArr[0].battleToTrainer <= 0) return `你的宝可梦还在恢复，无法对战，如果你今天还没签到，记得先签到再对战哦`
        if (!user) {
          let randomID = await ctx.database.get('pokebattle', {
            level: {
              $lte: Number(userArr[0].level) + 2,
              $gte: Number(userArr[0].level) - 2
            },
            battleTimes: { $gte: 1 },
            monster_1: { $ne: '0' },
            skillbag: { $ne: [] },
            power: { $ne: [] }
          })
          let levelCount = Number(userArr[0].level)

          if (randomID.length == 1 || randomID.length == 0) {
            do {
              randomID = await ctx.database.get('pokebattle', {
                level: { $eq: levelCount },
                id: { $ne: userArr[0].id },
                battleTimes: { $gte: 1 },
                monster_1: { $ne: '0' },
                skillbag: { $ne: [] },
                base: { $ne: [] }
              })
              // let maxLevela = Math.max(...randomID.map(item => item.level));
              // if (levelCount == maxLevel) {
              //   levelCount = levelCount - 1
              //   maxLevel = maxLevel - 1
              // } else 
              if (maxLevel <= levelCount) {
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
        // else if(user=='rank'){

        // }
        else {
          // userId = /[0-9]+/.exec(user)[0]
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
        if (session.userId == userId) {
          return (`你不能对自己发动对战`)
        }
        else if (tarArr.length == 0 || tarArr[0].monster_1 == '0') {
          return (`对方还没有宝可梦`)
        }
        let tar1 = tarArr[0].monster_1.split('.')[0]
        let tar2 = tarArr[0].monster_1.split('.')[1]
        let user1 = userArr[0].monster_1.split('.')[0]
        let user2 = userArr[0].monster_1.split('.')[1]
        let dan: number | any[]
        if (banMID.includes(user1) || banMID.includes(user2)) {
          let pokeM = '3.3'
          let pokeW = '6.6'
          dan = pokemonCal.pokemonzajiao(pokeM, pokeW)
          await ctx.database.set('pokebattle', { id: session.userId }, {
            monster_1: dan[1],
            base: pokemonCal.pokeBase(dan[1]),
            battlename: dan[0],
            power: pokemonCal.power(pokemonCal.pokeBase(dan[1]), userArr[0].level)
          })

          return `传说宝可梦基因无法对战，已将其放生并为你杂交出新的宝可梦【${dan[0]}】`
        }
        if (banMID.includes(tar1) || banMID.includes(tar2)) {
          let pokeM = '3.3'
          let pokeW = '6.6'
          dan = pokemonCal.pokemonzajiao(pokeM, pokeW)
          await ctx.database.set('pokebattle', { id: userId }, {
            monster_1: dan[1],
            base: pokemonCal.pokeBase(dan[1]),
            battlename: dan[0],
            power: pokemonCal.power(pokemonCal.pokeBase(dan[1]), tarArr[0].level)

          })
          return `传说宝可梦基因无法对战，已将其放生并为他杂交出新的宝可梦【${dan[0]}】`
        }
        if (!userArr[0].skill) return `你们的宝可梦必须全部装备上对战技能哦~`
        if (userArr[0].gold < 500) {
          return (`你的金币不足，无法对战`)
        } else if (tarArr[0].battleTimes == 0) {
          return `对方的宝可梦还在恢复，无法对战`
        }
        await session.send(`你支付了500金币，请稍等，正在发动了宝可梦对战`)
        if (tarArr[0].power.length == 0) {
          await ctx.database.set('pokebattle', { id: userId }, {
            base: pokemonCal.pokeBase(tarArr[0].monster_1),
            power: pokemonCal.power(pokemonCal.pokeBase(tarArr[0].monster_1), userArr[0].level)

          })
        }
        tarArr = await ctx.database.get('pokebattle', { id: userId })
        let jli: string = ''
        await ctx.database.set('pokebattle', { id: userId }, {
          battleTimes: { $subtract: [{ $: 'battleTimes' }, 1] },
        })
        await ctx.database.set('pokebattle', { id: session.userId }, {
          battleToTrainer: { $subtract: [{ $: 'battleToTrainer' }, 1] },
          battlecd: battlenow
        })
        if (tarArr[0].battleTimes == 1) {
          setTimeout(async () => {
            await ctx.database.set('pokebattle', { id: userId }, {
              battleTimes: 3,
            })
          }, Time.hour * 2)
          let noTrainer = battleSuccess ? session.elements[1].attrs.name : tarArr[0].name || tarArr[0].battlename
          jli = `${noTrainer}已经筋疲力尽，2小时后恢复完毕`
        }
        let battle = pokemonCal.pokebattle(userArr, tarArr)
        let battlelog = battle[0]
        let winner = battle[1]
        let loser = battle[2]
        let getgold = pokemonCal.mathRandomInt(500, 1200)
        let loserArr = await ctx.database.get('pokebattle', { id: loser })
        let winnerArr = await ctx.database.get('pokebattle', { id: winner })
        let expGet = userArr[0].level > 99 ? 0 : userArr[0].level > 99 ? 0 : Math.floor(loserArr[0].level * expbase.exp[(Number(winnerArr[0].monster_1.split('.')[0]) > Number(winnerArr[0].monster_1.split('.')[1]) ? Number(winnerArr[0].monster_1.split('.')[1]) : Number(winnerArr[0].monster_1.split('.')[0])) - 1].expbase / 7)
        if (loserArr[0].level >= winnerArr[0].level + 6) {
          expGet = Math.floor(expGet * 0.2)
        }
        let expNew = pokemonCal.expCal(loserArr[0].level, loserArr[0].exp + expGet)[1]
        let lvNew = pokemonCal.expCal(loserArr[0].level, loserArr[0].exp + expGet)[0]
        await ctx.database.set('pokebattle', { id: session.userId }, {
          gold: { $subtract: [{ $: 'gold' }, 500] },
        })
        await ctx.database.set('pokebattle', { id: winner }, {
          gold: { $add: [{ $: 'gold' }, getgold] },
        })
        losergold += `${loserArr[0].name || loserArr[0].battlename}输了，补偿经验+${expGet}
当前等级为lv.${lvNew}
当前经验：[[${(pokemonCal.exp_bar(lvNew, expNew))}]]`
        await ctx.database.set('pokebattle', { id: loser }, {
          level: lvNew,
          exp: expNew,
          power: pokemonCal.power(pokemonCal.pokeBase(loserArr[0].monster_1), lvNew),
        })

        if (config.战斗详情是否渲染图片) return `${await getPic(ctx, battlelog, userArr[0], tarArr[0])}
获胜者是${winnerArr[0].name || winnerArr[0].battlename}，获得金币+${getgold}
${losergold}
${jli}`
        await session.send(`${battlelog}\n${losergold}\n${jli}`)
        return `获胜者是${winnerArr[0].name || winnerArr[0].battlename}
获得金币+${getgold}
`} catch (e) {
        logger.info(e)
        return `对战失败`
      }
    })
  ctx.command('宝可梦').subcommand('解压图包文件')
    .action(async ({ session }) => {
      if (session.userId != config.管理员) return `权限不足`
      exec('tar -xvf ./downloads/bucket1-mnlaakixr8b0v4yngpq865qr144y63jx/image.tar', async (error, stdout, stderr) => {
        if (error) {
          logger.error(`执行的错误: ${error}`)
          return
        }
        logger.info(`stdout: ${stdout}`)
        logger.error(`stderr: ${stderr}`)
        await session.send(`解压已完成`)
      })
    })
  ctx.command('宝可梦').subcommand('技能扭蛋机', '消耗一个扭蛋币，抽取技能')
    .usage(`/技能扭蛋机`)
    .action(async ({ session }) => {
      const userArr = await ctx.database.get('pokebattle', { id: session.userId })
      if (userArr.length == 0) return `${h('at', { id: (session.userId) })}请先输入【${(config.签到指令别名)}】领取属于你的宝可梦和精灵球`
      if (userArr[0].coin < 1) { return (`你的代币不足，要积极参与对战哦~`) }
      await ctx.database.set('pokebattle', { id: session.userId }, {
        coin: { $subtract: [{ $: 'coin' }, 1] },
      })
      let getskill = pokemonCal.pokemonskill(userArr[0].level)
      if (userArr[0].skill == 0) {
        userArr[0].skillbag.push(String(getskill))
        await ctx.database.set('pokebattle', { id: session.userId }, {
          skill: getskill,
          skillbag: userArr[0].skillbag
        })
        return `${h('at', { id: (session.userId) })}✨✨✨
恭喜你获得了【${(skillMachine.skill[getskill].skill)}】技能
✨✨✨✨✨✨✨✨✨`
      } else if (userArr[0].skillbag.includes(String(getskill))) {
        await ctx.database.set('pokebattle', { id: session.userId }, {
          gold: { $add: [{ $: 'gold' }, 350] },
        })
        return `${h('at', { id: (session.userId) })}你已经有【${(skillMachine.skill[getskill].skill)}】技能了，转换为🪙金币+350`
      } else {
        userArr[0].skillbag.push(String(getskill))
        await ctx.database.set('pokebattle', { id: session.userId }, {
          skillbag: userArr[0].skillbag
        })
        return `${h('at', { id: (session.userId) })}✨✨✨
恭喜你获得了【${(skillMachine.skill[getskill].skill)}】技能
已放入技能背包
输入指令【装备技能 ${skillMachine.skill[getskill].skill}】来装备该技能
✨✨✨✨✨✨✨✨✨`
      }

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
  ctx.command('宝可梦').subcommand('查询技能 <skill>', '查询技能信息，不输入技能名字则查看你所有的最强技能')
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
      if (userArr[0].trainer.length == 0) return `${h('at', { id: (session.userId) })}你还没有训练师哦`
      if (userArr[0].trainer.length == 1) return `${h('at', { id: (session.userId) })}你只有一个训练师，无法更换`
      let nameList = `${userArr[0].trainerName.map((item, index) => `${index + 1}.${item}`).join('\n')}`
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
        return `${h('at', { id: (session.userId) })}成功更换了训练师${h.image(pathToFileURL(resolve(__dirname, './img/trainer', newTrainer[0] + '.png')).href)}`
      }
      if (userArr[0].trainerName.includes(name)) {
        const distance = userArr[0].trainerName.indexOf(name)
        let newTrainer = moveToFirst(userArr[0].trainer, userArr[0].trainer[distance])
        let newTrainerName = moveToFirst(userArr[0].trainerName, name)
        await ctx.database.set('pokebattle', { id: session.userId }, {
          trainer: newTrainer,
          trainerName: newTrainerName
        })
        return `${h('at', { id: (session.userId) })}成功更换了训练师${h.image(pathToFileURL(resolve(__dirname, './img/trainer', newTrainer[0] + '.png')).href)}`
      }

    })

  ctx.command('宝可梦').subcommand('盲盒', '开启盲盒，抽取训练师')
    .usage(`/盲盒`)
    .action(async ({ session }) => {
      const userArr = await ctx.database.get('pokebattle', { id: session.userId })
      if (userArr.length == 0) return `${h('at', { id: (session.userId) })}请先输入【${(config.签到指令别名)}】领取属于你的宝可梦和精灵球`
      if (userArr[0].trainerNum < 1) return `${h('at', { id: (session.userId) })}你的盲盒不足，无法开启`
      await ctx.database.set('pokebattle', { id: session.userId }, {
        trainerNum: { $subtract: [{ $: 'trainerNum' }, 1] },
      })
      let getTrainer = String(pokemonCal.mathRandomInt(0, 60))
      while (userArr[0].trainer.includes(getTrainer)) {
        getTrainer = String(pokemonCal.mathRandomInt(0, 60))
      }
      userArr[0].trainer.push(getTrainer)
      await ctx.database.set('pokebattle', { id: session.userId }, {
        trainer: userArr[0].trainer,
      })
      await session.send(`${h.image(pathToFileURL(resolve(__dirname, './img/trainer', getTrainer + '.png')).href)}
恭喜你获得了训练师
请输入新训练师的名字:________`)
      const trainerName = await session.prompt(25000)
      if (!trainerName) {
        let randomName = getRandomName(3)
        let numr = userArr[0].trainerName.push(randomName)
        await ctx.database.set('pokebattle', { id: session.userId }, {
          trainerName: userArr[0].trainerName,
        })
        return `你好像没有输入名字，训练师已经自动命名为【${randomName}】
输入【更换训练师】可以更换你的训练师`
      }
      userArr[0].trainerName.push(trainerName)
      await ctx.database.set('pokebattle', { id: session.userId }, {
        trainerName: userArr[0].trainerName,
      })
      return `你的训练师已经命名为【${trainerName}】
输入【更换训练师】可以更换你的训练师`
    })

  ctx.command('宝可梦').subcommand('购买 <item:string> [num:number]', '购买物品，不输入物品名称则查看商店')
    .usage(`/购买 <物品名称> [数量]|<空>`)
    .example('购买 精灵球 10')
    .action(async ({ session }, item, num) => {
      const userArr = await ctx.database.get('pokebattle', { id: session.userId })
      if (!num) num = 1
      if (num < 1) return `宝可梦的世界不支持赊账`
      let reply = ''
      if (!item) {
        shop.forEach(item => {
          reply += `${item.name} 价格：${item.price}\n`
        })
        return `商店物品：\n${reply}输入【购买 物品名称 数量】来购买物品，数量不写默认为1\n你当前金币：${userArr[0].gold}`
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
        if (matchedItem[0].name == '人物盲盒') { tips = `\n输入【盲盒】来开启盲盒` }
        await ctx.database.set('pokebattle', { id: session.userId }, {
          gold: { $subtract: [{ $: 'gold' }, matchedItem[0].price * num] },
          [matchedItem[0].id]: { $add: [{ $: matchedItem[0].id }, num] }
        })
        return `购买成功\n${matchedItem[0].name}+${num}${tips}`
      }
    })
  async function getPic(ctx, log, user, tar) {
    try {
      let page = await ctx.puppeteer.page()
      await page.setViewport({ width: 1920 * 2, height: 1080 * 2 })

      await page.goto(`${pathToFileURL(resolve(__dirname, './battle/template.html'))}`)
      await page.evaluate(`render(${JSON.stringify(log)},${JSON.stringify(user)},${JSON.stringify(tar)},${JSON.stringify(config.是否关闭战斗详情)})`)
      await page.waitForNetworkIdle()
      const element = await page.$('body')
      await page.evaluate(() => document.fonts.ready)

      let pic = h.image(await element.screenshot({
        path: './image/screenshot.jpg',
        type: 'jpeg',
        quality: config.对战图片品质,
        encoding: 'binary',
      }), 'image/jpg')
      if (page && !page.isClosed()) {
        await page.close();
      }
      return pic
    } catch (e) {
      logger.info(e)
      return `渲染失败`
    }
  }
  function findItem(item) {
    const matchedKey = shop.filter(key => key.name.includes(item))
    return matchedKey
  }
  function getRandomName(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
  }
  function moveToFirst(array, element) {
    const index = array.indexOf(element)
    if (index !== -1) {
      array.splice(index, 1)
      array.unshift(element)
    }
    return array
  }
}
