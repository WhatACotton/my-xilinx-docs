---
sidebar_position: 1
---

# tcl についての解説

Block Design を用いたプロジェクトについて解説します。

今回は Zynq プロセッサを用いた Block Design を作成し、Vitis でプロジェクトを作成するために必要な`.xsa`ファイルの出力まで行います。

この章で扱う Block Design は外部 IP を使用しないため、特段ファイルを読み込む必要はありません。独自 IP を用いたプロジェクトについては次の章にて説明します。

今回のチュートリアルでは以下のリポジトリを使用します。

**[vivado_tcl_simple_bd - GitHub](https://github.com/WhatACotton/vivado_tcl_simple_bd)**

このプロジェクトは Vitis で L チカすることができるプロジェクトです。Zynq プロセッサを用いているため、Vitis で 自由に LED を制御することができます。

正常に実行されると以下の様な Block Design が生成されます。
![](./img/5.png)

## ファイル構成

ファイル構成は以下のとおりです。

```sh
$ tree .
.
├── bd
│   └── design_1.tcl
├── flow.tcl
└── README.md

1 directory, 3 files
```

エクスポートされた Block Design の tcl のみが必要です。どうやら最小構成での実装よりもファイル数が小さい様です。

## `flow.tcl`解説

<details>
<summary>全体のソースコード</summary>
<p>

```tcl
set current_dir [pwd]
create_project -in_memory
set obj [current_project]
set_property -name "board_part_repo_paths" -value "[file normalize [file join $env(HOME) ".Xilinx/Vivado/2022.2/xhub/board_store/xilinx_board_store"]]" -objects $obj

set_property -name "board_part" -value "digilentinc.com:zybo-z7-20:part0:1.0" -objects $obj
set_property -name "default_lib" -value "xil_defaultlib" -objects $obj

set_property board_part digilentinc.com:zybo-z7-20:part0:1.0 [current_project]

set outputDir ./impl
file mkdir $outputDir

set design_name design_1
source ./bd/$design_name.tcl
generate_target all [get_files .srcs/sources_1/bd/design_1/design_1.bd] -force

make_wrapper -files [get_files .srcs/sources_1/bd/design_1/design_1.bd] -top -force

read_verilog -sv [ glob .gen/sources_1/bd/design_1/hdl/design_1_wrapper.v ]
set top_module_name design_1_wrapper
set_property top $top_module_name [current_fileset]

synth_design
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

update_compile_order -fileset sim_1
set_property top pattern_tb [current_fileset -simset]

write_bitstream -force $outputDir/$top_module_name.bit

write_hw_platform -fixed -include_bit -force -file ./dist/$top_module_name.xsa

```

</p>
</details>

### ボードの指定

```tcl
set current_dir [pwd]
create_project -in_memory
set obj [current_project]
set_property -name "board_part_repo_paths" -value "[file normalize [file join $env(HOME) ".Xilinx/Vivado/2022.2/xhub/board_store/xilinx_board_store"]]" -objects $obj
```

ここでは BSP が保存されているディレクトリを読み込むための設定を行っています。BSP とは Board Support Package の略で、ボードに必要な情報をまとめたものです。これを読み込むことで、ボードの情報を取得することができます。

ここで必要になってくるのが`create_project -in_memory`です。直感的ではないですが、non Project Mode でボードを指定するためには、Project を作成する必要があります。`-in_memory`を指定することで、プロジェクトを作成しつつ、ファイルを保存しないようにしています。

### Block Design の読み込み

```tcl
set design_name design_1
# Block Designファイルの読み込み
source ./bd/$design_name.tcl
# Block Designからコードを生成
generate_target all [get_files  .srcs/sources_1/bd/design_1/design_1.bd] -force

# Block DesignのHDL wrapperを生成
make_wrapper -files [get_files  .srcs/sources_1/bd/design_1/design_1.bd] -top -force
# 生成されたファイル群の読み込み
read_verilog -sv [ glob .gen/sources_1/bd/design_1/hdl/design_1_wrapper.v ]
```

### `.xsa`ファイルの生成

```tcl
write_bitstream -force $outputDir/$top_module_name.bit
write_hw_platform -fixed -include_bit -force -file ./dist/$top_module_name.xsa
```

## 生成されるファイル群

実行が完了すると以下のようなファイルが生成されます。

<details>
<summary>出力結果</summary>
<p>

```sh
$ tree . -a -I .git
.
├── bd
│   └── design_1.tcl
├── dist
│   └── design_1_wrapper.xsa
├── flow.tcl
├── .gen
│   └── sources_1
│       └── bd
│           └── design_1
│               ├── design_1.bda
│               ├── design_1.bxml
│               ├── design_1_ooc.xdc
│               ├── hdl
│               │   └── design_1_wrapper.v
│               ├── hw_handoff
│               │   └── design_1.hwh
│               ├── ip
│               │   ├── design_1_auto_pc_0
│               │   │   ├── design_1_auto_pc_0_ooc.xdc
│               │   │   ├── design_1_auto_pc_0.xml
│               │   │   ├── sim
│               │   │   │   ├── design_1_auto_pc_0.cpp
│               │   │   │   ├── design_1_auto_pc_0.h
│               │   │   │   ├── design_1_auto_pc_0_sc.cpp
│               │   │   │   ├── design_1_auto_pc_0_sc.h
│               │   │   │   ├── design_1_auto_pc_0_stub.sv
│               │   │   │   └── design_1_auto_pc_0.v
│               │   │   ├── src
│               │   │   │   ├── axi_protocol_converter.cpp
│               │   │   │   └── axi_protocol_converter.h
│               │   │   └── synth
│               │   │       └── design_1_auto_pc_0.v
│               │   ├── design_1_axi_gpio_0_0
│               │   │   ├── design_1_axi_gpio_0_0_board.xdc
│               │   │   ├── design_1_axi_gpio_0_0_ooc.xdc
│               │   │   ├── design_1_axi_gpio_0_0.xdc
│               │   │   ├── design_1_axi_gpio_0_0.xml
│               │   │   ├── sim
│               │   │   │   └── design_1_axi_gpio_0_0.vhd
│               │   │   └── synth
│               │   │       └── design_1_axi_gpio_0_0.vhd
│               │   ├── design_1_processing_system7_0_0
│               │   │   ├── design_1_processing_system7_0_0.xdc
│               │   │   ├── design_1_processing_system7_0_0.xml
│               │   │   ├── hdl
│               │   │   │   └── verilog
│               │   │   │       ├── design_1_processing_system7_0_0.hwdef
│               │   │   │       └── processing_system7_v5_5_processing_system7.v
│               │   │   ├── ps7_init.c
│               │   │   ├── ps7_init_gpl.c
│               │   │   ├── ps7_init_gpl.h
│               │   │   ├── ps7_init.h
│               │   │   ├── ps7_init.html
│               │   │   ├── ps7_init.tcl
│               │   │   ├── ps7_parameters.xml
│               │   │   ├── sim
│               │   │   │   ├── design_1_processing_system7_0_0.cpp
│               │   │   │   ├── design_1_processing_system7_0_0.h
│               │   │   │   ├── design_1_processing_system7_0_0_sc.cpp
│               │   │   │   ├── design_1_processing_system7_0_0_sc.h
│               │   │   │   ├── design_1_processing_system7_0_0_stub.sv
│               │   │   │   ├── design_1_processing_system7_0_0.sv
│               │   │   │   ├── design_1_processing_system7_0_0.v
│               │   │   │   ├── libps7.dll
│               │   │   │   ├── libps7.so
│               │   │   │   ├── libremoteport.dll
│               │   │   │   └── libremoteport.so
│               │   │   ├── sim_tlm
│               │   │   │   ├── b_transport_converter.h
│               │   │   │   ├── processing_system7_v5_5_tlm.cpp
│               │   │   │   ├── processing_system7_v5_5_tlm.h
│               │   │   │   ├── xilinx-zynq.cc
│               │   │   │   └── xilinx-zynq.h
│               │   │   ├── synth
│               │   │   │   └── design_1_processing_system7_0_0.v
│               │   │   └── .Xil
│               │   │       └── Vivado-204153-cotton-amethyst-ubuntu
│               │   │           └── HWH
│               │   ├── design_1_ps7_0_axi_periph_0
│               │   │   └── design_1_ps7_0_axi_periph_0.xml
│               │   └── design_1_rst_ps7_0_50M_0
│               │       ├── design_1_rst_ps7_0_50M_0_board.xdc
│               │       ├── design_1_rst_ps7_0_50M_0.xdc
│               │       ├── design_1_rst_ps7_0_50M_0.xml
│               │       ├── sim
│               │       │   └── design_1_rst_ps7_0_50M_0.vhd
│               │       └── synth
│               │           └── design_1_rst_ps7_0_50M_0.vhd
│               ├── ipshared
│               │   ├── 25a8
│               │   │   └── hdl
│               │   │       └── blk_mem_gen_v8_4_vhsyn_rfs.vhd
│               │   ├── 3111
│               │   │   └── hdl
│               │   │       └── axi_data_fifo_v2_1_vl_rfs.v
│               │   ├── 6219
│               │   │   └── hdl
│               │   │       └── axi_gpio_v2_0_vh_rfs.vhd
│               │   ├── 66ea
│               │   │   └── hdl
│               │   │       └── axi_lite_ipif_v3_0_vh_rfs.vhd
│               │   ├── 83df
│               │   │   ├── hdl
│               │   │   │   ├── fifo_generator_v13_2_rfs.v
│               │   │   │   ├── fifo_generator_v13_2_rfs.vhd
│               │   │   │   └── fifo_generator_v13_2_vhsyn_rfs.vhd
│               │   │   └── simulation
│               │   │       └── fifo_generator_vlog_beh.v
│               │   ├── 8842
│               │   │   └── hdl
│               │   │       └── proc_sys_reset_v5_0_vh_rfs.vhd
│               │   ├── 8fd3
│               │   │   └── hdl
│               │   │       └── verilog
│               │   │           ├── processing_system7_v5_5_atc.v
│               │   │           ├── processing_system7_v5_5_aw_atc.v
│               │   │           ├── processing_system7_v5_5_b_atc.v
│               │   │           ├── processing_system7_v5_5_trace_buffer.v
│               │   │           └── processing_system7_v5_5_w_atc.v
│               │   ├── a040
│               │   │   └── hdl
│               │   │       └── interrupt_control_v3_1_vh_rfs.vhd
│               │   ├── aeb3
│               │   │   └── hdl
│               │   │       └── axi_protocol_converter_v2_1_vl_rfs.v
│               │   ├── b752
│               │   │   └── hdl
│               │   │       └── generic_baseblocks_v2_1_vl_rfs.v
│               │   ├── ec67
│               │   │   └── hdl
│               │   │       ├── axi_infrastructure_v1_1_0.vh
│               │   │       └── axi_infrastructure_v1_1_vl_rfs.v
│               │   ├── ee60
│               │   │   └── hdl
│               │   │       ├── processing_system7_vip_v1_0_15_apis.v
│               │   │       ├── processing_system7_vip_v1_0_15_axi_acp.v
│               │   │       ├── processing_system7_vip_v1_0_15_axi_gp.v
│               │   │       ├── processing_system7_vip_v1_0_15_axi_hp.v
│               │   │       ├── processing_system7_vip_v1_0_15_local_params.v
│               │   │       ├── processing_system7_vip_v1_0_15_reg_init.v
│               │   │       ├── processing_system7_vip_v1_0_15_reg_params.v
│               │   │       ├── processing_system7_vip_v1_0_15_unused_ports.v
│               │   │       └── processing_system7_vip_v1_0_vl_rfs.sv
│               │   ├── ef1e
│               │   │   └── hdl
│               │   │       └── lib_cdc_v1_0_rfs.vhd
│               │   ├── f0b4
│               │   │   └── hdl
│               │   │       └── axi_register_slice_v2_1_vl_rfs.v
│               │   └── ffc2
│               │       └── hdl
│               │           └── axi_vip_v1_1_vl_rfs.sv
│               ├── sim
│               │   ├── design_1.protoinst
│               │   └── design_1.v
│               └── synth
│                   ├── design_1.hwdef
│                   └── design_1.v
├── .gitignore
├── impl
│   ├── clock_util.rpt
│   ├── design_1_wrapper.bit
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
│   ├── top_impl_netlist.v
│   └── top_impl.xdc
├── README.md
├── .srcs
│   └── sources_1
│       └── bd
│           └── design_1
│               ├── design_1.bd
│               ├── design_1.bda
│               └── ip
│                   ├── design_1_auto_pc_0
│                   │   └── design_1_auto_pc_0.xci
│                   ├── design_1_axi_gpio_0_0
│                   │   └── design_1_axi_gpio_0_0.xci
│                   ├── design_1_processing_system7_0_0
│                   │   └── design_1_processing_system7_0_0.xci
│                   ├── design_1_ps7_0_axi_periph_0
│                   │   └── design_1_ps7_0_axi_periph_0.xci
│                   └── design_1_rst_ps7_0_50M_0
│                       └── design_1_rst_ps7_0_50M_0.xci
├── vivado.jou
├── vivado.log
└── .Xil
    └── design_1_wrapper_propImpl.xdc

76 directories, 123 files

```

</p>
</details>

## 参考

- [block-design-in-nonproject-mode](https://adaptivesupport.amd.com/s/question/0D52E00006iHs1mSAC/block-design-in-nonproject-mode?language=en_US)
- [Silicon Labs EFM32：BSP とは何ですか？ - 半導体事業 - マクニカ](https://www.macnica.co.jp/business/semiconductor/support/faqs/silicon_labs/112081/)
- [Vivado のプロジェクトを git で管理するための最小限のファイル構成 #FPGA - Qiita](https://qiita.com/nahitafu/items/b8bfee046b197c0fb833)
- [Vivado でプロジェクトのエクスポートを極める #FPGA - Qiita](https://qiita.com/nahitafu/items/de4b295ea60ce6173a83)
