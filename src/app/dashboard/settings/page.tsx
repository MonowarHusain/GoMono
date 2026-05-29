import { Settings, User, Globe, Shield } from "lucide-react";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
    return (
        <div className="space-y-10 pb-12">
            <header className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Settings</h1>
                <p className="text-neutral-500 dark:text-neutral-400">Manage your command center configurations</p>
            </header>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

                {/* Profile Settings */}
                <section className="col-span-1 md:col-span-2 space-y-6">
                    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10">
                                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Profile Details</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Display Name</label>
                                <input
                                    type="text"
                                    disabled
                                    defaultValue="Monowar"
                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-500/10">
                                <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Domain Configuration</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Primary Domain</label>
                                <input
                                    type="text"
                                    disabled
                                    defaultValue="link.mono.bro.bd"
                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Security Sidebar */}
                <section className="col-span-1 space-y-6">
                    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/10">
                                <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Security</h2>
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Your dashboard is currently secured via Firebase Authentication. Future updates will allow changing credentials here.
                        </p>
                    </div>
                </section>

            </div>
        </div>
    );
}