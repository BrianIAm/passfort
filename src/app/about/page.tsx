"use client";

export default function Page() {
    return (
        <main className="flex-1 px-8 py-4 max-w-7xl">
            <h2 className="mb-6 text-3xl font-bold">About PassFort</h2>

            {/* Overview Section */}
            <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">What is PassFort?</h3>
                <p className="text-passfort-vibrant mb-4">
                    PassFort is a free, open-source desktop password manager designed to keep your
                    online credentials secure and easily accessible. Unlike cloud-based
                    alternatives, PassFort operates completely offline, ensuring your passwords
                    never leave your device.
                </p>
            </div>

            {/* Security Section */}
            <div className="p-4 rounded-lg border border-passfort-vibrant bg-passfort-vibrant/10 mb-8">
                <h3 className="text-xl font-bold mb-4">How PassFort Keeps You Safe</h3>
                <ul className="list-disc list-inside space-y-2 text-passfort-vibrant">
                    <li>Military-grade AES-256 encryption for all stored passwords</li>
                    <li>Completely offline - no internet connection required</li>
                    <li>Master password protection with automatic timeout</li>
                    <li>No password storage on our end - everything stays local</li>
                    <li>Open-source codebase for security verification</li>
                </ul>
            </div>

            {/* How It Works */}
            <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">How It Works</h3>
                <ol className="space-y-4 text-passfort-vibrant">
                    <li>
                        1. <span className="font-medium">Set up a master password</span> - This is
                        your key to unlock all other passwords. Make it strong and memorable, or
                        allow us to generate one for you.
                    </li>
                    <li>
                        2. <span className="font-medium">Add your passwords</span> - Store
                        credentials for your various online accounts securely.
                    </li>
                    <li>
                        3. <span className="font-medium">Access when needed</span> - Unlock your
                        password vault using your master password. For security, access expires
                        after a few seconds of inactivity.
                    </li>
                </ol>
            </div>

            {/* Important Notice */}
            <div className="p-4 rounded-lg border-2 border-red-500 bg-red-500/10 mb-8">
                <div className="flex items-center mb-3">
                    <span className="text-sm font-semibold px-2.5 py-0.5 rounded bg-red-200 text-red-800">
                        Critical Information
                    </span>
                </div>
                <p className="text-red-400">
                    PassFort does not store your master password anywhere. If you forget it, there
                    is no way to recover your stored passwords. Always keep a secure backup of your
                    master password in a safe place.
                </p>
            </div>

            {/* Features */}
            <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Key Features</h3>
                <ul className="grid grid-cols-2 gap-4">
                    <li className="p-4 rounded-lg border border-passfort-vibrant bg-passfort-vibrant/10">
                        <h4 className="font-medium mb-2">Password Generator</h4>
                        <p className="text-passfort-vibrant">
                            Create strong, unique passwords with customizable options
                        </p>
                    </li>
                    <li className="p-4 rounded-lg border border-passfort-vibrant bg-passfort-vibrant/10">
                        <h4 className="font-medium mb-2">Auto-Lock</h4>
                        <p className="text-passfort-vibrant">
                            Automatic locking after 60 seconds of inactivity
                        </p>
                    </li>
                    <li className="p-4 rounded-lg border border-passfort-vibrant bg-passfort-vibrant/10">
                        <h4 className="font-medium mb-2">Quick Copy</h4>
                        <p className="text-passfort-vibrant">
                            One-click password copying to clipboard
                        </p>
                    </li>
                    <li className="p-4 rounded-lg border border-passfort-vibrant bg-passfort-vibrant/10">
                        <h4 className="font-medium mb-2">Multi-Platform</h4>
                        <p className="text-passfort-vibrant">Works on Windows, macOS, and Linux</p>
                    </li>
                </ul>
            </div>

            {/* Support Section */}
            <div className="p-4 rounded-lg border border-passfort-vibrant bg-passfort-vibrant/10">
                <h3 className="text-xl font-bold mb-4">Support & Feedback</h3>
                <p className="text-passfort-vibrant mb-4">
                    PassFort is currently in beta. If you encounter any issues or have suggestions,
                    please reach out:
                </p>
                <a
                    href="https://github.com/BrianTib/passfort"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-passfort-vibrant hover:text-white">
                    View on GitHub
                    {/* <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" /> */}
                </a>
            </div>
        </main>
    );
}
