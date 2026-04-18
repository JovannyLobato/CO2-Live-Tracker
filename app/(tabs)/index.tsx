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
      const res = await axios.get('http://192.168.151.89/data');
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

  const avg =
    data.length > 0
      ? (data.reduce((a, b) => a + b, 0) / data.length).toFixed(2)
      : "0";

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
            backgroundGradientFrom: "rgba(254, 233, 213, 1)",
            backgroundGradientTo: "#fff",
            color: (opacity = 1) => `rgba(200, 100, 0, ${opacity})`
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
    </View>
  );
}