import { Context } from "koishi";
import { config } from "..";
import { button, urlbutton } from "../utils/mothed";




export async function apply(ctx: Context) {
    ctx.command('宝可梦').subcommand('notice', '宝可梦公告').action(async () => {
        const notice = config.gameNotice
        const text = `当前版本公告：
${notice}`
        return text
    })

    ctx.command('宝可梦').subcommand('notice', '宝可梦公告').subcommand('nset <notices:string>', '设置宝可梦公告', { authority: 4 }).action(async ({ session }, notices: string) => {
        const nowDay = new Date().toLocaleDateString()
        const notice = "📅" + nowDay + '\n' + notices + "\n"
        config.gameNotice += notice
        return '设置成功'
    })
    ctx.command('宝可梦').subcommand('vip查询', '查看vip剩余天数').action(async ({ session }) => {
        const { userId, channelId } = session
        const users = await ctx.database.get('pokebattle', { id: userId })
        if (users.length === 0) {
            await session.execute('宝可梦签到')
            try {
                await session.bot.internal.sendMessage(channelId, {
                    content: "111",
                    msg_type: 2,
                    keyboard: { content: { "rows": [{ "buttons": [urlbutton(2, "点击捐赠，获得💎VIP", config.aifadian, session.userId, "VIP"), button(2, '兑换', '/使用', session.userId, "兑换", false)] },] }, },
                })
                return
            } catch (e) {
                return
            }
        }
        const user = users[0]
        try {
            await session.bot.internal.sendMessage(channelId, {
                content: "111",
                msg_type: 2,
                markdown: {
                    custom_template_id: config.文字MDid,
                    params: [
                      {
                        key: config.key4,
                        values: [`\r\r# \t💎VIP<@${session.userId}>`]
                      },
                      {
                        key: config.key5,
                        values: ["当前VIP剩余天数："]
                      },
                      {
                        key: config.key6,
                        values: [user.vip + "天"]
                      },
                    ]
                  },
                keyboard: { content: { "rows": [{ "buttons": [urlbutton(2, "点击捐赠，获得💎VIP", config.aifadian, session.userId, "VIP"),], },{"buttons":[ button(2, '兑换', '/使用', session.userId, "兑换", false)]}] }, },
                msg_id: session.messageId,
                timestamp: session.timestamp,
            })
            return
        } catch (e) {
            return `剩余vip天数：${user.vip}`
        }

    })
}