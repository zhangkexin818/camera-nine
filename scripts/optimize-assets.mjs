import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const artRoot = path.join(projectRoot, 'art')
const outputRoot = path.join(artRoot, 'runtime')

const assets = [
  ['scenes/ballroom/ballroom_ceremony-2343_master_v01.png', 'cam-01_before.webp'],
  ['scenes/ballroom/ballroom_anomaly-2347_master_v01.png', 'cam-01_event.webp'],
  ['scenes/opening/service-corridor_normal_master_v01.png', 'cam-02_before.webp'],
  ['scenes/opening/service-corridor_blackout_master_v01.png', 'cam-02_event.webp'],
  ['masters/baijiao-hotel_exterior_master_v01.png', 'cam-03_static.webp'],
  ['cameras/cam-04_bridal-suite_2342_master_v01.png', 'cam-04_before.webp'],
  ['cameras/cam-04_bridal-suite_234701_event_v01.png', 'cam-04_event.webp'],
  ['cameras/cam-05_kitchen-loading_2342_master_v01.png', 'cam-05_before.webp'],
  ['cameras/cam-05_kitchen-loading_234702_event_v01.png', 'cam-05_event.webp'],
  ['cameras/cam-06_west-stair_2342_master_v01.png', 'cam-06_before.webp'],
  ['cameras/cam-06_west-stair_234701_event_v01.png', 'cam-06_event.webp'],
  ['cameras/cam-07_cliff-terrace_2342_master_v01.png', 'cam-07_before.webp'],
  ['cameras/cam-07_cliff-terrace_234700_event_v01.png', 'cam-07_event.webp'],
  ['cameras/cam-08_lu-ye-mobile_234538_master_v01.png', 'cam-08_before.webp'],
  ['cameras/cam-08_lu-ye-mobile_234659_event_v01.png', 'cam-08_event.webp'],
  ['cameras/cam-09_past-vote_12y_master_v01.png', 'cam-09_past.webp'],
  ['scenes/opening/su-wan_glass-warning-card_keyframe_v02.png', 'prologue_su-wan-warning.webp'],
]

await mkdir(outputRoot, { recursive: true })

const results = []
for (const [input, output] of assets) {
  const inputPath = path.join(artRoot, ...input.split('/'))
  const outputPath = path.join(outputRoot, output)
  const info = await sharp(inputPath)
    .webp({ quality: 88, effort: 6, smartSubsample: true })
    .toFile(outputPath)
  results.push({ output, width: info.width, height: info.height, bytes: info.size })
}

const totalBytes = results.reduce((sum, item) => sum + item.bytes, 0)
console.log(JSON.stringify({ count: results.length, totalBytes, results }, null, 2))
