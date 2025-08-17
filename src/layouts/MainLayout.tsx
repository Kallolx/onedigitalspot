import React from 'react';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { Outlet } from 'react-router-dom';

const MainLayout: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full flex flex-col">
      <Header />
      <main className="flex-1 bg-background w-full">
        <section className="w-full">
          <div className="w-full max-w-7xl mx-auto px-0 md:px-8">
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  );
};

export default MainLayout;
