import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'バッチモードの使い方を解説',
    Svg: require('@site/static/img/square.svg').default,
    description: (
      <>
        Vivadoのバッチモードを使って、XilinxのFPGAをCLIから操作する方法を解説します。       
      </>
    ),
  },
  {
    title: 'SSHでのリモート操作',
    Svg: require('@site/static/img/square.svg').default,
    description: (
      <>
       このドキュメントを読むことによって、VivadoをSSHでリモート操作する方法を学ぶことができます。RDPやVNCを使わずに、CLIからVivadoを操作する方法を解説しています。
      </>
    ),
  },
  {
    title: '独自IPモジュールを用いたBlock Designの作成まで',
    Svg: require('@site/static/img/square.svg').default,

    description: (
      <>
        Vivadoのバッチモードを使って、独自IPモジュールを用いたBlock Designの作成までを解説します。
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
