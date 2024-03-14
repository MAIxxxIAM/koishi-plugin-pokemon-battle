import { resolve } from "path"
import { pokemonUrl, testcanvas } from ".."
import pokemonCal from "../utils/pokemon"


export interface IPokeGuess {
    options: string[]
    which: number
}

export class PokeGuess implements IPokeGuess {
    options: string[]
    name: string[]
    which: number
    constructor() {
        let n = []
        let m=[]
        while (n.length < 4) {
            const randomNumber = Math.floor(Math.random() * 251) + 1;
            const randomPokemon = randomNumber + '.' + randomNumber
            if (n.indexOf(randomPokemon) === -1) {
                n.push(randomPokemon);
                m.push(pokemonCal.pokemonlist(randomPokemon))
            }
        }
        const randomIndex = Math.floor(Math.random() * 4)
        this.which = randomIndex
        this.name = m
        this.options = n
    }
    async q(ctx) {
        const { options, which } = this
        const qImage = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, '../assets/img/components', 'q.png')}`)
        const pokeImage = await ctx.canvas.loadImage(`${pokemonUrl}/fusion/${options[which].split('.')[0]}/${options[which].split('.')[0]}.png`)
        const ImageBlack = await ctx.canvas.render(110, 110, (ctx) => {
            ctx.drawImage(pokeImage, 0, 0, 110, 110)
            ctx.globalCompositeOperation = 'source-atop'
            ctx.fillStyle = 'black'
            ctx.fillRect(0, 0, 458, 331)
        })
        const imageBlack=await ctx.canvas.loadImage(ImageBlack.attrs.src)
        const Image = await ctx.canvas.render(458, 331, (ctx) => {
            ctx.drawImage(qImage, 0, 0, 458, 331)
            ctx.drawImage(imageBlack, 50,70, 110, 110)
        })
        const { src } = Image.attrs
        return src
    }
    async a(ctx) {
        const { options, which } = this
        const aImage = await ctx.canvas.loadImage(`${testcanvas}${resolve(__dirname, '../assets/img/components', 'a.png')}`)
        const pokeImage = await ctx.canvas.loadImage(`${pokemonUrl}/fusion/${options[which].split('.')[0]}/${options[which].split('.')[0]}.png`)
        const Image = await ctx.canvas.render(458, 331, (ctx) => {
            ctx.drawImage(aImage, 0, 0, 458, 331)
            ctx.drawImage(pokeImage, 50, 70, 110, 110)
        })
        const { src } = Image.attrs
        return src
    }
}