// pages/api/report/range.ts
import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { startDate, endDate } = req.query;

  if (
    !startDate ||
    !endDate ||
    typeof startDate !== "string" ||
    typeof endDate !== "string"
  ) {
    return res.status(400).json({ error: "Missing or invalid date range" });
  }

  const { data, error } = await supabase
    .from("sensor_data")
    .select("*")
    .gte("time", `${startDate}T00:00:00`)
    .lte("time", `${endDate}T23:59:59`);

  if (error || !data || data.length === 0) {
    return res.status(500).json({ error: error?.message || "No data found" });
  }

  const groupedByDate = data.reduce((acc: any, record) => {
    const date = record.time.split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(record);
    return acc;
  }, {});

  const dailyData = (Object.entries(groupedByDate) as [string, any[]][]).map(
    ([date, entries]) => {
      const temperatures = entries.map((e) => e.temperature);
      const humidities = entries.map((e) => e.humidity);

      return {
        date,
        averageTemperature:
          temperatures.reduce((a, b) => a + b, 0) / temperatures.length,
        averageHumidity:
          humidities.reduce((a, b) => a + b, 0) / humidities.length,
      };
    }
  );

  res.status(200).json({ startDate, endDate, dailyData });
}
