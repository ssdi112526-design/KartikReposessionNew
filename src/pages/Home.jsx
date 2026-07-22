import { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Hero from '../components/sections/Hero';
import Services from '../components/sections/Services';
import Products from '../components/sections/Products';
import Team from '../components/sections/Team';
import Partners from '../components/sections/Partners';
import WhatWeHandle from '../components/sections/WhatWeHandle';
import Equipment from '../components/sections/Equipment';
import Coverage from '../components/sections/Coverage';
import FAQ from '../components/sections/FAQ';
import Contact from '../components/sections/Contact';
import { contentService } from '../services';
import {
  fallbackCoverage,
  fallbackEquipment,
  fallbackFaqs,
  fallbackPartners,
  fallbackProducts,
  fallbackServices,
  fallbackTeam,
} from '../data/content';

export default function Home() {
  const [content, setContent] = useState({
    services: fallbackServices,
    products: fallbackProducts,
    partners: fallbackPartners,
    team: fallbackTeam,
    coverage: fallbackCoverage,
    faqs: fallbackFaqs,
    equipment: fallbackEquipment,
  });

  useEffect(() => {
    contentService
      .getAll()
      .then((res) => {
        const data = res.data.data;
        setContent({
          services: data.services?.length ? data.services : fallbackServices,
          products: data.products?.length ? data.products : fallbackProducts,
          partners: data.partners?.length ? data.partners : fallbackPartners,
          team: data.team?.length ? data.team : fallbackTeam,
          coverage: data.coverage?.length ? data.coverage : fallbackCoverage,
          faqs: data.faqs?.length ? data.faqs : fallbackFaqs,
          equipment: data.equipment?.length ? data.equipment : fallbackEquipment,
        });
      })
      .catch(() => {
        /* keep fallback content if API is offline */
      });
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services services={content.services} />
        <Products products={content.products} />
        <Team team={content.team} />
        <Partners partners={content.partners} />
        <WhatWeHandle />
        <Equipment equipment={content.equipment} />
        <Coverage coverage={content.coverage} />
        <FAQ faqs={content.faqs} />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
