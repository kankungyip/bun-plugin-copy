import { cwd } from 'node:process';
import { resolve } from 'node:path';
import { watch } from 'node:fs';
import { copyfile, copydir } from './copy.js';

export default function CopyPlugin({ from, to, singleFile: isSingle, match, watch: isWatch }) {
  let watcher = null;
  return {
    name: 'bun-plugin-copy',
    setup({ config }) {
      const inputPath = resolve(cwd(), from);
      const outputPath = resolve(config.outdir, to || '');
      const copyAll = () => {
        if (isWatch) {
          if (watcher) {
            watcher.close();
            watcher = null;
          }

          let copyTimer = null;
          watcher = watch(inputPath, { recursive: true }, () => {
            copyTimer && clearTimeout(copyTimer);
            copyTimer = setTimeout(copyAll, 500);
          });
        }

        isSingle ? copyfile(inputPath, outputPath) : copydir(inputPath, outputPath, match);
      };
      copyAll();
    },
  };
}
