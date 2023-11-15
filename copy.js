import { dirname, extname, resolve } from 'node:path';
import { readdirSync, statSync, existsSync } from 'node:fs';
import { mkdirp } from 'mkdirp';

export function copyfile(from, to) {
  if (existsSync(from)) {
    mkdirp.sync(dirname(to));
    return Bun.write(to, Bun.file(from));
  }
}

export function copydir(from, to, match) {
  if (existsSync(from)) {
    readdirSync(from)
      .filter((file) => {
        if (!match) return true;

        const inputPath = resolve(from, file);
        if (!existsSync(inputPath)) return false;

        const stat = statSync(inputPath);

        if (typeof match === 'function') {
          return match(file, stat);
        }

        switch (match) {
          case '*':
          case 'all':
            return true;
          case 'file':
            return stat.isFile();
          case 'directory':
            return stat.isDirectory();
          default:
            if (match[0] === '.') {
              return extname(file) === match;
            }
            return false;
        }
      })
      .forEach((file) => {
        const inputPath = resolve(from, file);
        const outputPath = resolve(to, file);
        const stat = statSync(inputPath);
        if (stat.isDirectory()) {
          return copydir(inputPath, outputPath, match);
        }
        return copyfile(inputPath, outputPath);
      });
  }
}
