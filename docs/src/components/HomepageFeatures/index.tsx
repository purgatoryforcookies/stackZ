import Heading from '@theme/Heading';


type FeatureItem = {
  title: string;
  Svg?: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Stacks',
    Svg: require('@site/static/img/bittikartta.svg').default,
    description: (
      <>

      </>
    ),
  },
  {
    title: 'Terminals',
    Svg: require('@site/static/img/bittikartta2.svg').default,
    description: (
      <>

      </>
    ),
  },
  {
    title: 'Workflows',
    Svg: require('@site/static/img/bittikartta3.svg').default,

    description: (
      <>

      </>
    ),
  }
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className='flex flex-col items-center w-80'>
      {Svg ? <Svg className='size-32 fill-primary' role="img" /> : null}
      <Heading as="h3" className='pt-3'>{title}</Heading>
      <p className='text-center'>{description}</p>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <div className="flex flex-col justify-center gap-[10%] items-center h-full md:flex-row">
      {FeatureList.map((props, idx) => (
        <Feature key={idx} {...props} />
      ))}
    </div>
  );
}
