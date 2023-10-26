import { Schema } from 'koishi';
export declare const name = "pokemon-battle";
export declare const using: string[];
export declare const usage = "### 10.20 \u65B0\u589E\u529F\u80FD\n- \u66F4\u660E\u663E\u7684\u7ECF\u9A8C\u6761\u663E\u793A\n- \u653E\u751F\u83B7\u5F97\u7ECF\u9A8C\n- \u6307\u4EE4\u56DE\u590D\u66F4\u5408\u7406\u7684\u4EA7\u751F\u8054\u52A8\n- \u3010\u5C5E\u6027\u3011\u6307\u4EE4\u7684\u96F7\u8FBE\u56FE\u6837\u5F0F\n### 10.21 \n- \u56FE\u7247\u7531\u7F51\u7EDCapi\u66F4\u6539\u81F3\u672C\u5730\uFF0C\u73B0\u5728\u9891\u9053\u4E5F\u80FD\u770B\u89C1\u6742\u4EA4\u7684\u5B9D\u53EF\u68A6\u4E86\n- \u76F8\u540C\u5B9D\u53EF\u68A6\u53EF\u4EE5\u6742\u4EA4\u4E86\n\n### 10.22\n- \u56FE\u5305\u7531\u6574\u5408\u5728\u63D2\u4EF6\u5185\u6539\u4E3A\u89E3\u538B\u56FE\u5305\u6587\u4EF6\uFF0C\u542F\u7528\u63D2\u4EF6\u540E\uFF0C\u6839\u636E\u65E5\u5FD7\u63D0\u793A\u89E3\u538B\u6587\u4EF6\u3002\uFF08\u63A8\u8350\u624B\u52A8\u89E3\u538B\uFF0C\u7531\u4E8E\u6570\u91CF\u8FC7\u591A\uFF0C\u6307\u4EE4\u89E3\u538B\u4F1A\u5F88\u6162\uFF09\n\n### 10.23\n- \u4FEE\u590D\u4E86\u4E00\u4E9Bbug\n- \u66F4\u65B0\u4E86\u5BF9\u6218\u529F\u80FD\u3010\u5BF9\u6218 @\u5BF9\u624B\u3011\n- \u589E\u52A0\u4E86\u6280\u80FD\u62BD\u5956\u673A\u3010\u6280\u80FD\u626D\u86CB\u673A\u3011\n- \u589E\u52A0\u4E86\u6280\u80FD\u80CC\u5305\u3010\u6280\u80FD\u80CC\u5305\u3011\n- \u589E\u52A0\u4E86\u6280\u80FD\u673A\u4F7F\u7528\u6307\u4EE4\u3010\u88C5\u5907\u6280\u80FD <\u6280\u80FD\u540D\u5B57>\u3011\n- \u53EF\u80FD\u4F1A\u51FA\u73B0\u4E00\u4E0B\u65E0\u6CD5\u9884\u6599\u7684bug\uFF08\u539F\u8C05\u6211\u7684\u5C4E\u5C71\u4EE3\u7801\n";
export interface Config {
    签到指令别名: string;
    捕捉指令别名: string;
    杂交指令别名: string;
    查看信息指令别名: string;
    放生指令别名: string;
    签到获得个数: number;
}
export declare const Config: Schema<Schemastery.ObjectS<{
    readonly 签到获得个数: Schema<number, number>;
}> | Schemastery.ObjectS<{
    readonly 签到指令别名: Schema<string, string>;
    readonly 捕捉指令别名: Schema<string, string>;
    readonly 杂交指令别名: Schema<string, string>;
    readonly 查看信息指令别名: Schema<string, string>;
    readonly 放生指令别名: Schema<string, string>;
}>, {
    readonly 签到获得个数: number;
} & import("cosmokit").Dict & {
    readonly 签到指令别名: string;
    readonly 捕捉指令别名: string;
    readonly 杂交指令别名: string;
    readonly 查看信息指令别名: string;
    readonly 放生指令别名: string;
}>;
declare module 'koishi' {
    interface Tables {
        pokebattle: Pokebattle;
    }
}
export interface Pokebattle {
    id: String;
    date: Number;
    captureTimes: Number;
    level: Number;
    exp: Number;
    monster_1: String;
    battlename: String;
    AllMonster: string[];
    base: string[];
    power: string[];
    skill: Number;
    coin: Number;
    gold: Number;
    skillbag: string[];
}
export declare function apply(ctx: any, config: Config): Promise<void>;
