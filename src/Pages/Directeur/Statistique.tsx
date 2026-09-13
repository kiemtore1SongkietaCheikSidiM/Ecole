import Moyenne from "../../Components/Layout/Moyenne"
import Revenus from "../../Components/Layout/Revenus"
import LineCharts from "../../Components/stat/LineCharts"



const Statistique = () => {
  return (
    <div>
      <LineCharts/>
      <Revenus/>
      <Moyenne/>
    </div>
  )
}

export default Statistique