import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white py-20 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <span className="text-2xl">⚕</span>
              <span className="font-heading text-xl font-bold tracking-tight text-medical-navy">
                Centralized Medical Solutions
              </span>
            </Link>
            <p className="text-slate-500 max-w-sm leading-relaxed mb-8">
              Empowering healthcare facilities with state-of-the-art equipment management software. Increase uptime, ensure compliance, and save lives.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-medical-navy mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><Link href="#features" className="hover:text-medical-blue transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-medical-blue transition-colors">Pricing</Link></li>
              <li><Link href="/login" className="hover:text-medical-blue transition-colors">Login</Link></li>
              <li><Link href="#" className="hover:text-medical-blue transition-colors">Updates</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-medical-navy mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><Link href="#" className="hover:text-medical-blue transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-medical-blue transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-medical-blue transition-colors">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-medical-blue transition-colors">About Us</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 uppercase tracking-widest font-bold">
          <p>© 2025 Centralized Medical Solutions. All rights reserved.</p>
          <div className="flex items-center gap-8">
            <Link href="#" className="hover:text-medical-blue transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-medical-blue transition-colors">LinkedIn</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
