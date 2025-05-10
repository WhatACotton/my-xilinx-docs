---
slug: icarus_verilog
title: Icarus Verilogを用いて高速なデバッグを実現する
authors: [whatacotton]
tags: []
---

# Icarus Verilog を用いて高速なデバッグを実現する

## はじめに

Vivado のシミュレーターを使用してテストベンチを実行する場合、最低でも数十秒〜数分かかると思います。

Vivado 内蔵の IP モジュールを使用している場合はしょうがないですが、小規模なロジックで正確性もあまり必要ない場合は、サードパーティ製の Verilog 実行環境を用いることで時間を短縮することができます。

またこの様な実行環境は Vivado などの EDA ツールを使用する必要がないため、ディスク容量を圧迫することがありません。

<!-- truncate -->

## Icarus Verilog

私がよく使っている実行環境は`Icarus Verilog`というものです。

[Icarus Verilog](https://bleyer.org/icarus/)

> Icarus Verilog is an implementation of the Verilog hardware description language compiler that generates netlists in the desired format (EDIF) and a simulator. It supports the 1995, 2001 and 2005 versions of the standard, portions of SystemVerilog, and some extensions.
> (Wikipedia より)

### 使い方

iverilog の実行
System Verilog の場合は`-g2012`オプションをつけることで読み込めます。
top module の指定は`-s`で行います。

```sh
$ iverilog <target>
```

すると a.out というファイルが生成されます。`-o`オプションで出力ファイル名を指定できます。

`vvp ./a.out`を実行するとシミュレーションが実行されます。

`./a.out`だけでも実行できます。

## 参考

Icarus Verilog に関しては日本語の文献もそこそこあるので下記リンクよりご確認ください。

- [ディジタル回路と Verilog 入門 - vlsi.jp](https://vlsi.jp/DigitalCircuit_And_Verilog.html#%E3%83%87%E3%82%A3%E3%82%B8%E3%82%BF%E3%83%AB%E5%9B%9E%E8%B7%AF%E3%81%A8verilog%E5%85%A5%E9%96%80)
- [Icarus Verilog の導入と AND 回路のシミュレーション #VerilogHDL - Qiita](https://qiita.com/aurueps/items/72444c9b44a6940825f1)
- [Linux におけるディジタル回路設計の環境構築 #Verilog - Qiita](https://qiita.com/skm_bnn/items/2a1727fa4c3349725bed)
