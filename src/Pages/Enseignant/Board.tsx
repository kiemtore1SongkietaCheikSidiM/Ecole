import StatEns from "../../Components/Layout/StatEns";
import Activite from "../../Components/Utiles/Activite";
import BestStudents from "../../Components/Utiles/BestStudents";
import ChartTeacher from "../../Components/stat/ChartTeacher";

const Board = () => {
  return (
    <div>
      <StatEns />
      <ChartTeacher />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <BestStudents />
        </div>
        <div>
          <Activite />
        </div>
      </div>
    </div>
  );
};

export default Board;
