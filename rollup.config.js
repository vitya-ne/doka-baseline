import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
// import minifyHTML from '@lit-labs/rollup-plugin-minify-html-literals';
import summary from 'rollup-plugin-summary';

export default {
    input: 'src/DokaBaseline.js',
    output: { file: 'doka-baseline.min.js' },
    plugins: [
        resolve(),
        // minifyHTML(),
        terser({
            compress: {
                drop_console: true,
            },
        }),
        summary(),
    ],
};
