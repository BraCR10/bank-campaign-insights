import React from "react";
import styles from "./DashboardKPI.module.css"
import GroupedBarChart from "../../../../components/groupedBarChart/GroupedBarChart";
import StackedBarChart from "../../../../components/stackedChart/StackedChart";
import { Typography, Divider } from "@mui/material";
import Histogram from "../../../../components/histogram/Histogram";
import TimeSeriesChart from "../../../../components/timeSeries/TimeSeriesChart";
import { useContext } from "react";
import { DashboardDataContext } from "../../../../context/DashboardDataContext";

// Función para formatear números con decimales limitados
function formatNumber(num, decimals = 2) {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    return Number(num.toFixed(decimals));
}

function normalizeData(data) {
    const allKeys = Array.from(
        new Set(
        data.flatMap(item => Object.keys(item).filter(key => key !== "date"))
        )
    );
    
    // Limitar a las top 10 campañas con más datos o variación
    const campaignStats = allKeys.map(key => {
        const values = data.map(item => item[key] || 0);
        const sum = values.reduce((a, b) => a + b, 0);
        const variance = values.reduce((acc, val) => {
            const mean = sum / values.length;
            return acc + Math.pow(val - mean, 2);
        }, 0) / values.length;
        return { key, sum, variance };
    });

    // Ordenar por suma + varianza y tomar top 10
    const topCampaigns = campaignStats
        .sort((a, b) => (b.sum + b.variance) - (a.sum + a.variance))
        .slice(0, 10)
        .map(c => c.key);

    const normalizedData = data.map(item => {
        const newItem = { date: item.date };
        topCampaigns.forEach(key => {
            // Redondear a 2 decimales y convertir a porcentaje legible
            newItem[key] = formatNumber((item[key] || 0), 2);
        });
        return newItem;
    });
    
    return { normalizedData, allKeys: topCampaigns };
}

function DashboardAdditional(){
    const {dashboardData} = useContext(DashboardDataContext);
    const { normalizedData, allKeys } = normalizeData(dashboardData.campaignEfficiency || []);
    
    // Formatear datos de contactSuccess para redondear decimales
    const formattedContactSuccess = (dashboardData.contactSuccess || []).map(item => ({
        ...item,
        Celular: formatNumber(item.Celular || 0, 2),
        Telefono: formatNumber(item.Telefono || 0, 2)
    }));

    // Formatear datos de ageConversionRate
    const formattedAgeConversion = (dashboardData.ageConversionRate || []).map(item => ({
        ...item,
        value: formatNumber(item.value || 0, 2)
    }));

    // Formatear datos de prevImpact
    const formattedPrevImpact = (dashboardData.prevImpact || []).map(item => ({
        ...item,
        Exito: formatNumber(item.Exito || 0, 2),
        Fallido: formatNumber(item.Fallido || 0, 2),
        Ninguno: formatNumber(item.Ninguno || 0, 2)
    }));
    
    return (
        <div className={styles.mainContainer}>
            <div className={`${styles.graphContainer} ${styles.cardContainerCR}`}>
                <div className={styles.card}>
                    <Typography variant="body1" align="center">Tasa de Conversión</Typography>
                    <Divider 
                    orientation="horizontal" 
                    variant="middle" 
                    flexItem 
                    sx={{ my: 2,backgroundColor: 'white',borderColor: 'white',}}/>
                    <Typography variant="h4" align="center"> 
                        {formatNumber(dashboardData.cr || 0, 2)}%
                    </Typography>
                </div>
            </div>
            <div className={`${styles.graphContainer} ${styles.cardContainerTotal}`}>
                <div className={styles.card}>
                    <Typography variant="body1" align="center">Total de Contactos</Typography>
                    <Divider 
                    orientation="horizontal" 
                    variant="middle" 
                    flexItem 
                    sx={{ my: 2,backgroundColor: 'white',borderColor: 'white',}}/>
                    <Typography variant="h4" align="center"> 
                        {(dashboardData.totalCalls || 0).toLocaleString()}
                    </Typography>
                </div>
            </div>
            <div className={`${styles.graphContainer} ${styles.cardContainerMedian}`}>
                <div className={styles.card}>
                    <Typography variant="body1" align="center">Duración media de llamadas en segundos</Typography>
                    <Divider 
                    orientation="horizontal" 
                    variant="middle" 
                    flexItem 
                    sx={{ my: 2,backgroundColor: 'white',borderColor: 'white',}}/>
                    <Typography variant="h4" align="center"> 
                        {formatNumber(dashboardData.callAvg || 0, 0)}
                    </Typography>
                </div>
            </div>
            <div className={`${styles.graphContainer} ${styles.groupedBar}`}>
                <div className={styles.card}>
                    <GroupedBarChart
                    data={formattedContactSuccess}
                    keys={["Celular", "Telefono"]}
                    colors={["#791070ff", "#9c851fff"]}
                    title="Tasa de éxito por Canal (%)"
                    horizontal={false}
                    />
                </div>
            </div>
            <div className={`${styles.graphContainer} ${styles.ageBar}`}>
                <div className={styles.card}>
                    <Histogram 
                    data={formattedAgeConversion} 
                    xLabel="Tasa de Conversión (%)" 
                    yLabel="Rango de edad" 
                    title="Conversión por segmento de edad" 
                    showLine={false}
                    barColor= "#2f5eb6ff"
                    horizontal= {true}>
                    </Histogram>
                </div>
            </div>
            <div className={`${styles.graphContainer} ${styles.stackBar}`}>
                <div className={styles.card}>
                    <StackedBarChart
                    data={formattedPrevImpact}
                    series={["Exito", "Fallido", "Ninguno"]}
                    title="Impacto del historial previo"
                    yLabel="Tasa de Conversión (%)"
                    colors={["#1b1079ff", "#1f8d9cff" , "#1f9c57ff"]}
                    />
                </div>
            </div>
            <div className={`${styles.graphContainer} ${styles.timeSer}`}>
                <div className={styles.card}>
                    <TimeSeriesChart
                    data={normalizedData}
                    seriesKeys={allKeys}
                    title={`Índice de eficiencia por campaña (Top ${allKeys.length})`}
                    yLabel="Tasa de Conversión (%)"
                    />
                    {allKeys.length === 0 && (
                        <Typography 
                            variant="body2" 
                            align="center" 
                            sx={{ color: '#888', mt: 2 }}
                        >
                            No hay datos de campañas disponibles
                        </Typography>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DashboardAdditional