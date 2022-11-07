import { $, fs } from 'zx'

await fs.copyFile('README.md', 'packages/lib/README.md')
await $`cd packages/lib`
await $`npx pnpm publish --access public --no-git-checks`