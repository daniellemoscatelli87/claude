import { Nav } from '../components/Nav';
import { Hero } from '../components/Hero';
import { About } from '../components/About';
import { Expertise } from '../components/Expertise';
import { Journey } from '../components/Journey';
import { Cases } from '../components/Cases';
import { Testimonials } from '../components/Testimonials';
import { Articles } from '../components/Articles';
import { Clients } from '../components/Clients';
import { Footer } from '../components/Footer';

export function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Expertise />
        <Journey />
        <Cases />
        <Testimonials />
        <Articles />
        <Clients />
      </main>
      <Footer />
    </>
  );
}
