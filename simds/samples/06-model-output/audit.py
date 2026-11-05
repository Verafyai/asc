# Nightly audit of a sample of a health assistant's answers. Each answer is
# one request; failures are cited to the rule that was broken.
# Illustrative; the Python SDK is planned.
from verafy_asc import ip  # planned

BEHAVIOR_IP = "IPhealthrules..."
AUDIT_WALLET = "Aud1t..."


def audit(samples: list[dict]) -> list[dict]:
    failures = []
    for s in samples:
        call = dict(
            program=BEHAVIOR_IP,
            request_prompt="Does this answer follow the behavior rules?",
            input={"type": "model_output", "id": s["id"], "deployment": s["deployment"]},
            external_context={"entries": [
                {"kind": "other", "label": "User prompt", "storage": {"inline": s["prompt"]}},
                {"kind": "other", "label": "Answer", "storage": {"inline": s["answer"]}},
            ]},
            jury={"evaluators": 5, "quorum": 4, "assurance": "L1", "distinct_families": True},
            max_input_tokens=4000,
            max_output_tokens=500,
            refund_to=AUDIT_WALLET,
        )
        req = ip.request_ruling(**call, budget=ip.quote_ruling(**call).total)
        r = ip.wait_for_ruling(req.request)
        if r.outcome == "fail":
            failures.append({"id": s["id"], "summary": r.summary,
                             "rules": [src.locator for src in r.sources if src.kind == "context"],
                             "ruling": str(r.address)})
    return failures
