---
sidebar_position: 1
---

# tcl についての解説

このチュートリアルでは、Xilinx 社 提供の Vivado 内蔵の IP モジュールを使用したプロジェクトについて解説します。

今回のチュートリアルでは以下のリポジトリを使用します。

[vivado_tcl_with_xilinx_ip - whatacotton](https://github.com/WhatACotton/vivado_tcl_with_xilinx_ip)

このリポジトリも L チカを行うプロジェクトですが、今回は`clk_wizard`という Xilinx が提供する IP モジュールを用いて clock を用いた正確なクロック管理を行います。

## 最小構成との違い

この章は前回の最小構成のプロジェクトとは異なり、IP モジュール定義ファイルである`.xci`ファイルを使用します。

また、読み込んだ IP モジュールから Verilog を自動生成します。

## ファイル構成

今回のファイル構成は以下のとおりです。

```sh
$ tree .
.
├── flow.tcl
├── README.md
└── src
    ├── constr
    │   └── zybo.xdc
    ├── hdl
    │   ├── gen_1hz.sv
    │   └── top.sv
    └── ip
        └── clk_core.xci

4 directories, 6 files
```

IP モジュールを使用する場合もファイル一つを持ってくるだけで良い点はとても便利だと思います。

## `flow.tcl`解説

では`flow.tcl`について解説していきます。前回解説したものに関しては割愛させていただきます。

<details>
<summary>全体のソースコード</summary>
<p>
```tcl
set top_module_name top
set outputDir ./impl
file mkdir $outputDir
set_part xc7z020clg400-1
 
import_ip ./src/ip/clk_core.xci
upgrade_ip  -vlnv xilinx.com:ip:clk_wiz:6.0  [get_ips clk_core]

generate_target all [get_ips clk_core] -force

read_verilog -sv [ glob ./src/hdl/*.sv ]
read_verilog [ glob .gen/sources_1/ip/clk_core/*.v ]
read_xdc [ glob ./src/constr/*.xdc]

set top_module_name "top"
set_property top $top_module_name [current_fileset]

synth_design -top $top_module_name
write_checkpoint -force $outputDir/post_synth
report_timing_summary -file $outputDir/post_synth_timing_summary.rpt
report_power -file $outputDir/post_synth_power.rpt
report_clock_interaction -delay_type min_max -file $outputDir/post_synth_clock_interaction.rpt
report_high_fanout_nets -fanout_greater_than 200 -max_nets 50 -file $outputDir/post_synth_high_fanout_nets.rpt

opt_design
place_design
phys_opt_design
write_checkpoint -force $outputDir/post_place
report_timing_summary -file $outputDir/post_place_timing_summary.rpt

route_design
write_checkpoint -force $outputDir/post_route
report_timing_summary -file $outputDir/post_route_timing_summary.rpt
report_timing -max_paths 100 -path_type summary -slack_lesser_than 0 -file $outputDir/post_route_setup_timing_violations.rpt
report_clock_utilization -file $outputDir/clock_util.rpt
report_utilization -file $outputDir/post_route_util.rpt
report_power -file $outputDir/post_route_power.rpt
report_drc -file $outputDir/post_imp_drc.rpt
write_verilog -force $outputDir/top_impl_netlist.v
write_xdc -no_fixed_only -force $outputDir/top_impl.xdc

write_bitstream -force $outputDir/$top_module_name.bit

````
</p>
</details>

### IP の読み込み

```tcl
import_ip ./src/ip/clk_core.xci
upgrade_ip  -vlnv xilinx.com:ip:clk_wiz:6.0  [get_ips clk_core]

# 読み込んだIPモジュールからVerilogを自動生成
generate_target all [get_ips clk_core]  -force
````

`import_ip`より、`.xci`ファイルから IP モジュールを読み込みます。

ただ読み込んだだけだと IP モジュールにロックがかかっているので、`upgrade_ip`を実行して更新処理をしています。また、`xilinx.com:ip:clk_wiz:6.0`という文字列は`.xci`ファイル内の、以下の記述に基づいています。

```json
"component_reference": "xilinx.com:ip:clk_wiz:6.0",
```

### ソースコードの読み込み

```tcl
read_verilog  [ glob .gen/sources_1/ip/clk_core/*.v ]
```

自動生成を行うと、`.gen`ディレクトリが生成されます。その中に生成された Verilog を読み込んでいます。

:::tip
また、このコマンドによって Verilog ファイルを読み込む際、critical warning が出ますが、これは ip から Verilog を生成した際に sub-design として読み込まれるため、新しく Verilog を読み込んでしまうと、sub-design として読み込まれたものと同じファイルが存在することになり、警告がでてしまうのです。

まだこの警告に起因したエラーを引き起こしたことがないのですが、もし良い解決方法があれば教えていただきたいです。

```tcl
CRITICAL WARNING: [filemgmt 20-1440] File '/home/cotton/Documents/vivado_tcl_with_xilinx_ip/.gen/sources_1/ip/clk_core/clk_core_clk_wiz.v' already exists in the project as a part of sub-design file '/home/cotton/Documents/vivado_tcl_with_xilinx_ip/.srcs/sources_1/ip/clk_core/clk_core.xci'. Explicitly adding the file outside the scope of the sub-design can lead to unintended behaviors and is not recommended.
CRITICAL WARNING: [filemgmt 20-1440] File '/home/cotton/Documents/vivado_tcl_with_xilinx_ip/.gen/sources_1/ip/clk_core/clk_core.v' already exists in the project as a part of sub-design file '/home/cotton/Documents/vivado_tcl_with_xilinx_ip/.srcs/sources_1/ip/clk_core/clk_core.xci'. Explicitly adding the file outside the scope of the sub-design can lead to unintended behaviors and is not recommended.
```

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
├── .gen
│   └── sources_1
│       └── ip
│           └── clk_core
│               ├── clk_core_board.xdc
│               ├── clk_core_clk_wiz.v
│               ├── clk_core_ooc.xdc
│               ├── clk_core.v
│               ├── clk_core.veo
│               ├── clk_core.xdc
│               ├── clk_core.xml
│               ├── doc
│               │   └── clk_wiz_v6_0_changelog.txt
│               ├── mmcm_pll_drp_func_7s_mmcm.vh
│               ├── mmcm_pll_drp_func_7s_pll.vh
│               ├── mmcm_pll_drp_func_us_mmcm.vh
│               ├── mmcm_pll_drp_func_us_pll.vh
│               ├── mmcm_pll_drp_func_us_plus_mmcm.vh
│               └── mmcm_pll_drp_func_us_plus_pll.vh
├── .gitignore
├── impl
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
├── README.md
├── src
│   ├── constr
│   │   └── zybo.xdc
│   ├── hdl
│   │   ├── gen_1hz.sv
│   │   └── top.sv
│   └── ip
│       └── clk_core.xci
├── .srcs
│   └── sources_1
│       └── ip
│           └── clk_core
│               └── clk_core.xci
└── .Xil
    └── top_propImpl.xdc

15 directories, 40 files
```

</p>
</details>

:::warning

### スクリプトを再度実行する場合

再度実行する場合は、`.srcs`ファイルを削除してください。これがあると、`import_ip`コマンドで IP モジュールの読み込みに失敗します。

Vivado 側では`-force`オプションをつけて実行することで強制的に上書きしてくださいとヒントを教えてくれるのですが、バージョンによっては`-force`オプションが存在しない場合があります。

この先の解説でも同じですので、注意してください。
:::
