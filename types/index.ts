export interface TemperatureData {
  time: string
  temperature: number
  humidity: number
}

export interface DailyReport {
  date: string
  averageTemperature: number
  averageHumidity: number
  minTemperature: number
  maxTemperature: number
  minHumidity: number
  maxHumidity: number
  readings: TemperatureData[]
  hourlyAverages: {
    hour: string
    averageTemperature: number | null
    averageHumidity: number | null
  }[]
}

export interface RangeReport {
  startDate: string
  endDate: string
  dailyData: {
    date: string
    averageTemperature: number
    averageHumidity: number
  }[]
}
