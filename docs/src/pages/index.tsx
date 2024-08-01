import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import HomepageFeatures from '@site/src/components/HomepageFeatures'
import Heading from '@theme/Heading'


function HomepageHeader() {
    const { siteConfig } = useDocusaurusContext()
    return (
        <header className="p-[4rem] text-center relative overflow-hidden ">
            <div className="container">
                <Heading as="h1" className="hero__title">
                    {siteConfig.title}
                </Heading>
                <p className="hero__subtitle">{siteConfig.tagline}</p>
                <div className="flex items-center justify-center">
                    <Link className="button button--secondary button--lg" to="/docs/intro">
                        Jump to docs
                    </Link>
                </div>
            </div>
        </header>
    )
}

export default function Home(): JSX.Element {
    const { siteConfig } = useDocusaurusContext()
    return (
        <Layout title={`${siteConfig.title}-docs`} description="Documentation for stackZ">
            <HomepageHeader />
            <main className="flex justify-center items-center ">
                <HomepageFeatures />
            </main>
            <div className='w-full flex justify-center pt-[200px] flex-col items-center'>
                <img src={require('@site/static/img/screenshot.png').default}
                    className='w-[90%]' />

                <div className='flex flex-col items-center'>
                    <img src={require('@site/static/img/remoteEnv.png').default}
                        className='w-900px]' />
                    <img src={require('@site/static/img/editor.png').default}
                        className='w-[1000px]' />
                    <img src={require('@site/static/img/settings.png').default}
                        className='w-[800px]' />
                </div>
            </div>
        </Layout>
    )
}
