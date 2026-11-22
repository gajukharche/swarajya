import { prisma } from '@/lib/prisma';
import { getCustomerSession } from '@/lib/auth/customer-session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { StorefrontHeader } from '@/components/storefront/header';
import { ArrowLeft, MapPin, Plus, Trash2, CheckCircle2, Home } from 'lucide-react';
import { saveAddressAction, deleteAddressAction } from '../actions';

export const dynamic = 'force-dynamic';

export default async function CustomerAddressesPage() {
  const session = await getCustomerSession();
  if (!session) {
    redirect('/account/login');
  }

  let addresses: Array<{
    id: string;
    firstName: string | null;
    lastName: string | null;
    company: string | null;
    address1: string;
    address2: string | null;
    city: string;
    province: string | null;
    country: string;
    zip: string;
    phone: string | null;
    isDefaultShipping: boolean;
  }> = [];

  try {
    addresses = await prisma.address.findMany({
      where: { customerId: session.customerId },
      orderBy: { isDefaultShipping: 'desc' },
    });
  } catch {
    // DB fallback
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <StorefrontHeader />

      <main className="max-w-5xl mx-auto px-6 py-12">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Account Dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Your Addresses</h1>
            <p className="text-xs text-zinc-400 mt-1">
              Manage your delivery locations for faster checkout.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {/* Saved Addresses List */}
          <div className="md:col-span-2 space-y-4">
            {addresses.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-zinc-800 bg-zinc-900/40">
                <MapPin className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-zinc-300">No saved addresses</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Add a delivery address using the form to speed up your future checkouts.
                </p>
              </div>
            ) : (
              addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-white text-sm">
                        {addr.firstName} {addr.lastName}
                      </span>
                      {addr.isDefaultShipping && (
                        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Default Shipping
                        </span>
                      )}
                    </div>
                    {addr.company && <p className="text-zinc-400">{addr.company}</p>}
                    <p className="text-zinc-300">{addr.address1}</p>
                    {addr.address2 && <p className="text-zinc-400">{addr.address2}</p>}
                    <p className="text-zinc-300">
                      {addr.city}, {addr.province} {addr.zip}
                    </p>
                    <p className="text-zinc-400">{addr.country}</p>
                    {addr.phone && <p className="text-zinc-500 mt-1">Phone: {addr.phone}</p>}
                  </div>

                  <form action={deleteAddressAction}>
                    <input type="hidden" name="addressId" value={addr.id} />
                    <button
                      type="submit"
                      title="Delete Address"
                      className="p-2 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              ))
            )}
          </div>

          {/* Add Address Form */}
          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 h-fit">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" /> Add New Address
            </h3>

            <form action={saveAddressAction} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    placeholder="John"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    placeholder="Doe"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Street Address</label>
                <input
                  type="text"
                  name="address1"
                  required
                  placeholder="123 Market Street"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Apartment, suite, etc.</label>
                <input
                  type="text"
                  name="address2"
                  placeholder="Apt 4B"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="San Francisco"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">State / Province</label>
                  <input
                    type="text"
                    name="province"
                    placeholder="CA"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Postal Code</label>
                  <input
                    type="text"
                    name="zip"
                    required
                    placeholder="94103"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Country</label>
                  <input
                    type="text"
                    name="country"
                    defaultValue="US"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isDefaultShipping"
                    value="true"
                    defaultChecked
                    className="rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-0"
                  />
                  <span className="text-xs text-zinc-300">Set as default shipping address</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-md shadow-indigo-600/20"
              >
                Save Address
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
