import StatStudent from "../../Components/Layout/StatStudent";
import Activite from "../../Components/Utiles/Activite";
import BestStudents from "../../Components/Utiles/BestStudents";
import ChartStudent from "../../Components/stat/ChartStudent";

const Tableau = () => {
  return (
    <div>
      <StatStudent />
      <ChartStudent />
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

export default Tableau;
