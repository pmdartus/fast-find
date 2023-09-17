## Commands

```
$ fast-find . | wc -l
$ fd . -HI | wc -l
```

```
$ hyperfine 'fast-find .' 'fd . -HI'
Benchmark 1: fast-find .
  Time (mean ± σ):      1.233 s ±  0.080 s    [User: 0.575 s, System: 0.735 s]
  Range (min … max):    1.139 s …  1.332 s    10 runs

Benchmark 2: fd . -HI
  Time (mean ± σ):     269.2 ms ±   4.3 ms    [User: 495.5 ms, System: 2502.1 ms]
  Range (min … max):   261.9 ms … 275.5 ms    10 runs

Summary
  fd . -HI ran
    4.58 ± 0.31 times faster than fast-find .
```

```
hyperfine --warmup=1 'fast-find --method=readdirSync .' 'fast-find --method=readdirAsync .' 'fast-find --method=walkAsyncSerial .' 'fast-find --method=walkAsyncQueue .'
hyperfine --warmup=1 --runs=20 \
  'fast-find --method=walkAsyncQueue --concurrency=1 .'  \
  'fast-find --method=walkAsyncQueue --concurrency=2 .'  \
  'fast-find --method=walkAsyncQueue --concurrency=4 .'  \
  'fast-find --method=walkAsyncQueue --concurrency=10 .'  \
  'fast-find --method=walkAsyncQueue --concurrency=20 .'  \
  'fast-find --method=walkAsyncQueue --concurrency=100 .'  \
  'fast-find --method=walkAsyncQueue --concurrency=200 .' 
```

## Setting `UV_THREADPOOL_SIZE`

It can either be set using an environment variable: `UV_THREADPOOL_SIZE=xx node script.js` or set dynamically using `process.env.UV_THREADPOOL_SIZE`. 

```js
const os = require('node:os');

const cpu = os.cpus();
process.env.UV_THREADPOOL_SIZE = cpu.length;

const crypto = require('node:crypto');
const util = require('node:util');

const pbkdf2 = util.promisify(crypto.pbkdf2);

for (let i = 0; i < 100000; i++) {
    pbkdf2('secret' + i, 'salt', 100, 64, 'sha1');
}
```


However it appears that it can be set from an ES module. 

Doesn't work
```js
import os from 'node:os';

const cpu = os.cpus();
process.env.UV_THREADPOOL_SIZE = cpu.length;

import crypto from 'node:crypto';
import util from 'node:util';

const pbkdf2 = util.promisify(crypto.pbkdf2);

for (let i = 0; i < 100000; i++) {
    pbkdf2('secret' + i, 'salt', 100, 64, 'sha1');
}
```

Doesn't work either:
```js
import os from 'node:os';

const cpu = os.cpus();
process.env.UV_THREADPOOL_SIZE = cpu.length;

import('./exec');
```

It has to be set some an CommonJS file. It doesn't have to be set all the way at the top, but before the first invocation of a lib UV thread.

Works:
```js
const os = require('node:os');

const crypto = require('node:crypto');
const util = require('node:util');

const pbkdf2 = util.promisify(crypto.pbkdf2);

const cpu = os.cpus();
process.env.UV_THREADPOOL_SIZE = cpu.length;

for (let i = 0; i < 100000; i++) {
    pbkdf2('secret' + i, 'salt', 100, 64, 'sha1');
}
```

Doesn't work:
```js
const os = require('node:os');

const crypto = require('node:crypto');
const util = require('node:util');

const pbkdf2 = util.promisify(crypto.pbkdf2);

pbkdf2('secret', 'salt', 100, 64, 'sha1');

const cpu = os.cpus();
process.env.UV_THREADPOOL_SIZE = cpu.length;

for (let i = 0; i < 100000; i++) {
    pbkdf2('secret' + i, 'salt', 100, 64, 'sha1');
}
```

## Playing with `UV_THREADPOOL_SIZE` 

```sh
hyperfine \
  --export-markdown=out.md \
  --min-runs=20 \
  --parameter-list pool_size 1,2,4,8,16,24,48,100,200,400,800,1024 \
  'UV_THREADPOOL_SIZE={pool_size} node sample.cjs'
```

```js
const crypto = require('node:crypto');
const util = require('node:util');

const pbkdf2 = util.promisify(crypto.pbkdf2);

for (let i = 0; i < 50000; i++) {
    pbkdf2('secret' + i, 'salt', 100, 64, 'sha1');
}
```

| Command | Mean [s] | Min [s] | Max [s] | Relative |
|:---|---:|---:|---:|---:|
| `UV_THREADPOOL_SIZE=1 node sample.cjs` | 11.559 ± 0.514 | 11.054 | 12.766 | 5.26 ± 0.44 |
| `UV_THREADPOOL_SIZE=2 node sample.cjs` | 6.094 ± 0.335 | 5.732 | 7.324 | 2.77 ± 0.25 |
| `UV_THREADPOOL_SIZE=4 node sample.cjs` | 3.254 ± 0.262 | 2.874 | 4.208 | 1.48 ± 0.16 |
| `UV_THREADPOOL_SIZE=8 node sample.cjs` | 2.345 ± 0.316 | 1.851 | 3.149 | 1.07 ± 0.16 |
| `UV_THREADPOOL_SIZE=16 node sample.cjs` | 2.248 ± 0.281 | 1.999 | 3.207 | 1.02 ± 0.15 |
| `UV_THREADPOOL_SIZE=24 node sample.cjs` | 2.254 ± 0.273 | 1.944 | 3.106 | 1.03 ± 0.14 |
| `UV_THREADPOOL_SIZE=48 node sample.cjs` | 2.197 ± 0.154 | 1.957 | 2.512 | 1.00 |
| `UV_THREADPOOL_SIZE=100 node sample.cjs` | 2.264 ± 0.143 | 2.090 | 2.646 | 1.03 ± 0.10 |
| `UV_THREADPOOL_SIZE=200 node sample.cjs` | 2.409 ± 0.270 | 2.138 | 3.151 | 1.10 ± 0.15 |
| `UV_THREADPOOL_SIZE=400 node sample.cjs` | 2.566 ± 0.181 | 2.298 | 3.076 | 1.17 ± 0.12 |
| `UV_THREADPOOL_SIZE=800 node sample.cjs` | 2.935 ± 0.190 | 2.677 | 3.439 | 1.34 ± 0.13 |
| `UV_THREADPOOL_SIZE=1024 node sample.cjs` | 3.122 ± 0.149 | 2.929 | 3.605 | 1.42 ± 0.12 |

## Notes
* Almost no difference between async and sync `fs.readdir` (recursive: `true`)
* Switching from `console.log` to `process.stdout` shows a 15% runtime improvement.
* Using stream to pipe it to the stdout: https://github.com/nodejs/node/issues/10619#issuecomment-305964841
* Using a `LinkedList` instead of an `Array` does improve performance. By how much?

## Methods

**Using `readDirSync` with `recursive` set to `true`:**

```js
const dirents = fs.readdirSync(root, {
  withFileTypes: true,
  recursive: true,
});
```

**Walk directory using `readDirSync`:**

```js
async function walkAsyncSerial(root, config, cb) {
  const queue = [root];

  while (queue.length !== 0) {
    const root = queue.shift();

    const dirents = await fs.promises.readdir(root, { withFileTypes: true });

    for (let dirent of dirents) {
      if (dirent.isDirectory()) {
        queue.push(`${root}/${dirent.name}`);
      }
    }

    cb(dirents);
  }
}
```