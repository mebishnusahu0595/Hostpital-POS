import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="pt-32 pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-medical-blue/10 text-medical-blue text-sm font-medium mb-6 animate-fade-in">
            Trusted by leading hospitals
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-medical-navy mb-6 leading-[1.1]">
            Stop Managing Equipment. <br />
            <span className="text-medical-blue">Start Controlling It.</span>
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Centralized Medical Solutions replaces scattered spreadsheets, 
            manual registers, and reactive maintenance with one powerful 
            platform built specifically for healthcare.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="bg-medical-navy hover:bg-medical-navy/90 text-white rounded-full px-8 h-12 text-base">
                Get Started Free
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="rounded-full px-8 h-12 text-base border-2">
              Watch Demo
            </Button>
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="absolute -inset-4 bg-gradient-to-r from-medical-blue/20 to-medical-navy/20 blur-3xl opacity-30 -z-10 rounded-[2.5rem]"></div>
          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xl animate-slide-up">
            <Image 
              src="/images/dashboard-mockup.png?v=2" 
              alt="Centralized Medical Solutions Dashboard" 
              width={1200} 
              height={800} 
              className="w-full h-auto"
              unoptimized
              priority
            />
          </div>
          
          {/* Floating alert card mockup (simple div) */}
          <div className="absolute -bottom-6 -right-6 md:right-10 bg-white p-4 rounded-xl shadow-xl border border-slate-100 hidden sm:block animate-bounce-subtle">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <span className="text-lg">⚠</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Critical Breakdown</p>
                <p className="text-[10px] text-slate-500">MRI Unit - Block B</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
