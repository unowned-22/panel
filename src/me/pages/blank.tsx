const SimplePage = ({ title }: { title: string }) => (
    <div className="flex gap-4">
        <div className="flex-1 min-w-0 max-w-150 mx-auto w-full flex flex-col gap-3">
            <div className="panel-card p-8 text-center">
                <h1 className="text-2xl font-bold mb-2">{title}</h1>
                <p className="text-muted-foreground">Раздел в разработке</p>
            </div>
        </div>
    </div>
);

export default SimplePage;
