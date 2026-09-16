import React, { useState } from 'react';
import { Users, Phone, MessageSquare, Search, Plus, Star, Building, X } from 'lucide-react';
import { Contact, PermissionState } from '../types';

interface Props {
  contacts: Contact[];
  permissions: PermissionState;
  onStartCall: (name: string, number: string) => void;
  onOpenSms: (name: string, number: string) => void;
  onAddContact: (contact: Contact) => void;
  onRequestPermission: (perm: any) => void;
}

export const ContactsView: React.FC<Props> = ({
  contacts,
  permissions,
  onStartCall,
  onOpenSms,
  onAddContact,
  onRequestPermission,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newRelationship, setNewRelationship] = useState<Contact['relationship']>('Personal');

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const initials = newName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const colors = ['bg-emerald-600', 'bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-amber-600'];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const created: Contact = {
      id: `contact-${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      avatarColor,
      initials,
      company: newCompany.trim() || undefined,
      relationship: newRelationship,
      isFavorite: false,
    };

    onAddContact(created);
    setNewName('');
    setNewPhone('');
    setNewCompany('');
    setIsAddModalOpen(false);
  };

  const handleCall = (contact: Contact) => {
    if (!permissions['android.permission.CALL_PHONE']) {
      onRequestPermission('android.permission.CALL_PHONE');
      return;
    }
    onStartCall(contact.name, contact.phone);
  };

  const handleSms = (contact: Contact) => {
    if (!permissions['android.permission.SEND_SMS']) {
      onRequestPermission('android.permission.SEND_SMS');
      return;
    }
    onOpenSms(contact.name, contact.phone);
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-5 overflow-y-auto text-slate-100 space-y-4">
      {/* Top Search & Add */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search address book..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-2xl font-bold transition-colors shadow"
          title="Add Contact"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Contacts List */}
      <div className="space-y-2.5">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
          Contacts ({filtered.length})
        </div>

        {filtered.map((contact) => (
          <div
            key={contact.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-md transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-11 h-11 rounded-2xl ${contact.avatarColor} flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm`}
              >
                {contact.initials}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs sm:text-sm text-slate-200 truncate">
                    {contact.name}
                  </span>
                  {contact.isFavorite && (
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                  )}
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">{contact.phone}</div>
                {contact.company && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Building className="w-3 h-3 text-slate-500" />
                    <span className="truncate">{contact.company}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => handleCall(contact)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-slate-950 text-slate-300 transition-colors shadow"
                title="Call via CALL_PHONE"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSms(contact)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 transition-colors shadow"
                title="Send SMS via SEND_SMS"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Contact Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateContact}
            className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-sm w-full p-5 text-slate-100 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-sm font-bold text-slate-100">Add New Contact</h4>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Marcus Wright"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 902-1144"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="e.g. City Hospital"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Category</label>
                <select
                  value={newRelationship}
                  onChange={(e) => setNewRelationship(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Personal">Personal</option>
                  <option value="Work">Work</option>
                  <option value="Medical">Medical</option>
                  <option value="Service">Service</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Save Contact
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
