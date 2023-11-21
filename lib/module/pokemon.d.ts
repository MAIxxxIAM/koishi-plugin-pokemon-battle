export declare const using: string[];
import { h } from "koishi";
declare const pokemonCal: {
    power(a: string[], b: number): string[];
    exp_bar(a: number, b: number): string;
    pokeBase(a: any): any;
    pokemonlist(a: any): string;
    pokemonzajiao(a: string, b: string): string[] | 0;
    mathRandomInt(a: number, b: number): number;
    expCal(a: number, b: number): number[];
    pokemomPic(a: string, b: boolean): h | "出错啦";
    pokebattle(a: any, b: any): any[] | "战斗出现意外了";
    pokemonskill(a: number): number;
    skillbag(a: string[]): string;
    findskillId(a: string): any;
    skillinfo(a: string[]): string;
};
export default pokemonCal;
