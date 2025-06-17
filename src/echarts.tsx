import React, { useMemo, useRef, useEffect, type CSSProperties, type HTMLAttributes } from 'react'
import { init, getInstanceByDom, type ECharts, type EChartsOption, type SetOptionOpts } from 'echarts'
import { debounce } from 'lodash'

type EChartEventHandler = (params: unknown) => void

type EChartProps = {
  option: EChartsOption
  chartSettings?: object
  optionSettings?: SetOptionOpts
  style?: CSSProperties
  loading?: boolean
  events?: Record<string, EChartEventHandler>
} & HTMLAttributes<HTMLDivElement>


export const EChart: React.FC<EChartProps> = ({
  option,
  chartSettings = { useCoarsePointer: true, renderer: 'svg'},
  optionSettings = { notMerge: true },
  style = { width: '100%', height: '90vh' },
  events = {},
  ...props
}) => {
  const chartRef = useRef<HTMLDivElement | null>(null)

  // Debounce resize event so it only fires periodically instead of constantly
  const resizeChart = useMemo(
    () =>
      debounce(() => {
        if (chartRef.current) {
          const chart = getInstanceByDom(chartRef.current)
          chart?.resize()
        }
      }, 100),
    []
  )

  useEffect(() => {
    if (!chartRef.current) return

    // Initialize chart
    const chart: ECharts = init(chartRef.current, null, chartSettings)

    // Set up event listeners
    for (const [key, handler] of Object.entries(events)) {
      chart.on(key, (param: unknown) => {
        handler(param)
      })
    }

    // Resize event listener
    const resizeObserver = new ResizeObserver(() => {
      resizeChart()
    })

    resizeObserver.observe(chartRef.current)

    // Return cleanup function
    return () => {
      chart?.dispose()

      if (chartRef.current) {
        resizeObserver.unobserve(chartRef.current)
      }
      resizeObserver.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!chartRef.current) return
    const chart = getInstanceByDom(chartRef.current)
    chart?.setOption(option, optionSettings)
  }, [option, optionSettings])

  return <div ref={chartRef} style={style} {...props} />
}