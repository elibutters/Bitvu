import { useState } from "react";
import Image from 'next/image';
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useDashboard } from '@/context/DashboardContext';
import styles from '@/styles/DashCharts.module.css';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

export default function DashCharts() {
  const { layouts, selectedCoin } = useDashboard();
  const [currentLayouts, setCurrentLayouts] = useState(layouts);

  useState(() => {
    setCurrentLayouts(layouts);
  }, [layouts]);

  return (
    <ResponsiveReactGridLayout
      className={styles.layout}
      layouts={currentLayouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      compactType="vertical"
      draggableHandle=".draggable"
    >
      {Object.keys(layouts.lg).map((widgetKey) => {
        const widget = layouts.lg[widgetKey];
        const ChartComponent = layouts.lg[widgetKey].chartType;
        
        return (
          <div key={widget.i} data-grid={widget} className={styles.widgetContainer}>
            <div className={`${styles.widgetHeader} draggable`}>
              <div className={styles.leftSideChartHeader}>
                <div className={styles.chartTag}>
                <Image
                    src="/bitvu_favicon.svg"
                    alt="logo"
                    height={18}
                    width={18}
                    className="mr-[0.7rem]"
                  />
                  <div className={styles.chartTitle}>{widget.name}</div>
                  <svg 
                      className="hidden md:block h-4 w-px text-gray-200 align-center" 
                      viewBox="0 0 1 8" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                  >
                      <line x1="0.5" y1="0.5" x2="0.499999" y2="20.5" stroke="currentColor"/>
                  </svg>
                  <div className={styles.chartAsset}>{selectedCoin}</div>
                </div>
              </div>
              <svg className={styles.infoIcon} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                <path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
              </svg>
            </div>
            <div className={styles.widgetBody}>
                <ChartComponent/>
            </div>
          </div>
        );
      })}
    </ResponsiveReactGridLayout>
  );
};