import { TimeLine } from "../../Declarations/Constant";

const SelecteTime = () => {
  return (
    <select name="" id="">
      {TimeLine.map((items, index) => (
        <option value="" key={index}>
          {items.Temps}
        </option>
      ))}
    </select>
  );
};

export default SelecteTime;
