---
title: "EIS Observability"
description: "Leading observability strategy and systems consolidation for Enterprise Integration Services at Puget Sound Energy."
tags: ["Observability", "Systems Consolidation", "AWS", "Terraform", "SAP"]
featured: true
order: 1
image: "/assets/pse-graph.png"
---

## Context

Enterprise Integration Services (EIS) is the integration layer connecting SAP, advanced distribution management systems, AWS backends, customer mobile platforms, and numerous SaaS and internal applications. The landscape was fragmented: disconnected monitoring tools, tribal knowledge scattered across teams, and no unified view of integration health across the application stack.

## Challenge

Dozens of disconnected integration points: SAP to AWS, distribution management outages triggering customer notifications, SaaS connecting to internal apps. No single pane of glass existed. Incident detection was slow. Tracing end-to-end service dependencies was difficult. Monitoring focused on technical metrics like latency and HTTP codes rather than whether services were actually doing their job from the user's perspective.

## Approach

### Three Pillars: Technology, Process, Culture

Effective observability requires alignment across all three. I established monitoring, alerting, and incident response practices grounded in this framework, ensuring sustainable success within development teams.

### Shift to Functional Health

Moved monitoring from isolated technical metrics to **holistic end-to-end functional health**: measuring whether services are up and doing their job from the user perspective. Users care if their service works. They do not care what HTTP code it returns.

### Consolidation & Architecture

Consolidated fragmented monitoring and integration platforms into a unified, observable architecture. Guided engineering teams building AWS serverless microservices with event-driven architecture, managed via Terraform (IaC) and monitored through CloudWatch.

### AI Exploration (Personal Initiative)

On my own time, I have explored how LLM-powered knowledge bases and AI-driven workflows could complement observability. This includes retrieving contextual information about microservices, automating documentation, and mapping service dependencies. I am interested in where operations are heading.

## Outcome

- **Reduced MTTD and MTTR** through observable platforms enabling rapid incident detection, diagnosis, and resolution
- **Unified monitoring** across the entire integration layer
- **Improved operational reliability** through consolidated architecture
- **Established observability culture** across development teams

## Technologies

AWS Lambda · EventBridge · CloudWatch · Terraform · Serverless Microservices
