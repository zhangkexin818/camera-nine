import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const evidenceTargets = {
  '08': { time: 4, x: 0.787, y: 0.54 },
  '07': { time: 5, x: 0.54, y: 0.9 },
  '06': { time: 6, x: 0.47, y: 0.57 },
  '04': { time: 6, x: 0.65, y: 0.25 },
  '05': { time: 7, x: 0.79, y: 0.66 },
} as const

async function finishPrologue(page: Page, memory: 'card' | 'signal' = 'card', controlledClock = false) {
  await expect(page.getByRole('dialog', { name: '第九机位' })).toBeVisible()
  await page.getByRole('button', { name: '确认身份' }).click()
  await expect(page.locator('.identity-record')).toContainText('路野，29 岁')
  await page.getByRole('button', { name: /相信身体留下的记忆/ }).click()
  await expect(page.locator('.story-subtitle-card')).toContainText('她在看你')
  await page.getByRole('button', { name: memory === 'card' ? /拉近焦距/ : /压下摄影机/ }).click()
  await expect(page.locator('.cinematic-focus')).toBeVisible()
  await page.getByRole('button', { name: '锁定走廊尽头的苏晚' }).click()
  await page.getByRole('button', { name: '对焦苏晚手中的黑卡' }).click()
  await page.getByRole('button', { name: '指出玻璃右侧的延迟倒影' }).click()
  await page.getByRole('button', { name: '追踪仍亮着的红色门禁灯' }).click()
  if (controlledClock) await page.clock.fastForward(700)
  await expect(page.locator('.cinematic-aftermath')).toBeVisible()
  await page.getByRole('button', { name: memory === 'card' ? /捡起落在门内的黑卡/ : /拍下仍在闪烁的红灯/ }).click()
  await expect(page.locator('.story-subtitle-card')).toContainText('所有机位同时丢帧')
  await page.getByRole('button', { name: '进入封存回放' }).click()
  await expect(page.locator('.story-prologue')).toHaveCount(0)
  await expect(page.locator('.pixi-host')).toHaveAttribute('data-load-state', 'ready')
}

async function completeSplice(page: Page) {
  const splice = page.getByRole('dialog', { name: /把四帧放回/ })
  await expect(splice).toBeVisible()
  for (const title of ['苏晚手中的黑卡', '露台黑卡', '镜内门缝', '干燥矩形印']) {
    await splice.getByRole('button', { name: new RegExp(title) }).click()
  }
  await splice.getByRole('button', { name: '验证真实顺序' }).click()
  await expect(page.getByRole('dialog', { name: '这十秒究竟发生了什么？' })).toBeVisible()
}

async function inspectEvidence(page: Page, cameraId: keyof typeof evidenceTargets) {
  const target = evidenceTargets[cameraId]
  await page.getByRole('button', { name: new RegExp(`CAM-${cameraId}`) }).click()
  await page.locator('.timeline-range').fill(String(target.time))
  await page.getByRole('button', { name: '开启画面检视' }).click()
  const layer = page.locator('.inspection-layer')
  const box = await layer.boundingBox()
  if (!box) throw new Error('Inspection layer has no bounds')
  await layer.click({ position: { x: box.width * target.x, y: box.height * target.y } })
  const notice = page.locator('.discovery-notice')
  await expect(notice).toBeVisible()
  await expect(notice.locator('img')).toBeVisible()
  expect(await notice.locator('img').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0)
  await page.getByRole('button', { name: '关闭证据提示' }).click()
}

async function collectCoreEvidence(page: Page) {
  await inspectEvidence(page, '08')
  await inspectEvidence(page, '07')
  await inspectEvidence(page, '04')
  await inspectEvidence(page, '05')
}

async function establishRequiredLinks(page: Page) {
  await page.getByRole('button', { name: '建立联结' }).click()
  const board = page.getByRole('dialog', { name: /把两条画面放在一起/ })
  await expect(board.locator('.case-evidence-list img')).toHaveCount(4)
  await board.getByRole('button', { name: /苏晚手中的黑卡/ }).click()
  await board.getByRole('button', { name: /露台黑卡/ }).click()
  await board.getByRole('button', { name: '验证两条画面' }).click()
  await expect(board).toContainText('一物双存')
  await expect(board.locator('.archive-fragment-visuals img')).toHaveCount(2)

  await board.getByRole('button', { name: /干燥矩形印/ }).click()
  await board.getByRole('button', { name: /露台黑卡/ }).click()
  await board.getByRole('button', { name: '验证两条画面' }).click()
  await expect(board).toContainText('被搬走的第九路信号')
  await expect(board).toContainText('有效联结 2/2')
  await board.getByRole('button', { name: '关闭证据联结台' }).click()
}

test('plays the cinematic prologue and lets its choice change the investigation entry', async ({ page }) => {
  const runtimeErrors: string[] = []
  page.on('pageerror', (error) => runtimeErrors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text())
  })

  await page.goto('/')
  await expect(page).toHaveTitle('第九机位 · 监控回放')
  await expect(page.getByRole('dialog', { name: '第九机位' })).toContainText('十二年前，你也曾被这里记录')
  await finishPrologue(page, 'signal')
  await expect(page.locator('.camera-heading strong')).toHaveText('CAM-02')
  await page.getByRole('button', { name: /回想停电前/ }).click()
  await expect(page.locator('.investigation-brief')).toContainText('红色门禁灯已经亮了')
  expect(runtimeErrors).toEqual([])
})

test('uses only a procedural instrumental score and never plays dialogue media', async ({ page }) => {
  const audioRequests: string[] = []
  page.on('request', (request) => {
    if (request.url().includes('/audio/')) audioRequests.push(request.url())
  })
  await page.addInitScript(() => {
    const mediaWindow = window as typeof window & { __mediaPlayCount: number }
    mediaWindow.__mediaPlayCount = 0
    HTMLMediaElement.prototype.play = function play() {
      mediaWindow.__mediaPlayCount += 1
      return Promise.resolve()
    }
  })

  await page.goto('/')
  const soundControl = page.locator('.story-sound')
  await expect(soundControl).toHaveAttribute('data-audio-mode', 'instrumental')
  await expect(soundControl).toHaveAttribute('data-audio-status', 'idle')
  await expect(soundControl).toContainText('点击开始播放配乐')
  await page.getByRole('button', { name: '确认身份' }).click()
  await expect(soundControl).toHaveAttribute('data-audio-status', 'playing')
  await expect(soundControl).toContainText('纯音乐播放中')
  await page.getByRole('button', { name: /相信身体留下的记忆/ }).click()
  await page.getByRole('button', { name: /拉近焦距/ }).click()
  await page.getByRole('button', { name: '锁定走廊尽头的苏晚' }).click()
  expect(audioRequests).toEqual([])
  expect(await page.evaluate(() => (
    window as typeof window & { __mediaPlayCount: number }
  ).__mediaPlayCount)).toBe(0)
  await soundControl.click()
  await expect(soundControl).toContainText('纯音乐关闭')
})

test('reveals a directional hint after ten seconds and jumps near the clue without marking it', async ({ page }) => {
  await page.goto('/')
  await page.clock.install()
  await finishPrologue(page, 'card', true)
  await page.clock.fastForward(10_050)

  const hint = page.getByRole('status', { name: '调查提示' })
  await expect(hint).toBeVisible()
  await expect(hint).toContainText('停滞 10 秒后自动出现')
  await expect(hint).toContainText('先相信你自己的肩机')
  await hint.getByRole('button', { name: /前往 CAM-08/ }).click()
  await expect(page.locator('.camera-heading strong')).toHaveText('CAM-08')
  await expect(page.locator('.timeline-range')).toHaveValue('4')
  await expect(page.locator('.inspection-layer')).toHaveCount(0)
  await expect(page.locator('.discovery-notice')).toHaveCount(0)
})

test('supports free exploration, a movable magnifying glass, and useful miss feedback', async ({ page }) => {
  await page.goto('/')
  await finishPrologue(page)
  await expect(page.locator('.camera-heading strong')).toHaveText('CAM-08')
  await expect(page.getByLabel(/异常强度：信号稳定/)).toBeVisible()
  await expect(page.locator('.target-tick')).toHaveCount(0)
  await expect(page.locator('.camera-key.is-target')).toHaveCount(0)
  await expect(page.locator('.evidence-hotspot')).toHaveCount(0)

  await page.getByRole('button', { name: '开启画面检视' }).click()
  await expect(page.locator('.inspection-layer')).toBeVisible()
  await expect(page.locator('.inspection-magnifier img')).toBeVisible()
  await page.locator('.inspection-layer').click({ position: { x: 120, y: 100 } })
  await expect(page.locator('.scan-feedback')).toContainText('没有捕捉到时间错位')
  await expect(page.locator('.control-hint')).toContainText('误判 1')
})

test('requires four observations and a player deduction before CAM-09 unlocks', async ({ page }) => {
  await page.goto('/')
  await finishPrologue(page)
  await collectCoreEvidence(page)

  await expect(page.locator('.evidence-toggle')).toContainText('4/4')
  await expect(page.locator('.camera-key.is-nine')).toBeDisabled()
  await expect(page.locator('.investigation-brief')).toContainText('因果还没有闭合')
  await establishRequiredLinks(page)
  await expect(page.locator('.investigation-brief')).toContainText('现在轮到你判断')
  await page.getByRole('button', { name: '提交推断' }).click()
  await completeSplice(page)
  await page.getByRole('button', { name: /直播设备发生同步故障/ }).click()
  await expect(page.getByRole('alert')).toContainText('不能制造真实存在的干燥轮廓')
  await page.getByRole('button', { name: /八台机位不在同一个/ }).click()

  await expect(page.locator('.investigation-brief')).toContainText('未知信号正在呼叫')
  await expect(page.locator('.camera-key.is-nine')).toBeEnabled()
  await page.getByRole('button', { name: /接受 CAM-09/ }).click()
  await expect(page.locator('.camera-heading strong')).toHaveText('CAM-09')
  await expect(page.locator('.feed-header time')).toContainText('12年前')
  const desktopRevelation = page.locator('.desktop-revelation .revelation-panel')
  await expect(desktopRevelation).toContainText('观察评级 A')
  await expect(desktopRevelation).toContainText('第九机位终于也看见了你')
  await page.getByRole('button', { name: /回应未知信号/ }).click()
  await expect(page.locator('.desktop-revelation .ending-resolution')).toContainText('结局 · 第十秒')
  await expect(page.locator('.desktop-revelation .ending-resolution')).toContainText('画面中的空椅')
})

test('rewards optional exploration with a third world archive fragment', async ({ page }) => {
  await page.goto('/')
  await finishPrologue(page)
  await collectCoreEvidence(page)
  await establishRequiredLinks(page)
  await inspectEvidence(page, '06')
  await page.keyboard.press('KeyB')

  const board = page.getByRole('dialog', { name: /把两条画面放在一起/ })
  await board.getByRole('button', { name: /镜内门缝/ }).click()
  await board.getByRole('button', { name: /脚印断层/ }).click()
  await board.getByRole('button', { name: '验证两条画面' }).click()
  await expect(board).toContainText('路径被剪断')
  await expect(board).toContainText('FLOOR 0 / 西翼夹层')
  await expect(board).toContainText('门只在反射中保持开启')
  await expect(board).toContainText('档案解封 3/3')
  await board.getByRole('button', { name: '关闭证据联结台' }).click()
  await page.getByRole('button', { name: '提交推断' }).click()
  await completeSplice(page)
  await page.getByRole('button', { name: /八台机位不在同一个/ }).click()
  await page.getByRole('button', { name: /接受 CAM-09/ }).click()
  await expect(page.locator('.desktop-revelation .revelation-panel')).toContainText('观察评级 S')
  await expect(page.getByRole('button', { name: /接回婚礼直播/ })).toBeEnabled()
  await expect(page.getByRole('button', { name: /穿过反射里的门/ })).toBeEnabled()
})

test('turns the formerly ambiguous second archive into a guided optional investigation', async ({ page }) => {
  await page.goto('/')
  await finishPrologue(page)
  await collectCoreEvidence(page)
  await establishRequiredLinks(page)
  await page.keyboard.press('KeyB')

  const board = page.getByRole('dialog', { name: /把两条画面放在一起/ })
  const fragments = board.locator('.archive-fragments article')
  await expect(fragments).toHaveCount(3)
  await expect(fragments.nth(2)).toContainText('EXTRA / 可选调查')
  await expect(fragments.nth(2)).toContainText('零层路径仍缺一帧')
  await expect(fragments.nth(2).getByRole('button', { name: /追踪缺失画面 · CAM-06/ })).toBeVisible()
  await expect(board.getByRole('button', { name: /进入最终推断/ })).toBeVisible()

  await fragments.nth(2).getByRole('button', { name: /追踪缺失画面 · CAM-06/ }).click()
  await expect(board).toHaveCount(0)
  await expect(page.locator('.camera-heading strong')).toHaveText('CAM-06')
  await expect(page.locator('.timeline-range')).toHaveValue('6')
  await expect(page.locator('.inspection-layer')).toBeVisible()
  await expect(page.locator('.scan-feedback')).toContainText('档案回声已锁定 CAM-06')

  const layer = page.locator('.inspection-layer')
  const box = await layer.boundingBox()
  if (!box) throw new Error('Inspection layer has no bounds')
  await layer.click({ position: { x: box.width * evidenceTargets['06'].x, y: box.height * evidenceTargets['06'].y } })
  await expect(page.locator('.discovery-notice')).toContainText('脚印断层')
  await page.getByRole('button', { name: '关闭证据提示' }).click()
  await page.keyboard.press('KeyB')

  const reopenedBoard = page.getByRole('dialog', { name: /把两条画面放在一起/ })
  await reopenedBoard.locator('.archive-fragments article').nth(2).getByRole('button', { name: /装载这组证物/ }).click()
  await expect(reopenedBoard.locator('.case-link-slots')).toContainText('镜内门缝')
  await expect(reopenedBoard.locator('.case-link-slots')).toContainText('脚印断层')
  await reopenedBoard.getByRole('button', { name: '验证两条画面' }).click()
  await expect(reopenedBoard).toContainText('档案解封 3/3')
  await reopenedBoard.getByRole('button', { name: /进入最终推断/ }).click()
  await completeSplice(page)
  await expect(page.getByRole('dialog', { name: '这十秒究竟发生了什么？' })).toBeVisible()
})

test('makes a compatible evidence pair a recoverable rated mistake', async ({ page }) => {
  await page.goto('/')
  await finishPrologue(page)
  await inspectEvidence(page, '08')
  await inspectEvidence(page, '04')
  await page.keyboard.press('KeyB')

  const board = page.getByRole('dialog', { name: /把两条画面放在一起/ })
  await board.getByRole('button', { name: /苏晚手中的黑卡/ }).click()
  await board.getByRole('button', { name: /镜内门缝/ }).click()
  await board.getByRole('button', { name: '验证两条画面' }).click()
  await expect(board.getByRole('alert')).toContainText('联结不成立')
  await board.getByRole('button', { name: '关闭证据联结台' }).click()
  await expect(page.locator('.control-hint')).toContainText('误判 1')
})

test('keeps prologue choices and exploration controls usable on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: '确认身份' }).click()
  await expect(page.locator('.identity-record')).toBeVisible()
  await expect(page.locator('.story-choices button').first()).toBeInViewport()
  await page.getByRole('button', { name: /相信没有被烧毁的档案/ }).click()
  await page.getByRole('button', { name: /压下摄影机/ }).click()
  await page.getByRole('button', { name: '锁定走廊尽头的苏晚' }).click()
  await page.getByRole('button', { name: '对焦苏晚手中的黑卡' }).click()
  await page.getByRole('button', { name: '指出玻璃右侧的延迟倒影' }).click()
  await page.getByRole('button', { name: '追踪仍亮着的红色门禁灯' }).click()
  await expect(page.locator('.cinematic-aftermath')).toBeVisible()
  await page.getByRole('button', { name: /拍下仍在闪烁的红灯/ }).click()
  await expect(page.getByRole('button', { name: '进入封存回放' })).toBeInViewport()
  await page.getByRole('button', { name: '进入封存回放' }).click()

  await expect(page.locator('.camera-rail')).toBeVisible()
  await expect(page.locator('.timeline-range')).toBeVisible()
  await expect(page.getByRole('button', { name: '开启画面检视' })).toBeVisible()
  await page.getByRole('button', { name: '开启画面检视' }).click()
  await expect(page.locator('.inspection-layer')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})

test('keeps the complete console visible on a compact desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto('/')
  await finishPrologue(page)
  const consoleBox = await page.locator('.playback-console').boundingBox()
  expect(consoleBox?.y).toBeGreaterThanOrEqual(0)
  expect((consoleBox?.y ?? 0) + (consoleBox?.height ?? 0)).toBeLessThanOrEqual(768)
  await expect(page.locator('.investigation-brief')).toBeVisible()
  await expect(page.locator('.feed-stage')).toBeVisible()
  await expect(page.locator('.transport-row')).toBeVisible()
})

test('has no automatically detectable accessibility violations in story and gameplay', async ({ page }) => {
  await page.goto('/')
  const storyResults = await new AxeBuilder({ page }).analyze()
  expect(storyResults.violations).toEqual([])
  await finishPrologue(page)
  const gameplayResults = await new AxeBuilder({ page }).analyze()
  expect(gameplayResults.violations).toEqual([])
})

test('supports rules, sound controls, evidence drawer, and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.getByRole('button', { name: '点击开始播放配乐' })).toBeVisible()
  await page.getByRole('button', { name: '点击开始播放配乐' }).click()
  await expect(page.getByRole('button', { name: '纯音乐播放中' })).toBeVisible()
  await page.getByRole('button', { name: '纯音乐播放中' }).click()
  await expect(page.getByRole('button', { name: '纯音乐关闭' })).toBeVisible()
  await finishPrologue(page)
  await expect(page.locator('.scan-pass')).toHaveCSS('display', 'none')

  await page.getByRole('button', { name: '查看行动规则' }).click()
  await expect(page.getByRole('dialog', { name: /不要找标记/ })).toContainText('错误不会结束游戏')
  await page.getByRole('button', { name: '返回回放' }).click()
  const drawer = page.locator('.evidence-toggle')
  await drawer.click()
  await expect(drawer).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Escape')
  await expect(drawer).toHaveAttribute('aria-expanded', 'false')
})
