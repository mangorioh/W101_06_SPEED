'use client';

import React, { useEffect, useState } from 'react';

type Entity = {
  _id: string;
  name: string;
  valid: boolean;
};

export default function AdminDashboard() {
  const [claims, setClaims] = useState<Entity[]>([]);
  const [practices, setPractices] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [newClaimName, setNewClaimName] = useState('');
  const [newPracticeName, setNewPracticeName] = useState('');

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  useEffect(() => {
    async function fetchData() {
      try {
        const [claimsRes, practicesRes] = await Promise.all([
          fetch(`${baseUrl}/claims`),
          fetch(`${baseUrl}/practices`),
        ]);

        const claimsData = await claimsRes.json();
        const practicesData = await practicesRes.json();

        setClaims(claimsData);
        setPractices(practicesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleToggleValid = async (type: 'claims' | 'practices', item: Entity) => {
    const updated = { ...item, valid: !item.valid };

    await fetch(`${baseUrl}/${type}/${item._id}/valid`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valid: updated.valid }),
    });

    if (type === 'claims') {
      setClaims((prev) => prev.map((c) => (c._id === item._id ? updated : c)));
    } else {
      setPractices((prev) => prev.map((p) => (p._id === item._id ? updated : p)));
    }
  };

  const handleRename = async (type: 'claims' | 'practices', item: Entity, newName: string) => {
    const updated = { ...item, name: newName };

    await fetch(`${baseUrl}/${type}/${item._id}/rename`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    });

    if (type === 'claims') {
      setClaims((prev) => prev.map((c) => (c._id === item._id ? updated : c)));
    } else {
      setPractices((prev) => prev.map((p) => (p._id === item._id ? updated : p)));
    }
  };

  const handleCreate = async (type: 'claims' | 'practices', name: string) => {
    const res = await fetch(`${baseUrl}/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    const newItem = await res.json();

    if (type === 'claims') {
      setClaims((prev) => [...prev, newItem]);
      setNewClaimName('');
    } else {
      setPractices((prev) => [...prev, newItem]);
      setNewPracticeName('');
    }
  };

  const EditableItem = ({
    item,
    type,
  }: {
    item: Entity;
    type: 'claims' | 'practices';
  }) => {
    const [editing, setEditing] = useState(false);
    const [input, setInput] = useState(item.name);

    return (
      <div
        className={`rounded-xl border p-4 shadow-sm space-y-2 ${
          item.valid ? 'border-green-400' : 'border-red-400'
        }`}
      >
        {editing ? (
          <input
            className="w-full border px-2 py-1 rounded"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onBlur={() => {
              setEditing(false);
              if (input !== item.name) handleRename(type, item, input);
            }}
            autoFocus
          />
        ) : (
          <p
            className="text-lg font-medium cursor-pointer"
            onClick={() => setEditing(true)}
          >
            {item.name}
          </p>
        )}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Valid: {item.valid ? 'Yes' : 'No'}</span>
          <button
            onClick={() => handleToggleValid(type, item)}
            className="text-blue-600 hover:underline"
          >
            Toggle
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>

      {loading ? (
        <p className="text-gray-500">Loading data...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* claims */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Claims</h2>
            <div className="space-y-3">
              {claims.map((claim) => (
                <EditableItem key={claim._id} item={claim} type="claims" />
              ))}

              <div className="flex items-center gap-2">
                <input
                  value={newClaimName}
                  onChange={(e) => setNewClaimName(e.target.value)}
                  placeholder="New claim name"
                  className="border px-2 py-1 rounded w-full"
                />
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  onClick={() => newClaimName && handleCreate('claims', newClaimName)}
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* practices*/}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Practices</h2>
            <div className="space-y-3">
              {practices.map((practice) => (
                <EditableItem key={practice._id} item={practice} type="practices" />
              ))}

              <div className="flex items-center gap-2">
                <input
                  value={newPracticeName}
                  onChange={(e) => setNewPracticeName(e.target.value)}
                  placeholder="New practice name"
                  className="border px-2 py-1 rounded w-full"
                />
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  onClick={() => newPracticeName && handleCreate('practices', newPracticeName)}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
