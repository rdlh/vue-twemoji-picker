import vue from "rollup-plugin-vue";
import buble from "rollup-plugin-buble";
import commonjs from "rollup-plugin-commonjs";
import replace from "rollup-plugin-replace";
import uglify from "rollup-plugin-uglify-es";
import minimist from "minimist";
import json from '@rollup/plugin-json';

const argv = minimist(process.argv.slice(2));

const config = {
  input: "src/main.js",
  output: {
    name: "VueTwemojiPicker",
    exports: "named",
    globals: {
      'smoothscroll-polyfill': 'smoothscroll',
    }
  },
  external: [
    'smoothscroll-polyfill',
  ],
  plugins: [
    replace({
      "process.env.NODE_ENV": JSON.stringify("production")
    }),
    commonjs(),
    vue({
      css: true,
      compileTemplate: true,
      template: {
        isProduction: true
      }
    }),
    buble(),
    json()
  ]
};

// Only minify browser (iife) version
if (argv.format === "iife") {
  config.plugins.push(uglify());
}

export default config;
