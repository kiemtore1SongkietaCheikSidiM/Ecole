import Moyenne from "../Layout/Moyenne"
import Revenus from "../Layout/Revenus"


const Chartsection = () => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
            <Revenus/>
        </div>
        <div className="space-y-6">
            <Moyenne/>
        </div>
    </div>
  )
}

export default Chartsection