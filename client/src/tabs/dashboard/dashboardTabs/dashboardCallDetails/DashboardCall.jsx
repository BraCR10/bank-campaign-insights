import React from "react";
import styles from "./DashboardCall.module.css"
import Histogram from "../../../../components/histogram/Histogram"
import GroupedBarChart from "../../../../components/groupedBarChart/GroupedBarChart";
import AreaChartComponent from "../../../../components/areaChart/AreaChart";
import StackedBarChart from "../../../../components/stackedChart/StackedChart";
import { useContext } from "react";
import { DashboardDataContext } from "../../../../context/DashboardDataContext";


function DashboardCall(){
    const {dashboardData, setDashboardData} = useContext(DashboardDataContext);
    return (
        <div className={styles.mainContainer}>
            <div className={`${styles.graphContainer} ${styles.groupedBarContainer}`}>
                <div className={styles.card}>
                    <GroupedBarChart
                    data={dashboardData.contactType}
                    keys={["Celular", "Telefono"]}
                    title="Tipo de Contacto"
                    horizontal={true}
                    />
                </div>
            </div>
            <div className={`${styles.graphContainer} ${styles.lineContainer}`}>
                <div className={styles.card}>
                    <Histogram 
                    data={dashboardData.callsPerMonth} 
                    xLabel="Mes" 
                    yLabel="Cantidad" 
                    title="Llamadas por Mes" 
                    showBars={false}
                    showLine={true}
                    lineColor= "#835eacff">
                    </Histogram>
                </div>
            </div>
            <div className={`${styles.graphContainer} ${styles.areaChartContainer}`}>
                <div className={styles.card}>
                    <AreaChartComponent
                    data={dashboardData.weekDayCR}
                    title="Tasa de conversión por día de la semana"
                    xLabel="Día"
                    yLabel="Tasa de Conversión"
                    areaColor="rgba(59, 130, 246, 0.3)"
                    strokeColor="#3b82f6"
                    />
                </div>
            </div>
            <div className={`${styles.graphContainer} ${styles.groupedDurationContainer}`}>
                <div className={styles.card}>
                    <GroupedBarChart
                    data={dashboardData.callAvgDuration}
                    keys={["Aceptadas", "Rechazadas"]}
                    colors={["#19a385ff", "#6b0d63ff"]}
                    title="Duración promedio de llamadas en segundos"
                    horizontal={true}
                    />
                </div>
            </div>
            <div className={`${styles.graphContainer} ${styles.capaingHist}`}>
                <div className={styles.card}>
                    <Histogram 
                    data={dashboardData.campaignCalls} 
                    xLabel="Campaña" 
                    yLabel="Cantidad" 
                    title="Llamadas por Campaña" 
                    showBars={false}
                    showLine={true}
                    lineColor= "#8f770dff">
                    </Histogram>
                </div>
            </div>
            <div className={`${styles.graphContainer} ${styles.stackedChart}`}>
                <div className={styles.card}>
                    <StackedBarChart
                    data={dashboardData.callOutcome}
                    series={["Exito", "Ninguno", "Fallida"]}
                    title="Resultado de las llamadas"
                    yLabel="Cantidad"
                    />
                </div>
            </div>
        </div>
    )
}

export default DashboardCall