import {
    PaypalIcon,
    ReactIcon,
    RustIcon,
    TailwindIcon,
    TauriIcon,
    TypescriptIcon,
    FlowbiteIcon,
    ShieldIcon,
    GithubIcon,
    NextjsIcon,
} from '#/icons';

export default function Page() {
    const technologies = [
        {
            name: 'React',
            icon: ReactIcon,
            url: 'https://react.dev/',
            description: 'Frontend UI library for building user interfaces',
        },
        {
            name: 'Next.js',
            icon: NextjsIcon,
            url: 'https://nextjs.org/',
            description: 'React framework for server-rendered applications',
        },
        {
            name: 'Tauri',
            icon: TauriIcon,
            url: 'https://v2.tauri.app/',
            description: 'Desktop application framework with Rust backend',
        },
        {
            name: 'TypeScript',
            icon: TypescriptIcon,
            url: 'https://www.typescriptlang.org/',
            description: 'Type-safe JavaScript for better development and fewer bugs',
        },
        {
            name: 'Rust',
            icon: RustIcon,
            url: 'https://www.rust-lang.org/',
            description: 'Systems programming for secure backend operations',
        },
        {
            name: 'Tailwind CSS',
            icon: TailwindIcon,
            url: 'https://tailwindcss.com/',
            description: 'Utility-first CSS framework for rapid UI development',
        },
        {
            name: 'Flowbite',
            icon: FlowbiteIcon,
            url: 'https://flowbite.com/',
            description: 'UI component and icon library built on Tailwind CSS',
        },
    ];

    return (
        <main className="flex-1 px-8 py-4 max-w-7xl">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h2 className="text-3xl font-bold text-white">Contributions</h2>
                    <p className="text-red-500 mt-2 text-lg">
                        Building a secure, open-source password manager together
                    </p>
                </div>
            </div>

            {/* Project Stats */}
            <div className="grid grid-cols-3 gap-6 mb-12">
                <div className="p-6 rounded-lg bg-red-500/10 border-2 border-red-500/20 hover:border-red-500 transition-all hover:-translate-y-1">
                    <div className="text-3xl font-bold mb-2">100%</div>
                    <div className="text-red-500">Open Source</div>
                </div>
                <div className="p-6 rounded-lg bg-red-500/10 border-2 border-red-500/20 hover:border-red-500 transition-all hover:-translate-y-1">
                    <div className="text-3xl font-bold mb-2">AES-256</div>
                    <div className="text-red-500">Encryption</div>
                </div>
                <div className="p-6 rounded-lg bg-red-500/10 border-2 border-red-500/20 hover:border-red-500 transition-all hover:-translate-y-1">
                    <div className="text-3xl font-bold mb-2">3</div>
                    <div className="text-red-500">Supported Platforms</div>
                </div>
            </div>

            {/* Technologies Section */}
            <div className="mb-12">
                <h3 className="text-2xl font-bold mb-8">What we&apos;re built with</h3>
                <div className="grid grid-cols-3 gap-6">
                    {technologies.map((tech) => (
                        <a
                            key={tech.name}
                            href={tech.url}
                            target="_blank"
                            className="group p-6 rounded-lg bg-red-500/10 border-2 border-red-500/20 hover:border-red-500 transition-all hover:-translate-y-1"
                        >
                            <tech.icon className="w-16 h-16 mb-4 transition-transform group-hover:scale-110" />
                            <h4 className="text-lg font-semibold mb-2">{tech.name}</h4>
                            <p className="text-red-500">{tech.description}</p>
                        </a>
                    ))}
                </div>
            </div>

            {/* Support Section */}
            <div className="p-6 rounded-lg bg-linear-to-br from-passfort-500/20 to-transparent border border-passfort-500/30">
                <div className="flex items-start gap-6">
                    <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-4">Support PassFort</h3>
                        <p className="text-lg text-red-500 mb-6">
                            Help us keep PassFort free, secure, and continuously improving. Your
                            support directly contributes to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 mb-6 font-bold underline decoration-2 decoration-red-400">
                            <li>Regular security audits</li>
                            <li>Development of new features</li>
                            <li>Increase cross-platform compatibility</li>
                        </ul>
                        <a
                            href="https://www.paypal.me/bptiburcio"
                            target="_blank"
                            className="font-bold inline-flex items-center px-6 py-3 mr-3 bg-blue-600/90 hover:bg-blue-600 text-white rounded-lg transition-colors"
                        >
                            <PaypalIcon className="w-6 h-6 mr-2" />
                            Support via PayPal
                        </a>
                        <a
                            href="https://github.com/BrianTib/passfort"
                            target="_blank"
                            className="font-bold inline-flex items-center px-6 py-3 bg-zinc-950/90 hover:bg-zinc-950 text-white rounded-lg transition-colors"
                        >
                            <GithubIcon className="w-6 h-6 mr-2" />
                            Contribute on Github
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
}
