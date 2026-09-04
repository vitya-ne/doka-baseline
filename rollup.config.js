import resolve from '@rollup/plugin-node-resolve';
// import terser from '@rollup/plugin-terser';
import summary from 'rollup-plugin-summary';

export default {
    input: 'src/DokaBaseline.js',
    output: { file: 'doka-baseline.build.js' },
    plugins: [
        resolve({
            resolveOnly: ['/src'],
        }),
        // terser({
        //     format: {
        //         comments: 'all',
        //     },
        //     compress: {
        //         drop_console: true,
        //     },
        // }),
        summary(),
    ],
};
