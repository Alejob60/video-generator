---
globs: |-
  src/infrastructure/services/*.ts
  src/interfaces/controllers/*.ts
  PROMPTS_INSTRUCCIONES.md
  src/interfaces/dto/*.ts
description: Se aplica cuando el usuario solicita secuencias de cambios y
  checklist de implementación/mejora sobre múltiples archivos. El agente debe
  ejecutar todo el flujo de principio a fin hasta que la solución esté completa
  y alineada a lo instruido.
alwaysApply: false
---

No interrumpir el trabajo ni detener la secuencia hasta que se haya implementado íntegramente el flujo y checklist solicitado por el usuario, incluidos todos los cambios de código, documentación y validaciones descritos, salvo que el usuario explícitamente lo pida.