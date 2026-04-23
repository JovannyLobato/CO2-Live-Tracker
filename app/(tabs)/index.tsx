import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, Text, TextInput, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';


export default function HomeScreen() {
  const [data, setData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [ndata, setNdata] = useState<number>(5);
  const [nlabels, setNLabels] = useState<number>(5);
  const [ip, setIp] = useState('10.196.1.89');
  const [inputIp, setInputIp] = useState(ip);
  const [error, setError] = useState<string | null>(null);
  const [pressed, setPressed] = useState(false);



  useEffect(() => {
    testConexion();
    if (!ip) return;

    const interval = setInterval(() => {
      getData();
    }, 2000);

    return () => clearInterval(interval);

  }, [ip]);

  // with axios, fetch data from `http://${(ip || '').trim()}/data` and update state
  // pop out error with permissions on android, i guess...
  const getData = async () => {
    try {
      // with axios, fetch data from `http://${(ip || '').trim()}/data` and update state
      // pop out error with permissions on android, i guess...
      /*
      const url = `http://${(ip || '').trim()}/data`;
      const res = await axios.get(url);
      const value = parseFloat(res.data.co2);

      // clear previous errors on success
      setError(null);

      if (!isNaN(value) && isFinite(value)) {
        setData(prev => {
          let newData = [...prev, value];
          if (newData.length > ndata) newData.shift();
          return newData;
        });

        // Agrega una etiqueta con la hora actual

        setLabels(prev => {
          let newLabels = [...prev, new Date().toLocaleTimeString().slice(0, 8)];
          if (newLabels.length > nlabels) newLabels.shift();
          return newLabels;
        });
        */
      // here im using fetch instead of axios to avoid CORS issues on android
      const res = await fetch(`http://${ip}/data`);
      const json = await res.json();
      const value = parseFloat(json.co2);

      setError(null);

      if (!isNaN(value)) {
        setData(prev => {
          let newData = [...prev, value];
          if (newData.length > ndata) newData.shift();
          return newData;
        });

        setLabels(prev => {
          let newLabels = [...prev, new Date().toLocaleTimeString().slice(0, 8)];
          if (newLabels.length > nlabels) newLabels.shift();
          return newLabels;
        });
      }

    } catch (err) {
      console.log("ERROR COMPLETO:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(JSON.stringify(err));
      }
    }
  };

  const testConexion = async () => {
    try {
      const res = await fetch(`http://${ip}/data`);
      const text = await res.text();
      console.log("RESPUESTA CRUDA:", text);
      setError("Conexión OK");
    } catch (e) {
      console.log("FALLO TEST:", e);
      setError("Fallo conexión inicial");
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
      <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
        <TextInput
          placeholder="Ingresa la IP del ESP32"
          value={inputIp}
          onChangeText={setInputIp}
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 10,
            borderRadius: 8,
            marginBottom: 10
          }}
        />

        <Pressable
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          onPress={() => setIp((inputIp || '').trim())}
          style={{
            backgroundColor: pressed ? '#0056b3' : '#007BFF',
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            transform: [{ scale: pressed ? 0.95 : 1 }],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 3,
            elevation: 4,
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            Conectar
          </Text>
        </Pressable>
      </View>

      {error ? (
        <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
          <Text style={{ color: 'red', textAlign: 'center' }}>Error: {error}</Text>
        </View>
      ) : null}

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