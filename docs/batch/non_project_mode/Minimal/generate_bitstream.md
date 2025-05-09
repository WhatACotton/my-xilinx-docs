---
sidebar_position: 2
---

# ビットストリームの生成

## `flow.tcl`の実行

今度はビットストリームの生成まで行ってみましょう。

```sh
$ vivado -mode batch -source flow.tcl

****** Vivado v2022.2 (64-bit)
  **** SW Build 3671981 on Fri Oct 14 04:59:54 MDT 2022
  **** IP Build 3669848 on Fri Oct 14 08:30:02 MDT 2022
    ** Copyright 1986-2022 Xilinx, Inc. All Rights Reserved.

source flow.tcl
# set top_module_name top
# set outputDir ./synth_tmp
# file mkdir $outputDir
# set_property top $top_module_name [current_fileset]
# set_part xc7z020clg400-1
INFO: [Coretcl 2-1500] The part has been set to 'xc7z020clg400-1' for the current project only. Run set_part -help for more details. To evaluate different speed grades in the current design, use the set_speed_grade command, or use the open_checkpoint -part command to change the part used by an existing checkpoint design.
# read_verilog ./src/top.v
# read_verilog ./src/tb.v
# read_xdc ./src/pin.xdc
# synth_design -top $top_module_name
Command: synth_design -top top
Starting synth_design
Using part: xc7z020clg400-1
Attempting to get a license for feature 'Synthesis' and/or device 'xc7z020'
INFO: [Common 17-349] Got license for feature 'Synthesis' and/or device 'xc7z020'
INFO: [Device 21-403] Loading part xc7z020clg400-1
...
```

うまく実行されれば、`synth_tmp`というフォルダに、`top.bit`というファイルが生成されると思います。

これがビットストリームファイルでこれを FPGA に書き込むことで、目的の動作をさせることができます。

ちなみにビットストリームの書き込みは[openFPGALoader](https://github.com/trabucayre/openFPGALoader)というものを使うことによって、macOS、Linux、Windows で書き込むことができます。このアプリケーションは EDA ツールを必要としないため、出先の環境でも USB などで接続さえできれば書き込みが可能です。私は普段 Linux の開発機に SSH して開発していますが、MacBook から FPGA に書き込みをしています。

openFPGALoader を用いた書き込みについてはこちらの記事を参考にしてください。

[出先でビットストリームを書き込む方法 - Vivado in CLI](/blog/write_bitstream)

## `flow.tcl`の解説

ここでは`flow.tcl`の解説をしていきます。

### 初期設定

```tcl
# 変数定義 ここではtop_module_nameを"top"に指定している。(setはtclの組み込み関数)
set top_module_name top
# 結果の出力先ファイルの指定
set outputDir ./synth_tmp
# ディレクトリの作成(tclの組み込み関数)
file mkdir $outputDir
# top moduleの指定
set_property top $top_module_name [current_fileset]
# 使用するchipの指定(Zybo Z7-20)
set_part xc7z020clg400-1
```

### ソースコードの読み込み

`read_verilog` は System Verilog ファイルを読み込む際、`-sv`オプションをつける必要があります。

```tcl
# ソースファイルの読み込み
read_verilog ./src/top.v
read_verilog ./src/tb.v
read_xdc ./src/pin.xdc
```

### 論理合成

```tcl
# top moduleを指定し、論理合成
synth_design -top $top_module_name
# checkpointファイルの生成
write_checkpoint -force $outputDir/post_synth

# 合成結果のレポート出力
# timing summary
report_timing_summary -file $outputDir/post_synth_timing_summary.rpt
# synth power
report_power -file $outputDir/post_synth_power.rpt
# clock interaction
report_clock_interaction -delay_type min_max -file $outputDir/post_synth_clock_interaction.rpt
# fanout report
report_high_fanout_nets -fanout_greater_than 200 -max_nets 50 -file $outputDir/post_synth_high_fanout_nets.rpt
```

### 最適化・配置配線

```tcl
# 最適化を行う
opt_design
# 配置
place_design
# 最適化
phys_opt_design
# checkpointファイルの生成
write_checkpoint -force $outputDir/post_place
# timing summaryの生成
report_timing_summary -file $outputDir/post_place_timing_summary.rpt

# 配線
route_design
# checkpointファイルの生成
write_checkpoint -force $outputDir/post_route

# 配線後のレポート出力
# timing summary
report_timing_summary -file $outputDir/post_route_timing_summary.rpt
# timing violation ←ここでcritical pathにtiming violationがあった場合にreportが出る。
report_timing -max_paths 100 -path_type summary -slack_lesser_than 0 -file $outputDir/post_route_setup_timing_violations.rpt
# clock関連
report_clock_utilization -file $outputDir/clock_util.rpt
# 配線関連
report_utilization -file $outputDir/post_route_util.rpt
# 電力関連
report_power -file $outputDir/post_route_power.rpt
# DRCレポート
report_drc -file $outputDir/post_imp_drc.rpt
# netlistの生成
write_verilog -force $outputDir/top_impl_netlist.v
# xdcファイルの生成
write_xdc -no_fixed_only -force $outputDir/top_impl.xdc
```

ちなみに timing violation が発生した場合は、最適化処理が行われます。

### ビットストリームの生成

```tcl
# ビットストリームの生成
write_bitstream -force $outputDir/$top_module_name.bit
```

以上が`flow.tcl`となります。レポート類は大体テンプレートがあり、それを元に作成していますが、そのほかのファイルの読み込み、chip の指定などは基本的に場合に応じて変更しないといけません。

:::tip
また、レポート類は基本的に出すようにしていますが、必要に応じて出力しないこともできます。出力するファイルの出し分けができるところも non Project Mode の利点です。
:::

## 生成されるファイル群

実行が完了すると以下のようなファイルが生成されます。

<details>
<summary>出力結果</summary>
<p>

```sh
$ tree . -a -I .git
.
├── flow.tcl
├── .gitignore
├── Makefile
├── README.md
├── sim.tcl
├── src
│   ├── pin.xdc
│   ├── tb.v
│   └── top.v
├── synth_tmp
│   ├── clock_util.rpt
│   ├── post_imp_drc.rpt
│   ├── post_place.dcp
│   ├── post_place_timing_summary.rpt
│   ├── post_route.dcp
│   ├── post_route_power.rpt
│   ├── post_route_setup_timing_violations.rpt
│   ├── post_route_timing_summary.rpt
│   ├── post_route_util.rpt
│   ├── post_synth_clock_interaction.rpt
│   ├── post_synth.dcp
│   ├── post_synth_high_fanout_nets.rpt
│   ├── post_synth_power.rpt
│   ├── post_synth_timing_summary.rpt
│   ├── top.bit
│   ├── top_impl_netlist.v
│   └── top_impl.xdc
└── .Xil
    └── top_propImpl.xdc

3 directories, 26 files
```

</p>
</details>

:::tip
`.dcp`ファイルは`write_checkpoint`を実行すると得られる中間ファイルです。この`.dcp`ファイルを処理することによってソースを秘匿しながら情報を提供することもできるみたいです。[^1]
:::

### 参考

- [Using-the-Non-Project-Design-Flow - AMD Technical Information Portal](https://docs.amd.com/r/2024.1-English/ug888-vivado-design-flows-overview-tutorial/Using-the-Non-Project-Design-Flow)

- [vivado_non_project_example - GitHub](https://github.com/kdurant/vivado_non_project_example)

[^1]: [Vivado で自作 IP コアのソースを暗号化して秘匿することのススメ #FPGA - Qiita](https://qiita.com/nahitafu/items/79bf09a73165565fef36#%E3%81%AF%E3%81%98%E3%82%81%E3%81%AB)
