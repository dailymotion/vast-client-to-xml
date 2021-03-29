import babel from '@rollup/plugin-babel';

export default [
  {
    input: 'src/vast-client-serializer.js',
    output: {
      format: 'cjs',
      file: 'dist/vast-client-to-xml.js',
      name: 'VASTClientSerializer'
    },
    plugins: [
      babel({})
    ]
  }
];
