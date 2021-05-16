import React, { useEffect, useRef, useState } from 'react'
import AssetList from './components/AssetList'
import Matrix from './components/Matrix'
import Result from './components/Result'
import PortfolioAllocation from 'portfolio-allocation'
import Chart from 'react-google-charts'
function correlation(x, y) {
  const xMean = x.reduce((acc, el) => el + acc, 0) / x.length
  const yMean = y.reduce((acc, el) => el + acc, 0) / y.length
  if (x.length !== y.length) return null
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
  const [data, setData] = useState([])
  const [weights, setWeights] = useState([])
  const [currentWeight, setCurrentWeight] = useState([])

  useEffect(() => {
    const newCorrelations = {}
    for (let i = 0; i < assets.length; i++) {
      for (let j = 0; j < assets.length; j++) {
        if (typeof newCorrelations[assets[i].symbol] === 'undefined') {
          newCorrelations[assets[i].symbol] = {}
        }
        newCorrelations[assets[i].symbol][assets[j].symbol] = correlation(
          assets[i].returns,
          assets[j].returns
        )
      }
    }
    setCorrelations(newCorrelations)
    const stdevs = assets.reduce(
      (acc, asset) => ({ ...acc, [asset.symbol]: asset.stdev }),
      {}
    )
    const newCovariances = covariancesFromCorrelations(newCorrelations, stdevs)
    setCovariances(newCovariances)
    if (assets.length > 0) {
      const arCovars = Object.keys(newCovariances).map(k =>
        Object.keys(newCovariances[k]).map(k2 => newCovariances[k][k2])
      )
      const meanReturns = assets.map(
        a =>
          (1 + a.returns.reduce((acc, r) => acc + r, 0) / a.returns.length) **
            30 -
          1
      )
      const portfolio = PortfolioAllocation.meanVarianceEfficientFrontierPortfolios(
        meanReturns,
        arCovars
      )
      const coords = []
      const weights = []
      portfolio.forEach(p => {
        weights.push(p[0])
        coords.push([p[2], p[1]])
      })
      setData(coords)
      setWeights(weights)
    }
  }, [assets.length, assets])

  return (
    <div>
      <a href="https://vargas.dev">vargas.dev</a>
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
      <h2>Efficient frontier</h2>
      {assets.length > 1 ? (
        <div>
          <ul>
            {assets.map(({ symbol }, i) => (
              <li>
                {symbol} - {currentWeight[i]}
              </li>
            ))}
          </ul>
          <Chart
            width={'100%'}
            height={'800px'}
            chartType="AreaChart"
            loader={<div>Loading...</div>}
            chartEvents={[
              {
                eventName: 'select',
                callback: ({ chartWrapper }) => {
                  const chart = chartWrapper.getChart()
                  const selection = chart.getSelection()
                  if (selection.length === 1) {
                    const [selectedItem] = selection
                    const { row } = selectedItem
                    setCurrentWeight(weights[row])
                  }
                },
              },
            ]}
            data={[
              ['Risk', 'Return'],
              ...data.map(coord => [coord[0] * 100, coord[1] * 100]),
            ]}
            options={{
              hAxis: {
                title: 'Risk (%)',
              },
              vAxis: {
                title: 'Return (%)',
              },
            }}
          />
        </div>
      ) : null}
    </div>
  )
}
