import { Schema } from 'koishi';
export declare const name = "pokemon-battle";
export declare const inject: {
    required: string[];
    optional: string[];
};
export declare const usage = "\n### 11.1\n- \u4FEE\u590D\u4E86\u4E00\u4E9Bbug\n- \u63D0\u9AD8\u4E86\u5BF9\u6218\u4EE3\u4EF7\n- \u589E\u52A0\u4E86\u7BA1\u7406\u5458\uFF0C\u9632\u6B62\u89E3\u5305\u6307\u4EE4\u89E6\u53D1\n\n### 11.3\n- \u589E\u52A0\u4E86\u63D2\u4EF6\u91CD\u8F7D\u63D0\u793A\n- \u524A\u5F31\u795E\u517D\u6742\u4EA4\n- \u4FEE\u590D\u63D2\u4EF6\u91CD\u542F\u540EsetTimeOut\u5931\u6548\u7684bug\n\n### 11.5\n- \u5206\u79BB\u4E86\u4F20\u8BF4\u5B9D\u53EF\u68A6\u548C\u666E\u901A\u5B9D\u53EF\u68A6\n- \u589E\u52A0\u4E86\u4F20\u8BF4\u5B9D\u53EF\u68A6\u80CC\u5305\n\n### 11.8\n- \u6DFB\u52A0\u4E86\u6E32\u67D3\u56FE\u7247\u9009\u9879\n- \u4FEE\u590D\u4E86\u4E00\u4E9Bbug\n\n### 11.9\n- \u4F18\u5316\u56FE\u7247\u5E03\u5C40\u548C\u5C3A\u5BF8\n\n### 11.12\n- \u589E\u52A0\u4E86\u5546\u5E97\n- \u589E\u52A0\u4E86\u8BAD\u7EC3\u5E08\u6A21\u578B\u548C\u62BD\u5956\n\n### 11.17\n- \u589E\u52A0\u4E86\u968F\u673A\u5BF9\u6218\n\n### 11.21\n- \u5220\u9664\u96F7\u8FBE\u56FE\u529F\u80FD\u8F6C\u4E3A\u6587\u5B57\u663E\u793A\n- \u7B7E\u5230\u6539\u4E3A\u6027\u80FD\u66F4\u597D\u7684canvas\u6E32\u67D3\n- \u6DFB\u52A0\u7B7E\u5230\u56FE\u7247\n\n### Todo\n- \u4F20\u8BF4\u4E2D\u7684\u5B9D\u53EF\u68A6\u6536\u96C6\u5EA6\n";
export interface Config {
    管理员: string;
    签到指令别名: string;
    捕捉指令别名: string;
    杂交指令别名: string;
    查看信息指令别名: string;
    放生指令别名: string;
    签到获得个数: number;
    战斗详情是否渲染图片: boolean;
    是否关闭战斗详情: boolean;
    精灵球定价: number;
    训练师定价: number;
    扭蛋币定价: number;
}
export declare const Config: Schema<Schemastery.ObjectS<{
    readonly 签到获得个数: Schema<number, number>;
}> | Schemastery.ObjectS<{
    readonly 签到指令别名: Schema<string, string>;
    readonly 捕捉指令别名: Schema<string, string>;
    readonly 杂交指令别名: Schema<string, string>;
    readonly 查看信息指令别名: Schema<string, string>;
    readonly 放生指令别名: Schema<string, string>;
    readonly 管理员: Schema<string, string>;
    readonly 战斗详情是否渲染图片: Schema<boolean, boolean>;
    readonly 是否关闭战斗详情: Schema<boolean, boolean>;
    readonly 精灵球定价: Schema<number, number>;
    readonly 训练师定价: Schema<number, number>;
    readonly 扭蛋币定价: Schema<number, number>;
}>, {
    readonly 签到获得个数: number;
} & import("cosmokit").Dict & {
    readonly 签到指令别名: string;
    readonly 捕捉指令别名: string;
    readonly 杂交指令别名: string;
    readonly 查看信息指令别名: string;
    readonly 放生指令别名: string;
    readonly 管理员: string;
    readonly 战斗详情是否渲染图片: boolean;
    readonly 是否关闭战斗详情: boolean;
    readonly 精灵球定价: number;
    readonly 训练师定价: number;
    readonly 扭蛋币定价: number;
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
    battleTimes: Number;
    level: Number;
    exp: Number;
    monster_1: String;
    battlename: String;
    AllMonster: string[];
    ultramonster: string[];
    base: string[];
    power: string[];
    skill: Number;
    coin: Number;
    gold: Number;
    skillbag: string[];
    trainer: string[];
    trainerNum: Number;
    trainerName: string[];
}
export declare function apply(ctx: any, config: Config): Promise<void>;
