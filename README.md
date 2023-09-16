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

## Notes
* Almost no difference between async and sync `fs.readdir` (recursive: `true`)
* Switching from `console.log` to `process.stdout` shows a 15% runtime improvement.
* Using stream to pipe it to the stdout: https://github.com/nodejs/node/issues/10619#issuecomment-305964841