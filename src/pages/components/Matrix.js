import React from 'react'

export default function Matrix({ data }) {
  return (
    <table>
      <thead>
        <tr>
          <th>-</th>
          {Object.keys(data).map(col => (
            <th>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Object.keys(data).map(col => (
          <tr>
            <th>{col}</th>
            {Object.keys(data[col]).map(row => (
              <td>{data[col][row]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
