'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AddEquipmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    equipmentCode: '',
    category: '',
    department: '',
    manufacturer: '',
    modelNumber: '',
    serialNumber: '',
    purchaseDate: '',
    warrantyExpirationDate: '',
    maintenanceFrequency: 'monthly',
    location: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Format data for backend
    const data = {
      ...formData,
      location: {
        building: formData.location
      },
      warrantyExpiry: formData.warrantyExpirationDate
    };
    
    // Remove old fields
    delete (data as any).warrantyExpirationDate;

    try {
      await api.post('/equipment', data);
      toast.success('Equipment added successfully');
      router.push('/equipment');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add equipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/equipment">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-medical-navy">Add New Equipment</h1>
          <p className="text-slate-500 text-sm">Fill in the details to register a new asset.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-medical-navy">Equipment Name *</label>
                <Input name="name" placeholder="e.g. MRI Scanner" required value={formData.name} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-medical-navy">Internal Code / Asset ID *</label>
                <Input name="equipmentCode" placeholder="e.g. RAD-MRI-001" required value={formData.equipmentCode} onChange={handleChange} />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-medical-navy">Category *</label>
                <select 
                  name="category" 
                  required 
                  value={formData.category} 
                  onChange={handleChange}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-medical-blue/20"
                >
                  <option value="">Select Category</option>
                  <option value="imaging">Imaging</option>
                  <option value="monitoring">Monitoring</option>
                  <option value="laboratory">Laboratory</option>
                  <option value="surgical">Surgical</option>
                  <option value="life_support">Life Support</option>
                  <option value="diagnostic">Diagnostic</option>
                  <option value="rehabilitation">Rehabilitation</option>
                  <option value="sterilization">Sterilization</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-medical-navy">Department</label>
                <Input name="department" placeholder="e.g. Radiology" value={formData.department} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-medical-navy">Location (Room/Floor)</label>
                <Input name="location" placeholder="e.g. Ground Floor, Room 102" value={formData.location} onChange={handleChange} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Manufacturer & Warranty</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-medical-navy">Manufacturer</label>
                <Input name="manufacturer" placeholder="GE Healthcare" value={formData.manufacturer} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-medical-navy">Model Number</label>
                <Input name="modelNumber" placeholder="Signa Artist" value={formData.modelNumber} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-medical-navy">Serial Number</label>
                <Input name="serialNumber" placeholder="SN-12345678" value={formData.serialNumber} onChange={handleChange} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-medical-navy">Purchase Date</label>
                <Input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-medical-navy">Warranty Expiration</label>
                <Input type="date" name="warrantyExpirationDate" value={formData.warrantyExpirationDate} onChange={handleChange} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href="/equipment">
            <Button variant="ghost" type="button">Cancel</Button>
          </Link>
          <Button type="submit" disabled={loading} className="bg-medical-blue hover:bg-medical-blue/90 text-white rounded-xl gap-2 h-11 px-8">
            <Save size={18} /> {loading ? "Saving..." : "Save Equipment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
