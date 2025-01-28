import ExRHC from "../../components/ChartTypes/ExRHC";
import OBTable from "../../components/ChartTypes/OBTable";
import OptionsBook from "../../components/ChartTypes/OptionsBook";

export const SpotDashboard = {
    layouts: {
        lg: [
          { i: 'chart-1', x: 0, y: 0, w: 8, h: 4, isBounded: true, minW: 3, name: 'Price Chart', chartType: ExRHC, isHC: true },
          { i: 'chart-2', x: 8, y: 0, w: 4, h: 4, isBounded: true, minW: 3, name: 'Order Book', chartType: OptionsBook, isHC: false },
          { i: 'chart-3', x: 0, y: 2, w: 6, h: 3, isBounded: true, minW: 3, name: 'Spot Chart', chartType: ExRHC, isHC: true },
          { i: 'chart-4', x: 6, y: 2, w: 6, h: 3, isBounded: true, minW: 3, name: 'Spot Chart', chartType: ExRHC, isHC: true },
          { i: 'chart-5', x: 0, y: 4, w: 6, h: 3, isBounded: true, minW: 3, name: 'Spot Chart', chartType: ExRHC, isHC: true },
          { i: 'chart-6', x: 6, y: 4, w: 6, h: 3, isBounded: true, minW: 3, name: 'Spot Chart', chartType: ExRHC, isHC: true },
          { i: 'chart-7', x: 0, y: 6, w: 6, h: 3, isBounded: true, minW: 3, name: 'Spot Chart', chartType: ExRHC, isHC: true },
          { i: 'chart-8', x: 6, y: 6, w: 6, h: 3, isBounded: true, minW: 3, name: 'Spot Chart', chartType: ExRHC, isHC: true },
        ],
        md: [
          { i: 'chart-1', x: 0, y: 0, w: 5, h: 3, isBounded: true, minW: 3, name: 'Price Chart'},
          { i: 'chart-2', x: 5, y: 0, w: 5, h: 3, isBounded: true, minW: 3, name: 'Order Book' },
          { i: 'chart-3', x: 0, y: 2, w: 5, h: 3, isBounded: true, minW: 3, name: 'Spot Chart' },
          { i: 'chart-4', x: 5, y: 2, w: 5, h: 3, isBounded: true, minW: 3, name: 'Spot Chart' },
          { i: 'chart-5', x: 0, y: 4, w: 5, h: 3, isBounded: true, minW: 3, name: 'Spot Chart' },
          { i: 'chart-6', x: 5, y: 4, w: 5, h: 3, isBounded: true, minW: 3, name: 'Spot Chart' },
          { i: 'chart-7', x: 0, y: 6, w: 5, h: 3, isBounded: true, minW: 3, name: 'Spot Chart' },
          { i: 'chart-8', x: 5, y: 6, w: 5, h: 3, isBounded: true, minW: 3, name: 'Spot Chart' },
        ],
        sm: [
          { i: 'chart-1', x: 0, y: 0, w: 3, h: 3, isBounded: true, minW: 2, name: 'Price Chart'},
          { i: 'chart-2', x: 3, y: 0, w: 3, h: 3, isBounded: true, minW: 2, name: 'Order Book' },
          { i: 'chart-3', x: 0, y: 2, w: 3, h: 3, isBounded: true, minW: 2, name: 'Spot Chart' },
          { i: 'chart-4', x: 3, y: 2, w: 3, h: 3, isBounded: true, minW: 2, name: 'Spot Chart' },
          { i: 'chart-5', x: 0, y: 4, w: 3, h: 3, isBounded: true, minW: 2, name: 'Spot Chart' },
          { i: 'chart-6', x: 3, y: 4, w: 3, h: 3, isBounded: true, minW: 2, name: 'Spot Chart' },
          { i: 'chart-7', x: 0, y: 6, w: 3, h: 3, isBounded: true, minW: 2, name: 'Spot Chart' },
          { i: 'chart-8', x: 3, y: 6, w: 3, h: 3, isBounded: true, minW: 2, name: 'Spot Chart' },
        ],
        xs: [
          { i: 'chart-1', x: 0, y: 0, w: 2, h: 3, isBounded: true, name: 'Price Chart'},
          { i: 'chart-2', x: 2, y: 0, w: 2, h: 3, isBounded: true, name: 'Order Book' },
          { i: 'chart-3', x: 0, y: 2, w: 2, h: 3, isBounded: true, name: 'Spot Chart' },
          { i: 'chart-4', x: 2, y: 2, w: 2, h: 3, isBounded: true, name: 'Spot Chart' },
          { i: 'chart-5', x: 0, y: 4, w: 2, h: 3, isBounded: true, name: 'Spot Chart' },
          { i: 'chart-6', x: 2, y: 4, w: 2, h: 3, isBounded: true, name: 'Spot Chart' },
          { i: 'chart-7', x: 0, y: 6, w: 2, h: 3, isBounded: true, name: 'Spot Chart' },
          { i: 'chart-8', x: 2, y: 6, w: 2, h: 3, isBounded: true, name: 'Spot Chart' },
        ],
        xxs: [
          { i: 'chart-1', x: 0, y: 0, w: 1, h: 3, isBounded: true, name: 'Price Chart'},
          { i: 'chart-2', x: 1, y: 0, w: 1, h: 3, isBounded: true, name: 'Order Book' },
          { i: 'chart-3', x: 0, y: 2, w: 1, h: 3, isBounded: true, name: 'Spot Chart' },
          { i: 'chart-4', x: 1, y: 2, w: 1, h: 3, isBounded: true, name: 'Spot Chart' },
          { i: 'chart-5', x: 0, y: 4, w: 1, h: 3, isBounded: true, name: 'Spot Chart' },
          { i: 'chart-6', x: 1, y: 4, w: 1, h: 3, isBounded: true, name: 'Spot Chart' },
          { i: 'chart-7', x: 0, y: 6, w: 1, h: 3, isBounded: true, name: 'Spot Chart' },
          { i: 'chart-8', x: 1, y: 6, w: 1, h: 3, isBounded: true, name: 'Spot Chart' },
        ],
    }
}