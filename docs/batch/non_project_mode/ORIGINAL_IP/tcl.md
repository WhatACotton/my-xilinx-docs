---
sidebar_position: 1
---

# tcl についての解説

独自 IP モジュールを含む block design を用いたプロジェクトについて解説します。

この章では「[FPGA プログラミング大全 Xilinx 編 第 2 版](https://www.shuwasystem.co.jp/book/9784798063263.html)」の第 7 章を参考にプロジェクトを作成しています。詳細は書籍をご覧ください。

今回のチュートリアルでは以下のリポジトリを使用します。

[original_bd_test - whatacotton](https://github.com/WhatACotton/original_bd_test)

このリポジトリでは AXI_GPIO モジュールを独自 IP に換装した Block Design を構築します。

## ファイル構成

ファイル構成は以下のとおりです。

```sh
$ tree .
.
├── blockdesign
│   └── design_1.tcl
├── ip
│   └── myip_1_0
│       ├── bd
│       │   └── bd.tcl
│       ├── component.xml
│       ├── drivers
│       │   └── myip_v1_0
│       │       ├── data
│       │       │   ├── myip.mdd
│       │       │   └── myip.tcl
│       │       └── src
│       │           ├── Makefile
│       │           ├── myip.c
│       │           ├── myip.h
│       │           └── myip_selftest.c
│       ├── example_designs
│       │   ├── bfm_design
│       │   │   ├── design.tcl
│       │   │   └── myip_v1_0_tb.sv
│       │   └── debug_hw_design
│       │       ├── design.tcl
│       │       └── myip_v1_0_hw_test.tcl
│       ├── hdl
│       │   ├── myip_v1_0_S00_AXI.v
│       │   └── myip_v1_0.v
│       └── xgui
│           └── myip_v1_0.tcl
├── README.md
├── src
│   ├── const
│   │   └── test.xdc
│   └── ip
│       └── my_ip
│           └── design_1_myip_0_0.xci
└── tcl
    └── flow.tcl

18 directories, 20 files
```

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
set_property -name "ip_repo_paths" -value "./ip/myip_1_0" -objects $obj

read_xdc ./src/const/test.xdc
import_ip ./src/ip/my_ip/design_1_myip_0_0.xci
upgrade_ip  -vlnv  user.org:user:myip:1.0 [get_ips design_1_myip_0_0]

set outputDir ./synth_tmp
file mkdir $outputDir

set design_name design_1
source ./blockdesign/$design_name.tcl
generate_target all [get_files  .srcs/sources_1/bd/design_1/design_1.bd] -force
make_wrapper -files [get_files  .srcs/sources_1/bd/design_1/design_1.bd] -top -force


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

### 外部 IP の読み込み

```tcl
set_property -name "ip_repo_paths" -value "./ip/myip_1_0" -objects $obj
```

この行を追加することで外部 path を読む様になってくれます。

## 生成されるファイル群

<details>
<summary>出力結果</summary>
<p>
実行が完了すると以下のようなファイルが生成されます。

```sh
$ tree . -a -I .git
.
├── blockdesign
│   └── design_1.tcl
├── dist
│   └── design_1_wrapper.xsa
├── .gen
│   └── sources_1
│       ├── bd
│       │   └── design_1
│       │       ├── design_1.bda
│       │       ├── design_1.bxml
│       │       ├── design_1_ooc.xdc
│       │       ├── hdl
│       │       │   └── design_1_wrapper.v
│       │       ├── hw_handoff
│       │       │   └── design_1.hwh
│       │       ├── ip
│       │       │   ├── design_1_auto_pc_0
│       │       │   │   └── design_1_auto_pc_0.xml
│       │       │   ├── design_1_auto_pc_0_1
│       │       │   │   ├── design_1_auto_pc_0_ooc.xdc
│       │       │   │   ├── design_1_auto_pc_0.xml
│       │       │   │   ├── sim
│       │       │   │   │   ├── design_1_auto_pc_0.cpp
│       │       │   │   │   ├── design_1_auto_pc_0.h
│       │       │   │   │   ├── design_1_auto_pc_0_sc.cpp
│       │       │   │   │   ├── design_1_auto_pc_0_sc.h
│       │       │   │   │   ├── design_1_auto_pc_0_stub.sv
│       │       │   │   │   └── design_1_auto_pc_0.v
│       │       │   │   ├── src
│       │       │   │   │   ├── axi_protocol_converter.cpp
│       │       │   │   │   └── axi_protocol_converter.h
│       │       │   │   └── synth
│       │       │   │       └── design_1_auto_pc_0.v
│       │       │   ├── design_1_auto_pc_0_2
│       │       │   │   ├── design_1_auto_pc_0_ooc.xdc
│       │       │   │   ├── design_1_auto_pc_0.xml
│       │       │   │   ├── sim
│       │       │   │   │   ├── design_1_auto_pc_0.cpp
│       │       │   │   │   ├── design_1_auto_pc_0.h
│       │       │   │   │   ├── design_1_auto_pc_0_sc.cpp
│       │       │   │   │   ├── design_1_auto_pc_0_sc.h
│       │       │   │   │   ├── design_1_auto_pc_0_stub.sv
│       │       │   │   │   └── design_1_auto_pc_0.v
│       │       │   │   ├── src
│       │       │   │   │   ├── axi_protocol_converter.cpp
│       │       │   │   │   └── axi_protocol_converter.h
│       │       │   │   └── synth
│       │       │   │       └── design_1_auto_pc_0.v
│       │       │   ├── design_1_myip_0_1
│       │       │   │   ├── design_1_myip_0_1.xml
│       │       │   │   ├── drivers
│       │       │   │   │   └── myip_v1_0
│       │       │   │   │       ├── data
│       │       │   │   │       │   ├── myip.mdd
│       │       │   │   │       │   └── myip.tcl
│       │       │   │   │       └── src
│       │       │   │   │           ├── Makefile
│       │       │   │   │           ├── myip.c
│       │       │   │   │           ├── myip.h
│       │       │   │   │           └── myip_selftest.c
│       │       │   │   ├── sim
│       │       │   │   │   └── design_1_myip_0_1.v
│       │       │   │   └── synth
│       │       │   │       └── design_1_myip_0_1.v
│       │       │   ├── design_1_myip_0_1_1
│       │       │   │   ├── design_1_myip_0_1.xml
│       │       │   │   ├── drivers
│       │       │   │   │   └── myip_v1_0
│       │       │   │   │       ├── data
│       │       │   │   │       │   ├── myip.mdd
│       │       │   │   │       │   └── myip.tcl
│       │       │   │   │       └── src
│       │       │   │   │           ├── Makefile
│       │       │   │   │           ├── myip.c
│       │       │   │   │           ├── myip.h
│       │       │   │   │           └── myip_selftest.c
│       │       │   │   ├── sim
│       │       │   │   │   └── design_1_myip_0_1.v
│       │       │   │   └── synth
│       │       │   │       └── design_1_myip_0_1.v
│       │       │   ├── design_1_myip_0_1_2
│       │       │   │   ├── design_1_myip_0_1.xml
│       │       │   │   ├── drivers
│       │       │   │   │   └── myip_v1_0
│       │       │   │   │       ├── data
│       │       │   │   │       │   ├── myip.mdd
│       │       │   │   │       │   └── myip.tcl
│       │       │   │   │       └── src
│       │       │   │   │           ├── Makefile
│       │       │   │   │           ├── myip.c
│       │       │   │   │           ├── myip.h
│       │       │   │   │           └── myip_selftest.c
│       │       │   │   ├── sim
│       │       │   │   │   └── design_1_myip_0_1.v
│       │       │   │   └── synth
│       │       │   │       └── design_1_myip_0_1.v
│       │       │   ├── design_1_processing_system7_0_0
│       │       │   │   ├── design_1_processing_system7_0_0.xdc
│       │       │   │   ├── design_1_processing_system7_0_0.xml
│       │       │   │   ├── hdl
│       │       │   │   │   └── verilog
│       │       │   │   │       ├── design_1_processing_system7_0_0.hwdef
│       │       │   │   │       └── processing_system7_v5_5_processing_system7.v
│       │       │   │   ├── ps7_init.c
│       │       │   │   ├── ps7_init_gpl.c
│       │       │   │   ├── ps7_init_gpl.h
│       │       │   │   ├── ps7_init.h
│       │       │   │   ├── ps7_init.html
│       │       │   │   ├── ps7_init.tcl
│       │       │   │   ├── ps7_parameters.xml
│       │       │   │   └── .Xil
│       │       │   │       └── Vivado-263800-cotton-amethyst-ubuntu
│       │       │   │           └── HWH
│       │       │   ├── design_1_processing_system7_0_0_1
│       │       │   │   ├── design_1_processing_system7_0_0.xdc
│       │       │   │   ├── design_1_processing_system7_0_0.xml
│       │       │   │   ├── hdl
│       │       │   │   │   └── verilog
│       │       │   │   │       ├── design_1_processing_system7_0_0.hwdef
│       │       │   │   │       └── processing_system7_v5_5_processing_system7.v
│       │       │   │   ├── ps7_init.c
│       │       │   │   ├── ps7_init_gpl.c
│       │       │   │   ├── ps7_init_gpl.h
│       │       │   │   ├── ps7_init.h
│       │       │   │   ├── ps7_init.html
│       │       │   │   ├── ps7_init.tcl
│       │       │   │   ├── ps7_parameters.xml
│       │       │   │   ├── sim
│       │       │   │   │   ├── design_1_processing_system7_0_0.cpp
│       │       │   │   │   ├── design_1_processing_system7_0_0.h
│       │       │   │   │   ├── design_1_processing_system7_0_0_sc.cpp
│       │       │   │   │   ├── design_1_processing_system7_0_0_sc.h
│       │       │   │   │   ├── design_1_processing_system7_0_0_stub.sv
│       │       │   │   │   ├── design_1_processing_system7_0_0.sv
│       │       │   │   │   ├── design_1_processing_system7_0_0.v
│       │       │   │   │   ├── libps7.dll
│       │       │   │   │   ├── libps7.so
│       │       │   │   │   ├── libremoteport.dll
│       │       │   │   │   └── libremoteport.so
│       │       │   │   ├── sim_tlm
│       │       │   │   │   ├── b_transport_converter.h
│       │       │   │   │   ├── processing_system7_v5_5_tlm.cpp
│       │       │   │   │   ├── processing_system7_v5_5_tlm.h
│       │       │   │   │   ├── xilinx-zynq.cc
│       │       │   │   │   └── xilinx-zynq.h
│       │       │   │   ├── synth
│       │       │   │   │   └── design_1_processing_system7_0_0.v
│       │       │   │   └── .Xil
│       │       │   │       └── Vivado-264985-cotton-amethyst-ubuntu
│       │       │   │           └── HWH
│       │       │   ├── design_1_processing_system7_0_0_2
│       │       │   │   ├── design_1_processing_system7_0_0.xdc
│       │       │   │   ├── design_1_processing_system7_0_0.xml
│       │       │   │   ├── hdl
│       │       │   │   │   └── verilog
│       │       │   │   │       ├── design_1_processing_system7_0_0.hwdef
│       │       │   │   │       └── processing_system7_v5_5_processing_system7.v
│       │       │   │   ├── ps7_init.c
│       │       │   │   ├── ps7_init_gpl.c
│       │       │   │   ├── ps7_init_gpl.h
│       │       │   │   ├── ps7_init.h
│       │       │   │   ├── ps7_init.html
│       │       │   │   ├── ps7_init.tcl
│       │       │   │   ├── ps7_parameters.xml
│       │       │   │   ├── sim
│       │       │   │   │   ├── design_1_processing_system7_0_0.cpp
│       │       │   │   │   ├── design_1_processing_system7_0_0.h
│       │       │   │   │   ├── design_1_processing_system7_0_0_sc.cpp
│       │       │   │   │   ├── design_1_processing_system7_0_0_sc.h
│       │       │   │   │   ├── design_1_processing_system7_0_0_stub.sv
│       │       │   │   │   ├── design_1_processing_system7_0_0.sv
│       │       │   │   │   ├── design_1_processing_system7_0_0.v
│       │       │   │   │   ├── libps7.dll
│       │       │   │   │   ├── libps7.so
│       │       │   │   │   ├── libremoteport.dll
│       │       │   │   │   └── libremoteport.so
│       │       │   │   ├── sim_tlm
│       │       │   │   │   ├── b_transport_converter.h
│       │       │   │   │   ├── processing_system7_v5_5_tlm.cpp
│       │       │   │   │   ├── processing_system7_v5_5_tlm.h
│       │       │   │   │   ├── xilinx-zynq.cc
│       │       │   │   │   └── xilinx-zynq.h
│       │       │   │   ├── synth
│       │       │   │   │   └── design_1_processing_system7_0_0.v
│       │       │   │   └── .Xil
│       │       │   │       └── Vivado-285227-cotton-amethyst-ubuntu
│       │       │   │           └── HWH
│       │       │   ├── design_1_ps7_0_axi_periph_0
│       │       │   │   └── design_1_ps7_0_axi_periph_0.xml
│       │       │   ├── design_1_ps7_0_axi_periph_0_1
│       │       │   │   └── design_1_ps7_0_axi_periph_0.xml
│       │       │   ├── design_1_ps7_0_axi_periph_0_2
│       │       │   │   └── design_1_ps7_0_axi_periph_0.xml
│       │       │   ├── design_1_rst_ps7_0_50M_0
│       │       │   │   └── design_1_rst_ps7_0_50M_0.xml
│       │       │   ├── design_1_rst_ps7_0_50M_0_1
│       │       │   │   ├── design_1_rst_ps7_0_50M_0_board.xdc
│       │       │   │   ├── design_1_rst_ps7_0_50M_0.xdc
│       │       │   │   ├── design_1_rst_ps7_0_50M_0.xml
│       │       │   │   ├── sim
│       │       │   │   │   └── design_1_rst_ps7_0_50M_0.vhd
│       │       │   │   └── synth
│       │       │   │       └── design_1_rst_ps7_0_50M_0.vhd
│       │       │   └── design_1_rst_ps7_0_50M_0_2
│       │       │       ├── design_1_rst_ps7_0_50M_0_board.xdc
│       │       │       ├── design_1_rst_ps7_0_50M_0.xdc
│       │       │       ├── design_1_rst_ps7_0_50M_0.xml
│       │       │       ├── sim
│       │       │       │   └── design_1_rst_ps7_0_50M_0.vhd
│       │       │       └── synth
│       │       │           └── design_1_rst_ps7_0_50M_0.vhd
│       │       ├── ipshared
│       │       │   ├── 25a8
│       │       │   │   └── hdl
│       │       │   │       └── blk_mem_gen_v8_4_vhsyn_rfs.vhd
│       │       │   ├── 3111
│       │       │   │   └── hdl
│       │       │   │       └── axi_data_fifo_v2_1_vl_rfs.v
│       │       │   ├── 83df
│       │       │   │   ├── hdl
│       │       │   │   │   ├── fifo_generator_v13_2_rfs.v
│       │       │   │   │   ├── fifo_generator_v13_2_rfs.vhd
│       │       │   │   │   └── fifo_generator_v13_2_vhsyn_rfs.vhd
│       │       │   │   └── simulation
│       │       │   │       └── fifo_generator_vlog_beh.v
│       │       │   ├── 8842
│       │       │   │   └── hdl
│       │       │   │       └── proc_sys_reset_v5_0_vh_rfs.vhd
│       │       │   ├── 8fd3
│       │       │   │   └── hdl
│       │       │   │       └── verilog
│       │       │   │           ├── processing_system7_v5_5_atc.v
│       │       │   │           ├── processing_system7_v5_5_aw_atc.v
│       │       │   │           ├── processing_system7_v5_5_b_atc.v
│       │       │   │           ├── processing_system7_v5_5_trace_buffer.v
│       │       │   │           └── processing_system7_v5_5_w_atc.v
│       │       │   ├── aeb3
│       │       │   │   └── hdl
│       │       │   │       └── axi_protocol_converter_v2_1_vl_rfs.v
│       │       │   ├── b752
│       │       │   │   └── hdl
│       │       │   │       └── generic_baseblocks_v2_1_vl_rfs.v
│       │       │   ├── ec67
│       │       │   │   └── hdl
│       │       │   │       ├── axi_infrastructure_v1_1_0.vh
│       │       │   │       └── axi_infrastructure_v1_1_vl_rfs.v
│       │       │   ├── ee60
│       │       │   │   └── hdl
│       │       │   │       ├── processing_system7_vip_v1_0_15_apis.v
│       │       │   │       ├── processing_system7_vip_v1_0_15_axi_acp.v
│       │       │   │       ├── processing_system7_vip_v1_0_15_axi_gp.v
│       │       │   │       ├── processing_system7_vip_v1_0_15_axi_hp.v
│       │       │   │       ├── processing_system7_vip_v1_0_15_local_params.v
│       │       │   │       ├── processing_system7_vip_v1_0_15_reg_init.v
│       │       │   │       ├── processing_system7_vip_v1_0_15_reg_params.v
│       │       │   │       ├── processing_system7_vip_v1_0_15_unused_ports.v
│       │       │   │       └── processing_system7_vip_v1_0_vl_rfs.sv
│       │       │   ├── ef1e
│       │       │   │   └── hdl
│       │       │   │       └── lib_cdc_v1_0_rfs.vhd
│       │       │   ├── f0b4
│       │       │   │   └── hdl
│       │       │   │       └── axi_register_slice_v2_1_vl_rfs.v
│       │       │   ├── fbeb
│       │       │   │   └── hdl
│       │       │   │       ├── myip_v1_0_S00_AXI.v
│       │       │   │       └── myip_v1_0.v
│       │       │   └── ffc2
│       │       │       └── hdl
│       │       │           └── axi_vip_v1_1_vl_rfs.sv
│       │       ├── sim
│       │       │   ├── design_1.protoinst
│       │       │   └── design_1.v
│       │       └── synth
│       │           ├── design_1.hwdef
│       │           └── design_1.v
│       └── ip
│           └── design_1_myip_0_0
│               ├── design_1_myip_0_0.veo
│               ├── design_1_myip_0_0.vho
│               └── design_1_myip_0_0.xml
├── .gitignore
├── ip
│   └── myip_1_0
│       ├── bd
│       │   └── bd.tcl
│       ├── component.xml
│       ├── drivers
│       │   └── myip_v1_0
│       │       ├── data
│       │       │   ├── myip.mdd
│       │       │   └── myip.tcl
│       │       └── src
│       │           ├── Makefile
│       │           ├── myip.c
│       │           ├── myip.h
│       │           └── myip_selftest.c
│       ├── example_designs
│       │   ├── bfm_design
│       │   │   ├── design.tcl
│       │   │   └── myip_v1_0_tb.sv
│       │   └── debug_hw_design
│       │       ├── design.tcl
│       │       └── myip_v1_0_hw_test.tcl
│       ├── hdl
│       │   ├── myip_v1_0_S00_AXI.v
│       │   └── myip_v1_0.v
│       └── xgui
│           └── myip_v1_0.tcl
├── README.md
├── src
│   ├── const
│   │   └── test.xdc
│   └── ip
│       └── my_ip
│           └── design_1_myip_0_0.xci
├── .srcs
│   └── sources_1
│       ├── bd
│       │   └── design_1
│       │       ├── design_1.bd
│       │       ├── design_1.bda
│       │       └── ip
│       │           ├── design_1_auto_pc_0
│       │           │   └── design_1_auto_pc_0.xci
│       │           ├── design_1_myip_0_1
│       │           │   └── design_1_myip_0_1.xci
│       │           ├── design_1_processing_system7_0_0
│       │           │   └── design_1_processing_system7_0_0.xci
│       │           ├── design_1_ps7_0_axi_periph_0
│       │           │   └── design_1_ps7_0_axi_periph_0.xci
│       │           └── design_1_rst_ps7_0_50M_0
│       │               └── design_1_rst_ps7_0_50M_0.xci
│       └── ip
│           └── design_1_myip_0_0
│               └── design_1_myip_0_0.xci
├── synth_tmp
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
├── tcl
│   └── flow.tcl
└── .Xil
    └── design_1_wrapper_propImpl.xdc

137 directories, 221 files
```

</p>
</details>
