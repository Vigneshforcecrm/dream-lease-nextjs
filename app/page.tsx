import {Hero} from '../components/Hero'
import {Header} from '../components/Header'
import {Footer} from '../components/Footer'
import { ProductShowcase } from '@/components/ProductShowcase'

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <ProductShowcase />
      <Footer />
    </main>
  )
}