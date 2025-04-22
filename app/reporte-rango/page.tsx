"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RangeReport } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ReporteRango() {
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 días atrás
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [reportData, setReportData] = useState<RangeReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateReport = async () => {
    if (!startDate || !endDate) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/range?startDate=${format(
          startDate,
          "yyyy-MM-dd"
        )}&endDate=${format(endDate, "yyyy-MM-dd")}`
      );
      const json = await res.json();
      setReportData(json);
    } catch (error) {
      console.error("Error al obtener datos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Reporte por Rango de Fechas
        </h1>
        <p className="text-muted-foreground">
          Selecciona un rango de fechas para generar el reporte
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selección de Fechas</CardTitle>
          <CardDescription>
            Elige el rango de fechas para el cual deseas generar el reporte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="grid gap-2">
              <div className="flex items-center">
                <span className="text-sm font-medium mr-2">Fecha Inicial:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? (
                        format(startDate, "PPP", { locale: es })
                      ) : (
                        <span>Selecciona una fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center">
                <span className="text-sm font-medium mr-2">Fecha Final:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? (
                        format(endDate, "PPP", { locale: es })
                      ) : (
                        <span>Selecciona una fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Button
              onClick={generateReport}
              disabled={!startDate || !endDate || isLoading}
              className="mt-2 sm:mt-0 sm:self-end"
            >
              {isLoading ? "Generando..." : "Generar Reporte"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      {reportData && !isLoading && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Temperatura Promedio Diaria</CardTitle>
              <CardDescription>
                Desde{" "}
                {format(
                  parseISO(reportData.startDate),
                  "d 'de' MMMM 'de' yyyy",
                  { locale: es }
                )}{" "}
                hasta{" "}
                {format(parseISO(reportData.endDate), "d 'de' MMMM 'de' yyyy", {
                  locale: es,
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={reportData.dailyData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 30,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      format(parseISO(value), "dd/MM", {
                        locale: es,
                      })
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) =>
                      format(parseISO(value), "dd/MM", {
                        locale: es,
                      })
                    }
                    formatter={(value) => [`${value}°C`, "Temperatura"]}
                  />
                  <Legend />
                  <Bar
                    dataKey="averageTemperature"
                    name="Temperatura (°C)"
                    fill="#ef4444"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Humedad Promedio Diaria</CardTitle>
              <CardDescription>
                Desde{" "}
                {format(new Date(reportData.startDate), "PPP", { locale: es })}{" "}
                hasta{" "}
                {format(new Date(reportData.endDate), "PPP", { locale: es })}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={reportData.dailyData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 30,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      format(parseISO(value), "dd/MM", {
                        locale: es,
                      })
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) =>
                      format(parseISO(value), "dd/MM", {
                        locale: es,
                      })
                    }
                    formatter={(value) => [`${value}%`, "Humedad"]}
                  />
                  <Legend />
                  <Bar
                    dataKey="averageHumidity"
                    name="Humedad (%)"
                    fill="#3b82f6"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Datos Detallados</CardTitle>
              <CardDescription>
                Resumen diario de temperatura y humedad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium">
                          Fecha
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium">
                          Temperatura Promedio (°C)
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium">
                          Humedad Promedio (%)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {reportData.dailyData.map((day, index) => (
                        <tr
                          key={index}
                          className="border-b transition-colors hover:bg-muted/50"
                        >
                          <td className="p-4 align-middle">
                            {format(
                              parseISO(day.date),
                              "d 'de' MMMM 'de' yyyy",
                              { locale: es }
                            )}
                          </td>
                          <td className="p-4 align-middle">
                            {day.averageTemperature}
                          </td>
                          <td className="p-4 align-middle">
                            {day.averageHumidity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
