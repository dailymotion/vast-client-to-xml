import babel from 'rollup-plugin-babel';

export default [
  {
    input: 'src/index.js',
    output: {
      format: 'cjs',
      file: 'dist/vast-client-to-xml.js'
    },
    plugins: [
      babel({})
    ]
  }
];
