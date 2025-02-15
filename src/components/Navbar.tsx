'use client';

import { getVersion } from '@tauri-apps/api/app';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect } from 'react';

import {
    HomeIcon,
    LockIcon,
    InfoIcon,
    ExclamationIcon,
    CogIcon,
    HammerIcon,
    FileAndPenIcon,
    RefreshIcon,
} from '#/icons';

export default function Navbar() {
    const [version, setVersion] = React.useState<string>('');
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path;

    const navItems = [
        {
            name: 'Password Vault',
            href: '/',
            icon: HomeIcon,
        },
        {
            name: 'Master Password',
            href: '/master-password',
            icon: LockIcon,
        },
        {
            name: 'Password Generator',
            href: '/password-generator',
            icon: RefreshIcon,
        },
        {
            name: 'About',
            href: '/about',
            icon: InfoIcon,
        },
        {
            name: 'Contributions',
            href: '/contributions',
            icon: FileAndPenIcon,
        },
        {
            name: 'Settings',
            href: '/settings',
            icon: CogIcon,
        },
    ];

    // if (process.env.NODE_ENV === "development") {
    //     navItems.push({
    //         name: "Development",
    //         href: "/development",
    //         icon: HammerIcon,
    //     });
    // }

    useEffect(() => {
        getVersion().then((version) => setVersion(version));
    }, []);

    return (
        <nav className="fixed h-screen w-64 flex-col" aria-label="Sidebar">
            <div className="flex flex-col h-full px-3 py-4 overflow-x-hidden overflow-y-auto bg-passfort">
                {/* Logo */}
                <Link href="/" className="flex items-center ps-2.5 mb-5">
                    <Image
                        src="/logo.png"
                        className="w-12 h-12 me-3"
                        width={128}
                        height={128}
                        alt="PassFort Logo"
                    />
                    <span className="overflow-hidden self-center text-3xl font-extrabold whitespace-nowrap text-white">
                        PassFort
                    </span>
                </Link>

                {/* Navigation Links */}
                <ul className="space-y-2 flex-1">
                    {navItems.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                                    isActive(item.href)
                                        ? 'bg-passfort-vibrant/25 text-white'
                                        : 'text-passfort-vibrant hover:bg-passfort-vibrant/10'
                                }`}
                            >
                                <item.icon className="w-5 h-5 mr-3" />
                                <span>{item.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Beta Notice */}
                <div className="p-4 rounded-lg border-2 border-red-500/50 bg-red-500/5">
                    <div className="flex items-center mb-3">
                        <ExclamationIcon className="w-5 h-5 text-red-500 mr-2" />
                        <span className="mr-2 text-sm font-semibold px-2 py-0.5 rounded-sm bg-red-500/20 text-red-400">
                            Beta
                        </span>
                        {/* Version */}
                        <span className="text-sm font-semibold px-2 py-0.5 rounded-sm bg-red-500/20 text-red-400">
                            v{version}
                        </span>
                    </div>
                    <p className="text-sm text-red-400 mb-3">
                        PassFort is in beta and under active development. We&apos;re adding new
                        features and squashing bugs.
                    </p>
                    <a
                        href="https://github.com/BrianTib/passfort/issues"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-red-400 hover:text-red-300 underline transition-colors"
                    >
                        Report an issue
                    </a>
                </div>
            </div>
        </nav>
    );
}
