import "./globals.css";
import { Poppins } from "next/font/google";
import Navbar from "#/components/Navbar";
import { ToastProvider, ToastContext } from "#/context/ToastContext";
import type { Metadata } from "next";

const poppins = Poppins({
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "PassFort",
    description: "Your credentials, your way.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${poppins.className} relative bg-zinc-900 text-white z-10`}>
                <BackgroundGlow />
                <div className="relative flex z-10">
                    <Navbar />
                    {children}
                </div>
            </body>
        </html>
    );
}

function BackgroundGlow() {
    return (
        <div className="absolute inset-0 flex justify-center items-center z-0">
            <div className="w-[32rem] h-[32rem] bg-passfort-vibrant rounded-full blur-[350px]"></div>
        </div>
    );
}
