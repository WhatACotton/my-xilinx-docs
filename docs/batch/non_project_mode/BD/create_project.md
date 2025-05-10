---
sidebar_position: 2
---

# プロジェクトの作成方法

## 必要なものは Block Design の tcl ファイルのみ

Block Design の tcl を入手すれば、あとは`flow.tcl`を読み込むのみなので簡単に作成できます。

あらかじめ使用するボードの BSP を指定しておくと、物理的制約を追加する際に楽になります。

### モジュールの追加・配線

![](./img/1.png)

Vitis 側で L チカを行う前提で Block Design を作成するので、AXI_GPIO と ZYNQ7 Processing System を追加します。

![](./img/2.png)

自動配線は以上の様に行います。この時 GPIO の設定で Options から自動的に配線できるらしいです。ここで設定しても良いですが、しない場合は以下に説明するように設定することもできます。

### 物理的制約の追加

次に物理的制約を追加します。BSP を指定している場合は以下のように制約を設定できるかと思います。BSP を指定しない場合は、`.xdc`ファイルを自分で用意してください。

ボードペインから接続したいピンをダブルクリックします。
![](./img/4.png)

設定に成功すると以下の様になるはずです。

![](./img/5.png)

### Block Design のエクスポート

Block Design ができたので、エクスポートします。

![](./img/6.png)

_File -> Export -> Export Block Design_

![](./img/7.png)

OK を押してエクスポートします。

:::tip
Block Design を編集したい場合は、Block Design の tcl をそのまま読み込むだけで Block Design エディタが起動します。(ただし独自モジュールなどを読み込む場合は前処理が必要です。)

```tcl
# 相対パスで指定する場合はcd で移動しておく
cd <path_to_block_design>

vivado -mode batch -source ./bd/design_1.tcl
```

一度 Block Design を作ってしまったあとはそのままそのプロジェクトを削除しても構いません。
:::
