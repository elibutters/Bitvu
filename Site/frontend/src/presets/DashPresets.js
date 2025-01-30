import { PerpsDashboard } from "@/presets/types/PerpsDashboard";

const DashPresets = (coin, exchange, type) => {
  if (type == "Spot") {
    return None
  } else if (type == "Options") {
    return None
  } else if (type == "Perps") {
    return PerpsDashboard
  }
  return {}
};
export default DashPresets;