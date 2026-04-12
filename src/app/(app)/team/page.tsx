"use client";

import { useState, useEffect } from "react";
import { Copy, Check, RefreshCw, UserMinus, Users, Link2, Shield } from "lucide-react";

interface Member {
  id: string;
  nome: string | null;
  cognome: string | null;
  email: string;
  ruolo: string;
  createdAt: string;
}

export default function TeamPage() {
  const [inviteCode, setInviteCode] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const inviteLink = typeof window !== "undefined"
    ? `${window.location.origin}/join?code=${inviteCode}`
    : "";

  const fetchTeam = async () => {
    try {
      const res = await fetch("/api/invite");
      if (res.ok) {
        const data = await res.json();
        setInviteCode(data.inviteCode);
        setCompanyName(data.companyName);
        setMembers(data.members);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeam(); }, []);

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerateCode = async () => {
    setRegenerating(true);
    try {
      const res = await fetch("/api/invite", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setInviteCode(data.inviteCode);
      }
    } catch {
      // ignore
    } finally {
      setRegenerating(false);
    }
  };

  const removeMember = async (memberId: string, memberEmail: string) => {
    if (!confirm(`Vuoi davvero rimuovere ${memberEmail} dal team?`)) return;
    try {
      await fetch("/api/invite/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: memberId }),
      });
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch {
      alert("Errore nella rimozione. Riprova.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Users className="w-8 h-8 text-muted-foreground animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Il tuo Team</h1>
        <p className="text-base text-muted-foreground mt-1">{companyName}</p>
      </div>

      {/* Invite section */}
      <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Link2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Invita colleghi</h2>
            <p className="text-sm text-muted-foreground">Manda questo link via WhatsApp</p>
          </div>
        </div>

        {/* Link display */}
        <div className="flex items-center gap-2">
          <div className="flex-1 px-4 py-3 rounded-xl bg-background border border-border text-sm text-foreground truncate font-mono">
            {inviteLink}
          </div>
          <button
            onClick={copyLink}
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors active:scale-95 shrink-0"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>

        {copied && (
          <p className="text-sm text-primary font-medium">Link copiato! Incollalo su WhatsApp.</p>
        )}

        {/* Regenerate */}
        <button
          onClick={regenerateCode}
          disabled={regenerating}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${regenerating ? "animate-spin" : ""}`} />
          Genera nuovo codice (disattiva il vecchio)
        </button>
      </div>

      {/* Team members */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Users className="w-5 h-5" />
          Membri del team ({members.length})
        </h2>

        <div className="space-y-2">
          {members.map((member) => {
            const isDemo = member.email === "demo@fleetmind.co";
            const isAdmin = member.ruolo === "admin";
            const name = member.nome && member.cognome
              ? `${member.nome} ${member.cognome}`
              : member.email;
            const initials = member.nome && member.cognome
              ? `${member.nome[0]}${member.cognome[0]}`.toUpperCase()
              : member.email[0].toUpperCase();

            return (
              <div
                key={member.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">{initials}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-foreground truncate">{name}</p>
                  <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                </div>

                {/* Role badge */}
                <div className="flex items-center gap-2 shrink-0">
                  {isAdmin && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-semibold">
                      <Shield className="w-3 h-3" />
                      Admin
                    </span>
                  )}
                  {!isAdmin && !isDemo && (
                    <span className="px-2.5 py-1 rounded-lg bg-secondary text-muted-foreground text-xs font-semibold">
                      Operatore
                    </span>
                  )}
                  {isDemo && (
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-semibold">
                      Demo
                    </span>
                  )}
                </div>

                {/* Remove button (not for admin or demo) */}
                {!isAdmin && !isDemo && (
                  <button
                    onClick={() => removeMember(member.id, member.email)}
                    className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
                    title="Rimuovi dal team"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-2xl bg-secondary p-6 space-y-3">
        <h3 className="font-semibold text-foreground">Come funziona</h3>
        <ol className="space-y-2 text-[15px] text-muted-foreground list-decimal list-inside">
          <li>Copia il link qui sopra</li>
          <li>Mandalo via WhatsApp al tuo collega</li>
          <li>Lui apre il link e mette la sua email</li>
          <li>Fa login con Google e vede subito i dati della flotta</li>
        </ol>
        <p className="text-sm text-muted-foreground mt-2">
          Se vuoi bloccare l&apos;accesso a qualcuno, toccalo e premi rimuovi. Puoi anche rigenerare il codice per invalidare il vecchio link.
        </p>
      </div>
    </div>
  );
}
