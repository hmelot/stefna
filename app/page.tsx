import Nav from './components/Nav'
import Hero from './components/Hero'
import DashboardMockup from './components/DashboardMockup'
import Problem from './components/Problem'
import BeforeAfter from './components/BeforeAfter'
import HowItWorks from './components/HowItWorks'
import Cajas from './components/Cajas'
import ComparisonTable from './components/ComparisonTable'
import Pricing from './components/Pricing'
import SocialProof from './components/SocialProof'
import FAQ from './components/FAQ'
import Footer from './components/Footer'

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <DashboardMockup />
      <Problem />
      <BeforeAfter />
      <HowItWorks />
      <Cajas />
      <ComparisonTable />
      <Pricing />
      <SocialProof />
      <FAQ />
      <Footer />
    </main>
  )
}
