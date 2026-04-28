import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "tasks",
  description: "Work tasks",
};

const initScript = `(function(){try{var t=localStorage.getItem('tudu-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}var s=localStorage.getItem('tudu-show-shortcuts');if(s==='0'){document.documentElement.classList.add('shortcuts-hidden');}}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <head>
        <script dangerouslySetInnerHTML={{ __html: initScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
