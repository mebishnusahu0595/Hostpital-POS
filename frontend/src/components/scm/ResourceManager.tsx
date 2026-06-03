'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, Save, Search, Inbox } from 'lucide-react';
import toast from 'react-hot-toast';

export type FieldType = 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'lineItems';

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  full?: boolean; // span the full grid width
  options?: { value: string; label: string }[];
  // For dynamic select options pulled from another endpoint
  optionsEndpoint?: string;
  optionLabel?: string; // field on the option doc to display
}

export interface ColumnConfig {
  header: string;
  render: (row: any) => React.ReactNode;
}

interface ResourceManagerProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  endpoint: string; // e.g. /scm/suppliers
  queryKey: string;
  columns: ColumnConfig[];
  fields: FieldConfig[];
  addLabel?: string;
}

const emptyForResetType = (f: FieldConfig) => (f.type === 'checkbox' ? false : f.type === 'lineItems' ? [] : '');

function DynamicSelect({
  field,
  value,
  onChange,
}: {
  field: FieldConfig;
  value: string;
  onChange: (v: string) => void;
}) {
  const { data } = useQuery({
    queryKey: ['scm-options', field.optionsEndpoint],
    queryFn: async () => {
      const res = await api.get(field.optionsEndpoint as string);
      return res.data.data as any[];
    },
    enabled: !!field.optionsEndpoint,
  });

  const options =
    field.options ||
    (data || []).map((d) => ({ value: d._id, label: d[field.optionLabel || 'name'] }));

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={field.required}
      className="w-full h-11 px-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-medical-blue/20"
    >
      <option value="">Select {field.label}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function LineItemsEditor({
  value,
  onChange,
}: {
  value: { name: string; quantity: number; unitPrice: number }[];
  onChange: (v: any[]) => void;
}) {
  const items = value || [];
  const update = (i: number, key: string, val: any) => {
    const next = items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it));
    onChange(next);
  };
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="grid grid-cols-12 gap-2">
          <Input
            className="col-span-6 rounded-xl h-10"
            placeholder="Item name"
            value={it.name}
            onChange={(e) => update(i, 'name', e.target.value)}
          />
          <Input
            className="col-span-2 rounded-xl h-10"
            type="number"
            placeholder="Qty"
            value={it.quantity}
            onChange={(e) => update(i, 'quantity', Number(e.target.value))}
          />
          <Input
            className="col-span-3 rounded-xl h-10"
            type="number"
            placeholder="Unit price"
            value={it.unitPrice}
            onChange={(e) => update(i, 'unitPrice', Number(e.target.value))}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="col-span-1 text-red-400 hover:text-red-600 flex items-center justify-center"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className="rounded-xl h-9 text-xs"
        onClick={() => onChange([...items, { name: '', quantity: 1, unitPrice: 0 }])}
      >
        <Plus size={14} className="mr-1" /> Add line item
      </Button>
      {items.length > 0 && (
        <p className="text-xs text-slate-500 pt-1">
          Total: ${items.reduce((s, it) => s + it.quantity * it.unitPrice, 0).toLocaleString('en-US')}
        </p>
      )}
    </div>
  );
}

export default function ResourceManager({
  title,
  subtitle,
  icon,
  endpoint,
  queryKey,
  columns,
  fields,
  addLabel = 'Add New',
}: ResourceManagerProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const { data: rows, isLoading } = useQuery({
    queryKey: [queryKey, search],
    queryFn: async () => {
      const res = await api.get(endpoint, { params: search ? { search } : {} });
      return res.data.data as any[];
    },
  });

  const initialForm = useMemo(() => {
    const f: Record<string, any> = {};
    fields.forEach((field) => (f[field.name] = emptyForResetType(field)));
    return f;
  }, [fields]);

  const openAdd = () => {
    setEditing(null);
    setForm(initialForm);
    setOpen(true);
  };

  const openEdit = (row: any) => {
    setEditing(row);
    const f: Record<string, any> = {};
    fields.forEach((field) => {
      let v = row[field.name];
      if (field.type === 'date' && v) v = new Date(v).toISOString().split('T')[0];
      if (field.type === 'select' && v && typeof v === 'object') v = v._id; // populated ref
      f[field.name] = v ?? emptyForResetType(field);
    });
    setForm(f);
    setOpen(true);
  };

  const buildPayload = () => {
    const payload: Record<string, any> = {};
    fields.forEach((field) => {
      const v = form[field.name];
      if (field.type === 'number') {
        if (v !== '' && v !== null && v !== undefined) payload[field.name] = Number(v);
      } else if (field.type === 'checkbox') {
        payload[field.name] = !!v;
      } else if (field.type === 'lineItems') {
        payload[field.name] = (v || []).filter((it: any) => it.name);
        payload.totalAmount = (v || []).reduce(
          (s: number, it: any) => s + it.quantity * it.unitPrice,
          0
        );
      } else {
        if (v !== '' && v !== null && v !== undefined) payload[field.name] = v;
      }
    });
    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = buildPayload();
      if (editing) {
        await api.patch(`${endpoint}/${editing._id}`, payload);
        toast.success(`${title} updated.`);
      } else {
        await api.post(endpoint, payload);
        toast.success(`${title} created.`);
      }
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: any) => {
    if (!confirm(`Delete this ${title.toLowerCase()}? This cannot be undone.`)) return;
    try {
      await api.delete(`${endpoint}/${row._id}`);
      toast.success(`${title} deleted.`);
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-medical-navy mb-1 flex items-center gap-2">
            {icon} {title}
          </h1>
          {subtitle && <p className="text-slate-500 text-sm">{subtitle}</p>}
        </div>
        <Button onClick={openAdd} className="bg-medical-blue hover:bg-medical-blue/90 text-white rounded-xl gap-2 h-11">
          <Plus size={18} /> {addLabel}
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${title.toLowerCase()}...`}
          className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-medical-blue/20"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Loading...</div>
        ) : !rows || rows.length === 0 ? (
          <div className="p-12 flex flex-col items-center gap-3 text-slate-400">
            <Inbox size={40} />
            <p className="font-medium">No records yet. Click "{addLabel}" to create one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {columns.map((c) => (
                    <th key={c.header} className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {c.header}
                    </th>
                  ))}
                  <th className="px-5 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row: any) => (
                  <tr key={row._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    {columns.map((c) => (
                      <td key={c.header} className="px-5 py-3.5 text-slate-700">
                        {c.render(row)}
                      </td>
                    ))}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(row)} className="p-2 text-slate-400 hover:text-medical-blue hover:bg-blue-50 rounded-lg" title="Edit">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(row)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl bg-white rounded-3xl p-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-medical-navy">
              {editing ? `Edit ${title}` : addLabel}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {fields.map((field) => (
                <div key={field.name} className={`space-y-2 ${field.full || field.type === 'lineItems' || field.type === 'textarea' ? 'col-span-2' : ''}`}>
                  {field.type !== 'checkbox' && (
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {field.label} {field.required && '*'}
                    </label>
                  )}
                  {field.type === 'select' ? (
                    <DynamicSelect
                      field={field}
                      value={form[field.name] || ''}
                      onChange={(v) => setForm({ ...form, [field.name]: v })}
                    />
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={form[field.name] || ''}
                      onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-medical-blue/20"
                    />
                  ) : field.type === 'checkbox' ? (
                    <label className="flex items-center gap-2 cursor-pointer pt-6">
                      <input
                        type="checkbox"
                        checked={!!form[field.name]}
                        onChange={(e) => setForm({ ...form, [field.name]: e.target.checked })}
                        className="w-4 h-4 accent-medical-blue"
                      />
                      <span className="text-sm font-medium text-slate-600">{field.label}</span>
                    </label>
                  ) : field.type === 'lineItems' ? (
                    <LineItemsEditor
                      value={form[field.name] || []}
                      onChange={(v) => setForm({ ...form, [field.name]: v })}
                    />
                  ) : (
                    <Input
                      type={field.type}
                      value={form[field.name] ?? ''}
                      onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="rounded-xl h-11"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="pt-4 flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="flex-1 rounded-xl h-11">
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="flex-1 bg-medical-navy text-white rounded-xl h-11 gap-2">
                <Save size={18} /> {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
