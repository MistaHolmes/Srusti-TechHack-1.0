import React from 'react';
import { Hero } from "./components/Hero";
import { Footer } from "./components/footer";
import { Statistics } from "./components/statistics";
import { RegisterSection } from "./components/sevis";
import { Testimonials } from "./components/testi";
import { Outlet } from 'react-router-dom';


export function Home() {
  return (
    <div>
      <Hero />
      <Statistics />
      <RegisterSection />
      <Testimonials />
      <Footer />
    </div>
  );
}