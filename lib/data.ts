import type { TemperatureData, DailyReport, RangeReport } from "@/types"

// Función para generar datos aleatorios de temperatura y humedad
export function generateRandomData(
  startDate: Date,
  endDate: Date,
  interval = 30, // minutos
): TemperatureData[] {
  const data: TemperatureData[] = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    // Temperatura entre 15°C y 35°C
    const temperature = Math.round((Math.random() * 20 + 15) * 10) / 10
    // Humedad entre 30% y 90%
    const humidity = Math.round((Math.random() * 60 + 30) * 10) / 10

    data.push({
      timestamp: currentDate.toISOString(),
      temperature,
      humidity,
    })

    // Avanzar según el intervalo (en minutos)
    currentDate.setMinutes(currentDate.getMinutes() + interval)
  }

  return data
}

// Obtener datos del día actual
export function getTodayData(): DailyReport {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const endDate = new Date()

  const readings = generateRandomData(today, endDate, 30)

  const temperatures = readings.map((reading) => reading.temperature)
  const humidities = readings.map((reading) => reading.humidity)

  return {
    date: today.toISOString().split("T")[0],
    averageTemperature: calculateAverage(temperatures),
    averageHumidity: calculateAverage(humidities),
    minTemperature: Math.min(...temperatures),
    maxTemperature: Math.max(...temperatures),
    minHumidity: Math.min(...humidities),
    maxHumidity: Math.max(...humidities),
    readings,
  }
}

// Obtener datos por rango de fechas
export function getRangeData(startDate: Date, endDate: Date): RangeReport {
  const dailyData = []
  const currentDate = new Date(startDate)
  currentDate.setHours(0, 0, 0, 0)

  while (currentDate <= endDate) {
    const nextDay = new Date(currentDate)
    nextDay.setDate(nextDay.getDate() + 1)

    const dayData = generateRandomData(currentDate, nextDay, 60)
    const temperatures = dayData.map((reading) => reading.temperature)
    const humidities = dayData.map((reading) => reading.humidity)

    dailyData.push({
      date: currentDate.toISOString().split("T")[0],
      averageTemperature: calculateAverage(temperatures),
      averageHumidity: calculateAverage(humidities),
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
    dailyData,
  }
}

// Función auxiliar para calcular promedios
function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0
  const sum = values.reduce((acc, val) => acc + val, 0)
  return Math.round((sum / values.length) * 10) / 10
}
