import React, { useEffect, useState } from 'react'
const decimalFormatter = Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
})
export default function Result({ assets, covariances }) {
  const [risk, setRisk] = useState(0)
  useEffect(() => {
    if (assets.length > 1) {
      const total = assets.reduce(
        (acc, { amount, close }) => acc + amount * close,
        0
      )
      const w = assets.map(({ amount, close }) => (amount * close) / total)
      const Ω = Object.keys(covariances).map(k =>
        Object.keys(covariances[k]).map(l => covariances[k][l])
      )

      let r = 0
      for (let i = 0; i < w.length; i++) {
        let sum = 0
        for (let j = 0; j < w.length; j++) {
          sum += Ω[i][j] * w[j]
        }
        r += sum * w[i]
      }
      setRisk(r ** 0.5)
    } else setRisk(assets[0] ? assets[0].stdev : 0)
  }, [covariances])
  return (
    <div>
      <h2>Portfolio Risk</h2>
      <p>σₚ={decimalFormatter.format(risk * 100)}%</p>
    </div>
  )
}
