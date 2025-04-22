"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import type { DailyReport } from "@/types";
import { Thermometer, Droplets, CalendarIcon } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { format, set } from "date-fns";
import { cn } from "@/lib/utils";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";

export default function ReporteDiario() {
  const [data, setData] = useState<DailyReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [day, setDay] = useState<Date | undefined>(new Date(Date.now())); // Formato YYYY-MM-DD

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        "/api/daily?date=" +
          format(day ?? new Date(Date.now()), "yyyy-MM-dd", { locale: es })
      );
      const json = await res.json();
      console.log("json", json);
      setData(json ?? null);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // // Simular carga de datos
    // setIsLoading(true)
    // setTimeout(() => {
    //   const todayData = getTodayData()
    //   setData(todayData)
    //   setIsLoading(false)
    // }, 1000)

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return <div>No hay datos disponibles</div>;
  }

  // Formatear datos para el gráfico
  const chartData = data.readings?.map((reading) => ({
    time: new Date(reading.time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    temperatura: reading.temperature,
    humedad: reading.humidity,
  }));

  return (
    <div className="space-y-6">
      <div className="md:flex md:flex-row flex flex-col gap-4 justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reporte Diario</h1>
          <p className="text-muted-foreground">
            Datos de temperatura y humedad para el día {data.date}
          </p>
        </div>
        <div className="md:flex md:flex-row items-center flex flex-col gap-4">
          <div className="flex items-center">
            <span className="text-sm font-medium mr-2">Fecha Inicial:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !day && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {day ? (
                    format(day, "PPP", { locale: es })
                  ) : (
                    <span>Selecciona una fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={day}
                  onSelect={setDay}
                  initialFocus
                  className="bg-secondary"
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button
            onClick={fetchData}
            disabled={isLoading}
            className="sm:mt-0"
          >
            {isLoading ? "Generando..." : "Generar Reporte"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Temperatura Promedio
            </CardTitle>
            <Thermometer className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.averageTemperature}°C
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Temperatura Máxima
            </CardTitle>
            <Thermometer className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.maxTemperature}°C</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Humedad Promedio
            </CardTitle>
            <Droplets className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.averageHumidity}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Humedad Máxima
            </CardTitle>
            <Droplets className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.maxHumidity}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="grafico" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grafico">Gráfico</TabsTrigger>
          <TabsTrigger value="tabla">Tabla</TabsTrigger>
        </TabsList>
        <TabsContent value="grafico" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Temperatura y Humedad</CardTitle>
              <CardDescription>
                Registro de temperatura y humedad durante el día
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" orientation="left" stroke="#ef4444" />
                  <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="temperatura"
                    stroke="#ef4444"
                    name="Temperatura (°C)"
                    activeDot={{ r: 8 }}
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="humedad"
                    stroke="#3b82f6"
                    name="Humedad (%)"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tabla">
          <Card>
            <CardHeader>
              <CardTitle>Registros del Día</CardTitle>
              <CardDescription>
                Datos detallados de temperatura y humedad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
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
                      {data.hourlyAverages?.map((hourlyAverage, index) => (
                        <tr
                          key={index}
                          className="border-b transition-colors hover:bg-muted/50"
                        >
                          <td className="p-4 align-middle">
                            {hourlyAverage.hour}
                          </td>
                          <td className="p-4 align-middle">
                            {hourlyAverage.averageTemperature}
                          </td>
                          <td className="p-4 align-middle">
                            {hourlyAverage.averageHumidity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
