# Audit a model deployment against its behavior rules.
# A jury takes 20 to 60 seconds, so this runs on a sample of logged answers, not live chat.
# verafy_asc is the planned Python SDK. Illustrative.
import os, random
from verafy_asc import asc

ASC_ID = os.environ["ASC_MODEL_BEHAVIOR_ID"]

def nightly_audit(logs, sample=200):
    batch = random.sample(logs, min(sample, len(logs)))
    rulings = asc.request_rulings(asc=ASC_ID, jury={"size": 5, "quorum": 4, "tier": "standard"}, requests=[
        {"action": {"type": "model_output", "id": row.id},
         "evidence": {"prompt": row.prompt, "answer": row.answer,
                      "deployment": {"model": row.model, "system_prompt_sha256": row.sp_hash}}}
        for row in batch
    ])

    failures = [r for r in rulings if r.outcome == "fail"]
    report = {
        "checked": len(rulings),
        "failed": len(failures),
        "by_rule": asc.count_by_rule(failures),     # e.g. {1: 3, 3: 1}
        "examples": [asc.summary(r) for r in failures[:10]],
    }
    asc.publish_report(ASC_ID, report)   # signed report on chain: what was checked, and what failed
    return report
