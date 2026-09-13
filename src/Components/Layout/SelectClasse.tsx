import { classe } from "../../Declarations/Constant";
type cool = {
  clace: string;
  setClasse: React.Dispatch<React.SetStateAction<string>>;
};

const SelectClasse = ({ clace, setClasse }: cool) => {
  return (
    <div>
      <select
        name=""
        id=""
        value={clace}
        onChange={(e) => setClasse(e.target.value)}
      >
        <option value="">Selectionne</option>
        {classe.map((items, index) => (
          <option value={items.classe} key={index}>
            {items.classe}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectClasse;
