import PerpChart from "@/components/ChartTypes/PerpChart";
import FundingChart from "@/components/ChartTypes/FundingChart";

export const PerpsDashboard = {
    layouts: {
        lg: [
          { i: 'chart-1', x: 0, y: 0, w: 8, h: 4, isBounded: true, minW: 3, name: 'Chart', chartType: PerpChart, isHC: false},
          { i: 'chart-2', x: 8, y: 0, w: 4, h: 4, isBounded: true, minW: 3, name: 'Funding', chartType: FundingChart, isHC: true},
          { i: 'chart-3', x: 0, y: 2, w: 6, h: 3, isBounded: true, minW: 3, name: "Footprint Volatilty Curves", chartType: PerpChart, isHC: true},
          { i: 'chart-4', x: 6, y: 2, w: 6, h: 3, isBounded: true, minW: 3, name: "ATM Active Maturities", chartType: PerpChart, isHC: true},
          { i: 'chart-5', x: 0, y: 4, w: 6, h: 3, isBounded: true, minW: 3, name: "Shadow Skew Delta", chartType: PerpChart, isHC: true},
          { i: 'chart-6', x: 6, y: 4, w: 6, h: 3, isBounded: true, minW: 3, name: "Historical OI By Strike", chartType: PerpChart, isHC: true },
          { i: 'chart-7', x: 0, y: 6, w: 6, h: 3, isBounded: true, minW: 3, name: "USD Normalized Gamma", chartType: PerpChart, isHC: true },
          { i: 'chart-8', x: 6, y: 6, w: 6, h: 3, isBounded: true, minW: 3, name: "Gamma Level With Expiration", chartType: PerpChart, isHC: true},
        ],
        md: [
          { i: 'chart-1', x: 0, y: 0, w: 5, h: 3, isBounded: true, minW: 3, name: 'Weekly Volume'},
          { i: 'chart-2', x: 5, y: 0, w: 5, h: 3, isBounded: true, minW: 3, name: 'Order Book' },
          { i: 'chart-3', x: 0, y: 2, w: 5, h: 3, isBounded: true, minW: 3, name: "Footprint Volatilty Curves" },
          { i: 'chart-4', x: 5, y: 2, w: 5, h: 3, isBounded: true, minW: 3, name: "ATM Active Maturities" },
          { i: 'chart-5', x: 0, y: 4, w: 5, h: 3, isBounded: true, minW: 3, name: "Shadow Skew Delta" },
          { i: 'chart-6', x: 5, y: 4, w: 5, h: 3, isBounded: true, minW: 3, name: "Historical OI By Strike" },
          { i: 'chart-7', x: 0, y: 6, w: 5, h: 3, isBounded: true, minW: 3, name: "USD Normalized Gamma" },
          { i: 'chart-8', x: 5, y: 6, w: 5, h: 3, isBounded: true, minW: 3, name: "Gamma Level With Expiration" },
        ],
        sm: [
          { i: 'chart-1', x: 0, y: 0, w: 3, h: 3, isBounded: true, minW: 2, name: 'Weekly Volume'},
          { i: 'chart-2', x: 3, y: 0, w: 3, h: 3, isBounded: true, minW: 2, name: 'Order Book' },
          { i: 'chart-3', x: 0, y: 2, w: 3, h: 3, isBounded: true, minW: 2, name: "Footprint Volatilty Curves" },
          { i: 'chart-4', x: 3, y: 2, w: 3, h: 3, isBounded: true, minW: 2, name: "ATM Active Maturities" },
          { i: 'chart-5', x: 0, y: 4, w: 3, h: 3, isBounded: true, minW: 2, name: "Shadow Skew Delta" },
          { i: 'chart-6', x: 3, y: 4, w: 3, h: 3, isBounded: true, minW: 2, name: "Historical OI By Strike" },
          { i: 'chart-7', x: 0, y: 6, w: 3, h: 3, isBounded: true, minW: 2, name: "USD Normalized Gamma" },
          { i: 'chart-8', x: 3, y: 6, w: 3, h: 3, isBounded: true, minW: 2, name: "Gamma Level With Expiration" },
        ],
        xs: [
          { i: 'chart-1', x: 0, y: 0, w: 2, h: 3, isBounded: true, name: 'Weekly Volume'},
          { i: 'chart-2', x: 2, y: 0, w: 2, h: 3, isBounded: true, name: 'Order Book' },
          { i: 'chart-3', x: 0, y: 2, w: 2, h: 3, isBounded: true, name: "Footprint Volatilty Curves" },
          { i: 'chart-4', x: 2, y: 2, w: 2, h: 3, isBounded: true, name: "ATM Active Maturities" },
          { i: 'chart-5', x: 0, y: 4, w: 2, h: 3, isBounded: true, name: "Shadow Skew Delta" },
          { i: 'chart-6', x: 2, y: 4, w: 2, h: 3, isBounded: true, name: "Historical OI By Strike" },
          { i: 'chart-7', x: 0, y: 6, w: 2, h: 3, isBounded: true, name: "USD Normalized Gamma" },
          { i: 'chart-8', x: 2, y: 6, w: 2, h: 3, isBounded: true, name: "Gamma Level With Expiration" },
        ],
        xxs: [
          { i: 'chart-1', x: 0, y: 0, w: 1, h: 3, isBounded: true, name: 'Weekly Volume'},
          { i: 'chart-2', x: 1, y: 0, w: 1, h: 3, isBounded: true, name: 'Order Book' },
          { i: 'chart-3', x: 0, y: 2, w: 1, h: 3, isBounded: true, name: "Footprint Volatilty Curves" },
          { i: 'chart-4', x: 1, y: 2, w: 1, h: 3, isBounded: true, name: "ATM Active Maturities" },
          { i: 'chart-5', x: 0, y: 4, w: 1, h: 3, isBounded: true, name: "Shadow Skew Delta" },
          { i: 'chart-6', x: 1, y: 4, w: 1, h: 3, isBounded: true, name: "Historical OI By Strike" },
          { i: 'chart-7', x: 0, y: 6, w: 1, h: 3, isBounded: true, name: "USD Normalized Gamma" },
          { i: 'chart-8', x: 1, y: 6, w: 1, h: 3, isBounded: true, name: "Gamma Level With Expiration" },
        ],
    }
}