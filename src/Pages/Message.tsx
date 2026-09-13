import Mohamed from "./../image/mohamed.jpg"
import { MdMessage } from "react-icons/md"
import { LuCircleDashed } from "react-icons/lu"
import { BsThreeDotsVertical } from "react-icons/bs"
import { MdEmojiEmotions } from "react-icons/md"
import { FaMicrophone } from "react-icons/fa"
import { IoArrowBackOutline, IoSearch } from "react-icons/io5"
import { ImAttachment } from "react-icons/im"
import { useEffect, useRef, useState } from "react"
import { IoIosSend } from "react-icons/io"
import type { Search } from "../Declarations/Types"
import axios from "axios"
import type { ChatMessage, Contacttype } from "../Declarations/Types/typage"
import {  URL } from "../Declarations/Constant/constant"
import { formatFrenchDate, formatHour, getCurrentUser, getMessageDate, getUserDisplayName, normalizeContacts, normalizeMessages, resolveMediaUrl } from "../Declarations/Constant/Fonction"


const access_token = localStorage.getItem("access_token")
const Message = ({ sidebarcollaps }: Search) => {
  const [search, setSerarch] = useState<string>("")
  const [message, setMessage] = useState<string>("")
  const [identifiant, setidentifiant] = useState<number | string>(0)
  const [selectedcontact, setSelectedContact] = useState<Contacttype | null>(null)
  const [showOption, setShowOption] = useState<boolean>(false)
  const [showSearch, setShowsearch] = useState<boolean>(false)
  const [amis, setAmis] = useState<Contacttype[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const Mettre = (items: Contacttype) => {
    setSelectedContact(items)
    setidentifiant(items.id)
  }

  const fetchContacts = async () => {
    try {
      const res = await axios.get(`${URL}/api/messages/contacts/`, {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      setAmis(normalizeContacts(res.data))
    } catch (error: any) {
      console.log(error.response?.data)
    }
  }

  const fetchMessages = async (contactId: number | string) => {
    if (!contactId || contactId === 0) return

    try {
      const res = await axios.get(`${URL}/api/messages/${contactId}/`, {
        headers: { Authorization: `Bearer ${access_token}` },
      })

      const sortedMessages = normalizeMessages(res.data).sort((a, b) => getMessageDate(a) - getMessageDate(b))
      setMessages(sortedMessages)
    } catch (error: any) {
      console.log(error.response?.data)
      setMessages([])
    }
  }

  const Envoyer = async () => {
    if (!identifiant || (!message.trim() && !recordedBlob)) return

    try {
      const currentUser = getCurrentUser()
      const formData = new FormData()
      formData.append("destinataire_id", String(identifiant))

      if (message.trim()) {
        formData.append("contenu", message.trim())
      }

      if (recordedBlob) {
        formData.append("audio", recordedBlob, "vocal.webm")
        formData.append("type", "audio")
      }

      const response = await axios.post(`${URL}/api/messages/`, formData, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      const newMessage = normalizeMessages(response.data)
      if (newMessage.length > 0) {
        setMessages((prev) => [...prev, ...newMessage].sort((a, b) => getMessageDate(a) - getMessageDate(b)))
      } else {
        const optimistic: ChatMessage = {
          id: Date.now(),
          sender_id: currentUser?.id ?? "me",
          destinataire_id: identifiant,
          contenu: message.trim() || "Message vocal",
          created_at: new Date().toISOString(),
          type: recordedBlob ? "audio" : "text",
          sender: { id: currentUser?.id ?? "me", nom: currentUser?.nom ?? "Moi", prenom: currentUser?.prenom ?? "" },
        }
        setMessages((prev) => [...prev, optimistic].sort((a, b) => getMessageDate(a) - getMessageDate(b)))
      }

      setMessage("")
      setRecordedBlob(null)
    } catch (error: any) {
      console.error(error.response?.data)
    }
  }

  const handleback = () => {
    setSelectedContact(null)
    setShowOption(false)
  }

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn("L'enregistrement audio n'est pas supporté sur ce navigateur.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        setRecordedBlob(blob)
        stream.getTracks().forEach((track) => track.stop())
      }

      recorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Erreur d'accès au microphone", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  useEffect(() => {
    if (identifiant) {
      fetchMessages(identifiant)
    }
  }, [identifiant])

  const filtre = amis.filter((items) => `${items.nom ?? ""} ${items.prenom ?? ""}`.toLowerCase().includes(search.toLowerCase()))

  const groupedMessages = messages.reduce<Record<string, ChatMessage[]>>((acc, item) => {
    const source = item.created_at ?? item.date ?? new Date().toISOString()
    const key = formatFrenchDate(source)
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  return (
    <div className="overflow-auto bg-[#f3f7fb] dark:bg-[#0b1220]">
      <div className="w-full h-20 md:h-28" />

      <div className="container mx-auto -mt-16 md:-mt-24 px-1.5 md:px-0">
        <div className="py-2 md:py-5">
          <div className="flex flex-col md:flex-row shadow-[0_15px_40px_rgba(15,23,42,0.10)] rounded-[28px] border border-slate-200/80 dark:border-slate-700/80 overflow-hidden bg-white dark:bg-[#111827] min-h-[82vh] md:min-h-[78vh]">
            <div className={`${selectedcontact ? "hidden md:flex" : "flex"} w-full md:w-[34%] flex-col bg-[#f7f9fc] dark:bg-[#0f172a] border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700`}>
              <div className="py-3 px-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <img className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-100 shadow-sm" src={Mohamed} alt="avatar utilisateur" />
                </div>

                <div className="flex items-center gap-4 text-slate-600 dark:text-slate-200">
                  <button type="button" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <MdMessage className="w-5 h-5" />
                  </button>
                  <button type="button" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <LuCircleDashed className="w-5 h-5" />
                  </button>
                  <button type="button" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <BsThreeDotsVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="px-3 py-2.5 bg-[#eef4ff] dark:bg-slate-900/80">
                <div className="relative">
                  <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSerarch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400"
                    placeholder="Chercher une discussion"
                  />
                </div>
              </div>

              <div className={`flex-1 ${sidebarcollaps ? "" : "overflow-y-auto"} px-2 pb-2`}>
                {filtre.map((item) => (
                  <div
                    key={String(item.id)}
                    onClick={() => Mettre(item)}
                    className="mt-2 rounded-2xl px-2 py-2.5 cursor-pointer transition-all duration-200 hover:bg-white hover:shadow-sm dark:hover:bg-slate-800/80"
                  >
                    <div className="flex items-center gap-3">
                      <img className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700" src={item.image ?? item.avatar ?? item.photo ?? Mohamed} alt={item.nom ?? item.prenom ?? "contact"} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                            {(item.nom ?? "") + " " + (item.prenom ?? "")}
                          </p>
                          <span className="text-[10px] text-slate-500 dark:text-slate-300 whitespace-nowrap">{new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-300 truncate mt-1">Dernier message</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${selectedcontact ? "flex" : "hidden md:flex"} w-full md:w-[66%] flex-col bg-[#f9fbff] dark:bg-[#0b1220]`}>
              {selectedcontact ? (
                <>
                  <div className="py-3 px-3 md:px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={handleback}
                        className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        aria-label="Retour"
                      >
                        <IoArrowBackOutline className="w-4 h-4" />
                      </button>
                      <img src={selectedcontact.image ?? selectedcontact.avatar ?? selectedcontact.photo ?? Mohamed} alt="image_du_destinateur" className="h-11 w-11 rounded-full object-cover ring-2 ring-emerald-100" title={selectedcontact.nom ?? selectedcontact.prenom ?? "Contact"} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{(selectedcontact.nom ?? "") + " " + (selectedcontact.prenom ?? "")}</p>
                        <p className="text-[11px] text-emerald-500">En ligne</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-200 relative">
                      <div className="relative">
                        <button type="button" onClick={() => setShowsearch((prev) => !prev)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                          <IoSearch className="w-4 h-4" />
                        </button>
                        {showSearch && (
                          <div className="absolute right-0 top-12 w-52 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-2 z-10">
                            <input type="text" className="w-full text-left px-3 py-2 text-sm rounded-xl transition-colors placeholder:text-slate-800 dark:placeholder:text-slate-200" />
                          </div>
                        )}
                      </div>

                      <button type="button" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <ImAttachment className="w-4 h-4" />
                      </button>
                      <div className="relative">
                        <button type="button" onClick={() => setShowOption((prev) => !prev)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Options conversation">
                          <BsThreeDotsVertical className="w-4 h-4" />
                        </button>

                        {showOption && (
                          <div className="absolute right-0 top-12 w-52 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-2 z-10">
                            {[
                              "Informations du contact",
                              "Notifications",
                              "Thème",
                              "Archiver la discussion",
                              "Signalement",
                              "Retour",
                            ].map((option) => (
                              <button
                                key={option}
                                type="button"
                                onClick={() => {
                                  if (option === "Retour") {
                                    handleback()
                                    return
                                  }
                                  setShowOption(false)
                                }}
                                className="w-full text-left px-3 py-2 text-sm rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_55%)] bg-[#f5f7fb] dark:bg-[#0b1220]">
                    <div className="py-3 px-3 md:px-4 space-y-3">
                      {Object.entries(groupedMessages).map(([dateKey, items]) => (
                        <div key={dateKey} className="space-y-3">
                          <div className="flex justify-center">
                            <div className="rounded-full bg-white dark:bg-slate-800 px-3 py-1 shadow-sm border border-slate-200 dark:border-slate-700">
                              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">{dateKey}</p>
                            </div>
                          </div>

                          {items.map((item, index) => {
                            const currentUser = getCurrentUser()
                            const isMine = String(item.sender_id ?? item.auteur_id ?? item.emetteur_id ?? item.sender?.id ?? "") === String(currentUser?.id ?? "") || item.sender?.username === currentUser?.username
                            const audioUrl =
                              resolveMediaUrl(item.audio ?? item.voice ?? item.audio_url ?? item.voice_url ?? item.file ?? item.media) ??
                              (!item.contenu && !item.message && !item.content ? null : null)
                            const messageText = item.contenu ?? item.content ?? item.message ?? ""
                            const senderName = isMine ? "Moi" : getUserDisplayName(item.sender ?? { nom: selectedcontact.nom, prenom: selectedcontact.prenom })
                            const dateValue = item.created_at ?? item.date ?? item.time ?? item.timestamp ?? new Date().toISOString()

                            return (
                              <div key={`${dateKey}-${index}`} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[78%] rounded-2xl px-3 py-2 shadow-sm ${isMine ? "rounded-tr-md bg-linear-to-br from-emerald-500 to-teal-500 text-white" : "rounded-tl-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"}`}>
                                  {!isMine && <p className="text-[11px] font-semibold text-emerald-600">{senderName}</p>}

                                  {audioUrl ? (
                                    <div className="mt-1">
                                      <audio controls src={audioUrl} className="w-full max-w-55 h-10" />
                                    </div>
                                  ) : messageText ? (
                                    <p className="text-sm mt-1 wrap-break-word">{messageText}</p>
                                  ) : null}

                                  <p className={`text-right text-[10px] mt-1 ${isMine ? "text-emerald-100" : "text-slate-400"}`}>
                                    {formatHour(dateValue)}
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="px-3 py-3 md:px-4 md:py-4 flex items-center gap-3 border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <button type="button" className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                      <MdEmojiEmotions className="w-5 h-5" />
                    </button>

                    <div className="flex-1">
                      <input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400"
                        type="text"
                        placeholder="Écrire un message..."
                      />
                    </div>

                    {recordedBlob ? (
                      <button type="button" onClick={Envoyer} className="flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:scale-[1.03] transition-transform cursor-pointer">
                        <IoIosSend className="w-5 h-5" />
                      </button>
                    ) : message === "" ? (
                      <button
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${isRecording ? "bg-red-500 text-white animate-pulse" : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-emerald-500 hover:text-white"}`}
                      >
                        <FaMicrophone className="w-5 h-5" />
                      </button>
                    ) : (
                      <button type="button" onClick={Envoyer} className="flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:scale-[1.03] transition-transform cursor-pointer">
                        <IoIosSend className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden md:flex flex-1 items-center justify-center bg-[#f9fbff] dark:bg-[#0b1220]">
                  <div className="text-center text-slate-500 dark:text-slate-400">
                    <MdMessage className="w-12 h-12 mx-auto mb-3 opacity-60" />
                    <p className="text-lg font-medium">Sélectionnez une discussion</p>
                    <p className="text-sm mt-1">Choisissez un contact pour commencer.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Message