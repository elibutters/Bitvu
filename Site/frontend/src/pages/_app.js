import "@/styles/globals.css";
import Head from 'next/head';
import { Roboto } from "next/font/google";
import { DashboardProvider } from '@/context/DashboardContext';

const roboto = Roboto({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

export default function App({ Component, pageProps }) {
  return (
    <div className={roboto.className}>
      <Head>
          <title>Bitvu</title>
          <meta name="description" content="Leader in crypto derivatives insights" />
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <DashboardProvider>
        <Component {...pageProps} />
      </DashboardProvider>
    </div>
  )
}
