---
sidebar_position: 1
---

# Overview

ここでは Vivado を non Project Mode で実行するための解説をします。

## non Project Mode とは

non Project Mode とは通常の Vivado とはちがい、プロジェクトをフルにコントロールできます。

AMD のドキュメントを読むと、非プロジェクトモードとありますが、non Project Mode で表記します。

公式ドキュメント: [非プロジェクト モードの使用](https://docs.amd.com/r/ja-JP/ug892-vivado-design-flows-overview/%E9%9D%9E%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88-%E3%83%A2%E3%83%BC%E3%83%89%E3%81%AE%E4%BD%BF%E7%94%A8)

ドキュメントのこの部分にメリットとデメリットが書いてありました。

> 非プロジェクト モードのほとんどの機能はプロジェクト モードでも使用できますが、プロジェクト モードの機能の一部は非プロジェクト モードでは使用できません。使用できない機能は、ソース ファイルおよび run 結果の管理、デザインおよびツール コンフィギュレーションの保存、デザイン ステータス、および IP の統合です。ただし、非プロジェクト モードでは、一部のプロセスをスキップできるので、デザインのメモリ フットプリントを削減でき、プロジェクトに関するディスク容量を節約できます。

要約すると、non Project Mode ではできないことが少しあるが、一部のプロセスをスキップできるため、プロジェクトのサイズを小さくすることができるということです。

また、non Project Mode でできないこととして、そのままでは simulation を実行できないということが挙げられます。 後述しますが、simulation を実行する際は`export simulation`を経て出力されたファイルを実行するという形を取る必要があります。また、simulation の実行についても Windows ではそのまま実行できるバッチファイルが提供されないため、ひと工夫が必要です。

しかしそれらを解決できれば問題なく開発をすることができます。

## 参考

- [Using-the-Non-Project-Design-Flow - AMD Technical Information Portal](https://docs.amd.com/r/en-US/ug888-vivado-design-flows-overview-tutorial/Using-the-Non-Project-Design-Flow)

- [Using-Non-Project-Mode - AMD Technical Information Portal](https://docs.amd.com/r/en-US/ug892-vivado-design-flows-overview/Using-Non-Project-Mode)
