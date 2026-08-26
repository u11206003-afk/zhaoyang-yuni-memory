import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: '照樣・憶起｜共同回憶相簿', description: '把每一個日常，留在一起的時光裡。收藏照片、影片、足跡與小日記。' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="zh-Hant"><body>{children}</body></html>; }

