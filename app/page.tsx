import Nav from './components/Nav'
import Hero from './components/Hero'
import Problem from './components/Problem'
import HowItWorks from './components/HowItWorks'
import Cajas from './components/Cajas'
import Pricing from './components/Pricing'
import Cases from './components/Cases'
import FAQ from './components/FAQ'
import Footer from './components/Footer'

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <Problem />
      <HowItWorks />
      <Cajas />
      <Pricing />
      <Cases />
      <FAQ />
      <Footer />
    </main>
  )
}
