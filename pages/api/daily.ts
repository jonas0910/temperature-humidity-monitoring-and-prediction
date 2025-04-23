// pages/api/report/daily.ts
import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { date } = req.query;

  if (!date || typeof date !== "string") {
    return res.status(400).json({ error: "Missing or invalid date param" });
  }

  // Convertir la fecha local (Perú) a UTC
  const localDate = new Date(`${date}T00:00:00-05:00`); // -05:00 para zona horaria de Perú

  const start = localDate.toISOString(); // Fecha UTC de 00:00 Perú
  const endDate = new Date(localDate.getTime() + 24 * 60 * 60 * 1000 - 1); // Fin del mismo día, 23:59:59.999
  const end = endDate.toISOString();

  const { data, error } = await supabase
    .from("sensor_data")
    .select("*")
    .gte("time", start)
    .lte("time", end);

  console.log("Data:", data);
  if (error) {
    return res.status(500).json({ error: error?.message || "No data found" });
  }

  const temperatures = data.map((d) => d.temperature);
  const humidities = data.map((d) => d.humidity);

  const average = (arr: number[]) =>
    arr.reduce((a, b) => a + b, 0) / arr.length;

  const groupByHour = (data: any[]) => {
    const hourly: { [key: string]: { temps: number[]; hums: number[] } } = {};

    // data.forEach((d) => {
    //   const hour = new Date(d.time).getHours().toString().padStart(2, "0");
    //   if (!hourly[hour]) {
    //     hourly[hour] = { temps: [], hums: [] };
    //   }
    //   hourly[hour].temps.push(d.temperature);
    //   hourly[hour].hums.push(d.humidity);
    // });
    data.forEach((d) => {
      const date = new Date(d.time);
      const utcHour = date.getUTCHours();
      const limaHour = (utcHour + 24 - 5) % 24; // Ajuste de zona horaria (UTC-5)

      const hour = limaHour.toString().padStart(2, "0");
      if (!hourly[hour]) {
        hourly[hour] = { temps: [], hums: [] };
      }
      hourly[hour].temps.push(d.temperature);
      hourly[hour].hums.push(d.humidity);
    });

    const result = [];
    for (let i = 0; i < 24; i++) {
      const h = i.toString().padStart(2, "0");
      const temps = hourly[h]?.temps || [];
      const hums = hourly[h]?.hums || [];
      result.push({
        hour: `${h}:00`,
        averageTemperature: temps.length ? average(temps).toFixed(2) : null,
        averageHumidity: hums.length ? average(hums).toFixed(2) : null,
      });
    }

    return result;
  };

  const report = {
    date,
    averageTemperature: average(temperatures).toFixed(2),
    averageHumidity: average(humidities).toFixed(2),
    minTemperature: Math.min(...temperatures),
    maxTemperature: Math.max(...temperatures),
    minHumidity: Math.min(...humidities),
    maxHumidity: Math.max(...humidities),
    readings: data.map((d) => ({
      time: d.time,
      temperature: d.temperature,
      humidity: d.humidity,
    })),
    hourlyAverages: groupByHour(data),
  };

  res.status(200).json(report);
}
