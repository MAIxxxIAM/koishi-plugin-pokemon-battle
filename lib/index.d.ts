import { Schema } from 'koishi';
export declare const name = "pokemon-battle";
export declare const inject: {
    required: string[];
    optional: string[];
};
export declare const usage = "\n<a class=\"el-button\" target=\"_blank\" href=\"http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=bFdYGdp562abZWTmbHPAEw52aQq_fWqu&authKey=TPF8n37idd8paD0YfQJhpEax9PKe9sRPUk5GToIMr6%2Fs5I3v4ycBmT4k%2FGch0z8S&noverify=0&group_code=709239435\"><b>\u52A0\u5165\u5B9D\u53EF\u68A6\u878D\u5408\u7814\u7A76\u57FA\u91D1\u4F1A  </b></a>\n\n[\u5B9D\u53EF\u68A6\u878D\u5408\u7814\u7A76\u57FA\u91D1\u4F1A\u7FA4\u53F7\uFF1A709239435](http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=bFdYGdp562abZWTmbHPAEw52aQq_fWqu&authKey=TPF8n37idd8paD0YfQJhpEax9PKe9sRPUk5GToIMr6%2Fs5I3v4ycBmT4k%2FGch0z8S&noverify=0&group_code=709239435)\n\n### 11.22\n- \u9002\u914D\u4E86\u5B98\u65B9QQ\u7FA4\u673A\u5668\u4EBA\u56FE\u6587\u6392\u7248\n\n### 11.25\n- \u4FEE\u590D\u4E86\u4E0B\u8F7D\u56FE\u5305\u662F\u4EFB\u52A1\u540D\u51B2\u7A81\u5BFC\u81F4path\u9519\u8BEF\n- \u66F4\u65B0\u4E86\u67E5\u770B\u4FE1\u606F\u6307\u4EE4\u56DE\u590D\n- \u66F4\u65B0\u4E86\u6355\u6349\u5B9D\u53EF\u68A6\u56FE\u7247\n\n### 11.26\n- \u4FEE\u6B63\u4E86\u7ECF\u9A8C\u83B7\u53D6\u7B97\u6CD5\n- \u5EFA\u4E86\u4E2A\u7FA4\uFF0C\u90FD\u52A0\u52A0\n\n### 11.29\n- \u66F4\u65B0\u4E86\u56FE\u7247\u89E3\u5305\u65B9\u6CD5\uFF0C\u53EF\u4EE5\u4F7F\u7528\u6307\u4EE4\u89E3\u5305\u4E86\n\n### 11.30\n- \u8C03\u6574\u4E86\u5BF9\u6218\u6B21\u6570\u903B\u8F91\uFF0C\u4FDD\u8BC1\u4E86\u6BCF\u5C0F\u65F6\u6062\u590D1\u6B21\n\n### Todo\n- \u4F20\u8BF4\u4E2D\u7684\u5B9D\u53EF\u68A6\u6536\u96C6\u5EA6\n";
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
    canvas图片品质: number;
    对战图片品质: number;
    对战cd: number;
    对战次数: number;
}
export declare const Config: Schema<Schemastery.ObjectS<{
    readonly 签到获得个数: Schema<number, number>;
    readonly 精灵球定价: Schema<number, number>;
    readonly 训练师定价: Schema<number, number>;
    readonly 扭蛋币定价: Schema<number, number>;
    readonly 对战cd: Schema<number, number>;
    readonly 对战次数: Schema<number, number>;
}> | Schemastery.ObjectS<{
    readonly 签到指令别名: Schema<string, string>;
    readonly 捕捉指令别名: Schema<string, string>;
    readonly 杂交指令别名: Schema<string, string>;
    readonly 查看信息指令别名: Schema<string, string>;
    readonly 放生指令别名: Schema<string, string>;
    readonly 管理员: Schema<string, string>;
    readonly 战斗详情是否渲染图片: Schema<boolean, boolean>;
    readonly 是否关闭战斗详情: Schema<boolean, boolean>;
    readonly canvas图片品质: Schema<number, number>;
    readonly 对战图片品质: Schema<number, number>;
}>, {
    readonly 签到获得个数: number;
    readonly 精灵球定价: number;
    readonly 训练师定价: number;
    readonly 扭蛋币定价: number;
    readonly 对战cd: number;
    readonly 对战次数: number;
} & import("cosmokit").Dict & {
    readonly 签到指令别名: string;
    readonly 捕捉指令别名: string;
    readonly 杂交指令别名: string;
    readonly 查看信息指令别名: string;
    readonly 放生指令别名: string;
    readonly 管理员: string;
    readonly 战斗详情是否渲染图片: boolean;
    readonly 是否关闭战斗详情: boolean;
    readonly canvas图片品质: number;
    readonly 对战图片品质: number;
}>;
declare module 'koishi' {
    interface Tables {
        pokebattle: Pokebattle;
    }
}
export interface Pokebattle {
    id: String;
    name: String;
    date: Number;
    captureTimes: Number;
    battleTimes: Number;
    battleToTrainer: Number;
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
    battlecd: Date;
    relex: Date;
}
export declare function apply(ctx: any, config: Config): Promise<void>;
