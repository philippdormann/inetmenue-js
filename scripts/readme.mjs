import { $, fs } from 'zx'

await fs.copyFile('README.md', 'packages/lib/README.md')