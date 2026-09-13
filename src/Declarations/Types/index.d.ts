

export interface SidebarProps {
    id: number,
    icon: React.ElementType,
    label: string,
    path?:string,
    action?:string
    count?:number,
    active?:boolean,
    badge?:boolean,
    color?: string,
    submenu?: SidebarProps[]
}
export type Search={
    searchTerm?:string | (()=> void) 
    search?:string
    SetserchTerm?:React.Dispatch<React.SetStateAction<string>>
    SetSearch?:React.Dispatch<React.SetStateAction<string>>
    sidebarcollaps?:boolean
    ontoggle?:()=>void
}
export type stats ={
    title:string
    value:string
    change:string
    trend:string
    icon:React.ElementType
    color:string
    bgColor:string
    textColor:string
}
export type Donne ={
    Class:string
    Admis:number
    echec:number
}
export type Moyennes = {
    nom:string
    value:number
    color:string
}
export type Best = {
    id:string
    Nom:string
    Classe:string
    Moyenne:number
    Honneur:string
    Trimestre:string
}
export type Bad = {
    name:string
    Moyenne:number
    Classe:string
    trend:string
    change:string
}
export type Active = {
    id:number
    type:string
    icon:React.ElementType
    title:string
    description:string
    time:string
    color:string
    bgColor:string
}
export type genere = {
    id:number
    title:string
    icon:React.ElementType
    path:string
}
export type Student = {
    Nom:string
    Prenom:string
}
export type Classes ={
    classe:string
}
export type fonction = {
    min?:number
    max?:number
}
export type Todet = {
  id:number
  classe:string
  Nom:string | undefined
  Prenom:string | undefined
  heure:string
}
export type Note = {
    Matiere:string
    Note:number
    Note1:number
    Composition:number
    Moyenne:number
    Date:String
    Mention:string
}
export type dataClaMa = {
    value:string
    label:string
}
export type bonne ={
    id:number
    nom:string
} 