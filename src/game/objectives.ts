import type { CameraId, EvidenceId } from './types'

export interface InvestigationObjective {
  evidenceId: EvidenceId
  step: number
  kicker: string
  title: string
  hint: string
  cameraId: CameraId
  time: number
  actionLabel: string
}

export const INVESTIGATION_OBJECTIVES: readonly InvestigationObjective[] = [
  {
    evidenceId: 'card-in-hand',
    step: 1,
    kicker: '锁定最后一帧',
    title: '苏晚手中的黑卡',
    hint: '画面停在失踪前一秒。检查走廊尽头苏晚的右手，点击四角观察框。',
    cameraId: '08',
    time: 4,
    actionLabel: '定位 CAM-08 · 23:46:59',
  },
  {
    evidenceId: 'duplicate-card',
    step: 2,
    kicker: '验证不可能',
    title: '寻找第二张黑卡',
    hint: '如果黑卡仍在苏晚手中，它就不该同时出现在临海露台。',
    cameraId: '07',
    time: 5,
    actionLabel: '定位 CAM-07 · 23:47:00',
  },
  {
    evidenceId: 'mirror-door',
    step: 3,
    kicker: '检查空间矛盾',
    title: '镜子里的门没有关',
    hint: '进入新娘套房，比较真实房门与镜中连接门的门缝。',
    cameraId: '04',
    time: 6,
    actionLabel: '定位 CAM-04 · 23:47:01',
  },
  {
    evidenceId: 'missing-case',
    step: 4,
    kicker: '追踪搬运痕迹',
    title: '消失的黑色设备箱',
    hint: '后厨装卸口的湿推车上，留下了一块不该干燥的矩形。',
    cameraId: '05',
    time: 7,
    actionLabel: '定位 CAM-05 · 23:47:02',
  },
]

export function getNextObjective(foundEvidence: readonly EvidenceId[]) {
  return INVESTIGATION_OBJECTIVES.find(
    (objective) => !foundEvidence.includes(objective.evidenceId),
  )
}
