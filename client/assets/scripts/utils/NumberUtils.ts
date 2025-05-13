/**
 * 扩展Number 类解决小数加减乘除精度丢失问题
 */
interface Number {
    /**
     * 加
     * @param arg 
     */
    add(...arg): number;
    /**
     * 减
     * @param arg 
     */
    sub(...arg): number;
    /**
     * 乘
     * @param arg 
     */
    mul(...arg): number;
    /**
     * 除
     * @param arg 
     */
    div(...arg): number;
}

Number.prototype.add = function (...arg): number {
    let r1:number, r2:number, m:number, result:number = this;
    arg.forEach(value => {
        try { r1 = result.toString().split(".")[1].length; } catch (e) { r1 = 0; };
        try { r2 = value.toString().split(".")[1].length; } catch (e) { r2 = 0; };
        m = Math.pow(10, Math.max(r1, r2));
        result = Math.round(result * m + value * m) / m;
    });
    return result;
};

Number.prototype.sub = function (...arg): number {
    let r1:number, r2:number, m:number, n:number, result:number = this;
    arg.forEach(value => {
        try { r1 = result.toString().split(".")[1].length; } catch (e) { r1 = 0; };
        try { r2 = value.toString().split(".")[1].length; } catch (e) { r2 = 0; };
        m = Math.pow(10, Math.max(r1, r2));
        n = (r1 >= r2) ? r1 : r2;
        result = Number((Math.round(result * m - value * m) / m).toFixed(n));
    });
    return result;
};

Number.prototype.mul = function (...arg): number {
    let m:number, s1:string, s2:string, result:number = this;
    arg.forEach(value => {
        m = 0, s1 = result.toString(), s2 = value.toString();
        try { m += s1.split(".")[1].length; } catch (e) { };
        try { m += s2.split(".")[1].length; } catch (e) { };
        result = Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
    });
    return result;
};

Number.prototype.div = function (...arg): number {
    let t1:number, t2:number, r1:number, r2:number, result:number = this;
    arg.forEach(value => {
        t1 = 0, t2 = 0, r1, r2;
        try { t1 = result.toString().split(".")[1].length; } catch (e) { };
        try { t2 = value.toString().split(".")[1].length; } catch (e) { };
        r1 = Number(result.toString().replace(".", ""));
        r2 = Number(value.toString().replace(".", ""));
        result = (r1 / r2) * Math.pow(10, t2 - t1);
    });
    return result;
};