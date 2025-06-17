import './App.css'
import React from 'react'
import { EChart } from './echarts'
import { ProductSpaceGraphOption } from './graph'

const App: React.FC = () => {
  return (
    <div className="App">
        <EChart option={ProductSpaceGraphOption()} />
    </div>
  )
}

export default App