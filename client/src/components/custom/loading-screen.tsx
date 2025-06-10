import {Skeleton} from "@/components/ui/skeleton";

export const LoadingScreen = () => {
    return (
        <div
            className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex">
            {/* Sidebar skeleton */}
            <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
                <div className="space-y-4">
                    {/* Logo/Brand skeleton */}
                    <Skeleton className="h-8 w-32"/>

                    {/* Navigation items skeleton */}
                    <div className="space-y-2">
                        {Array.from({length: 7}).map((_, i) => (
                            <Skeleton key={i} className="h-10 w-full"/>
                        ))}
                    </div>

                    {/* Projects section skeleton */}
                    <div className="pt-4 space-y-2">
                        <Skeleton className="h-6 w-20"/>
                        {Array.from({length: 3}).map((_, i) => (
                            <Skeleton key={i} className="h-8 w-full"/>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main content skeleton */}
            <main className="flex-1 p-6">
                <div className="space-y-6">
                    {/* Header skeleton */}
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-8 w-48"/>
                        <Skeleton className="h-10 w-32"/>
                    </div>

                    {/* Dashboard cards skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array.from({length: 4}).map((_, i) => (
                            <div key={i}
                                 className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                <div className="space-y-3">
                                    <Skeleton className="h-4 w-24"/>
                                    <Skeleton className="h-8 w-16"/>
                                    <Skeleton className="h-3 w-32"/>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chart sections skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div
                            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <Skeleton className="h-6 w-32 mb-4"/>
                            <Skeleton className="h-64 w-full"/>
                        </div>
                        <div
                            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <Skeleton className="h-6 w-32 mb-4"/>
                            <Skeleton className="h-64 w-full"/>
                        </div>
                    </div>

                    {/* Recent activity skeleton */}
                    <div
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <Skeleton className="h-6 w-32 mb-4"/>
                        <div className="space-y-3">
                            {Array.from({length: 5}).map((_, i) => (
                                <div key={i} className="flex items-center space-x-3">
                                    <Skeleton className="h-8 w-8 rounded-full"/>
                                    <div className="flex-1 space-y-1">
                                        <Skeleton className="h-4 w-3/4"/>
                                        <Skeleton className="h-3 w-1/2"/>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};