---
slug: write_bitstream
title: 出先でbitstreamを書き込む方法
authors: [whatacotton]
description: openFPGALoaderを使用してEDAツールが手元になくてもFPGAに書き込みを行う方法
tags: []
---

## はじめに

リモートで開発する様になると、手元には評価ボードがあるのに書き込む EDA ツールが研究室や自宅にあるといったケースが発生すると思います。今回は EDA ツールを用いずに出先の環境で FPGA に bitstream を書き込む方法を説明します。

<!-- truncate -->

## 使うツール

使うツールは[openFPGALoader](https://github.com/trabucayre/openFPGALoader)です。このツールはオープンソースの書き込みツールで、Linux、　 Mac、Windows で使うことができます。

> Universal utility for programming FPGAs. Compatible with many boards, cables and FPGA from major manufacturers (Xilinx, Altera/Intel, Lattice, Gowin, Efinix, Anlogic, Cologne Chip). openFPGALoader works on Linux, Windows and macOS.

おそらく大半のベンダーのチップに対応しています。

`openFPGALoader --detect`で接続されているかを確認できます。
正常に接続できている場合

```sh
$ openFPGALoader --detect
empty
No cable or board specified: using direct ft2232 interface
Jtag frequency : requested 6.00MHz   -> real 6.00MHz
```

接続できていない場合

```sh
$ openFPGALoader --detect
empty
No cable or board specified: using direct ft2232 interface
unable to open ftdi device: -3 (device not found)
JTAG init failed with: unable to open ftdi device
```

scp コマンドなどを利用することで、`.bit` ファイルをダウンロードし、その後書き込みます。

```sh
$ openFPGALoader -b arty <hoge>.bit
```

これで書き込むことができます。

## 参考

- [openFPGAloader を使って Mac から FPGA へデザインを書き込む #MacOSX - Qiita](https://qiita.com/mune10/items/6d10ffe2d022cbec31a9)
