import { h, render } from 'preact'
import { App } from './pages/App'
import './styles/tailwind.css'

render(<App />, document.getElementById('root') as HTMLElement)
