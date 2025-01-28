import React from 'react';
import { useState, useEffect, useRef, useContext } from "react";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import '../../styles/Dashboard/DashCharts.css';
import { Responsive, WidthProvider } from 'react-grid-layout';
import Highcharts, { chart } from 'highcharts/highstock';
import ExHC from './ExHC';
import ExRHC from '../ChartTypes/ExRHC';
import logo from '../../assets/images/tr_logo.svg'
import { DashboardContext } from '../../contexts/DashboardContext';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

export default function DashCharts() {
  const chartRefs = useRef({});
  const timeoutRef = useRef(null);

  const { layouts, selectedCoin, chartData } = useContext(DashboardContext);
  const [currentLayouts, setCurrentLayouts] = useState(layouts);

  useEffect(() => {
      setCurrentLayouts(layouts);
  }, [layouts]);

  const onLayoutChange = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    console.log('Layout changed. Reflowing charts...');
    timeoutRef.current = setTimeout(() => {
      let counter = 0;
      for (let i = 0; i < Highcharts.charts.length; i += 1) {
        if (Highcharts.charts[i] !== undefined) {
          console.log("Reflowing");
          console.log(layouts.lg);
          const chartContainer = chartRefs.current[counter];
          console.log('Container');
          console.log(chartContainer);
          if(chartContainer) {
            const { clientWidth, clientHeight } = chartContainer;
            Highcharts.charts[i].setSize(clientWidth, clientHeight, false); 
            console.log('chart container:', chartContainer);
          }
          console.log(counter);
          counter += 1;
        }
      }
    }, 220);
  };
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
      onLayoutChange();
  }, [currentLayouts]);
  let hcWidgetCounter = 0;

  return (
      <ResponsiveReactGridLayout
        className="layout"
        layouts={currentLayouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        compactType={"vertical"}
        onLayoutChange={() => onLayoutChange()}
        onResize={() => onLayoutChange()}
        onWidthChange={() => onLayoutChange()}
        draggableHandle=".draggable"
      >
        {Object.keys(layouts.lg).map((widgetKey) => {
          const ChartComponent = layouts.lg[widgetKey].chartType;
          console.log('Chart Type:', ChartComponent);
          return (<div key={layouts.lg[widgetKey].i} data-grid={layouts.lg[widgetKey]} className="widget-container">
            <div className="draggable widget-header">
              <div className="left-side-chart-header">
              <img src={logo} className="chart-logo"/>
                <div className="chart-tag">
                  <div className="chart-title">{layouts.lg[widgetKey].name}</div>
                  <div className="chart-asset">{selectedCoin}</div>               
                </div>
              </div>
              <svg className="info-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
            </div>

            <div
              className="widget-body"
              ref={(el) => {
                if (layouts.lg[widgetKey].isHC) {
                  chartRefs.current[hcWidgetCounter] = el;
                  hcWidgetCounter += 1;
                  console.log('adding widgetkey:', hcWidgetCounter);
                }
              }}
            >
              <ChartComponent />
            </div>
          </div>
        );})}
      </ResponsiveReactGridLayout>
  );
};