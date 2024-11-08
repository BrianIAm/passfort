import Image from "next/image";

export function Loading({ message }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="flex flex-col items-center space-y-4">
                <Image
                    src="/logo.png"
                    className="w-12 h-12 animate-pulse"
                    width={128}
                    height={128}
                    alt="PassFort Logo"
                />

                {message && (
                    <p className="text-passfort-vibrant text-lg font-medium">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}
