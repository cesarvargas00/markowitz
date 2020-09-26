import React, { useState } from 'react'
import AssetList from './components/AssetList'
import CorrelationMatrix from './components/CorrelationMatrix'
import Result from './components/Result'

export default function Home() {
  const [assets, setAssets] = useState([])
  return (
    <div>
      <h1>Markowitz calculator</h1>
      <AssetList
        onAdd={asset => {
          let found = false
          const newAssets = [...assets]
          for (let i = 0; i < newAssets.length; i++) {
            if (newAssets[i].symbol === asset.symbol) {
              found = true
              newAssets[i] = asset
              break
            }
          }
          setAssets(found ? newAssets : [...assets, asset])
        }}
        onRemove={asset =>
          setAssets(assets.filter(a => a.symbol !== asset.symbol))
        }
        assets={assets}
      />
      <CorrelationMatrix assets={assets} />

      <Result assets={assets} />
    </div>
  )
}
