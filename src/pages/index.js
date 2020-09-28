import React, { useEffect, useState } from 'react'
import AssetList from './components/AssetList'
import CorrelationMatrix from './components/CorrelationMatrix'
import Result from './components/Result'

function correlation(x, xMean, y, yMean) {
  if (x.length !== y.length) return null

  xMean = xMean / x.length
  yMean = yMean / y.length

  let numerator = 0,
    xDSquaredSum = 0,
    yDSquaredSum = 0

  for (let i = 0; i < x.length; i++) {
    const xd = x[i] - xMean
    const yd = y[i] - yMean
    numerator += xd * yd
    xDSquaredSum += xd ** 2
    yDSquaredSum += yd ** 2
  }
  return numerator / (xDSquaredSum * yDSquaredSum) ** 0.5
}

export default function Home() {
  const [assets, setAssets] = useState([])
  const [correlations, setCorrelations] = useState({})

  useEffect(() => {
    const newCorrelations = {}
    for (let i = 0; i < assets.length; i++) {
      for (let j = 0; j < assets.length; j++) {
        if (typeof newCorrelations[assets[i].symbol] === 'undefined') {
          newCorrelations[assets[i].symbol] = {}
        }
        newCorrelations[assets[i].symbol][assets[j].symbol] = correlation(
          assets[i].returns,
          assets[i].mean,
          assets[j].returns,
          assets[j].mean
        )
      }
    }
    setCorrelations(newCorrelations)
    console.log(newCorrelations)
  }, [assets.length])

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
