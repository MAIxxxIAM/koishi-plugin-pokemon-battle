import { Context } from "koishi"
import { Pokebattle, config, pokemonUrl, testcanvas } from ".."
import { resolve } from "path"
import pokemonCal from "../utils/pokemon"
import { button, toUrl } from "../utils/mothed"

export class Pokedex {
    dex: number[][]
    constructor(player: Pokebattle) {
        this.dex = [[]]
        if(!player.pokedex?.dex){
            for (let i in player.AllMonster) {
            const pokemon = player.AllMonster[i].split('.')[0]
            if (this.dex[0].includes(parseInt(pokemon))) {
                continue
            }
            this.dex[0].push(parseInt(pokemon))
            this.dex[0].sort((a, b) => a - b)

        }
        return}
        this.dex = player.pokedex.dex
    }
    pull(pokemon: string, player: Pokebattle) {
        const id = parseInt(pokemon.split('.')[0])
        if(this.dex[this.dex.length-1].length>=15){
            this.dex.push([])
        }
        this.dex[this.dex.length-1].push(id)
        const flatArray = [].concat(...this.dex)
        flatArray.sort((a, b) => a - b)
        let a =[]
        for (let i = 0; i < flatArray.length; i+=15) {
            a.push(flatArray.slice(i, i + 15))
        }
        this.dex = a
    player.pokedex.dex=this.dex
}
    check(pokemon: string) {
        for (let box in this.dex){
            if (this.dex[box].includes(parseInt(pokemon.split('.')[0]))) {
                return true
            }
        }
        return false
    }
}

export async function apply(ctx){

    ctx.command('宝可梦').subcommand('查看图鉴 [page:number]').action(async ({ session },page:number) => {
        const players:Pokebattle[] = await ctx.database.get('pokebattle',{id:session.userId})
        page? page=page:page=1
        if(players.length === 0){
            await session.execute('宝可梦签到')
            return
         }
        const player:Pokebattle = players[0]
        if(!player.pokedex?.dex){
            const pokedex = new Pokedex(player)
            player.pokedex = pokedex
            await ctx.database.upsert('pokebattle',[player])
        }
        if (!player.pokedex?.dex?.[page-1]){
            return `第${page}页空无一物`
        }
        let dexImage=[]
            for (let pokemon in player.pokedex.dex[page-1]){
                dexImage.push(await ctx.canvas.loadImage(`${pokemonUrl}/sr/${player.pokedex.dex[page-1][pokemon]}.png`))
            }
        const boxImage = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, `../assets/img/components/box.png`)}`)
        const pokeDexImage =await ctx.canvas.render(324,296,async (ctx)=>{
            ctx.drawImage(boxImage,0,0,324,296)
            for (let i=0;i<dexImage.length;i++){
                ctx.drawImage(dexImage[i],(i%5)*60+12,Math.floor(i/5)*74+50,60,60)
                ctx.font = 'normal 12px zpix'
                ctx.fillStyle = 'white'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                const pokemonId = player.pokedex.dex[page-1][i]
                ctx.fillText(pokemonCal.pokemonlist(`${pokemonId}.${pokemonId}`),(i%5)*60+42,Math.floor(i/5)*74+117)
                ctx.fillText(pokemonId,(i%5)*60+42,Math.floor(i/5)*74+129)
            }
            ctx.font = 'normal 15px zpix'
            ctx.fillStyle = 'black'
            ctx.fillText(`第 ${page} 页`,48,25)
            ctx.fillStyle = 'white'
            ctx.fillText(player.name,210,25)

        })
        try{
            const { src } = pokeDexImage.attrs
            await session.bot.internal.sendMessage(session.channelId,{
                content: "111",
              msg_type: 2,
              markdown: {
                custom_template_id: config.MDid,
                params: [
                  {
                    key: config.key1,
                    values: [`<@${session.userId}>的图鉴`]
                  },
                  {
                    key: config.key2,
                    values: ["[img#324px #296px]"]
                  },
                  {
                    key: config.key3,
                    values: [await toUrl(ctx, src)]
                  }
                ]
              },
              keyboard: {
                content: {
                  "rows": [
                    {"buttons":[button(2,'📖 我的图鉴','/查看图鉴',session.userId,'cmd'),button(2, "🖊签到", "/签到", session.userId, "1"),button(2, "💳信息", "/查看信息", session.userId, "1")]},
                    player.pokedex.dex.length<2?{"buttons":[button(0, "下一页", `/查看图鉴 ${page+1}`, session.userId, "cmd2")]}:{"buttons":[button(0, "上一页", `/查看图鉴 ${page-1}`, session.userId, "cmd1"),button(0, "下一页", `/查看图鉴 ${page+1}`, session.userId, "cmd2")]}
                  ]
                },
              },
              msg_id: session.messageId,
              timestamp: session.timestamp,
              msg_seq: Math.floor(Math.random() * 10000)
            })
        }catch(e){
            return pokeDexImage
        }
    })

}