import { SpotDashboard } from "./data/SpotDashboard";
import { OptionDashboard } from "./data/OptionDashboard";
import { PerpsDashboard } from "./data/PerpsDashboard";

const DashPresets = (coin, exchange, type) => {
  if (type == "Spot") {
    return SpotDashboard
  } else if (type == "Options") {
    return OptionDashboard
  } else if (type == "Perps") {
    return PerpsDashboard
  }
  return {}
};

export default DashPresets;