"""svmLLM predictor service for recorded runs (runs on the box, not on Vercel).

Reads one JSON request per stdin line: {"pre": {account: lamports}, "transfers": [{"from","to","amount"}], "leader": str, "reward": int}
Runs each transfer through the svmLLM *weights machine* (Verafyai/svmLLM, svllm.machine) executing the
sBPF "Balance transfer" program, and through the reference interpreter as a cross-check.
Writes one JSON reply per line with the predicted post-state.
"""
import json, sys, time, subprocess, os
SVLLM = os.environ.get("SVLLM_DIR", "/workspace/svllm")
sys.path.insert(0, SVLLM)
from svllm.programs import DEMOS, u64s
from svllm.isa import assemble
from svllm import machine, ref
import struct

PROG = assemble(next(d for d in DEMOS if d["id"] == "transfer")["asm"])
try:
    COMMIT = subprocess.check_output(["git", "-C", SVLLM, "rev-parse", "--short", "HEAD"], text=True).strip()
except Exception:
    COMMIT = "unknown"

def word(mem, i):
    return struct.unpack_from("<Q", mem, i * 8)[0]

for line in sys.stdin:
    req = json.loads(line)
    bal = dict(req["pre"])
    steps, t0, total_cu, agree = [], time.time(), 0, True
    for t in req["transfers"]:
        a, b = bal.get(t["from"], 0), bal.get(t["to"], 0)
        mem = u64s(a, b, t["amount"])
        w = machine.run(PROG, mem, 10000)
        r = ref.run(PROG, mem, 10000)
        same = (w["status"], w["r0"], w["cu"], w["mem"][:24]) == (r["status"], r["r0"], r["cu"], r["mem"][:24])
        agree = agree and same
        ok = w["status"] == "ok" and w["r0"] == 0
        if ok:
            bal[t["from"]], bal[t["to"]] = word(w["mem"], 0), word(w["mem"], 1)
        total_cu += w["cu"]
        steps.append({"exit": w["r0"], "status": w["status"], "cu": w["cu"], "applied": ok})
    if req.get("leader") in bal:
        bal[req["leader"]] += req.get("reward", 0)
    print(json.dumps({"balances": bal, "steps": steps, "cu": total_cu, "ms": int((time.time() - t0) * 1000),
                      "weightsMatchReference": agree, "engine": f"svmLLM weights machine (Verafyai/svmLLM @ {COMMIT})"}), flush=True)
