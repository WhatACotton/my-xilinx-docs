---
sidebar_position: 1
---

# シミュレーションのエクスポート

Minimal なサンプルプロジェクトを通じて non Project Mode についての感覚をつかみます。

今回のチュートリアルでは以下のリポジトリを使用します。

**[vivado_tcl_minimal_example - whatacotton](https://github.com/WhatACotton/vivado_tcl_minimal_example)**

このリポジトリは L チカを行うプロジェクトです。そのまま実行すると Zybo Z7-20 のボードで動かせる bitstream が生成されます。

## ファイル構成

ファイル構成は以下のとおりです。

```sh
$ tree .
.
├── flow.tcl
├── Makefile
├── README.md
├── sim.tcl
└── src
    ├── pin.xdc
    ├── tb.v
    └── top.v

1 directory, 7 files
```

これしかファイルがないのにうまく動くのかと思う方もおられるとは思いますが、最小構成でファイルを揃えるとしたらこれしか必要ありません。以下はファイルについての説明です。

- `top.v` 回路の実体が書いてあるファイル。
- `tb.v` テスト用ファイル。
- `pin.xdc` 制約ファイル。物理ピンとコード上でのピンの接続を指定する

`sim.tcl`は simulation を行うためのスクリプトで、`flow.tcl`は bitstream の生成まで行うスクリプトです。

## `sim.tcl` の実行

ではスクリプトを実行してみましょう。

(実行例は Linux におけるものです。実行コマンドについては Windows の場合、適宜読み替えてください。)

```sh
$ vivado -mode batch -source sim.tcl

****** Vivado v2022.2 (64-bit)
  **** SW Build 3671981 on Fri Oct 14 04:59:54 MDT 2022
  **** IP Build 3669848 on Fri Oct 14 08:30:02 MDT 2022
    ** Copyright 1986-2022 Xilinx, Inc. All Rights Reserved.

source sim.tcl
# set top_module_name top
# set_property top tb [current_fileset -simset]
# read_verilog ./src/top.v
# read_verilog ./src/tb.v
# export_simulation -force -simulator xsim
INFO: [SIM-utils-72] Using boost library from '/home/cotton/hdd/tools/Xilinx/Vivado/2022.2/tps/boost_1_72_0'
INFO: [exportsim-Tcl-8] Generating simulation products for BD/IPs (if any)...
INFO: [exportsim-Tcl-35] Exporting simulation files for "XSIM" (Xilinx Vivado Simulator)...
INFO: [exportsim-Tcl-29] Pre-compiled simulation library path: '/home/cotton/hdd/tools/Xilinx/Vivado/2022.2/data/xsim'
INFO: [exportsim-Tcl-29] Script generated: '/home/cotton/Documents/tcl_example/export_sim/xsim/tb.sh'
INFO: [Common 17-206] Exiting Vivado at Wed May  7 22:04:01 2025...
```

どうでしょうか。以上のようになったでしょうか。ファイルパスに多少の違いはあれど、正常に動くかと思います。またバージョンによって動かない場合もあると思いますが、その場合は教えていただきたいです。

## `sim.tcl`の解説

では、`sim.tcl`について説明していきたいと思います。それぞれの行にコメントをつけています。

```tcl
# simulationのtop moduleを"tb"にset
set_property top tb [current_fileset -simset]

# source codeの読み込み
read_verilog ./src/top.v
read_verilog ./src/tb.v

# simulationのexport (xsimを使用)
export_simulation -force -simulator xsim
```

テストベンチを実行するためのコマンドはたったこれだけです。やっていることも最低限で、simulation のための top module の指定と、ソースコードの読み込み、simulation の export しかやっていません。

:::tip
non Project Mode の魅力は必要最低限の動作を最小限の労力で行うことができるのみならず、再現性のある環境を**展開**できることでもあると考えています。zip ファイルなどですべてのファイルを送信してもらえば環境の再現はできますが、これにもデメリットがあり、**環境依存のファイルパスが中に含まれていることがある**のです。これが原因で誤作動を起こす可能性は否定できません。non Project Mode では必要なファイルは**後から自動生成される**ため、必要なファイルだけを適切に送信することができます。
:::

## 参考

- [read_verilog - ug835](https://docs.amd.com/r/2024.1-English/ug835-vivado-tcl-commands/read_verilog)
- [export_simulation - ug835](https://docs.amd.com/r/2024.1-English/ug835-vivado-tcl-commands/export_simulation)
- [export_simulation - ug900](https://docs.amd.com/r/en-US/ug900-vivado-logic-simulation/export_ip_user_files)
