"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TemperatureData } from "@/types";
import { Thermometer, Droplets } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { supabase } from "@/lib/supabase";

export default function TiempoReal() {
  // const [data, setData] = useState<TemperatureData[]>([])
  const [currentTemp, setCurrentTemp] = useState<number | null>(null);
  const [currentHumidity, setCurrentHumidity] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [data, setData] = useState<TemperatureData[]>([]);

  useEffect(() => {
    // Cargar datos existentes primero (opcional)
    const fetchData = async () => {
      const { data: initial, error } = await supabase
        .from("sensor_data")
        .select("*")
        .order("time", { ascending: false })
        .limit(50);
      if (error) {
        console.error("Error al cargar datos iniciales:", error);
        return;
      }
      if (initial && initial.length > 0) {
        setCurrentTemp(initial[0].temperature);
        setCurrentHumidity(initial[0].humidity);
        setLastUpdate(new Date(initial[0].time).toLocaleTimeString());
      }
      setData(initial || []);
    };

    fetchData();

    // Escuchar en tiempo real
    const channel = supabase
      .channel("realtime:sensor_data")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sensor_data" },
        (payload) => {
          console.log("🔄 Nuevo dato:", payload.new);
          setCurrentTemp(payload.new.temperature);
          setCurrentHumidity(payload.new.humidity);
          setLastUpdate(new Date(payload.new.time).toLocaleTimeString());
          setData((prev) => [
            payload.new as TemperatureData,
            ...prev.slice(0, 49),
          ]); // mantener últimos 50
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  // useEffect(() => {
  //   // Función para generar un nuevo dato aleatorio
  //   const generateNewData = () => {
  //     const now = new Date()
  //     // Temperatura entre 15°C y 35°C con pequeñas variaciones
  //     const lastTemp = currentTemp !== null ? currentTemp : 25
  //     const tempVariation = (Math.random() - 0.5) * 2 // Variación de -1 a 1
  //     const newTemp = Math.max(15, Math.min(35, lastTemp + tempVariation))
  //     setCurrentTemp(newTemp)

  //     // Humedad entre 30% y 90% con pequeñas variaciones
  //     const lastHumidity = currentHumidity !== null ? currentHumidity : 60
  //     const humidityVariation = (Math.random() - 0.5) * 4 // Variación de -2 a 2
  //     const newHumidity = Math.max(30, Math.min(90, lastHumidity + humidityVariation))
  //     setCurrentHumidity(newHumidity)

  //     const newReading: TemperatureData = {
  //       timestamp: now.toISOString(),
  //       temperature: Math.round(newTemp * 10) / 10,
  //       humidity: Math.round(newHumidity * 10) / 10,
  //     }

  //     setData((prevData) => {
  //       // Mantener solo los últimos 20 puntos de datos
  //       const newData = [...prevData, newReading]
  //       if (newData.length > 20) {
  //         return newData.slice(newData.length - 20)
  //       }
  //       return newData
  //     })
  //   }

  //   // Generar datos iniciales
  //   generateNewData()

  //   // Actualizar datos cada 3 segundos
  //   const interval = setInterval(generateNewData, 3000)

  //   return () => clearInterval(interval)
  // }, [])

  // Formatear datos para el gráfico
  const chartData = data.map((reading) => ({
    time: new Date(reading.time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    temperatura: reading.temperature,
    humedad: reading.humidity,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Monitoreo en Tiempo Real
        </h1>
        <p className="text-muted-foreground">
          Datos de temperatura y humedad actualizados cada 3 segundos
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Temperatura Actual
            </CardTitle>
            <Thermometer className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {currentTemp !== null
                ? `${currentTemp.toFixed(1)}°C`
                : "Cargando..."}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Última actualización: {lastUpdate}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Humedad Actual
            </CardTitle>
            <Droplets className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {currentHumidity !== null
                ? `${currentHumidity.toFixed(1)}%`
                : "Cargando..."}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Última actualización: {lastUpdate}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gráfico en Tiempo Real</CardTitle>
          <CardDescription>
            Monitoreo continuo de temperatura y humedad
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[...chartData].reverse()}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis
                yAxisId="left"
                orientation="left"
                stroke="#ef4444"
                domain={[15, 35]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#3b82f6"
                domain={[30, 90]}
              />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="temperatura"
                stroke="#ef4444"
                name="Temperatura (°C)"
                dot={false}
                isAnimationActive={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="humedad"
                stroke="#3b82f6"
                name="Humedad (%)"
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registros Recientes</CardTitle>
          <CardDescription>
            Últimas lecturas de temperatura y humedad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="w-full overflow-auto max-h-[300px]">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b sticky top-0 bg-background">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium">
                      Hora
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium">
                      Temperatura (°C)
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium">
                      Humedad (%)
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {[...data].reverse().map((reading, index) => (
                    <tr
                      key={index}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <td className="p-4 align-middle">
                        {new Date(reading.time).toLocaleTimeString()}
                      </td>
                      <td className="p-4 align-middle">
                        {reading.temperature}
                      </td>
                      <td className="p-4 align-middle">{reading.humidity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
