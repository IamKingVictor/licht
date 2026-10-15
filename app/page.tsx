import HomeView from '@/components/home/HomeView'
import { SITE } from '@/lib/config'

export default function HomePage() {
  const ld = {
    '@context': 'https://schema.org', '@type': 'Store', name: SITE.name, description: SITE.description, url: SITE.url,
    image: `${SITE.url}/images/products/led-vanity-mirror.jpg`, slogan: SITE.tagline,
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <HomeView />
    </>
  )
}
