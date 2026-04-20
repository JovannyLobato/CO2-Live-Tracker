import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export default function HomeScreen() {
  const [data, setData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [ndata, setNdata] = useState<number>(5);
  const [nlabels, setNLabels] = useState<number>(5);



  useEffect(() => {
    const interval = setInterval(() => {
      getData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getData = async () => {
    try {
      const res = await axios.get('http://10.196.153.89/data');
      const value = parseFloat(res.data.co2);

      if (!isNaN(value) && isFinite(value)) {
        setData(prev => {
          let newData = [...prev, value];
          if (newData.length > ndata) newData.shift();
          return newData;
        });

        // Agrega una etiqueta con la hora actual
        
        setLabels(prev => {
          let newLabels = [...prev, new Date().toLocaleTimeString().slice(0,8)];
          if (newLabels.length > nlabels) newLabels.shift();
          return newLabels;
        });
        
      }

    } catch (err) {
      console.log(err);
    }
  };


  const getNivel = (co2: number) => {
    if (co2 < 800) return "bajo";
    if (co2 < 1200) return "medio";
    return "alto";
  };
  const getMensaje = (nivel: string) => {
    switch (nivel) {
      case "bajo":
        return "La motocicleta está estable";
      case "medio":
        return "Se recomienda mantenimiento";
      case "alto":
        return "Requiere mantenimiento urgente";
      default:
        return "";
    }
  };
  const getColor = (nivel: string) => {
    switch (nivel) {
      case "bajo":
        return "green";
      case "medio":
        return "orange";
      case "alto":
        return "red";
      default:
        return "gray";
    }
  };
  
  const avg =
    data.length > 0
      ? (data.reduce((a, b) => a + b, 0) / data.length).toFixed(2)
      : "0";
  const ultimo = data[data.length - 1] || 0;
  //const nivel = getNivel(Number(avg));
  const nivel = getNivel(ultimo);
  const mensaje = getMensaje(nivel);
  const color = getColor(nivel);

  return (
    <View style={{ flex: 1, padding: 0, marginTop: 40 }}>
      <Text style={{ fontSize: 20, textAlign: 'center', marginBottom: 20 }}>
        CO2 en tiempo real
      </Text>

      {/* Solo renderiza la gráfica si hay datos */}
      {data.length > 0 ? (
        <LineChart
          data={{
            labels: labels,
            datasets: [{ data: data }]
          }}
          width={Dimensions.get("window").width}
          height={220}
          yAxisSuffix="ppm"
          chartConfig={{
          decimalPlaces: 0,
          backgroundGradientFrom: "rgba(255, 216, 180, 1)",
          backgroundGradientTo: "#fff",
          color: (opacity = 1) => `${color}`
        }}
        />
      ) : (
        <View style={{ height: 220, justifyContent: 'center' }}>
          <Text style={{ textAlign: 'center' }}>Cargando datos del sensor...</Text>
        </View>
      )}

      <Text style={{ marginTop: 20, textAlign: 'center' }}>
        Promedio: {avg} ppm
      </Text>

      <Text style={{ marginTop: 10, textAlign: 'center', color: color }}>
        Nivel: {nivel.toUpperCase()}
      </Text>

      <Text style={{ textAlign: 'center', fontWeight: 'bold', color: color }}>
        {mensaje}
      </Text>
    </View>
  );
}