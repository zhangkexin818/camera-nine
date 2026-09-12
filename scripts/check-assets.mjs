import { access, readdir, readFile, stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const artRoot = join(projectRoot, 'art')
const manifestPath = join(artRoot, 'asset-manifest.json')
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
const errors = []
const ids = new Set()

for (const asset of manifest.assets) {
  if (ids.has(asset.id)) errors.push(`duplicate asset id: ${asset.id}`)
  ids.add(asset.id)

  for (const relativePath of [asset.path, asset.promptSet]) {
    try {
      await access(join(artRoot, relativePath))
    } catch {
      errors.push(`missing file for ${asset.id}: ${relativePath}`)
    }
  }
}

const runtimeRoot = join(artRoot, 'runtime')
const runtimeFiles = (await readdir(runtimeRoot)).filter((name) => name.endsWith('.webp'))
const runtimeSizes = await Promise.all(
  runtimeFiles.map(async (name) => (await stat(join(runtimeRoot, name))).size),
)
const runtimeBytes = runtimeSizes.reduce((total, size) => total + size, 0)
if (runtimeFiles.length !== 17) {
  errors.push(`expected 17 runtime WebP files, found ${runtimeFiles.length}`)
}

if (errors.length > 0) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log(
    `assets ok: ${manifest.assets.length} manifest entries, ${runtimeFiles.length} runtime images, ${(
      runtimeBytes /
      1024 /
      1024
    ).toFixed(2)} MiB; procedural instrumental score (no runtime voice assets)`,
  )
}
