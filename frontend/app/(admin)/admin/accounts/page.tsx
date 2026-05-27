"use client";

import { useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import { apiFetch, ApiError } from "@/lib/api";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import styles from "./accounts.module.css";

type User = { id: string; email: string; role: string; status: string; displayName: string; createdAt: string };
type Resp = { data: { items: User[]; total: number } };

export default function AdminAccountsPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);
  const qs = `?page=${page}&limit=20${role !== "all" ? "&role=" + role : ""}${search ? "&search=" + encodeURIComponent(search) : ""}`;
  const { data, isLoading, mutate } = useFetch<Resp>("/admin/users" + qs);
  const users = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;

  async function toggleStatus(user: User) {
    const newStatus = user.status === "active" ? "suspended" : "active";
    try {
      await apiFetch(`/admin/users/${user.id}/status`, { method: "PATCH", body: JSON.stringify({ status: newStatus }) });
      await mutate();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed");
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>User Management</h1>
      <div className={styles.toolbar}>
        <input className={styles.search} placeholder="Search by email…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <select className={styles.select} value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
          <option value="all">All roles</option>
          <option value="buyer">Buyer</option>
          <option value="freelancer">Freelancer</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      {isLoading ? (
        <div className={styles.loading}><Spinner /></div>
      ) : (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className={styles.email}>{user.email}</td>
                  <td>{user.displayName ?? "—"}</td>
                  <td><span className={styles.roleBadge} data-role={user.role}>{user.role}</span></td>
                  <td><span className={styles.statusBadge} data-status={user.status}>{user.status}</span></td>
                  <td className={styles.dim}>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => toggleStatus(user)}
                      className={styles.actionBtn + (user.status === "active" ? " " + styles.danger : " " + styles.safe)}
                    >
                      {user.status === "active" ? "Suspend" : "Reactivate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.pagination}>
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className={styles.pageBtn}>← Prev</button>
            <span className={styles.dim}>Page {page} · {total} users</span>
            <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className={styles.pageBtn}>Next →</button>
          </div>
        </>
      )}
    </div>
  );
}
