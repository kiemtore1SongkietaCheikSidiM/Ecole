import { Eleve5eme } from "../../Declarations/Constant";
import Select from "react-select";
import type { Student } from "../../Declarations/Types";
type selection = {
  nom: Student | null;
  setNom: React.Dispatch<React.SetStateAction<Student | null>>;
};

const SelectNom = ({ nom, setNom }: selection) => {
  return (
    <div>
      <Select<Student>
        value={nom}
        onChange={setNom}
        options={Eleve5eme}
        getOptionLabel={(option) => option.Nom + " " + option.Prenom}
        getOptionValue={(option) => option.Prenom}
        isSearchable
        placeholder="Nom et Prenom"
      />
    </div>
  );
};

export default SelectNom;
