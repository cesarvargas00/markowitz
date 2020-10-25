import React, { useEffect, useState } from 'react'
import AssetList from './components/AssetList'
import Matrix from './components/Matrix'
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

function covariancesFromCorrelations(correlations, stdevs) {
  return Object.keys(correlations).reduce(
    (acc, row) => ({
      ...acc,
      [row]: Object.keys(correlations[row]).reduce(
        (acc, col) => ({
          ...acc,
          [col]: correlations[row][col] * stdevs[row] * stdevs[col],
        }),
        {}
      ),
    }),
    {}
  )
}

export default function Home() {
  const [assets, setAssets] = useState([])
  const [correlations, setCorrelations] = useState({})
  const [covariances, setCovariances] = useState({})

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
    const stdevs = assets.reduce(
      (acc, asset) => ({ ...acc, [asset.symbol]: asset.stdev }),
      {}
    )
    setCovariances(covariancesFromCorrelations(newCorrelations, stdevs))
  }, [assets.length, assets])

  return (
    <div>
      <h1>Markowitz calculator</h1>
      <h4>
        {' '}
        Powered by <a href="https://oplab.com.br">OpLab</a>
      </h4>
      <h2>Asset List</h2>
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
      <h2>Correlations</h2>
      <Matrix data={correlations} />
      <h2>Covariations</h2>
      <Matrix data={covariances} />
      <Result assets={assets} covariances={covariances} />
    </div>
  )
}
