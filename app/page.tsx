import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Thermometer, BarChart3, LineChart } from "lucide-react"

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Estación de Control de Temperatura
        </h1>
        <p className="text-muted-foreground">Monitoreo de temperatura y humedad en tiempo real</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-blue-500" />
              Reporte del Día
            </CardTitle>
            <CardDescription>Temperatura y humedad capturada durante el día actual</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">
              Visualiza los datos de temperatura y humedad registrados durante el día de hoy.
            </p>
            <Button asChild className="w-full">
              <Link href="/reporte-diario">Ver Reporte</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              Reporte por Rango
            </CardTitle>
            <CardDescription>Resumen según el rango de fechas seleccionado</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">Genera reportes personalizados seleccionando un rango de fechas específico.</p>
            <Button asChild className="w-full">
              <Link href="/reporte-rango">Ver Reporte</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-red-500" />
              Tiempo Real
            </CardTitle>
            <CardDescription>Monitoreo de temperatura y humedad en tiempo real</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">
              Observa los cambios de temperatura y humedad en tiempo real con actualizaciones automáticas.
            </p>
            <Button asChild className="w-full">
              <Link href="/tiempo-real">Ver en Tiempo Real</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
