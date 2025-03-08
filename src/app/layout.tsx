import './globals.css';
import { Poppins } from 'next/font/google';
import TitleBar from '#/components/TitleBar';
import Navbar from '#/components/Navbar';
import type { Metadata } from 'next';

const poppins = Poppins({
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'PassFort',
    description: 'Your credentials, your way.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${poppins.className} w-screen h-screen flex bg-zinc-900 text-white`}>
                <TitleBar />
                <Navbar />

                <div className="w-full overflow-y-auto no-scrollbars">
                    <BackgroundGlow />
                    {children}
                </div>
            </body>
        </html>
    );
}

function BackgroundGlow() {
    return (
        <div className="absolute inset-0 ml-[325px] flex justify-center items-center -z-10 h-screen pointer-events-none">
            <div className="w-[32rem] h-[32rem] bg-passfort-500 rounded-full blur-[350px]"></div>
        </div>
    );
}
