import { createRoot } from 'react-dom/client'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import App from './App.tsx'
import './index.css'
{
    (
        <>
            <SpeedInsights />
            <Analytics />
        </>
    )
}
createRoot(document.getElementById("root")!).render(<App />);
