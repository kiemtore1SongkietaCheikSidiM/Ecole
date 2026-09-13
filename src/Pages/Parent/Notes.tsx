import { CiCircleChevDown } from "react-icons/ci"
import { IoMdSearch } from "react-icons/io"
import { useEffect, useState } from "react"
import type { TrimesterKey } from "../../Declarations/Types/typage"
import api from "../../Declarations/Api"

const access_token = localStorage.getItem("access_token")


const normalizeChildren = (payload: any): any[] => {
    if (!payload) return []

    if (Array.isArray(payload)) return payload.filter(Boolean)

    if (typeof payload === "object") {
        const collections = [payload.eleves, payload.children, payload.data, payload.resultats]

        for (const collection of collections) {
            if (Array.isArray(collection)) return collection.filter(Boolean)
        }

        return Object.values(payload).filter(
            (value) => value && typeof value === "object" && ("nom" in value || "prenom" in value || "classe" in value || "id" in value)
        )
    }

    return []
}

const normalizeNotesMap = (payload: any): Record<string, any> => {
    if (!payload) return {}

    if (Array.isArray(payload)) {
        return payload.reduce((acc: Record<string, any>, item: any, index: number) => {
            const key = String(item?.id ?? item?.eleve_id ?? index)
            acc[key] = item
            return acc
        }, {})
    }

    if (typeof payload === "object") {
        return Object.entries(payload).reduce((acc: Record<string, any>, [key, value]) => {
            if (value && typeof value === "object") {
                acc[String(key)] = value
            }
            return acc
        }, {})
    }

    return {}
}

const extractTrimestreNotes = (data: any, trimester: TrimesterKey) => {
    if (!data || typeof data !== "object") return {}

    const trimesterKey = trimester.toLowerCase().replace(/\s+/g, "_")
    const candidates = [data.matieres, data.notes, data.resultats, data]

    for (const candidate of candidates) {
        if (!candidate || typeof candidate !== "object") continue

        const match = Object.entries(candidate).find(([key]) => {
            const normalizedKey = key.toLowerCase().replace(/\s+/g, "_")
            return normalizedKey.includes(trimesterKey) || normalizedKey.includes(trimesterKey.replace("deuxieme", "2")) || normalizedKey.includes(trimesterKey.replace("troisieme", "3")) || normalizedKey.includes(trimesterKey.replace("premier", "1"))
        })

        if (match) {
            return match[1]
        }
    }

    const fallback = data.matieres ?? data.notes ?? data.resultats ?? {}
    return fallback && typeof fallback === "object" ? fallback : {}
}

const extractRows = (matieres: any) => {
    if (!matieres || typeof matieres !== "object") return []

    if (Array.isArray(matieres)) {
        return matieres.map((item, index) => ({
            matiere: item?.matiere ?? item?.nom_matiere ?? item?.name ?? `Matière ${index + 1}`,
            values: item,
        }))
    }

    return Object.entries(matieres).map(([matiere, value]) => ({
        matiere,
        values: value && typeof value === "object" ? value : { moyenne: value },
    }))
}

const Notes = () => {
    const [eleve, setEleve] = useState<any[]>([])
    const [trimestre, setTrimestre] = useState<TrimesterKey>("Premier trimestre")
    const [notesByChild, setNotesByChild] = useState<Record<string, any>>({})
    const [selectedChildId, setSelectedChildId] = useState<string>("")

    useEffect(() => {
        const AppelEleve = async () => {
            try {
                const resp = await api.get("/api/parent/notes/", {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                })

                const payload = resp.data ?? {}
                const children = normalizeChildren(payload)
                setEleve(children)

                if (children.length > 0) {
                    const firstChildId = String(children[0]?.id ?? children[0]?.eleve_id ?? 0)
                    setSelectedChildId(firstChildId)
                }

                const notesPayload = payload.notes ?? payload.note ?? payload.resultats ?? payload
                setNotesByChild(normalizeNotesMap(notesPayload))
            } catch (error: any) {
                console.error(error.response?.data ?? error)
            }
        }

        AppelEleve()
    }, [])

    const selectedChild =
        eleve.find((item) => String(item?.id ?? item?.eleve_id ?? "") === String(selectedChildId)) ?? eleve[0] ?? null

    const currentChildId = String(selectedChild?.id ?? selectedChild?.eleve_id ?? selectedChildId ?? 0)
    const currentNotes = notesByChild[currentChildId] ?? notesByChild[String(eleve.indexOf(selectedChild ?? {}))] ?? notesByChild[selectedChildId] ?? {}
    const trimestreNotes = extractTrimestreNotes(currentNotes, trimestre)
    const rows = extractRows(trimestreNotes)

    return (
        <div className="antialiased font-sans bg-gray-200 dark:bg-slate-800">
            <div className="container mx-auto px-4 sm:px-8">
                <div className="py-8">
                    <div className="mb-4 rounded-lg bg-white px-4 py-3 shadow dark:bg-black">
                        <p className="text-sm text-gray-500 dark:text-gray-300">Enfant sélectionné</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                            {selectedChild ? `${selectedChild.nom ?? ""} ${selectedChild.prenom ?? ""}`.trim() : "Aucun enfant"}
                            {selectedChild?.classe ? ` • ${selectedChild.classe}` : ""}
                        </p>
                    </div>

                    <div className="flex">
                        <select
                            value={selectedChildId}
                            onChange={(e) => setSelectedChildId(e.target.value)}
                            className="h-full rounded-l border block appearance-none w-full bg-white border-gray-400 text-gray-700 dark:bg-black dark:border-gray-800 dark:text-gray-300 py-2 px-4 pr-8 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                        >
                            {eleve.length === 0 ? (
                                <option value="">Chargement...</option>
                            ) : (
                                eleve.map((item, index) => {
                                    const childId = String(item?.id ?? item?.eleve_id ?? index)
                                    const label = `${item?.nom ?? ""} ${item?.prenom ?? ""} ${item?.classe ?? ""}`.trim()

                                    return (
                                        <option value={childId} key={childId} className="text-2xl font-semibold leading-tight">
                                            {label || `Enfant ${index + 1}`}
                                        </option>
                                    )
                                })
                            )}
                        </select>
                    </div>

                    <div className="my-2 flex sm:flex-row flex-col">
                        <div className="flex flex-row mb-1 sm:mb-0">
                            <div className="relative">
                                <select
                                    value={trimestre}
                                    onChange={(e) => setTrimestre(e.target.value as TrimesterKey)}
                                    className="h-full rounded-l border block appearance-none w-full bg-white border-gray-400 text-gray-700 dark:bg-black dark:border-gray-800 dark:text-gray-300 py-2 px-4 pr-8 leading-tight focus:outline-none focus:bg-white dark:focus:bg-black dark:focus:border-gray-950 focus:border-gray-500"
                                >
                                    <option>Premier trimestre</option>
                                    <option>Deuxieme Trimestre</option>
                                    <option>Troisieme trimestre</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                                    <CiCircleChevDown className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        <div className="block relative">
                            <span className="h-full absolute inset-y-0 left-0 flex items-center pl-2">
                                <IoMdSearch className="w-4 h-4" />
                            </span>
                            <input
                                placeholder="Search"
                                type="text"
                                className="appearance-none rounded-r rounded-l sm:rounded-l-none border border-gray-400 dark:border-gray-900 border-b block pl-8 pr-6 py-2 w-full bg-white dark:bg-black text-sm placeholder-gray-400 dark:placeholder-gray-600 text-gray-700 dark:text-gray-300 dark:focus:bg-black focus:bg-white focus:placeholder-gray-600 dark:focus:placeholder-gray-400 dark:focus:text-gray-300 focus:text-gray-700 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                        <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
                            <table className="min-w-full leading-normal">
                                <thead>
                                    <tr>
                                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-slate-900 dark:text-gray-400 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Matiere
                                        </th>
                                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-slate-900 dark:text-gray-400 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Devoir 1
                                        </th>
                                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left dark:border-gray-800 dark:bg-slate-900 dark:text-gray-400 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Devoir 2
                                        </th>
                                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-slate-900 dark:text-gray-400 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Composition
                                        </th>
                                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-slate-900 dark:text-gray-400 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Moyenne
                                        </th>
                                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-slate-900 dark:text-gray-400 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-slate-900 dark:text-gray-400 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Mention
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.length > 0 ? (
                                        rows.map(({ matiere, values }, index) => {
                                            const row = (values && typeof values === "object") ? values : {}
                                            const devoir1 = row.devoir1 ?? row.Devoir1 ?? row.note1 ?? row.Note1 ?? row.note_1 ?? row["1"] ?? row.devoir_1 ?? "-"
                                            const devoir2 = row.devoir2 ?? row.Devoir2 ?? row.note2 ?? row.Note2 ?? row.note_2 ?? row["2"] ?? row.devoir_2 ?? "-"
                                            const composition = row.composition ?? row.Composition ?? row.composition1 ?? row.comp ?? "-"
                                            const moyenne = row.moyenne ?? row.Moyenne ?? row.moyenne_generale ?? row.average ?? "-"
                                            const date = row.date ?? row.Date ?? row.created_at ?? row.dt ?? "-"
                                            const mention = row.mention ?? row.Mention ?? row.appreciation ?? row.motivation ?? "-"

                                            return (
                                                <tr key={`${matiere}-${index}`}>
                                                    <td className="px-5 py-5 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-black text-sm">
                                                        <p className="text-gray-900 dark:text-slate-100 whitespace-no-wrap">{matiere}</p>
                                                    </td>
                                                    <td className="px-5 py-5 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-black text-sm">
                                                        <p className="whitespace-no-wrap text-gray-900 dark:text-slate-100">{devoir1}</p>
                                                    </td>
                                                    <td className="px-5 py-5 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-black text-sm">
                                                        <p className="whitespace-no-wrap text-gray-900 dark:text-slate-100">{devoir2}</p>
                                                    </td>
                                                    <td className="px-5 py-5 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-black text-sm">
                                                        <p className="whitespace-no-wrap text-gray-900 dark:text-slate-100">{composition}</p>
                                                    </td>
                                                    <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-800 dark:bg-black bg-white text-sm">
                                                        <p className="whitespace-no-wrap text-gray-900 dark:text-slate-100">{moyenne}</p>
                                                    </td>
                                                    <td className="px-5 py-5 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-black text-sm">
                                                        <p className="text-gray-900 dark:text-slate-100 whitespace-no-wrap">{date}</p>
                                                    </td>
                                                    <td className="px-5 py-5 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-black text-sm">
                                                        <p className={`whitespace-no-wrap ${mention === "Passable" ? "text-yellow-500" : mention === "Bien" ? "text-green-500" : mention === "Très bien" ? "text-blue-500" : mention === "insuffisant" || mention === "faible" ? "text-red-500" : "text-gray-900 dark:text-slate-100"}`}>
                                                            {mention}
                                                        </p>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-5 py-10 text-center text-gray-500 dark:text-gray-300">
                                                Aucune note pour {trimestre.toLowerCase()}.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            <div className="px-5 py-5 bg-white dark:bg-black border-t flex flex-col xs:flex-row items-center xs:justify-between">
                                <div className="inline-flex mt-2 xs:mt-0">
                                    <button className="text-sm bg-gray-300 hover:bg-gray-400 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800 dark:text-gray-300 font-semibold py-2 px-4 rounded-l">
                                        Avant
                                    </button>
                                    <button className="text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-800 dark:text-gray-300 font-semibold py-2 px-4 rounded-r">
                                        Suivant
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Notes