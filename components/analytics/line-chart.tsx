import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DataPoint {
  date: string
  [key: string]: any
}

interface LineChartProps {
  title: string
  data: DataPoint[]
  dataKey: string
  className?: string
  height?: number
  color?: string
}

export function LineChart({
  title,
  data,
  dataKey,
  className,
  height = 350,
  color = "#2563eb"
}: LineChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickMargin={10}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickMargin={10}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 