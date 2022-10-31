
import pkg from './package.json'  assert { type: "json" }
import esbuild from 'esbuild'
import { dev } from "local-dev-server"
import path from "path"
const [mode] = process.argv.splice(2);
//let outfile = `../es-lib/omii/${pkg.version}/omii.js`;
const outfile = `./dist/omii.js`;
//let outfile = `../es-lib/omii/latest/omii.js`;
const options = {
    entryPoints: ['src/omii.js'],
    outfile,
    format: "esm",
    bundle: true,
    sourcemap: true,
    minify: true,
    plugins: [{
        name: 'omi-map',
        setup(build) {
            build.onResolve({ filter: /omi\/src\/extend/ }, args => {
                return { path: path.resolve('./src/extend.js') }
            })
        },
    }],
}


if (mode == "dev") {
    const { reload } = dev({ ...pkg.localDev.server, openBrowser: false })
    esbuild.build({
        ...options, watch: {
            onRebuild(error, result) {
                if (error) console.error('watch build failed:', error)
                else {
                    console.log('watch build succeeded:', result)
                    reload("ui rebuild ok")
                }

            },
        }
    })
} else {
    esbuild.build(options)
}
