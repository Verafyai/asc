/** Tiny expression language for inscribed step tests. No eval, no function calls. */

type Val = number | string | boolean | unknown[];

const ident = /^[A-Za-z_][A-Za-z0-9_]*/;

function tokenize(src: string): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === " " || c === "\t") { i++; continue; }
    if ("()".includes(c)) { out.push(c); i++; continue; }
    const two = src.slice(i, i + 2);
    if (two === "<=" || two === ">=" || two === "==" || two === "!=" || two === "&&" || two === "||") { out.push(two); i += 2; continue; }
    if ("<>+*".includes(c)) { out.push(c); i++; continue; }
    if (c === '"' || c === "'") {
      const q = c; let j = i + 1; let s = "";
      while (j < src.length && src[j] !== q) { s += src[j]; j++; }
      out.push(JSON.stringify(s)); i = j + 1; continue;
    }
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      out.push(src.slice(i, j)); i = j; continue;
    }
    const m = src.slice(i).match(ident);
    if (m) { out.push(m[0]); i += m[0].length; continue; }
    throw new Error(`Bad token at ${i} in ${src}`);
  }
  return out;
}

export function evalTest(expr: string, env: Record<string, unknown>): boolean {
  const tokens = tokenize(expr);
  let p = 0;
  const peek = () => tokens[p];
  const eat = (t?: string) => {
    const cur = tokens[p];
    if (t && cur !== t) throw new Error(`Expected ${t} got ${cur ?? "end"}`);
    p++;
    return cur;
  };

  function parseOr(): Val {
    let left = parseAnd();
    while (peek() === "||") { eat("||"); const right = parseAnd(); left = truthy(left) || truthy(right); }
    return left;
  }
  function parseAnd(): Val {
    let left = parseIn();
    while (peek() === "&&") { eat("&&"); const right = parseAnd(); left = truthy(left) && truthy(right); }
    return left;
  }
  function parseIn(): Val {
    const left = parseCmp();
    if (peek() === "in") {
      eat("in");
      const right = parseCmp();
      if (!Array.isArray(right)) return false;
      return right.map(String).includes(String(left));
    }
    return left;
  }
  function parseCmp(): Val {
    let left = parseAdd();
    const op = peek();
    if (op === "<=" || op === ">=" || op === "<" || op === ">" || op === "==" || op === "!=") {
      eat(op);
      const right = parseAdd();
      const ln = Number(left), rn = Number(right);
      if (op === "<=") return ln <= rn;
      if (op === ">=") return ln >= rn;
      if (op === "<") return ln < rn;
      if (op === ">") return ln > rn;
      if (op === "==") return left === right || String(left) === String(right);
      return left !== right && String(left) !== String(right);
    }
    return left;
  }
  function parseAdd(): Val {
    let left = parseMul();
    while (peek() === "+") { eat("+"); left = Number(left) + Number(parseMul()); }
    return left;
  }
  function parseMul(): Val {
    let left = parseUnary();
    while (peek() === "*") { eat("*"); left = Number(left) * Number(parseUnary()); }
    return left;
  }
  function parseUnary(): Val {
    if (peek() === "(") { eat("("); const v = parseOr(); eat(")"); return v; }
    const t = eat();
    if (t === "true") return true;
    if (t === "false") return false;
    if (/^[0-9.]/.test(t)) return Number(t);
    if (t.startsWith('"')) return JSON.parse(t) as string;
    if (!(t in env)) return false;
    return env[t] as Val;
  }
  const v = parseOr();
  if (p !== tokens.length) throw new Error(`Leftover ${tokens.slice(p).join(" ")}`);
  return truthy(v);
}

function truthy(v: Val): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0 && !Number.isNaN(v);
  if (typeof v === "string") return v.length > 0;
  return Boolean(v);
}
