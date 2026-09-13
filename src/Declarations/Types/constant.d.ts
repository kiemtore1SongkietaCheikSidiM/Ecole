export type LParent = {
    id:number
    nom:string
    prenom:string
    role:string
    email:string
    telephone:number
    eleves:
        {
        id:string
        nom:string
        prenom:string
        classe:string
        created_at:string
        }[]
}
export type LEnseign = {
    id:number
    nom:string
    prenom:string
    email:string
    telephone:string
    classes:{
        id:number
        nom:string
        matiere:string
    }[]
}
export type eleves=
        {
        id:string
        nom:string
        prenom:string
        classe:string
        created_at:string
        }
export type contactType = {
    id:number
    Nom:string
    Prenom:string
    Dernier:string
    heure:string
    image:string
}
export type HistoryType = {
    id:number
    Nom:string
    Prenom:string
    date:string
    heure:string
}
export type Msg = {
    message:string
    auteur:string
    destinateur:string
    date:string
    heure:string
}
export type ParamsProps = {
  selectedPath?: string | null
  onSelect?: (path: string) => void
}
export type Contacttype ={
    id:number
    nom:string
    prenom:string
}
export type Message = {
    message :string
}
export type eleve ={
    nom:string
    prenom:string
    classe:string
}
export type note ={

}