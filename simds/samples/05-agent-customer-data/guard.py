# Checks a support agent's outbound email before it is sent. The data rules
# are encrypted context: only the listed evaluators can read them.
# Illustrative; the Python SDK is planned.
from verafy_asc import ip  # planned

CUSTOMER_DATA_IP = "IPcustomerdata..."
SUPPORT_WALLET = "Supp0rt..."


def check_outbound(message: dict, recipient: dict, ticket: str) -> str:
    call = dict(
        program=CUSTOMER_DATA_IP,
        request_prompt="May this message be sent to this recipient?",
        input={"type": "agent_outbound_message", "message_id": message["id"]},
        external_context={
            "entries": [
                {"kind": "other", "label": "Message", "storage": {"inline": message["body"]}},
                {"kind": "other", "label": "Recipient", "storage": {"inline": str(recipient)}},
                {"kind": "other", "label": "Ticket", "storage": {"inline": ticket}},
            ]
        },
        jury={"evaluators": 3, "quorum": 2, "assurance": "L1", "distinct_families": True},
        max_input_tokens=4000,
        max_output_tokens=500,
        refund_to=SUPPORT_WALLET,
    )
    quote = ip.quote_ruling(**call)
    req = ip.request_ruling(**call, budget=quote.total)
    ruling = ip.wait_for_ruling(req.request, timeout_ms=30_000)
    if ruling.status != "final":
        return "block"  # the program's default: escalate to a human
    # On "redact", the reasoning quotes the lines to remove.
    return ruling.outcome
