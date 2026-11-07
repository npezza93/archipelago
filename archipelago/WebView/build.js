import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const result = await Bun.build({
  entrypoints: ['./application.js', './settings.js'],
  outdir: '.',
  naming: '[name].min.js',
  target: 'browser',
  format: 'iife',
  minify: true,
  plugins: [
    {
      name: 'embedded-wasm',
      setup(build) {
        build.onLoad({ filter: /\.wasm$/ }, async ({ path }) => {
          const bytes = await readFile(path)
          if (
            createHash('sha256').update(bytes).digest('hex') !==
            '7b428fee6d0677bc81279458f8f9a3335454834123a9ff47efb3fd177f6da5a8'
          ) {
            throw new Error(
              'The libghostty-vt 1.0.0 WASM checksum does not match the official release'
            )
          }
          return {
            contents: `export default Uint8Array.from(atob(${JSON.stringify(bytes.toString('base64'))}), c => c.charCodeAt(0))`,
            loader: 'js',
          }
        })
      },
    },
  ],
})

if (!result.success) {
  for (const log of result.logs) console.error(log)
  process.exit(1)
}
