import type { EvidenceId, EvidenceLinkDefinition, EvidenceLinkId } from './types'

export const REQUIRED_EVIDENCE_LINKS = 2

export const EVIDENCE_LINKS: readonly EvidenceLinkDefinition[] = [
  {
    id: 'dual-presence',
    evidence: ['card-in-hand', 'duplicate-card'],
    title: '一物双存',
    finding: '两张黑卡右下角有同一道缺口。它不是同一制式，而是同一件物品同时出现在两台机位。',
    archive: {
      code: 'B-09 / 见证人凭证',
      title: '没有持卡人的通行记录',
      body: '白礁酒店的第九类通行卡只签发过一张。档案中没有姓名，权限却覆盖所有客房、服务层与直播线路。',
      quote: '备注：凭证不得离开“见证人位”。',
    },
  },
  {
    id: 'stolen-channel',
    evidence: ['missing-case', 'duplicate-card'],
    title: '被搬走的第九路信号',
    finding: '设备箱从后厨消失时，B-09 黑卡出现在露台。有人用酒店最高权限转移了一路不在清单中的直播信号。',
    archive: {
      code: 'SYNC-09 / 未登记输入',
      title: '第九机位从来不是摄像机',
      body: '直播系统原有八路画面。编号 09 的输入没有镜头型号，只有一项参数：见证人记忆，缓存长度十秒。',
      quote: '只要仍有人记得，信号就不会中断。',
    },
  },
  {
    id: 'broken-route',
    evidence: ['mirror-door', 'footprint-gap'],
    title: '路径被剪断',
    finding: '镜中门缝仍在延伸，湿脚印却停在楼梯平台。苏晚经过的不是两点之间的酒店走廊。',
    archive: {
      code: 'FLOOR 0 / 西翼夹层',
      title: '从平面图上消失的一层',
      body: '十二年前事故后，白礁酒店把西翼夹层从消防图纸中删除。旧施工日志仍称那里为“零层观察室”。',
      quote: '门只在反射中保持开启。',
    },
  },
] as const

export const EVIDENCE_LINK_BY_ID = Object.fromEntries(
  EVIDENCE_LINKS.map((link) => [link.id, link]),
) as Record<EvidenceLinkId, EvidenceLinkDefinition>

export function getEvidenceLink(left: EvidenceId, right: EvidenceId) {
  if (left === right) return null
  return EVIDENCE_LINKS.find(({ evidence }) => (
    evidence.includes(left) && evidence.includes(right)
  )) ?? null
}
