import { useEffect, useState } from "react";
import { FiDownload, FiEye, FiFileText } from "react-icons/fi";
import fallbackPdf from "../../image/mohamed.jpg";
import type { BulletinRecord } from "../../Declarations/Types/typage";
import api from "../../Declarations/Api";

const access_token = localStorage.getItem("access_token");

const normalizeBulletinRecords = (payload: any): BulletinRecord[] => {
  if (!payload) return [];

  if (Array.isArray(payload)) return payload.filter(Boolean);

  if (typeof payload === "object") {
    const collections = [
      payload.results,
      payload.bulletins,
      payload.documents,
      payload.files,
      payload.data,
      payload.items,
    ];

    for (const collection of collections) {
      if (Array.isArray(collection)) return collection.filter(Boolean);
    }

    if (
      payload.url ||
      payload.file ||
      payload.path ||
      payload.href ||
      payload.document ||
      payload.fichier
    ) {
      return [payload];
    }

    return Object.values(payload).filter(
      (value) =>
        value &&
        typeof value === "object" &&
        ("url" in value ||
          "file" in value ||
          "path" in value ||
          "name" in value ||
          "filename" in value),
    ) as BulletinRecord[];
  }

  return [];
};

const resolveBulletinUrl = (item: BulletinRecord): string | null => {
  const rawUrl =
    item.url ??
    item.file ??
    item.path ??
    item.href ??
    item.document ??
    item.fichier ??
    "";

  if (!rawUrl) return null;

  if (
    /^https?:\/\//i.test(rawUrl) ||
    /^blob:/i.test(rawUrl) ||
    /^data:/i.test(rawUrl)
  ) {
    return rawUrl;
  }

  if (rawUrl.startsWith("/")) {
    return `http://localhost:8000${rawUrl}`;
  }

  return rawUrl;
};

const BulletinEleve = () => {
  const [bulletins, setBulletins] = useState<BulletinRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const DataAppel = async () => {
      const endpoints = [
        "/api/parent/bulletins/",
        "/api/parent/emplois-du-temps/",
      ];

      setLoading(true);
      setError("");

      try {
        for (const endpoint of endpoints) {
          try {
            const res = await api.get(endpoint, {
              headers: {
                Authorization: `Bearer ${access_token}`,
              },
            });

            const normalized = normalizeBulletinRecords(res.data);
            if (normalized.length > 0) {
              setBulletins(normalized);
              return;
            }
          } catch (err) {
            // On continue sur les autres endpoints possibles.
          }
        }

        setBulletins([]);
      } catch (err: any) {
        setError(
          err?.response?.data?.detail || "Impossible de charger le bulletin.",
        );
      } finally {
        setLoading(false);
      }
    };

    DataAppel();
  }, []);

  const bulletin = bulletins[0];
  const bulletinUrl = resolveBulletinUrl(bulletin ?? {});
  const bulletinName = bulletin?.name || bulletin?.filename || "Bulletin.pdf";
  const isPdf =
    (bulletinUrl || "").toLowerCase().endsWith(".pdf") ||
    (
      bulletin?.type ||
      bulletin?.mime_type ||
      bulletin?.content_type ||
      ""
    ).includes("pdf");

  const handleDownload = () => {
    const finalUrl = bulletinUrl || fallbackPdf;
    const link = document.createElement("a");
    link.href = finalUrl;
    link.download = bulletinName || "bulletin.pdf";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-100 px-4">
        <div className="rounded-2xl bg-white px-6 py-5 shadow-sm text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="text-slate-600">Chargement du bulletin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-700 px-4 py-8 text-slate-800 dark:text-slate-100">
      <div className="mx-auto max-w-6xl rounded-3xl bg-white dark:bg-black shadow-xl ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-slate-800 px-5 py-5 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              Bulletin scolaire
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-200">
              Suivi de l’élève
            </h1>
          </div>

          <button
            onClick={handleDownload}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-500"
          >
            <FiDownload className="h-4 w-4" />
            Télécharger
          </button>
        </div>

        {error && (
          <div className="border-b border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 sm:px-8">
            {error}
          </div>
        )}

        <div className="grid gap-6 p-5 sm:p-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 bg-slate-50">
            {bulletinUrl ? (
              isPdf ? (
                <iframe
                  title="Bulletin de l’élève"
                  src={bulletinUrl}
                  className="h-180 w-full bg-white dark:bg-black"
                />
              ) : (
                <img
                  src={bulletinUrl}
                  alt="Bulletin de l’élève"
                  className="h-180 w-full object-contain bg-white dark:bg-black"
                />
              )
            ) : (
              <div className="flex h-180 flex-col items-center justify-center gap-4 bg-white dark:bg-black p-6 text-center">
                <img
                  src={fallbackPdf}
                  alt="Bulletin non disponible"
                  className="h-40 w-40 object-contain"
                />
                <div>
                  <p className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                    Aucun bulletin disponible
                  </p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                    Le document PDF de secours est affiché ici.
                  </p>
                </div>
                <button
                  onClick={() => window.open(fallbackPdf, "_blank")}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  <FiEye className="h-4 w-4" />
                  Ouvrir le PDF
                </button>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-2 text-blue-600">
                  <FiFileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                    Document
                  </p>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-200">
                    {bulletinName || "Bulletin.pdf"}
                  </h2>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between rounded-lg bg-white dark:bg-black px-3 py-2">
                  <span className="dark:text-slate-50">Type</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {isPdf ? "PDF" : "Image"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white dark:bg-black px-3 py-2">
                  <span className="dark:text-slate-50">Statut</span>
                  <span className="font-medium text-slate-800 dark:text-slate-50">
                    {bulletinUrl ? "Disponible" : "Indisponible"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white dark:bg-black px-3 py-2">
                  <span className="dark:text-slate-50">Lecture</span>
                  <span className="font-medium text-slate-800 dark:text-slate-50">
                    {bulletinUrl ? "Prévisualisation" : "PDF de secours"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                Actions
              </p>
              <div className="mt-4 space-y-3">
                <button
                  onClick={handleDownload}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-50 px-4 py-3 font-medium text-white dark:text-black hover:bg-slate-700"
                >
                  <FiDownload className="h-4 w-4" />
                  Télécharger le bulletin
                </button>

                {bulletinUrl && (
                  <a
                    href={bulletinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-black bg-white px-4 py-3 font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <FiEye className="h-4 w-4" />
                    Ouvrir dans un nouvel onglet
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BulletinEleve;
