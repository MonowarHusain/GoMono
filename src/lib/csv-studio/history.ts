import { CsvColumn, CsvRow, HistorySnapshot } from "./types";

export class HistoryManager {
    private past: HistorySnapshot[] = [];
    private future: HistorySnapshot[] = [];
    private maxHistory = 30;

    constructor(initialColumns: CsvColumn[], initialRows: CsvRow[]) {
        this.past = [
            {
                columns: JSON.parse(JSON.stringify(initialColumns)),
                rows: JSON.parse(JSON.stringify(initialRows)),
                description: "Initial state",
            },
        ];
    }

    public pushState(columns: CsvColumn[], rows: CsvRow[], description: string): void {
        const snapshot: HistorySnapshot = {
            columns: JSON.parse(JSON.stringify(columns)),
            rows: JSON.parse(JSON.stringify(rows)),
            description,
        };

        this.past.push(snapshot);
        if (this.past.length > this.maxHistory) {
            this.past.shift();
        }
        // Clearing redo branch on new action
        this.future = [];
    }

    public undo(): HistorySnapshot | null {
        if (this.past.length <= 1) return null;

        const currentSnapshot = this.past.pop()!;
        this.future.push(currentSnapshot);

        const targetSnapshot = this.past[this.past.length - 1];
        return {
            columns: JSON.parse(JSON.stringify(targetSnapshot.columns)),
            rows: JSON.parse(JSON.stringify(targetSnapshot.rows)),
            description: targetSnapshot.description,
        };
    }

    public redo(): HistorySnapshot | null {
        if (this.future.length === 0) return null;

        const nextSnapshot = this.future.pop()!;
        this.past.push(nextSnapshot);

        return {
            columns: JSON.parse(JSON.stringify(nextSnapshot.columns)),
            rows: JSON.parse(JSON.stringify(nextSnapshot.rows)),
            description: nextSnapshot.description,
        };
    }

    public get canUndo(): boolean {
        return this.past.length > 1;
    }

    public get canRedo(): boolean {
        return this.future.length > 0;
    }

    public get lastAction(): string {
        return this.past[this.past.length - 1]?.description || "";
    }
}
