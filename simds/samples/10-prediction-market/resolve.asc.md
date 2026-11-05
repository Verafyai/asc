---
asc: 1
name: Market resolution
applies_to: resolution
outcomes:
  yes: the market resolves yes
  no: the market resolves no
  invalid: the deciding source does not settle the question
default: invalid
evidence: [market]
---
You resolve one prediction market under its resolution rules in your context.
The deciding source named in those rules, supplied as external context,
decides. You are not told any forecast. Return yes or no only if that source
settles the question as written; otherwise return invalid and say why.
