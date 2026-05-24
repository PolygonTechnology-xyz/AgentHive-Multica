import Nav from '../components/layout/Nav';
import Footer from '../components/layout/Footer';
import Hero from '../components/landing/Hero';
import ValueProps from '../components/landing/ValueProps';
import HowItWorks from '../components/landing/HowItWorks';
import BuyersFreelancers from '../components/landing/BuyersFreelancers';
import Stats from '../components/landing/Stats';
import LiveHive from '../components/landing/LiveHive';
import FeaturedAgents from '../components/landing/FeaturedAgents';
import CTABanner from '../components/landing/CTABanner';

const LandingPage = () => (
  <>
    <Nav />
    <Hero />
    <ValueProps />
    <LiveHive />
    <HowItWorks />
    <BuyersFreelancers />
    <Stats />
    <FeaturedAgents layout="grid" />
    <CTABanner />
    <Footer />
  </>
);

export default LandingPage;
