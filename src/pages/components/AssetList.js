import React, { useState } from 'react'
import { format, subBusinessDays } from 'date-fns'
import './AssetList.css'

const decimalFormatter = Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
})

export default function AssetList({ assets, onAdd, onRemove }) {
  const [symbol, setSymbol] = useState('')
  const [amount, setAmount] = useState(100)
  return (
    <div>
      <input
        value={symbol}
        onChange={({ target: { value } }) => setSymbol(value)}
      />
      <input
        value={amount}
        onChange={({ target: { value } }) => setAmount(value)}
      />
      <button
        onClick={() => {
          const today = new Date()
          fetch(
            `https://api.oplab.com.br/v3/market/charts/data/${symbol.toUpperCase()}/1D?from=${format(
              subBusinessDays(today, 252),
              'yyyyMMdd0000'
            )}&to=${format(today, 'yyyyMMdd0000')}&fill=business_days`,
            {
              headers: {
                'access-token':
                  'GNM/d6VQN92VIdXAWrum7YiXk4MtAHMji9UhCyBs7jO1DBSYL1Q/1VaQsfhYOqJw2Q3gVdiaep20Ec9tHnfbhQ==--yFb4BBYcWtYgrHnDHkGaJA==--7xaMOyZJb43SSW9kDWzNKw==',
              },
            }
          )
            .then(res => res.json())
            .then(({ data }) => {
              const returns = []
              for (let i = 1; i < data.length; i++) {
                returns.push(Math.log(data[i].close / data[i - 1].close))
              }
              const n = returns.length
              const mean = returns.reduce((acc, r) => r + acc, 0) / n
              const variance =
                returns.reduce((acc, r) => (r - mean) ** 2 + acc, 0) / n
              const stdev = variance ** 0.5
              const close = data[data.length - 1].close
              onAdd({
                close,
                mean,
                variance,
                stdev,
                returns,
                symbol,
                amount,
              })
              setSymbol('')
            })
        }}
      >
        Add/Update
      </button>
      <table>
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Amount</th>
            <th>Close</th>
            <th>Mean</th>
            <th>σ</th>
            <th>σ²</th>
          </tr>
        </thead>
        <tbody>
          {assets.map(asset => (
            <tr key={asset.symbol}>
              <td>{asset.symbol}</td>
              <td>{asset.amount}</td>
              <td>{asset.close}</td>
              <td>{decimalFormatter.format(asset.mean * 100)}%</td>
              <td>{decimalFormatter.format(asset.stdev * 100)}%</td>
              <td>{decimalFormatter.format(asset.variance * 100)}%</td>
              <td>
                <button
                  onClick={() => {
                    onRemove(asset)
                  }}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
