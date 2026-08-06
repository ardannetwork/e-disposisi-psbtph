import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, PETUGAS_PBT_LIST } from '../types/disposisi';
import { UserCheck, ShieldAlert, Check, X, UserPlus, Shield, Trash2 } from 'lucide-react';

export const UserApprovalModal: React.FC = () => {
  const { usersList, approveUser, rejectUser, deleteUser, registerUser, currentUser } = useAuth();

  const pendingUsers = usersList.filter((u) => !u.approved);
  const activeUsers = usersList.filter((u) => u.approved);

  // Quick Register Modal Form state (to simulate new user signing up)
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [regEmail, setRegEmail] = useState('');
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('pbt');
  const [regPbtName, setRegPbtName] = useState<string>(PETUGAS_PBT_LIST[0]);

  // Selected state per pending user item
  const [userRoleMap, setUserRoleMap] = useState<Record<string, UserRole>>({});
  const [userPbtMap, setUserPbtMap] = useState<Record<string, string>>({});

  const handleApprove = (userId: string) => {
    const role = userRoleMap[userId] || 'pbt';
    const pbt = userPbtMap[userId] || PETUGAS_PBT_LIST[0];
    approveUser(userId, role, pbt);
  };

  const handleDeleteActiveUser = (userId: string, userName: string) => {
    if (userId === currentUser?.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.');
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus akun pengguna aktif "${userName}"?`)) {
      deleteUser(userId);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail || !regName) return;

    const res = registerUser(regEmail, regName, '123456', regRole, regRole === 'pbt' ? regPbtName : undefined);
    alert(res.message);
    if (res.success) {
      setRegEmail('');
      setRegName('');
      setShowRegisterForm(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER BAR */}
      <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-lg text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <span>Manajemen & Persetujuan Pengguna (User Approval Panel)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Setujui pendaftaran akun baru, atur Hak Akses Role (Admin / Operator / PBT), dan pemetaan PBT.
          </p>
        </div>

        <button
          onClick={() => setShowRegisterForm(!showRegisterForm)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Simulasi Pendaftaran Akun Baru</span>
        </button>
      </div>

      {/* SIMULASI PENDAFTARAN FORM */}
      {showRegisterForm && (
        <form
          onSubmit={handleRegisterSubmit}
          className="bg-slate-900 border border-emerald-500/30 p-5 rounded-3xl space-y-4 animate-in fade-in"
        >
          <h3 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            <span>Form Registrasi Pengguna Baru (Status Awal: Pending Approval)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Pengguna</label>
              <input
                type="email"
                required
                placeholder="nama@psbtph.go.id"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                placeholder="Nama Pengguna"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Peran / Role</label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value as UserRole)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="pbt">PBT (Pengawas Benih)</option>
                <option value="operator">Operator Surat</option>
                <option value="admin">Admin Koordinator</option>
              </select>
            </div>

            {regRole === 'pbt' && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Pemetaan Nama PBT</label>
                <select
                  value={regPbtName}
                  onChange={(e) => setRegPbtName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  {PETUGAS_PBT_LIST.map((pbt) => (
                    <option key={pbt} value={pbt}>
                      {pbt}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowRegisterForm(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow"
            >
              Kirim Pendaftaran
            </button>
          </div>
        </form>
      )}

      {/* PENDING APPROVAL LIST */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
        <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Daftar Permohonan Registrasi Pending ({pendingUsers.length})</span>
        </h3>

        {pendingUsers.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
            Tidak ada pendaftaran pengguna baru yang menunggu persetujuan.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-100 text-sm">{user.name}</div>
                  <div className="text-slate-400">{user.email}</div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Daftar: {new Date(user.createdAt).toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* ROLE SELECTOR */}
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Tentukan Role:</label>
                    <select
                      value={userRoleMap[user.id] || user.role}
                      onChange={(e) =>
                        setUserRoleMap({ ...userRoleMap, [user.id]: e.target.value as UserRole })
                      }
                      className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="pbt">Role: PBT</option>
                      <option value="operator">Role: Operator</option>
                      <option value="admin">Role: Admin</option>
                    </select>
                  </div>

                  {/* PBT MAPPING SELECTOR */}
                  {(userRoleMap[user.id] || user.role) === 'pbt' && (
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Petugas PBT:</label>
                      <select
                        value={userPbtMap[user.id] || user.pbt_name || PETUGAS_PBT_LIST[0]}
                        onChange={(e) =>
                          setUserPbtMap({ ...userPbtMap, [user.id]: e.target.value })
                        }
                        className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-amber-300 font-semibold focus:outline-none max-w-[160px] truncate"
                      >
                        {PETUGAS_PBT_LIST.map((pbt) => (
                          <option key={pbt} value={pbt}>
                            {pbt}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* APPROVE & REJECT ACTION BUTTONS */}
                  <div className="flex items-center gap-2 pt-2 sm:pt-0">
                    <button
                      onClick={() => handleApprove(user.id)}
                      className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1 shadow transition-all"
                    >
                      <Check className="w-4 h-4" />
                      <span>Setujui (Approve)</span>
                    </button>
                    <button
                      onClick={() => rejectUser(user.id)}
                      className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                      title="Tolak & Hapus"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ACTIVE USERS TABLE */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
        <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Daftar Pengguna Aktif Disetujui ({activeUsers.length})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700 text-[11px] font-bold text-slate-400 uppercase">
                <th className="py-3 px-4">Nama Pengguna</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role / Hak Akses</th>
                <th className="py-3 px-4">Pemetaan PBT</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi / Hapus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {activeUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-100">{u.name}</td>
                  <td className="py-3 px-4 text-slate-400">{u.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                        u.role === 'admin'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : u.role === 'operator'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {u.role === 'pbt' ? u.pbt_name || '-' : '-'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                      Aktif & Approved
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleDeleteActiveUser(u.id, u.name)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors inline-flex items-center gap-1"
                      title="Hapus Akun Pengguna Ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-semibold">Hapus</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
