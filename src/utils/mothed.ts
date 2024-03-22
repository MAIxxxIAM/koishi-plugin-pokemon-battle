import { resolve } from 'path'
import { Pokebattle,logger,config,shop,testcanvas } from '..'
import { type,battleType} from './data'
import { Context } from 'koishi'


export async function isResourceLimit (userId:string,ctx:Context) {
  const resources = await ctx.database.get('pokemon.resourceLimit',{id:userId})
  if (resources.length == 0) {
   return await ctx.database.create('pokemon.resourceLimit',{id:userId})
  }else{
    return resources[0]
  }
}

export async function getPic(ctx, log, user, tar) {
  try {
    let att: Pokebattle, def: Pokebattle
    if (user.power[4] > tar.power[4]) { att = user; def = tar } else { att = tar; def = user }
    const attPerson = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, `../assets/img/trainer/${att.trainer[0]}.png`)}`)
    const defPerson = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, `../assets/img/trainer/${def.trainer[0]}.png`)}`)
    const attPokemon = await ctx.canvas.loadImage(`${config.图片源}/fusion/${att.monster_1.split('.')[0]}/${att.monster_1}.png`)
    const defPokemon = await ctx.canvas.loadImage(`${config.图片源}/fusion/${def.monster_1.split('.')[0]}/${def.monster_1}.png`)
    const backimage = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, `../assets/img/components/battle.png`)}`)
    let array = log.split('\n')
    let attCount: number
    let defCount: number
    if (array.length % 2 == 0) { attCount = array.length / 2; defCount = array.length / 2 - 1 } else { attCount = Math.floor(array.length / 2); defCount = Math.floor(array.length / 2) }
    let dataUrl: any
    await ctx.canvas.render(712, 750, async (ctx) => {
      ctx.drawImage(backimage, 0, 0, 712, 750)
      ctx.save()
      ctx.translate(712 / 2, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(attPerson, 202, 24, 130, 130)
      ctx.drawImage(attPokemon, 141, 83, 130, 130)
      ctx.restore()
      ctx.drawImage(defPerson, 558, 24, 130, 130)
      ctx.drawImage(defPokemon, 488, 83, 130, 130)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = 'normal 24px zpix'
      ctx.fillStyle = 'white'
      ctx.fillText(array[array.length - 1], 356, 722)
      ctx.fillStyle = 'black'
      for (let i = 0; i < array.length - 1; i++) {
        ctx.fillText(`⚔️${array[i]}⚔️`, 356, 300 + 60 * (i))
        if (i > 4) { break }
      }
      dataUrl = await ctx.canvas.toDataURL('image/jpeg')
    })
    return dataUrl
  } catch (e) {
    logger.info(e)
    return `渲染失败`
  }
}
export function findItem(item: string) {
  const matchedKey = shop.filter(key => key.name.includes(item))
  return matchedKey
}
export function getRandomName(length: number) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}
export function moveToFirst(array: any[], element: any) {
  const index = array.indexOf(element)
  if (index !== -1) {
    array.splice(index, 1)
    array.unshift(element)
  }
  return array
}
export async function toUrl(ctx, img) {
  if(ctx.get('server.temp')?.upload){
    const url = await ctx.get('server.temp').upload(img)
    return url.replace(/_/g, "%5F")
  }
  const { url } = await ctx.get('server.temp').create(img)
  return url
}

export function typeEffect(a:string,b:string,skillType:string){
  const [a1,a2] = getType(a)
  const [b1,b2] = getType(b)
  const effect  = battleType.data[skillType][b1]*battleType.data[skillType][b2]*([a1,a2].includes(skillType)?1.5:1)
return effect

}

export function isVip(a: Pokebattle):boolean {
  return a?.vip > 0
}

export function getType(a:string){
  try{const pokemon = a.split('.')
  const [p_f,p_m] = pokemon
  const type1 = type[Number(p_f)-1].type.split(':')[0]
  let type2 = type[Number(p_m)-1].type.split(':')[1]
  type2==''?type2= type[Number(p_m)-1].type.split(':')[0]:type2
  if (type1==type2){type2=''}
  return [type1,type2]
}catch(e){return ['','']}
}

export function catchbutton(a: string, b: string, c: string, d: string) {
  return {
    "rows": [
      {
        "buttons": [
          {
            "id": "1",
            "render_data": {
              "label": "🕹️捕捉" + a,
              "visited_label": "捕捉成功"
            },
            "action": {
              "type": 2,
              "permission": {
                "type": 0,
                "specify_user_ids": [d]
              },
              "click_limit": 10,
              "unsupport_tips": "请输入@Bot 1",
              "data": "1",
              "enter": true
            },

          }
        ]
      },
      {
        "buttons": [
          {
            "id": "2",
            "render_data": {
              "label": "🕹️捕捉" + b,
              "visited_label": "捕捉成功"
            },
            "action": {
              "type": 2,
              "permission": {
                "type": 0,
                "specify_user_ids": [d]
              },
              "click_limit": 10,
              "unsupport_tips": "请输入@Bot 2",
              "data": "2",
              "enter": true
            }
          }
        ]
      },
      {
        "buttons": [
          {
            "id": "3",
            "render_data": {
              "label": "🕹️捕捉" + c,
              "visited_label": "捕捉成功"
            },
            "action": {
              "type": 2,
              "permission": {
                "type": 0,
                "specify_user_ids": [d]
              },
              "click_limit": 10,
              "unsupport_tips": "请输入@Bot 3",
              "data": "3",
              "enter": true
            }
          }
        ]
      }
    ]
  }
}
export function button(pt: number, a: string, b: string, d: string, c: string, enter = true) {

  return {
    "id": c,
    "render_data": {
      "label": a,
      "visited_label": a
    },
    "action": {
      "type": 2,
      "permission": {
        "type": pt,
        "specify_user_ids": [d]
      },
      "click_limit": 10,
      "unsupport_tips": "请输入@Bot 1",
      "data": b,
      "enter": enter
    },
  }
}
export function urlbutton(pt: number, a: string, b: string, d: string, c: string,) {

  return {
    "id": c,
    "render_data": {
      "label": a,
      "visited_label": a,
      "style": 1
    },
    "action": {
      "type": 0,
      "permission": {
        "type": pt,
        "specify_user_ids": [d]
      },
      "click_limit": 10,
      "unsupport_tips": "请输入@Bot 1",
      "data": b
    },
  }
}
export function actionbutton(a: string, b: string, d: string, c: string, t: string, id: string) {
  return {
    "id": c,
    "render_data": {
      "label": a,
      "visited_label": `${a}-已选`
    },
    "action": {
      "type": 1,
      "permission": {
        "type": 0,
        "specify_user_ids": [d]
      },
      "click_limit": 10,
      "unsupport_tips": "请输入@Bot",
      "data": t + "=" + b + "=" + id,
    },
  }
}