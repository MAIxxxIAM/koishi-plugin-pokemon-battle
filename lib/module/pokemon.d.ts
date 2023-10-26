export declare const using: string[];
import { h } from "koishi";
declare const pokemonCal: {
    power(a: string[], b: number): string[];
    exp_bar(a: number, b: number): string;
    pokeBase(a: any): any;
    pokemonproperties(a: string[], c: any): {
        backgroundColor: string;
        tooltip: {};
        legend: {
            bottom: string;
            data: string[];
            textStyle: {
                fontSize: number;
            };
        };
        radar: {
            name: {
                textStyle: {
                    fontSize: number;
                };
            };
            indicator: {
                text: string;
                max: number;
                color: string;
            }[];
            radius: number;
            center: string[];
        }[];
        series: {
            symbol: string;
            type: string;
            tooltip: {
                trigger: string;
            };
            areaStyle: {};
            data: {
                value: number[];
                name: string;
            }[];
        }[];
    };
    pokemonlist(a: any): string;
    pokemonzajiao(a: string, b: string): string[] | 0;
    mathRandomInt(a: number, b: number): number;
    expCal(a: number, b: number): number[];
    pokemomPic(a: string, b: boolean): h | "出错啦";
    pokebattle(a: any, b: any): any[] | "战斗出现意外了";
    pokemonskill(a: number): number;
    skillbag(a: string[]): string;
    findskillId(a: string): any;
};
export default pokemonCal;
