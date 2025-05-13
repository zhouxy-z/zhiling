
/**
 * 日志输出
 */
export default class Logger {
    static trace = true;
    /**
     * debug打印
     * @param args 
     * @returns 
     */
    public static debug(...args): void {
        if (!this.trace) {
            return;
        }
        console.log(...args);
    }

    public static info(...args) {
        if (!this.trace) {
            return;
        }
        console.info(...args);
    }

    public static warn(...args) {
        if (!this.trace) {
            return;
        }
        console.warn(...args);
    }

    public static error(...args) {
        if (!this.trace) {
            return;
        }
        console.error(...args);
    }

    public static log(...args) {
        return this.debug(...args);
    }

    private static data: { battleId: number, steps: any[] };
    static newBattle(battleId: number) {
        this.data = {
            battleId: battleId,
            steps: []
        };
    }
    static battle(...args) {
        return;
        let stack = (new Error()).stack;
        let ls = stack.split(/[\r\n]/);
        let len = Math.min(ls.length, 4);
        let path = "";
        for (let i = len - 1; i > 1; i--) {
            if (path != "") path += " -> ";
            path += ls[i].trim().split(" ")[1];
        }
        path = path + ":" + args.join(",");
        // console.log(path);
        this.data.steps.push(path)
    }
    static output() {
        return this.data;
    }
}

