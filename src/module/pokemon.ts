const exptolv = require('../ExpToLv.json')
const Base = require('../PokemonBase.json')
const skillMachine = require('../skillMachine.json')
export const using = ['database']
import { pathToFileURL } from 'url'
import { resolve } from 'path'
import { h } from "koishi"

const pokemonCal = {
  power(a: string[], b: number) {
    try {
      let c = ['0', '0', '0', '0', '0']
      for (let i = 0; i < a.length; i++) {
        if (i == 0) { c[i] = String(Math.floor((Number(a[i]) + 30 + 1.25) * b / 50 + 10 + b)) }
        c[i] = String(Math.floor((Number(a[i]) + 30 + 1.25) * b / 50 + 5))
      }
      return c
    } catch {
      return ['0', '0', '0', '0', '0']
    }
  },
  exp_bar(a: number, b: number) {
    let exp_bar = ['=', '=', '=', '=', '=', '=', '=', '=', '=', '=']
    let nowExp = b / exptolv.exp_lv[a].exp * 100
    exp_bar[Math.floor(nowExp / 10) - 1] = `✧${(nowExp.toFixed(1))}%✧`
    return exp_bar.join('')

  },
  pokeBase(a) {
    try {
      let poke = a.split('.')
      let pokeF = poke[0]
      let pokeM = poke[1]
      let BaseList
      if (pokeF == '150' && pokeM == '150') {
        return ['100', '100', '100', '100', '100']
      }
      if (pokeF !== pokeM) {
        BaseList = [
          String(Math.floor(Number(Base.Base[pokeF].hp) < Number(Base.Base[pokeM].hp) ? Number(Base.Base[pokeF].hp) * 0.2 + Number(Base.Base[pokeM].hp) * 0.8 : Number(Base.Base[pokeF].hp) * 0.8 + Number(Base.Base[pokeM].hp) * 0.2)),
          String(Math.floor(Number(Base.Base[pokeF].att) < Number(Base.Base[pokeM].att) ? Number(Base.Base[pokeF].att) * 0.2 + Number(Base.Base[pokeM].att) * 0.8 : Number(Base.Base[pokeF].att) * 0.8 + Number(Base.Base[pokeM].att) * 0.2)),
          String(Math.floor(Number(Base.Base[pokeF].def) < Number(Base.Base[pokeM].def) ? Number(Base.Base[pokeF].def) * 0.2 + Number(Base.Base[pokeM].def) * 0.8 : Number(Base.Base[pokeF].def) * 0.8 + Number(Base.Base[pokeM].def) * 0.2)),
          String(Math.floor(Number(Base.Base[pokeF].spec) < Number(Base.Base[pokeM].spec) ? Number(Base.Base[pokeF].spec) * 0.2 + Number(Base.Base[pokeM].spec) * 0.8 : Number(Base.Base[pokeF].spec) * 0.8 + Number(Base.Base[pokeM].spec) * 0.2)),
          String(Math.floor(Number(Base.Base[pokeF].spe) < Number(Base.Base[pokeM].spe) ? Number(Base.Base[pokeF].spe) * 0.2 + Number(Base.Base[pokeM].spe) * 0.8 : Number(Base.Base[pokeF].spe) * 0.8 + Number(Base.Base[pokeM].spe) * 0.2))]
      } else { BaseList = [String(Math.floor((Number(Base.Base[pokeF].hp) + Number(Base.Base[pokeM].hp)) * 0.4)), String((Math.floor(Number(Base.Base[pokeF].att) + Number(Base.Base[pokeM].att)) *0.4)), String(Math.floor((Number(Base.Base[pokeF].def) + Number(Base.Base[pokeM].def)) * 0.4)), String(Math.floor((Number(Base.Base[pokeF].spec) + Number(Base.Base[pokeM].spec)) * 0.4)), String(Math.floor((Number(Base.Base[pokeF].spe) + Number(Base.Base[pokeM].spe)) * 0.4))] }
      return BaseList
    } catch {
      return []
    }
  },
  //宝可梦列表
  pokemonlist(a) {
    try {
      let pokemonNow = a.split('.')
      let pokemon_a = Number(pokemonNow[0])
      let pokemon_b = Number(pokemonNow[1])
      if (pokemon_a != pokemon_b) {
        const y = ["0", "妙蛙", "妙蛙", "妙蛙", "小火", "火", "喷火", "杰尼", "卡咪", "水箭", "绿毛", "铁甲", "巴大", "独角", "铁壳", "大针", "波波", "比比", "大比", "拉达", "拉达", "烈", "尖嘴", "阿伯", "阿伯", "皮卡", "雷", "穿山", "穿山", "尼多", "尼多", "尼多", "尼多", "尼多", "尼多", "皮皮", "皮可", "狐面", "狐面", "粉红", "粉红", "超音", "大嘴", "曼德拉", "邋遢", "笑面", "派拉", "派拉斯", "复眼", "摩鲁", "豆眼", "豆眼", "喵", "喵", "可达", "哥达", "猴", "火爆", "卡蒂", "神速", "蚊香", "蚊香", "蚊香", "斜眼", "勇吉", "智慧", "强腕", "筋肉", "怪力", "喇叭", "惊呆", "巨口", "玛瑙", "毒刺", "拳石", "隆隆", "隆隆", "火焰", "烈焰", "呆", "呆壳", "磁铁", "磁铁", "鸭嘴", "嘟嘟", "嘟利", "海", "大海", "臭", "恶臭", "吐舌", "恶脸", "鬼面", "鬼面", "邪面", "大岩", "象鼻", "贼眼", "大钳", "巨钳", "霹雳", "顽皮", "破裂", "椰果", "卡拉", "嘎啦", "飞踢", "快拳", "大舌", "瓦斯", "瓦斯", "独角", "钻角", "吉利", "蔓藤", "育儿", "喷嘴", "深海", "独角", "海洋", "珍珠", "宝石", "魔墙", "飞天", "迷唇", "电击", "鸭嘴", "钳角", "肯泰", "鲤鱼", "暴", "拉普", "豆豆眼", "伊", "鱼鳍", "雷电", "火焰", "棱角", "菊石", "刺壳", "背甲", "镰刀", "化石", "卡比", "急冻", "闪电", "火焰", "迷你", "哈克", "肥大", "超", "梦"];
        const x = ["0", "蛙种子", "蛙草", "蛙花", "火龙", "恐龙", "火龙", "龟", "龟", "龟", "毛虫", "甲蛹", "蝶", "角虫", "昆蛹", "针蜂", "雀", "鸟", "雕", "鼠", "巨鼠", "雀", "雁", "蛇", "毒蛇", "丘", "丘", "兽", "鼠王", "兰", "娜", "王后", "朗", "力诺", "王", "皮皮", "可西", "六尾狐", "九尾狐", "气球", "丁", "蝠", "蝠", "草", "臭花", "霸王花", "蟹", "菇蟹", "球", "飞蛾", "地鼠", "地鼠", "喵", "喵豹", "鸭", "鸭", "怪球", "猴", "狗", "猎犬", "蝌蚪", "蛙", "泳蛙", "凯西", "波拉", "胡地", "腕力", "兄贵", "怪力", "豆芽", "豆炮", "豆笼", "水母", "水母", "拳石", "岩石", "岩怪", "火马", "烈马", "河马", "河马兽", "磁怪", "磁铁怪", "葱鸭", "双头鸟", "三头鸟", "海狮", "海狮", "泥浆", "泥巴", "贝", "刺贝", "瓦斯", "怨灵", "鬼", "岩蛇", "貘", "貘人", "蟹", "巨蟹", "电球", "雷弹", "蛋蛋", "椰树", "卡拉", "嘎啦", "郎", "郎", "舌头", "瓦斯", "瓦斯", "犀牛", "犀兽", "蛋", "怪", "袋兽", "海马", "海龙", "金鱼", "鱼王", "海星", "海星", "人偶", "螳螂", "姐", "兽", "火兽", "甲虫", "黄牛", "鱼王", "鲤龙", "贝龙", "水晶泥", "伊布", "伊布", "伊布", "伊布", "兽", "蜗牛", "贝壳兽", "甲虫", "盔虫", "翼龙", "巨兽", "鸟", "鸟", "鸟", "龙", "龙", "龙", "梦", "幻"]
        let name1 = x[pokemon_a]
        let name2 = y[pokemon_b]
        let name3 = name2 + name1
        return name3
      } else {
        const pokemonList = ["0", "妙蛙种子", "妙蛙草", "妙蛙花", "小火龙", "火恐龙", "喷火龙", "杰尼龟", "卡咪龟", "水箭龟", "绿毛虫", "铁甲蛹", "巴大蝶", "独角虫", "铁壳昆", "大针蜂", "波波", "比比鸟", "比雕", "小拉达", "拉达", "烈雀", "大嘴雀", "阿伯蛇", "阿伯怪", "皮卡丘", "雷丘", "穿山鼠", "穿山王", "尼多兰", "尼多娜", "尼多后", "尼多朗", "尼多力诺", "尼多王", "皮皮", "皮可西", "六尾", "九尾", "胖丁", "胖可丁", "超音蝠", "大嘴蝠", "走路草", "臭臭花", "霸王花", "派拉斯", "派拉斯特", "毛球", "摩鲁蛾", "地鼠", "三地鼠", "喵喵", "喵老大", "可达鸭", "哥达鸭", "猴怪", "火爆猴", "卡蒂狗", "风速狗", "蚊香蝌蚪", "蚊香蛙", "蚊香游士", "凯西", "勇吉拉", "胡地", "腕力", "豪力", "怪力", "喇叭芽", "口呆花", "大食花", "玛瑙水母", "毒刺水母", "小拳石", "隆隆石", "隆隆岩", "小火马", "烈焰马", "呆呆兽", "呆壳兽", "小磁怪", "三合一磁怪", "大葱鸭", "嘟嘟", "嘟嘟利", "小海狮", "白海狮", "臭泥", "臭臭泥", "大舌贝", "刺甲贝", "鬼斯", "鬼斯通", "耿鬼", "大岩蛇", "催眠貘", "引梦貘人", "大钳蟹", "巨钳蟹", "霹雳电球", "顽皮雷弹", "蛋蛋", "椰蛋树", "卡拉卡拉", "嘎啦嘎啦", "飞腿郎", "快拳郎", "大舌头", "瓦斯弹", "双弹瓦斯", "独角犀牛", "钻角犀兽", "吉利蛋", "蔓藤怪", "袋兽", "墨海马", "刺海龙", "角金鱼", "金鱼王", "海星星", "宝石海星", "魔墙人偶", "飞天螳螂", "迷唇姐", "电击兽", "鸭嘴火兽", "凯罗斯", "肯泰罗", "鲤鱼王", "暴鲤龙", "拉普拉斯", "百变怪", "伊布", "水伊布", "雷伊布", "火伊布", "多边兽", "菊石兽", "多刺菊石兽", "化石盔", "镰刀盔", "化石翼龙", "卡比兽", "急冻鸟", "闪电鸟", "火焰鸟", "迷你龙", "哈克龙", "快龙", "超梦", "梦幻"]
        return pokemonList[pokemon_a]
      }
    } catch {
      return '空精灵球'
    }
  },
  pokemonzajiao(a: string, b: string) {
    try {
      let pokemon_a = Number(a.split('.')[0])
      let pokemon_b = Number(b.split('.')[1])
      const y = ["0", "妙蛙", "妙蛙", "妙蛙", "小火", "火", "喷火", "杰尼", "卡咪", "水箭", "绿毛", "铁甲", "巴大", "独角", "铁壳", "大针", "波波", "比比", "大比", "拉达", "拉达", "烈", "尖嘴", "阿伯", "阿伯", "皮卡", "雷", "穿山", "穿山", "尼多", "尼多", "尼多", "尼多", "尼多", "尼多", "皮皮", "皮可", "狐面", "狐面", "粉红", "粉红", "超音", "大嘴", "曼德拉", "邋遢", "笑面", "派拉", "派拉斯", "复眼", "摩鲁", "豆眼", "豆眼", "喵", "喵", "可达", "哥达", "猴", "火爆", "卡蒂", "神速", "蚊香", "蚊香", "蚊香", "斜眼", "勇吉", "智慧", "强腕", "筋肉", "怪力", "喇叭", "惊呆", "巨口", "玛瑙", "毒刺", "拳石", "隆隆", "隆隆", "火焰", "烈焰", "呆", "呆壳", "磁铁", "磁铁", "鸭嘴", "嘟嘟", "嘟利", "海", "大海", "臭", "恶臭", "吐舌", "恶脸", "鬼面", "鬼面", "邪面", "大岩", "象鼻", "贼眼", "大钳", "巨钳", "霹雳", "顽皮", "破裂", "椰果", "卡拉", "嘎啦", "飞踢", "快拳", "大舌", "瓦斯", "瓦斯", "独角", "钻角", "吉利", "蔓藤", "育儿", "喷嘴", "深海", "独角", "海洋", "珍珠", "宝石", "魔墙", "飞天", "迷唇", "电击", "鸭嘴", "钳角", "肯泰", "鲤鱼", "暴", "拉普", "豆豆眼", "伊", "鱼鳍", "雷电", "火焰", "棱角", "菊石", "刺壳", "背甲", "镰刀", "化石", "卡比", "急冻", "闪电", "火焰", "迷你", "哈克", "肥大", "超", "梦"];
      const x = ["0", "蛙种子", "蛙草", "蛙花", "火龙", "恐龙", "火龙", "龟", "龟", "龟", "毛虫", "甲蛹", "蝶", "角虫", "昆蛹", "针蜂", "雀", "鸟", "雕", "鼠", "巨鼠", "雀", "雁", "蛇", "毒蛇", "丘", "丘", "兽", "鼠王", "兰", "娜", "王后", "朗", "力诺", "王", "皮皮", "可西", "六尾狐", "九尾狐", "气球", "丁", "蝠", "蝠", "草", "臭花", "霸王花", "蟹", "菇蟹", "球", "飞蛾", "地鼠", "地鼠", "喵", "喵豹", "鸭", "鸭", "怪球", "猴", "狗", "猎犬", "蝌蚪", "蛙", "泳蛙", "凯西", "波拉", "胡地", "腕力", "兄贵", "怪力", "豆芽", "豆炮", "豆笼", "水母", "水母", "拳石", "岩石", "岩怪", "火马", "烈马", "河马", "河马兽", "磁怪", "磁铁怪", "葱鸭", "双头鸟", "三头鸟", "海狮", "海狮", "泥浆", "泥巴", "贝", "刺贝", "瓦斯", "怨灵", "鬼", "岩蛇", "貘", "貘人", "蟹", "巨蟹", "电球", "雷弹", "蛋蛋", "椰树", "卡拉", "嘎啦", "郎", "郎", "舌头", "瓦斯", "瓦斯", "犀牛", "犀兽", "蛋", "怪", "袋兽", "海马", "海龙", "金鱼", "鱼王", "海星", "海星", "人偶", "螳螂", "姐", "兽", "火兽", "甲虫", "黄牛", "鱼王", "鲤龙", "贝龙", "水晶泥", "伊布", "伊布", "伊布", "伊布", "兽", "蜗牛", "贝壳兽", "甲虫", "盔虫", "翼龙", "巨兽", "鸟", "鸟", "鸟", "龙", "龙", "龙", "梦", "幻"]
      let name3 = y[pokemon_b] + x[pokemon_a]
      let dan = pokemon_a + '.' + pokemon_b
      return [name3, dan]
    } catch {
      return 0
    }
  },
  //随机数
  mathRandomInt(a: number, b: number) {
    if (a > b) {
      var c = a;
      a = b;
      b = c;
    }
    return Math.floor(Math.random() * (b - a + 1) + a);
  },
  //等级计算
  expCal(a: number, b: number) {
    let lv = a
    let exp = b
    let lvup = exp / exptolv.exp_lv[lv].exp
    if (lvup > 1) {
      exp = exp - exptolv.exp_lv[lv].exp
      lv = lv + Math.floor(lvup)
    } else {
      lv = a
      exp = b
    }
    return [lv, exp]
  },
  pokemomPic(a: string, b: boolean) {
    try {
      let pokemonNow = a.split('.')
      let pokemon_a = Number(pokemonNow[0])
      let pokemon_b = Number(pokemonNow[1])

      if (b) { return h.image(pathToFileURL(resolve('./image', pokemon_a + '.' + pokemon_b + '.png')).href) } else {
        return h.image(pathToFileURL(resolve('./image', pokemon_a + '.png')).href)
      }



    } catch {
      return `出错啦`
    }
  },  
  pokebattle(a, b) {
    try {
      let log = []
      let winner
      let loser
      const attack = (att, def) => {
        let damage = Math.floor(((2 * att[0].level + 10) / 250 * Number(att[0].power[1]) / (Number(def[0].power[3]) + Number(def[0].power[2])) * skillMachine.skill[Number(att[0].skill)].Dam + 2) * (Number(att[0].power[3]) / Number(def[0].power[2] * 2.4) + (Math.random() * (0.75 - 0.65 + 1) + 0.65)))
        def[0].power[0] = def[0].power[0] - damage
        if (def[0].power[0] <= 0) { def[0].power[0] = 0 } else if (att[0].power[0] <= 0) { att[0].power[0] = 0 }
        log.push(`${att[0].battlename}的 [${skillMachine.skill[Number(att[0].skill)].skill}]，造成 ${Math.floor(damage)} 伤害,${def[0].battlename}剩余${Math.floor(def[0].power[0])}HP`)
      }
      let first, second
      if (a[0].power[4] >= b[0].power[4]) {
        first = a
        second = b
      } else {
        first = b
        second = a
      }
      while (a[0].power[0] > 0 && b[0].power[0] > 0) {
        attack(first, second)
        if (second[0].power[0] <= 0) {
          log.push(`${first[0].battlename} 胜利了`)
          break
        }
        attack(second, first)
        if (first[0].power[0] <= 0) {
          log.push(`${second[0].battlename} 胜利了`)
          break
        }
      }
      if (first[0].power[0] > 0) { winner = { id: first[0].id }; loser = { id: second[0].id } } else { winner = { id: second[0].id }; loser = { id: first[0].id } }
      return [log.join('\n'), winner.id, loser.id]
    } catch
    {
      return `战斗出现意外了`
    }
  },
  pokemonskill(a: number) {
    const b = 100 - a
    if (Math.random() < 0.1 * Math.floor(b / 10)) {
      return Math.floor(Math.random() * 41)
    } else return Math.floor(Math.random() * (98 - 41 + 1)) + 41
  },
  skillbag(a: string[]) {
    let skill = []
    let skillbag
    for (let i = 0; i < a.length; i++) {
      skill.push(skillMachine.skill[Number(a[i])].skill)
      if ((i + 1) % 5 === 0 && i !== 0) {
        skill.splice(i, 1, skill[i] + '💿\n')
      } else {
        skill.splice(i, 1, skill[i] + '💿')
      }
    }
    return skillbag = skill.join('')
  },
  findskillId(a: string) {
    let findone = skillMachine.skill.find((skill) => {
      return skill.skill === a
    })
    return findone.id ? findone.id : 0
  },
  skillinfo(a: string[]) {
    let skill = []
    for (let i = 0; i < a.length; i++) {
      skill[i] = a[i]
    }
    skill.sort((a, b) => { return Number(b) - Number(a) })
    return `你的技能背包中，最高威力的3个技能是
${skillMachine.skill[skill[0]].skill}:${skillMachine.skill[skill[0]].Dam}
${skillMachine.skill[skill[1]].skill}:${skillMachine.skill[skill[1]].Dam}
${skillMachine.skill[skill[2]].skill}:${skillMachine.skill[skill[2]].Dam}
`
  }
}


export default pokemonCal
