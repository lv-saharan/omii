
let pkg = require('./package.json')
let [mode] = process.argv.splice(2);
//let outfile = `../es-lib/omii/${pkg.version}/omii.js`;
let outfile = `./dist/omii/latest/omii.js`;
//let outfile = `../es-lib/omii/latest/omii.js`;
let options = {
    entryPoints: ['src/omii.js'],
    outfile,
    format: "esm",
    bundle: true,
    sourcemap: true,
    minify: mode == "minify"
}
const esbuild = require('esbuild')
esbuild.buildSync(options)
