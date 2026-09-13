import Statgeneral from "../../Components/Layout/Statgeneral";
import Chartsection from "../../Components/stat/Chartsection";
import BestStudents from "../../Components/Utiles/BestStudents";
import Activite from "../../Components/Utiles/Activite";

const Dashboard = () => {
  return (
    <div>
      <Statgeneral />
      <Chartsection />
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

export default Dashboard;
