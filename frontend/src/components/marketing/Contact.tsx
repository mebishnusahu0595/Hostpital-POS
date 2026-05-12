'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

export default function Contact() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    try {
      await api.post('/leads', data);
      toast.success("Demo request sent! We'll contact you soon.");
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to send request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-[3rem] overflow-hidden shadow-xl border border-slate-100 flex flex-col md:flex-row">
          <div className="md:w-1/2 p-12 md:p-20 bg-medical-navy text-white flex flex-col justify-between">
            <div>
              <h2 className="text-4xl font-bold mb-6">Experience the future of healthcare operations.</h2>
              <p className="text-slate-400 mb-12 max-w-sm">Fill out the form and our biomedical specialist will reach out for a personalized walkthrough.</p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <span>📧</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Email Us</p>
                    <p className="text-white font-medium">info@cmslinc.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <span>📞</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Call Us</p>
                    <p className="text-white font-medium">856-448-7350</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12 md:mt-0 pt-8 border-t border-white/10 italic text-slate-500 text-sm">
              "Finally, our biomedical team has a system that works as hard as they do."
              <br />
              <span className="not-italic font-bold text-slate-300">— Dr. Sharma, City General Hospital</span>
            </div>
          </div>

          <div className="md:w-1/2 p-12 md:p-20">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-medical-navy">Full Name</label>
                  <Input name="name" placeholder="John Doe" required className="rounded-xl h-12" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-medical-navy">Hospital Name</label>
                  <Input name="hospitalName" placeholder="City General Hospital" required className="rounded-xl h-12" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-medical-navy">Phone Number</label>
                  <Input name="phone" placeholder="+91 00000 00000" required className="rounded-xl h-12" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-medical-navy">Work Email</label>
                  <Input name="email" type="email" placeholder="john@hospital.com" required className="rounded-xl h-12" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-medical-navy">Message</label>
                <Textarea name="message" placeholder="Tell us about your facility..." className="rounded-xl min-h-[120px]" />
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-medical-blue hover:bg-medical-blue/90 text-white rounded-xl h-14 text-base font-bold shadow-lg shadow-medical-blue/20"
              >
                {loading ? "Sending..." : "Submit Request"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
