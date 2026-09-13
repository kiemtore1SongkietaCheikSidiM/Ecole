import MoyenneS from "../Layout/MoyenneS"
import StatbarStudent from "../Layout/StatbarStudent"



const ChartStudent = () => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
            <StatbarStudent/>
        </div>
        <div className="space-y-6">
            <MoyenneS/>
        </div>
    </div>
  )
}

export default ChartStudent