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

The integrations were many and separate: SAP to AWS, distribution management outages triggering customer notifications, SaaS connecting to internal apps. Nothing gave a single view of integration health. Incident detection was slow. Tracing end-to-end service dependencies was difficult. 

## Approach

### Technology, process, and culture

Tooling alone doesn't fix observability. I set up monitoring, alerting, and incident response practices, and worked with the development teams so they owned them afterward.

### Measure whether the service does its job

Monitoring had been about latency and HTTP codes. I moved it to end-to-end functional health: is the service doing what the user needs? Users care whether it works, not what status code it returns.

### Consolidation & Architecture

Consolidated fragmented monitoring and integration platforms into a unified, observable architecture. Guided engineering teams building AWS serverless microservices with event-driven architecture, managed via Terraform (IaC) and monitored through CloudWatch.

## Outcome

- **Reduced MTTD and MTTR** through observable platforms enabling rapid incident detection, diagnosis, and resolution
- **Unified monitoring** across the entire integration layer
- **Improved operational reliability** through consolidated architecture
- **Established observability culture** across development teams

## Technologies

AWS Lambda · EventBridge · CloudWatch · Terraform · Serverless Microservices
