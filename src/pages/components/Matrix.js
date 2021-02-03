import React from 'react'

export default function Matrix({ data }) {
  return (
    <table>
      <thead>
        <tr>
          <th>-</th>
          {Object.keys(data || {}).map((col, i) => (
            <th key={`${data}-${i}`}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Object.keys(data || {}).map((col, i) => (
          <tr key={`${data}-${i}`}>
            <th>{col}</th>
            {Object.keys(data[col]).map((row, i) => (
              <td key={`${row}-${i}`}>{data[col][row]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
