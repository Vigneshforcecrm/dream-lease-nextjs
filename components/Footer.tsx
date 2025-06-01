
import { Button } from "@/components/ui/button";
import Link from "next/link";
export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <span className="text-slate-900 font-bold text-sm">Nexus</span>
              </div>
              <span className="text-xl font-bold">Nexus Global Lease</span>
            </div>
            <p className="text-slate-400 text-sm">
              Premium vehicle leasing solutions for modern professionals and enterprises.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Products</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-white transition-colors">Luxury Sedans</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">SUVs</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Electric Vehicles</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Commercial Fleet</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-white transition-colors">Configuration</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Financing</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Maintenance</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Support</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">
            © 2024 Nexus Global Lease. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              Terms
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              Privacy
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              Cookies
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};
