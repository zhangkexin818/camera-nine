import { mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, test, type Page } from '@playwright/test'

const screenshotRoot = join(tmpdir(), 'camera-nine-qa')
const targets = {
  '08': { time: 4, x: 0.787, y: 0.54 },
  '07': { time: 5, x: 0.54, y: 0.9 },
  '04': { time: 6, x: 0.65, y: 0.25 },
  '05': { time: 7, x: 0.79, y: 0.66 },
  '06': { time: 6, x: 0.47, y: 0.57 },
} as const

async function shot(page: Page, name: string) {
  await page.screenshot({ path: join(screenshotRoot, name), fullPage: false })
}

async function finishPrologue(page: Page) {
  await page.getByRole('button', { name: '确认身份' }).click()
  await page.getByRole('button', { name: /相信身体留下的记忆/ }).click()
  await page.getByRole('button', { name: /拉近焦距/ }).click()
  await page.getByRole('button', { name: '锁定走廊尽头的苏晚' }).click()
  await page.getByRole('button', { name: '对焦苏晚手中的黑卡' }).click()
  await page.getByRole('button', { name: '指出玻璃右侧的延迟倒影' }).click()
  await page.getByRole('button', { name: '追踪仍亮着的红色门禁灯' }).click()
  await expect(page.locator('.cinematic-aftermath')).toBeVisible()
  await page.getByRole('button', { name: /捡起落在门内的黑卡/ }).click()
  await page.getByRole('button', { name: '进入封存回放' }).click()
  await expect(page.locator('.pixi-host')).toHaveAttribute('data-load-state', 'ready')
}

async function completeSplice(page: Page) {
  const splice = page.getByRole('dialog', { name: /把四帧放回/ })
  for (const title of ['苏晚手中的黑卡', '露台黑卡', '镜内门缝', '干燥矩形印']) {
    await splice.getByRole('button', { name: new RegExp(title) }).click()
  }
  await splice.getByRole('button', { name: '验证真实顺序' }).click()
}

async function inspect(page: Page, cameraId: keyof typeof targets) {
  const target = targets[cameraId]
  await page.getByRole('button', { name: new RegExp(`CAM-${cameraId}`) }).click()
  await page.locator('.timeline-range').fill(String(target.time))
  await page.getByRole('button', { name: '开启画面检视' }).click()
  const layer = page.locator('.inspection-layer')
  const box = await layer.boundingBox()
  if (!box) throw new Error('No inspection bounds')
  await layer.click({ position: { x: box.width * target.x, y: box.height * target.y } })
  await page.getByRole('button', { name: '关闭证据提示' }).click()
}

async function establishLinks(page: Page) {
  await page.getByRole('button', { name: '建立联结' }).click()
  const board = page.locator('.case-board')
  await board.getByRole('button', { name: /苏晚手中的黑卡/ }).click()
  await board.getByRole('button', { name: /露台黑卡/ }).click()
  await board.getByRole('button', { name: '验证两条画面' }).click()
  await board.getByRole('button', { name: /干燥矩形印/ }).click()
  await board.getByRole('button', { name: /露台黑卡/ }).click()
  await board.getByRole('button', { name: '验证两条画面' }).click()
}

test('captures the exploration-first journey', async ({ page }) => {
  await mkdir(screenshotRoot, { recursive: true })
  await page.setViewportSize({ width: 1672, height: 941 })
  await page.goto('/')
  await shot(page, 'v7-prologue-title.png')
  await page.getByRole('button', { name: '确认身份' }).click()
  await page.waitForTimeout(650)
  await shot(page, 'v7-identity-record.png')
  await page.getByRole('button', { name: /相信身体留下的记忆/ }).click()
  await shot(page, 'v7-wedding-choice.png')
  await page.getByRole('button', { name: /拉近焦距/ }).click()
  await shot(page, 'v7-focus-distant.png')
  await page.getByRole('button', { name: '锁定走廊尽头的苏晚' }).click()
  await page.getByRole('button', { name: '对焦苏晚手中的黑卡' }).click()
  await shot(page, 'v7-delayed-reflection.png')
  await page.getByRole('button', { name: '指出玻璃右侧的延迟倒影' }).click()
  await shot(page, 'v7-blackout-focus.png')
  await page.getByRole('button', { name: '追踪仍亮着的红色门禁灯' }).click()
  await page.waitForTimeout(80)
  await shot(page, 'v7-jumpscare.png')
  await expect(page.locator('.cinematic-aftermath')).toBeVisible()
  await shot(page, 'v7-aftermath-choice.png')
  await page.getByRole('button', { name: /捡起落在门内的黑卡/ }).click()
  await shot(page, 'v7-prologue-blackout.png')
  await page.getByRole('button', { name: '进入封存回放' }).click()
  await expect(page.locator('.pixi-host')).toHaveAttribute('data-load-state', 'ready')
  await page.waitForTimeout(250)
  await shot(page, 'v2-investigation-entry.png')
  await page.getByRole('button', { name: '显示调查提示' }).click()
  await shot(page, 'v4-directional-hint.png')
  await page.setViewportSize({ width: 390, height: 844 })
  await shot(page, 'v4-mobile-directional-hint.png')
  await page.getByRole('button', { name: '暂时收起调查提示' }).click()
  await page.setViewportSize({ width: 1672, height: 941 })
  await page.locator('.timeline-range').fill('4')
  await page.getByRole('button', { name: '开启画面检视' }).click()
  await shot(page, 'v2-inspection-mode.png')
  const firstLayer = page.locator('.inspection-layer')
  const firstBox = await firstLayer.boundingBox()
  if (!firstBox) throw new Error('No first inspection bounds')
  await firstLayer.click({ position: { x: firstBox.width * targets['08'].x, y: firstBox.height * targets['08'].y } })
  await page.waitForTimeout(320)
  await shot(page, 'v5-evidence-discovery.png')
  await page.setViewportSize({ width: 390, height: 844 })
  await shot(page, 'v5-mobile-evidence-discovery.png')
  await page.setViewportSize({ width: 1672, height: 941 })
  await page.getByRole('button', { name: '关闭证据提示' }).click()

  for (const cameraId of ['07', '04', '05'] as const) await inspect(page, cameraId)
  await establishLinks(page)
  await shot(page, 'v3-evidence-links.png')
  await page.setViewportSize({ width: 390, height: 844 })
  await shot(page, 'v3-mobile-evidence-links.png')
  await page.setViewportSize({ width: 1672, height: 941 })
  await page.getByRole('button', { name: /追踪缺失画面 · CAM-06/ }).click()
  await shot(page, 'v6-guided-optional-clue.png')
  const optionalLayer = page.locator('.inspection-layer')
  const optionalBox = await optionalLayer.boundingBox()
  if (!optionalBox) throw new Error('No optional inspection bounds')
  await optionalLayer.click({ position: { x: optionalBox.width * targets['06'].x, y: optionalBox.height * targets['06'].y } })
  await page.getByRole('button', { name: '关闭证据提示' }).click()
  await page.keyboard.press('KeyB')
  await page.getByRole('button', { name: /装载这组证物/ }).click()
  await page.getByRole('button', { name: '验证两条画面' }).click()
  await shot(page, 'v6-complete-archive.png')
  await page.getByRole('button', { name: /进入最终推断/ }).click()
  await page.waitForTimeout(300)
  await shot(page, 'v7-temporal-splice.png')
  await completeSplice(page)
  await page.waitForTimeout(250)
  await shot(page, 'v7-deduction-reconstruction.png')
  await page.setViewportSize({ width: 390, height: 844 })
  await shot(page, 'v7-mobile-deduction-reconstruction.png')
  await page.setViewportSize({ width: 1672, height: 941 })
  await page.getByRole('button', { name: /八台机位不在同一个/ }).click()
  await page.getByRole('button', { name: /接受 CAM-09/ }).click()
  await expect(page.locator('.pixi-host')).toHaveAttribute('data-load-state', 'ready')
  await page.waitForTimeout(350)
  await shot(page, 'v2-camera-nine.png')
  await page.getByRole('button', { name: /回应未知信号/ }).click()
  await shot(page, 'v3-ending-answer.png')

  await page.setViewportSize({ width: 390, height: 844 })
  await shot(page, 'v3-mobile-ending-answer.png')
  await page.reload()
  await shot(page, 'v2-mobile-prologue.png')
  await finishPrologue(page)
  await shot(page, 'v2-mobile-investigation.png')
})
