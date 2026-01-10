import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState<string>('Loading...')

  useEffect(() => {
    fetch('/api/')
      .then(res => res.json())
      .then((data: { message?: string }) => setMessage(data.message || 'Welcome to Invoicing App'))
      .catch(() => setMessage('Welcome to Invoicing App'))
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h1>Invoicing App</h1>
        <p>{message}</p>
      </header>
    </div>
  )
}

export default App
