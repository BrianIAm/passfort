import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
    return (
        <aside
            id="logo-sidebar"
            className="group flex-col w-20 hover:w-64 h-screen transition-all ease-linear delay-150 motion-reduce:transition-none motion-reduce:hover:transform-none"
            aria-label="Sidebar">
            <div className="flex flex-col h-full px-3 py-4 overflow-x-hidden overflow-y-auto bg-passfort">
                <Link href="/" className="flex items-center ps-2.5 mb-5">
                    <Image
                        src="/logo.png"
                        className="w-10 h-10 me-6 group-hover:scale-[1.35] transition duration-150 ease-in-out motion-reduce:transition-none"
                        width={128}
                        height={128}
                        alt="PassFort Logo"
                    />
                    <span className="overflow-hidden translate-x-full group-hover:transform-none transition duration-200 self-center text-3xl font-extrabold whitespace-nowrap text-white">
                        PassFort
                    </span>
                </Link>
                <ul className="opacity-0 translate-y-2/6 group-hover:opacity-100 group-hover:translate-y-0 transition ease-in-out delay-200 flex-1 space-y-2 font-medium">
                    <li>
                        <Link
                            href="/"
                            className="flex items-center p-2 rounded-lg text-passfort-vibrant font-bold text-lg border border-passfort-vibrant">
                            <svg
                                className="flex-shrink-0 w-8 h-8 transition duration-75 text-passfort-vibrant"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    fillRule="evenodd"
                                    d="M8 10V7a4 4 0 1 1 8 0v3h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zm2-3a2 2 0 1 1 4 0v3h-4zm2 6a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1"
                                    clipRule="evenodd"
                                />
                            </svg>

                            <span className="flex-1 ms-3 whitespace-nowrap">
                                Passwords
                            </span>
                            <span className="inline-flex items-center justify-center w-5 h-5 text-sm font-medium rounded-full bg-passfort-vibrant text-white">
                                3
                            </span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/master-password"
                            className="flex items-center p-2 rounded-lg text-passfort-vibrant font-bold text-lg border border-passfort-vibrant">
                            <svg
                                className="flex-shrink-0 w-8 h-8 transition duration-75 text-passfort-vibrant"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    fillRule="evenodd"
                                    d="M10 5a2 2 0 0 0-2 2v3h2.4A7.48 7.48 0 0 0 8 15.5a7.48 7.48 0 0 0 2.4 5.5H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h1V7a4 4 0 1 1 8 0v1.15a7.446 7.446 0 0 0-1.943.685A.999.999 0 0 1 12 8.5V7a2 2 0 0 0-2-2Z"
                                    clipRule="evenodd"
                                />
                                <path
                                    fillRule="evenodd"
                                    d="M10 15.5a5.5 5.5 0 1 1 11 0 5.5 5.5 0 0 1-11 0Zm6.5-1.5a1 1 0 1 0-2 0v1.5a1 1 0 0 0 .293.707l1 1a1 1 0 0 0 1.414-1.414l-.707-.707V14Z"
                                    clipRule="evenodd"
                                />
                            </svg>

                            <span className="ms-3">Master Password</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/about"
                            className="flex items-center p-2 rounded-lg text-passfort-vibrant font-bold text-lg border border-passfort-vibrant">
                            <svg
                                className="flex-shrink-0 w-8 h-8 transition duration-75 text-passfort-vibrant"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    fillRule="evenodd"
                                    d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm9.408-5.5a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2h-.01ZM10 10a1 1 0 1 0 0 2h1v3h-1a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2h-1v-4a1 1 0 0 0-1-1h-2Z"
                                    clipRule="evenodd"
                                />
                            </svg>

                            <span className="ms-3">About Us</span>
                        </Link>
                    </li>
                    <div className="p-4 mt-6 rounded-lg border border-passfort-vibrant bg-passfort-vibrant/25">
                        <div className="flex items-center mb-3">
                            <span className="text-sm font-semibold me-2 px-2.5 py-0.5 rounded bg-red-200 text-red-800">
                                Beta
                            </span>
                        </div>
                        <p className="mb-3 text-sm text-red-400">
                            PassFort is in beta and under active development.
                            We&apos;re adding new features and squashing bugs.
                            If you find any issues, please report them to:
                        </p>
                        <a
                            className="text-sm underline font-medium text-red-200 hover:text-white"
                            href="mailto:bptiburcio@gmail.com&subject=I%20found%20a%20bug!">
                            passfort@support.com
                        </a>
                    </div>
                </ul>

                <ul className="pt-4 mt-4 space-y-2 font-medium border-t border-passfort-vibrant">
                    <li>
                        <Link
                            href="/settings"
                            className="flex items-center p-2 h-12 rounded-lg text-passfort-vibrant font-bold text-lg border border-passfort-vibrant group hover:justify-start transition-all duration-300 ease-in-out relative">
                            <svg
                                className="w-8 h-8 flex-shrink-0 text-passfort-vibrant absolute left-[0.65rem] group-hover:relative group-hover:left-1"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M18.113 13.03a6 6 0 0 0 .057-.806c0-.28-.025-.542-.057-.806l1.735-1.357a.415.415 0 0 0 .099-.526l-1.645-2.846a.41.41 0 0 0-.502-.18l-2.048.822a6 6 0 0 0-1.39-.806l-.312-2.18A.4.4 0 0 0 13.647 4h-3.29a.4.4 0 0 0-.403.345l-.313 2.18a6.3 6.3 0 0 0-1.39.806l-2.047-.823a.4.4 0 0 0-.502.181L4.057 9.535a.405.405 0 0 0 .099.526l1.735 1.357a7 7 0 0 0-.058.806c0 .272.025.543.058.806l-1.735 1.357a.415.415 0 0 0-.099.527l1.645 2.845c.099.181.32.247.502.181l2.047-.822q.64.495 1.39.806l.313 2.18a.4.4 0 0 0 .403.345h3.29a.4.4 0 0 0 .403-.346l.312-2.179a6.3 6.3 0 0 0 1.39-.806l2.048.822c.19.074.403 0 .502-.18l1.645-2.846a.415.415 0 0 0-.1-.527zm-6.111 2.073a2.88 2.88 0 0 1-2.879-2.879 2.88 2.88 0 0 1 2.879-2.878 2.88 2.88 0 0 1 2.878 2.878 2.88 2.88 0 0 1-2.878 2.879"
                                    fillRule="evenodd"
                                />
                            </svg>

                            <span className="ms-3 w-0 overflow-hidden whitespace-nowrap group-hover:w-auto transition-all duration-300 ease-in-out">
                                Settings
                            </span>
                        </Link>
                    </li>
                </ul>
            </div>
        </aside>
    );
}
