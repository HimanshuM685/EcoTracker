import './globals.css'
import { ThemeProvider } from '../components/theme-provider'



export const metadata = {
  title: 'My App',
  description: 'Web3 retractable transaction app',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          
          {children}
          
        </ThemeProvider>
      </body>
    </html>
  )
}
