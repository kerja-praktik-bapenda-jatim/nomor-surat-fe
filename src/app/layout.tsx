import "@mantine/core/styles.css";
import "mantine-react-table/styles.css";
import '@mantine/dates/styles.css';

import {
  ColorSchemeScript,
  DirectionProvider,
  MantineProvider,
} from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { Analytics } from "@vercel/analytics/react";
import { spaceGrotesk } from "@/styles/fonts";
import { theme } from "@/styles/theme";
import { AppProvider } from "./provider";

export const metadata = {
  metadataBase: new URL("https://mantine-admin.vercel.app/"),
  title: { default: "SINORAT", template: "%s | SINORAT" },
  description: "Sistem Informasi Surat BAPENDA JATIM",
  keywords: [],
  authors: [
    {
      name: "Jawahirul Wildan",
      url: "jawahirulwildan@gmail.com",
    },    {
      name: "Aurelio Killian",
      url: "aurelioklv@gmail.com",
    },
  ],
};

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {


  return (
    <html lang="en-US">
      <head>
        <ColorSchemeScript />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body className={spaceGrotesk.className}>
        <DirectionProvider>
          <MantineProvider theme={theme}>
            <ModalsProvider>
              <AppProvider>{children}</AppProvider>
              <Analytics />
            </ModalsProvider>
            <Notifications />
          </MantineProvider>
        </DirectionProvider>
      </body>
    </html>
  );
}
