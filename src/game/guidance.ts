import type { CameraId, EvidenceId, EvidenceLinkId } from './types'

export interface InvestigationHint {
  id: string
  eyebrow: string
  title: string
  body: string
  actionLabel: string
  cameraId?: CameraId
  time?: number
  action?: 'case-board' | 'deduction' | 'camera-nine'
}

const EVIDENCE_HINTS: readonly (InvestigationHint & { evidenceId: EvidenceId })[] = [
  {
    id: 'find-card-in-hand',
    evidenceId: 'card-in-hand',
    eyebrow: '时间回声 · 第一条线索',
    title: '先相信你自己的肩机',
    body: '停电前一秒，苏晚的右手里还有什么？我可以把母带定位到附近，但目标仍要由你指出。',
    actionLabel: '前往 CAM-08 · 约第 4 秒',
    cameraId: '08',
    time: 4,
  },
  {
    id: 'find-duplicate-card',
    evidenceId: 'duplicate-card',
    eyebrow: '时间回声 · 物件矛盾',
    title: '同一件东西，可能已经在别处',
    body: '检查临海露台的积水边缘。注意画面下方，而不是人物。',
    actionLabel: '前往 CAM-07 · 约第 5 秒',
    cameraId: '07',
    time: 5,
  },
  {
    id: 'find-mirror-door',
    evidenceId: 'mirror-door',
    eyebrow: '时间回声 · 空间矛盾',
    title: '真实房门和镜中房门，谁在说谎？',
    body: '新娘套房的异常不在房间中央。比较真实空间与镜面反射的上半部。',
    actionLabel: '前往 CAM-04 · 约第 6 秒',
    cameraId: '04',
    time: 6,
  },
  {
    id: 'find-missing-case',
    evidenceId: 'missing-case',
    eyebrow: '时间回声 · 痕迹矛盾',
    title: '消失的东西仍会留下轮廓',
    body: '后厨的雨水已经打湿一切，除了一处本应同样潮湿的位置。',
    actionLabel: '前往 CAM-05 · 约第 7 秒',
    cameraId: '05',
    time: 7,
  },
]

export function getInvestigationHint(
  evidence: readonly EvidenceId[],
  links: readonly EvidenceLinkId[],
  hypothesisCorrect: boolean,
): InvestigationHint | null {
  const evidenceHint = EVIDENCE_HINTS.find((hint) => !evidence.includes(hint.evidenceId))
  if (evidenceHint) return evidenceHint

  if (!links.includes('dual-presence')) {
    return {
      id: 'link-dual-presence',
      eyebrow: '时间回声 · 建立因果',
      title: '先把两张黑卡放在一起',
      body: '打开证据联结台，选择“苏晚手中的黑卡”和“露台黑卡”，验证它们能否同时存在。',
      actionLabel: '打开证据联结台',
      action: 'case-board',
    }
  }

  if (!links.includes('stolen-channel')) {
    return {
      id: 'link-stolen-channel',
      eyebrow: '时间回声 · 闭合因果',
      title: '失踪的设备箱去了哪里？',
      body: '把“干燥矩形印”和“露台黑卡”联结起来：权限与信号的去向会同时出现。',
      actionLabel: '打开证据联结台',
      action: 'case-board',
    }
  }

  if (!hypothesisCorrect) {
    return {
      id: 'submit-deduction',
      eyebrow: '时间回声 · 最终推断',
      title: '四条画面、两组矛盾，已经足够',
      body: '不要解释苏晚如何逃走。判断八台摄影机记录的“现在”是否真的相同。',
      actionLabel: '提交最终推断',
      action: 'deduction',
    }
  }

  return {
    id: 'enter-camera-nine',
    eyebrow: '时间回声 · 未知信号',
    title: '第九路画面正在等待见证人',
    body: '你的推断已经匹配。接入 CAM-09，查看这场婚礼真正被封存的那一秒。',
    actionLabel: '接受 CAM-09',
    action: 'camera-nine',
  }
}
