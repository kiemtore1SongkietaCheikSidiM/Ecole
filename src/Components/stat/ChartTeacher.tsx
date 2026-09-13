import MoyenneT from "../Layout/MoyenneT";
import Statbarteacher from "../Layout/Statbarteacher";

const ChartTeacher = () => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2">
        <Statbarteacher />
      </div>
      <div className="space-y-6">
        <MoyenneT />
      </div>
    </div>
  );
};

export default ChartTeacher;
